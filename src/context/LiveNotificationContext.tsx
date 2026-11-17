'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CMSLiveNotification } from '@/src/types';
import cmsService from '@/src/services/cmsService';
import {
  playNotificationSound,
  isNotificationSoundMuted,
  setNotificationSoundMuted,
} from '@/src/utils/notificationSound';
import { useCMS } from './CMSContext';

interface LiveNotificationContextValue {
  notifications: CMSLiveNotification[];
  unreadCount: number;
  isLoading: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  activeToast: CMSLiveNotification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearRead: () => Promise<void>;
  triggerTestNotification: (type?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const LiveNotificationContext = createContext<LiveNotificationContextValue | null>(null);

export const LiveNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeStore } = useCMS();
  const [notifications, setNotifications] = useState<CMSLiveNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [activeToast, setActiveToast] = useState<CMSLiveNotification | null>(null);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  // Load sound preference from localStorage on mount
  useEffect(() => {
    setIsSoundEnabled(!isNotificationSoundMuted());
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      setNotificationSoundMuted(!next);
      if (next) {
        // Play a short preview chime when enabled
        playNotificationSound('DEFAULT');
      }
      return next;
    });
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  }, []);

  // Display toast and play audio sound
  const handleIncomingNotification = useCallback((notif: CMSLiveNotification) => {
    if (seenNotificationIdsRef.current.has(notif.id)) return;
    seenNotificationIdsRef.current.add(notif.id);

    // Update notifications list
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    setUnreadCount((prev) => prev + 1);

    // Play synthesized Web Audio chime
    playNotificationSound(notif.type);

    // Trigger visual floating toast
    setActiveToast(notif);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  }, []);

  // Fetch initial notifications for current store
  const refreshNotifications = useCallback(async () => {
    if (!activeStore?.id) return;
    try {
      const data = await cmsService.getLiveNotifications({ limit: 30 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

      // Record initially known IDs so we don't alert on old ones
      data.notifications.forEach((n) => seenNotificationIdsRef.current.add(n.id));
    } catch (err) {
      console.warn('Failed to load live notifications:', err);
    }
  }, [activeStore?.id]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Connect to SSE stream and setup background polling
  useEffect(() => {
    if (!activeStore?.id) return;

    const storeId = activeStore.id;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const sseUrl = `${apiBase}/api/notifications/live-stream?storeId=${storeId}`;

    let es: EventSource | null = null;
    try {
      es = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = es;

      es.addEventListener('notification', (event) => {
        try {
          const item = JSON.parse(event.data) as CMSLiveNotification;
          handleIncomingNotification(item);
        } catch (err) {
          console.error('Error parsing notification event:', err);
        }
      });

      es.onerror = () => {
        // SSE will attempt auto-reconnection; gracefully handle
      };
    } catch (err) {
      console.warn('SSE connection could not be established:', err);
    }

    // Polling fallback every 12 seconds to ensure 100% reliability
    const pollInterval = setInterval(() => {
      cmsService
        .getLiveNotifications({ limit: 30 })
        .then((data) => {
          if (!data?.notifications) return;

          // Check if any new notification arrived since last seen
          const newItems = data.notifications.filter(
            (n) => !seenNotificationIdsRef.current.has(n.id) && !n.isRead
          );

          if (newItems.length > 0) {
            newItems.forEach((n) => handleIncomingNotification(n));
          }

          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    }, 12000);

    return () => {
      if (es) {
        es.close();
      }
      clearInterval(pollInterval);
    };
  }, [activeStore?.id, handleIncomingNotification]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await cmsService.markLiveNotificationRead(id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await cmsService.markAllLiveNotificationsRead();
  };

  const clearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    await cmsService.clearReadLiveNotifications();
  };

  const triggerTestNotification = async (type: string = 'ORDER_CREATED') => {
    try {
      const res = await cmsService.triggerTestLiveNotification(type);
      if (res?.notification) {
        handleIncomingNotification(res.notification);
      }
    } catch (err) {
      console.error('Failed to trigger test notification:', err);
    }
  };

  return (
    <LiveNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isSoundEnabled,
        toggleSound,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearRead,
        triggerTestNotification,
        refreshNotifications,
      }}
    >
      {children}
    </LiveNotificationContext.Provider>
  );
};

export const useLiveNotifications = (): LiveNotificationContextValue => {
  const context = useContext(LiveNotificationContext);
  if (!context) {
    throw new Error('useLiveNotifications must be used within a LiveNotificationProvider');
  }
  return context;
};

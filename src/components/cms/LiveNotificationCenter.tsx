'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  ShoppingBag,
  UserPlus,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Play,
  Layers,
} from 'lucide-react';
import { useLiveNotifications } from '@/src/context/LiveNotificationContext';
import { CMSLiveNotification } from '@/src/types';

function formatRelativeTime(dateString: string): string {
  try {
    const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export const LiveNotificationCenter: React.FC = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isSoundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    clearRead,
    triggerTestNotification,
  } = useLiveNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ORDER' | 'CUSTOMER' | 'REFUND' | 'STOCK'>('ALL');
  const [isTesting, setIsTesting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'ALL') return true;
    if (filter === 'ORDER') return notif.type === 'ORDER_CREATED';
    if (filter === 'CUSTOMER') return notif.type === 'CUSTOMER_REGISTERED';
    if (filter === 'REFUND') return notif.type === 'REFUND_INITIATED' || notif.type === 'ORDER_CANCELLED';
    if (filter === 'STOCK') return notif.type === 'LOW_STOCK';
    return true;
  });

  const handleNotificationClick = async (item: CMSLiveNotification) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const handleTestAlert = async (type: string) => {
    setIsTesting(true);
    try {
      await triggerTestNotification(type);
    } finally {
      setIsTesting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'CUSTOMER_REGISTERED':
        return <UserPlus className="w-4 h-4 text-sky-500" />;
      case 'REFUND_INITIATED':
        return <RotateCcw className="w-4 h-4 text-amber-500" />;
      case 'ORDER_CANCELLED':
        return <RotateCcw className="w-4 h-4 text-rose-500" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-700 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs group"
        title="Live Store Notifications & Audio Alerts"
        aria-label="Notifications"
      >
        <Bell
          className={`w-4 h-4 shrink-0 transition-transform ${
            unreadCount > 0 ? 'text-indigo-600 dark:text-indigo-400 group-hover:rotate-12' : ''
          }`}
        />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Notification Center */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-[#2C2C2E] flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                Live Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  isSoundEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-transparent text-slate-400'
                }`}
                title={isSoundEnabled ? 'Notification Sound Enabled (Click to Mute)' : 'Notification Sound Muted (Click to Enable)'}
              >
                {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 text-xs transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-[#2C2C2E] overflow-x-auto no-scrollbar bg-slate-50/20 dark:bg-transparent">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'ORDER', label: 'Orders 🛍️' },
                { id: 'CUSTOMER', label: 'Customers 👤' },
                { id: 'REFUND', label: 'Refunds 💸' },
                { id: 'STOCK', label: 'Stock ⚠️' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[50vh] divide-y divide-slate-100 dark:divide-[#2C2C2E] p-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  No notifications found
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  New orders, customer signups, and refund alerts will ring here live in real-time.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                    !item.isRead
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#252528] border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs truncate ${
                          !item.isRead
                            ? 'font-extrabold text-slate-900 dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Controls & Live Sound Test */}
          <div className="p-2.5 border-t border-slate-200 dark:border-[#2C2C2E] bg-slate-50/70 dark:bg-white/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simulate:
              </span>
              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleTestAlert('ORDER_CREATED')}
                className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="Simulate incoming order placement with chime sound"
              >
                <span>Order</span>
              </button>

              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleTestAlert('CUSTOMER_REGISTERED')}
                className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/70 dark:hover:bg-sky-900 text-[10px] font-bold text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="Simulate customer registration with sound"
              >
                <span>Customer</span>
              </button>

              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleTestAlert('REFUND_INITIATED')}
                className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="Simulate refund initiation with sound"
              >
                <span>Refund</span>
              </button>
            </div>

            {notifications.some((n) => n.isRead) && (
              <button
                type="button"
                onClick={clearRead}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Clear read notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

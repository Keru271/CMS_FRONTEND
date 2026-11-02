'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SwipeToast, SwipeToastType } from '@/src/components/ui/SwipeToast';

export interface ToastItem {
  id: string;
  type: SwipeToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

export interface ToastOptions {
  type?: SwipeToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (options: ToastOptions | string, type?: SwipeToastType) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (options: ToastOptions | string, explicitType?: SwipeToastType): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const resolved: ToastOptions =
        typeof options === 'string'
          ? { message: options, type: explicitType || 'info' }
          : { ...options, type: options.type || explicitType || 'info' };

      const duration = resolved.duration ?? 4000;

      const newToast: ToastItem = {
        id,
        type: resolved.type || 'info',
        title: resolved.title,
        message: resolved.message,
        duration,
        action: resolved.action,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        if (updated.length > 5) {
          return updated.slice(updated.length - 5);
        }
        return updated;
      });

      // Safety timeout after 25s
      setTimeout(() => {
        hideToast(id);
      }, duration + 20000);

      return id;
    },
    [hideToast],
  );

  const success = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, type: 'success', message, title }),
    [showToast],
  );

  const error = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, type: 'error', message, title: title || 'Error' }),
    [showToast],
  );

  const info = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, type: 'info', message, title }),
    [showToast],
  );

  const warning = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) =>
      showToast({ ...options, type: 'warning', message, title: title || 'Notice' }),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        hideToast,
        clearToasts,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
      {/* Global Swipe Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <SwipeToast
                inline
                open={true}
                type={t.type}
                title={t.title}
                description={t.message}
                duration={t.duration || 4000}
                onClose={() => hideToast(t.id)}
                actionLabel={t.action?.label}
                onAction={t.action?.onClick}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  UserPlus,
  RotateCcw,
  AlertTriangle,
  X,
  Volume2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLiveNotifications } from '@/src/context/LiveNotificationContext';
import { CMSLiveNotification } from '@/src/types';

export const LiveNotificationToast: React.FC = () => {
  const router = useRouter();
  const { activeToast, dismissToast, markAsRead } = useLiveNotifications();

  if (!activeToast) return null;

  const handleClick = async () => {
    await markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.link) {
      router.push(activeToast.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      case 'CUSTOMER_REGISTERED':
        return <UserPlus className="w-5 h-5 text-sky-500" />;
      case 'REFUND_INITIATED':
        return <RotateCcw className="w-5 h-5 text-amber-500" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return 'border-emerald-500/40 shadow-emerald-500/10';
      case 'CUSTOMER_REGISTERED':
        return 'border-sky-500/40 shadow-sky-500/10';
      case 'REFUND_INITIATED':
        return 'border-amber-500/40 shadow-amber-500/10';
      case 'LOW_STOCK':
        return 'border-rose-500/40 shadow-rose-500/10';
      default:
        return 'border-indigo-500/40 shadow-indigo-500/10';
    }
  };

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full bg-white/95 dark:bg-[#1A1A1E]/95 backdrop-blur-md rounded-2xl border ${getBorderColor(
        activeToast.type
      )} shadow-2xl p-4 transition-all animate-in slide-in-from-top-4 fade-in duration-300`}
    >
      <div className="flex items-start gap-3">
        {/* Animated Icon Avatar */}
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
          {getIcon(activeToast.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1 cursor-pointer" onClick={handleClick}>
          <div className="flex items-center gap-1.5 justify-between">
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {activeToast.title}
            </span>
            <span className="text-[10px] text-slate-400 font-medium shrink-0">Just now</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
            {activeToast.message}
          </p>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              <span>View Details</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

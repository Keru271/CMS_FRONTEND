'use client';

import React, { useState } from 'react';
import { Rocket, AlertTriangle, ArrowRight, X, Sparkles } from 'lucide-react';
import { useCMS } from '@/src/context/CMSContext';

interface StorePendingBannerProps {
  onOpenGoLiveModal: () => void;
}

export const StorePendingBanner: React.FC<StorePendingBannerProps> = ({
  onOpenGoLiveModal,
}) => {
  const { storeStatus, activeStore } = useCMS();
  const [isDismissed, setIsDismissed] = useState(false);

  const currentStage = (activeStore?.status || storeStatus || 'PENDING').toUpperCase();
  const isPending = currentStage === 'PENDING';

  if (!isPending || isDismissed) return null;

  return (
    <div className="mb-4 sm:mb-6 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 p-3 sm:p-4 text-slate-800 dark:text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
          <Rocket className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Store Stage: Pending (Pre-Launch)
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Not Yet Live
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
            Your storefront is currently in preparation mode. Ensure your products, theme, and domain are ready before opening to shoppers.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <button
          onClick={onOpenGoLiveModal}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Go Live Checklist</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

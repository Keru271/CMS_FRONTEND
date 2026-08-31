'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PlanLockOverlayProps {
  requiredPlan: 'GROWTH' | 'ENTERPRISE' | 'API';
  featureTitle: string;
  featureDescription: string;
  perks?: string[];
  inline?: boolean;
}

export const PlanLockOverlay: React.FC<PlanLockOverlayProps> = ({
  requiredPlan,
  featureTitle,
  featureDescription,
  perks = [],
  inline = false,
}) => {
  const router = useRouter();

  const planName =
    requiredPlan === 'API'
      ? 'API Tier'
      : requiredPlan === 'ENTERPRISE'
      ? 'Scale Enterprise'
      : 'Growth Pro';
  const planPrice =
    requiredPlan === 'API'
      ? '₹1,000/mo ($1,000)'
      : requiredPlan === 'ENTERPRISE'
      ? '₹5,999/mo ($79)'
      : '₹1,999/mo ($29)';

  if (inline) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  {planName} Feature
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">{featureTitle}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/billing')}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Upgrade to {planName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl">{featureDescription}</p>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xl text-center max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] uppercase tracking-wider border border-amber-200 dark:border-amber-900/50">
          Locked • Requires {planName}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-foreground">
          Unlock {featureTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          {featureDescription}
        </p>
      </div>

      {perks.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-100 dark:border-border text-left space-y-2 max-w-md mx-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Included in {planName}:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {perks.map((p, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/billing')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Zap className="w-4 h-4" />
          <span>Upgrade to {planName} ({planPrice})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

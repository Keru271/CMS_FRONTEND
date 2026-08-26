'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SubscriptionPlanTier } from '@/src/utils/tierPermissions';

interface LockedFeatureGuardProps {
  title: string;
  description: string;
  requiredPlan: 'GROWTH' | 'ENTERPRISE';
  features: string[];
  children?: React.ReactNode;
}

export const LockedFeatureGuard: React.FC<LockedFeatureGuardProps> = ({
  title,
  description,
  requiredPlan,
  features,
  children,
}) => {
  const isEnterprise = requiredPlan === 'ENTERPRISE';
  const planName = isEnterprise ? 'Scale Enterprise' : 'Growth Pro';
  const planBadge = isEnterprise ? 'Enterprise Exclusive' : 'Growth Pro Required';
  const planBadgeColor = isEnterprise
    ? 'bg-purple-600 text-white'
    : 'bg-amber-400 text-slate-950 font-black';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 sm:p-12 shadow-xl my-6">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-slate-700 shadow-2xl flex items-center justify-center text-amber-400 animate-in zoom-in-50 duration-300">
          <Lock className="w-8 h-8" />
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold ${planBadgeColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{planBadge}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Benefits List */}
        {features.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 text-left max-w-md mx-auto space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Included in {planName}:
            </span>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/billing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Upgrade to {planName}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/billing"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all text-center"
          >
            Compare All Plans
          </Link>
        </div>
      </div>
    </div>
  );
};

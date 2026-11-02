'use client';

import React, { useState } from 'react';
import { CircleDollarSign, TrendingUp } from 'lucide-react';
import { AiPricingInsights } from '@/src/components/cms/AiPricingInsights';
import { AiSalesForecasting } from '@/src/components/cms/AiSalesForecasting';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'forecasting'>('pricing');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── TAB NAVIGATION ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'pricing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            Pricing Insights & Elasticity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forecasting')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'forecasting'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Sales & Demand Forecasting
          </button>
        </div>
      </div>

      {/* ─── TAB CONTENT ─────────────────────────────────────────────────── */}
      {activeTab === 'pricing' ? (
        <AiPricingInsights onSwitchToForecasting={() => setActiveTab('forecasting')} />
      ) : (
        <AiSalesForecasting />
      )}
    </div>
  );
}

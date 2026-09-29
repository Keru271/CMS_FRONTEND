'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ShoppingBag,
  ShoppingCart,
  Users,
  Percent,
  Clock,
  Send,
  Zap,
  Tag,
  Mail,
  ShieldAlert,
  SlidersHorizontal,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { AiAnalyticsResult, CalculatedStoreAnalytics } from '@/src/types';

const SAMPLE_PROMPTS = [
  'Why are my sales down?',
  'Which categories are declining the most?',
  'Why is cart abandonment increasing?',
  'Which products caused the revenue drop?',
  'What actions should I take to recover lost sales?',
  'How is our checkout conversion funnel performing?',
];

export const AiAnalyticsStudio: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [queryInput, setQueryInput] = useState<string>('Why are my sales down?');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [analyticsResult, setAnalyticsResult] = useState<AiAnalyticsResult | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await cmsService.queryAiAnalytics({
        question: queryInput,
        timeRange,
      });
      setAnalyticsResult(result);
    } catch (err) {
      console.error('Failed to load AI analytics:', err);
      showToast('Failed to compute analytics.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunQuery = async (customQ?: string) => {
    const q = customQ || queryInput;
    if (!q.trim()) return;

    if (customQ) setQueryInput(customQ);
    setIsQuerying(true);

    try {
      const result = await cmsService.queryAiAnalytics({
        question: q,
        timeRange,
      });
      setAnalyticsResult(result);
      showToast('✨ AI Analytics Diagnosis generated successfully!');
    } catch (err) {
      console.error('Failed to query AI analytics:', err);
      showToast('Query processing failed.', 'error');
    } finally {
      setIsQuerying(false);
    }
  };

  const m: CalculatedStoreAnalytics | undefined = analyticsResult?.calculatedMetrics;
  const sym = m?.currencySymbol || '₹';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ─── HEADER BAR ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-foreground">
                  AI Analytics Studio
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black tracking-wider uppercase border border-indigo-200/60 dark:border-indigo-800/60">
                  Deterministic Math + LLM Explainer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Backend computes exact metrics across Orders, Revenue, Categories, Traffic, Conversion, and Abandonment — AI delivers clear diagnostic explanations.
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-accent/40 p-1 rounded-2xl border border-slate-200/60 dark:border-border text-xs font-bold">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '90d' ? 'Last 90 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isLoading || isQuerying}
            onClick={() => loadAnalytics()}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-accent/40 dark:hover:bg-accent text-slate-700 dark:text-foreground transition cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isQuerying ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-md ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* ─── NATURAL LANGUAGE AI QUERY BAR ───────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-card border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Ask Merchant Analytics Copilot</span>
          </label>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
            Real-time diagnostic over {m?.currentPeriodLabel || '30 days'}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. Why are my sales down? Which category is causing the drop?"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-slate-900 dark:text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isQuerying}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isQuerying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Metrics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ask AI</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Question Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Try asking:</span>
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleRunQuery(prompt)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-semibold shrink-0 transition cursor-pointer hover:shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ─── EXECUTIVE AI DIAGNOSIS CARD ─────────────────────────── */}
      {analyticsResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  AI Diagnostic Result for:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
                  "{analyticsResult.question}"
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-foreground">
                {analyticsResult.executiveSummary}
              </h2>
            </div>

            <div className="shrink-0">
              <div
                className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 ${
                  analyticsResult.status === 'negative'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                }`}
              >
                {analyticsResult.status === 'negative' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span>{analyticsResult.headlineMetric}</span>
              </div>
            </div>
          </div>

          {/* Key Category Insight Box (User Example Representation) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4 shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Primary Decline Driver
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {analyticsResult.categoryInsight.revenueChange}% Revenue
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    The largest change was in your {analyticsResult.categoryInsight.primaryCategory} category:
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-slate-300">• Traffic:</span>
                    <span className="text-amber-400 font-mono">
                      {analyticsResult.categoryInsight.trafficChange > 0 ? '+' : ''}
                      {analyticsResult.categoryInsight.trafficChange}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-slate-300">• Conversion:</span>
                    <span className="text-rose-400 font-mono">
                      {analyticsResult.categoryInsight.conversionChange > 0 ? '+' : ''}
                      {analyticsResult.categoryInsight.conversionChange}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="text-slate-300">• Orders:</span>
                    <span className="text-rose-400 font-mono">
                      {analyticsResult.categoryInsight.ordersChange > 0 ? '+' : ''}
                      {analyticsResult.categoryInsight.ordersChange}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-medium">
                Root cause: Stockouts on top-selling variants + cart abandonment spikes during checkout.
              </div>
            </div>

            {/* Root Causes & Contributing Drivers */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Identified Root Causes</span>
              </h4>

              <div className="space-y-2.5">
                {analyticsResult.rootCauses.map((cause, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="font-medium leading-relaxed">{cause}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CORE KPI METRIC CARDS ────────────────────────────────── */}
      {m && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-foreground">
              {sym}{m.currentRevenue.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Prev: {sym}{m.previousRevenue.toLocaleString()}</span>
              <span
                className={`font-black flex items-center gap-0.5 ${
                  m.revenueChangePercent < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {m.revenueChangePercent < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
                {m.revenueChangePercent}%
              </span>
            </div>
          </div>

          {/* Orders */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-foreground">
              {m.currentOrders}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Prev: {m.previousOrders} orders</span>
              <span
                className={`font-black flex items-center gap-0.5 ${
                  m.ordersChangePercent < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {m.ordersChangePercent < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
                {m.ordersChangePercent}%
              </span>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Conversion Rate</span>
              <Percent className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-foreground">
              {m.currentConversionRate}%
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Prev: {m.previousConversionRate}%</span>
              <span
                className={`font-black flex items-center gap-0.5 ${
                  m.conversionChangePercent < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {m.conversionChangePercent < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
                {m.conversionChangePercent}%
              </span>
            </div>
          </div>

          {/* Cart Abandonment */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Cart Abandonment</span>
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-foreground">
              {m.currentAbandonmentRate}%
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Prev: {m.previousAbandonmentRate}%</span>
              <span className="font-black text-rose-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{m.abandonmentChangePercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── CATEGORY PERFORMANCE BREAKDOWN TABLE ────────────────── */}
      {m && m.categories && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Category Performance & Conversion Variance</span>
              </h3>
              <p className="text-xs text-slate-500">
                Period-over-period comparison across categories
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-border text-slate-400 text-[11px] font-black uppercase tracking-wider">
                  <th className="pb-3 font-black">Category</th>
                  <th className="pb-3 font-black">Revenue ({sym})</th>
                  <th className="pb-3 font-black">Revenue Δ%</th>
                  <th className="pb-3 font-black">Orders Δ%</th>
                  <th className="pb-3 font-black">Traffic Δ%</th>
                  <th className="pb-3 font-black">Conversion Rate</th>
                  <th className="pb-3 font-black">Conversion Δ%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border">
                {m.categories.map((c) => {
                  const isNegative = c.revenueChangePercent < 0;
                  return (
                    <tr
                      key={c.category}
                      className="hover:bg-slate-50/80 dark:hover:bg-accent/40 transition"
                    >
                      <td className="py-3.5 font-bold text-slate-900 dark:text-foreground">
                        {c.category}
                      </td>
                      <td className="py-3.5 font-black text-slate-900 dark:text-foreground">
                        {sym}{c.currentRevenue.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                            isNegative
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {c.revenueChangePercent > 0 ? '+' : ''}
                          {c.revenueChangePercent}%
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {c.ordersChangePercent > 0 ? '+' : ''}
                        {c.ordersChangePercent}%
                      </td>
                      <td className="py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {c.trafficChangePercent > 0 ? '+' : ''}
                        {c.trafficChangePercent}%
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-foreground">
                        {c.currentConversionRate}%
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`font-black ${
                            c.conversionChangePercent < 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {c.conversionChangePercent > 0 ? '+' : ''}
                          {c.conversionChangePercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TOP DECLINERS & TOP GAINERS ─────────────────────────── */}
      {m && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Declining Products */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-rose-200/80 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>Top Products Driving Revenue Decline (3 Key Movers)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {m.topDecliners.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-foreground block">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {p.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-rose-600 block">
                        -{sym}{Math.abs(p.revenueDelta).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-rose-500">
                        {p.unitsChangePercent}% units
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-rose-700 dark:text-rose-400">Diagnosis: </span>
                    {p.reason}
                  </p>

                  {p.isOutOfStock && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stockout Alert (0 in stock)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top Growth Gainers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Growing Products (Positive Momentum)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {m.topGainers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-foreground block">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {p.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 block">
                        +{sym}{p.revenueDelta.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        +{p.unitsChangePercent}% units
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Growth Catalyst: </span>
                    {p.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── PRESCRIPTIVE AI ACTION PLAN ─────────────────────────── */}
      {analyticsResult && analyticsResult.actionPlan && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Prescriptive AI Recovery & Growth Action Plan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Recommended high-impact actions prioritized by revenue recovery potential
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {analyticsResult.actionPlan.map((action, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-accent/40 dark:to-card border border-slate-200/80 dark:border-border space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        action.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {action.priority} Priority
                    </span>
                    <span className="text-[10px] font-black text-emerald-600">
                      {action.estimatedImpact}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 dark:text-foreground">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-border">
                  <a
                    href={
                      action.actionType === 'RESTOCK'
                        ? '/products'
                        : action.actionType === 'EMAIL_TRIGGER'
                        ? '/marketing'
                        : '/discounts'
                    }
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <span>Execute Action</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

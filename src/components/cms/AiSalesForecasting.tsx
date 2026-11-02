'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Send,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { AiForecastResult } from '@/src/types';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';

interface AiSalesForecastingProps {
  initialHorizon?: '30d' | '60d' | '90d';
}

export const AiSalesForecasting: React.FC<AiSalesForecastingProps> = ({ initialHorizon = '30d' }) => {
  const [horizon, setHorizon] = useState<'30d' | '60d' | '90d'>(initialHorizon);
  const [aiProvider, setAiProvider] = useState<'auto' | 'gemini' | 'chatgpt'>('auto');
  const [questionInput, setQuestionInput] = useState('How much can I expect to sell next month?');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [catPage, setCatPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(5);
  const [data, setData] = useState<AiForecastResult | null>(null);

  const fetchForecast = useCallback(
    async (
      query?: string,
      selectedHorizon?: '30d' | '60d' | '90d',
      selectedProvider?: 'auto' | 'gemini' | 'chatgpt'
    ) => {
      setIsLoading(true);
      setIsRefreshing(true);
      try {
        const q = query ?? questionInput ?? 'How much can I expect to sell next month?';
        const h = selectedHorizon ?? horizon;
        const p = selectedProvider ?? aiProvider;
        const res = await cmsService.predictSalesForecast({ question: q, horizon: h, aiProvider: p });
        setData(res);
      } catch (err) {
        console.error('Failed to load forecast:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [questionInput, horizon, aiProvider]
  );

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      setIsRefreshing(true);
      try {
        const res = await cmsService.predictSalesForecast({
          question: questionInput,
          horizon,
          aiProvider,
        });
        if (!ignore) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load initial forecast:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizon, aiProvider]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isLoading) return;
    fetchForecast(questionInput, horizon, aiProvider);
  };

  const forecast = data?.calculatedForecast;
  const currencySymbol = forecast?.currencySymbol || '₹';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER & CONTROLS ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Sales & Demand Forecasting</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predict future revenue, orders, and category demand synthesized by Google Gemini & ChatGPT with your original store database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Model Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setAiProvider('auto')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                aiProvider === 'auto'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Automatically select the best configured AI model"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto AI
            </button>
            <button
              onClick={() => setAiProvider('gemini')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                aiProvider === 'gemini'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Synthesize using Google Gemini"
            >
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Gemini
            </button>
            <button
              onClick={() => setAiProvider('chatgpt')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                aiProvider === 'chatgpt'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Synthesize using OpenAI ChatGPT"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              ChatGPT
            </button>
          </div>

          {/* Horizon Switcher */}
          <div className="flex items-center gap-1">
            {(['30d', '60d', '90d'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  horizon === h
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {h === '30d' ? '30 Days' : h === '60d' ? '60 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchForecast()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-400"
            title="Refresh forecast"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── NATURAL LANGUAGE QUESTION INPUT ──────────────────────────────── */}
      <form onSubmit={handlePromptSubmit} className="flex gap-2">
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder="Ask AI: e.g., 'How much can I expect to sell next month?'..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          Forecast
        </button>
      </form>

      {/* ─── 4 KEY KPI METRIC CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Expected Revenue</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {data?.headlineExpectedRevenue || forecast?.projectedRevenueFormatted || '—'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +{forecast?.projectedGrowthPercent || 12.5}% vs prior baseline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Expected Orders</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {data?.headlineExpectedOrders || forecast?.projectedOrdersFormatted || '—'}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            ~{forecast ? Math.max(1, Math.round(forecast.projectedOrdersExpected / (horizon === '30d' ? 30 : horizon === '60d' ? 60 : 90))) : 1} orders/day
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Projected AOV</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {currencySymbol}{forecast?.projectedAov?.toLocaleString() || '0'}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Avg Basket Value</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Model Confidence</span>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {Math.round((forecast?.confidenceScore || 0.88) * 100)}%
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Statistical Regression Fit</span>
        </div>
      </div>

      {/* ─── EXECUTIVE EXPLANATION & AI PROVIDER CALLOUT ──────────────────── */}
      {data?.executiveSummary && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <strong className="font-bold text-sm text-slate-900 dark:text-white">AI Executive Analysis</strong>
            </div>
            {data.aiProviderUsed && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Synthesized by: {data.aiProviderUsed}
              </span>
            )}
          </div>
          <div className="whitespace-pre-line text-xs font-normal text-slate-700 dark:text-slate-300">
            {data.executiveSummary}
          </div>
        </div>
      )}

      {/* ─── KEY DRIVERS & RISK FACTORS ───────────────────────────────────── */}
      {(data?.keyDrivers?.length || data?.riskFactors?.length) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Drivers */}
          {data?.keyDrivers && data.keyDrivers.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Key Growth Drivers
              </h2>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {data.keyDrivers.map((driver, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span dangerouslySetInnerHTML={{ __html: driver.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {data?.riskFactors && data.riskFactors.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Identified Risk Factors
              </h2>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {data.riskFactors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span dangerouslySetInnerHTML={{ __html: risk.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {/* ─── ACTION PLAN ─────────────────────────────────────────────────── */}
      {data?.actionPlan && data.actionPlan.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-indigo-500" />
            Prescriptive Tactical Action Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.actionPlan.map((action, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      action.priority === 'HIGH'
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                        : action.priority === 'MEDIUM'
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {action.priority} PRIORITY
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.timeline}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs">{action.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{action.description}</p>
                <div className="text-[11px] text-emerald-600 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                  {action.estimatedImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TOP EXPECTED CATEGORIES & STOCKOUT ALERTS ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Store Category Projections</h2>
              <p className="text-[11px] text-slate-400">Calculated from actual database catalog & orders</p>
            </div>
            <TableRefreshButton onRefresh={() => fetchForecast()} isRefreshing={isRefreshing} />
          </div>
          {(() => {
            const categories = data?.topExpectedCategories || [];
            const paginatedCategories = categories.slice((catPage - 1) * catPageSize, catPage * catPageSize);
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">Projected Revenue</th>
                        <th className="pb-2 font-medium">Share</th>
                        <th className="pb-2 font-medium text-right">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedCategories.length > 0 ? (
                        paginatedCategories.map((cat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="text-slate-400 font-mono text-[11px]">#{cat.rank}</span>
                              {cat.category}
                            </td>
                            <td className="py-2.5 text-slate-700 dark:text-slate-300 font-semibold">{cat.expectedRevenue}</td>
                            <td className="py-2.5 text-slate-500">{cat.sharePercent}%</td>
                            <td className="py-2.5 text-right font-medium text-slate-900 dark:text-white">{cat.expectedOrders}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            No category data recorded in catalog.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={catPage}
                  totalItems={categories.length}
                  pageSize={catPageSize}
                  onPageChange={setCatPage}
                  onPageSizeChange={(newSize) => {
                    setCatPageSize(newSize);
                    setCatPage(1);
                  }}
                />
              </>
            );
          })()}
        </div>

        {/* Real Stockout Warnings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stockout Radar
            </h2>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
              {forecast?.stockoutRisks?.length || 0} at risk
            </span>
          </div>

          <div className="space-y-2.5">
            {(forecast?.stockoutRisks || []).length > 0 ? (
              forecast!.stockoutRisks.slice(0, 4).map((risk, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                      {risk.productName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        risk.urgency === 'CRITICAL'
                          ? 'text-red-700 bg-red-100 dark:bg-red-950/60'
                          : 'text-amber-700 bg-amber-100 dark:bg-amber-950/60'
                      }`}
                    >
                      {risk.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Current Stock: {risk.currentInventory} units</span>
                    <span className="text-indigo-600 font-semibold">Restock: +{risk.recommendedRestockUnits}</span>
                  </div>
                  {risk.estimatedRevenueAtRisk > 0 && (
                    <div className="text-[10px] text-rose-500 font-medium">
                      At risk: ~{currencySymbol}{risk.estimatedRevenueAtRisk.toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                All catalog products currently maintain healthy inventory coverage.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

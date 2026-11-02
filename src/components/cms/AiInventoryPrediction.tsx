'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  Package,
  Sparkles,
  Zap,
  Bot,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { AiInventoryPredictionResult } from '@/src/types';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';

export const AiInventoryPrediction: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [aiProvider, setAiProvider] = useState<'auto' | 'gemini' | 'chatgpt'>('auto');
  const [questionInput, setQuestionInput] = useState('Which products will run out of stock and when should I reorder?');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY'>('ALL');
  const [data, setData] = useState<AiInventoryPredictionResult | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPredictions = useCallback(
    async (
      query?: string,
      filter?: 'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY',
      provider?: 'auto' | 'gemini' | 'chatgpt'
    ) => {
      setIsRefreshing(true);
      try {
        const q = query ?? questionInput;
        const currentFilter = filter ?? selectedFilter;
        const activeProvider = provider ?? aiProvider;

        const res = await cmsService.predictInventoryStockouts({
          question: q,
          category: currentFilter !== 'ALL' ? currentFilter : undefined,
          aiProvider: activeProvider,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load inventory predictions:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [questionInput, selectedFilter, aiProvider]
  );

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setIsRefreshing(true);
      try {
        const res = await cmsService.predictInventoryStockouts({
          question: questionInput,
          category: selectedFilter !== 'ALL' ? selectedFilter : undefined,
          aiProvider,
        });
        if (!ignore) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load inventory predictions:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, aiProvider]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || loading) return;
    fetchPredictions(questionInput, selectedFilter, aiProvider);
  };

  const handleFilterClick = (filter: 'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY') => {
    setSelectedFilter(filter);
    setPage(1);
  };

  const summary = data?.summary;
  const currencySymbol = summary?.currencySymbol || '₹';
  const predictions = summary?.predictions || [];
  const filteredPredictions =
    selectedFilter === 'ALL'
      ? predictions
      : predictions.filter((p) => p.alertLevel === selectedFilter);

  const paginatedPredictions = filteredPredictions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER & AI MODEL SELECTOR ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Stockout Radar & Inventory Prediction</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculates real order velocity, stockout runway, and supplier reorder deadlines synthesized by Google Gemini & ChatGPT.
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

          <button
            onClick={() => fetchPredictions(questionInput, selectedFilter, aiProvider)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Stock
          </button>
        </div>
      </div>

      {/* ─── NATURAL LANGUAGE PROMPT BAR ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <form onSubmit={handlePromptSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask AI about inventory risk, lead times, or reorder deadlines..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !questionInput.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Analyze
          </button>
        </form>

        {/* Synthesis Badge */}
        {data?.aiProviderUsed && (
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Synthesized by {data.aiProviderUsed}
            </span>
            <span>• 100% original database records</span>
          </div>
        )}
      </div>

      {/* ─── 4 STATUS SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => handleFilterClick('CRITICAL')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'CRITICAL'
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 uppercase">🔴 Critical (≤ 10 Days)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary?.criticalCount || 0}</p>
          <span className="text-[11px] text-slate-500">Urgent reorder required</span>
        </button>

        <button
          onClick={() => handleFilterClick('WARNING')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'WARNING'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase">🟡 Warning (11–25 Days)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary?.warningCount || 0}</p>
          <span className="text-[11px] text-slate-500">Prepare replenishment</span>
        </button>

        <button
          onClick={() => handleFilterClick('HEALTHY')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'HEALTHY'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">🟢 Healthy (25+ Days)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary?.healthyCount || 0}</p>
          <span className="text-[11px] text-slate-500">Adequate coverage</span>
        </button>

        <button
          onClick={() => handleFilterClick('ALL')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase">Revenue at Risk</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {currencySymbol}{summary?.totalRevenueAtRisk?.toLocaleString() || '0'}
          </p>
          <span className="text-[11px] text-slate-500">Total {summary?.totalSkusAnalyzed || 0} active SKUs tracked</span>
        </button>
      </div>

      {/* ─── EXECUTIVE EXPLANATION & ACTION PLAN ────────────────────────────── */}
      {data?.executiveSummary && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Executive Stockout Diagnosis</h2>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {data.executiveSummary}
            </div>
          </div>

          {/* Action Plan */}
          {data.actionPlan && data.actionPlan.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Prescribed Restock Action Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.actionPlan.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          action.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : action.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {action.priority} PRIORITY
                      </span>
                      {action.replenishmentUnits > 0 && (
                        <span className="font-bold text-slate-900 dark:text-white">
                          +{action.replenishmentUnits} units
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{action.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {action.description}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                      <span>Deadline: {action.targetDeadline}</span>
                      <strong className="text-slate-700 dark:text-slate-300">{action.estimatedCost}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── INVENTORY PREDICTIONS TABLE ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              SKU Stockout Runway ({filteredPredictions.length} Products Analyzed)
            </h2>
            <TableRefreshButton
              onRefresh={() => fetchPredictions(questionInput, selectedFilter, aiProvider)}
              isRefreshing={isRefreshing}
            />
          </div>
          {selectedFilter !== 'ALL' && (
            <button
              onClick={() => handleFilterClick('ALL')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Clear Filter ({selectedFilter})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-2.5 font-medium">Product SKU</th>
                <th className="pb-2.5 font-medium">Current Stock</th>
                <th className="pb-2.5 font-medium">Velocity / Day</th>
                <th className="pb-2.5 font-medium">Est. Stockout</th>
                <th className="pb-2.5 font-medium">Recommended Reorder</th>
                <th className="pb-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPredictions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedPredictions.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{prod.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {prod.sku} • {prod.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {prod.currentStock} units
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {prod.adjustedDailySales} / day
                      </span>
                      {prod.velocityChangePercent > 0 && (
                        <span className="text-[10px] text-emerald-600 block">
                          +{prod.velocityChangePercent}% lift
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold ${
                          prod.alertLevel === 'CRITICAL'
                            ? 'text-red-600 dark:text-red-400'
                            : prod.alertLevel === 'WARNING'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        ~{prod.daysRemaining} Days
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {prod.estimatedStockoutDateFormatted}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {prod.recommendedReorderUnits > 0 ? (
                        <>
                          <strong className="font-semibold text-slate-900 dark:text-white">
                            +{prod.recommendedReorderUnits} units
                          </strong>
                          <span className="text-[11px] text-slate-400 block">
                            before {prod.recommendedReorderDate}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">Stock adequate</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.alertLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : prod.alertLevel === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {prod.alertLevel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={page}
          totalItems={filteredPredictions.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};

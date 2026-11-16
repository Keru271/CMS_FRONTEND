'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  BarChart2,
  DollarSign,
  AlertCircle,
  Truck,
  Layers,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { AiInventoryPredictionResult, ProductInventoryPredictionData } from '@/src/types';
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
  const [showFullDiagnosis, setShowFullDiagnosis] = useState(false);
  const [hoveredSku, setHoveredSku] = useState<ProductInventoryPredictionData | null>(null);

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

  // ─── CATALOG HEALTH RATIOS ──────────────────────────────────────────────
  const totalAnalyzed = Math.max(1, summary?.totalSkusAnalyzed || predictions.length || 1);
  const criticalCount = summary?.criticalCount ?? predictions.filter((p) => p.alertLevel === 'CRITICAL').length;
  const warningCount = summary?.warningCount ?? predictions.filter((p) => p.alertLevel === 'WARNING').length;
  const healthyCount = summary?.healthyCount ?? predictions.filter((p) => p.alertLevel === 'HEALTHY').length;

  const criticalPct = Math.round((criticalCount / totalAnalyzed) * 100);
  const warningPct = Math.round((warningCount / totalAnalyzed) * 100);
  const healthyPct = Math.max(0, 100 - criticalPct - warningPct);

  // Top products at risk for the visual depletion radar
  const atRiskSkus = useMemo(() => {
    return [...predictions]
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 6);
  }, [predictions]);

  // ─── CONDENSED EXECUTIVE DIAGNOSIS ──────────────────────────────────────
  const executiveHighlights = useMemo(() => {
    if (!data?.executiveSummary) return null;
    const summaryText = data.executiveSummary;
    const sentences = summaryText
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 15)
      .slice(0, 2);

    return {
      snippet: sentences.join(' ') || summaryText.slice(0, 220) + '...',
      fullText: summaryText,
    };
  }, [data]);

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
            Depletion runways, reorder lead-time alerts, and supply chain vulnerability matrix.
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
            <span>• Real store database inventory tracking</span>
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
            <span className="text-[11px] font-bold text-red-600 uppercase">Critical (≤ 10 Days)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{criticalCount}</p>
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
            <span className="text-[11px] font-bold text-amber-600 uppercase">Warning (11–25 Days)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{warningCount}</p>
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
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Healthy (25+ Days)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{healthyCount}</p>
          <span className="text-[11px] text-slate-500">Adequate runway</span>
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
          <span className="text-[11px] text-slate-500">Total {totalAnalyzed} active SKUs tracked</span>
        </button>
      </div>

      {/* ─── VISUAL CHART: STOCKOUT RUNWAY RADAR & CATALOG HEALTH GAUGES ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stockout Depletion Timeline Radar (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Stock Depletion Runway Timeline
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Top SKUs prioritized by urgency against supplier lead-time deadline
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> ≤ 10 Days
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 11-25 Days
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 25+ Days
              </span>
            </div>
          </div>

          {/* Depletion Radar Visual Bars */}
          <div className="space-y-3.5 pt-1">
            {atRiskSkus.length > 0 ? (
              atRiskSkus.map((sku) => {
                const maxRunway = 45; // Max 45 days scale
                const days = Math.max(0, sku.daysRemaining);
                const barWidth = Math.min(100, Math.max(4, Math.round((days / maxRunway) * 100)));
                const leadTimeDays = sku.supplierLeadTimeDays || 7;
                const leadTimePos = Math.min(100, Math.round((leadTimeDays / maxRunway) * 100));
                const isUnderLeadTime = days <= leadTimeDays;

                const color =
                  sku.alertLevel === 'CRITICAL'
                    ? 'from-red-600 to-rose-400'
                    : sku.alertLevel === 'WARNING'
                    ? 'from-amber-500 to-yellow-400'
                    : 'from-emerald-500 to-teal-400';

                return (
                  <div
                    key={sku.id}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {sku.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({sku.sku})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUnderLeadTime && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Reorder Overdue!
                          </span>
                        )}
                        <span
                          className={`font-extrabold ${
                            sku.alertLevel === 'CRITICAL'
                              ? 'text-red-600 dark:text-red-400'
                              : sku.alertLevel === 'WARNING'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          ~{days} Days Left
                        </span>
                      </div>
                    </div>

                    {/* Timeline Meter with Lead Time Marker */}
                    <div className="relative h-2.5 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Stock: {sku.currentStock} units ({sku.adjustedDailySales}/day velocity)</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        Lead time: {leadTimeDays}d • Order: +{sku.recommendedReorderUnits} units
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active SKU stockout alerts recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right: Catalog Health Distribution & Financial Gauges (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Catalog Health Distribution
              </h2>
            </div>

            {/* Segmented Progress Ratio Bar */}
            <div className="space-y-2 pt-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Inventory Status Split</span>
                <span className="text-slate-900 dark:text-white font-mono">{totalAnalyzed} SKUs</span>
              </div>

              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                <div
                  className="h-full bg-red-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${criticalPct}%` }}
                  title={`Critical: ${criticalCount} (${criticalPct}%)`}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${warningPct}%` }}
                  title={`Warning: ${warningCount} (${warningPct}%)`}
                />
                <div
                  className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${healthyPct}%` }}
                  title={`Healthy: ${healthyCount} (${healthyPct}%)`}
                />
              </div>

              {/* Legend with percentages */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40">
                  <span className="text-[10px] text-red-600 font-bold block">CRITICAL</span>
                  <strong className="text-sm font-black text-red-700 dark:text-red-300">{criticalPct}%</strong>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] text-amber-600 font-bold block">WARNING</span>
                  <strong className="text-sm font-black text-amber-700 dark:text-amber-300">{warningPct}%</strong>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] text-emerald-600 font-bold block">HEALTHY</span>
                  <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">{healthyPct}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Exposure Cards */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Restock Capital Required</span>
              <strong className="font-bold text-slate-900 dark:text-white">
                {currencySymbol}{summary?.totalEstimatedRestockCost?.toLocaleString() || '0'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Avg Catalog Runway</span>
              <strong className="font-bold text-indigo-600 dark:text-indigo-400">
                ~{summary?.averageDaysOfSupply || 28} Days
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SIMPLIFIED EXECUTIVE DIAGNOSIS BRIEF ─────────────────────────── */}
      {executiveHighlights && (
        <div className="bg-gradient-to-r from-red-50/40 via-amber-50/30 to-slate-50 dark:from-red-950/20 dark:via-slate-800/60 dark:to-slate-800/40 rounded-2xl border border-red-100 dark:border-slate-700 p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
              <strong className="font-bold text-sm text-slate-900 dark:text-white">AI Stockout Diagnosis Brief</strong>
              {data?.aiProviderUsed && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {data.aiProviderUsed}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFullDiagnosis(!showFullDiagnosis)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {showFullDiagnosis ? 'Condense Diagnosis' : 'Read Full AI Analysis'}
              {showFullDiagnosis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {executiveHighlights.snippet}
          </p>

          {showFullDiagnosis && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700 whitespace-pre-line text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-200">
              {executiveHighlights.fullText}
            </div>
          )}
        </div>
      )}

      {/* ─── PRESCRIBED ACTION PLAN ───────────────────────────────────────── */}
      {data?.actionPlan && data.actionPlan.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              Prescribed Restock Action Plan
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Prioritized Supplier Purchase Orders</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.actionPlan.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        +{action.replenishmentUnits} units
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{action.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-normal">
                    {action.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 dark:border-slate-800 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Due: {action.targetDeadline}
                  </span>
                  <strong className="text-slate-700 dark:text-slate-300">{action.estimatedCost}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── INVENTORY PREDICTIONS TABLE WITH VISUAL RUNWAY METERS ───────── */}
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
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
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
                <th className="pb-2.5 font-medium">Daily Velocity</th>
                <th className="pb-2.5 font-medium">Stock Runway</th>
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
                paginatedPredictions.map((prod) => {
                  const days = Math.max(0, prod.daysRemaining);
                  const runwayPct = Math.min(100, Math.round((days / 30) * 100));

                  return (
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
                        <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                          <span>{prod.adjustedDailySales} / day</span>
                          {prod.velocityTrend === 'ACCELERATING' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          ) : prod.velocityTrend === 'DECELERATING' ? (
                            <TrendingDown className="w-3 h-3 text-rose-500" />
                          ) : (
                            <Minus className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        {prod.velocityChangePercent > 0 && (
                          <span className="text-[10px] text-emerald-600 block">
                            +{prod.velocityChangePercent}% lift
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              prod.alertLevel === 'CRITICAL'
                                ? 'text-red-600 dark:text-red-400'
                                : prod.alertLevel === 'WARNING'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            ~{prod.daysRemaining}d
                          </span>
                          {/* Mini Visual Runway Bar */}
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                prod.alertLevel === 'CRITICAL'
                                  ? 'bg-red-500'
                                  : prod.alertLevel === 'WARNING'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${runwayPct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
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
                  );
                })
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

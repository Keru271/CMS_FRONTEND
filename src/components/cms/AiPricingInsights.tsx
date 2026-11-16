'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CircleDollarSign,
  RefreshCw,
  Sliders,
  Send,
  Sparkles,
  Zap,
  Bot,
  Package,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BarChart2,
  CheckCircle2,
  DollarSign,
  Target,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  AiPricingInsightsResult,
  PricingScenarioData,
} from '@/src/types';

interface AiPricingInsightsProps {
  onSwitchToForecasting?: () => void;
}

export const AiPricingInsights: React.FC<AiPricingInsightsProps> = ({ onSwitchToForecasting }) => {
  const [loading, setLoading] = useState(true);
  const [aiProvider, setAiProvider] = useState<'auto' | 'gemini' | 'chatgpt'>('auto');
  const [questionInput, setQuestionInput] = useState('How is my pricing performing and what scenarios maximize my gross profit?');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [data, setData] = useState<AiPricingInsightsResult | null>(null);
  const [simulatedPrice, setSimulatedPrice] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<PricingScenarioData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showFullDiagnosis, setShowFullDiagnosis] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ price: number; profit: number; volume: number; label?: string } | null>(null);

  const fetchInsights = useCallback(
    async (
      query?: string,
      prodId?: string,
      provider?: 'auto' | 'gemini' | 'chatgpt'
    ) => {
      setLoading(true);
      try {
        const q = query ?? questionInput;
        const targetProd = prodId !== undefined ? prodId : selectedProductId;
        const activeProvider = provider ?? aiProvider;

        const res = await cmsService.queryPricingInsights({
          question: q,
          productId: targetProd || undefined,
          aiProvider: activeProvider,
        });
        setData(res);

        // Sync active product and slider price
        const primary = res?.summary?.productAnalyses?.find(
          (p) => !targetProd || p.productId === targetProd
        ) || res?.summary?.productAnalyses?.[0];

        if (primary) {
          const sweetSpot = primary.scenarios?.find((s) => s.id === 'scenario_b')?.price || primary.currentPrice;
          setSimulatedPrice(sweetSpot);
          setSimulationResult(null);
        }
      } catch (err) {
        console.error('Failed to load pricing insights:', err);
      } finally {
        setLoading(false);
      }
    },
    [questionInput, selectedProductId, aiProvider]
  );

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await cmsService.queryPricingInsights({
          question: questionInput,
          productId: selectedProductId || undefined,
          aiProvider,
        });
        if (!ignore) {
          setData(res);
          const primary = res?.summary?.productAnalyses?.find(
            (p) => !selectedProductId || p.productId === selectedProductId
          ) || res?.summary?.productAnalyses?.[0];

          if (primary) {
            const sweetSpot = primary.scenarios?.find((s) => s.id === 'scenario_b')?.price || primary.currentPrice;
            setSimulatedPrice(sweetSpot);
            setSimulationResult(null);
          }
        }
      } catch (err) {
        console.error('Failed to load initial pricing insights:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, aiProvider]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || loading) return;
    fetchInsights(questionInput, selectedProductId, aiProvider);
  };

  const handleSimulate = async (price: number) => {
    setSimulatedPrice(price);
    const prod =
      data?.summary?.productAnalyses?.find((p) => p.productId === selectedProductId) ||
      data?.summary?.productAnalyses?.[0];
    if (!prod) return;

    setIsSimulating(true);
    try {
      const res = await cmsService.simulatePricingScenario({
        productId: prod.productId,
        simulatedPrice: price,
        costPrice: prod.costPrice,
        baseUnits: prod.currentMonthlyUnits,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Error simulating price:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const productAnalyses = data?.summary?.productAnalyses || [];
  const primaryProd =
    productAnalyses.find((p) => p.productId === selectedProductId) || productAnalyses[0];
  const currencySymbol = data?.summary?.currencySymbol || '₹';

  // Dynamic slider bounds based on real product price
  const basePrice = primaryProd?.currentPrice || 1000;
  const sliderMin = Math.max(10, Math.round((basePrice * 0.6) / 10) * 10);
  const sliderMax = Math.round((basePrice * 1.5) / 10) * 10;
  const sliderStep = basePrice > 1000 ? 50 : basePrice > 100 ? 5 : 1;

  // ─── ELASTICITY & PROFIT CURVE CHART DATA ──────────────────────────────
  const curveData = useMemo(() => {
    if (!primaryProd) return [];
    const cost = primaryProd.costPrice || Math.round(basePrice * 0.5);
    const baseUnits = primaryProd.currentMonthlyUnits || 50;
    const elasticity = -1.2; // Typical retail price elasticity of demand
    const points: Array<{ price: number; profit: number; volume: number; label?: string; isSweetSpot?: boolean; isCurrent?: boolean }> = [];

    const steps = 14;
    const priceDelta = (sliderMax - sliderMin) / steps;

    for (let i = 0; i <= steps; i++) {
      const p = Math.round(sliderMin + i * priceDelta);
      const priceChangePct = (p - basePrice) / basePrice;
      const volChangePct = priceChangePct * elasticity;
      const volume = Math.max(1, Math.round(baseUnits * (1 + volChangePct)));
      const unitMargin = p - cost;
      const profit = Math.max(0, volume * unitMargin);

      points.push({ price: p, profit, volume });
    }

    // Find sweet spot (max profit)
    let maxProfit = -1;
    let maxIdx = 0;
    points.forEach((pt, idx) => {
      if (pt.profit > maxProfit) {
        maxProfit = pt.profit;
        maxIdx = idx;
      }
    });

    if (points[maxIdx]) {
      points[maxIdx].isSweetSpot = true;
      points[maxIdx].label = 'Profit Sweet Spot';
    }

    return points;
  }, [primaryProd, basePrice, sliderMin, sliderMax]);

  // SVG Chart Geometry
  const chartWidth = 840;
  const chartHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const chartScale = useMemo(() => {
    if (curveData.length === 0) return { maxProfit: 1, minProfit: 0, coords: [] };
    const maxProfit = Math.max(...curveData.map((d) => d.profit), 100) * 1.1;
    const minProfit = 0;

    const coords = curveData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, curveData.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((d.profit - minProfit) / Math.max(1, maxProfit - minProfit)) * innerHeight;
      return { x, y, data: d };
    });

    return { maxProfit, minProfit, coords };
  }, [curveData, innerWidth, innerHeight, padding.left, padding.top]);

  const profitLinePath = useMemo(() => {
    if (chartScale.coords.length === 0) return '';
    return chartScale.coords.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`, '');
  }, [chartScale.coords]);

  const profitAreaPath = useMemo(() => {
    if (chartScale.coords.length === 0) return '';
    const top = profitLinePath;
    const bottomY = padding.top + innerHeight;
    const lastX = chartScale.coords[chartScale.coords.length - 1].x.toFixed(1);
    const firstX = chartScale.coords[0].x.toFixed(1);
    return `${top} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [chartScale.coords, profitLinePath, innerHeight, padding.top]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER & AI MODEL SELECTOR ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <CircleDollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Pricing & Profit Elasticity Insights</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real catalog profit elasticity curves, sweet-spot margin optimization, and bundle uplift models.
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
            onClick={() => fetchInsights(questionInput, selectedProductId, aiProvider)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── NATURAL LANGUAGE PROMPT & PRODUCT SELECTOR BAR ─────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {productAnalyses.length > 1 && (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Featured SKU: {productAnalyses[0]?.productName}</option>
              {productAnalyses.slice(1).map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} ({currencySymbol}{p.currentPrice.toLocaleString()})
                </option>
              ))}
            </select>
          )}

          <form onSubmit={handlePromptSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask AI about optimal margins, sweet spot prices, or discount rules..."
              className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !questionInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Simulate
            </button>
          </form>
        </div>

        {/* Synthesis Badge */}
        {data?.aiProviderUsed && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Synthesized by {data.aiProviderUsed}
            </span>
            <span>• 100% original database records</span>
          </div>
        )}
      </div>

      {/* ─── CONDENSED PRICE CHANGE DIAGNOSTIC CARD ───────────────────────── */}
      {primaryProd && (
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Elasticity Diagnostic: {primaryProd.productName}
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-amber-200 font-bold">
                {primaryProd.currentMarginPercent}% Margin
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Current Price: {currencySymbol}{primaryProd.currentPrice.toLocaleString()} • Unit Cost: {currencySymbol}{primaryProd.costPrice.toLocaleString()}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Baseline monthly run rate is ~{primaryProd.currentMonthlyUnits} units generating {currencySymbol}{primaryProd.currentMonthlyProfit.toLocaleString()} gross profit.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-center min-w-[70px]">
              <span className="text-[9px] text-slate-400 block font-semibold">UNIT PROFIT</span>
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                {currencySymbol}{(primaryProd.currentPrice - primaryProd.costPrice).toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-center min-w-[70px]">
              <span className="text-[9px] text-slate-400 block font-semibold">RUN-RATE</span>
              <span className="font-bold text-slate-900 dark:text-white text-xs">{primaryProd.currentMonthlyUnits} units</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── VISUAL CHART: PROFIT ELASTICITY & SWEET SPOT CURVE ───────────── */}
      {primaryProd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Price Elasticity & Gross Profit Optimization Curve
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Visualizes trade-off between retail price, demand volume drop-off, and peak gross profit
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Sweet Spot Peak
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-600" />
                Projected Profit ({currencySymbol})
              </span>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = padding.top + innerHeight * (1 - ratio);
                const val = chartScale.minProfit + ratio * (chartScale.maxProfit - chartScale.minProfit);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {currencySymbol}{Math.round(val >= 1000 ? val / 1000 : val)}{val >= 1000 ? 'k' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Profit Area */}
              {profitAreaPath && <path d={profitAreaPath} fill="url(#profitGrad)" />}

              {/* Profit Line */}
              {profitLinePath && (
                <path
                  d={profitLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Points */}
              {chartScale.coords.map((c, i) => {
                const isSelected = hoveredPoint?.price === c.data.price;
                const isSweet = c.data.isSweetSpot;
                const isSimulated = Math.abs(simulatedPrice - c.data.price) < (sliderMax - sliderMin) / 16;

                return (
                  <g key={i} className="cursor-pointer" onClick={() => handleSimulate(c.data.price)}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="12"
                      fill="transparent"
                      onMouseEnter={() => setHoveredPoint(c.data)}
                    />
                    {isSweet && (
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="9"
                        fill="#10b981"
                        fillOpacity="0.2"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isSweet ? '6' : isSelected || isSimulated ? '5' : '3'}
                      className={`${
                        isSweet
                          ? 'fill-emerald-500 stroke-white dark:stroke-slate-900'
                          : isSimulated
                          ? 'fill-indigo-600 stroke-white dark:stroke-slate-900'
                          : 'fill-emerald-600 stroke-white dark:stroke-slate-900'
                      }`}
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* X-axis labels */}
              {chartScale.coords
                .filter((_, i) => i % 3 === 0 || i === chartScale.coords.length - 1)
                .map((c, i) => (
                  <text
                    key={i}
                    x={c.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-medium"
                  >
                    {currencySymbol}{c.data.price.toLocaleString()}
                  </text>
                ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 px-3.5 py-2 rounded-xl shadow-lg border border-slate-700 dark:border-slate-200 text-xs pointer-events-none transition-all flex items-center gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 dark:text-emerald-600 block">
                    {hoveredPoint.label || `Price: ${currencySymbol}${hoveredPoint.price.toLocaleString()}`}
                  </span>
                  <span className="font-extrabold text-sm">
                    {currencySymbol}{hoveredPoint.profit.toLocaleString()} Profit
                  </span>
                </div>
                <div className="pl-3 border-l border-slate-700 dark:border-slate-300 text-[11px]">
                  <span>Volume: <strong className="font-bold">{hoveredPoint.volume} units</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3 SCENARIO COMPARISON CARDS ─────────────────────────────────── */}
      {primaryProd && primaryProd.scenarios && primaryProd.scenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryProd.scenarios.map((sc, idx) => {
            const isRecommended = idx === 1;
            return (
              <div
                key={sc.id || idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isRecommended
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isRecommended ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sc.name}
                    </span>
                    {sc.profitDeltaVsBaseline !== undefined && sc.profitDeltaVsBaseline > 0 && (
                      <span className="text-xs font-bold text-emerald-600">
                        +{currencySymbol}{sc.profitDeltaVsBaseline.toLocaleString()} lift
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {currencySymbol}{sc.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Unit Margin: {currencySymbol}{sc.unitMarginAmount?.toLocaleString()} ({sc.unitMarginPercent}%)
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Expected Monthly Volume:</span>
                      <strong className="text-slate-900 dark:text-white">{sc.projectedMonthlyVolume} units</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Gross Profit:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {currencySymbol}{sc.projectedGrossProfit.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSimulate(sc.price)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isRecommended
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Simulate {currencySymbol}{sc.price.toLocaleString()}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── LIVE PRICE POINT SIMULATOR ───────────────────────────────────── */}
      {primaryProd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Interactive Selling Price Simulator for {primaryProd.productName}
            </h2>
            {isSimulating && (
              <span className="text-xs text-indigo-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Computing Elasticity...
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Test Retail Price:</span>
              <span className="font-bold text-base text-indigo-600 dark:text-indigo-400">
                {currencySymbol}{simulatedPrice.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={simulatedPrice || primaryProd.currentPrice}
              onChange={(e) => handleSimulate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{currencySymbol}{sliderMin.toLocaleString()} (Volume Push)</span>
              <span>{currencySymbol}{primaryProd.currentPrice.toLocaleString()} (Current Anchor)</span>
              <span>{currencySymbol}{sliderMax.toLocaleString()} (Premium Margin)</span>
            </div>
          </div>

          {simulationResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Unit Margin</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {currencySymbol}{simulationResult.unitMarginAmount.toLocaleString()} ({simulationResult.unitMarginPercent}%)
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Projected Monthly Units</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {simulationResult.projectedMonthlyVolume} units
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Projected Gross Profit</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {currencySymbol}{simulationResult.projectedGrossProfit.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Profit Lift vs Baseline</span>
                <p
                  className={`font-bold text-sm ${
                    simulationResult.profitDeltaVsBaseline >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  {simulationResult.profitDeltaVsBaseline >= 0 ? '+' : ''}
                  {currencySymbol}{simulationResult.profitDeltaVsBaseline.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {onSwitchToForecasting && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs mt-3">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">Storewide Sales & Demand Forecasting</strong>
                  <span className="text-slate-500">Analyze 30/60/90-day projected revenue and trajectory with this pricing</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onSwitchToForecasting}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors shadow-xs"
              >
                View Sales Forecast
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── DYNAMIC CROSS-SELL BUNDLES ──────────────────────────────────── */}
      {data?.summary?.bundleRecommendations && data.summary.bundleRecommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Catalog Bundle & Basket Size Recommendations
              </h2>
              <p className="text-xs text-slate-500">
                Derived by pairing real products from your store catalog to lift average order value (AOV).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.summary.bundleRecommendations.map((bundle) => (
              <div
                key={bundle.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{bundle.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Save {bundle.savingsPercent}%
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {bundle.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 line-through text-[11px]">
                      {currencySymbol}{bundle.combinedRegularPrice.toLocaleString()}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-base">
                      {currencySymbol}{bundle.bundlePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Est. Monthly Profit Lift</span>
                    <strong className="text-emerald-600 font-bold">
                      +{currencySymbol}{bundle.projectedAdditionalGrossProfit.toLocaleString()}/mo
                    </strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Checkout Discount Code:</span>
                  <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {bundle.suggestedDiscountCode}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ACTION PLAN & KEY INSIGHTS ──────────────────────────────────── */}
      {data?.actionPlan && data.actionPlan.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Prioritized Tactical Pricing Action Plan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.actionPlan.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
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
                  <span className="text-[10px] font-bold text-slate-500">{action.actionType}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">{action.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {action.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Estimated Impact:</span>
                  <strong className="text-emerald-600 font-bold">{action.estimatedImpact}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

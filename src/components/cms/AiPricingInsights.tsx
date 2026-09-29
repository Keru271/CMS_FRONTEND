'use client';

import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  RefreshCw,
  Sliders,
  Send,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  AiPricingInsightsResult,
  PricingScenarioData,
  ProductPricingAnalysisData,
} from '@/src/types';

export const AiPricingInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AiPricingInsightsResult | null>(null);
  const [simulatedPrice, setSimulatedPrice] = useState<number>(1899);
  const [simulationResult, setSimulationResult] = useState<PricingScenarioData | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await cmsService.queryPricingInsights({
        question: 'How is my pricing performing and what scenarios maximize my gross profit?',
      });
      setData(res);
      if (res?.scenariosComparison?.[1]) {
        setSimulatedPrice(1899);
      }
    } catch (err) {
      console.error('Failed to load pricing insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSimulate = async (price: number) => {
    setSimulatedPrice(price);
    const prod = data?.summary?.productAnalyses[0];
    if (!prod) return;
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
    }
  };

  const primaryProd = data?.summary?.productAnalyses[0];
  const currencySymbol = data?.summary?.currencySymbol || '₹';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <CircleDollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Pricing & Elasticity Insights</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Evaluates conversion elasticity following price changes and simulates profit-maximizing scenarios.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Models
        </button>
      </div>

      {/* ─── PRICE CHANGE DIAGNOSTIC CARD ─────────────────────────────────── */}
      {primaryProd && (
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Elasticity Diagnostic: {primaryProd.productName}
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              Price raised from {currencySymbol}{primaryProd.priceChangeHistory?.previousPrice} → {currencySymbol}{primaryProd.currentPrice}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Resulted in sales volume falling <strong>{Math.abs(primaryProd.priceChangeHistory?.salesVolumeChangePercent || 18)}%</strong> and conversion dropping <strong>{Math.abs(primaryProd.priceChangeHistory?.conversionChangePercent || 12)}%</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[10px] text-slate-400 block">Current Margin</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{primaryProd.currentMarginPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3 SCENARIO COMPARISON CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(primaryProd?.scenarios || []).map((sc, idx) => {
          const isRecommended = idx === 1;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isRecommended
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    isRecommended ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sc.name}
                  </span>
                  {sc.profitDeltaVsBaseline !== undefined && sc.profitDeltaVsBaseline > 0 && (
                    <span className="text-xs font-bold text-emerald-600">
                      +{currencySymbol}{sc.profitDeltaVsBaseline.toLocaleString()} lift
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{currencySymbol}{sc.price}</span>
                  <span className="text-xs text-slate-500 block">Unit Margin: {sc.unitMarginPercent}%</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Expected Monthly Volume:</span>
                    <strong className="text-slate-900 dark:text-white">{sc.projectedMonthlyVolume} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Gross Profit:</span>
                    <strong className="text-slate-900 dark:text-white">{currencySymbol}{sc.projectedGrossProfit.toLocaleString()}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Assumption: {sc.assumptions?.rationale || 'Standard price elasticity curve'}
                </p>
              </div>

              <button
                onClick={() => handleSimulate(sc.price)}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isRecommended
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                Simulate {currencySymbol}{sc.price}
              </button>
            </div>
          );
        })}
      </div>

      {/* ─── LIVE PRICE POINT SIMULATOR ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Interactive Custom Price Simulator
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Test Selling Price:</span>
            <span className="font-bold text-base text-indigo-600 dark:text-indigo-400">
              {currencySymbol}{simulatedPrice}
            </span>
          </div>

          <input
            type="range"
            min={1499}
            max={2499}
            step={50}
            value={simulatedPrice}
            onChange={(e) => handleSimulate(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>₹1,499 (Volume Push)</span>
            <span>₹1,999 (Current)</span>
            <span>₹2,499 (Premium)</span>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Unit Margin</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{simulationResult.unitMarginPercent}%</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Projected Units</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{simulationResult.projectedMonthlyVolume} / mo</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Projected Gross Profit</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {currencySymbol}{simulationResult.projectedGrossProfit.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Profit Lift vs Baseline</span>
              <p className={`font-bold text-sm ${
                simulationResult.profitDeltaVsBaseline && simulationResult.profitDeltaVsBaseline >= 0
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }`}>
                {simulationResult.profitDeltaVsBaseline && simulationResult.profitDeltaVsBaseline >= 0 ? '+' : ''}
                {currencySymbol}{simulationResult.profitDeltaVsBaseline?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

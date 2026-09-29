'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  Package,
  Plus,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  AiInventoryPredictionResult,
  InventoryPredictionSummaryData,
  ProductInventoryPredictionData,
} from '@/src/types';

export const AiInventoryPrediction: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [questionInput, setQuestionInput] = useState('Which products will run out of stock and when should I reorder?');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY'>('ALL');
  const [data, setData] = useState<AiInventoryPredictionResult | null>(null);

  const fetchPredictions = async (query?: string) => {
    setLoading(true);
    try {
      const q = query || questionInput;
      const res = await cmsService.predictInventoryStockouts({
        question: q,
        category: selectedFilter !== 'ALL' ? selectedFilter : undefined,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load inventory predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [selectedFilter]);

  const summary = data?.summary;
  const predictions = summary?.predictions || [];
  const filteredPredictions = selectedFilter === 'ALL'
    ? predictions
    : predictions.filter((p) => p.alertLevel === selectedFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Stockout Radar & Inventory Prediction</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculates daily sales velocity, estimated stockout horizons, and recommended supplier reorder deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPredictions()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Stock
          </button>
        </div>
      </div>

      {/* ─── 4 STATUS SUMMARY CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedFilter('CRITICAL')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'CRITICAL'
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-red-600 uppercase">🔴 Critical (≤ 10 Days)</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary?.criticalCount || 0}</p>
          <span className="text-[11px] text-slate-500">Urgent reorder required</span>
        </button>

        <button
          onClick={() => setSelectedFilter('WARNING')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'WARNING'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 uppercase">🟡 Warning (11–25 Days)</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary?.warningCount || 0}</p>
          <span className="text-[11px] text-slate-500">Prepare replenishment</span>
        </button>

        <button
          onClick={() => setSelectedFilter('HEALTHY')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'HEALTHY'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 uppercase">🟢 Healthy (25+ Days)</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary?.healthyCount || 0}</p>
          <span className="text-[11px] text-slate-500">Adequate coverage</span>
        </button>

        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-indigo-600 uppercase">Revenue at Risk</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {summary?.currencySymbol || '₹'}{summary?.totalRevenueAtRisk?.toLocaleString() || '0'}
          </p>
          <span className="text-[11px] text-slate-500">Total {summary?.totalSkusAnalyzed || 0} SKUs tracked</span>
        </button>
      </div>

      {/* ─── EXECUTIVE EXPLANATION ─────────────────────────────────────────── */}
      {data?.executiveSummary && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="font-semibold text-slate-900 dark:text-white block mb-1">AI Recommendation:</strong>
          {data.executiveSummary}
        </div>
      )}

      {/* ─── INVENTORY PREDICTIONS TABLE ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            SKU Stockout Runway ({filteredPredictions.length} Products)
          </h2>
          {selectedFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedFilter('ALL')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-2.5 font-medium">Product SKU</th>
                <th className="pb-2.5 font-medium">Current Stock</th>
                <th className="pb-2.5 font-medium">Velocity</th>
                <th className="pb-2.5 font-medium">Est. Stockout</th>
                <th className="pb-2.5 font-medium">Recommended Reorder</th>
                <th className="pb-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPredictions.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/50">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{prod.name}</span>
                    <span className="text-[11px] text-slate-400">{prod.category || 'General'}</span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{prod.currentStock} units</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{prod.adjustedDailySales} / day</td>
                  <td className="py-3">
                    <span className={`font-bold ${
                      prod.alertLevel === 'CRITICAL' ? 'text-red-600' : prod.alertLevel === 'WARNING' ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      ~{prod.daysRemaining} Days
                    </span>
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold">+{prod.recommendedReorderUnits} units</strong> before {prod.recommendedReorderDate}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.alertLevel === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : prod.alertLevel === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {prod.alertLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

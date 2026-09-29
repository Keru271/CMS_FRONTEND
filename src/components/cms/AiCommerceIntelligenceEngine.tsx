'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  ShieldAlert,
  Users,
  Target,
  CircleDollarSign,
  Play,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { cmsService } from '@/src/services/cmsService';
import {
  CommerceIntelligenceResponseData,
  CommerceIntelligenceExecuteResult,
} from '@/src/types';

interface AiCommerceIntelligenceEngineProps {
  storeId?: string;
}

export const AiCommerceIntelligenceEngine: React.FC<AiCommerceIntelligenceEngineProps> = ({ storeId }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState('surge_demand_stockout');
  const [data, setData] = useState<CommerceIntelligenceResponseData | null>(null);
  const [executeResult, setExecuteResult] = useState<CommerceIntelligenceExecuteResult | null>(null);

  const loadData = async (scenarioId: string = selectedScenarioId) => {
    try {
      if (!data) setLoading(true);
      else setRefreshing(true);
      const res = await cmsService.getCommerceIntelligence(scenarioId, storeId);
      setData(res);
    } catch (err) {
      console.error('Failed to load commerce intelligence:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedScenarioId);
  }, [selectedScenarioId, storeId]);

  const handleExecuteStrategy = async () => {
    try {
      setExecuting(true);
      const res = await cmsService.executeCommerceIntelligenceStrategy(selectedScenarioId, storeId);
      setExecuteResult(res);
    } catch (err) {
      console.error('Failed to execute orchestrated strategy:', err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-medium">Loading Commerce Intelligence Hub...</p>
      </div>
    );
  }

  const scenario = data?.activeScenario;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── SIMPLE CLEAN HEADER ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Commerce Intelligence Hub</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unifies Sales Forecasting, Stockout Radar, Customer Segments, Campaigns, and Pricing into a connected workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={handleExecuteStrategy}
            disabled={executing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {executing ? 'Executing...' : 'Execute Strategy'}
          </button>
        </div>
      </div>

      {/* ─── EXECUTION ALERT ──────────────────────────────────────────────── */}
      {executeResult && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">{executeResult.message}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {executeResult.executedActions.map((a, i) => (
                <span key={i} className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px] text-slate-700 dark:text-slate-300">
                  <strong>{a.engine}:</strong> {a.result}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── SCENARIO SELECTOR ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data?.availableScenarios.map((sc) => {
          const isSelected = selectedScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>{isSelected ? 'Active Strategy' : 'Scenario'}</span>
                <span className="text-emerald-600 font-bold">{sc.impact}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{sc.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{sc.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* ─── 5-STEP PIPELINE CHAIN ────────────────────────────────────────── */}
      {scenario && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{scenario.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{scenario.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {scenario.expectedRevenueImpact}
              </span>
              <span className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {scenario.expectedMarginPreservation}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {scenario.steps.map((step) => (
              <div
                key={step.stepIndex}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">0{step.stepIndex}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{step.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.observation}</p>
                </div>

                <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 text-slate-700 dark:text-slate-300 sm:max-w-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Decision:</span>
                  <span className="font-medium text-[11px]">{step.actionableDecision}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── QUICK ENGINE SHORTCUTS ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Sales Forecast', path: '/forecasting', icon: TrendingUp },
          { label: 'Stockout Radar', path: '/inventory-prediction', icon: ShieldAlert },
          { label: 'Customer Segments', path: '/customer-segmentation', icon: Users },
          { label: 'Campaign Optimizer', path: '/campaign-optimization', icon: Target },
          { label: 'Pricing Insights', path: '/pricing-insights', icon: CircleDollarSign },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.path}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

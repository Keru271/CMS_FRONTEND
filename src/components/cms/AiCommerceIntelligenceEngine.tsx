'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ArrowUpRight,
  Sparkles,
  Bot,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import { cmsService } from '@/src/services/cmsService';
import {
  CommerceIntelligenceResponseData,
  CommerceIntelligenceExecuteResult,
} from '@/src/types';

type AiProviderOption = 'auto' | 'gemini' | 'chatgpt';

interface AiCommerceIntelligenceEngineProps {
  storeId?: string;
}

export const AiCommerceIntelligenceEngine: React.FC<AiCommerceIntelligenceEngineProps> = ({ storeId }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState('surge_demand_stockout');
  const [aiProvider, setAiProvider] = useState<AiProviderOption>('auto');
  const [data, setData] = useState<CommerceIntelligenceResponseData | null>(null);
  const [executeResult, setExecuteResult] = useState<CommerceIntelligenceExecuteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial load effect
  useEffect(() => {
    let ignore = false;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsService.getCommerceIntelligence('surge_demand_stockout', storeId, 'auto');
        if (!ignore) {
          setData(res);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error('Failed to load commerce intelligence:', err);
          setError(err instanceof Error ? err.message : 'Failed to load Commerce Intelligence Hub');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [storeId]);

  // Callback to fetch or refresh data with chosen scenario and model
  const executeLoad = useCallback(
    async (scenarioId?: string, provider?: AiProviderOption) => {
      const targetScenario = scenarioId ?? selectedScenarioId;
      const targetProvider = provider ?? aiProvider;
      setRefreshing(true);
      setError(null);
      try {
        const res = await cmsService.getCommerceIntelligence(targetScenario, storeId, targetProvider);
        setData(res);
      } catch (err: unknown) {
        console.error('Failed to reload commerce intelligence:', err);
        setError(err instanceof Error ? err.message : 'Error synchronizing Commerce Hub');
      } finally {
        setRefreshing(false);
      }
    },
    [selectedScenarioId, storeId, aiProvider]
  );

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    executeLoad(scenarioId, aiProvider);
  };

  const handleSelectProvider = (provider: AiProviderOption) => {
    setAiProvider(provider);
    executeLoad(selectedScenarioId, provider);
  };

  const handleExecuteStrategy = async () => {
    try {
      setExecuting(true);
      setError(null);
      const res = await cmsService.executeCommerceIntelligenceStrategy(selectedScenarioId, storeId, aiProvider);
      setExecuteResult(res);
    } catch (err: unknown) {
      console.error('Failed to execute orchestrated strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute orchestrated strategy');
    } finally {
      setExecuting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          Orchestrating 5-Pillar Commerce Intelligence Engine...
        </p>
      </div>
    );
  }

  const scenario = data?.activeScenario;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Commerce Intelligence Hub</h1>
            {data?.aiProviderUsed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Powered by {data.aiProviderUsed}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Cross-orchestrates Sales Forecasting, Stockout Radar, Customer Segments, Campaigns, and Pricing into a unified real-time workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Model Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {[
              { id: 'auto', label: 'Auto AI', icon: Sparkles },
              { id: 'gemini', label: 'Google Gemini', icon: Zap },
              { id: 'chatgpt', label: 'ChatGPT', icon: Bot },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = aiProvider === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectProvider(m.id as AiProviderOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      m.id === 'gemini'
                        ? 'text-amber-500'
                        : m.id === 'chatgpt'
                        ? 'text-emerald-500'
                        : 'text-indigo-500'
                    }`}
                  />
                  {m.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => executeLoad()}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Hub
          </button>
          <button
            onClick={handleExecuteStrategy}
            disabled={executing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {executing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            {executing ? 'Executing...' : 'Execute Strategy'}
          </button>
        </div>
      </div>

      {/* ─── ERROR ALERT ──────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* ─── EXECUTION ALERT ──────────────────────────────────────────────── */}
      {executeResult && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">{executeResult.message}</p>
              {executeResult.aiProviderUsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {executeResult.aiProviderUsed}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {executeResult.executedActions.map((a, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 text-[11px] space-y-0.5"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">{a.engine}</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[10px]">{a.action}</p>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium block pt-0.5">{a.result}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── AI ORCHESTRATION HEADLINE & EXECUTIVE CALLOUT ─────────────────── */}
      {data?.headlineOrchestration && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-emerald-50/80 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-800/50 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <Cpu className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
              Unified 5-Engine Strategic Orchestration
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            {data.headlineOrchestration}
          </p>
          {data.executiveSummary && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-indigo-200/60 dark:border-indigo-800/40 pt-2">
              {data.executiveSummary}
            </p>
          )}
        </div>
      )}

      {/* ─── SCENARIO SELECTOR ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Strategic Orchestration Scenarios
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data?.availableScenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs ring-1 ring-indigo-400 dark:ring-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>{isSelected ? 'Active Strategy' : 'Scenario'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sc.impact}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{sc.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{sc.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 5-STEP PIPELINE CHAIN ────────────────────────────────────────── */}
      {scenario && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                End-to-End Orchestrated Pipeline
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{scenario.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{scenario.description}</p>
            </div>
            <div className="flex items-center gap-2.5 text-xs shrink-0 pt-2 sm:pt-0">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {scenario.expectedRevenueImpact}
              </span>
              <span className="text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                {scenario.expectedMarginPreservation}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {scenario.steps.map((step) => (
              <div
                key={step.stepIndex}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-400 text-[11px]">0{step.stepIndex}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{step.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{step.observation}</p>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block pt-0.5">
                    Metric: {step.keyMetric}
                  </span>
                </div>

                <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 text-slate-700 dark:text-slate-300 sm:max-w-xs shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Automated Decision:</span>
                  <span className="font-medium text-[11px] leading-snug">{step.actionableDecision}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── QUICK ENGINE SHORTCUTS ───────────────────────────────────────── */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Individual AI Pillar Engines
        </span>
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
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
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
    </div>
  );
};

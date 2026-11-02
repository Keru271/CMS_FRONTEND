'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Send,
  RefreshCw,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Bell,
  Tag,
  Package,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Bot,
  TrendingUp,
  BarChart2,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { AiCampaignOptimizationResult } from '@/src/types';

type CampaignTab = 'whatsapp' | 'email' | 'push' | 'coupon' | 'bundle' | 'social';
type AiProviderOption = 'auto' | 'gemini' | 'chatgpt';

interface StudioTabItem {
  key: CampaignTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDIO_TABS: StudioTabItem[] = [
  { key: 'whatsapp', label: 'WhatsApp Direct', icon: MessageSquare },
  { key: 'email', label: 'Email Newsletter', icon: Mail },
  { key: 'push', label: 'Push Notification', icon: Bell },
  { key: 'coupon', label: 'Promo Coupon', icon: Tag },
  { key: 'bundle', label: 'Product Bundle', icon: Package },
  { key: 'social', label: 'Social Creative', icon: Share2 },
];

const PRESET_PROMPTS = [
  'Create a high-converting campaign for Footwear & Accessories targeting repeat customers with a special bundle offer.',
  'Re-engage inactive cart abandoners with a 48-hour flash incentive on our top selling products.',
  'Launch a VIP exclusive Diwali weekend sale with bundle pricing and high-urgency WhatsApp messaging.',
];

export const AiCampaignOptimization: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [promptInput, setPromptInput] = useState(
    'Create a high-converting campaign for Footwear & Accessories targeting repeat customers with a special bundle offer.'
  );
  const [aiProvider, setAiProvider] = useState<AiProviderOption>('auto');
  const [data, setData] = useState<AiCampaignOptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<CampaignTab>('whatsapp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsService.queryCampaignOptimization({
          prompt: 'Create a high-converting campaign for Footwear & Accessories targeting repeat customers with a special bundle offer.',
          aiProvider: 'auto',
        });
        if (!ignore) {
          setData(res);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error('Failed to load campaign optimization:', err);
          setError(err instanceof Error ? err.message : 'Failed to generate campaign optimization');
        }
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
  }, []);

  const executeOptimization = useCallback(
    async (queryText?: string, provider?: AiProviderOption) => {
      const q = (queryText ?? promptInput).trim();
      const p = provider ?? aiProvider;
      setLoading(true);
      setError(null);
      try {
        const res = await cmsService.queryCampaignOptimization({
          prompt: q,
          aiProvider: p,
        });
        setData(res);
      } catch (err: unknown) {
        console.error('Failed to query campaign optimization:', err);
        setError(err instanceof Error ? err.message : 'Failed to optimize campaign');
      } finally {
        setLoading(false);
      }
    },
    [promptInput, aiProvider]
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeploy = async (channel: string) => {
    const camp = data?.generatedCampaign;
    if (!camp || deploying) return;
    setDeploying(true);
    try {
      await cmsService.createTargetedCampaign({
        title: `${camp.title || 'VIP Campaign'} (${channel})`,
        targetSegment: camp.targetSegment || 'VIP Champions',
        channel: channel === 'WhatsApp' ? 'WHATSAPP' : channel === 'SMS' ? 'SMS' : 'EMAIL',
        subject: camp.email?.subjectLine || 'Exclusive VIP Update',
        body: channel === 'WhatsApp' ? (camp.whatsapp?.messageText || '') : (camp.email?.bodyMarkdown || ''),
        discountCode: camp.coupon?.code || 'VIP15',
        discountValue: camp.coupon?.discountValue || 15,
      });
      setDeploySuccess(`Successfully scheduled ${channel} campaign with promo code ${camp.coupon?.code || 'VIP15'}!`);
      setTimeout(() => setDeploySuccess(null), 4000);
    } catch (err: unknown) {
      console.error('Error deploying campaign:', err);
      setError(err instanceof Error ? err.message : 'Error scheduling campaign');
    } finally {
      setDeploying(false);
    }
  };

  const benchmarks = data?.summary?.channelBenchmarks || [];
  const campaign = data?.generatedCampaign;
  const currencySymbol = data?.summary?.currencySymbol || '₹';
  const comparisonMatrix = data?.channelComparisonMatrix || [];
  const actionPlan = data?.actionPlan || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Campaign Optimization</h1>
            {data?.aiProviderUsed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Powered by {data.aiProviderUsed}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Cross-analyzes historical transactional data and synthesizes high-converting Email, WhatsApp, Push, Coupon, and Bundle assets.
          </p>
        </div>

        <button
          onClick={() => executeOptimization(promptInput, aiProvider)}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Benchmarks
        </button>
      </div>

      {/* ─── AI PROVIDER SELECTOR & PROMPT QUERY BAR ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Select AI Intelligence Engine:
          </span>

          {/* AI Model Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
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
                  onClick={() => {
                    setAiProvider(m.id as AiProviderOption);
                    executeOptimization(promptInput, m.id as AiProviderOption);
                  }}
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
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeOptimization(promptInput, aiProvider);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask AI: e.g. 'Create a high-converting campaign for Footwear & Accessories targeting repeat customers'..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Optimize with AI
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-slate-400 font-medium">Quick Prompts:</span>
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPromptInput(p);
                executeOptimization(p, aiProvider);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors text-left truncate max-w-xs cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ERROR ALERT ──────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* ─── SUCCESS ALERT ────────────────────────────────────────────────── */}
      {deploySuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {deploySuccess}
        </div>
      )}

      {/* ─── AI OBSERVATION CALLOUT ───────────────────────────────────────── */}
      {data?.headlineObservation && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-xs">
          <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Key AI Strategic Observation:
          </span>
          &ldquo;{data.headlineObservation}&rdquo;
          {data?.executiveSummary && (
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed border-t border-amber-200/50 dark:border-amber-800/40 pt-2">
              {data.executiveSummary}
            </p>
          )}
        </div>
      )}

      {/* ─── HISTORICAL CHANNEL BENCHMARKS ────────────────────────────────── */}
      {benchmarks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
              Channel Performance Benchmarks (Historical Store Data)
            </span>
            <span className="text-[11px] text-slate-400">Calculated from genuine order history</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {benchmarks.map((bm) => {
              const isTop = bm.channel === 'WHATSAPP';
              return (
                <div
                  key={bm.channel}
                  className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                    isTop
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 block truncate">{bm.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-lg font-bold ${
                        isTop ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {bm.conversionRate}% conv
                    </span>
                    {bm.openRate > 0 && <span className="text-[10px] text-slate-400">{bm.openRate}% open</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>ROAS: <strong className="text-slate-700 dark:text-slate-300">{bm.roiMultiple}</strong></span>
                    {bm.optimalDayTime && <span className="text-[10px] text-slate-400">{bm.optimalDayTime}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── CHANNEL COMPARISON MATRIX ────────────────────────────────────── */}
      {comparisonMatrix.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              Channel Comparison Matrix & Efficiency Rationale
            </span>
            <span className="text-[11px] text-slate-400">Multi-Channel Attribution</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Marketing Channel</th>
                  <th className="py-2.5 px-3">Open Rate</th>
                  <th className="py-2.5 px-3">Conversion Rate</th>
                  <th className="py-2.5 px-3">Expected ROI</th>
                  <th className="py-2.5 px-3">Best Recommended For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparisonMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{item.channel}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{item.openRate}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">{item.conversionRate}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.roi}</td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{item.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MULTI-CHANNEL ASSET STUDIO ───────────────────────────────────── */}
      {campaign && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Generated Asset Studio • {campaign.targetSegment || 'VIP Champions'}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {campaign.title || 'VIP Targeted Campaign'}
              </h2>
            </div>

            {/* Studio Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
              {STUDIO_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Previews */}
          <div className="text-xs">
            {activeTab === 'whatsapp' && (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                    <span>{campaign.whatsapp?.emojiHeader || '🚀 VIP Exclusive Broadcast'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(campaign.whatsapp?.messageText || '', 'wa')}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'wa' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line text-xs leading-relaxed">
                    {campaign.whatsapp?.messageText || 'Special VIP Offer available!'}
                  </p>
                  {campaign.whatsapp?.quickReplyButtons && campaign.whatsapp.quickReplyButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {campaign.whatsapp.quickReplyButtons.map((btn, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]"
                        >
                          {btn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeploy('WhatsApp')}
                  disabled={deploying}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Send WhatsApp Broadcast <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Subject: {campaign.email?.subjectLine || 'Exclusive VIP Access'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(campaign.email?.bodyMarkdown || '', 'em')}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'em' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'em' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  {campaign.email?.preheaderText && (
                    <p className="text-slate-500 italic text-[11px]">Preheader: {campaign.email.preheaderText}</p>
                  )}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-line text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto font-mono text-[11px]">
                    {campaign.email?.bodyMarkdown || 'Exclusive VIP drop details.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeploy('Email')}
                  disabled={deploying}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Schedule Email Campaign <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'push' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{campaign.push?.title || '🔥 VIP Drop'}</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      {campaign.push?.urgencyTag || 'VIP'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{campaign.push?.body || ''}</p>
                  {campaign.push?.deepLink && (
                    <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 block pt-1">
                      Deep link: {campaign.push.deepLink}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeploy('Push')}
                  disabled={deploying}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Schedule Push Notification <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'coupon' && (
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    PROMO CODE: {campaign.coupon?.code || 'VIP15'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {campaign.coupon?.discountValue || 15}% OFF
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {campaign.coupon?.marginImpactExplanation || ''}
                </p>
                <div className="text-[11px] text-slate-500 flex gap-4 pt-1">
                  <span>
                    Min Order: <strong>{currencySymbol}{(campaign.coupon?.minOrderAmount || 0).toLocaleString()}</strong>
                  </span>
                  <span>
                    Expiry: <strong>{campaign.coupon?.expiryHours || 48} Hours</strong>
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'bundle' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {campaign.bundle?.bundleName || 'Curated VIP Bundle'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Bundle Price: {currencySymbol}{(campaign.bundle?.bundleOfferPrice || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{campaign.bundle?.crossSellRationale || ''}</p>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                  <span>
                    Primary: <strong>{campaign.bundle?.primaryProduct || ''}</strong>
                  </span>
                  <span>
                    Paired: <strong>{campaign.bundle?.pairedProduct || ''}</strong>
                  </span>
                  <span>
                    Margin: <strong>{campaign.bundle?.merchantMarginPercent || 0}%</strong>
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Instagram / Social Creative</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs">{campaign.social?.postCaption || ''}</p>
                {campaign.social?.hashtags && campaign.social.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {campaign.social.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── STRATEGIC AI ACTION PLAN ─────────────────────────────────────── */}
      {actionPlan.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-emerald-500" />
              Strategic Execution Roadmap
            </span>
            <span className="text-[11px] text-slate-400">Step-by-step dispatch order</span>
          </div>

          <div className="space-y-2">
            {actionPlan.map((action, idx) => {
              const isHigh = action.priority === 'HIGH';
              const isMed = action.priority === 'MEDIUM';
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isHigh
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : isMed
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {action.priority}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{action.title}</span>
                      <span className="text-[11px] text-slate-400">({action.channel})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{action.description}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                      {action.estimatedImpact}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

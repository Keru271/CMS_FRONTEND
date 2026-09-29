'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  AiCampaignOptimizationResult,
  GeneratedMultiChannelCampaign,
} from '@/src/types';

export const AiCampaignOptimization: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [promptInput, setPromptInput] = useState('Create a high-converting campaign for Footwear & Accessories targeting repeat customers with a special bundle offer.');
  const [data, setData] = useState<AiCampaignOptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'push' | 'coupon' | 'bundle' | 'social'>('whatsapp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const fetchCampaign = async (query?: string) => {
    setLoading(true);
    try {
      const q = query || promptInput;
      const res = await cmsService.queryCampaignOptimization({ prompt: q });
      setData(res);
    } catch (err) {
      console.error('Failed to load campaign optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeploy = async (channel: string) => {
    const camp = data?.generatedCampaign;
    if (!camp) return;
    try {
      await cmsService.createTargetedCampaign({
        title: `${camp.title} (${channel})`,
        targetSegment: camp.targetSegment,
        channel: channel === 'WhatsApp' ? 'WHATSAPP' : channel === 'SMS' ? 'SMS' : 'EMAIL',
        subject: camp.email.subjectLine,
        body: channel === 'WhatsApp' ? camp.whatsapp.messageText : camp.email.bodyMarkdown,
        discountCode: camp.coupon.code,
        discountValue: camp.coupon.discountValue,
      });
      setDeploySuccess(`Successfully scheduled ${channel} campaign with promo code ${camp.coupon.code}!`);
      setTimeout(() => setDeploySuccess(null), 4000);
    } catch (err) {
      console.error('Error deploying campaign:', err);
    }
  };

  const benchmarks = data?.summary?.channelBenchmarks || [];
  const campaign = data?.generatedCampaign;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Campaign Optimization</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzes historical multi-channel performance and generates coordinated Email, WhatsApp, Push, Coupon, and Bundle assets.
          </p>
        </div>

        <button
          onClick={() => fetchCampaign()}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Benchmarks
        </button>
      </div>

      {/* ─── PROMPT QUERY BAR ─────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchCampaign(promptInput);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask AI: e.g., 'Create a high-converting campaign for Footwear & Accessories targeting repeat customers'..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          Optimize
        </button>
      </form>

      {/* ─── SUCCESS ALERT ────────────────────────────────────────────────── */}
      {deploySuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {deploySuccess}
        </div>
      )}

      {/* ─── AI OBSERVATION CALLOUT ───────────────────────────────────────── */}
      {data?.headlineObservation && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
          <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">Key AI Observation:</span>
          "{data.headlineObservation}"
        </div>
      )}

      {/* ─── CHANNEL BENCHMARKS MATRIX ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {benchmarks.map((bm) => {
          const isTop = bm.channel === 'WHATSAPP';
          return (
            <div
              key={bm.channel}
              className={`p-4 rounded-xl border text-left transition-all space-y-1 ${
                isTop
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-500 block truncate">{bm.label}</span>
              <div className="flex items-baseline justify-between">
                <span className={`text-lg font-bold ${isTop ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                  {bm.conversionRate}% conv
                </span>
                {bm.openRate > 0 && <span className="text-[10px] text-slate-400">{bm.openRate}% open</span>}
              </div>
              <span className="text-[11px] text-slate-500 block">ROAS: <strong>{bm.roiMultiple}</strong></span>
            </div>
          );
        })}
      </div>

      {/* ─── MULTI-CHANNEL ASSET STUDIO ───────────────────────────────────── */}
      {campaign && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Generated Asset Studio • {campaign.targetSegment}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{campaign.title}</h2>
            </div>

            {/* Studio Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
              {[
                { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'push', label: 'Push', icon: Bell },
                { key: 'coupon', label: 'Coupon', icon: Tag },
                { key: 'bundle', label: 'Bundle', icon: Package },
                { key: 'social', label: 'Social', icon: Share2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                    <span>{campaign.whatsapp.emojiHeader}</span>
                    <button
                      onClick={() => handleCopy(campaign.whatsapp.messageText, 'wa')}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'wa' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line text-xs leading-relaxed">
                    {campaign.whatsapp.messageText}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {campaign.whatsapp.quickReplyButtons.map((btn, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                        {btn}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeploy('WhatsApp')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  Send WhatsApp Broadcast <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">Subject: {campaign.email.subjectLine}</span>
                    <button
                      onClick={() => handleCopy(campaign.email.bodyMarkdown, 'em')}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'em' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'em' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-slate-500 italic text-[11px]">Preheader: {campaign.email.preheaderText}</p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-line text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto font-mono text-[11px]">
                    {campaign.email.bodyMarkdown}
                  </div>
                </div>
                <button
                  onClick={() => handleDeploy('Email')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  Schedule Email Campaign <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'push' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{campaign.push.title}</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{campaign.push.urgencyTag}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{campaign.push.body}</p>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 block pt-1">Deep link: {campaign.push.deepLink}</span>
                </div>
                <button
                  onClick={() => handleDeploy('Push')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  Schedule Push Notification <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'coupon' && (
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 dark:text-amber-200">PROMO CODE: {campaign.coupon.code}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">{campaign.coupon.discountValue}% OFF</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{campaign.coupon.marginImpactExplanation}</p>
                <div className="text-[11px] text-slate-500 flex gap-4 pt-1">
                  <span>Min Order: <strong>₹{campaign.coupon.minOrderAmount.toLocaleString()}</strong></span>
                  <span>Expiry: <strong>{campaign.coupon.expiryHours} Hours</strong></span>
                </div>
              </div>
            )}

            {activeTab === 'bundle' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">{campaign.bundle.bundleName}</span>
                  <span className="text-xs font-bold text-emerald-600">Bundle Price: ₹{campaign.bundle.bundleOfferPrice.toLocaleString()}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{campaign.bundle.crossSellRationale}</p>
                <div className="text-[11px] text-slate-500 flex gap-4 pt-1">
                  <span>Pairing: <strong>{campaign.bundle.primaryProduct} + {campaign.bundle.pairedProduct}</strong></span>
                  <span>Margin: <strong>{campaign.bundle.merchantMarginPercent}%</strong></span>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Instagram Caption</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs">{campaign.social.postCaption}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {campaign.social.hashtags.map((h, i) => (
                    <span key={i} className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{h}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

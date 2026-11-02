'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Send,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Bot,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  AiCustomerSegmentationResult,
} from '@/src/types';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';

export const AiCustomerSegmentation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [aiProvider, setAiProvider] = useState<'auto' | 'gemini' | 'chatgpt'>('auto');
  const [promptInput, setPromptInput] = useState("Create a targeted campaign for our highest-spending customers to lift repeat order frequency.");
  const [data, setData] = useState<AiCustomerSegmentationResult | null>(null);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('ALL');
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSegmentation = useCallback(
    async (query?: string, provider?: 'auto' | 'gemini' | 'chatgpt') => {
      setIsRefreshing(true);
      try {
        const q = query ?? promptInput;
        const p = provider ?? aiProvider;
        const res = await cmsService.queryCustomerSegmentation({
          prompt: q,
          aiProvider: p,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load customer segmentation:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [promptInput, aiProvider]
  );

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await cmsService.queryCustomerSegmentation({
          prompt: promptInput,
          aiProvider,
        });
        if (!ignore) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load customer segmentation:', err);
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
  }, [aiProvider]);

  const handleLaunchCampaign = async () => {
    const camp = data?.targetedCampaign;
    if (!camp) return;
    try {
      await cmsService.createTargetedCampaign({
        title: camp.title,
        targetSegment: camp.targetSegment,
        channel: camp.channel,
        subject: camp.subjectLine,
        body: camp.messageContent,
        discountCode: camp.discountCode,
        discountValue: 15,
      });
      setDeploySuccess(`Successfully launched targeted campaign to ${camp.matchedCustomerCount} verified customers!`);
      setTimeout(() => setDeploySuccess(null), 4000);
    } catch (err) {
      console.error('Error launching campaign:', err);
    }
  };

  const summary = data?.summary;
  const currencySymbol = summary?.currencySymbol || '₹';
  const segments = summary?.segments || [];
  const customers = summary?.customers || [];
  const filteredCustomers =
    selectedSegmentFilter === 'ALL'
      ? customers
      : customers.filter((c) => c.segment === selectedSegmentFilter);

  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER & CONTROLS ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Customer Segmentation</h1>
            {data?.aiProviderUsed && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 text-[11px]">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {data.aiProviderUsed}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Categorizes customers into RFM cohorts from original database records and synthesizes targeted campaigns via Gemini & ChatGPT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Model Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
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
              type="button"
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
              type="button"
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
            type="button"
            onClick={() => fetchSegmentation(promptInput, aiProvider)}
            disabled={loading || isRefreshing}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Recalculate RFM
          </button>
        </div>
      </div>

      {/* ─── PROMPT QUERY BAR ─────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!promptInput.trim() || loading) return;
          fetchSegmentation(promptInput, aiProvider);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask AI: e.g., 'Target our highest-spending VIP customers' or 'Re-engage customers inactive for 90 days'..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || isRefreshing}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          Segment & Draft
        </button>
      </form>

      {/* ─── SUCCESS ALERT ────────────────────────────────────────────────── */}
      {deploySuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {deploySuccess}
        </div>
      )}

      {/* ─── RFM COHORT SUMMARY CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {segments.map((seg) => {
          const isSelected = selectedSegmentFilter === seg.segment;
          return (
            <button
              type="button"
              key={seg.segment}
              onClick={() => {
                setSelectedSegmentFilter(isSelected ? 'ALL' : seg.segment);
                setPage(1);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-xs ring-1 ring-purple-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-500 block truncate">{seg.title}</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{seg.customerCount}</p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>{seg.percentageOfBase}% base</span>
                <span>{currencySymbol}{seg.totalSegmentRevenue.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── AI EXECUTIVE SUMMARY & HEADLINE ──────────────────────────────── */}
      {data?.executiveSummary && (
        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Executive Audience Breakdown
            </span>
            {data.headlineSummary && (
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {data.headlineSummary}
              </span>
            )}
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {data.executiveSummary}
          </p>
        </div>
      )}

      {/* ─── AI GENERATED TARGETED CAMPAIGN DRAFT ─────────────────────────── */}
      {data?.targetedCampaign && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                Target Audience: {data.targetedCampaign.matchedCustomerCount} Verified Customers
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {data.targetedCampaign.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleLaunchCampaign}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              Launch Campaign <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Subject Line</span>
                <p className="font-bold text-slate-900 dark:text-white">{data.targetedCampaign.subjectLine}</p>
                {data.targetedCampaign.previewText && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">{data.targetedCampaign.previewText}</p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line max-h-40 overflow-y-auto">
                {data.targetedCampaign.messageContent}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-1">
                <span className="text-purple-700 dark:text-purple-300 font-bold">Segment Criteria Explanation</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {data.targetedCampaign.criteriaExplanation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Promo Code</span>
                  <strong className="font-mono text-purple-600 font-bold">{data.targetedCampaign.discountCode}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Discount Value</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{data.targetedCampaign.discountValue}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Expected Conv.</span>
                  <strong className="text-emerald-600 font-bold">{data.targetedCampaign.projectedConversionRate}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Projected Lift</span>
                  <strong className="text-indigo-600 font-bold">{data.targetedCampaign.projectedRevenueLift}</strong>
                </div>
              </div>

              {data.targetedCampaign.recommendedProducts && data.targetedCampaign.recommendedProducts.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px]">
                  <span className="text-slate-400 text-[10px] font-bold block mb-1">Catalog Product Recommendations</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.targetedCampaign.recommendedProducts.map((prod, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium">
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── AI STRATEGIC INSIGHTS & ACTION PLAN ──────────────────────────── */}
      {((data?.keyInsights && data.keyInsights.length > 0) || (data?.actionPlan && data.actionPlan.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.keyInsights && data.keyInsights.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Retention & CRM Insights
                </h3>
              </div>
              <ul className="space-y-2 text-xs">
                {data.keyInsights.map((insight, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data?.actionPlan && data.actionPlan.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Prioritized Action Plan
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                {data.actionPlan.map((action, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{action.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        action.priority === 'HIGH'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : action.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{action.description}</p>
                    <span className="text-emerald-600 font-semibold text-[11px] block mt-1">Impact: {action.estimatedImpact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── REAL CUSTOMER LIST TABLE ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Database Customer Profiles ({filteredCustomers.length})
            </h2>
            <TableRefreshButton
              onRefresh={() => fetchSegmentation(promptInput, aiProvider)}
              isRefreshing={isRefreshing}
            />
          </div>
          {selectedSegmentFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => {
                setSelectedSegmentFilter('ALL');
                setPage(1);
              }}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Show All Customers ({customers.length})
            </button>
          )}
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No customer profiles match this segment filter. All data is derived from your real database records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">Customer</th>
                  <th className="pb-2.5 font-medium">Segment</th>
                  <th className="pb-2.5 font-medium">Orders</th>
                  <th className="pb-2.5 font-medium">Total Spent</th>
                  <th className="pb-2.5 font-medium">Last Purchase</th>
                  <th className="pb-2.5 font-medium text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{cust.name}</span>
                      <span className="text-[11px] text-slate-400">{cust.email}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {cust.segmentLabel}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{cust.totalOrders}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{currencySymbol}{cust.totalSpent.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-500">{cust.daysSinceLastOrder}d ago</td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400 text-[11px]">
                      {cust.recommendedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredCustomers.length > 0 && (
          <TablePagination
            currentPage={page}
            totalItems={filteredCustomers.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

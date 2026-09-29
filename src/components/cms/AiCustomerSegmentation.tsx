'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Send,
  RefreshCw,
  Mail,
  CheckCircle2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  AiCustomerSegmentationResult,
  CustomerSegmentationSummaryData,
  SegmentCustomerProfileData,
  SegmentGroupSummaryData,
} from '@/src/types';

export const AiCustomerSegmentation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [promptInput, setPromptInput] = useState("Create a campaign for customers who purchased shoes but haven't purchased in 90 days.");
  const [data, setData] = useState<AiCustomerSegmentationResult | null>(null);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('ALL');
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const fetchSegmentation = async (query?: string) => {
    setLoading(true);
    try {
      const q = query || promptInput;
      const res = await cmsService.queryCustomerSegmentation({ prompt: q });
      setData(res);
    } catch (err) {
      console.error('Failed to load customer segmentation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentation();
  }, []);

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
      setDeploySuccess(`Successfully launched targeted campaign to ${camp.matchedCustomerCount} customers!`);
      setTimeout(() => setDeploySuccess(null), 4000);
    } catch (err) {
      console.error('Error launching campaign:', err);
    }
  };

  const summary = data?.summary;
  const segments = summary?.segments || [];
  const customers = summary?.customers || [];
  const filteredCustomers = selectedSegmentFilter === 'ALL'
    ? customers
    : customers.filter((c) => c.segment === selectedSegmentFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Customer Segmentation</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Categorizes customers into RFM behavioral cohorts from your database and creates automated targeted campaigns.
          </p>
        </div>

        <button
          onClick={() => fetchSegmentation()}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate RFM
        </button>
      </div>

      {/* ─── PROMPT QUERY BAR ─────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchSegmentation(promptInput);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask AI: e.g., 'Create a campaign for footwear buyers inactive for 90 days'..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
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

      {/* ─── 5 RFM SEGMENT CARDS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {segments.map((seg) => {
          const isSelected = selectedSegmentFilter === seg.segment;
          return (
            <button
              key={seg.segment}
              onClick={() => setSelectedSegmentFilter(isSelected ? 'ALL' : seg.segment)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-500 block truncate">{seg.title}</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{seg.customerCount}</p>
              <span className="text-[11px] text-slate-400">{seg.percentageOfBase}% of base</span>
            </button>
          );
        })}
      </div>

      {/* ─── AI GENERATED TARGETED CAMPAIGN DRAFT ─────────────────────────── */}
      {data?.targetedCampaign && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                Targeted Audience: {data.targetedCampaign.matchedCustomerCount} Verified Customers
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {data.targetedCampaign.title}
              </h2>
            </div>
            <button
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
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line max-h-36 overflow-y-auto">
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

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                <span>Promo Code: <strong className="font-mono text-purple-600 font-bold">{data.targetedCampaign.discountCode}</strong></span>
                <span>Expected Conv: <strong className="text-emerald-600 font-bold">{data.targetedCampaign.projectedConversionRate}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOMER LIST TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Customer Profiles ({filteredCustomers.length})
          </h2>
          {selectedSegmentFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedSegmentFilter('ALL')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Show All Customers
            </button>
          )}
        </div>

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
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5">
                    <span className="font-bold text-slate-900 dark:text-white block">{cust.name}</span>
                    <span className="text-[11px] text-slate-400">{cust.email}</span>
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {cust.segmentLabel}
                    </span>
                  </td>
                  <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{cust.totalOrders}</td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300">₹{cust.totalSpent.toLocaleString()}</td>
                  <td className="py-2.5 text-slate-500">{cust.daysSinceLastOrder}d ago</td>
                  <td className="py-2.5 text-right text-slate-600 dark:text-slate-400 text-[11px]">
                    {cust.recommendedAction}
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

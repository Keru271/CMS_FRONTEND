'use client';

import React, { useState } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import {
  Ban,
  RefreshCw,
  Mail,
  LogOut,
  Store,
  Lock,
  XCircle,
  ShieldAlert,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const StoreSuspendedModal: React.FC = () => {
  const {
    merchantData,
    isCheckingStatus,
    refreshStoreStatus,
    handleLogout,
  } = useCMSContext();

  const storeId = merchantData?.store?.id;
  const storeName = merchantData?.store?.storeName || 'Merchant Store';
  const storeSlug = merchantData?.store?.slug || 'store';
  const merchantEmail = merchantData?.merchant?.email || 'merchant@example.com';
  const merchantName = `${merchantData?.merchant?.firstName || 'Merchant'} ${merchantData?.merchant?.lastName || 'Owner'}`.trim();

  // Mode: 'NOTICE' | 'APPEAL_FORM' | 'SUCCESS'
  const [viewMode, setViewMode] = useState<'NOTICE' | 'APPEAL_FORM' | 'SUCCESS'>('NOTICE');

  // Appeal Form State
  const [appealType, setAppealType] = useState<'APPEAL' | 'COMPLIANCE' | 'TECHNICAL' | 'BILLING' | 'GENERAL'>('APPEAL');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');
  const [subject, setSubject] = useState(`Store Suspension Appeal — ${storeName} (/${storeSlug})`);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage('Please provide a detailed explanation of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await cmsService.submitSupportAppeal({
        storeId,
        storeName,
        storeSlug,
        userEmail: merchantEmail,
        userName: merchantName,
        type: appealType,
        subject,
        message,
        priority,
      });

      if (res.success) {
        setSubmittedTicket(res.data);
        setViewMode('SUCCESS');
      } else {
        setErrorMessage(res.message || 'Failed to submit appeal. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Error submitting query. Please verify connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#191a1b]/65 backdrop-blur-sm animate-fadeIn">
      {/* Statamic Style Reference Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 text-[#191a1b] font-sans shadow-[0_0_0_1px_rgba(94,90,90,0.1),0_16px_40px_-8px_rgba(0,0,0,0.12)] space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* VIEW 1: DEFAULT SUSPENSION NOTICE */}
        {viewMode === 'NOTICE' && (
          <>
            {/* Top Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-[#cbd5e0]/60 pb-6 text-center sm:text-left">
              {/* S-Mark / Suspension Emblem with Statamic styling */}
              <div className="w-14 h-14 rounded-xl bg-[#191a1b] text-[#d4ff4c] flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <Ban className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]/70">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Administrative Suspension</span>
                </div>

                {/* Editorial Serif Display Headline */}
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#191a1b] tracking-tight">
                  Store Access <span className="italic font-normal">Suspended</span>
                </h2>

                <p className="text-xs sm:text-sm text-[#5e5a5a] leading-relaxed">
                  This store and all merchant management operations have been temporarily suspended by Master Platform Administration.
                </p>
              </div>
            </div>

            {/* Store Target Info Card (Warm Shell background #fdf1ef with 8px radius) */}
            <div className="bg-[#fdf1ef] border border-[#cbd5e0] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[#cbd5e0]/70 pb-2">
                <span className="text-[#5e5a5a] font-medium uppercase tracking-wider text-[10px]">
                  Store Profile
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b] font-medium text-[10px] border border-[#fca5a5]/80">
                  STATUS: SUSPENDED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#5e5a5a] block text-[11px] mb-1">Store Name & Slug</span>
                  <div className="font-semibold text-[#191a1b] flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#5e5a5a]" />
                    <span>{storeName}</span>
                    <span className="font-mono text-[11px] font-bold text-[#4e5154]">/{storeSlug}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#5e5a5a] block text-[11px] mb-1">Account Owner</span>
                  <span className="font-medium text-[#191a1b] block">{merchantName}</span>
                </div>
              </div>
            </div>

            {/* Restrictions List */}
            <div className="space-y-2.5 text-left">
              <h3 className="text-xs font-semibold text-[#191a1b] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#5e5a5a]" />
                <span>Enforced Restrictions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-white border border-[#cbd5e0] flex items-start gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[#191a1b]">
                  <XCircle className="w-4 h-4 text-[#991b1b] shrink-0 mt-0.5" />
                  <span>Public Storefront checkout & cart operations disabled</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#cbd5e0] flex items-start gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[#191a1b]">
                  <XCircle className="w-4 h-4 text-[#991b1b] shrink-0 mt-0.5" />
                  <span>Catalog publishing, pricing & layout edits locked</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#cbd5e0] flex items-start gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[#191a1b]">
                  <XCircle className="w-4 h-4 text-[#991b1b] shrink-0 mt-0.5" />
                  <span>Order fulfillment & payment capture paused</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#cbd5e0] flex items-start gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[#191a1b]">
                  <XCircle className="w-4 h-4 text-[#991b1b] shrink-0 mt-0.5" />
                  <span>Developer API keys & Webhook dispatches halted</span>
                </div>
              </div>
            </div>

            {/* Actions Bar conforming to DESIGN.md Button Styles */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {/* Filled Primary Button: Background #191a1b, text #d4ff4c (Electric Lime), Lexend weight 500, 8px radius */}
              <button
                type="button"
                onClick={refreshStoreStatus}
                disabled={isCheckingStatus}
                className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-[#191a1b] hover:bg-[#2e3033] text-[#d4ff4c] font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Checking Status...' : 'Re-verify Store Status'}</span>
              </button>

              {/* Ghost Outlined Button: Opens the Appeal Form */}
              <button
                type="button"
                onClick={() => setViewMode('APPEAL_FORM')}
                className="w-full sm:flex-1 py-3 px-5 rounded-lg border-[1.5px] border-[#cbc2ea] hover:bg-[#cbc2ea]/15 text-[#191a1b] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#5e5a5a]" />
                <span>Appeal & Contact Platform</span>
              </button>

              {/* Secondary Action: Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto py-3 px-4 rounded-lg border border-[#cbd5e0] hover:bg-[#fdf1ef] text-[#5e5a5a] hover:text-[#191a1b] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-[11px] text-[#5e5a5a] text-center font-normal pt-1">
              Once Platform Governance reinstates your store, click <span className="font-semibold text-[#191a1b]">Re-verify Store Status</span> to immediately restore studio access.
            </p>
          </>
        )}

        {/* VIEW 2: APPEAL & CONTACT SUBMISSION FORM */}
        {viewMode === 'APPEAL_FORM' && (
          <form onSubmit={handleSubmitAppeal} className="space-y-5 animate-fadeIn">
            {/* Header with Back button */}
            <div className="flex items-center justify-between border-b border-[#cbd5e0]/60 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('NOTICE')}
                  className="p-2 rounded-lg hover:bg-[#fdf1ef] text-[#5e5a5a] hover:text-[#191a1b] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#191a1b]">
                    Submit Reinstatement <span className="italic font-normal">Appeal</span>
                  </h2>
                  <p className="text-xs text-[#5e5a5a]">
                    Direct message to Master Platform Governance and Compliance Team
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#fdf1ef] border border-[#cbd5e0] text-[10px] font-mono text-[#5e5a5a] hidden sm:inline-block">
                /{storeSlug}
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields in Statamic Design System */}
            <div className="space-y-4 text-xs">
              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#5e5a5a] uppercase tracking-wider mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    value={appealType}
                    onChange={(e: any) => setAppealType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 text-[#191a1b] font-sans outline-none text-xs"
                  >
                    <option value="APPEAL">Store Suspension Appeal</option>
                    <option value="COMPLIANCE">Compliance & Verification</option>
                    <option value="TECHNICAL">Technical Issue / Bug</option>
                    <option value="BILLING">Billing & Subscription Inquiry</option>
                    <option value="GENERAL">General Governance Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5e5a5a] uppercase tracking-wider mb-1.5">
                    Urgency Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 text-[#191a1b] font-sans outline-none text-xs"
                  >
                    <option value="URGENT">🔴 Urgent — Store Blocked</option>
                    <option value="HIGH">🟠 High Priority</option>
                    <option value="NORMAL">🔵 Normal Priority</option>
                    <option value="LOW">⚪ Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-medium text-[#5e5a5a] uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 text-[#191a1b] font-sans outline-none text-xs"
                  placeholder="e.g. Request for review of store suspension"
                />
              </div>

              {/* Readonly Account Meta */}
              <div className="p-3 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#5e5a5a]">
                <div>
                  <span className="font-semibold text-[#191a1b]">Merchant Email:</span> {merchantEmail}
                </div>
                <div>
                  <span className="font-semibold text-[#191a1b]">Store:</span> {storeName} (<span className="font-mono">{storeSlug}</span>)
                </div>
              </div>

              {/* Detailed Message Textarea */}
              <div>
                <label className="block text-[11px] font-medium text-[#5e5a5a] uppercase tracking-wider mb-1.5">
                  Appeal Explanation & Supporting Information
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Describe your appeal details, explain any resolved issues or policy rectifications, and why your store should be un-suspended..."
                  className="w-full p-3.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 text-[#191a1b] font-sans outline-none text-xs leading-relaxed resize-none"
                />
                <span className="text-[10px] text-[#5e5a5a] block mt-1">
                  Submitted queries will be immediately queued in the Master Admin Panel for compliance review.
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-[#191a1b] hover:bg-[#2e3033] text-[#d4ff4c] font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Appeal...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Appeal to Master Admin</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('NOTICE')}
                className="w-full sm:w-auto py-3 px-5 rounded-lg border border-[#cbd5e0] hover:bg-[#fdf1ef] text-[#5e5a5a] hover:text-[#191a1b] font-medium text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: SUCCESS CONFIRMATION */}
        {viewMode === 'SUCCESS' && (
          <div className="text-center py-4 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#fdf1ef] border-2 border-[#191a1b] text-[#191a1b] flex items-center justify-center mx-auto shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <CheckCircle2 className="w-9 h-9 text-[#16a34a]" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] text-[11px] font-bold uppercase tracking-wider">
                Appeal Submitted Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#191a1b]">
                Under <span className="italic font-normal">Governance Review</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#5e5a5a] max-w-md mx-auto leading-relaxed">
                Your appeal has been dispatched to Master Platform Administration. Our compliance team will review your query shortly.
              </p>
            </div>

            {submittedTicket && (
              <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-[#cbd5e0]/60 pb-2">
                  <span className="text-[#5e5a5a] text-[11px]">Ticket ID</span>
                  <span className="font-mono font-bold text-[#191a1b] bg-white px-2 py-0.5 rounded border border-[#cbd5e0]">
                    {submittedTicket.ticketNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5e5a5a] text-[11px]">Category</span>
                  <span className="font-semibold text-[#191a1b]">{submittedTicket.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5e5a5a] text-[11px]">Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[10px] font-bold">
                    {submittedTicket.status}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={refreshStoreStatus}
                disabled={isCheckingStatus}
                className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-[#191a1b] hover:bg-[#2e3033] text-[#d4ff4c] font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Checking...' : 'Check If Reinstated'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('NOTICE')}
                className="w-full sm:flex-1 py-3 px-4 rounded-lg border border-[#cbd5e0] hover:bg-[#fdf1ef] text-[#191a1b] font-medium text-xs transition-all cursor-pointer"
              >
                Back to Notice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  CreditCard,
  User,
  Mail,
  ShieldCheck,
  RefreshCw,
  X,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react';
import { GiftCard, GiftCardMetrics, GiftCardFormData, GiftCardTransaction } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { useCMSContext } from '@/src/context/CMSContext';

export const GiftCardManager: React.FC = () => {
  const { currencySymbol = '₹', currency = 'INR' } = useCMSContext();

  const [cards, setCards] = useState<GiftCard[]>([]);
  const [metrics, setMetrics] = useState<GiftCardMetrics>({
    totalIssuedValue: 0,
    outstandingBalance: 0,
    activeCount: 0,
    depletedCount: 0,
    disabledCount: 0,
    totalRedemptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DEPLETED' | 'DISABLED' | 'EXPIRED'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Issue Card Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueFormData, setIssueFormData] = useState<GiftCardFormData>({
    code: '',
    initialValue: 50,
    currency,
    recipientEmail: '',
    recipientName: '',
    senderName: '',
    message: '',
    expiresAt: '',
    status: 'ACTIVE',
    note: '',
  });

  // Detail / Transactions Drawer
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Adjust Balance Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustCard, setAdjustCard] = useState<GiftCard | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustNote, setAdjustNote] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadGiftCards();
  }, [statusFilter]);

  const loadGiftCards = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getGiftCards({
        status: statusFilter,
        search: searchQuery,
      });
      setCards(data.cards || []);
      setMetrics(data.metrics || {
        totalIssuedValue: 0,
        outstandingBalance: 0,
        activeCount: 0,
        depletedCount: 0,
        disabledCount: 0,
        totalRedemptions: 0,
      });
    } catch (err) {
      console.error('Error loading gift cards:', err);
      showToast('Failed to load gift cards from server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGiftCards();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Code copied to clipboard: ${code}`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Generate a random code for the modal
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let raw = '';
    for (let i = 0; i < 12; i++) {
      raw += chars[Math.floor(Math.random() * chars.length)];
    }
    const code = `GC-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
    setIssueFormData((prev) => ({ ...prev, code }));
  };

  const handleOpenIssueModal = () => {
    generateRandomCode();
    setIssueFormData({
      code: '',
      initialValue: 100,
      currency,
      recipientEmail: '',
      recipientName: '',
      senderName: '',
      message: '',
      expiresAt: '',
      status: 'ACTIVE',
      note: 'Issued via CMS Admin Dashboard',
    });
    generateRandomCode();
    setIsIssueModalOpen(true);
  };

  const handleSubmitIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueFormData.initialValue || issueFormData.initialValue <= 0) {
      showToast('Please enter a valid gift card amount.', 'error');
      return;
    }
    setIsSubmittingIssue(true);
    try {
      const created = await cmsService.createGiftCard(issueFormData);
      showToast(`Gift card "${created.code}" issued successfully!`, 'success');
      setIsIssueModalOpen(false);
      loadGiftCards();
    } catch (err: any) {
      console.error('Error creating gift card:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to issue gift card', 'error');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleToggleCardStatus = async (card: GiftCard) => {
    const nextStatus = card.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await cmsService.updateGiftCard(card.id, { status: nextStatus });
      showToast(`Gift card ${nextStatus === 'ACTIVE' ? 'activated' : 'disabled'} successfully.`, 'success');
      loadGiftCards();
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleOpenAdjustModal = (card: GiftCard) => {
    setAdjustCard(card);
    setAdjustAmount(10);
    setAdjustType('CREDIT');
    setAdjustNote('');
    setIsAdjustModalOpen(true);
  };

  const handleSubmitAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCard) return;
    if (!adjustAmount || adjustAmount <= 0) {
      showToast('Please specify a positive adjustment amount.', 'error');
      return;
    }
    if (!adjustNote.trim()) {
      showToast('Please enter an audit reason for this adjustment.', 'error');
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      await cmsService.adjustGiftCardBalance(adjustCard.id, {
        amount: adjustAmount,
        type: adjustType,
        note: adjustNote.trim(),
      });
      showToast(`Balance adjusted successfully for ${adjustCard.code}!`, 'success');
      setIsAdjustModalOpen(false);
      loadGiftCards();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to adjust balance', 'error');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleDeleteCard = async (card: GiftCard) => {
    if (!confirm(`Are you sure you want to permanently delete gift card "${card.code}"?`)) {
      return;
    }
    try {
      await cmsService.deleteGiftCard(card.id);
      showToast('Gift card deleted.', 'success');
      loadGiftCards();
    } catch (err) {
      showToast('Failed to delete gift card', 'error');
    }
  };

  const handleOpenDetailDrawer = (card: GiftCard) => {
    setSelectedCard(card);
    setIsDetailDrawerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight flex items-center gap-2">
                Gift Cards Studio
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                  Storefront & POS
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Issue customer gift vouchers, track live redemption ledgers, and manage balance liabilities
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadGiftCards}
            disabled={isLoading}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Gift Cards"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenIssueModal}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Gift Card</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issued */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Value Issued</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground">
            {currencySymbol}
            {metrics.totalIssuedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400">Cumulative face value across all cards</p>
        </div>

        {/* Outstanding Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {currencySymbol}
            {metrics.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="w-full bg-slate-100 dark:bg-accent rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${metrics.totalIssuedValue > 0 ? Math.min(100, (metrics.outstandingBalance / metrics.totalIssuedValue) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Active Cards */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Cards</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground">
            {metrics.activeCount} <span className="text-xs font-normal text-slate-400">cards</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.depletedCount} depleted • {metrics.disabledCount} disabled
          </p>
        </div>

        {/* Redemptions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Redemptions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground">
            {metrics.totalRedemptions} <span className="text-xs font-normal text-slate-400">times</span>
          </div>
          <p className="text-[11px] text-slate-400">Used during customer storefront checkout</p>
        </div>
      </div>

      {/* TOOLBAR: SEARCH & STATUS TABS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-card p-4 rounded-3xl border border-slate-200/80 dark:border-border shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'ACTIVE', 'DEPLETED', 'DISABLED', 'EXPIRED'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-accent'
                }`}
              >
                {tab === 'ALL' ? 'All Gift Cards' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, recipient, sender..."
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium focus:bg-white dark:focus:bg-card transition"
          />
        </form>
      </div>

      {/* GIFT CARDS LIST TABLE */}
      <div className="bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading gift cards ledger...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
                No Gift Cards Found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No gift cards match your filter criteria.'
                  : 'Start issuing digital gift cards to delight customers, run marketing campaigns, or reward store loyalty.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenIssueModal}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Your First Gift Card</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-accent/40 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200/80 dark:border-border">
                <tr>
                  <th className="p-4 pl-6">Card Code</th>
                  <th className="p-4">Balance & Value</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4">Issued On</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border">
                {cards.map((card) => {
                  const percentLeft = card.initialValue > 0 ? (card.currentBalance / card.initialValue) * 100 : 0;
                  const isDepleted = card.currentBalance <= 0;
                  const isCopied = copiedCode === card.code;

                  return (
                    <tr key={card.id} className="hover:bg-slate-50/80 dark:hover:bg-accent/20 transition-colors">
                      {/* Code */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 dark:text-foreground text-xs tracking-wider bg-slate-100 dark:bg-accent px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-border">
                            {card.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(card.code)}
                            title="Copy Gift Card Code"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Balance & Progress */}
                      <td className="p-4">
                        <div className="space-y-1 min-w-[130px]">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900 dark:text-foreground">
                              {currencySymbol}
                              {card.currentBalance.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              / {currencySymbol}
                              {card.initialValue.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-accent rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDepleted
                                  ? 'bg-slate-300'
                                  : percentLeft > 50
                                    ? 'bg-emerald-500'
                                    : percentLeft > 20
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, percentLeft))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="p-4">
                        {card.recipientEmail || card.recipientName ? (
                          <div className="space-y-0.5">
                            {card.recipientName && (
                              <div className="font-bold text-slate-800 dark:text-foreground">{card.recipientName}</div>
                            )}
                            {card.recipientEmail && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{card.recipientEmail}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned (Direct code)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            card.status === 'ACTIVE' && card.currentBalance > 0
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
                              : card.status === 'DISABLED'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : card.status === 'EXPIRED'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              card.status === 'ACTIVE' && card.currentBalance > 0
                                ? 'bg-emerald-500'
                                : card.status === 'DISABLED'
                                  ? 'bg-slate-400'
                                  : 'bg-amber-500'
                            }`}
                          />
                          {card.status}
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {card.expiresAt ? (
                          <span className="text-[11px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(card.expiresAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No Expiration</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailDrawer(card)}
                            title="View Transaction Ledger"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustModal(card)}
                            title="Adjust Balance (Credit / Debit)"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition cursor-pointer"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleCardStatus(card)}
                            title={card.status === 'ACTIVE' ? 'Disable Gift Card' : 'Enable Gift Card'}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition cursor-pointer"
                          >
                            {card.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card)}
                            title="Delete Gift Card"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE GIFT CARD MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-foreground">Issue New Gift Card</h3>
                  <p className="text-xs text-slate-400">Generate a digital card code and assign initial value</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-foreground rounded-xl hover:bg-slate-100 dark:hover:bg-accent transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssueCard} className="space-y-4">
              {/* Code input + Auto-gen */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-foreground">Gift Card Code</label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Regenerate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={issueFormData.code || ''}
                  onChange={(e) => setIssueFormData({ ...issueFormData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. GC-9821-4412-8871"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 font-mono font-black text-sm text-slate-900 dark:text-foreground tracking-wider uppercase focus:bg-white transition"
                />
              </div>

              {/* Amount Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-foreground">
                  Card Face Value ({currencySymbol}) *
                </label>
                <div className="flex items-center gap-2">
                  {[25, 50, 100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setIssueFormData({ ...issueFormData, initialValue: amt })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        issueFormData.initialValue === amt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border hover:bg-slate-50'
                      }`}
                    >
                      {currencySymbol}
                      {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={issueFormData.initialValue || ''}
                  onChange={(e) =>
                    setIssueFormData({ ...issueFormData, initialValue: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Or enter custom amount..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:bg-white transition"
                />
              </div>

              {/* Recipient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-foreground">Recipient Name (Optional)</label>
                  <input
                    type="text"
                    value={issueFormData.recipientName || ''}
                    onChange={(e) => setIssueFormData({ ...issueFormData, recipientName: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-foreground">Recipient Email (Optional)</label>
                  <input
                    type="email"
                    value={issueFormData.recipientEmail || ''}
                    onChange={(e) => setIssueFormData({ ...issueFormData, recipientEmail: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Sender & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-foreground">Sender Name (Optional)</label>
                  <input
                    type="text"
                    value={issueFormData.senderName || ''}
                    onChange={(e) => setIssueFormData({ ...issueFormData, senderName: e.target.value })}
                    placeholder="e.g. Store Management / Friend"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-foreground">Expiration Date</label>
                  <input
                    type="date"
                    value={issueFormData.expiresAt ? issueFormData.expiresAt.split('T')[0] : ''}
                    onChange={(e) =>
                      setIssueFormData({
                        ...issueFormData,
                        expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '',
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Gift Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-foreground">Gift Message (Optional)</label>
                <textarea
                  rows={2}
                  value={issueFormData.message || ''}
                  onChange={(e) => setIssueFormData({ ...issueFormData, message: e.target.value })}
                  placeholder="Happy Birthday! Enjoy shopping at our store..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingIssue ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                  <span>Issue Gift Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {isAdjustModalOpen && adjustCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-foreground">Adjust Balance</h3>
                  <p className="text-xs font-mono text-slate-400">{adjustCard.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustBalance} className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-accent/40 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Balance:</span>
                <span className="font-black text-slate-900 dark:text-foreground text-sm">
                  {currencySymbol}
                  {adjustCard.currentBalance.toFixed(2)}
                </span>
              </div>

              {/* Credit or Debit Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    adjustType === 'CREDIT'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Credit (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    adjustType === 'DEBIT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Debit (-)</span>
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-foreground">
                  Adjustment Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={adjustAmount || ''}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  placeholder="25.00"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold"
                />
              </div>

              {/* Note / Audit Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-foreground">Audit Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Customer support compensation, return refund"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmittingAdjust && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / AUDIT TRANSACTIONS DRAWER */}
      {isDetailDrawerOpen && selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white dark:bg-card border-l border-slate-200 dark:border-border w-full max-w-md h-full p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-foreground">Gift Card Details</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedCard.code}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Summary Card */}
              <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-600 to-purple-700 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-indigo-200" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Digital Voucher</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                    {selectedCard.status}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-indigo-200">Remaining Balance</div>
                  <div className="text-3xl font-black">
                    {currencySymbol}
                    {selectedCard.currentBalance.toFixed(2)}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-mono">
                  <span>{selectedCard.code}</span>
                  <span className="text-indigo-200 text-[11px]">
                    Init: {currencySymbol}
                    {selectedCard.initialValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-xs bg-slate-50 dark:bg-accent/40 p-4 rounded-2xl border border-slate-200/80 dark:border-border">
                {selectedCard.recipientName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold text-slate-800 dark:text-foreground">{selectedCard.recipientName}</span>
                  </div>
                )}
                {selectedCard.recipientEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-slate-800 dark:text-foreground">{selectedCard.recipientEmail}</span>
                  </div>
                )}
                {selectedCard.senderName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sender:</span>
                    <span className="font-bold text-slate-800 dark:text-foreground">{selectedCard.senderName}</span>
                  </div>
                )}
                {selectedCard.message && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-border">
                    <span className="text-slate-400 block mb-0.5">Gift Note:</span>
                    <p className="italic text-slate-700 dark:text-slate-300">"{selectedCard.message}"</p>
                  </div>
                )}
              </div>

              {/* Transaction Ledger */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center justify-between">
                  <span>Redemption & Audit Ledger</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {selectedCard.transactions?.length || 0} events
                  </span>
                </h4>

                {(!selectedCard.transactions || selectedCard.transactions.length === 0) ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No transactions recorded on this card yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedCard.transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="p-3 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 dark:text-foreground flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                txn.type === 'INITIAL_LOAD' || txn.amount > 0 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                            />
                            <span>{txn.type.replace('_', ' ')}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{txn.note || 'Checkout usage'}</div>
                          <div className="text-[9px] text-slate-400">{new Date(txn.createdAt).toLocaleString()}</div>
                        </div>

                        <div
                          className={`font-black text-sm ${
                            txn.amount > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-foreground'
                          }`}
                        >
                          {txn.amount > 0 ? '+' : ''}
                          {currencySymbol}
                          {Math.abs(txn.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-border flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  handleOpenAdjustModal(selectedCard);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Balance</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { CMSDiscount, DiscountType, DiscountMethod, DiscountAppliesTo, DiscountCustomerEligibility, CMSProduct, CollectionData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Ticket,
  Calendar,
  Layers,
  Users,
  ShoppingBag,
  Clock,
  DollarSign,
  Percent,
  Truck,
  Gift,
  Trash2,
  Edit2,
  X,
  RefreshCw,
  Check,
  Calculator,
  ArrowRight,
} from 'lucide-react';

export const DiscountStudio: React.FC = () => {
  const [discounts, setDiscounts] = useState<CMSDiscount[]>([]);
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'COUPON_CODE' | 'AUTOMATIC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<CMSDiscount | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    discountType: DiscountType;
    method: DiscountMethod;
    value: number;
    buyQuantity: number;
    getQuantity: number;
    getDiscountPercent: number;
    minOrderAmount: number;
    appliesTo: DiscountAppliesTo;
    targetIds: string[];
    customerEligibility: DiscountCustomerEligibility;
    targetCustomers: string[];
    usageLimit: number | '';
    oncePerCustomer: boolean;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'DRAFT';
  }>({
    title: '',
    code: 'SUMMER2026',
    discountType: 'PERCENTAGE',
    method: 'COUPON_CODE',
    value: 20,
    buyQuantity: 2,
    getQuantity: 1,
    getDiscountPercent: 100,
    minOrderAmount: 50.0,
    appliesTo: 'ALL',
    targetIds: [],
    customerEligibility: 'ALL',
    targetCustomers: ['VIP'],
    usageLimit: 100,
    oncePerCustomer: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE',
  });

  // Simulator Test Cart State
  const [testCartSubtotal, setTestCartSubtotal] = useState<number>(120.0);
  const [testPromoCodeInput, setTestPromoCodeInput] = useState<string>('SUMMER2026');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [discList, prodList, collList] = await Promise.all([
        cmsService.getDiscounts(),
        cmsService.getProducts(),
        cmsService.getCollections(),
      ]);
      setDiscounts(discList);
      setProducts(prodList);
      setCollections(collList);
    } catch (err) {
      console.error('Failed to load discounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      title: '',
      code: 'FLASH20',
      discountType: 'PERCENTAGE',
      method: 'COUPON_CODE',
      value: 20,
      buyQuantity: 2,
      getQuantity: 1,
      getDiscountPercent: 100,
      minOrderAmount: 50.0,
      appliesTo: 'ALL',
      targetIds: [],
      customerEligibility: 'ALL',
      targetCustomers: [],
      usageLimit: 100,
      oncePerCustomer: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (disc: CMSDiscount) => {
    setEditingDiscount(disc);
    setFormData({
      title: disc.title,
      code: disc.code || '',
      discountType: disc.discountType as DiscountType,
      method: disc.method as DiscountMethod,
      value: disc.value || 0,
      buyQuantity: disc.buyQuantity || 2,
      getQuantity: disc.getQuantity || 1,
      getDiscountPercent: disc.getDiscountPercent || 100,
      minOrderAmount: disc.minOrderAmount || 0,
      appliesTo: disc.appliesTo as DiscountAppliesTo,
      targetIds: disc.targetIds || [],
      customerEligibility: disc.customerEligibility as DiscountCustomerEligibility,
      targetCustomers: disc.targetCustomers || [],
      usageLimit: disc.usageLimit !== undefined && disc.usageLimit !== null ? disc.usageLimit : '',
      oncePerCustomer: disc.oncePerCustomer,
      startDate: disc.startDate || new Date().toISOString().split('T')[0],
      endDate: disc.endDate || '',
      status: disc.status === 'EXPIRED' ? 'DRAFT' : (disc.status as any),
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<CMSDiscount> = {
        title: formData.title,
        code: formData.method === 'COUPON_CODE' ? formData.code.toUpperCase() : null,
        discountType: formData.discountType,
        method: formData.method,
        value: Number(formData.value),
        buyQuantity: formData.discountType === 'BUY_X_GET_Y' ? Number(formData.buyQuantity) : null,
        getQuantity: formData.discountType === 'BUY_X_GET_Y' ? Number(formData.getQuantity) : null,
        getDiscountPercent: formData.discountType === 'BUY_X_GET_Y' ? Number(formData.getDiscountPercent) : null,
        minOrderAmount: Number(formData.minOrderAmount || 0),
        appliesTo: formData.appliesTo,
        targetIds: formData.targetIds,
        customerEligibility: formData.customerEligibility,
        targetCustomers: formData.targetCustomers,
        usageLimit: formData.usageLimit !== '' ? Number(formData.usageLimit) : null,
        oncePerCustomer: formData.oncePerCustomer,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        status: formData.status,
      };

      if (editingDiscount) {
        await cmsService.updateDiscount(editingDiscount.id, payload);
        showToast(`Discount "${formData.title}" updated!`, 'success');
      } else {
        await cmsService.createDiscount(payload);
        showToast(`New discount "${formData.title}" created!`, 'success');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save discount.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    try {
      setIsSaving(true);
      await cmsService.deleteDiscount(id);
      showToast('Discount promotion removed!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete discount.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Real-Time Simulator Discount Evaluator Engine
  const evaluateSimulatedCartDiscount = () => {
    const codeQuery = testPromoCodeInput.trim().toUpperCase();
    const appliedDisc = discounts.find(
      (d) =>
        d.status === 'ACTIVE' &&
        (d.method === 'AUTOMATIC' || (d.method === 'COUPON_CODE' && d.code?.toUpperCase() === codeQuery))
    );

    if (!appliedDisc) {
      return { savings: 0, applied: null, message: 'No active discount matching criteria.' };
    }

    if (appliedDisc.minOrderAmount && testCartSubtotal < appliedDisc.minOrderAmount) {
      return {
        savings: 0,
        applied: appliedDisc,
        message: `Requires minimum cart subtotal of $${appliedDisc.minOrderAmount.toFixed(2)} (Add $${(
          appliedDisc.minOrderAmount - testCartSubtotal
        ).toFixed(2)} more).`,
      };
    }

    let calculatedSavings = 0;

    if (appliedDisc.discountType === 'PERCENTAGE') {
      calculatedSavings = (testCartSubtotal * appliedDisc.value) / 100;
    } else if (appliedDisc.discountType === 'FIXED_AMOUNT') {
      calculatedSavings = Math.min(testCartSubtotal, appliedDisc.value);
    } else if (appliedDisc.discountType === 'FREE_SHIPPING') {
      calculatedSavings = 15.0; // Simulated shipping fee waiver
    } else if (appliedDisc.discountType === 'BUY_X_GET_Y') {
      calculatedSavings = 42.0; // Simulated item value
    }

    return {
      savings: calculatedSavings,
      applied: appliedDisc,
      message: `✓ Applied "${appliedDisc.title}" successfully! Saved $${calculatedSavings.toFixed(2)}.`,
    };
  };

  const simResult = evaluateSimulatedCartDiscount();

  const filteredDiscounts = discounts.filter((d) => {
    const tabMatch = activeTab === 'ALL' ? true : d.method === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      d.title.toLowerCase().includes(query) ||
      (d.code && d.code.toLowerCase().includes(query));

    return tabMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Discounts Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Promotions & Coupon Vouchers
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {discounts.filter((d) => d.status === 'ACTIVE').length} Active Promotions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Tag className="w-8 h-8 text-indigo-400" />
              <span>Discounts & Promotions Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Create Percentage Discounts, Fixed Amount Vouchers, Free Shipping rules, Buy X Get Y offers, Coupon Codes vs Automatic Discounts, and usage date schedules.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Discount</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Promotions', icon: Tag },
            { id: 'COUPON_CODE', label: 'Coupon Codes', icon: Ticket },
            { id: 'AUTOMATIC', label: 'Automatic Discounts', icon: Zap },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title or promo code..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* MAIN GRID: DISCOUNTS LIST + REAL-TIME CART SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: DISCOUNTS LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDiscounts.map((disc) => {
              const isCoupon = disc.method === 'COUPON_CODE';
              const isExpired = disc.status === 'EXPIRED';

              return (
                <div
                  key={disc.id}
                  className={`p-5 rounded-3xl border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                    isExpired ? 'border-slate-200 opacity-60' : 'border-slate-200/80 dark:border-border'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 ${
                          isCoupon
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}
                      >
                        {isCoupon ? <Ticket className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        <span>{isCoupon ? 'Coupon Code' : 'Automatic'}</span>
                      </span>

                      {isCoupon && disc.code && (
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-slate-900 text-amber-400 tracking-wider">
                          {disc.code}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-base text-slate-900 dark:text-foreground">{disc.title}</h3>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                          {disc.discountType === 'PERCENTAGE' && `${disc.value}% OFF`}
                          {disc.discountType === 'FIXED_AMOUNT' && `$${disc.value.toFixed(2)} OFF`}
                          {disc.discountType === 'FREE_SHIPPING' && 'Free Express Shipping'}
                          {disc.discountType === 'BUY_X_GET_Y' && `Buy ${disc.buyQuantity} Get ${disc.getQuantity} Free`}
                        </span>
                        {disc.minOrderAmount ? (
                          <span className="text-[10px] font-bold text-slate-500">
                            (Min ${disc.minOrderAmount.toFixed(2)} spend)
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Meta Specs */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-accent space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Redemptions Used:</span>
                        <span className="font-bold text-slate-900 dark:text-foreground">
                          {disc.usageCount} {disc.usageLimit ? `/ ${disc.usageLimit}` : 'uses'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Active Schedule:</span>
                        <span>{disc.startDate} {disc.endDate ? `to ${disc.endDate}` : '(No Expiry)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-border flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(disc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-800 dark:text-foreground text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDiscount(disc.id)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-accent text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME CHECKOUT CART SIMULATOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Real-Time Cart Simulator</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Live Evaluator
              </span>
            </div>

            {/* SIMULATED CART INPUTS */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Simulated Cart Subtotal ($)</label>
                <input
                  type="number"
                  step="5"
                  value={testCartSubtotal}
                  onChange={(e) => setTestCartSubtotal(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-white font-mono font-black text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Enter Coupon Code to Test</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPromoCodeInput}
                    onChange={(e) => setTestPromoCodeInput(e.target.value)}
                    placeholder="e.g. SUMMER2026"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-amber-400 font-mono font-black text-xs tracking-wider uppercase"
                  />
                </div>
              </div>
            </div>

            {/* EVALUATOR OUTPUT RESULT CARD */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal:</span>
                  <span className="font-bold text-white">${testCartSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount Savings:</span>
                  <span>-${simResult.savings.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
                  <span>Final Order Total:</span>
                  <span className="text-amber-400">${Math.max(0, testCartSubtotal - simResult.savings).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                {simResult.message}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT DISCOUNT MODAL WIZARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {editingDiscount ? `Edit Promotion: ${editingDiscount.title}` : 'Create New Promotion'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure discount type, trigger method, min spend, targeting, and date limits.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* TRIGGER METHOD SWITCHER */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-foreground uppercase tracking-wider">
                  Discount Trigger Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, method: 'COUPON_CODE' })}
                    className={`p-3.5 rounded-2xl border text-left space-y-0.5 transition-all ${
                      formData.method === 'COUPON_CODE'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold text-xs flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-amber-400" />
                      <span>Coupon Code Voucher</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">Customer inputs promo code at checkout.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, method: 'AUTOMATIC' })}
                    className={`p-3.5 rounded-2xl border text-left space-y-0.5 transition-all ${
                      formData.method === 'AUTOMATIC'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold text-xs flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Automatic Cart Discount</span>
                    </span>
                    <span className="text-[10px] text-indigo-100 block">Applies automatically when criteria match.</span>
                  </button>
                </div>
              </div>

              {/* TITLE & CODE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Promotion Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Summer Flash Sale 20% OFF"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                {formData.method === 'COUPON_CODE' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Coupon Promo Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER2026"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-black text-indigo-600 tracking-wider uppercase"
                    />
                  </div>
                )}
              </div>

              {/* DISCOUNT TYPE SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Discount Calculation Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { type: 'PERCENTAGE', label: 'Percentage %', icon: Percent },
                    { type: 'FIXED_AMOUNT', label: 'Fixed Amount $', icon: DollarSign },
                    { type: 'FREE_SHIPPING', label: 'Free Shipping', icon: Truck },
                    { type: 'BUY_X_GET_Y', label: 'Buy X Get Y', icon: Gift },
                  ].map((item) => {
                    const isSel = formData.discountType === item.type;
                    const IconC = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: item.type as DiscountType })}
                        className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                          isSel
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <IconC className="w-4 h-4 mx-auto" />
                        <span className="font-extrabold text-xs block">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC TYPE PARAMETERS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                {formData.discountType === 'PERCENTAGE' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Percentage Value (% Off)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-black text-indigo-600"
                    />
                  </div>
                )}

                {formData.discountType === 'FIXED_AMOUNT' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Fixed Discount Amount ($ Off)</label>
                    <input
                      type="number"
                      required
                      step="0.5"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-black text-emerald-600"
                    />
                  </div>
                )}

                {formData.discountType === 'BUY_X_GET_Y' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Customer Buys (Qty X)</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.buyQuantity}
                        onChange={(e) => setFormData({ ...formData, buyQuantity: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Customer Gets (Qty Y)</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.getQuantity}
                        onChange={(e) => setFormData({ ...formData, getQuantity: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">At % Discount</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={formData.getDiscountPercent}
                        onChange={(e) => setFormData({ ...formData, getDiscountPercent: parseFloat(e.target.value) || 100 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-indigo-600"
                      />
                    </div>
                  </div>
                )}

                {/* MINIMUM SPEND REQUIREMENT */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Minimum Order Cart Subtotal ($)</label>
                  <input
                    type="number"
                    step="5"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00 for no minimum"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* TARGETING & ELIGIBILITY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Applies To */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Applies To Products / Collections</label>
                  <select
                    value={formData.appliesTo}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as DiscountAppliesTo })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="ALL">Entire Store Catalog</option>
                    <option value="PRODUCTS">Specific Selected Products</option>
                    <option value="COLLECTIONS">Specific Selected Collections</option>
                  </select>
                </div>

                {/* Customer Eligibility */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Customer Group Eligibility</label>
                  <select
                    value={formData.customerEligibility}
                    onChange={(e) => setFormData({ ...formData, customerEligibility: e.target.value as DiscountCustomerEligibility })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="ALL">All Store Customers</option>
                    <option value="GROUPS">Specific Customer Groups (VIP, Wholesale, New)</option>
                  </select>
                </div>
              </div>

              {/* USAGE LIMITS & SCHEDULE DATES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Storewide Max Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value, 10) : '' })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Start Date Schedule</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Expiration End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Promotion...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Publish Promotion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { PriceTierData, StoreSubscriptionData, StoreBillingInvoiceData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Check,
  Sliders,
  Wallet,
  Building,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const BillingStudio: React.FC = () => {
  const [subscription, setSubscription] = useState<StoreSubscriptionData | null>(null);
  const [tiers, setTiers] = useState<PriceTierData[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<PriceTierData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'STRIPE_CARD' | 'NETBANKING'
  >('RAZORPAY_UPI');
  const [paymentDetailsInput, setPaymentDetailsInput] = useState('merchant@oksbi');
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Payment Method Update Modal
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [updatePaymentMethodType, setUpdatePaymentMethodType] = useState<
    'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'STRIPE_CARD' | 'NETBANKING'
  >('RAZORPAY_UPI');
  const [updatePaymentMethodDetails, setUpdatePaymentMethodDetails] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [tiersRes, subRes] = await Promise.all([
        cmsService.getPriceTiers(),
        cmsService.getStoreSubscription(),
      ]);
      setTiers(tiersRes.tiers || []);
      setSubscription(subRes);
      if (subRes.billingCycle) {
        setBillingCycle(subRes.billingCycle as any);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      showToast('Failed to load store pricing tiers and subscription', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Plan Change Modal
  const handleOpenPlanChange = (tier: PriceTierData) => {
    setSelectedPlanForChange(tier);
    setSelectedPaymentMethod((subscription?.planPaymentMethod as any) || 'RAZORPAY_UPI');
    setPaymentDetailsInput(subscription?.planPaymentMethodDetails || 'merchant@oksbi');
  };

  // Submit Plan Change
  const handleConfirmPlanChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForChange) return;

    setIsChangingPlan(true);
    try {
      const res = await cmsService.changeStorePlan({
        plan: selectedPlanForChange.id,
        billingCycle,
        paymentMethod: selectedPaymentMethod,
        paymentMethodDetails: paymentDetailsInput,
      });

      showToast(res.message || 'Store plan updated successfully!');
      setSelectedPlanForChange(null);
      await loadBillingData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update store plan', 'error');
    } finally {
      setIsChangingPlan(false);
    }
  };

  // Submit Payment Method Update
  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatePaymentMethodDetails.trim()) {
      showToast('Please enter valid payment details', 'error');
      return;
    }

    setIsUpdatingPayment(true);
    try {
      const res = await cmsService.updateStorePaymentMethod({
        paymentMethod: updatePaymentMethodType,
        paymentMethodDetails: updatePaymentMethodDetails.trim(),
      });

      showToast(res.message || 'Payment method updated successfully!');
      setIsPaymentMethodModalOpen(false);
      await loadBillingData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update payment method', 'error');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const currentPlanId = subscription?.plan || 'STARTER';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
            <span>Store Pricing Tiers & Billing</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store subscription, upgrade capacity, and change billing payment methods anytime.
          </p>
        </div>

        {/* Currency & Refresh Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-accent p-1 rounded-2xl flex items-center text-xs font-black">
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currency === 'INR'
                  ? 'bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ₹ INR
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currency === 'USD'
                  ? 'bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              $ USD
            </button>
          </div>

          <button
            type="button"
            onClick={loadBillingData}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Refresh subscription status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ACTIVE SUBSCRIPTION HERO BANNER */}
      {subscription && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500 text-white uppercase tracking-wider">
                  Current Plan: {subscription.planConfig?.name || subscription.plan}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{subscription.planStatus}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black">
                {subscription.planConfig?.name || 'Store Subscription'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {subscription.planConfig?.description ||
                  'Your store is active and equipped with high-performance storefront features.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Renews on: {new Date(subscription.planRenewsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                  <span>Fee: {subscription.planTransactionFeePercent}% per transaction</span>
                </div>
              </div>
            </div>

            {/* Payment Method & Quick Edit */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-3 w-full lg:w-80 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Billing Payment</span>
                <button
                  type="button"
                  onClick={() => {
                    setUpdatePaymentMethodType((subscription.planPaymentMethod as any) || 'RAZORPAY_UPI');
                    setUpdatePaymentMethodDetails(subscription.planPaymentMethodDetails || '');
                    setIsPaymentMethodModalOpen(true);
                  }}
                  className="text-xs font-black text-indigo-300 hover:text-white underline"
                >
                  Change
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                  {subscription.planPaymentMethod?.includes('UPI')
                    ? '⚡'
                    : subscription.planPaymentMethod?.includes('STRIPE')
                    ? '💳'
                    : '🏛️'}
                </div>
                <div>
                  <span className="text-xs font-black block">{subscription.planPaymentMethod}</span>
                  <span className="text-[11px] text-slate-300 font-mono block truncate max-w-[180px]">
                    {subscription.planPaymentMethodDetails}
                  </span>
                </div>
              </div>

              {/* Usage Stats Meter */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>Product Capacity</span>
                  <span>{subscription.usage?.products?.current || 0} / {subscription.planConfig?.maxProducts}</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${subscription.usage?.products?.percent || 5}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BILLING CYCLE TOGGLE (Monthly / Annual) */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-foreground">
          Choose or Change Your Store Price Tier
        </h3>
        <p className="text-xs text-slate-500">
          Switch between plans anytime. Upgrades take effect immediately with instant feature unlocking.
        </p>

        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-accent border border-slate-200 dark:border-border mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              billingCycle === 'ANNUAL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3-TIER COMPARISON CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {tiers.map((tier) => {
          const isCurrent = (currentPlanId || 'STARTER').toUpperCase() === tier.id.toUpperCase();
          const isAnnual = billingCycle === 'ANNUAL';
          const price =
            currency === 'INR'
              ? isAnnual
                ? tier.priceAnnualInr
                : tier.priceMonthlyInr
              : isAnnual
              ? tier.priceAnnualUsd
              : tier.priceMonthlyUsd;

          const currencySymbol = currency === 'INR' ? '₹' : '$';

          return (
            <div
              key={tier.id}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-2 border-emerald-500 ring-4 ring-emerald-500/20 shadow-2xl scale-[1.02] z-10'
                  : tier.popular
                  ? 'bg-white dark:bg-card border-2 border-indigo-600 shadow-xl'
                  : 'bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm'
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 z-10 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Your Active Tier</span>
                </div>
              ) : tier.popular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  ⭐ Most Popular Choice
                </div>
              ) : null}

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-foreground">{tier.name}</h3>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.description}</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className={`p-4 rounded-2xl border ${
                  isCurrent
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-slate-50 dark:bg-accent/40 border-slate-100 dark:border-border'
                }`}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-foreground">
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      / {isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mt-1">
                    {tier.transactionFeePercent === 0
                      ? '🎉 0% Platform Transaction Fee'
                      : `${tier.transactionFeePercent}% Platform Transaction Surcharge`}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                    What's Included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCurrent
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={`leading-tight ${isCurrent ? 'font-bold text-slate-900 dark:text-foreground' : ''}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-emerald-600/15 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-black text-xs cursor-default flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>✓ Currently Subscribed</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPlanChange(tier)}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                      tier.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    <span>Switch to {tier.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BILLING & INVOICES HISTORY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-border pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Subscription Invoices & Receipts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Download tax invoices and payment receipts for your accounting records.
            </p>
          </div>
        </div>

        {subscription?.invoices && subscription.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-border text-slate-400 font-black uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan / Tier</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border">
                {subscription.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-accent/20">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(inv.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-foreground">
                      {inv.tierName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500">
                      {inv.billingCycle}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-foreground">
                      {inv.currency === 'INR' ? '₹' : '$'}{inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading tax invoice ${inv.invoiceNumber}...`)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No past invoices available. Once your subscription renews, receipts will appear here.
          </div>
        )}
      </div>

      {/* CHANGE PLAN MODAL */}
      {selectedPlanForChange && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-border space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-foreground">
                  Confirm Plan Switch
                </h3>
                <p className="text-xs text-slate-400">
                  Switching to {selectedPlanForChange.name} ({billingCycle.toLowerCase()})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForChange(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Plan Summary Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 space-y-2 text-xs">
              <div className="flex justify-between font-black text-slate-900 dark:text-foreground text-sm">
                <span>{selectedPlanForChange.name}</span>
                <span>
                  ₹{billingCycle === 'ANNUAL' ? selectedPlanForChange.priceAnnualInr.toLocaleString() : selectedPlanForChange.priceMonthlyInr.toLocaleString()}
                  /{billingCycle === 'ANNUAL' ? 'yr' : 'mo'}
                </span>
              </div>
              <p className="text-slate-500">{selectedPlanForChange.description}</p>
              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900 flex justify-between text-indigo-700 dark:text-indigo-400 font-bold">
                <span>Platform Transaction Surcharge</span>
                <span>{selectedPlanForChange.transactionFeePercent}%</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handleConfirmPlanChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Billing Payment Gateway / Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'RAZORPAY_UPI', label: 'Razorpay UPI Autopay', icon: '⚡' },
                    { id: 'RAZORPAY_CARD', label: 'Credit/Debit Card (INR)', icon: '💳' },
                    { id: 'STRIPE_CARD', label: 'Stripe Global Card (USD)', icon: '🌐' },
                    { id: 'NETBANKING', label: 'NetBanking / e-Mandate', icon: '🏛️' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id as any)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                        selectedPaymentMethod === method.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-black'
                          : 'border-slate-200 dark:border-border hover:bg-slate-50 text-slate-600 dark:text-slate-400 font-semibold'
                      }`}
                    >
                      <span className="text-base">{method.icon}</span>
                      <span className="text-[11px] leading-tight">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Details (UPI ID / Card Ending)
                </label>
                <input
                  type="text"
                  required
                  value={paymentDetailsInput}
                  onChange={(e) => setPaymentDetailsInput(e.target.value)}
                  placeholder="e.g. merchant@oksbi or Visa •••• 4242"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForChange(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPlan}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isChangingPlan ? 'Updating Plan...' : 'Confirm & Activate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PAYMENT METHOD MODAL */}
      {isPaymentMethodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="text-base font-black text-slate-900 dark:text-foreground">
                Update Store Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentMethodModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePaymentMethod} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method Type
                </label>
                <select
                  value={updatePaymentMethodType}
                  onChange={(e) => setUpdatePaymentMethodType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                >
                  <option value="RAZORPAY_UPI">Razorpay UPI Autopay</option>
                  <option value="RAZORPAY_CARD">Razorpay Credit/Debit Card</option>
                  <option value="STRIPE_CARD">Stripe International Card</option>
                  <option value="NETBANKING">NetBanking Direct Mandate</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account / VPA / Card Details *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. merchant@icici or Mastercard ending 8891"
                  value={updatePaymentMethodDetails}
                  onChange={(e) => setUpdatePaymentMethodDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentMethodModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPayment}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg disabled:opacity-50"
                >
                  {isUpdatingPayment ? 'Saving...' : 'Save Payment Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

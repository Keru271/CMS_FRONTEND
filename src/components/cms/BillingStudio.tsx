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
  Lock,
  QrCode,
  Smartphone,
  Globe,
  Printer,
  X,
  ChevronRight,
  Receipt,
  Info,
  Crown,
  Package,
  Flame,
  Shield,
  Activity,
  ChevronDown,
} from 'lucide-react';

export const BillingStudio: React.FC = () => {
  const [subscription, setSubscription] = useState<StoreSubscriptionData | null>(null);
  const [tiers, setTiers] = useState<PriceTierData[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [customerRegion, setCustomerRegion] = useState<'INDIA' | 'INTERNATIONAL'>('INDIA');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selected Plan for Upgrade / Payment
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PriceTierData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Razorpay Checkout State (For Indian Customers)
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [razorpayVpa, setRazorpayVpa] = useState('merchant@oksbi');
  const [razorpayCardNumber, setRazorpayCardNumber] = useState('4532 •••• •••• 8821');
  const [razorpayBank, setRazorpayBank] = useState('HDFC');
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [razorpayStep, setRazorpayStep] = useState<'DETAILS' | 'AUTHORIZING' | 'SUCCESS'>('DETAILS');

  // Stripe Checkout State (For International Customers)
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [stripeCardNumber, setStripeCardNumber] = useState('4242 •••• •••• 4242');
  const [stripeExpiry, setStripeExpiry] = useState('12/28');
  const [stripeCvc, setStripeCvc] = useState('888');
  const [stripeCountry, setStripeCountry] = useState('United States (US)');
  const [stripeZip, setStripeZip] = useState('94103');
  const [stripeStep, setStripeStep] = useState<'DETAILS' | 'AUTHORIZING' | 'SUCCESS'>('DETAILS');

  // Invoice Receipt Preview Modal
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<StoreBillingInvoiceData | null>(null);

  // Upgrade Prorated Details
  const [upgradeDetails, setUpgradeDetails] = useState<{
    originalAmount?: number;
    creditedAmount?: number;
    upgradeDifference?: number;
    isUpgradeDifference?: boolean;
    currentPlanName?: string;
  } | null>(null);

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
      if (subRes.planPaymentMethod?.includes('STRIPE')) {
        setCustomerRegion('INTERNATIONAL');
      } else {
        setCustomerRegion('INDIA');
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
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Checkout or Directly Activate Free Tier
  const handleInitiatePlanUpgrade = async (tier: PriceTierData) => {
    setSelectedPlanForPayment(tier);

    // Free Tier (Starter): Skip payment gateways entirely and activate instantly
    if (tier.id.toUpperCase() === 'STARTER' || (tier.priceMonthlyInr === 0 && tier.priceMonthlyUsd === 0)) {
      setIsProcessingPayment(true);
      try {
        const res = await cmsService.changeStorePlan({
          plan: 'STARTER',
          billingCycle,
          paymentMethod: 'FREE_TIER' as any,
          paymentMethodDetails: 'Free Starter Plan (No Payment Required)',
        });
        showToast(`🎉 Switched to ${tier.name}! (Free Tier Activated - No payment needed)`, 'success');
        await loadBillingData();
      } catch (err: any) {
        showToast(err?.message || 'Failed to activate Starter plan', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    if (customerRegion === 'INDIA') {
      // Razorpay Flow for Paid Tiers (With Prorated Upgrade Calculation)
      setIsProcessingPayment(true);
      try {
        const orderData = await cmsService.createBillingRazorpayOrder({
          plan: tier.id as any,
          billingCycle,
        });
        setRazorpayOrderId(orderData.orderId);
        setUpgradeDetails({
          originalAmount: (orderData as any).originalAmount,
          creditedAmount: (orderData as any).creditedAmount,
          upgradeDifference: (orderData as any).upgradeDifference || orderData.amount,
          isUpgradeDifference: (orderData as any).isUpgradeDifference,
          currentPlanName: (orderData as any).currentPlanName,
        });
        setRazorpayStep('DETAILS');
        setIsRazorpayModalOpen(true);
      } catch (err: any) {
        showToast(err?.message || 'Failed to initialize Razorpay checkout', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      // Stripe Flow for Paid Tiers (With Prorated Upgrade Calculation)
      setIsProcessingPayment(true);
      try {
        const sessionData = await cmsService.createBillingStripeSession({
          plan: tier.id as any,
          billingCycle,
          currency: 'USD',
        });
        setUpgradeDetails({
          originalAmount: (sessionData as any).originalAmount,
          creditedAmount: (sessionData as any).creditedAmount,
          upgradeDifference: (sessionData as any).upgradeDifference || sessionData.amount,
          isUpgradeDifference: (sessionData as any).isUpgradeDifference,
          currentPlanName: (sessionData as any).currentPlanName,
        });
        setStripeStep('DETAILS');
        setIsStripeModalOpen(true);
      } catch (err: any) {
        showToast(err?.message || 'Failed to initialize Stripe checkout', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  // Complete Razorpay Payment (Indian Customer)
  const handleConfirmRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    setRazorpayStep('AUTHORIZING');

    // Simulate / Trigger Razorpay verification
    setTimeout(async () => {
      try {
        const paymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const methodDesc =
          razorpayMethod === 'UPI'
            ? `Razorpay UPI (${razorpayVpa})`
            : razorpayMethod === 'CARD'
            ? `Razorpay Card (${razorpayCardNumber})`
            : `Razorpay NetBanking (${razorpayBank})`;

        const res = await cmsService.verifyBillingRazorpayPayment({
          razorpay_order_id: razorpayOrderId || `order_rzp_${Date.now()}`,
          razorpay_payment_id: paymentId,
          plan: selectedPlanForPayment.id as any,
          billingCycle,
          paymentMethodDetails: methodDesc,
        });

        setRazorpayStep('SUCCESS');
        showToast(`🎉 ${res.message}`, 'success');
        await loadBillingData();
      } catch (err: any) {
        setRazorpayStep('DETAILS');
        showToast(err?.message || 'Razorpay payment verification failed', 'error');
      }
    }, 1400);
  };

  // Complete Stripe Payment (International Customer)
  const handleConfirmStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    setStripeStep('AUTHORIZING');

    // Simulate / Trigger Stripe verification
    setTimeout(async () => {
      try {
        const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const methodDesc = `Stripe Visa (•••• ${stripeCardNumber.slice(-4) || '4242'})`;

        const res = await cmsService.confirmBillingStripePayment({
          paymentIntentId,
          plan: selectedPlanForPayment.id as any,
          billingCycle,
          paymentMethodDetails: methodDesc,
          currency: 'USD',
        });

        setStripeStep('SUCCESS');
        showToast(`🎉 ${res.message}`, 'success');
        await loadBillingData();
      } catch (err: any) {
        setStripeStep('DETAILS');
        showToast(err?.message || 'Stripe payment confirmation failed', 'error');
      }
    }, 1400);
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
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5e5a5a]">
              SaaS Billing & Subscriptions
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4ff4c] text-[#191a1b]">
              Dual Gateways Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#191a1b] flex items-center gap-3 mt-1">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
            <span>Store Pricing Tiers & Billing</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Seamless payments for Indian merchants (via **Razorpay UPI & Cards**) and global international stores (via **Stripe**).
          </p>
        </div>

        {/* Customer Region & Refresh Controls */}
        <div className="flex items-center gap-3">
          {/* Indian vs International Switcher Pill */}
          <div className="bg-[#ffffff] border border-[#cbd5e0] p-1 rounded-2xl flex items-center shadow-xs">
            <button
              type="button"
              onClick={() => setCustomerRegion('INDIA')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customerRegion === 'INDIA'
                  ? 'bg-[#0c2340] text-white shadow-sm'
                  : 'text-[#5e5a5a] hover:text-[#191a1b]'
              }`}
            >
              <span>🇮🇳</span>
              <span>India (Razorpay ₹)</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomerRegion('INTERNATIONAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customerRegion === 'INTERNATIONAL'
                  ? 'bg-[#635bff] text-white shadow-sm'
                  : 'text-[#5e5a5a] hover:text-[#191a1b]'
              }`}
            >
              <span>🌍</span>
              <span>International (Stripe $)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadBillingData}
            className="p-2.5 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-xs"
            title="Refresh subscription status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ACTIVE SUBSCRIPTION HERO BANNER */}
      {subscription && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#191a1b] via-[#241f31] to-[#191a1b] text-white shadow-xl relative overflow-hidden border border-slate-700/50">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#d4ff4c] text-[#191a1b] uppercase tracking-wider">
                  Active Tier: {subscription.planConfig?.name || subscription.plan}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{subscription.planStatus}</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                {subscription.planConfig?.name || 'Store Subscription'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {subscription.planConfig?.description ||
                  'Your store is active and equipped with high-performance storefront features.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>
                    Renews on:{' '}
                    {new Date(subscription.planRenewsAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                  <span>Platform Fee: {subscription.planTransactionFeePercent}% per transaction</span>
                </div>
              </div>
            </div>

            {/* Payment Method & Active Gateway Badge */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-3 w-full lg:w-80 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Billing Gateway</span>
                <button
                  type="button"
                  onClick={() => {
                    setUpdatePaymentMethodType((subscription.planPaymentMethod as any) || 'RAZORPAY_UPI');
                    setUpdatePaymentMethodDetails(subscription.planPaymentMethodDetails || '');
                    setIsPaymentMethodModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#d4ff4c] hover:underline cursor-pointer"
                >
                  Edit Method
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                  {subscription.planPaymentMethod?.includes('STRIPE') ? '🌐' : '⚡'}
                </div>
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <span>{subscription.planPaymentMethod?.includes('STRIPE') ? 'Stripe Gateway' : 'Razorpay Gateway'}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20 text-emerald-300">
                      {subscription.planPaymentMethod?.includes('STRIPE') ? 'USD' : 'INR'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono block truncate max-w-[180px]">
                    {subscription.planPaymentMethodDetails}
                  </span>
                </div>
              </div>

              {/* Usage Stats Meter */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>Product Listing Capacity</span>
                  <span>
                    {subscription.usage?.products?.current || 0} / {subscription.planConfig?.maxProducts}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4ff4c] rounded-full"
                    style={{ width: `${subscription.usage?.products?.percent || 5}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BILLING CYCLE TOGGLE & REGIONAL GATEWAY INFO */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-6 text-center">
        <div className="flex items-center gap-2">
          {customerRegion === 'INDIA' ? (
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Razorpay Active: UPI AutoPay, RuPay, Visa, NetBanking & Instant GST Invoicing</span>
            </span>
          ) : (
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>Stripe Active: Global Credit/Debit Cards, Apple Pay & 135+ Currencies</span>
            </span>
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#191a1b]">
            Flexible Plans for Stores of Every Size
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
            Transparent pricing with zero hidden fees. Upgrade, downgrade, or switch anytime with instant difference calculation.
          </p>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 shadow-lg border border-slate-800 mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              billingCycle === 'ANNUAL'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              billingCycle === 'ANNUAL' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 4-TIER COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
        {tiers.map((tier) => {
          const id = tier.id.toUpperCase();
          const isCurrent = (currentPlanId || 'STARTER').toUpperCase() === id;
          const isAnnual = billingCycle === 'ANNUAL';
          const isIndian = customerRegion === 'INDIA';

          const price = isIndian
            ? isAnnual
              ? tier.priceAnnualInr
              : tier.priceMonthlyInr
            : isAnnual
            ? tier.priceAnnualUsd
            : tier.priceMonthlyUsd;

          const currentTier = tiers.find((t) => (currentPlanId || 'STARTER').toUpperCase() === t.id.toUpperCase()) || tiers[0];
          const currentPrice = isIndian
            ? isAnnual
              ? currentTier.priceAnnualInr
              : currentTier.priceMonthlyInr
            : isAnnual
            ? currentTier.priceAnnualUsd
            : currentTier.priceMonthlyUsd;

          const isUpgradeTier = !isCurrent && price > currentPrice && currentPrice > 0;
          const upgradeDiffPrice = isUpgradeTier ? Math.max(0, price - currentPrice) : price;
          const currencySymbol = isIndian ? '₹' : '$';

          // Specific Visual Theme for each Tier
          const isAgency = id === 'AGENCY';
          const isEnterprise = id === 'ENTERPRISE';
          const isGrowth = id === 'GROWTH';
          const isStarter = id === 'STARTER' || (tier.priceMonthlyInr === 0 && tier.priceMonthlyUsd === 0);

          return (
            <div
              key={tier.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative group ${
                isCurrent
                  ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/20 scale-[1.02] z-10'
                  : isAgency
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/40 hover:border-emerald-400 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1'
                  : isEnterprise
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/30 border border-purple-500/40 hover:border-purple-400 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1'
                  : isGrowth
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/30 border-2 border-blue-500/60 hover:border-blue-400 shadow-xl hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1'
                  : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Top Floating Badge */}
              {isCurrent ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/40 flex items-center gap-1.5 z-10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ Your Active Plan</span>
                </div>
              ) : isUpgradeTier ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 z-10 animate-bounce">
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Upgrade & Save {currencySymbol}{currentPrice.toLocaleString()}</span>
                </div>
              ) : isGrowth ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md z-10">
                  ⭐ Most Popular
                </div>
              ) : isEnterprise ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md z-10">
                  ⚡ Zero Fee & Scale
                </div>
              ) : isAgency ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md z-10">
                  👑 VIP Dedicated Cloud
                </div>
              ) : null}

              {/* Card Header & Icon */}
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
                        isAgency
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : isEnterprise
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : isGrowth
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {isAgency ? (
                          <Crown className="w-5 h-5 text-amber-300" />
                        ) : isEnterprise ? (
                          <Building className="w-5 h-5 text-purple-300" />
                        ) : isGrowth ? (
                          <Zap className="w-5 h-5 text-cyan-300" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-serif font-black text-white leading-tight">{tier.name}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {tier.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tier.description}</p>
                </div>

                {/* Price Display Card */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/50 border-emerald-500/40'
                    : isUpgradeTier
                    ? 'bg-indigo-950/40 border-indigo-500/40 shadow-inner'
                    : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
                      {currencySymbol}
                      {upgradeDiffPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      / {isAnnual ? 'year' : 'month'}
                    </span>
                  </div>

                  {/* Prorated Upgrade Pill */}
                  {isUpgradeTier && (
                    <div className="mt-2.5 pt-2 border-t border-indigo-500/30 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                        <span>Active Plan Credit:</span>
                        <span className="text-emerald-400">- {currencySymbol}{currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Original Price: <span className="line-through">{currencySymbol}{price.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Platform Fee & Gateway pill */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      {tier.transactionFeePercent === 0
                        ? '🎉 0% Platform Fee'
                        : `${tier.transactionFeePercent}% Platform Fee`}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-slate-400">
                      {isIndian ? '🇮🇳 Razorpay' : '🌍 Stripe'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
                    Plan Capabilities:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isAgency
                              ? 'bg-emerald-500 text-slate-950'
                              : isEnterprise
                              ? 'bg-purple-500 text-white'
                              : isGrowth
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight text-slate-200">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button: Dual Gateway / Free Switch */}
              <div className="pt-7">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-xs cursor-default flex items-center justify-center gap-2 shadow-inner"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ Currently Active Plan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => handleInitiatePlanUpgrade(tier)}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                      isStarter
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        : isUpgradeTier
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-indigo-500/30'
                        : isAgency
                        ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 shadow-emerald-500/30'
                        : isEnterprise
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:brightness-110 text-white shadow-purple-500/30'
                        : isGrowth
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white shadow-blue-500/30'
                        : 'bg-white text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    {isProcessingPayment && selectedPlanForPayment?.id === tier.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isStarter ? (
                      <>
                        <span>Activate Free Tier</span>
                        <Check className="w-4 h-4" />
                      </>
                    ) : isUpgradeTier ? (
                      <>
                        <span>Upgrade for {currencySymbol}{upgradeDiffPrice.toLocaleString()} (Difference Only)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : isIndian ? (
                      <>
                        <span>Subscribe with Razorpay ({currencySymbol}{price.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Subscribe with Stripe ({currencySymbol}{price.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BILLING & INVOICES HISTORY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#cbd5e0] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#191a1b] flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Subscription Invoices & Tax Receipts</span>
            </h3>
            <p className="text-xs text-slate-500">
              Official tax invoices and payment receipts with GST and International VAT breakdowns.
            </p>
          </div>
        </div>

        {subscription?.invoices && subscription.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan / Tier</th>
                  <th className="py-3 px-4">Billing Interval</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscription.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#191a1b]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(inv.paidAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#191a1b]">{inv.tierName}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500">{inv.billingCycle}</td>
                    <td className="py-3.5 px-4 font-bold text-[#191a1b]">
                      {inv.currency === 'INR' ? '₹' : '$'}
                      {inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.paymentMethod?.includes('STRIPE')
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {inv.paymentMethod?.includes('STRIPE') ? 'Stripe' : 'Razorpay'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForReceipt(inv)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer flex items-center justify-end gap-1 ml-auto"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No past invoices recorded yet. Once your plan upgrades or renews, tax invoices will appear here.
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* RAZORPAY CHECKOUT MODAL (FOR INDIAN CUSTOMERS)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isRazorpayModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            {/* Razorpay Header Bar */}
            <div className="bg-[#0c2340] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">Razorpay Secure Checkout</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                      🇮🇳 India
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    256-Bit Encrypted • UPI AutoPay • RuPay & Cards
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRazorpayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {razorpayStep === 'DETAILS' && (
                <form onSubmit={handleConfirmRazorpayPayment} className="space-y-5 text-xs">
                  {/* Order Summary Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 block">
                          {upgradeDetails?.isUpgradeDifference ? 'Subscription Upgrade (Prorated)' : 'Subscription Upgrade'}
                        </span>
                        <strong className="text-sm text-slate-900 font-bold">
                          {selectedPlanForPayment.name} ({billingCycle.toLowerCase()})
                        </strong>
                      </div>
                      <div className="text-right">
                        {upgradeDetails?.isUpgradeDifference ? (
                          <>
                            <span className="text-[11px] text-slate-400 line-through block">
                              Full Price: ₹{(upgradeDetails.originalAmount || 0).toLocaleString()}
                            </span>
                            <strong className="text-lg font-black text-emerald-800">
                              ₹{(upgradeDetails.upgradeDifference || 0).toLocaleString()}
                            </strong>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-500 block">Total Payable:</span>
                            <strong className="text-lg font-bold text-[#0c2340]">
                              ₹
                              {(billingCycle === 'ANNUAL'
                                ? selectedPlanForPayment.priceAnnualInr
                                : selectedPlanForPayment.priceMonthlyInr
                              ).toLocaleString()}
                            </strong>
                          </>
                        )}
                      </div>
                    </div>

                    {upgradeDetails?.isUpgradeDifference && (
                      <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] text-blue-950 font-bold">
                        <span>Active {upgradeDetails.currentPlanName || 'Plan'} Credit:</span>
                        <span className="text-emerald-700">- ₹{(upgradeDetails.creditedAmount || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">
                      Choose Razorpay Payment Channel:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRazorpayMethod('UPI')}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          razorpayMethod === 'UPI'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-base block mb-1">📱</span>
                        <span className="text-[11px] font-bold">UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRazorpayMethod('CARD')}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          razorpayMethod === 'CARD'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-base block mb-1">💳</span>
                        <span className="text-[11px] font-bold">Cards</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRazorpayMethod('NETBANKING')}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          razorpayMethod === 'NETBANKING'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-base block mb-1">🏛️</span>
                        <span className="text-[11px] font-bold">NetBanking</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Inputs based on Method */}
                  {razorpayMethod === 'UPI' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="block font-bold text-slate-700">
                        Enter UPI ID / VPA (Google Pay, PhonePe, Paytm, BHIM):
                      </label>
                      <input
                        type="text"
                        required
                        value={razorpayVpa}
                        onChange={(e) => setRazorpayVpa(e.target.value)}
                        placeholder="username@oksbi / username@paytm"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs"
                      />
                      <p className="text-[10px] text-slate-500">
                        💡 Collect request will be sent to your UPI app for instant mandate authorization.
                      </p>
                    </div>
                  )}

                  {razorpayMethod === 'CARD' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="block font-bold text-slate-700">
                        Card Number (RuPay, Visa, Mastercard):
                      </label>
                      <input
                        type="text"
                        required
                        value={razorpayCardNumber}
                        onChange={(e) => setRazorpayCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          defaultValue="08/29"
                          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                        />
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="CVV"
                          defaultValue="772"
                          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {razorpayMethod === 'NETBANKING' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="block font-bold text-slate-700">
                        Select Your Bank:
                      </label>
                      <select
                        value={razorpayBank}
                        onChange={(e) => setRazorpayBank(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                      >
                        <option value="HDFC">HDFC Bank</option>
                        <option value="SBI">State Bank of India (SBI)</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                        <option value="PNB">Punjab National Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRazorpayModalOpen(false)}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-[#0c2340] hover:bg-[#061527] text-[#d4ff4c] font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay with Razorpay</span>
                    </button>
                  </div>
                </form>
              )}

              {razorpayStep === 'AUTHORIZING' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">
                    Connecting to Razorpay Gateway...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Please approve the mandate or complete the authorization in your UPI app. Do not refresh this window.
                  </p>
                </div>
              )}

              {razorpayStep === 'SUCCESS' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Payment Verified Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your store has been upgraded to <strong>{selectedPlanForPayment.name}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRazorpayModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-[#d4ff4c] text-xs font-bold shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STRIPE CHECKOUT MODAL (FOR INTERNATIONAL CUSTOMERS)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isStripeModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            {/* Stripe Header Bar */}
            <div className="bg-[#635bff] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  💳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">Stripe Global Checkout</span>
                    <span className="px-1.5 py-0.2 rounded bg-white/20 text-white text-[10px] font-mono font-bold">
                      🌍 Global
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 font-sans">
                    PCI-DSS Level 1 Compliant • Apple Pay • Google Pay • 3D Secure
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStripeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {stripeStep === 'DETAILS' && (
                <form onSubmit={handleConfirmStripePayment} className="space-y-5 text-xs">
                  {/* 1-Click Apple Pay / Google Pay Express Button */}
                  <button
                    type="button"
                    onClick={handleConfirmStripePayment}
                    className="w-full py-3 px-4 bg-black hover:bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                  >
                    <span> Pay / GPay Express</span>
                  </button>

                  <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold">
                    <span className="h-px bg-slate-200 flex-1" />
                    <span>Or Pay with Credit / Debit Card</span>
                    <span className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Order Summary Box */}
                  <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-700 block">
                          {upgradeDetails?.isUpgradeDifference ? 'Subscription Plan Upgrade (Prorated)' : 'Subscription Plan'}
                        </span>
                        <strong className="text-sm text-slate-900 font-bold">
                          {selectedPlanForPayment.name} ({billingCycle.toLowerCase()})
                        </strong>
                      </div>
                      <div className="text-right">
                        {upgradeDetails?.isUpgradeDifference ? (
                          <>
                            <span className="text-[11px] text-slate-400 line-through block">
                              Full Price: ${(upgradeDetails.originalAmount || 0).toLocaleString()} USD
                            </span>
                            <strong className="text-lg font-black text-purple-900">
                              ${(upgradeDetails.upgradeDifference || 0).toLocaleString()} USD
                            </strong>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-500 block">Total Amount:</span>
                            <strong className="text-lg font-bold text-[#635bff]">
                              $
                              {(billingCycle === 'ANNUAL'
                                ? selectedPlanForPayment.priceAnnualUsd
                                : selectedPlanForPayment.priceMonthlyUsd
                              ).toLocaleString()}{' '}
                              USD
                            </strong>
                          </>
                        )}
                      </div>
                    </div>

                    {upgradeDetails?.isUpgradeDifference && (
                      <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between text-[11px] text-purple-950 font-bold">
                        <span>Active {upgradeDetails.currentPlanName || 'Plan'} Credit:</span>
                        <span className="text-emerald-700">- ${(upgradeDetails.creditedAmount || 0).toLocaleString()} USD</span>
                      </div>
                    )}
                  </div>

                  {/* Card Form */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={stripeCardNumber}
                        onChange={(e) => setStripeCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Expiration</label>
                        <input
                          type="text"
                          required
                          value={stripeExpiry}
                          onChange={(e) => setStripeExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={stripeCvc}
                          onChange={(e) => setStripeCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Country</label>
                        <select
                          value={stripeCountry}
                          onChange={(e) => setStripeCountry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                        >
                          <option value="United States (US)">United States (US)</option>
                          <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                          <option value="Canada (CA)">Canada (CA)</option>
                          <option value="Australia (AU)">Australia (AU)</option>
                          <option value="Germany (DE)">Germany (DE)</option>
                          <option value="Singapore (SG)">Singapore (SG)</option>
                          <option value="United Arab Emirates (AE)">UAE (AE)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ZIP / Postal</label>
                        <input
                          type="text"
                          required
                          value={stripeZip}
                          onChange={(e) => setStripeZip(e.target.value)}
                          placeholder="ZIP Code"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsStripeModalOpen(false)}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-[#635bff] hover:bg-[#534be0] text-white font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay with Stripe</span>
                    </button>
                  </div>
                </form>
              )}

              {stripeStep === 'AUTHORIZING' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">
                    Authorizing Payment with Stripe...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Secure 3D-Secure transaction in progress. Please wait a moment.
                  </p>
                </div>
              )}

              {stripeStep === 'SUCCESS' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Stripe Payment Successful!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your store subscription is now active on <strong>{selectedPlanForPayment.name}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsStripeModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#635bff] text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* INVOICE RECEIPT MODAL                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Tax Invoice Receipt #{selectedInvoiceForReceipt.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Store Name:</span>
                  <strong className="text-slate-900">{subscription?.storeName || 'OmniStore India'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Issued:</span>
                  <span className="text-slate-900 font-medium">
                    {new Date(selectedInvoiceForReceipt.paidAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoiceForReceipt.paymentMethod?.includes('STRIPE')
                      ? 'Stripe Global (USD)'
                      : 'Razorpay (INR ₹)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedInvoiceForReceipt.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between text-[11px]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-slate-900 font-medium">
                    <span>
                      {selectedInvoiceForReceipt.tierName} Plan ({selectedInvoiceForReceipt.billingCycle.toLowerCase()})
                    </span>
                    <span>
                      {selectedInvoiceForReceipt.currency === 'INR' ? '₹' : '$'}
                      {selectedInvoiceForReceipt.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Taxes (GST / VAT Included)</span>
                    <span>
                      {selectedInvoiceForReceipt.currency === 'INR' ? '₹' : '$'}0.00
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Paid</span>
                    <span>
                      {selectedInvoiceForReceipt.currency === 'INR' ? '₹' : '$'}
                      {selectedInvoiceForReceipt.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#191a1b] hover:bg-black text-[#d4ff4c] font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* UPDATE PAYMENT METHOD MODAL                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isPaymentMethodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Update Store Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentMethodModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePaymentMethod} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Method Type
                </label>
                <select
                  value={updatePaymentMethodType}
                  onChange={(e) => setUpdatePaymentMethodType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs"
                >
                  <optgroup label="🇮🇳 Indian Customers (Razorpay)">
                    <option value="RAZORPAY_UPI">Razorpay UPI Autopay</option>
                    <option value="RAZORPAY_CARD">Razorpay Credit/Debit Card</option>
                    <option value="NETBANKING">NetBanking Direct Mandate</option>
                  </optgroup>
                  <optgroup label="🌍 International Customers (Stripe)">
                    <option value="STRIPE_CARD">Stripe International Card</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account / VPA / Card Details *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. merchant@icici or Mastercard ending 8891"
                  value={updatePaymentMethodDetails}
                  onChange={(e) => setUpdatePaymentMethodDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentMethodModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPayment}
                  className="flex-1 py-3 rounded-2xl bg-[#191a1b] hover:bg-black text-[#d4ff4c] font-bold shadow-lg disabled:opacity-50 cursor-pointer"
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

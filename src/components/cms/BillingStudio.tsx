'use client';

import React, { useState, useEffect } from 'react';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';
import { PriceTierData, StoreSubscriptionData, StoreBillingInvoiceData, AiCreditStatsData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  Check,
  Wallet,
  Printer,
  Receipt,
  Crown,
  Flame,
  Bot,
  History,
  TrendingUp,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const loadPaypalScript = (clientId: string = 'sb', currency: string = 'USD'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).paypal) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('paypal-sdk-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const BillingStudio: React.FC = () => {
  const [subscription, setSubscription] = useState<StoreSubscriptionData | null>(null);
  const [tiers, setTiers] = useState<PriceTierData[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL' | 'ONE_TIME'>('MONTHLY');
  const [customerRegion, setCustomerRegion] = useState<'INDIA' | 'INTERNATIONAL'>('INDIA');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices' | 'usage'>('plans');

  // Invoices Pagination
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);

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

  // PayPal Checkout State (For International Customers)
  const [isPaypalModalOpen, setIsPaypalModalOpen] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string>('sb');
  const [paypalStep, setPaypalStep] = useState<'DETAILS' | 'AUTHORIZING' | 'SUCCESS'>('DETAILS');

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
    'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'PAYPAL' | 'NETBANKING'
  >('RAZORPAY_UPI');
  const [updatePaymentMethodDetails, setUpdatePaymentMethodDetails] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [aiCreditStats, setAiCreditStats] = useState<AiCreditStatsData | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [tiersRes, subRes, aiRes] = await Promise.all([
        cmsService.getPriceTiers(),
        cmsService.getStoreSubscription(),
        cmsService.getAiCredits(),
      ]);
      setTiers((tiersRes.tiers || []).filter((t: any) => t.id !== 'API'));
      setSubscription(subRes);
      setAiCreditStats(aiRes);
      if (subRes.billingCycle) {
        setBillingCycle(subRes.billingCycle as any);
      }
      if (subRes.planPaymentMethod?.includes('PAYPAL')) {
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
    if (
      tier.id.toUpperCase() === 'STARTER' ||
      (tier.priceMonthlyInr === 0 && tier.priceMonthlyUsd === 0)
    ) {
      setIsProcessingPayment(true);
      try {
        await cmsService.changeStorePlan({
          plan: 'STARTER',
          billingCycle,
          paymentMethod: 'FREE_TIER' as any,
          paymentMethodDetails: 'Free Starter Plan (No Payment Required)',
        });
        showToast(
          `🎉 Switched to ${tier.name}! (Free Tier Activated - No payment needed)`,
          'success',
        );
        await loadBillingData();
      } catch (err: any) {
        showToast(err?.message || 'Failed to activate Starter plan', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    if (customerRegion === 'INDIA') {
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

        const isLoaded = await loadRazorpayScript();
        if (isLoaded && typeof window !== 'undefined' && (window as any).Razorpay) {
          const rzpOptions = {
            key: orderData.keyId,
            amount: orderData.amountPaise,
            currency: orderData.currency || 'INR',
            name: 'OmniStore Cloud',
            description: `${tier.name} Plan Subscription (${billingCycle.toLowerCase()})`,
            image: 'https://cdn-icons-png.flaticon.com/512/888/888879.png',
            order_id: orderData.orderId,
            prefill: {
              name: orderData.storeName || '',
              email: orderData.contactEmail || '',
              contact: orderData.contactPhone || '',
            },
            notes: {
              plan: tier.id,
              billingCycle,
              storeId: (orderData as any).storeId,
            },
            theme: {
              color: '#0c2340',
            },
            handler: async function (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature?: string;
            }) {
              try {
                setIsProcessingPayment(true);
                const res = await cmsService.verifyBillingRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: tier.id as any,
                  billingCycle,
                  paymentMethodDetails: `Razorpay SDK Checkout (ID: ${response.razorpay_payment_id})`,
                });
                showToast(`🎉 ${res.message || 'Payment verified & plan upgraded successfully!'}`, 'success');
                await loadBillingData();
              } catch (err: any) {
                showToast(err?.message || 'Razorpay payment verification failed', 'error');
              } finally {
                setIsProcessingPayment(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsProcessingPayment(false);
              },
            },
          };
          const rzp = new (window as any).Razorpay(rzpOptions);
          rzp.on('payment.failed', function (resp: any) {
            showToast(resp.error?.description || 'Razorpay payment was cancelled or failed', 'error');
            setIsProcessingPayment(false);
          });
          rzp.open();
        } else {
          setRazorpayStep('DETAILS');
          setIsRazorpayModalOpen(true);
        }
      } catch (err: any) {
        showToast(err?.message || 'Failed to initialize Razorpay checkout', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      setIsProcessingPayment(true);
      try {
        const paypalData = await cmsService.createBillingPaypalOrder({
          plan: tier.id as any,
          billingCycle,
          currency: 'USD',
        });

        if (paypalData) {
          setPaypalOrderId(paypalData.orderId);
          setPaypalClientId(paypalData.clientId || 'sb');
          setUpgradeDetails({
            originalAmount: (paypalData as any).originalAmount,
            creditedAmount: (paypalData as any).creditedAmount,
            upgradeDifference: (paypalData as any).upgradeDifference || paypalData.amount,
            isUpgradeDifference: (paypalData as any).isUpgradeDifference,
            currentPlanName: (paypalData as any).currentPlanName,
          });
        }

        setPaypalStep('DETAILS');
        setIsPaypalModalOpen(true);
      } catch (err: any) {
        showToast(err?.message || 'Failed to initialize PayPal checkout', 'error');
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

  // Complete PayPal Payment (International Customer)
  const handleConfirmPaypalPayment = async (orderIdToCapture?: string) => {
    if (!selectedPlanForPayment) return;

    setPaypalStep('AUTHORIZING');
    try {
      let finalOrderId = orderIdToCapture || paypalOrderId;
      if (!finalOrderId) {
        const orderRes = await cmsService.createBillingPaypalOrder({
          plan: selectedPlanForPayment.id as any,
          billingCycle,
          currency: 'USD',
        });
        finalOrderId = orderRes.orderId;
      }

      const res = await cmsService.captureBillingPaypalOrder({
        orderId: finalOrderId,
        plan: selectedPlanForPayment.id as any,
        billingCycle,
        paymentMethodDetails: `PayPal Verified Account (${finalOrderId})`,
        currency: 'USD',
      });

      setPaypalStep('SUCCESS');
      showToast(`🎉 ${res.message || 'PayPal payment captured & plan upgraded successfully!'}`, 'success');
      await loadBillingData();
    } catch (err: any) {
      setPaypalStep('DETAILS');
      showToast(err?.message || 'PayPal payment confirmation failed', 'error');
    }
  };

  // Mount PayPal Buttons inside Modal when opened
  useEffect(() => {
    if (!isPaypalModalOpen || paypalStep !== 'DETAILS' || !selectedPlanForPayment) return;
    let isMounted = true;

    loadPaypalScript(paypalClientId, 'USD').then((loaded) => {
      if (!isMounted || !loaded || !(window as any).paypal) return;
      try {
        const container = document.getElementById('paypal-sdk-button-container');
        if (!container) return;
        container.innerHTML = '';
        (window as any).paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 44,
            },
            createOrder: async () => {
              if (paypalOrderId) return paypalOrderId;
              const res = await cmsService.createBillingPaypalOrder({
                plan: selectedPlanForPayment.id as any,
                billingCycle,
                currency: 'USD',
              });
              setPaypalOrderId(res.orderId);
              return res.orderId;
            },
            onApprove: async (data: any) => {
              await handleConfirmPaypalPayment(data.orderID || paypalOrderId || undefined);
            },
            onError: (err: any) => {
              console.warn('[PayPal SDK] Popup error or cancelled:', err);
            },
          })
          .render('#paypal-sdk-button-container');
      } catch (e) {
        console.warn('Could not mount PayPal SDK buttons:', e);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isPaypalModalOpen, paypalStep, paypalOrderId, paypalClientId, selectedPlanForPayment, billingCycle]);

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
  const isIndian = customerRegion === 'INDIA';
  const currencySymbol = isIndian ? '₹' : '$';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ─── 1. TOP HEADER & CURRENCY TOGGLE ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Billing & Subscription Studio
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
              Active Store
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground flex items-center gap-2.5 mt-1">
            <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span>Store Pricing Tiers & Billing</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Compare store pricing plans, switch billing frequency, and manage invoices.
          </p>
        </div>

        {/* Currency Switcher & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border p-1 rounded-2xl flex items-center shadow-xs">
            <button
              type="button"
              onClick={() => setCustomerRegion('INDIA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customerRegion === 'INDIA'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground'
              }`}
            >
              <span>🇮🇳</span>
              <span>₹ INR</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomerRegion('INTERNATIONAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customerRegion === 'INTERNATIONAL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground'
              }`}
            >
              <span>🌍</span>
              <span>$ USD</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadBillingData}
            className="p-2.5 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-accent text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-xs"
            title="Refresh subscription status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. ACTIVE SUBSCRIPTION EXECUTIVE SUMMARY ─────────────────── */}
      {subscription && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center font-black text-xl shrink-0">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-slate-900 dark:text-foreground">
                  {subscription.planConfig?.name || subscription.plan}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{subscription.planStatus || 'ACTIVE'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300">
                  {subscription.billingCycle === 'ONE_TIME' || subscription.billingCycle === 'LIFETIME' || subscription.isOneTime
                    ? 'Lifetime Deal'
                    : subscription.billingCycle === 'ANNUAL'
                      ? 'Annual Plan'
                      : 'Monthly Plan'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  {subscription.billingCycle === 'ONE_TIME' || !subscription.planRenewsAt
                    ? 'Lifetime Access • No renewals required'
                    : `Renews: ${new Date(subscription.planRenewsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
                <span>•</span>
                <span>Platform Fee: {subscription.planTransactionFeePercent ?? 0.0}%</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-border">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Products</div>
              <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                {subscription.usage?.products?.current || 0} / {subscription.planConfig?.maxProducts || 50}
              </div>
            </div>

            {aiCreditStats && (
              <div className="text-right hidden sm:block pl-3 border-l border-slate-200 dark:border-border">
                <div className="text-[10px] uppercase font-bold text-slate-400">AI Credits</div>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {aiCreditStats.aiCredits.toLocaleString()} left
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setUpdatePaymentMethodType((subscription.planPaymentMethod as any) || 'RAZORPAY_UPI');
                setUpdatePaymentMethodDetails(subscription.planPaymentMethodDetails || '');
                setIsPaymentMethodModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-accent/40 dark:hover:bg-accent border border-slate-200 dark:border-border text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Payment Method</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. TAB NAVIGATION ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-border pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-accent/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Pricing Plans & Tiers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-accent/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Invoices & Receipts ({subscription?.invoices?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'usage'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-accent/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Usage & AI Quotas</span>
        </button>
      </div>

      {/* ─── TAB 1: PRICING PLANS & TIERS ─────────────────────────────── */}
      {activeTab === 'plans' && (
        <div className="space-y-6 pt-2">
          {/* Billing Cycle Switcher */}
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-card border border-slate-200 dark:border-border shadow-xs flex-wrap justify-center gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-white dark:bg-accent text-slate-900 dark:text-foreground shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-foreground'
                }`}
              >
                Monthly Billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-white dark:bg-accent text-slate-900 dark:text-foreground shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-foreground'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200">
                  Save 20%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('ONE_TIME')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'ONE_TIME'
                    ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-foreground'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Lifetime Deal</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                  Pay Once ✨
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto pt-2">
            {tiers.map((tier) => {
              const id = tier.id.toUpperCase();
              const currentPlan = (currentPlanId || 'STARTER').toUpperCase();
              const activeCycle = subscription?.billingCycle || 'MONTHLY';
              const isCurrent = currentPlan === id && activeCycle === billingCycle;
              const isSwitchingCycleOnSamePlan = currentPlan === id && activeCycle !== billingCycle;
              const isOneTime = billingCycle === 'ONE_TIME';
              const isAnnual = billingCycle === 'ANNUAL';

              const price = isIndian
                ? isOneTime
                  ? (tier.priceOneTimeInr ?? (tier.priceAnnualInr ? Math.round(tier.priceAnnualInr * 2.2) : 0))
                  : isAnnual
                    ? tier.priceAnnualInr
                    : tier.priceMonthlyInr
                : isOneTime
                  ? (tier.priceOneTimeUsd ?? (tier.priceAnnualUsd ? Math.round(tier.priceAnnualUsd * 2.2) : 0))
                  : isAnnual
                    ? tier.priceAnnualUsd
                    : tier.priceMonthlyUsd;

              const currentTier =
                tiers.find((t) => currentPlan === t.id.toUpperCase()) || tiers[0];
              const currentPrice = isIndian
                ? activeCycle === 'ONE_TIME'
                  ? (currentTier.priceOneTimeInr ?? (currentTier.priceAnnualInr ? Math.round(currentTier.priceAnnualInr * 2.2) : 0))
                  : activeCycle === 'ANNUAL'
                    ? currentTier.priceAnnualInr
                    : currentTier.priceMonthlyInr
                : activeCycle === 'ONE_TIME'
                  ? (currentTier.priceOneTimeUsd ?? (currentTier.priceAnnualUsd ? Math.round(currentTier.priceAnnualUsd * 2.2) : 0))
                  : activeCycle === 'ANNUAL'
                    ? currentTier.priceAnnualUsd
                    : currentTier.priceMonthlyUsd;

              const isUpgradeTier = !isCurrent && price > currentPrice && currentPrice > 0;
              const upgradeDiffPrice = isUpgradeTier ? Math.max(0, price - currentPrice) : price;
              const monthlyEquivalent = isAnnual ? Math.round(price / 12) : price;

              const isGrowth = id === 'GROWTH' || id === 'PRO' || tier.popular;
              const isStarter = id === 'STARTER' || (tier.priceMonthlyInr === 0 && tier.priceMonthlyUsd === 0);

              return (
                <div
                  key={tier.id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                    isGrowth
                      ? 'border-2 border-indigo-600 bg-white dark:bg-card shadow-xl shadow-indigo-600/10'
                      : isCurrent
                        ? 'border-2 border-emerald-500 bg-white dark:bg-card shadow-lg shadow-emerald-500/10'
                        : 'border border-slate-200 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Top Floating Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 z-10 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Current Plan</span>
                    </div>
                  ) : isGrowth ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 z-10 whitespace-nowrap">
                      <Flame className="w-3 h-3 text-amber-300" />
                      <span>Most Popular</span>
                    </div>
                  ) : null}

                  {/* Header & Price */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-foreground">
                          {tier.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300">
                          {tier.badge || 'Tier'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
                        {tier.description}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="pt-2 pb-1 border-y border-slate-100 dark:border-border/60">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tight">
                          {currencySymbol}
                          {isStarter
                            ? '0'
                            : isOneTime
                              ? price.toLocaleString()
                              : isAnnual
                                ? monthlyEquivalent.toLocaleString()
                                : price.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {isStarter ? '/forever' : isOneTime ? '/lifetime' : '/month'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isStarter
                          ? 'Zero subscription costs forever'
                          : isOneTime
                            ? 'Pay once • Never renews'
                            : isAnnual
                              ? `Billed annually (${currencySymbol}${price.toLocaleString()}/yr)`
                              : 'Billed monthly, cancel anytime'}
                      </p>
                    </div>

                    {/* Key Specs Row */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200/60 dark:border-border/60">
                        <div className="font-bold text-slate-400">Products</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                          {tier.maxProducts > 10000 ? 'Unlimited' : tier.maxProducts.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200/60 dark:border-border/60">
                        <div className="font-bold text-slate-400">Fee</div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                          {tier.transactionFeePercent}%
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200/60 dark:border-border/60">
                        <div className="font-bold text-slate-400">AI Credits</div>
                        <div className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {tier.aiCreditsMonthly !== undefined
                            ? tier.aiCreditsMonthly.toLocaleString()
                            : isStarter
                              ? '100'
                              : isGrowth
                                ? '500'
                                : '2,500'}/mo
                        </div>
                      </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Included Features:
                      </span>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {tier.features.slice(0, 6).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="pt-6 mt-auto">
                    {isCurrent ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 rounded-xl bg-slate-100 dark:bg-accent text-slate-500 font-bold text-xs cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Active Plan</span>
                      </button>
                    ) : isSwitchingCycleOnSamePlan ? (
                      <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => handleInitiatePlanUpgrade(tier)}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isProcessingPayment && selectedPlanForPayment?.id === tier.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Switch to {isOneTime ? 'Lifetime' : isAnnual ? 'Annual (Save 20%)' : 'Monthly'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={() => handleInitiatePlanUpgrade(tier)}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          isGrowth
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : isStarter
                              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-accent dark:hover:bg-accent/80 text-slate-800 dark:text-slate-200'
                              : 'bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900'
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
                            <span>Upgrade for {currencySymbol}{upgradeDiffPrice.toLocaleString()}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Select {tier.name}</span>
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

          {/* Security & Guarantee Footer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-card border border-slate-200/80 dark:border-border text-center text-xs text-slate-500 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant Prorated Adjustments</span>
            </div>
            <span>•</span>
            <div>Zero lock-in — upgrade, downgrade, or switch billing cycles anytime.</div>
            <span>•</span>
            <div>Encrypted & PCI-DSS Compliant via Razorpay & PayPal</div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INVOICES & RECEIPTS ──────────────────────────────── */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 pt-2">
          {/* Active Payment Method Quick Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-accent flex items-center justify-center text-lg">
                {subscription?.planPaymentMethod?.includes('PAYPAL') ? '🅿️' : '💳'}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  Active Payment Method:{' '}
                  {subscription?.planPaymentMethod?.includes('PAYPAL') ? 'PayPal Verified' : 'UPI / Card'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {subscription?.planPaymentMethodDetails || 'No details on record'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setUpdatePaymentMethodType((subscription?.planPaymentMethod as any) || 'RAZORPAY_UPI');
                setUpdatePaymentMethodDetails(subscription?.planPaymentMethodDetails || '');
                setIsPaymentMethodModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 text-xs font-bold transition cursor-pointer"
            >
              Update Payment Method
            </button>
          </div>

          {/* Invoices Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Subscription Invoices & Tax Receipts</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official invoices with payment references and GST breakdowns.
                </p>
              </div>
              <TableRefreshButton onRefresh={loadBillingData} isLoading={isLoading} size="sm" />
            </div>

            {subscription?.invoices && subscription.invoices.length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-border text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Plan / Tier</th>
                        <th className="py-3 px-4">Billing Interval</th>
                        <th className="py-3 px-4">Amount Paid</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border/40 font-sans">
                      {subscription.invoices
                        .slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize)
                        .map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-accent/20 transition">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-foreground">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(inv.paidAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-foreground">
                              {inv.tierName}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-500">
                              {inv.billingCycle === 'ONE_TIME' || inv.billingCycle === 'LIFETIME'
                                ? 'Lifetime (Pay Once)'
                                : inv.billingCycle}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-foreground">
                              {inv.currency === 'INR' ? '₹' : '$'}
                              {inv.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                {inv.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForReceipt(inv)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
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

                <TablePagination
                  currentPage={invoicePage}
                  totalItems={subscription.invoices.length}
                  pageSize={invoicePageSize}
                  onPageChange={(p) => setInvoicePage(p)}
                  onPageSizeChange={(s) => {
                    setInvoicePageSize(s);
                    setInvoicePage(1);
                  }}
                  itemName="invoices"
                />
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No invoices recorded yet. Tax receipts will appear here after renewals or plan upgrades.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: USAGE & AI QUOTAS ─────────────────────────────────── */}
      {activeTab === 'usage' && (
        <div className="space-y-6 pt-2">
          {/* AI Credits Meter & Consumption */}
          {aiCreditStats && (
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                      AI Credits & Quota Balance
                    </h3>
                    <p className="text-xs text-slate-400">
                      Credits power storefront AI chatbots, AI search, and CMS Studio generators.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">Available Balance</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {aiCreditStats.aiCredits.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {aiCreditStats.aiCreditsTotal.toLocaleString()} credits
                    </span>
                  </span>
                </div>
              </div>

              {/* 3 Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/30 border border-slate-200/60 dark:border-border/60 space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Storefront Customer AI</span>
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-foreground">
                    {aiCreditStats.aiCreditsStorefrontUsed.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Live customer chatbot consultations & AI search.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/30 border border-slate-200/60 dark:border-border/60 space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>CMS Studio Admin AI</span>
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-foreground">
                    {aiCreditStats.aiCreditsCmsUsed.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Product copywriters, stock radar, and store builders.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/30 border border-slate-200/60 dark:border-border/60 space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Monthly Quota Used</span>
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-foreground">
                    {aiCreditStats.aiCreditsTotal > 0
                      ? Math.round((aiCreditStats.aiCreditsUsed / aiCreditStats.aiCreditsTotal) * 100)
                      : 0}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-accent h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{
                        width: `${aiCreditStats.aiCreditsTotal > 0 ? Math.min(100, Math.round((aiCreditStats.aiCreditsUsed / aiCreditStats.aiCreditsTotal) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent AI Activity */}
              {aiCreditStats.recentTransactions && aiCreditStats.recentTransactions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-border space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Recent Invocations</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {aiCreditStats.recentTransactions.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-accent/20 border border-slate-200/60 dark:border-border/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {tx.feature || tx.action}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                            <span className={tx.source === 'STOREFRONT' ? 'text-emerald-600' : 'text-purple-600'}>
                              {tx.source}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">
                          -{tx.credits} cr
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Platform Fee & Settlement Rules */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                  Platform Fee & Payout Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Transparent order processing fee based on your subscription tier.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white shadow-xs">
                Active Tier Fee: {subscription?.planTransactionFeePercent ?? 0.0}% / order
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-foreground">Free Starter</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">0% Fee</span>
                </div>
                <div className="text-xl font-black text-emerald-600">0.0%</div>
                <p className="text-[11px] text-slate-500">Zero subscription fee and zero platform transaction fees on orders.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-foreground">Growth Pro</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">0.5% Fee</span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-foreground">0.5%</div>
                <p className="text-[11px] text-slate-500">Reduced 0.5% fee. Includes custom domains and marketing automation.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-foreground">Scale Enterprise</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">0% Fee</span>
                </div>
                <div className="text-xl font-black text-emerald-600">0.0%</div>
                <p className="text-[11px] text-slate-500">Keep 100% of revenue with dedicated cloud infrastructure and API access.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MODALS (Checkout, Receipt Preview, Payment Method Update)  */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* UNIFIED RAZORPAY CHECKOUT MODAL */}
      {isRazorpayModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                  🔒
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">Secure Checkout</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      256-bit SSL
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    UPI • Debit / Credit Cards • NetBanking
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

            <div className="p-6 sm:p-8 space-y-6">
              {razorpayStep === 'DETAILS' && (
                <form onSubmit={handleConfirmRazorpayPayment} className="space-y-5 text-xs">
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 block">
                          Subscription Upgrade
                        </span>
                        <strong className="text-sm text-slate-900 font-bold">
                          {selectedPlanForPayment.name} ({billingCycle === 'ONE_TIME' ? 'Lifetime' : billingCycle.toLowerCase()})
                        </strong>
                      </div>
                      <div className="text-right">
                        {upgradeDetails?.isUpgradeDifference ? (
                          <>
                            <span className="text-[11px] text-slate-400 line-through block">
                              Full: ₹{(upgradeDetails.originalAmount || 0).toLocaleString()}
                            </span>
                            <strong className="text-lg font-black text-emerald-800">
                              ₹{(upgradeDetails.upgradeDifference || 0).toLocaleString()}
                            </strong>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-500 block">Total:</span>
                            <strong className="text-lg font-bold text-slate-900">
                              ₹
                              {(billingCycle === 'ONE_TIME'
                                ? (selectedPlanForPayment.priceOneTimeInr ?? (selectedPlanForPayment.priceAnnualInr ? Math.round(selectedPlanForPayment.priceAnnualInr * 2.2) : 0))
                                : billingCycle === 'ANNUAL'
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
                        <span className="text-emerald-700">
                          - ₹{(upgradeDetails.creditedAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">
                      Payment Method:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRazorpayMethod('UPI')}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          razorpayMethod === 'UPI'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm block">📲</span>
                        <span>UPI / QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRazorpayMethod('CARD')}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          razorpayMethod === 'CARD'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm block">💳</span>
                        <span>Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRazorpayMethod('NETBANKING')}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          razorpayMethod === 'NETBANKING'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm block">🏦</span>
                        <span>NetBanking</span>
                      </button>
                    </div>
                  </div>

                  {razorpayMethod === 'UPI' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        value={razorpayVpa}
                        onChange={(e) => setRazorpayVpa(e.target.value)}
                        placeholder="merchant@oksbi or 9876543210@paytm"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  )}

                  {razorpayMethod === 'CARD' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Card Number (Debit / Credit)
                      </label>
                      <input
                        type="text"
                        value={razorpayCardNumber}
                        onChange={(e) => setRazorpayCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  )}

                  {razorpayMethod === 'NETBANKING' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Select Primary Bank
                      </label>
                      <select
                        value={razorpayBank}
                        onChange={(e) => setRazorpayBank(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                      >
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="SBI">State Bank of India</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRazorpayModalOpen(false)}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-md cursor-pointer"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </form>
              )}

              {razorpayStep === 'AUTHORIZING' && (
                <div className="py-12 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">
                    Contacting Payment Gateway...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Please do not close this window. Authorizing transaction and provisioning subscription.
                  </p>
                </div>
              )}

              {razorpayStep === 'SUCCESS' && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-lg text-slate-900">
                    Subscription Upgraded Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your store has been unlocked with your new plan features and limits.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRazorpayModalOpen(false)}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED PAYPAL CHECKOUT MODAL */}
      {isPaypalModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                  🅿️
                </div>
                <div>
                  <span className="font-bold text-base text-white">PayPal International Checkout</span>
                  <p className="text-xs text-slate-300">
                    PayPal Wallet & Global Credit / Debit Cards
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaypalModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {paypalStep === 'DETAILS' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-700 block">
                        Subscription Plan
                      </span>
                      <strong className="text-sm text-slate-900">
                        {selectedPlanForPayment.name} ({billingCycle.toLowerCase()})
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Payable:</span>
                      <strong className="text-lg font-bold text-slate-900">
                        $
                        {(billingCycle === 'ONE_TIME'
                          ? (selectedPlanForPayment.priceOneTimeUsd ?? (selectedPlanForPayment.priceAnnualUsd ? Math.round(selectedPlanForPayment.priceAnnualUsd * 2.2) : 0))
                          : billingCycle === 'ANNUAL'
                          ? selectedPlanForPayment.priceAnnualUsd
                          : selectedPlanForPayment.priceMonthlyUsd
                        ).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div id="paypal-sdk-button-container" className="pt-2 min-h-[120px]" />

                  <button
                    type="button"
                    onClick={() => handleConfirmPaypalPayment()}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Simulate PayPal Capture (Sandbox)
                  </button>
                </div>
              )}

              {paypalStep === 'AUTHORIZING' && (
                <div className="py-10 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">Capturing PayPal Order...</h4>
                </div>
              )}

              {paypalStep === 'SUCCESS' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-base text-slate-900">PayPal Payment Approved!</h4>
                  <button
                    type="button"
                    onClick={() => setIsPaypalModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INVOICE RECEIPT PREVIEW MODAL */}
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
                  <strong className="text-slate-900">
                    {subscription?.storeName || 'OmniStore India'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Issued:</span>
                  <span className="text-slate-900 font-medium">
                    {new Date(selectedInvoiceForReceipt.paidAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Currency:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoiceForReceipt.currency === 'USD' ? 'USD ($)' : 'INR (₹)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedInvoiceForReceipt.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between text-[11px]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-slate-900 font-medium">
                    <span>
                      {selectedInvoiceForReceipt.tierName} Plan (
                      {selectedInvoiceForReceipt.billingCycle === 'ONE_TIME' || selectedInvoiceForReceipt.billingCycle === 'LIFETIME'
                        ? 'Lifetime Deal'
                        : selectedInvoiceForReceipt.billingCycle.toLowerCase()})
                    </span>
                    <span>
                      {selectedInvoiceForReceipt.currency === 'INR' ? '₹' : '$'}
                      {selectedInvoiceForReceipt.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Taxes (GST Included)</span>
                    <span>{selectedInvoiceForReceipt.currency === 'INR' ? '₹' : '$'}0.00</span>
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
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE PAYMENT METHOD MODAL */}
      {isPaymentMethodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update Store Payment Method</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Payment Method Type</label>
                <select
                  value={updatePaymentMethodType}
                  onChange={(e) => setUpdatePaymentMethodType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs"
                >
                  <optgroup label="🇮🇳 INR — Indian Payments">
                    <option value="RAZORPAY_UPI">UPI Autopay (Google Pay, PhonePe, Paytm)</option>
                    <option value="RAZORPAY_CARD">Debit / Credit Card (RuPay, Visa, Mastercard)</option>
                    <option value="NETBANKING">NetBanking Direct Mandate</option>
                  </optgroup>
                  <optgroup label="🌍 USD — International Payments">
                    <option value="PAYPAL">PayPal Verified Account</option>
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
                  className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
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

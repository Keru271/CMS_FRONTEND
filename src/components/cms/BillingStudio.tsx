'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
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
  Code2,
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
  ChevronDown,
  ChevronLeft,
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
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [customerRegion, setCustomerRegion] = useState<'INDIA' | 'INTERNATIONAL'>('INDIA');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Pricing Carousel State
  const [activePricingSlide, setActivePricingSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    skipSnaps: false,
    containScroll: 'trimSnaps',
  });

  const onSelectSlide = useCallback(() => {
    if (!emblaApi) return;
    setActivePricingSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelectSlide);
    emblaApi.on('reInit', onSelectSlide);
    return () => {
      emblaApi.off('select', onSelectSlide);
      emblaApi.off('reInit', onSelectSlide);
    };
  }, [emblaApi, onSelectSlide]);

  const handleSlideChange = (idx: number) => {
    setActivePricingSlide(idx);
    if (emblaApi) {
      emblaApi.scrollTo(idx);
    }
  };

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
  const [razorpayStep, setRazorpayStep] = useState<'DETAILS' | 'AUTHORIZING' | 'SUCCESS'>(
    'DETAILS',
  );

  // PayPal Checkout State (For International Customers)
  const [isPaypalModalOpen, setIsPaypalModalOpen] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string>('sb');
  const [paypalStep, setPaypalStep] = useState<'DETAILS' | 'AUTHORIZING' | 'SUCCESS'>('DETAILS');

  // Invoice Receipt Preview Modal
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] =
    useState<StoreBillingInvoiceData | null>(null);

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

  useEffect(() => {
    loadBillingData();
  }, []);

  const [isProcessingApiTier, setIsProcessingApiTier] = useState(false);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [tiersRes, subRes] = await Promise.all([
        cmsService.getPriceTiers(),
        cmsService.getStoreSubscription(),
      ]);
      setTiers((tiersRes.tiers || []).filter((t: any) => t.id !== 'API'));
      setSubscription(subRes);
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

  const handleSubscribeApiTier = async () => {
    setIsProcessingApiTier(true);
    try {
      const res = await cmsService.subscribeApiTier({
        paymentMethod: customerRegion === 'INDIA' ? 'RAZORPAY_UPI' : 'PAYPAL',
      });
      showToast(`🎉 ${res.message}`, 'success');
      await loadBillingData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to activate API Tier', 'error');
    } finally {
      setIsProcessingApiTier(false);
    }
  };

  const handleCancelApiTier = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel the API Tier? Developer API access will be deactivated, but your base store plan remains unaffected.',
      )
    )
      return;
    setIsProcessingApiTier(true);
    try {
      const res = await cmsService.cancelApiTier();
      showToast(`ℹ️ ${res.message}`, 'success');
      await loadBillingData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel API Tier', 'error');
    } finally {
      setIsProcessingApiTier(false);
    }
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
        const res = await cmsService.changeStorePlan({
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
      // Razorpay Flow for Paid Tiers (Live Orders API & Razorpay Checkout SDK)
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
            name: 'Statamic CMS SaaS',
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
          // Fallback to built-in simulation modal
          setRazorpayStep('DETAILS');
          setIsRazorpayModalOpen(true);
        }
      } catch (err: any) {
        showToast(err?.message || 'Failed to initialize Razorpay checkout', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    } else {
      // International Flow: PayPal (1-Click & Pay in 4)
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5e5a5a]">
              SaaS Billing & Subscriptions
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4ff4c] text-[#191a1b]">
              Secure Payments Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#191a1b] flex items-center gap-3 mt-1">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
            <span>Store Pricing Tiers & Billing</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upgrade, downgrade, or switch billing cycles anytime — with instant prorated adjustment.
          </p>
        </div>

        {/* Currency Region Switcher & Refresh */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle: ₹ INR vs $ USD */}
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
              <span>₹ INR</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomerRegion('INTERNATIONAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customerRegion === 'INTERNATIONAL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-[#5e5a5a] hover:text-[#191a1b]'
              }`}
            >
              <span>🌍</span>
              <span>$ USD</span>
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
                  <span>
                    Platform Fee: {subscription.planTransactionFeePercent}% per transaction
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Card — gateway identity intentionally abstracted */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-3 w-full lg:w-80 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Payment Method</span>
                <button
                  type="button"
                  onClick={() => {
                    setUpdatePaymentMethodType(
                      (subscription.planPaymentMethod as any) || 'RAZORPAY_UPI',
                    );
                    setUpdatePaymentMethodDetails(subscription.planPaymentMethodDetails || '');
                    setIsPaymentMethodModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#d4ff4c] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                  {subscription.planPaymentMethod?.includes('PAYPAL') ? '🅿️' : '📲'}
                </div>
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <span>
                      {subscription.planPaymentMethod?.includes('PAYPAL')
                        ? 'PayPal Verified'
                        : 'UPI / Debit Card'}
                    </span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20 text-emerald-300">
                      {subscription.planPaymentMethod?.includes('PAYPAL') ? 'USD' : 'INR'}
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
                    {subscription.usage?.products?.current || 0} /{' '}
                    {subscription.planConfig?.maxProducts}
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

      {/* PLATFORM FEE RULES & SETTLEMENT LEDGER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-foreground">
                Platform Fee & Payout Engine
              </h3>
              <p className="text-xs text-slate-400">
                Transparent transaction processing fees per order based on your active tier.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Active Tier Fee:
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white shadow-xs">
              {subscription?.planTransactionFeePercent ?? 2.0}% / order
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Starter Tier */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              (subscription?.plan || 'STARTER').toUpperCase() === 'STARTER'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                : 'border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-foreground">
                Free Starter Pack
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-300">
                Free Forever
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-foreground">2.0%</span>
              <span className="text-xs text-slate-400 ml-1">platform fee / order</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              No monthly subscription cost. Platform fee is automatically calculated at checkout.
            </p>
          </div>

          {/* Growth Pro Tier */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              (subscription?.plan || '').toUpperCase() === 'GROWTH'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                : 'border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-foreground">
                Growth Pro
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200">
                Popular
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-foreground">0.5%</span>
              <span className="text-xs text-slate-400 ml-1">reduced fee / order</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              75% fee savings compared to Starter. Includes custom domains and marketing automation.
            </p>
          </div>

          {/* Enterprise Tier */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              (subscription?.plan || '').toUpperCase() === 'ENTERPRISE'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                : 'border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-foreground">
                Scale Enterprise
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                0% Fee
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0.0%</span>
              <span className="text-xs text-slate-400 ml-1">zero platform fees</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Keep 100% of your store revenue with dedicated cloud infrastructure and API access.
            </p>
          </div>
        </div>
      </div>

      {/* BILLING CYCLE TOGGLE & PAYMENT STATUS INFO */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-6 text-center">
        <div className="flex items-center gap-2">
          {customerRegion === 'INDIA' ? (
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                ₹ INR Pricing • UPI AutoPay, Debit Cards, NetBanking & Instant GST Invoicing
              </span>
            </span>
          ) : (
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>$ USD Pricing • International Cards, Apple Pay, Google Pay & 135+ Currencies</span>
            </span>
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#191a1b]">
            Transparent Pricing for Every Stage of Growth
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
            Choose the plan that fits your business needs. Upgrade, downgrade, or cancel anytime
            with instant prorated calculation.
          </p>
        </div>

        {/* Monthly vs Annual Toggle (Refero Segmented Pill) */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#edf0f5] border border-[#e2e8f0] shadow-xs mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'ANNUAL'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-600 border border-rose-200">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* PRICING CAROUSEL */}
      {tiers.length > 0 && (
        <div className="space-y-4 pt-4">
          {/* Embla Carousel Viewport */}
          <div ref={emblaRef} className="overflow-hidden py-2 cursor-grab active:cursor-grabbing">
            <div className="flex gap-5 -ml-1">
              {tiers.map((tier) => {
                const id = tier.id.toUpperCase();
                const currentPlanId = subscription?.plan || 'STARTER';
                const activeCycle = subscription?.billingCycle || 'MONTHLY';
                const isCurrentPlanAndCycle = currentPlanId.toUpperCase() === id && activeCycle === billingCycle;
                const isSwitchingCycleOnSamePlan = currentPlanId.toUpperCase() === id && activeCycle !== billingCycle;
                const isCurrent = isCurrentPlanAndCycle;
                const isAnnual = billingCycle === 'ANNUAL';
                const isIndian = customerRegion === 'INDIA';

                const price = isIndian
                  ? isAnnual
                    ? tier.priceAnnualInr
                    : tier.priceMonthlyInr
                  : isAnnual
                    ? tier.priceAnnualUsd
                    : tier.priceMonthlyUsd;

                const currentTier =
                  tiers.find(
                    (t) => (currentPlanId || 'STARTER').toUpperCase() === t.id.toUpperCase(),
                  ) || tiers[0];
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
                const monthlyEquivalent = isAnnual ? Math.round(price / 12) : price;

                const isGrowth = id === 'GROWTH' || id === 'PRO' || tier.popular;
                const isEnterprise = id === 'ENTERPRISE';
                const isAgency = id === 'AGENCY';
                const isStarter =
                  id === 'STARTER' || (tier.priceMonthlyInr === 0 && tier.priceMonthlyUsd === 0);

                return (
                  <div
                    key={tier.id}
                    className="flex-[0_0_100%] sm:flex-[0_0_80%] md:flex-[0_0_48%] lg:flex-[0_0_31%] min-w-0 pl-1"
                  >
                    <div
                      className={`rounded-[26px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative group h-full min-h-[520px] ${
                        isGrowth
                          ? 'border-2 border-[#ff4893] bg-gradient-to-b from-[#fff9f6] via-[#fff1f6] to-[#fdf2f8] shadow-xl shadow-rose-500/10 hover:-translate-y-1'
                          : isCurrent
                            ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                            : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-1'
                      }`}
                    >
                      {/* Top Floating Badge */}
                      {isCurrent ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 z-10 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Plan ({activeCycle.toLowerCase()})</span>
                        </div>
                      ) : isSwitchingCycleOnSamePlan ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 z-10 whitespace-nowrap">
                          <Sparkles className="w-3 h-3 text-amber-200" />
                          <span>Switch to {billingCycle.toLowerCase()}</span>
                        </div>
                      ) : isUpgradeTier ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 z-10 whitespace-nowrap">
                          <Flame className="w-3 h-3 text-amber-200 fill-amber-200" />
                          <span>
                            Upgrade & Save {currencySymbol}
                            {currentPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : null}

                      {/* Card Header & Content */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              className={`text-sm font-black italic tracking-wider uppercase ${
                                isGrowth
                                  ? 'bg-gradient-to-r from-[#ff5722] via-[#ff4081] to-[#d946ef] bg-clip-text text-transparent'
                                  : isEnterprise
                                    ? 'text-purple-700'
                                    : isAgency
                                      ? 'text-slate-900'
                                      : 'text-slate-500'
                              }`}
                            >
                              {tier.badge || tier.name}
                            </span>
                            {isGrowth && !isCurrent && (
                              <span className="text-[11px] font-extrabold text-rose-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-rose-500" />
                                <span>Best Value</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed min-h-[36px] line-clamp-2">
                            {tier.description}
                          </p>
                        </div>

                        {/* Savings Callout Pill */}
                        {isAnnual && !isStarter && (
                          <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <span>Save 20% on Annual Plan</span>
                            <span>✨</span>
                          </div>
                        )}

                        {/* Price Display */}
                        <div className="py-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                              {currencySymbol}
                              {isStarter ? '0' : isAnnual ? monthlyEquivalent.toLocaleString() : upgradeDiffPrice.toLocaleString()}
                            </span>
                            <span className="text-xl sm:text-2xl font-serif italic text-slate-500 font-normal">
                              /month
                            </span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 mt-1">
                            {isStarter
                              ? 'Free to use'
                              : isAnnual
                                ? `${currencySymbol}${price.toLocaleString()} billed annually (${currencySymbol}${monthlyEquivalent.toLocaleString()}/mo)`
                                : 'Billed monthly'}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-200/80 w-full" />

                        {/* Features List */}
                        <div className="space-y-2.5 pt-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            What&apos;s Included:
                          </span>
                          <ul className="space-y-2.5 text-xs text-slate-700">
                            {tier.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 leading-snug">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                    isGrowth
                                      ? 'bg-rose-100 text-rose-600'
                                      : isEnterprise
                                        ? 'bg-purple-100 text-purple-700'
                                        : isAgency
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <span className="text-slate-700 font-medium">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 mt-auto">
                        {isCurrentPlanAndCycle ? (
                          <button
                            type="button"
                            disabled
                            className="w-full py-3.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs cursor-default flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Current Plan</span>
                          </button>
                        ) : isSwitchingCycleOnSamePlan ? (
                          <button
                            type="button"
                            disabled={isProcessingPayment}
                            onClick={() => handleInitiatePlanUpgrade(tier)}
                            className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            {isProcessingPayment && selectedPlanForPayment?.id === tier.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : isAnnual ? (
                              <>
                                <span>Switch to Annual (Save 20%)</span>
                                <Sparkles className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>Switch to Monthly</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isProcessingPayment}
                            onClick={() => handleInitiatePlanUpgrade(tier)}
                            className={`w-full py-3.5 rounded-full font-bold text-xs transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                              isGrowth
                                ? 'bg-black text-white hover:bg-slate-800 shadow-md shadow-black/20'
                                : isStarter
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  : 'bg-slate-900 text-white hover:bg-black'
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
                                <span>
                                  Upgrade for {currencySymbol}
                                  {upgradeDiffPrice.toLocaleString()}
                                </span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>Upgrade Now</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Pagination & Indicator Dots */}
          <div className="flex items-center justify-between pt-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 font-mono">
                Slide {activePricingSlide + 1} of {tiers.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {tiers.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSlideChange(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      activePricingSlide === idx
                        ? 'w-6 h-2 bg-slate-900 dark:bg-white'
                        : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    title={`Go to ${t.badge || t.name}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    if (emblaApi && emblaApi.canScrollPrev()) {
                      emblaApi.scrollPrev();
                    } else {
                      handleSlideChange((activePricingSlide - 1 + tiers.length) % tiers.length);
                    }
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  title="Previous Plan"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (emblaApi && emblaApi.canScrollNext()) {
                      emblaApi.scrollNext();
                    } else {
                      handleSlideChange((activePricingSlide + 1) % tiers.length);
                    }
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  title="Next Plan"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DEVELOPER API TIER ADD-ON (1,000/mo) ────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/40 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Developer API Add-on Tier
              </span>
              {subscription?.apiPlanActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active • API Access Unlocked
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-bold text-[11px] border border-slate-700">
                  Not Subscribed
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>API Tier (1,000 / month)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                The API Tier is a dedicated add-on exclusively for Developer API access. Purchasing
                it unlocks the entire{' '}
                <code className="text-indigo-400 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60">
                  /api/v1/*
                </code>{' '}
                REST engine, API keys, and Webhooks{' '}
                <strong>without altering your current base plan</strong> (your store remains on{' '}
                {subscription?.planConfig?.name || subscription?.plan || 'Starter'}).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full /api/v1 Storefront REST Catalog</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Public Storefront Keys (pk_live_...)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-Time Webhooks & HMAC Signatures</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Preserves Current Base Store Quotas</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 shrink-0">
            <div>
              <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                Add-on Price
              </div>
              <div className="text-3xl font-black text-white mt-0.5">
                {customerRegion === 'INDIA' ? '₹1,000' : '$1,000'}
                <span className="text-xs font-normal text-slate-400"> / month</span>
              </div>
              {subscription?.apiPlanActive && subscription.apiPlanRenewsAt && (
                <div className="text-[11px] text-emerald-300 mt-1">
                  Renews: {new Date(subscription.apiPlanRenewsAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {subscription?.apiPlanActive ? (
                <button
                  type="button"
                  disabled={isProcessingApiTier}
                  onClick={handleCancelApiTier}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingApiTier ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Cancel API Add-on</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProcessingApiTier}
                  onClick={handleSubscribeApiTier}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isProcessingApiTier ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-amber-300" />
                      <span>Activate API Tier (1,000/mo)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
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
              Official tax invoices and payment receipts with GST breakdowns.
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
                  <th className="py-3 px-4">Currency</th>
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        {inv.currency || 'INR'}
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
            No past invoices recorded yet. Once your plan upgrades or renews, tax invoices will
            appear here.
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* UNIFIED SECURE CHECKOUT MODAL (Gateway abstracted on backend)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isRazorpayModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            {/* Secure Checkout Header — gateway name intentionally not shown */}
            <div className="bg-[#191a1b] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                  🔒
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">Secure Checkout</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#d4ff4c]/20 text-[#d4ff4c] text-[10px] font-mono font-bold">
                      256-bit SSL
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    UPI • Debit / Credit Cards • NetBanking • International Cards
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
                          {upgradeDetails?.isUpgradeDifference
                            ? 'Subscription Upgrade (Prorated)'
                            : 'Subscription Upgrade'}
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
                        <span className="text-emerald-700">
                          - ₹{(upgradeDetails.creditedAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">
                      Choose Payment Method:
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
                        💡 Collect request will be sent to your UPI app for instant mandate
                        authorization.
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
                      <label className="block font-bold text-slate-700">Select Your Bank:</label>
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
                      className="flex-1 py-3 rounded-2xl bg-[#191a1b] hover:bg-black text-[#d4ff4c] font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay Now</span>
                    </button>
                  </div>
                </form>
              )}

              {razorpayStep === 'AUTHORIZING' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-transparent animate-spin mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">
                    Processing Payment...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Please complete the authorization in your payment app. Do not
                    refresh this window.
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
                    className="px-6 py-2.5 rounded-xl bg-[#191a1b] text-[#d4ff4c] text-xs font-bold shadow-md cursor-pointer"
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
      {/* SECURE PAYPAL INTERNATIONAL CHECKOUT MODAL ($ USD)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isPaypalModalOpen && selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            {/* Header */}
            <div className="bg-[#003087] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                  🅿️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">PayPal International Checkout</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#FFC439] text-[#003087] text-[10px] font-mono font-bold">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 font-sans">
                    PayPal 1-Click • Pay Later (Pay in 4) • Debit / Credit Card
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

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {paypalStep === 'DETAILS' && (
                <div className="space-y-5 text-xs">
                  {/* Order Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 block">
                          {upgradeDetails?.isUpgradeDifference
                            ? 'Subscription Plan Upgrade (Prorated)'
                            : 'Subscription Plan'}
                        </span>
                        <strong className="text-sm text-slate-900 font-bold">
                          {selectedPlanForPayment.name} ({billingCycle.toLowerCase()})
                        </strong>
                      </div>
                      <div className="text-right">
                        {upgradeDetails?.isUpgradeDifference ? (
                          <>
                            <span className="text-[11px] text-slate-400 line-through block">
                              Full Price: ${(upgradeDetails.originalAmount || 0).toLocaleString()}{' '}
                              USD
                            </span>
                            <strong className="text-lg font-black text-emerald-800">
                              ${(upgradeDetails.upgradeDifference || 0).toLocaleString()} USD
                            </strong>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-500 block">Total Payable:</span>
                            <strong className="text-lg font-bold text-slate-900">
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
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-700 font-bold">
                        <span>Active {upgradeDetails.currentPlanName || 'Plan'} Credit:</span>
                        <span className="text-emerald-700">
                          - ${(upgradeDetails.creditedAmount || 0).toLocaleString()} USD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PayPal Payment Action Buttons */}
                  <div className="space-y-4">
                    {/* Official PayPal SDK Buttons Container */}
                    <div id="paypal-sdk-button-container" className="min-h-[44px]" />

                    {/* Quick 1-Click Fallback Button */}
                    <button
                      type="button"
                      onClick={() => handleConfirmPaypalPayment()}
                      className="w-full py-3.5 px-4 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                      <span className="font-extrabold italic text-base">Pay</span>
                      <span className="font-extrabold italic text-base text-[#0079C1]">Pal</span>
                      <span className="text-xs font-bold text-slate-800 ml-1">
                        — 1-Click Checkout ($
                        {(upgradeDetails?.upgradeDifference ||
                          (billingCycle === 'ANNUAL'
                            ? selectedPlanForPayment.priceAnnualUsd
                            : selectedPlanForPayment.priceMonthlyUsd)
                        ).toLocaleString()}{' '}
                        USD)
                      </span>
                    </button>

                    {/* PayPal Pay Later / Pay in 4 Button */}
                    <button
                      type="button"
                      onClick={() => handleConfirmPaypalPayment()}
                      className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#003087] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
                    >
                      <span>🅿️ Pay Later with Pay in 4 (Interest-Free)</span>
                    </button>

                    {/* PayPal Trust and Guarantee Badges */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5 text-slate-600">
                      <div className="flex items-center gap-2 font-bold text-blue-900 text-[11px]">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>PayPal Buyer Protection Guaranteed</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Your international subscription is backed by 24/7 PayPal fraud prevention, zero liability protection, and encrypted transactions.
                      </p>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPaypalModalOpen(false)}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmPaypalPayment()}
                        className="flex-1 py-3 rounded-2xl bg-[#003087] hover:bg-[#002569] text-white font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Authorize PayPal</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paypalStep === 'AUTHORIZING' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-[#003087] border-t-transparent animate-spin mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">
                    Processing PayPal Payment...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Secure authorization in progress with PayPal. Please wait a moment.
                  </p>
                </div>
              )}

              {paypalStep === 'SUCCESS' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
                  <p className="text-xs text-slate-500">
                    Your store subscription is now active on{' '}
                    <strong>{selectedPlanForPayment.name}</strong> via PayPal.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPaypalModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#191a1b] text-[#d4ff4c] text-xs font-bold shadow-md cursor-pointer"
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

              {/* Line items table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between text-[11px]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-slate-900 font-medium">
                    <span>
                      {selectedInvoiceForReceipt.tierName} Plan (
                      {selectedInvoiceForReceipt.billingCycle.toLowerCase()})
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
                    <option value="RAZORPAY_CARD">Debit / Credit Card (RuPay, Visa)</option>
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

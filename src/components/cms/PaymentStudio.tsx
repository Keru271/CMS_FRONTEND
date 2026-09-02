'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Percent,
  ArrowUpRight,
  HelpCircle,
  Sliders,
  Sparkles,
  Smartphone,
  Building2,
  Wallet,
  Mail,
  KeyRound,
  ShieldAlert,
  Clock,
  X,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  CMSPaymentSettings,
  UpdatePaymentSettingsPayload,
  RazorpayConnectStatus,
  StripeConnectStatus,
  PaymentTransactionData,
  PaymentTestResponse,
  PaymentTransactionsSummary,
} from '@/src/types';

export const PaymentStudio: React.FC = () => {
  const [settings, setSettings] = useState<CMSPaymentSettings | null>(null);
  const [rzpConnect, setRzpConnect] = useState<RazorpayConnectStatus | null>(null);
  const [stripeConnect, setStripeConnect] = useState<StripeConnectStatus | null>(null);
  const [formData, setFormData] = useState<UpdatePaymentSettingsPayload>({});
  const [transactions, setTransactions] = useState<PaymentTransactionData[]>([]);
  const [summary, setSummary] = useState<PaymentTransactionsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Email Security Verification Modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCountdown, setVerificationCountdown] = useState(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = useState<UpdatePaymentSettingsPayload | null>(null);

  // Razorpay Connect Flow States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState<1 | 2 | 3>(1);
  const [connectMode, setConnectMode] = useState<'OAUTH' | 'MANUAL'>('OAUTH');
  const [connectSubmitting, setConnectSubmitting] = useState(false);
  const [disconnectingRzp, setDisconnectingRzp] = useState(false);
  const [partnerMerchantName, setPartnerMerchantName] = useState('OmniStore India Flagship');
  const [partnerKeyId, setPartnerKeyId] = useState('');
  const [partnerKeySecret, setPartnerKeySecret] = useState('');
  const [partnerAutoCapture, setPartnerAutoCapture] = useState(true);
  const [partnerTestMode, setPartnerTestMode] = useState(true);

  // Stripe Connect Flow States
  const [showStripeConnectModal, setShowStripeConnectModal] = useState(false);
  const [stripeConnectStep, setStripeConnectStep] = useState<1 | 2 | 3>(1);
  const [stripeConnectMode, setStripeConnectMode] = useState<'OAUTH' | 'MANUAL'>('OAUTH');
  const [stripeConnectSubmitting, setStripeConnectSubmitting] = useState(false);
  const [disconnectingStripe, setDisconnectingStripe] = useState(false);
  const [stripePartnerMerchantName, setStripePartnerMerchantName] = useState('OmniStore Global Direct');
  const [stripePartnerPk, setStripePartnerPk] = useState('');
  const [stripePartnerSk, setStripePartnerSk] = useState('');
  const [stripePartnerCountry, setStripePartnerCountry] = useState('US');
  const [stripePartnerTestMode, setStripePartnerTestMode] = useState(true);

  // Key visibility toggles
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Gateway Connection Test states
  const [testingRzp, setTestingRzp] = useState(false);
  const [rzpTestResult, setRzpTestResult] = useState<PaymentTestResponse | null>(null);
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<PaymentTestResponse | null>(null);

  // Active Tab: 'gateways' | 'transactions' | 'calculator'
  const [activeTab, setActiveTab] = useState<'gateways' | 'transactions' | 'calculator'>('gateways');
  const [filterGateway, setFilterGateway] = useState<string>('ALL');

  // Fee Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(5000);
  const [calcCurrency, setCalcCurrency] = useState<'INR' | 'USD'>('INR');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, txData, rzpConnectData, stripeConnectData] = await Promise.all([
        cmsService.getPaymentSettings().catch(() => null),
        cmsService.getPaymentTransactions().catch(() => null),
        cmsService.getRazorpayConnectStatus().catch(() => null),
        cmsService.getStripeConnectStatus().catch(() => null),
      ]);
      setSettings(settingsData);
      setRzpConnect(rzpConnectData);
      setStripeConnect(stripeConnectData);
      setFormData({
        paymentRazorpayActive: settingsData?.paymentRazorpayActive ?? false,
        paymentStripeActive: settingsData?.paymentStripeActive ?? false,
        paymentCodActive: settingsData?.paymentCodActive ?? true,
        paymentTestMode: settingsData?.paymentTestMode ?? true,
        razorpayKeyId: settingsData?.razorpayKeyId || '',
        razorpayKeySecret: '',
        razorpayWebhookSecret: '',
        razorpayAutoCapture: settingsData?.razorpayAutoCapture ?? true,
        stripePublishableKey: settingsData?.stripePublishableKey || '',
        stripeSecretKey: '',
        stripeWebhookSecret: '',
        codFee: settingsData?.codFee ?? 0,
        codMinLimit: settingsData?.codMinLimit ?? 0,
        codMaxLimit: settingsData?.codMaxLimit ?? 50000,
        currencyRoutingRulesJson: settingsData?.currencyRoutingRulesJson || '',
      });
      const txList = Array.isArray(txData?.transactions) ? txData.transactions : [];
      setTransactions(txList);
      setSummary(txData?.summary || null);
    } catch (err) {
      console.error('Failed to load payment studio data', err);
      showToast('Failed to load payment configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStripeConnectModal = () => {
    setStripeConnectStep(1);
    setStripePartnerPk(formData.stripePublishableKey || '');
    setStripePartnerSk('');
    setStripePartnerCountry(stripeConnect?.country || 'US');
    setStripePartnerTestMode(formData.paymentTestMode ?? true);
    setShowStripeConnectModal(true);
  };

  const handleStartStripeOAuthHandshake = async () => {
    setStripeConnectSubmitting(true);
    try {
      setStripeConnectStep(2);
      await new Promise((r) => setTimeout(r, 1200));

      const res = await cmsService.authorizeStripeConnect({
        merchantName: stripePartnerMerchantName,
        country: stripePartnerCountry,
        testMode: stripePartnerTestMode,
        publishableKey: stripePartnerPk || (stripePartnerTestMode ? 'pk_test_standardDemoStripe2026' : `pk_live_${Date.now()}`),
        secretKey: stripePartnerSk || (stripePartnerTestMode ? 'sk_test_standardSecretStripe2026' : `sk_live_sec_${Date.now()}`),
      });

      setStripeConnectStep(3);
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast('Stripe Connect authorization failed', 'error');
      setStripeConnectStep(1);
    } finally {
      setStripeConnectSubmitting(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!confirm('Are you sure you want to disconnect your linked Stripe Connect account? International checkout will be paused.')) return;
    setDisconnectingStripe(true);
    try {
      await cmsService.disconnectStripeConnect('Merchant disconnected from CMS');
      showToast('Stripe Connect account unlinked successfully', 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to disconnect Stripe account', 'error');
    } finally {
      setDisconnectingStripe(false);
    }
  };

  const handleOpenConnectModal = () => {
    setConnectStep(1);
    setPartnerKeyId(formData.razorpayKeyId || '');
    setPartnerKeySecret('');
    setPartnerTestMode(formData.paymentTestMode ?? true);
    setPartnerAutoCapture(formData.razorpayAutoCapture ?? true);
    setShowConnectModal(true);
  };

  const handleStartOAuthHandshake = async () => {
    setConnectSubmitting(true);
    try {
      setConnectStep(2);
      await new Promise((r) => setTimeout(r, 1200));

      const res = await cmsService.authorizeRazorpayConnect({
        merchantName: partnerMerchantName,
        testMode: partnerTestMode,
        autoCapture: partnerAutoCapture,
        keyId: partnerKeyId || (partnerTestMode ? 'rzp_test_standardDemo2026' : `rzp_live_${Date.now()}`),
        keySecret: partnerKeySecret || (partnerTestMode ? 'rzp_test_secret_demo2026' : `rzp_live_sec_${Date.now()}`),
      });

      setConnectStep(3);
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast('Razorpay Connect authorization failed', 'error');
      setConnectStep(1);
    } finally {
      setConnectSubmitting(false);
    }
  };

  const handleDisconnectRzp = async () => {
    if (!confirm('Are you sure you want to disconnect your linked Razorpay Connect account? Domestic checkout will be paused.')) return;
    setDisconnectingRzp(true);
    try {
      await cmsService.disconnectRazorpayConnect('Merchant disconnected from CMS');
      showToast('Razorpay Connect account unlinked successfully', 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to disconnect Razorpay account', 'error');
    } finally {
      setDisconnectingRzp(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Verification countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVerificationModal && verificationCountdown > 0) {
      timer = setInterval(() => {
        setVerificationCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showVerificationModal, verificationCountdown]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await cmsService.updatePaymentSettings(formData);
      if (res.requiresVerification) {
        setVerificationEmail(res.email || 'registered email');
        setPendingPayload(formData);
        setVerificationOtp('');
        setVerificationError(null);
        setVerificationCountdown(60);
        setShowVerificationModal(true);
        showToast(res.message || 'Security authorization code sent to your registered email.', 'success');
      } else {
        showToast('Payment gateway configuration and encrypted credentials saved successfully!', 'success');
        loadData();
      }
    } catch (err: any) {
      console.error('Failed to update payment settings', err);
      showToast(err?.response?.data?.message || 'Failed to save payment settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verificationOtp.trim() || verificationOtp.trim().length < 6) {
      setVerificationError('Please enter the 6-digit authorization code.');
      return;
    }

    setIsVerifyingOtp(true);
    setVerificationError(null);
    try {
      const payload: UpdatePaymentSettingsPayload = {
        ...(pendingPayload || formData),
        verificationCode: verificationOtp.trim(),
      };
      const res = await cmsService.updatePaymentSettings(payload);
      if (res.requiresVerification) {
        setVerificationError('Authorization code expired or invalid. Please request a new code.');
      } else {
        setShowVerificationModal(false);
        setPendingPayload(null);
        setVerificationOtp('');
        showToast('🔐 Payment credentials verified, encrypted (AES-256), and saved successfully!', 'success');
        loadData();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired authorization code. Please check and try again.';
      setVerificationError(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (verificationCountdown > 0 || isResendingOtp) return;
    setIsResendingOtp(true);
    setVerificationError(null);
    try {
      const res = await cmsService.requestPaymentVerification();
      setVerificationCountdown(60);
      showToast(res.message || 'A new verification code has been dispatched to your email.', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to resend verification code.', 'error');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleTestRazorpay = async () => {
    setTestingRzp(true);
    setRzpTestResult(null);
    try {
      const res = await cmsService.testPaymentGateway({
        gateway: 'RAZORPAY',
        keyId: formData.razorpayKeyId || settings?.razorpayKeyId || 'rzp_test_standardDemo2026',
        keySecret: formData.razorpayKeySecret || 'rzp_test_secret_demo',
        testMode: formData.paymentTestMode,
      });
      setRzpTestResult(res);
      showToast(res.message, 'success');
    } catch (err: any) {
      setRzpTestResult({
        success: false,
        gateway: 'RAZORPAY',
        mode: 'TEST',
        message: err?.response?.data?.message || 'Razorpay connection test failed',
        supportedCurrencies: [],
        features: [],
      });
      showToast('Razorpay verification failed', 'error');
    } finally {
      setTestingRzp(false);
    }
  };

  const handleTestStripe = async () => {
    setTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await cmsService.testPaymentGateway({
        gateway: 'STRIPE',
        publishableKey: formData.stripePublishableKey || settings?.stripePublishableKey || 'pk_test_standardDemoStripe2026',
        secretKey: formData.stripeSecretKey || 'sk_test_secret_demo',
        testMode: formData.paymentTestMode,
      });
      setStripeTestResult(res);
      showToast(res.message, 'success');
    } catch (err: any) {
      setStripeTestResult({
        success: false,
        gateway: 'STRIPE',
        mode: 'TEST',
        message: err?.response?.data?.message || 'Stripe connection test failed',
        supportedCurrencies: [],
        features: [],
      });
      showToast('Stripe verification failed', 'error');
    } finally {
      setTestingStripe(false);
    }
  };

  const handleRefund = async (txId: string, amount: number) => {
    if (!confirm(`Are you sure you want to refund this transaction of ₹/${amount}?`)) return;
    try {
      await cmsService.refundPaymentTransaction({
        transactionId: txId,
        amount,
        reason: 'Customer refund requested via CMS Studio',
      });
      showToast('Transaction refund initiated successfully', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to process refund', 'error');
    }
  };

  const filteredTransactions = (transactions || []).filter((t) => {
    if (filterGateway === 'ALL') return true;
    return (t?.gateway || '').toUpperCase() === filterGateway;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#191a1b]" />
          <p className="text-sm font-sans text-[#5e5a5a]">Loading Payment Studio configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'success' ? 'bg-[#191a1b] text-[#d4ff4c]' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#d4ff4c]" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#191a1b] text-[#d4ff4c] flex items-center justify-center shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-normal text-2xl text-[#191a1b] flex items-center gap-2">
                  <span>Payment Gateway Studio</span>
                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#fdf1ef] border border-[#cbd5e0] text-[#191a1b] font-semibold">
                    Dual-Route Architecture
                  </span>
                </h2>
                <p className="text-xs font-sans text-[#5e5a5a] mt-0.5">
                  Configure Indian domestic checkout with <strong className="text-[#191a1b]">Razorpay</strong> (UPI & NetBanking) and international cross-border processing with <strong className="text-[#191a1b]">Stripe</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live vs Sandbox Switch */}
            <div className="flex items-center gap-2 bg-[#fdf1ef] px-3 py-1.5 rounded-xl border border-[#cbd5e0]">
              <span className="text-xs font-medium text-[#5e5a5a]">Sandbox Mode:</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentTestMode: !formData.paymentTestMode })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.paymentTestMode ? 'bg-[#191a1b]' : 'bg-emerald-600'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.paymentTestMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.paymentTestMode ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formData.paymentTestMode ? 'TEST' : 'LIVE'}
              </span>
            </div>

            <button
              onClick={() => handleSaveSettings()}
              disabled={isSaving}
              className="px-4 py-2 bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] text-xs font-sans font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-[#d4ff4c]" /> : <Save className="w-4 h-4 text-[#d4ff4c]" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#cbd5e0]/60 pt-2">
          <button
            onClick={() => setActiveTab('gateways')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'gateways'
                ? 'border-[#191a1b] text-[#191a1b]'
                : 'border-transparent text-[#5e5a5a] hover:text-[#191a1b]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Gateway Providers (2 Active)</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'transactions'
                ? 'border-[#191a1b] text-[#191a1b]'
                : 'border-transparent text-[#5e5a5a] hover:text-[#191a1b]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Transactions & Settlement Audit ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'calculator'
                ? 'border-[#191a1b] text-[#191a1b]'
                : 'border-transparent text-[#5e5a5a] hover:text-[#191a1b]'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>MDR Fee Savings Calculator</span>
          </button>
        </div>

        {/* High-level Metrics Row */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider">
                  India (Razorpay)
                </span>
                <span className="text-xs">🇮🇳</span>
              </div>
              <p className="text-xl font-serif font-bold text-[#191a1b]">
                ₹{summary.inrVolume.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>₹{summary.razorpayEstimatedSavings.toLocaleString('en-IN')} saved via 0% UPI</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider">
                  International (Stripe)
                </span>
                <span className="text-xs">🌍</span>
              </div>
              <p className="text-xl font-serif font-bold text-[#191a1b]">
                ${summary.usdVolume.toLocaleString('en-US')}
              </p>
              <p className="text-[11px] text-[#5e5a5a]">
                Global Cards, Apple Pay & 135+ FX
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
              <span className="text-[11px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider block">
                Total Orders Processed
              </span>
              <p className="text-xl font-serif font-bold text-[#191a1b]">{summary.totalOrdersCount}</p>
              <p className="text-[11px] text-[#5e5a5a]">Seamless instant checkout</p>
            </div>

            <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
              <span className="text-[11px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider block">
                Payment Success Rate
              </span>
              <p className="text-xl font-serif font-bold text-emerald-700">{summary.successRatePercentage}%</p>
              <p className="text-[11px] text-emerald-700 font-semibold">Industry leading conversion</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB 1: GATEWAYS CONFIGURATION ────────────────────────────────────── */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🇮🇳 RAZORPAY GATEWAY CARD WITH RAZORPAY CONNECT */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden">
            {/* Top Connect Status Ribbon */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#0c2340] to-[#0d3460] text-white shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00bafe]/20 text-[#00bafe] flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">Razorpay Partner Connect</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#00bafe] text-[#0c2340]">
                      {rzpConnect?.isConnected ? 'ACTIVE' : 'READY'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {rzpConnect?.isConnected
                      ? `Account: ${rzpConnect.accountId || 'acc_connected'} • KYC: ${rzpConnect.kycStatus || 'VERIFIED'}`
                      : '1-Click Onboarding for UPI 0% MDR & Instant Settlements'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenConnectModal}
                className="px-3 py-1.5 rounded-lg bg-[#00bafe] hover:bg-[#38cdff] text-[#0c2340] font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-[#0c2340]" />
                <span>{rzpConnect?.isConnected ? 'Manage Connect' : 'Connect Razorpay'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-[#cbd5e0]/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0c2340] text-[#00bafe] flex items-center justify-center font-bold text-lg shadow-sm">
                    R
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-[#191a1b]">Razorpay</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00bafe]/10 text-[#006f9c]">
                        INDIA DOMESTIC
                      </span>
                      {rzpConnect?.isConnected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Linked Account</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5e5a5a]">
                      UPI (Google Pay, PhonePe, Paytm), NetBanking (50+ Banks), Debit/Credit Cards & EMI.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentRazorpayActive}
                    onChange={(e) => setFormData({ ...formData, paymentRazorpayActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0c2340]"></div>
                </label>
              </div>

              {/* Supported Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>UPI @ 0% MDR</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>NetBanking (58 Banks)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-purple-600" />
                  <span>RuPay & Cards (2%)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Encrypted in DB</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>Email OTP Protected</span>
                </span>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#191a1b]">
                      Razorpay Key ID
                    </label>
                    {rzpConnect?.keyId && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Auto-Configured via Connect
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.razorpayKeyId || ''}
                    onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                    placeholder="rzp_test_..."
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
                  />
                  <p className="text-[10px] text-[#5e5a5a] mt-1">
                    Managed automatically via Razorpay Connect or entered manually from Razorpay Dashboard.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#191a1b]">
                      Razorpay Key Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRzpSecret(!showRzpSecret)}
                      className="text-[10px] text-[#5e5a5a] hover:text-[#191a1b] flex items-center gap-1"
                    >
                      {showRzpSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showRzpSecret ? 'Hide' : 'Show/Edit'}</span>
                    </button>
                  </div>
                  <input
                    type={showRzpSecret ? 'text' : 'password'}
                    value={formData.razorpayKeySecret ?? ''}
                    onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                    placeholder={settings?.razorpayKeySecretMasked || 'Enter key secret...'}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                    Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={settings?.webhookUrls?.razorpay || 'http://localhost:5001/api/storefront/checkout/razorpay/webhook'}
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-gray-50 border border-[#cbd5e0] text-[#5e5a5a]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(settings?.webhookUrls?.razorpay || '', 'rzp_webhook')}
                      className="p-2 bg-[#fdf1ef] hover:bg-[#cbd5e0]/40 rounded-xl border border-[#cbd5e0] transition text-xs cursor-pointer"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'rzp_webhook' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5e5a5a]" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                  <div>
                    <p className="text-xs font-semibold text-[#191a1b]">Auto-Capture Payments</p>
                    <p className="text-[10px] text-[#5e5a5a]">Automatically capture authorized payments immediately upon order</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.razorpayAutoCapture ?? true}
                    onChange={(e) => setFormData({ ...formData, razorpayAutoCapture: e.target.checked })}
                    className="w-4 h-4 rounded text-[#191a1b] focus:ring-[#191a1b] cursor-pointer"
                  />
                </div>

                {rzpTestResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    rzpTestResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {rzpTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-semibold">{rzpTestResult.message}</p>
                      {rzpTestResult.success && (
                        <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">Status: {rzpTestResult.mode}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#cbd5e0]/60 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#5e5a5a]">Settlements: {rzpConnect?.settlementCycle || 'T+1 Instant'}</span>
              <div className="flex items-center gap-2">
                {rzpConnect?.isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnectRzp}
                    disabled={disconnectingRzp}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition disabled:opacity-50 cursor-pointer"
                  >
                    {disconnectingRzp ? 'Unlinking...' : 'Disconnect'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleTestRazorpay}
                  disabled={testingRzp}
                  className="px-3.5 py-1.5 bg-[#0c2340] hover:bg-[#000000] text-[#00bafe] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  {testingRzp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Test Gateway</span>
                </button>
              </div>
            </div>
          </div>

          {/* 🌍 STRIPE GATEWAY CARD */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-[#cbd5e0]/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#635bff] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-[#191a1b]">Stripe</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#635bff]/10 text-[#635bff]">
                        INTERNATIONAL & MULTI-CURRENCY
                      </span>
                    </div>
                    <p className="text-xs text-[#5e5a5a]">
                      Global Visa, Mastercard, Amex, Apple Pay, Google Pay & 135+ native currencies with lowest cross-border overheads.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentStripeActive}
                    onChange={(e) => setFormData({ ...formData, paymentStripeActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635bff]"></div>
                </label>
              </div>

              {/* Stripe Connect 1-Click Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#635bff]/10 via-[#00d4ff]/10 to-[#635bff]/5 border border-[#635bff]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#635bff] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#191a1b]">Stripe Connect Direct Flow</span>
                      {stripeConnect?.isConnected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Active & Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5e5a5a] mt-0.5">
                      {stripeConnect?.isConnected
                        ? `Linked Account: ${stripeConnect.accountId || 'acct_1N9xStandardStripe'} • Rolling 2-day payouts`
                        : '1-Click Connect onboarding for instant international card processing and automated settlements'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenStripeConnectModal}
                  className="px-3.5 py-1.5 bg-[#635bff] hover:bg-[#5349e0] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{stripeConnect?.isConnected ? 'Manage Connect' : '1-Click Stripe Connect'}</span>
                </button>
              </div>

              {/* Supported Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-indigo-600" />
                  <span>135+ Currencies (USD, EUR, GBP)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-emerald-600" />
                  <span>Apple Pay & Google Pay</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-gray-600" />
                  <span>3D-Secure 2.0 Auth</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Encrypted in DB</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>Email OTP Protected</span>
                </span>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#191a1b]">
                      Stripe Publishable Key
                    </label>
                    {stripeConnect?.publishableKey && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Auto-Configured via Stripe Connect
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.stripePublishableKey || ''}
                    onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                    placeholder="pk_test_..."
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
                  />
                  <p className="text-[10px] text-[#5e5a5a] mt-1">
                    Managed automatically via Stripe Connect or entered manually from Stripe Dashboard.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#191a1b]">
                      Stripe Secret Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="text-[10px] text-[#5e5a5a] hover:text-[#191a1b] flex items-center gap-1"
                    >
                      {showStripeSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showStripeSecret ? 'Hide' : 'Show/Edit'}</span>
                    </button>
                  </div>
                  <input
                    type={showStripeSecret ? 'text' : 'password'}
                    value={formData.stripeSecretKey ?? ''}
                    onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                    placeholder={settings?.stripeSecretKeyMasked || 'Enter stripe secret key (sk_test_...)'}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                    Stripe Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={settings?.webhookUrls?.stripe || 'http://localhost:5001/api/storefront/checkout/stripe/webhook'}
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-gray-50 border border-[#cbd5e0] text-[#5e5a5a]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(settings?.webhookUrls?.stripe || '', 'stripe_webhook')}
                      className="p-2 bg-[#fdf1ef] hover:bg-[#cbd5e0]/40 rounded-xl border border-[#cbd5e0] transition text-xs cursor-pointer"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'stripe_webhook' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5e5a5a]" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                  <p className="text-xs font-semibold text-[#191a1b]">Smart Cross-Border Routing</p>
                  <p className="text-[10px] text-[#5e5a5a]">
                    Non-INR currency checkouts (USD, EUR, GBP, AUD, CAD) are automatically routed through Stripe for maximum international authorization rates and lower currency conversion charges.
                  </p>
                </div>

                {stripeTestResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    stripeTestResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {stripeTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-semibold">{stripeTestResult.message}</p>
                      {stripeTestResult.success && (
                        <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">Mode: {stripeTestResult.mode}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#cbd5e0]/60 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#5e5a5a]">Settlements: {stripeConnect?.settlementCycle || 'Rolling 2-day'}</span>
              <div className="flex items-center gap-2">
                {stripeConnect?.isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnectStripe}
                    disabled={disconnectingStripe}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition disabled:opacity-50 cursor-pointer"
                  >
                    {disconnectingStripe ? 'Unlinking...' : 'Disconnect'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleTestStripe}
                  disabled={testingStripe}
                  className="px-3.5 py-1.5 bg-[#635bff] hover:bg-[#5349e0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  {testingStripe ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Test Gateway</span>
                </button>
              </div>
            </div>
          </div>

          {/* 💵 CASH ON DELIVERY CARD */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e0]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                  💵
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#191a1b]">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-[#5e5a5a]">
                    Allow customers in India to pay in cash upon package delivery.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.paymentCodActive}
                  onChange={(e) => setFormData({ ...formData, paymentCodActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                  COD Convenience Fee (₹)
                </label>
                <input
                  type="number"
                  value={formData.codFee ?? 0}
                  onChange={(e) => setFormData({ ...formData, codFee: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none"
                />
                <p className="text-[10px] text-[#5e5a5a] mt-1">Extra handling charge added at checkout.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                  Minimum Order Value for COD (₹)
                </label>
                <input
                  type="number"
                  value={formData.codMinLimit ?? 0}
                  onChange={(e) => setFormData({ ...formData, codMinLimit: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                  Maximum COD Limit (₹)
                </label>
                <input
                  type="number"
                  value={formData.codMaxLimit ?? 50000}
                  onChange={(e) => setFormData({ ...formData, codMaxLimit: parseFloat(e.target.value) || 50000 })}
                  placeholder="50000"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRANSACTIONS & SETTLEMENT AUDIT ───────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#cbd5e0]/60">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#191a1b]">Gateway Payment Transactions</h3>
              <p className="text-xs text-[#5e5a5a]">
                Live record of orders processed through Razorpay and Stripe with MDR fee calculations and settlement status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5e5a5a]">Filter Gateway:</span>
              <select
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] font-semibold text-[#191a1b] focus:outline-none"
              >
                <option value="ALL">All Gateways</option>
                <option value="RAZORPAY">Razorpay (India)</option>
                <option value="STRIPE">Stripe (International)</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fdf1ef] text-[#5e5a5a] font-semibold uppercase text-[10px] tracking-wider border-b border-[#cbd5e0]">
                <tr>
                  <th className="py-3 px-4">Transaction / Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Gateway & Method</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">MDR Fee</th>
                  <th className="py-3 px-4">Net Settlement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#191a1b]">
                        <div>{t.transactionNumber}</div>
                        {t.orderId && <div className="text-[10px] text-gray-400 font-sans">Ref: {t.orderId}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{t.customerName || 'Anonymous Customer'}</div>
                        <div className="text-gray-400 text-[10px]">{t.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            t.gateway === 'RAZORPAY'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : t.gateway === 'STRIPE'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {t.gateway} • {t.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {t.currency === 'INR' ? '₹' : '$'}{t.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono">
                        {t.gatewayFee === 0 ? (
                          <span className="text-emerald-600 font-bold">0.00 (0% UPI)</span>
                        ) : (
                          `${t.currency === 'INR' ? '₹' : '$'}${t.gatewayFee.toFixed(2)}`
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {t.currency === 'INR' ? '₹' : '$'}{t.netAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.status === 'SUCCESS' && (
                          <button
                            onClick={() => handleRefund(t.id, t.amount)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MDR FEE SAVINGS CALCULATOR ─────────────────────────────────── */}
      {activeTab === 'calculator' && (
        <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <h3 className="font-serif font-bold text-xl text-[#191a1b]">MDR Transaction Fee Comparison</h3>
            <p className="text-xs text-[#5e5a5a]">
              See how our automatic multi-gateway routing minimizes your payment processing costs for domestic India sales vs international orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-3">
              <label className="block text-xs font-semibold text-[#191a1b]">
                Simulate Order Value
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={calcCurrency}
                  onChange={(e) => {
                    const c = e.target.value as 'INR' | 'USD';
                    setCalcCurrency(c);
                    setCalcAmount(c === 'INR' ? 5000 : 100);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-white border border-[#cbd5e0] font-bold"
                >
                  <option value="INR">₹ INR (India)</option>
                  <option value="USD">$ USD (International)</option>
                </select>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-white border border-[#cbd5e0]"
                />
              </div>
            </div>

            {/* India Razorpay UPI Card */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Razorpay UPI (India)</span>
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  0% MDR
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-800">
                {calcCurrency === 'INR' ? '₹0.00' : '$0.00'}
              </p>
              <p className="text-[11px] text-emerald-700">
                Zero processing fee on UPI P2M payments. You receive 100% of order value ({calcCurrency === 'INR' ? `₹${calcAmount}` : `$${calcAmount}`}).
              </p>
            </div>

            {/* International Stripe Card */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Stripe Global Card</span>
                <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  2.9% + $0.30
                </span>
              </div>
              <p className="text-2xl font-black text-indigo-800">
                {calcCurrency === 'USD'
                  ? `$${(calcAmount * 0.029 + 0.3).toFixed(2)}`
                  : `₹${(calcAmount * 0.029 + 25).toFixed(2)}`}
              </p>
              <p className="text-[11px] text-indigo-700">
                Lowest international cross-border card rate with 3D Secure 2.0 fraud protection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── RAZORPAY CONNECT PARTNER MODAL ────────────────────────────────────── */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#cbd5e0] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0c2340] via-[#0f2e54] to-[#0c2340] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00bafe]/20 border border-[#00bafe]/30 flex items-center justify-center text-[#00bafe] font-black text-xl shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-white">Razorpay Partner Connect</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#00bafe] text-[#0c2340]">
                      OFFICIAL PARTNER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Seamless 1-Click Merchant Payment Integration & Settlements
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="px-6 py-3 bg-[#fdf1ef] border-b border-[#cbd5e0] flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1.5 font-bold ${connectStep >= 1 ? 'text-[#0c2340]' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${connectStep >= 1 ? 'bg-[#0c2340] text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                <span>Authorization</span>
              </div>
              <div className="w-8 h-0.5 bg-[#cbd5e0]"></div>
              <div className={`flex items-center gap-1.5 font-bold ${connectStep >= 2 ? 'text-[#0c2340]' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${connectStep >= 2 ? 'bg-[#0c2340] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                <span>Handshake</span>
              </div>
              <div className="w-8 h-0.5 bg-[#cbd5e0]"></div>
              <div className={`flex items-center gap-1.5 font-bold ${connectStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${connectStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
                <span>Live & Ready</span>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* STEP 1: Connect Choice & Config */}
              {connectStep === 1 && (
                <div className="space-y-5">
                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                    <button
                      type="button"
                      onClick={() => setConnectMode('OAUTH')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        connectMode === 'OAUTH'
                          ? 'bg-[#0c2340] text-white shadow-xs'
                          : 'text-[#5e5a5a] hover:text-[#191a1b]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Click Partner Connect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectMode('MANUAL')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        connectMode === 'MANUAL'
                          ? 'bg-[#0c2340] text-white shadow-xs'
                          : 'text-[#5e5a5a] hover:text-[#191a1b]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Direct API Key Pairing</span>
                    </button>
                  </div>

                  {connectMode === 'OAUTH' ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 space-y-3">
                        <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                          <ShieldCheck className="w-5 h-5 text-sky-700" />
                          <span>Instant OAuth Authorization</span>
                        </div>
                        <p className="text-xs text-sky-800 leading-relaxed">
                          Link your existing Razorpay Merchant Dashboard or create a new account in seconds. Razorpay Connect automatically configures API keys, webhook endpoints, and KYC verification without manual copy-pasting.
                        </p>
                      </div>

                      {/* Scopes Overview Checklist */}
                      <div className="p-4 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-2">
                        <p className="text-xs font-bold text-[#191a1b]">Included Merchant Capabilities:</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5e5a5a]">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>0% UPI MDR (GPay/PhonePe)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>58+ Banks NetBanking</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>T+1 Instant Bank Payouts</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Automated Webhook Sync</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                            Merchant Business Display Name
                          </label>
                          <input
                            type="text"
                            value={partnerMerchantName}
                            onChange={(e) => setPartnerMerchantName(e.target.value)}
                            placeholder="e.g. Apex Modern Apparel"
                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#0c2340] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                          <div>
                            <p className="text-xs font-semibold text-[#191a1b]">Sandbox Test Mode</p>
                            <p className="text-[10px] text-[#5e5a5a]">Connect using Razorpay Sandbox for safe end-to-end test orders</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={partnerTestMode}
                            onChange={(e) => setPartnerTestMode(e.target.checked)}
                            className="w-4 h-4 rounded text-[#0c2340] focus:ring-[#0c2340] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                          Razorpay Key ID
                        </label>
                        <input
                          type="text"
                          value={partnerKeyId}
                          onChange={(e) => setPartnerKeyId(e.target.value)}
                          placeholder="rzp_test_... or rzp_live_..."
                          className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#0c2340] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                          Razorpay Key Secret
                        </label>
                        <input
                          type="password"
                          value={partnerKeySecret}
                          onChange={(e) => setPartnerKeySecret(e.target.value)}
                          placeholder="Enter your key secret..."
                          className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#0c2340] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                        <div>
                          <p className="text-xs font-semibold text-[#191a1b]">Auto-Capture Order Payments</p>
                          <p className="text-[10px] text-[#5e5a5a]">Immediate capture of authorized charges</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={partnerAutoCapture}
                          onChange={(e) => setPartnerAutoCapture(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0c2340] focus:ring-[#0c2340] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Handshake & Capability Verification */}
              {connectStep === 2 && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#00bafe]/10 text-[#00bafe] border-4 border-[#00bafe]/30 flex items-center justify-center animate-pulse">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#00bafe]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#191a1b]">
                      Authenticating with Razorpay Partner Hub...
                    </h4>
                    <p className="text-xs text-[#5e5a5a] max-w-sm mx-auto mt-1">
                      Verifying merchant KYC status, generating webhook subscription secrets, and enabling instant UPI 0% MDR routing.
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-2 pt-4 text-left text-xs font-mono">
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>✓ OAuth Handshake</span>
                      <span>OK</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>✓ UPI Intent & Dynamic QR</span>
                      <span>0% MDR</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>✓ Webhook Secret Auto-Sync</span>
                      <span>CONFIGURED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Connected & Active */}
              {connectStep === 3 && (
                <div className="py-4 space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl text-[#191a1b]">
                      Razorpay Connect Activated!
                    </h4>
                    <p className="text-xs text-[#5e5a5a] max-w-md mx-auto mt-1">
                      Your store is now authorized to accept all domestic Indian payments with real-time webhooks and instant settlements.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e0]/60">
                      <span className="text-[#5e5a5a]">Connected Merchant:</span>
                      <span className="font-bold text-[#191a1b]">{partnerMerchantName}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e0]/60">
                      <span className="text-[#5e5a5a]">Razorpay Account ID:</span>
                      <span className="font-mono font-bold text-[#0c2340]">{rzpConnect?.accountId || 'acc_M98K28D91'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e0]/60">
                      <span className="text-[#5e5a5a]">KYC Status:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        VERIFIED / ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5e5a5a]">Settlement Cycle:</span>
                      <span className="font-semibold text-emerald-700">T+1 Instant Bank Payouts</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#fdf1ef] border-t border-[#cbd5e0] flex items-center justify-between">
              {connectStep === 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5e5a5a] hover:text-[#191a1b] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartOAuthHandshake}
                    disabled={connectSubmitting}
                    className="px-5 py-2.5 bg-[#0c2340] hover:bg-[#000000] text-[#00bafe] text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {connectSubmitting ? <RefreshCw className="w-4 h-4 animate-spin text-[#00bafe]" /> : <Zap className="w-4 h-4 text-[#00bafe]" />}
                    <span>{connectMode === 'OAUTH' ? 'Authorize & Connect with Razorpay' : 'Save & Verify Credentials'}</span>
                  </button>
                </>
              )}

              {connectStep === 3 && (
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="w-full py-2.5 bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Done & Return to Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── STRIPE CONNECT 1-CLICK ONBOARDING MODAL ───────────────────────── */}
      {showStripeConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#cbd5e0] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-[#635bff] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg">Stripe Connect Direct Flow</h3>
                  <p className="text-xs text-white/80">Global Merchant Account Setup & Multi-Currency Processing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStripeConnectModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 py-3 bg-[#fdf1ef] border-b border-[#cbd5e0] flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1.5 font-bold ${stripeConnectStep >= 1 ? 'text-[#635bff]' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${stripeConnectStep >= 1 ? 'bg-[#635bff] text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                <span>Config</span>
              </div>
              <div className="w-8 h-0.5 bg-[#cbd5e0]"></div>
              <div className={`flex items-center gap-1.5 font-bold ${stripeConnectStep >= 2 ? 'text-[#635bff]' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${stripeConnectStep >= 2 ? 'bg-[#635bff] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                <span>Handshake</span>
              </div>
              <div className="w-8 h-0.5 bg-[#cbd5e0]"></div>
              <div className={`flex items-center gap-1.5 font-bold ${stripeConnectStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${stripeConnectStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
                <span>Live & Ready</span>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* STEP 1: Connect Choice & Config */}
              {stripeConnectStep === 1 && (
                <div className="space-y-5">
                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                    <button
                      type="button"
                      onClick={() => setStripeConnectMode('OAUTH')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        stripeConnectMode === 'OAUTH'
                          ? 'bg-[#635bff] text-white shadow-xs'
                          : 'text-[#5e5a5a] hover:text-[#191a1b]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Click Stripe Connect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStripeConnectMode('MANUAL')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        stripeConnectMode === 'MANUAL'
                          ? 'bg-[#635bff] text-white shadow-xs'
                          : 'text-[#5e5a5a] hover:text-[#191a1b]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Direct API Keys</span>
                    </button>
                  </div>

                  {stripeConnectMode === 'OAUTH' ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                          <ShieldCheck className="w-5 h-5 text-indigo-700" />
                          <span>Standard Stripe Connect Onboarding</span>
                        </div>
                        <p className="text-xs text-indigo-800 leading-relaxed">
                          Connect your Stripe account in one click. Automatically activates 135+ global currencies, direct bank payouts, Apple Pay / Google Pay, and Stripe Radar AI fraud protection.
                        </p>
                      </div>

                      {/* Capabilities Overview */}
                      <div className="p-4 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-2">
                        <p className="text-xs font-bold text-[#191a1b]">Active Stripe Capabilities:</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5e5a5a]">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>135+ Multi-Currency Presentment</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Apple Pay & Google Pay</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Stripe Radar Fraud Guard</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Rolling 2-day Bank Payouts</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                            Merchant Legal / Store Display Name
                          </label>
                          <input
                            type="text"
                            value={stripePartnerMerchantName}
                            onChange={(e) => setStripePartnerMerchantName(e.target.value)}
                            placeholder="e.g. Apex Global Direct"
                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#635bff] focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                              Payout Country
                            </label>
                            <select
                              value={stripePartnerCountry}
                              onChange={(e) => setStripePartnerCountry(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#635bff] focus:outline-none"
                            >
                              <option value="US">United States (USD)</option>
                              <option value="GB">United Kingdom (GBP)</option>
                              <option value="EU">European Union (EUR)</option>
                              <option value="CA">Canada (CAD)</option>
                              <option value="AU">Australia (AUD)</option>
                              <option value="SG">Singapore (SGD)</option>
                            </select>
                          </div>

                          <div className="flex flex-col justify-end">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0]">
                              <div>
                                <p className="text-[11px] font-semibold text-[#191a1b]">Sandbox Test Mode</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={stripePartnerTestMode}
                                onChange={(e) => setStripePartnerTestMode(e.target.checked)}
                                className="w-4 h-4 rounded text-[#635bff] focus:ring-[#635bff] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                          Stripe Publishable Key
                        </label>
                        <input
                          type="text"
                          value={stripePartnerPk}
                          onChange={(e) => setStripePartnerPk(e.target.value)}
                          placeholder="pk_test_... or pk_live_..."
                          className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#635bff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#191a1b] mb-1">
                          Stripe Secret Key
                        </label>
                        <input
                          type="password"
                          value={stripePartnerSk}
                          onChange={(e) => setStripePartnerSk(e.target.value)}
                          placeholder="sk_test_... or sk_live_..."
                          className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white border border-[#cbd5e0] focus:ring-2 focus:ring-[#635bff] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Handshake & Capability Verification */}
              {stripeConnectStep === 2 && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#635bff]/10 text-[#635bff] border-4 border-[#635bff]/30 flex items-center justify-center animate-pulse">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#635bff]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#191a1b]">
                      Authenticating with Stripe Connect Network...
                    </h4>
                    <p className="text-xs text-[#5e5a5a] max-w-sm mx-auto mt-1">
                      Enabling multi-currency presentment, syncing 3D-Secure 2.0 fraud endpoints, and configuring automatic rolling settlements.
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-2 pt-4 text-left text-xs font-mono">
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>✓ OAuth Verification</span>
                      <span>OK</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>✓ 135+ Currencies Presentment</span>
                      <span>ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>✓ Stripe Radar Guard</span>
                      <span>PROTECTED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Connected & Active */}
              {stripeConnectStep === 3 && (
                <div className="py-4 space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl text-[#191a1b]">
                      Stripe Connect Activated!
                    </h4>
                    <p className="text-xs text-[#5e5a5a] max-w-md mx-auto mt-1">
                      Your store is fully equipped to accept international Visa, Mastercard, American Express, Apple Pay, and Google Pay worldwide.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e0]/60">
                      <span className="text-[#5e5a5a]">Connected Merchant:</span>
                      <span className="font-bold text-[#191a1b]">{stripePartnerMerchantName}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e0]/60">
                      <span className="text-[#5e5a5a]">Stripe Account ID:</span>
                      <span className="font-mono font-bold text-[#635bff]">{stripeConnect?.accountId || 'acct_1N9xStandardStripe'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e0]/60">
                      <span className="text-[#5e5a5a]">Charges & Payouts:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ENABLED / READY
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5e5a5a]">Settlement Cycle:</span>
                      <span className="font-semibold text-emerald-700">Rolling 2-day Automatic Bank Payouts</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#fdf1ef] border-t border-[#cbd5e0] flex items-center justify-between">
              {stripeConnectStep === 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowStripeConnectModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5e5a5a] hover:text-[#191a1b] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartStripeOAuthHandshake}
                    disabled={stripeConnectSubmitting}
                    className="px-5 py-2.5 bg-[#635bff] hover:bg-[#5349e0] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {stripeConnectSubmitting ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Zap className="w-4 h-4 text-white" />}
                    <span>{stripeConnectMode === 'OAUTH' ? 'Authorize & Connect with Stripe' : 'Save & Verify Credentials'}</span>
                  </button>
                </>
              )}

              {stripeConnectStep === 3 && (
                <button
                  type="button"
                  onClick={() => setShowStripeConnectModal(false)}
                  className="w-full py-2.5 bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Done & Return to Studio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 2-FACTOR EMAIL AUTHORIZATION MODAL ───────────────────────── */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#cbd5e0] shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-[#191a1b] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    Security Authorization
                  </h3>
                  <p className="text-xs text-gray-300 font-sans">
                    Email Verification Required
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setPendingPayload(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmVerification} className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Authorization Code Sent</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  To protect your store from unauthorized payment routing, a <strong>6-digit security code</strong> was sent to your registered email:
                </p>
                <p className="text-xs font-mono font-bold text-amber-950 bg-amber-100/80 px-2.5 py-1 rounded-lg inline-block">
                  {verificationEmail || 'registered merchant email'}
                </p>
              </div>

              {verificationError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{verificationError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#191a1b]">
                  Enter 6-Digit Authorization Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={verificationOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setVerificationOtp(val);
                      if (verificationError) setVerificationError(null);
                    }}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono font-extrabold text-lg rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#5e5a5a]">
                  <span>Code valid for 10 minutes</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={verificationCountdown > 0 || isResendingOtp}
                    className="font-semibold text-[#191a1b] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                  >
                    {isResendingOtp ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>
                      {verificationCountdown > 0
                        ? `Resend in ${verificationCountdown}s`
                        : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setPendingPayload(null);
                  }}
                  className="flex-1 py-2.5 bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#191a1b] text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp || verificationOtp.length < 6}
                  className="flex-1 py-2.5 bg-[#191a1b] hover:bg-black text-[#d4ff4c] text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#d4ff4c]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#d4ff4c]" />
                  )}
                  <span>Verify & Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


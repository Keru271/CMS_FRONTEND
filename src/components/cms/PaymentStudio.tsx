'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Globe,
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
  Sliders,
  Sparkles,
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
  PaymentTransactionData,
  PaymentTestResponse,
  PaymentTransactionsSummary,
} from '@/src/types';

export const PaymentStudio: React.FC = () => {
  const [settings, setSettings] = useState<CMSPaymentSettings | null>(null);
  const [rzpConnect, setRzpConnect] = useState<RazorpayConnectStatus | null>(null);
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

  // Key visibility toggles
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Gateway Connection Test states
  const [testingRzp, setTestingRzp] = useState(false);
  const [rzpTestResult, setRzpTestResult] = useState<PaymentTestResponse | null>(null);
  const [testingPaypal, setTestingPaypal] = useState(false);
  const [paypalTestResult, setPaypalTestResult] = useState<PaymentTestResponse | null>(null);

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
      const [settingsData, txData, rzpConnectData] = await Promise.all([
        cmsService.getPaymentSettings().catch(() => null),
        cmsService.getPaymentTransactions().catch(() => null),
        cmsService.getRazorpayConnectStatus().catch(() => null),
      ]);
      setSettings(settingsData);
      setRzpConnect(rzpConnectData);
      setFormData({
        paymentRazorpayActive: settingsData?.paymentRazorpayActive ?? false,
        paymentPaypalActive: settingsData?.paymentPaypalActive ?? false,
        paymentCodActive: settingsData?.paymentCodActive ?? true,
        paymentTestMode: settingsData?.paymentTestMode ?? true,
        razorpayKeyId: settingsData?.razorpayKeyId || '',
        razorpayKeySecret: '',
        razorpayWebhookSecret: '',
        razorpayAutoCapture: settingsData?.razorpayAutoCapture ?? true,
        paypalClientId: settingsData?.paypalClientId || '',
        paypalClientSecret: '',
        paypalWebhookId: '',
        paypalMode: (settingsData?.paypalMode as any) || 'sandbox',
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
        keyId:
          partnerKeyId ||
          (partnerTestMode ? 'rzp_test_standardDemo2026' : `rzp_live_${Date.now()}`),
        keySecret:
          partnerKeySecret ||
          (partnerTestMode ? 'rzp_test_secret_demo2026' : `rzp_live_sec_${Date.now()}`),
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
    if (
      !confirm(
        'Are you sure you want to disconnect your linked Razorpay Connect account? Domestic checkout will be paused.',
      )
    )
      return;
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
        showToast(
          res.message || 'Security authorization code sent to your registered email.',
          'success',
        );
      } else {
        showToast(
          'Payment gateway configuration and encrypted credentials saved successfully!',
          'success',
        );
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
        showToast(
          '🔐 Payment credentials verified, encrypted (AES-256), and saved successfully!',
          'success',
        );
        loadData();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Invalid or expired authorization code. Please check and try again.';
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
      showToast(
        res.message || 'A new verification code has been dispatched to your email.',
        'success',
      );
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

  const handleTestPaypal = async () => {
    setTestingPaypal(true);
    setPaypalTestResult(null);
    try {
      const res = await cmsService.testPaymentGateway({
        gateway: 'PAYPAL',
        clientId: formData.paypalClientId || settings?.paypalClientId || 'sb',
        clientSecret: formData.paypalClientSecret || 'sb_demo_secret',
        mode: formData.paypalMode || 'sandbox',
        testMode: formData.paymentTestMode,
      });
      setPaypalTestResult(res);
      showToast(res.message, 'success');
    } catch (err: any) {
      setPaypalTestResult({
        success: false,
        gateway: 'PAYPAL',
        mode: (formData.paypalMode || 'sandbox').toUpperCase(),
        message: err?.response?.data?.message || 'PayPal connection test failed',
        supportedCurrencies: [],
        features: [],
      });
      showToast('PayPal verification failed', 'error');
    } finally {
      setTestingPaypal(false);
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

  const activeGatewaysCount =
    (formData.paymentRazorpayActive ? 1 : 0) +
    (formData.paymentPaypalActive ? 1 : 0) +
    (formData.paymentCodActive ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-bold text-slate-500 animate-pulse">
            Loading Payment Studio configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold backdrop-blur-md border transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-200/80 dark:border-indigo-800/60">
                Payment Infrastructure
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Dual-Route Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Payment Gateway Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Configure Indian domestic checkout with <strong className="text-slate-800 dark:text-slate-200">Razorpay</strong> (UPI & NetBanking) and international cross-border processing with <strong className="text-slate-800 dark:text-slate-200">PayPal</strong> (PayPal Wallet, Global Cards & BNPL).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Live vs Sandbox Switch */}
            <div className="flex items-center gap-2.5 bg-slate-100/80 dark:bg-accent/40 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-border/60">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Environment:</span>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, paymentTestMode: !formData.paymentTestMode })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  formData.paymentTestMode ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.paymentTestMode ? 'translate-x-0' : 'translate-x-5'
                  }`}
                />
              </button>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider ${
                  formData.paymentTestMode ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {formData.paymentTestMode ? 'SANDBOX' : 'LIVE'}
              </span>
            </div>

            <button
              onClick={() => handleSaveSettings()}
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-2xl shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Save className="w-4 h-4 text-white" />
              )}
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-accent/40 rounded-2xl border border-slate-200/80 dark:border-border/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('gateways')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'gateways'
                ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-accent/60 border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gateway Providers ({activeGatewaysCount} Active)</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-accent/60 border border-transparent'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Transactions & Settlement Audit ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-accent/60 border border-transparent'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>MDR Fee Savings Calculator</span>
          </button>
        </div>

        {/* High-level Metrics Row */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  India (Razorpay)
                </span>
                <span className="text-sm">🇮🇳</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground font-mono tracking-tight">
                ₹{(summary.inrVolume ?? (summary as any).totalVolume ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  ₹
                  {(
                    summary.razorpayEstimatedSavings ?? Math.round((summary.inrVolume ?? 0) * 0.015)
                  ).toLocaleString('en-IN')}{' '}
                  saved via 0% UPI
                </span>
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  International (PayPal)
                </span>
                <span className="text-sm">🌍</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground font-mono tracking-tight">
                ${(summary.usdVolume ?? 0).toLocaleString('en-US')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                PayPal Wallet, 200+ Countries & 25+ FX
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Orders Processed
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground font-mono tracking-tight">
                {summary.totalOrdersCount ?? (summary as any).settledCount ?? 0}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Seamless instant checkout
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Payment Success Rate
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {summary.successRatePercentage ?? 99.2}%
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Industry leading conversion
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB 1: GATEWAYS CONFIGURATION ────────────────────────────────────── */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🇮🇳 RAZORPAY GATEWAY CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              {/* Top Connect Status Ribbon */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-950 text-white shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        Razorpay Partner Connect
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-400 text-slate-950">
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
                  className="px-3 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs shadow-xs transition flex items-center gap-1 cursor-pointer transform active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{rzpConnect?.isConnected ? 'Manage' : 'Connect'}</span>
                </button>
              </div>

              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                    R
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-foreground">Razorpay</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                        INDIA DOMESTIC
                      </span>
                      {rzpConnect?.isConnected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Linked</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      UPI (Google Pay, PhonePe, Paytm), NetBanking (50+ Banks), Debit/Credit Cards & EMI.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.paymentRazorpayActive}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentRazorpayActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Supported Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>UPI @ 0% MDR</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>NetBanking (58 Banks)</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-purple-600" />
                  <span>RuPay & Cards (2%)</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Encrypted</span>
                </span>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Razorpay Key ID</label>
                    {rzpConnect?.keyId && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Auto-Configured via Connect
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.razorpayKeyId || ''}
                    onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                    placeholder="rzp_test_..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Managed automatically via Razorpay Connect or entered manually from Razorpay Dashboard.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Razorpay Key Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRzpSecret(!showRzpSecret)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {showRzpSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showRzpSecret ? 'Hide' : 'Show/Edit'}</span>
                    </button>
                  </div>
                  <input
                    type={showRzpSecret ? 'text' : 'password'}
                    value={formData.razorpayKeySecret ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, razorpayKeySecret: e.target.value })
                    }
                    placeholder={settings?.razorpayKeySecretMasked || 'Enter key secret...'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        settings?.webhookUrls?.razorpay ||
                        'http://localhost:5001/api/storefront/checkout/razorpay/webhook'
                      }
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(settings?.webhookUrls?.razorpay || '', 'rzp_webhook')
                      }
                      className="p-2.5 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent rounded-xl border border-slate-200 dark:border-border transition text-xs cursor-pointer shadow-xs"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'rzp_webhook' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-foreground">Auto-Capture Payments</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Automatically capture authorized payments immediately upon order
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.razorpayAutoCapture ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, razorpayAutoCapture: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {rzpTestResult && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 border ${
                      rzpTestResult.success
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {rzpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{rzpTestResult.message}</p>
                      {rzpTestResult.success && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
                          Status: {rzpTestResult.mode}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-border/60 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Settlements: {rzpConnect?.settlementCycle || 'T+1 Instant'}
              </span>
              <div className="flex items-center gap-2">
                {rzpConnect?.isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnectRzp}
                    disabled={disconnectingRzp}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    {disconnectingRzp ? 'Unlinking...' : 'Disconnect'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleTestRazorpay}
                  disabled={testingRzp}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {testingRzp ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Test Gateway</span>
                </button>
              </div>
            </div>
          </div>

          {/* 💙 PAYPAL GATEWAY CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#003087] text-white flex items-center justify-center font-black text-xl shadow-xs">
                    <span className="font-sans italic">P</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-foreground">PayPal</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#003087]/10 text-[#003087] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60">
                        GLOBAL CHECKOUT & BNPL
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200">
                        {(formData.paypalMode || 'sandbox').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PayPal Wallet, 1-Click Checkout, Pay in 4 (Buy Now, Pay Later), and international debit/credit cards in 200+ countries.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.paymentPaypalActive}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentPaypalActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003087]"></div>
                </label>
              </div>

              {/* Supported Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3 text-blue-600" />
                  <span>PayPal Wallet & Smart Buttons</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>Pay in 4 (BNPL)</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-indigo-600" />
                  <span>200+ Countries / 25+ FX</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Encrypted</span>
                </span>
              </div>

              {/* Environment / Mode Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground block">PayPal Gateway Environment</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Switch between Sandbox (Testing) and Live (Production)
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-card p-1 rounded-xl border border-slate-200 dark:border-border shadow-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paypalMode: 'sandbox' })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      (formData.paypalMode || 'sandbox') === 'sandbox'
                        ? 'bg-[#003087] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paypalMode: 'live' })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      formData.paypalMode === 'live'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Live
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    PayPal Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.paypalClientId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, paypalClientId: e.target.value })
                    }
                    placeholder={formData.paypalMode === 'live' ? 'AY... (Live Client ID)' : 'sb or Sandbox Client ID'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003087]"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Found under PayPal Developer Dashboard → Apps & Credentials.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      PayPal Client Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {showPaypalSecret ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span>{showPaypalSecret ? 'Hide' : 'Show/Edit'}</span>
                    </button>
                  </div>
                  <input
                    type={showPaypalSecret ? 'text' : 'password'}
                    value={formData.paypalClientSecret ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, paypalClientSecret: e.target.value })
                    }
                    placeholder={
                      settings?.paypalClientSecretMasked || 'Enter PayPal client secret (EL...)'
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003087]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    PayPal Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        settings?.webhookUrls?.paypal ||
                        'http://localhost:5001/api/storefront/checkout/paypal/webhook'
                      }
                      className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          settings?.webhookUrls?.paypal ||
                            'http://localhost:5001/api/storefront/checkout/paypal/webhook',
                          'paypal_webhook',
                        )
                      }
                      className="p-2.5 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent rounded-xl border border-slate-200 dark:border-border transition text-xs cursor-pointer shadow-xs"
                      title="Copy webhook URL"
                    >
                      {copiedField === 'paypal_webhook' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Subscribe to <code className="font-mono text-slate-700 dark:text-slate-300">CHECKOUT.ORDER.APPROVED</code> and <code className="font-mono text-slate-700 dark:text-slate-300">PAYMENT.CAPTURE.COMPLETED</code> events.
                  </p>
                </div>

                {paypalTestResult && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 border ${
                      paypalTestResult.success
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {paypalTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{paypalTestResult.message}</p>
                      {paypalTestResult.success && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
                          Mode: {paypalTestResult.mode} • Currencies: {paypalTestResult.supportedCurrencies?.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-border/60 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Settlements: Direct to PayPal Account Balance
              </span>
              <button
                type="button"
                onClick={handleTestPaypal}
                disabled={testingPaypal}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                {testingPaypal ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Test Gateway</span>
              </button>
            </div>
          </div>

          {/* 💵 CASH ON DELIVERY CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-bold text-xl">
                  💵
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900 dark:text-foreground">
                    Cash on Delivery (COD)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Allow customers in India to pay in cash upon package delivery.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.paymentCodActive}
                  onChange={(e) => setFormData({ ...formData, paymentCodActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  COD Convenience Fee (₹)
                </label>
                <input
                  type="number"
                  value={formData.codFee ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, codFee: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Extra handling charge added at checkout.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Minimum Order Value for COD (₹)
                </label>
                <input
                  type="number"
                  value={formData.codMinLimit ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, codMinLimit: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Maximum COD Limit (₹)
                </label>
                <input
                  type="number"
                  value={formData.codMaxLimit ?? 50000}
                  onChange={(e) =>
                    setFormData({ ...formData, codMaxLimit: parseFloat(e.target.value) || 50000 })
                  }
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRANSACTIONS & SETTLEMENT AUDIT ───────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-border/60">
            <div>
              <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-foreground">
                Gateway Payment Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live record of orders processed through Razorpay, PayPal, and Cash on Delivery with MDR fee calculations and settlement status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              <select
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                className="text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border font-bold text-slate-800 dark:text-slate-200 focus:outline-none shadow-xs"
              >
                <option value="ALL">All Gateways</option>
                <option value="RAZORPAY">Razorpay (India)</option>
                <option value="PAYPAL">PayPal (International)</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-accent/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-border/60">
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
              <tbody className="divide-y divide-slate-100 dark:divide-border/40 font-sans">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-accent/20 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-foreground">
                        <div>{t.transactionNumber}</div>
                        {t.orderId && (
                          <div className="text-[10px] text-slate-400 font-sans">
                            Ref: {t.orderId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-foreground">
                          {t.customerName || 'Anonymous Customer'}
                        </div>
                        <div className="text-slate-400 text-[10px]">{t.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            t.gateway === 'RAZORPAY'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80'
                              : t.gateway === 'PAYPAL'
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80'
                          }`}
                        >
                          {t.gateway} • {t.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-foreground">
                        {t.currency === 'INR' ? '₹' : '$'}
                        {t.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {t.gatewayFee === 0 ? (
                          <span className="text-emerald-600 font-bold">0.00 (0% UPI)</span>
                        ) : (
                          `${t.currency === 'INR' ? '₹' : '$'}${t.gatewayFee.toFixed(2)}`
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {t.currency === 'INR' ? '₹' : '$'}
                        {t.netAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            t.status === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80'
                              : t.status === 'REFUNDED'
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.status === 'SUCCESS' && (
                          <button
                            onClick={() => handleRefund(t.id, t.amount)}
                            className="px-3 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 transition cursor-pointer"
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
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <h3 className="font-sans font-bold text-xl text-slate-900 dark:text-foreground">
              MDR Transaction Fee Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              See how automatic multi-gateway routing minimizes your payment processing costs for domestic India sales vs international orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
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
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border font-bold text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <option value="INR">₹ INR (India)</option>
                  <option value="USD">$ USD (Global)</option>
                </select>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-900 dark:text-foreground shadow-xs"
                />
              </div>
            </div>

            {/* India Razorpay UPI Card */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Razorpay UPI (India)</span>
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  0% MDR
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                {calcCurrency === 'INR' ? '₹0.00' : '$0.00'}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Zero processing fee on UPI P2M payments. You receive 100% of order value (
                {calcCurrency === 'INR' ? `₹${calcAmount}` : `$${calcAmount}`}).
              </p>
            </div>

            {/* International PayPal Card */}
            <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 dark:text-sky-300">PayPal Global & Cards</span>
                <span className="text-[10px] font-extrabold bg-[#003087] text-white px-2 py-0.5 rounded-full">
                  3.4% + $0.30
                </span>
              </div>
              <p className="text-2xl font-black text-sky-800 dark:text-sky-300">
                {calcCurrency === 'USD'
                  ? `$${(calcAmount * 0.034 + 0.3).toFixed(2)}`
                  : `₹${(calcAmount * 0.034 + 25).toFixed(2)}`}
              </p>
              <p className="text-[11px] text-sky-700 dark:text-sky-400">
                Global wallet & card processing in 200+ countries with seller protection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── RAZORPAY CONNECT PARTNER MODAL ────────────────────────────────────── */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-black text-xl shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-lg text-white">
                      Razorpay Partner Connect
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-400 text-slate-950">
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
            <div className="px-6 py-3 bg-slate-50 dark:bg-accent/40 border-b border-slate-200 dark:border-border flex items-center justify-between text-xs">
              <div
                className={`flex items-center gap-1.5 font-bold ${connectStep >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${connectStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  1
                </span>
                <span>Authorization</span>
              </div>
              <div className="w-8 h-0.5 bg-slate-200 dark:bg-border"></div>
              <div
                className={`flex items-center gap-1.5 font-bold ${connectStep >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${connectStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  2
                </span>
                <span>Handshake</span>
              </div>
              <div className="w-8 h-0.5 bg-slate-200 dark:bg-border"></div>
              <div
                className={`flex items-center gap-1.5 font-bold ${connectStep >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${connectStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  3
                </span>
                <span>Live & Ready</span>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* STEP 1: Connect Choice & Config */}
              {connectStep === 1 && (
                <div className="space-y-5">
                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-accent/40 border border-slate-200 dark:border-border">
                    <button
                      type="button"
                      onClick={() => setConnectMode('OAUTH')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        connectMode === 'OAUTH'
                          ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Click Partner Connect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectMode('MANUAL')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        connectMode === 'MANUAL'
                          ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                          Link your existing Razorpay Merchant Dashboard or create a new account in
                          seconds. Razorpay Connect automatically configures API keys, webhook
                          endpoints, and KYC verification without manual copy-pasting.
                        </p>
                      </div>

                      {/* Scopes Overview Checklist */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-foreground">
                          Included Merchant Capabilities:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>0% UPI MDR (GPay/PhonePe)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>58+ Banks NetBanking</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>T+1 Instant Bank Payouts</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Automated Webhook Sync</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                            Merchant Display Name
                          </label>
                          <input
                            type="text"
                            value={partnerMerchantName}
                            onChange={(e) => setPartnerMerchantName(e.target.value)}
                            placeholder="e.g. Apex Store Direct"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sandbox Test Mode</p>
                            <p className="text-[10px] text-slate-500">
                              Simulate test payments without debiting real bank accounts
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={partnerTestMode}
                            onChange={(e) => setPartnerTestMode(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Razorpay Key ID
                        </label>
                        <input
                          type="text"
                          value={partnerKeyId}
                          onChange={(e) => setPartnerKeyId(e.target.value)}
                          placeholder="rzp_test_... or rzp_live_..."
                          className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Razorpay Key Secret
                        </label>
                        <input
                          type="password"
                          value={partnerKeySecret}
                          onChange={(e) => setPartnerKeySecret(e.target.value)}
                          placeholder="Enter secret key..."
                          className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Handshake */}
              {connectStep === 2 && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 border-4 border-indigo-200 flex items-center justify-center animate-pulse">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-foreground">
                      Authenticating with Razorpay Partner Network...
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Generating credentials, registering webhook routes, and syncing UPI handles.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Live */}
              {connectStep === 3 && (
                <div className="py-4 space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xl text-slate-900 dark:text-foreground">
                      Razorpay Connect Activated!
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Your store is now authorized to accept UPI @ 0% MDR, NetBanking, and RuPay cards.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-accent/40 border-t border-slate-200 dark:border-border flex items-center justify-between">
              {connectStep === 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartOAuthHandshake}
                    disabled={connectSubmitting}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {connectSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Zap className="w-4 h-4 text-white" />
                    )}
                    <span>
                      {connectMode === 'OAUTH'
                        ? 'Authorize & Connect with Razorpay'
                        : 'Save & Verify Credentials'}
                    </span>
                  </button>
                </>
              )}

              {connectStep === 3 && (
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer"
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
          <div className="bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-white">
                    Security Authorization
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">Email Verification Required</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setPendingPayload(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmVerification} className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Authorization Code Sent</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  To protect your store from unauthorized payment routing, a{' '}
                  <strong>6-digit security code</strong> was sent to your registered email:
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
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Enter 6-Digit Authorization Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    className="w-full pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono font-extrabold text-lg rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Code valid for 10 minutes</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={verificationCountdown > 0 || isResendingOtp}
                    className="font-bold text-indigo-600 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
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
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp || verificationOtp.length < 6}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-white" />
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

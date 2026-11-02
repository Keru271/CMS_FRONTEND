'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SwipeToast } from '@/src/components/ui/SwipeToast';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';
import {
  CreditCard,
  Copy,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ArrowRight,
  ExternalLink,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  CMSPaymentSettings,
  UpdatePaymentSettingsPayload,
  PaymentTransactionData,
  PaymentTransactionsSummary,
  CMSInstalledPaymentAppSummary,
  CMSInstalledApp,
} from '@/src/types';

export const PaymentStudio: React.FC = () => {
  const [settings, setSettings] = useState<CMSPaymentSettings | null>(null);
  const [formData, setFormData] = useState<UpdatePaymentSettingsPayload>({});
  const [installedPaymentApps, setInstalledPaymentApps] = useState<
    (CMSInstalledPaymentAppSummary | CMSInstalledApp)[]
  >([]);
  const [transactions, setTransactions] = useState<PaymentTransactionData[]>([]);
  const [summary, setSummary] = useState<PaymentTransactionsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active Tab: 'gateways' | 'transactions'
  const [activeTab, setActiveTab] = useState<'gateways' | 'transactions'>('gateways');
  const [filterGateway, setFilterGateway] = useState<string>('ALL');

  // Transactions Pagination
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsData, txData, installedAppsData] = await Promise.all([
        cmsService.getPaymentSettings().catch(() => null),
        cmsService.getPaymentTransactions().catch(() => null),
        cmsService.getInstalledApps().catch(() => []),
      ]);

      setSettings(settingsData);

      // Merge payment apps installed from Apps & Integrations
      const paymentAppsFromInstalled = (installedAppsData || []).filter(
        (a) => a.category?.toUpperCase() === 'PAYMENT',
      );
      const paymentAppsFromSettings = settingsData?.installedPaymentApps || [];

      // Combine or fallback
      const combined = paymentAppsFromInstalled.length > 0 ? paymentAppsFromInstalled : paymentAppsFromSettings;
      setInstalledPaymentApps(combined);

      setFormData({
        paymentRazorpayActive: settingsData?.paymentRazorpayActive ?? false,
        paymentPaypalActive: settingsData?.paymentPaypalActive ?? false,
        paymentCodActive: settingsData?.paymentCodActive ?? false,
        paymentTestMode: settingsData?.paymentTestMode ?? true,
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
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [settingsData, txData, installedAppsData] = await Promise.all([
          cmsService.getPaymentSettings().catch(() => null),
          cmsService.getPaymentTransactions().catch(() => null),
          cmsService.getInstalledApps().catch(() => []),
        ]);
        if (ignore) return;
        setSettings(settingsData);
        const paymentAppsFromInstalled = (installedAppsData || []).filter(
          (a) => a.category?.toUpperCase() === 'PAYMENT',
        );
        const paymentAppsFromSettings = settingsData?.installedPaymentApps || [];
        const combined = paymentAppsFromInstalled.length > 0 ? paymentAppsFromInstalled : paymentAppsFromSettings;
        setInstalledPaymentApps(combined);
        setFormData({
          paymentRazorpayActive: settingsData?.paymentRazorpayActive ?? false,
          paymentPaypalActive: settingsData?.paymentPaypalActive ?? false,
          paymentCodActive: settingsData?.paymentCodActive ?? false,
          paymentTestMode: settingsData?.paymentTestMode ?? true,
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
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await cmsService.updatePaymentSettings(formData);
      showToast('Payment policies and Cash on Delivery settings saved successfully!', 'success');
      loadData();
    } catch (err: unknown) {
      console.error('Failed to update payment settings', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast(axiosError?.response?.data?.message || 'Failed to save payment settings', 'error');
    } finally {
      setIsSaving(false);
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
    } catch {
      showToast('Failed to process refund', 'error');
    }
  };

  const filteredTransactions = (transactions || []).filter((t) => {
    if (filterGateway === 'ALL') return true;
    return (t?.gateway || '').toUpperCase() === filterGateway;
  });

  const activePaymentAppsCount = installedPaymentApps.filter((a) => a.status === 'ACTIVE').length;
  const isCodActive = Boolean(formData.paymentCodActive);
  const activeGatewaysCount = activePaymentAppsCount + (isCodActive ? 1 : 0);

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
        <SwipeToast
          open={!!toast}
          type={toast.type}
          title={toast.type === 'success' ? 'Success' : 'Error'}
          description={toast.message}
          onClose={() => setToast(null)}
          duration={4000}
        />
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
                Modular App Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Payment Gateway Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Third-party payment gateways (Razorpay, PayPal, etc.) are installed on-demand from the{' '}
              <Link href="/apps?category=PAYMENT" className="text-indigo-600 dark:text-indigo-400 font-bold underline">
                Apps & Integrations
              </Link>{' '}
              Marketplace. Manage active gateway apps, Cash on Delivery limits, and settlement audits below.
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

            <Link
              href="/apps?category=PAYMENT"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-accent/60 dark:hover:bg-accent text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-2xl border border-slate-200 dark:border-border flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Install Gateways</span>
            </Link>

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
              <span>Save Changes</span>
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

        </div>

        {/* High-level Authentic Metrics Row */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Card 1: Settled Revenue */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Settled Volume
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground font-mono tracking-tight">
                {summary.inrVolume > 0 && summary.usdVolume > 0 ? (
                  <span>
                    ₹{summary.inrVolume.toLocaleString('en-IN')}{' '}
                    <span className="text-sm font-normal text-slate-400">+</span>{' '}
                    ${summary.usdVolume.toLocaleString('en-US')}
                  </span>
                ) : summary.inrVolume > 0 ? (
                  <span>₹{summary.inrVolume.toLocaleString('en-IN')}</span>
                ) : (
                  <span>${(summary.usdVolume ?? summary.totalVolume ?? 0).toLocaleString('en-US')}</span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Collected from {summary.settledCount ?? 0} settled {summary.settledCount === 1 ? 'order' : 'orders'}
              </p>
            </div>

            {/* Card 2: Total Orders */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Orders Processed
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground font-mono tracking-tight">
                {summary.totalOrdersCount ?? 0}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {summary.settledCount ?? 0} settled, {summary.pendingCount ?? 0} pending
              </p>
            </div>

            {/* Card 3: Settlement Success Rate */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Payment Success Rate
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {summary.totalOrdersCount && summary.totalOrdersCount > 0 ? summary.successRatePercentage : 0}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {summary.settledCount ?? 0} of {summary.totalOrdersCount ?? 0} orders settled
              </p>
            </div>

            {/* Card 4: Active Gateways */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border/60 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Active Payment Gateways
              </span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {activeGatewaysCount} Active
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {installedPaymentApps.filter((a) => a.status === 'ACTIVE').length} installed app(s)
                {isCodActive ? ' + COD' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB 1: GATEWAYS & MODULAR APPS ───────────────────────────────────── */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Modular Apps Marketplace Notice & Installed Apps Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-foreground">
                    Installed Payment Gateway Apps
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80">
                    {installedPaymentApps.length} Installed
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  Payment gateways are decoupled into installable integrations. Install Razorpay for domestic UPI/NetBanking or PayPal for international sales directly from the Apps Marketplace.
                </p>
              </div>

              <Link
                href="/apps?category=PAYMENT"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Explore Payment Apps</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {/* Installed Apps Grid or Empty State */}
            {installedPaymentApps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {installedPaymentApps.map((app) => {
                  const isPrimary = app.isPrimary;
                  const isActive = app.status === 'ACTIVE';

                  return (
                    <div
                      key={app.id || app.slug}
                      className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-accent/30 border border-slate-200/80 dark:border-border/70 space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {app.icon ? (
                              <Image
                                src={app.icon}
                                alt={app.name}
                                width={48}
                                height={48}
                                unoptimized
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                💳
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-foreground">
                                  {app.name}
                                </h4>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                {app.description}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-slate-200 text-slate-700 dark:bg-accent dark:text-slate-300'
                            }`}
                          >
                            {app.status || 'CONFIGURED'}
                          </span>
                        </div>

                        {/* Account Credentials / Test Status Preview */}
                        <div className="p-3 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Account Binding:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {app.accountIdentifier || app.slug.toUpperCase() + ' (Configured)'}
                            </span>
                          </div>
                          {app.lastTestedAt && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Last Test:</span>
                              <span
                                className={`font-bold flex items-center gap-1 ${
                                  app.lastTestStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {app.lastTestStatus === 'SUCCESS' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                )}
                                {app.lastTestStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200/60 dark:border-border/60">
                        <span className="text-[11px] text-slate-400">Managed in Apps</span>
                        <Link
                          href={`/apps?category=PAYMENT`}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-accent text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-border shadow-xs flex items-center gap-1 transition"
                        >
                          <span>Configure Credentials</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-accent/20 border border-dashed border-slate-200 dark:border-border flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-xs">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-foreground text-sm">
                    No External Payment Gateways Installed
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your store currently relies on Cash on Delivery. Install Razorpay or PayPal from the Apps Marketplace to start accepting digital payments.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl pt-2">
                  <div className="p-4 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-left space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-700 dark:text-blue-400">Razorpay (India)</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        0% UPI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      UPI (Google Pay, PhonePe), NetBanking (58+ banks), and RuPay cards.
                    </p>
                    <Link
                      href="/apps?category=PAYMENT"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Install in Apps</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-left space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-sky-700 dark:text-sky-400">PayPal (Global)</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                        200+ FX
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      PayPal Wallet, Pay in 4 (BNPL), and international debit/credit cards.
                    </p>
                    <Link
                      href="/apps?category=PAYMENT"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Install in Apps</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 💵 CASH ON DELIVERY CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center font-bold text-xl">
                  💵
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900 dark:text-foreground">
                    Cash on Delivery (COD) Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Native store payment option allowing customers to pay cash upon package receipt.
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  COD Handling Fee (₹)
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
                  Added to order total when COD is selected.
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

          {/* Webhook Endpoints Reference Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-foreground">
                Payment Webhook Endpoints
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When installing gateway apps in the Apps section, paste these webhook callback URLs into the provider dashboard to receive asynchronous payment confirmations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/30 border border-slate-200/80 dark:border-border space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Razorpay Webhook Callback
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      settings?.webhookUrls?.razorpay ||
                      'http://localhost:5001/api/storefront/checkout/razorpay/webhook'
                    }
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(settings?.webhookUrls?.razorpay || '', 'rzp_webhook')
                    }
                    className="p-2 bg-white dark:bg-card hover:bg-slate-50 rounded-xl border border-slate-200 dark:border-border transition shadow-xs cursor-pointer"
                  >
                    {copiedField === 'rzp_webhook' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/30 border border-slate-200/80 dark:border-border space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  PayPal Webhook Callback
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      settings?.webhookUrls?.paypal ||
                      'http://localhost:5001/api/storefront/checkout/paypal/webhook'
                    }
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(settings?.webhookUrls?.paypal || '', 'paypal_webhook')
                    }
                    className="p-2 bg-white dark:bg-card hover:bg-slate-50 rounded-xl border border-slate-200 dark:border-border transition shadow-xs cursor-pointer"
                  >
                    {copiedField === 'paypal_webhook' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>
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
                onChange={(e) => {
                  setFilterGateway(e.target.value);
                  setTxPage(1);
                }}
                className="text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border font-bold text-slate-800 dark:text-slate-200 focus:outline-none shadow-xs"
              >
                <option value="ALL">All Gateways</option>
                <option value="RAZORPAY">Razorpay</option>
                <option value="PAYPAL">PayPal</option>
                <option value="COD">Cash on Delivery</option>
              </select>
              <TableRefreshButton onRefresh={loadData} isLoading={isLoading} size="sm" />
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
                  filteredTransactions
                    .slice((txPage - 1) * txPageSize, txPage * txPageSize)
                    .map((t) => (
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
                          {t.currency === 'INR' ? '₹' : '$'}
                          {t.gatewayFee.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {t.currency === 'INR' ? '₹' : '$'}
                          {t.netAmount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              t.status === 'SETTLED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80'
                                : t.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {t.status === 'SETTLED' && (
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

          <TablePagination
            currentPage={txPage}
            totalItems={filteredTransactions.length}
            pageSize={txPageSize}
            onPageChange={(p) => setTxPage(p)}
            onPageSizeChange={(s) => {
              setTxPageSize(s);
              setTxPage(1);
            }}
            itemName="transactions"
          />
        </div>
      )}
    </div>
  );
};

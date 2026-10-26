'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Palette,
  Globe,
  Store,
  CreditCard,
  Truck,
  ArrowRight,
  ShieldCheck,
  Share2,
  PauseCircle,
  RefreshCw,
} from 'lucide-react';
import { useCMS } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { StoreLaunchReadiness, StoreLaunchChecklistItem } from '@/src/types';
import { firePartyPopper } from '@/src/utils/confettiPopper';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreUpdated?: () => void;
}

export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  onStoreUpdated,
}) => {
  const {
    activeStore,
    refreshStores,
    switchActiveStore,
    openAddProductModal,
    updateActiveStoreStatus,
    setActiveStore,
  } = useCMS();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readiness, setReadiness] = useState<StoreLaunchReadiness | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCelebrationStep, setIsCelebrationStep] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const STOREFRONT_BASE = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  // Fetch live readiness checklist whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsCelebrationStep(false);
      setErrorMessage(null);
      return;
    }

    const fetchReadiness = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const storeIdOrSlug = activeStore?.id || activeStore?.slug;
        const data = await cmsService.getStoreLaunchReadiness(storeIdOrSlug);
        setReadiness(data);
      } catch (err: any) {
        console.error('Failed to load store readiness:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to load pre-flight readiness checklist.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadiness();
  }, [isOpen, activeStore?.id, activeStore?.slug]);

  if (!isOpen) return null;

  const storeSlug = readiness?.storeSlug || activeStore?.slug || '';
  const liveStorefrontUrl = `${STOREFRONT_BASE}?storeSlug=${storeSlug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(liveStorefrontUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const handleConfirmGoLive = async (allowForce = false) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const storeIdOrSlug = activeStore?.id || activeStore?.slug;
      const result = await cmsService.goLiveStore(storeIdOrSlug, allowForce);

      // Fire celebratory popper explosion
      firePartyPopper();

      // Immediately synchronize active store and storeStatus to ACTIVE / LIVE across context
      updateActiveStoreStatus('ACTIVE');
      if (result.store) {
        setActiveStore(result.store);
      }

      // Refresh stores list and context
      if (onStoreUpdated) onStoreUpdated();
      await refreshStores();

      // Transition to celebration card
      setIsCelebrationStep(true);
    } catch (err: any) {
      console.error('Failed to publish store live:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to go live.';
      setErrorMessage(msg);
      if (err.response?.data?.readiness) {
        setReadiness(err.response.data.readiness);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseStore = async () => {
    if (!confirm('Are you sure you want to suspend this store and revert to Pending stage (pre-launch mode)?')) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const storeIdOrSlug = activeStore?.id || activeStore?.slug;
      const result = await cmsService.pauseStore(storeIdOrSlug);

      // Immediately synchronize active store and storeStatus to PENDING across context
      updateActiveStoreStatus('PENDING');
      if (result.store) {
        setActiveStore(result.store);
      }

      if (onStoreUpdated) onStoreUpdated();
      await refreshStores();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to suspend store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'catalog':
        return <ShoppingBag className="w-4 h-4 text-sky-500" />;
      case 'design':
        return <Palette className="w-4 h-4 text-purple-500" />;
      case 'online presence':
        return <Globe className="w-4 h-4 text-emerald-500" />;
      case 'settings':
        return <Store className="w-4 h-4 text-amber-500" />;
      case 'checkout':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'fulfillment':
        return <Truck className="w-4 h-4 text-teal-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  const isStoreAlreadyLive =
    readiness?.isLive ||
    activeStore?.status === 'ACTIVE' ||
    activeStore?.status === 'LIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#2C2C2E] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4.5 border-b border-slate-100 dark:border-[#2C2C2E] flex items-center justify-between bg-slate-50/70 dark:bg-[#252528]/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                isStoreAlreadyLive
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-[#00E5FF]'
              }`}
            >
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isCelebrationStep ? '🎉 Store Launched!' : 'Go Live Checklist'}</span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                    isStoreAlreadyLive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  Stage: {isStoreAlreadyLive ? 'Live' : 'Pending'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#98989D]">
                {activeStore?.name || 'Active Store'} · Ready to sell to customers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/80 dark:hover:bg-[#2C2C2E] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-sky-600 dark:border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500 dark:text-[#98989D] animate-pulse">
                Auditing pre-flight launch prerequisites...
              </p>
            </div>
          ) : isCelebrationStep ? (
            /* Celebration Card */
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-sky-500 via-emerald-400 to-indigo-500 p-0.5 shadow-xl">
                  <div className="w-full h-full bg-white dark:bg-[#1E1E1E] rounded-[22px] flex items-center justify-center text-3xl">
                    🚀
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Your Store is Officially Live!
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#98989D] max-w-md mx-auto">
                  Customers can now explore your catalog, add items to cart, and checkout seamlessly.
                </p>
              </div>

              {/* URL Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#252528] rounded-2xl border border-slate-200 dark:border-[#2C2C2E] flex items-center justify-between gap-3 text-left">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Storefront URL</div>
                  <div className="text-xs font-mono font-semibold text-sky-600 dark:text-[#00E5FF] truncate">
                    {liveStorefrontUrl}
                  </div>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-300 dark:border-[#3A3A3C] text-xs font-semibold text-slate-700 dark:text-white hover:border-sky-500 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={liveStorefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Live Storefront</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#2C2C2E] dark:hover:bg-[#38383A] text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Checklist & Pre-flight Inspection */
            <>
              {/* Overall Readiness Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#2C2C2E] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    Launch Readiness Progress
                  </span>
                  <span className="font-mono font-bold text-sky-600 dark:text-[#00E5FF]">
                    {readiness?.completedCount || 0} / {readiness?.totalCount || 0} Verified ({readiness?.progressPercent || 0}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-[#1E1E1E] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      readiness?.isReady
                        ? 'bg-linear-to-r from-emerald-500 to-teal-400'
                        : 'bg-linear-to-r from-sky-500 to-indigo-500'
                    }`}
                    style={{ width: `${readiness?.progressPercent || 0}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-[#98989D]">
                  {isStoreAlreadyLive
                    ? '🟢 This store is live and operational. Customers can browse and purchase freely.'
                    : readiness?.isReady
                    ? '✨ All mandatory prerequisites are fulfilled! Your store is 100% prepared to launch live.'
                    : `⚠️ ${readiness?.missingMandatory?.length || 0} mandatory requirement${
                        (readiness?.missingMandatory?.length || 0) > 1 ? 's are' : ' is'
                      } remaining before launch.`}
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Checklist Items */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 dark:text-[#98989D] uppercase tracking-wider px-1">
                  Mandatory Store Prerequisites
                </div>

                <div className="space-y-2">
                  {readiness?.checklist?.map((item) => {
                    const isDone = item.isComplete;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#2C2C2E]'
                            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5 stroke-3" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.title}
                              </span>
                              {item.isMandatory && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-[#2C2C2E] text-slate-500 dark:text-[#98989D]">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-[#98989D] truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Quick action button for incomplete item */}
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (item.id === 'products') {
                                openAddProductModal();
                              } else {
                                router.push(item.actionUrl);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span>{item.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isCelebrationStep && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-[#2C2C2E] bg-slate-50/70 dark:bg-[#252528]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {isStoreAlreadyLive ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Store is Live & Active
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">
                  Stage: PENDING (Pre-launch mode)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2C2C2E] text-xs font-bold text-slate-600 dark:text-[#98989D] hover:bg-slate-100 dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer w-full sm:w-auto"
              >
                Close
              </button>

              {isStoreAlreadyLive ? (
                <button
                  type="button"
                  onClick={handlePauseStore}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs w-full sm:w-auto"
                  title="Suspend store and revert back to pre-launch stage"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Suspending...</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Suspend Store</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConfirmGoLive(false)}
                  disabled={isSubmitting || isLoading}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md w-full sm:w-auto ${
                    readiness?.isReady
                      ? 'bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25 animate-pulse'
                      : 'bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>🚀 Go Live Now!</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

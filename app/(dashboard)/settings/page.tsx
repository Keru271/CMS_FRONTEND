'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { UserPreferencesStudio } from '@/src/components/cms/UserPreferencesStudio';
import {
  Store,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Palette,
  Building2,
  Copy,
  Check,
  Hash,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'store' ? 'store' : 'preferences';
  const [activeMainTab, setActiveMainTab] = useState<'preferences' | 'store'>(initialTab);
  const [copied, setCopied] = useState(false);

  const { merchantData, activeStore } = useCMSContext();

  const storeId = activeStore?.id || merchantData?.store?.id || cmsService.getActiveStoreId() || '';

  const handleCopyStoreId = async () => {
    if (!storeId) return;
    try {
      await navigator.clipboard.writeText(storeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy storeId:', err);
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'store') {
      setActiveMainTab('store');
    } else if (tabParam === 'preferences') {
      setActiveMainTab('preferences');
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Studio Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Account & Store Settings
          </h1>
          <p className="text-xs sm:text-sm font-sans text-slate-500 mt-1">
            Manage your personal administrative preferences, regional localization, and store brand identity.
          </p>

          {/* Store ID Badge */}
          {storeId && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Store ID:
                </span>
                <code className="font-mono font-bold text-slate-900 text-xs">
                  {storeId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyStoreId}
                  className="ml-1 p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy Store ID to clipboard"
                  aria-label="Copy Store ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {copied && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Studio Switcher Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveMainTab('preferences');
              router.replace('/settings?tab=preferences');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'preferences'
                ? 'bg-slate-900 text-[#00E5FF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>User Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMainTab('store');
              router.replace('/settings?tab=store');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'store'
                ? 'bg-slate-900 text-[#00E5FF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store Identity</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USER PREFERENCES STUDIO */}
      {activeMainTab === 'preferences' && <UserPreferencesStudio />}

      {/* TAB 2: STORE IDENTITY & THEME OVERVIEW */}
      {activeMainTab === 'store' && (
        <div className="p-6 sm:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-slate-900" />
                <span>Active Store Identity & Theme Settings</span>
              </h3>
              <p className="text-xs sm:text-sm font-sans text-slate-500 mt-0.5">
                Configured brand identity, chosen storefront design specifications, and merchant contact parameters.
              </p>
            </div>

            <button
              onClick={() => router.push('/store-setup')}
              className="px-4.5 py-2.5 bg-slate-900 hover:bg-black text-[#00E5FF] text-xs font-sans font-bold rounded-xl shadow-xs flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#00E5FF]" />
              <span>Full Store Configuration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {merchantData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
              {merchantData.store && (
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                      Store Brand
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900 font-mono">
                      {merchantData.store.currency}
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-sans font-bold text-slate-900">
                      {merchantData.store.storeName}
                    </p>
                    <p className="text-xs font-sans text-slate-500 italic mt-0.5">
                      "{merchantData.store.tagline || 'Official Store'}"
                    </p>
                  </div>

                  {/* Store ID in Card */}
                  {storeId && (
                    <div className="pt-2.5 border-t border-slate-200">
                      <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Store ID
                      </span>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200">
                        <code className="text-xs font-mono font-bold text-slate-900 truncate">
                          {storeId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyStoreId}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-[#00E5FF] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title="Copy Store ID"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {merchantData.selectedTemplate && (
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5 shadow-xs">
                  <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                    Selected Storefront Theme
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 ring-2 ring-white"
                      style={{ backgroundColor: merchantData.selectedTemplate.accentColor || '#00E5FF' }}
                    />
                    <p className="text-base font-sans font-bold text-slate-900">
                      {merchantData.selectedTemplate.name}
                    </p>
                  </div>
                  <p className="text-xs font-sans text-slate-500">
                    {merchantData.selectedTemplate.tagline}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/themes')}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1.5 cursor-pointer pt-1"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Customize in Theme Studio</span>
                  </button>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5 shadow-xs">
                <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                  Primary Account Holder
                </span>
                <p className="text-base font-sans font-bold text-slate-900">
                  {merchantData.merchant.firstName} {merchantData.merchant.lastName}
                </p>
                <p className="text-xs font-sans text-slate-500">{merchantData.merchant.email}</p>
                <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated Store Owner</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

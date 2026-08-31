'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { UserPreferencesStudio } from '@/src/components/cms/UserPreferencesStudio';
import { Store, Sliders, ArrowRight, ShieldCheck, Palette, Building2, Copy, Check, Hash } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'store' ? 'store' : 'preferences';
  const [activeMainTab, setActiveMainTab] = useState<'preferences' | 'store'>(initialTab);
  const [copied, setCopied] = useState(false);

  const { merchantData, activeStore } = useCMSContext();

  const storeId = activeStore?.id || merchantData?.store?.id || (typeof window !== 'undefined' ? localStorage.getItem('selected_store_id') : '') || '';

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
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd5e0] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-[#191a1b]">Account & Store Settings</h1>
          <p className="text-xs font-sans text-[#5e5a5a] mt-0.5">
            Manage your personal administrative preferences, regional localization, and store brand identity.
          </p>

          {/* Store ID Badge */}
          {storeId && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#cbd5e0] shadow-xs text-xs">
                <Hash className="w-3 h-3 text-[#5e5a5a]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5a5a]">Store ID:</span>
                <code className="font-mono font-bold text-[#191a1b] text-xs selection:bg-[#d4ff4c]">{storeId}</code>
                <button
                  type="button"
                  onClick={handleCopyStoreId}
                  className="ml-1 p-1 rounded-md text-[#5e5a5a] hover:text-[#191a1b] hover:bg-[#fdf1ef] transition-colors cursor-pointer"
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
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 animate-in fade-in">
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Studio Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white border border-[#cbd5e0] shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveMainTab('preferences');
              router.replace('/settings?tab=preferences');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMainTab === 'preferences'
                ? 'bg-[#191a1b] text-[#d4ff4c] shadow-xs'
                : 'text-[#5e5a5a] hover:text-[#191a1b] hover:bg-[#fdf1ef]'
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
                ? 'bg-[#191a1b] text-[#d4ff4c] shadow-xs'
                : 'text-[#5e5a5a] hover:text-[#191a1b] hover:bg-[#fdf1ef]'
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
        <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-normal text-xl text-[#191a1b] flex items-center gap-2">
                <Store className="w-5 h-5 text-[#191a1b]" />
                <span>Active Store Identity & Theme Settings</span>
              </h3>
              <p className="text-xs font-sans text-[#5e5a5a]">
                Configured brand identity, chosen storefront design specifications, and merchant contact parameters.
              </p>
            </div>

            <button
              onClick={() => router.push('/store-setup')}
              className="px-4 py-2 bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] text-xs font-sans font-medium rounded-xl shadow-xs flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#d4ff4c]" />
              <span>Full Store Configuration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {merchantData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#cbd5e0]/60">
              {merchantData.store && (
                <div className="p-5 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-[#5e5a5a] uppercase tracking-wider block">
                      Store Brand
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#cbd5e0] text-[#191a1b]">
                      {merchantData.store.currency}
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-serif font-normal text-[#191a1b]">{merchantData.store.storeName}</p>
                    <p className="text-xs font-sans text-[#5e5a5a] italic">"{merchantData.store.tagline || 'Official Store'}"</p>
                  </div>

                  {/* Store ID in Card */}
                  {storeId && (
                    <div className="pt-2 border-t border-[#cbd5e0]/60">
                      <span className="text-[10px] font-sans font-bold text-[#5e5a5a] uppercase tracking-wider block mb-1">
                        Store ID
                      </span>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#cbd5e0]">
                        <code className="text-[11px] font-mono font-bold text-[#191a1b] truncate selection:bg-[#d4ff4c]">
                          {storeId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyStoreId}
                          className="px-2 py-1 rounded-lg bg-[#fdf1ef] hover:bg-[#191a1b] text-[#191a1b] hover:text-[#d4ff4c] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title="Copy Store ID"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {merchantData.selectedTemplate && (
                <div className="p-5 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-2">
                  <span className="text-[10px] font-sans font-bold text-[#5e5a5a] uppercase tracking-wider block">
                    Selected Storefront Theme
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                      style={{ backgroundColor: merchantData.selectedTemplate.accentColor }}
                    />
                    <p className="text-base font-serif font-normal text-[#191a1b]">
                      {merchantData.selectedTemplate.name}
                    </p>
                  </div>
                  <p className="text-xs font-sans text-[#5e5a5a]">{merchantData.selectedTemplate.tagline}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/themes')}
                    className="text-[11px] text-indigo-700 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Palette className="w-3 h-3" />
                    <span>Customize in Theme Studio</span>
                  </button>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-2">
                <span className="text-[10px] font-sans font-bold text-[#5e5a5a] uppercase tracking-wider block">
                  Primary Account Holder
                </span>
                <p className="text-base font-serif font-normal text-[#191a1b]">
                  {merchantData.merchant.firstName} {merchantData.merchant.lastName}
                </p>
                <p className="text-xs font-sans text-[#5e5a5a]">
                  {merchantData.merchant.email}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMainTab('preferences')}
                  className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Edit Personal Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

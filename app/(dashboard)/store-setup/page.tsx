'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { StoreSetup } from '@/src/components/cms/StoreSetup';
import { WhatsAppStoreSetup } from '@/src/components/cms/WhatsAppStoreSetup';
import { MessageSquare, Sliders, Store, CheckCircle } from 'lucide-react';
import { StoreSetupData } from '@/src/types';

function StoreSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { merchantData, setMerchantData } = useCMSContext();

  const userKey = (merchantData?.merchant?.email || '').toLowerCase().trim();

  // Mode state: defaults to 'chat' for the conversational WhatsApp setup experience
  const [setupMode, setSetupMode] = useState<'chat' | 'form'>('chat');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const modeParam = searchParams.get('mode');
    if (modeParam === 'form') {
      setSetupMode('form');
    } else {
      setSetupMode('chat');
    }
  }, [searchParams]);

  const markSetupCompleted = () => {
    if (typeof window !== 'undefined') {
      if (userKey) {
        localStorage.setItem(`whatsapp_setup_completed_${userKey}`, 'true');
        localStorage.setItem(`whatsapp_setup_opened_${userKey}`, 'true');
      }
      localStorage.setItem('whatsapp_setup_completed', 'true');
      localStorage.setItem('whatsapp_setup_opened', 'true');
      sessionStorage.removeItem('open_whatsapp_setup_once');
      sessionStorage.removeItem('just_registered');
    }
  };

  const handleSaved = (updated: StoreSetupData) => {
    markSetupCompleted();
    if (merchantData) {
      setMerchantData({
        ...merchantData,
        store: {
          id: merchantData.store?.id || undefined,
          slug: updated.slug || merchantData.store?.slug || 'store',
          storeName: updated.name,
          currency: updated.currency,
          tagline: updated.description || merchantData.store?.tagline || 'Official Store',
          category: merchantData.store?.category || 'General',
          status: merchantData.store?.status || 'ACTIVE',
          supportEmail: updated.contactEmail || merchantData.store?.supportEmail || '',
          supportPhone: updated.contactPhone || merchantData.store?.supportPhone || '',
        },
      });
    }
    // Navigate straight to dashboard once setup is completed
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleSwitchToForm = () => {
    setSetupMode('form');
  };

  const handleSwitchToChat = () => {
    setSetupMode('chat');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ─── MODE SELECTOR BANNER ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#cbd5e0] shadow-statamic">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#075e54] text-white flex items-center justify-center shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#191a1b] flex items-center gap-2">
              <span>Store Setup Center</span>
              <span className="text-[10px] bg-[#d9fdd3] text-[#075e54] border border-[#b2dfdb] px-2 py-0.5 rounded-full font-sans font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-ping" />
                WhatsApp Assistant Active
              </span>
            </h2>
            <p className="text-xs text-[#5e5a5a]">
              Set up your storefront brand, contact channels, themes, and regional currency in minutes.
            </p>
          </div>
        </div>

        {/* View Switcher: Toggle between WhatsApp Chat and Form */}
        <div className="flex items-center p-1 bg-[#f0f2f5] rounded-xl border border-[#cbd5e0] shrink-0 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleSwitchToChat}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${setupMode === 'chat'
                ? 'bg-[#075e54] text-white shadow-xs'
                : 'text-[#54656f] hover:text-[#111b21]'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Setup Chat</span>
            {setupMode === 'chat' && <span className="w-2 h-2 rounded-full bg-[#25d366] animate-ping hidden sm:inline-block" />}
          </button>

          <button
            type="button"
            onClick={handleSwitchToForm}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${setupMode === 'form'
                ? 'bg-[#191a1b] text-[#d4ff4c] shadow-xs'
                : 'text-[#54656f] hover:text-[#111b21]'
              }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings Form</span>
          </button>
        </div>
      </div>

      {/* ─── ACTIVE SETUP VIEW ──────────────────────────────────────── */}
      {setupMode === 'chat' ? (
        <WhatsAppStoreSetup
          onSaved={handleSaved}
          onSwitchToForm={handleSwitchToForm}
        />
      ) : (
        <StoreSetup onSaved={handleSaved} />
      )}
    </div>
  );
}

export default function StoreSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-white rounded-2xl border border-[#cbd5e0]" />
          <div className="h-96 bg-white rounded-2xl border border-[#cbd5e0]" />
        </div>
      }
    >
      <StoreSetupContent />
    </Suspense>
  );
}

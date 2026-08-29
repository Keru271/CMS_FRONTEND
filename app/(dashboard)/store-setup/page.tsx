'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { StoreSetup } from '@/src/components/cms/StoreSetup';
import { WhatsAppStoreSetup } from '@/src/components/cms/WhatsAppStoreSetup';
import { MessageSquare, Sliders, Store, CheckCircle } from 'lucide-react';
import { StoreSetupData } from '@/src/types';

function StoreSetupContent() {
  const searchParams = useSearchParams();
  const { merchantData, setMerchantData } = useCMSContext();

  const userKey = (merchantData?.merchant?.email || '').toLowerCase().trim();

  // Mode state: defaults to 'form' so WhatsApp chat NEVER opens automatically on regular visits
  const [setupMode, setSetupMode] = useState<'chat' | 'form'>('form');
  const [isChatAllowed, setIsChatAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isFirstTimeParam = searchParams.get('first_time') === 'true';
    const isOneTimeSession = sessionStorage.getItem('open_whatsapp_setup_once') === 'true';
    const isAlreadyCompleted = userKey
      ? localStorage.getItem(`whatsapp_setup_completed_${userKey}`) === 'true'
      : localStorage.getItem('whatsapp_setup_completed') === 'true';

    // WhatsApp setup chat is ONLY allowed to open ONCE immediately following registration
    if ((isFirstTimeParam || isOneTimeSession) && !isAlreadyCompleted) {
      setSetupMode('chat');
      setIsChatAllowed(true);
      // Consume the single-use token immediately so it cannot be triggered again
      sessionStorage.removeItem('open_whatsapp_setup_once');
      if (userKey) {
        localStorage.setItem(`whatsapp_setup_opened_${userKey}`, 'true');
      }
      localStorage.setItem('whatsapp_setup_opened', 'true');
      // Clean query parameter from URL without page reload
      window.history.replaceState({}, '', '/store-setup');
    } else {
      // For all regular visits, subsequent visits, and returning users: always 'form'
      setSetupMode('form');
      setIsChatAllowed(false);
    }
  }, [searchParams, userKey]);

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
    setIsChatAllowed(false);
  };

  const handleSaved = (updated: StoreSetupData) => {
    markSetupCompleted();
    if (merchantData) {
      setMerchantData({
        ...merchantData,
        store: {
          id: merchantData.store?.id || 'store-active',
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
  };

  const handleSwitchToForm = () => {
    markSetupCompleted();
    setSetupMode('form');
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
              <span>Store Configuration Center</span>
              <span className="text-[10px] bg-[#d9fdd3] text-[#075e54] border border-[#b2dfdb] px-2 py-0.5 rounded-full font-sans font-semibold">
                Live Studio
              </span>
            </h2>
            <p className="text-xs text-[#5e5a5a]">
              Configure your store brand identity, storefront theme layout, and merchant parameters.
            </p>
          </div>
        </div>

        {/* View Switcher: WhatsApp Chat is only switchable if currently active during post-registration */}
        {isChatAllowed && setupMode === 'chat' ? (
          <div className="flex items-center p-1 bg-[#f0f2f5] rounded-xl border border-[#cbd5e0] shrink-0 self-stretch sm:self-auto">
            <div className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-[#075e54] text-white shadow-xs">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Setup Chat</span>
              <span className="w-2 h-2 rounded-full bg-[#25d366] animate-ping hidden sm:inline-block" />
            </div>

            <button
              onClick={handleSwitchToForm}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 text-[#54656f] hover:text-[#111b21] transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Switch to Form</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-xs text-[#166534] font-semibold">
            <CheckCircle className="w-4 h-4 text-[#16a34a]" />
            <span>Store Configuration Settings</span>
          </div>
        )}
      </div>

      {/* ─── ACTIVE SETUP VIEW ──────────────────────────────────────── */}
      {setupMode === 'chat' && isChatAllowed ? (
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

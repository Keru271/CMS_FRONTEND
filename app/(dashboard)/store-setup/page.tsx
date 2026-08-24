'use client';

import React, { useState } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { StoreSetup } from '@/src/components/cms/StoreSetup';
import { WhatsAppStoreSetup } from '@/src/components/cms/WhatsAppStoreSetup';
import { MessageSquare, Sliders, Sparkles, Store } from 'lucide-react';
import { StoreSetupData } from '@/src/types';

export default function StoreSetupPage() {
  const { merchantData, setMerchantData } = useCMSContext();
  const [setupMode, setSetupMode] = useState<'chat' | 'form'>('chat');

  const handleSaved = (updated: StoreSetupData) => {
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

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-[#f0f2f5] rounded-xl border border-[#cbd5e0] shrink-0 self-stretch sm:self-auto">
          <button
            onClick={() => setSetupMode('chat')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              setupMode === 'chat'
                ? 'bg-[#075e54] text-white shadow-xs'
                : 'text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Setup Chat</span>
            <span className="w-2 h-2 rounded-full bg-[#25d366] animate-ping hidden sm:inline-block" />
          </button>

          <button
            onClick={() => setSetupMode('form')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              setupMode === 'form'
                ? 'bg-[#191a1b] text-[#d4ff4c] shadow-xs'
                : 'text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Detailed Settings Form</span>
          </button>
        </div>
      </div>

      {/* ─── ACTIVE SETUP VIEW ──────────────────────────────────────── */}
      {setupMode === 'chat' ? (
        <WhatsAppStoreSetup
          onSaved={handleSaved}
          onSwitchToForm={() => setSetupMode('form')}
        />
      ) : (
        <StoreSetup onSaved={handleSaved} />
      )}
    </div>
  );
}


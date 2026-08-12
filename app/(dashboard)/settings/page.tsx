'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { Store, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { merchantData } = useCMSContext();

  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 sm:p-8 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic space-y-6">
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
            onClick={() => router.push('/merchant-details')}
            className="px-4 py-2 bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] text-xs font-sans font-medium rounded-lg shadow-xs flex items-center gap-2 shrink-0 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#d4ff4c]" />
            <span>Re-run Onboarding Setup Studio</span>
          </button>
        </div>

        {merchantData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#cbd5e0]/60">
            {merchantData.store && (
              <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
                <span className="text-[10px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider block">
                  Store Brand
                </span>
                <p className="text-sm font-serif font-normal text-[#191a1b]">{merchantData.store.storeName}</p>
                <p className="text-xs font-sans text-[#5e5a5a] italic">"{merchantData.store.tagline || 'Official Store'}"</p>
              </div>
            )}

            {merchantData.selectedTemplate && (
              <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
                <span className="text-[10px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider block">
                  Selected Storefront Theme
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shadow-xs"
                    style={{ backgroundColor: merchantData.selectedTemplate.accentColor }}
                  />
                  <p className="text-sm font-serif font-normal text-[#191a1b]">
                    {merchantData.selectedTemplate.name}
                  </p>
                </div>
                <p className="text-xs font-sans text-[#5e5a5a]">{merchantData.selectedTemplate.tagline}</p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] space-y-1">
              <span className="text-[10px] font-sans font-medium text-[#5e5a5a] uppercase tracking-wider block">
                Merchant Profile
              </span>
              <p className="text-sm font-serif font-normal text-[#191a1b]">
                {merchantData.merchant.firstName} {merchantData.merchant.lastName}
              </p>
              <p className="text-xs font-sans text-[#5e5a5a]">
                {merchantData.merchant.email} • {merchantData.merchant.mobileNumber}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

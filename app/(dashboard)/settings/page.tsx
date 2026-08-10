'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { Button } from '@heroui/react';
import { Store, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { merchantData } = useCMSContext();

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-sage-text flex items-center gap-2">
              <Store className="w-5 h-5 text-sage-primary" />
              <span>Active Store Identity & Theme Settings</span>
            </h3>
            <p className="text-xs text-sage-muted">
              Configured brand identity, chosen storefront design specifications, and merchant contact parameters.
            </p>
          </div>

          <Button
            onClick={() => router.push('/merchant-details')}
            className="px-5 py-2.5 bg-sage-primary hover:bg-sage-hover text-white text-xs font-extrabold rounded-2xl shadow-sm flex items-center gap-2 min-h-[44px] shrink-0 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-run Onboarding Setup Studio</span>
          </Button>
        </div>

        {merchantData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-sage-border">
            <div className="p-4 rounded-2xl bg-sage-accent/30 border border-sage-border space-y-1">
              <span className="text-[10px] text-sage-muted uppercase font-bold block">
                Store Brand
              </span>
              <p className="text-sm font-black text-sage-text">{merchantData.store.storeName}</p>
              <p className="text-xs text-sage-muted italic">"{merchantData.store.tagline}"</p>
            </div>

            <div className="p-4 rounded-2xl bg-sage-accent/30 border border-sage-border space-y-1">
              <span className="text-[10px] text-sage-muted uppercase font-bold block">
                Selected Storefront Theme
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-xs"
                  style={{ backgroundColor: merchantData.selectedTemplate.accentColor }}
                />
                <p className="text-sm font-black text-sage-text">
                  {merchantData.selectedTemplate.name}
                </p>
              </div>
              <p className="text-xs text-sage-muted">{merchantData.selectedTemplate.tagline}</p>
            </div>

            <div className="p-4 rounded-2xl bg-sage-accent/30 border border-sage-border space-y-1">
              <span className="text-[10px] text-sage-muted uppercase font-bold block">
                Merchant Profile
              </span>
              <p className="text-sm font-black text-sage-text">
                {merchantData.merchant.firstName} {merchantData.merchant.lastName}
              </p>
              <p className="text-xs text-sage-muted">
                {merchantData.merchant.email} • {merchantData.merchant.mobileNumber}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

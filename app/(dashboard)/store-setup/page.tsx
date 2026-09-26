'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { StoreSetup } from '@/src/components/cms/StoreSetup';
import { StoreSetupData } from '@/src/types';

function StoreSetupContent() {
  const router = useRouter();
  const { merchantData, setMerchantData } = useCMSContext();

  const handleSaved = (updated: StoreSetupData) => {
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
    // Navigate to dashboard after saving
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      <StoreSetup onSaved={handleSaved} />
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


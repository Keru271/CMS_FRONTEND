'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { StoreSetup } from '@/src/components/cms/StoreSetup';

export default function StoreSetupPage() {
  const { merchantData, setMerchantData } = useCMSContext();

  return (
    <StoreSetup
      onSaved={(updated) => {
        if (merchantData) {
          setMerchantData({
            ...merchantData,
            store: {
              storeName: updated.name,
              currency: updated.currency,
              tagline: updated.description || merchantData.store?.tagline || 'Official Store',
              category: merchantData.store?.category || 'General',
              supportEmail: updated.contactEmail || merchantData.store?.supportEmail || '',
              supportPhone: updated.contactPhone || merchantData.store?.supportPhone || '',
            },
          });
        }
      }}
    />
  );
}

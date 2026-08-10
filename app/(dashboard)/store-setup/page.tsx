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
              ...merchantData.store,
              storeName: updated.name,
              currency: updated.currency,
            },
          });
        }
      }}
    />
  );
}

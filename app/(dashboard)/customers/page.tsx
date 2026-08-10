'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { CustomerStudio } from '@/src/components/cms/CustomerStudio';

export default function CustomersPage() {
  const { merchantData } = useCMSContext();

  return (
    <div className="space-y-6">
      <CustomerStudio />
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-sage-accent text-sage-primary font-black text-xs border border-sage-border">
          CRM Database
        </span>
        <h3 className="font-extrabold text-xl text-sage-text">Customer Profiles & History</h3>
        <p className="text-xs text-sage-muted max-w-md mx-auto">
          Manage buyer profiles, transaction logs, and customer communications for {merchantData?.store?.storeName || 'your store'}.
        </p>
      </div>
    </div>
  );
}

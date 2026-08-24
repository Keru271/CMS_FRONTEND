import React from 'react';
import { Metadata } from 'next';
import { BillingStudio } from '@/src/components/cms/BillingStudio';

export const metadata: Metadata = {
  title: 'Store Pricing Tiers & Billing | Store Studio',
  description: 'Manage store subscription, upgrade pricing tiers, and update billing payment methods anytime.',
};

export default function BillingPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <BillingStudio />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { LoyaltyStudio } from '@/src/components/cms/LoyaltyStudio';

export const metadata: Metadata = {
  title: 'Customer Loyalty & VIP Rewards Studio | Store Studio',
  description: 'Manage loyalty points rules, VIP tier multipliers, and customer reward ledgers.',
};

export default function LoyaltyPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <LoyaltyStudio />
    </div>
  );
}

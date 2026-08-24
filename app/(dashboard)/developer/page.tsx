import React from 'react';
import { Metadata } from 'next';
import { DeveloperStudio } from '@/src/components/cms/DeveloperStudio';

export const metadata: Metadata = {
  title: 'Developer Studio & API Integrations | Store Studio',
  description: 'Manage scoped REST API keys, real-time webhook subscriptions, and ERP integrations.',
};

export default function DeveloperPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <DeveloperStudio />
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { DomainStudio } from '@/src/components/cms/DomainStudio';

export const metadata: Metadata = {
  title: 'Origin DNS & Custom Domains | Store Studio',
  description: 'Manage origin DNS records, SSL certificates, and deploy your active store theme to edge CDN origins.',
};

export default function DomainsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <DomainStudio />
    </div>
  );
}

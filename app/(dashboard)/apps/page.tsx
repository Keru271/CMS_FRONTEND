import React from 'react';
import { Metadata } from 'next';
import { AppStudio } from '@/src/components/cms/AppStudio';

export const metadata: Metadata = {
  title: 'Apps & Integrations Marketplace | OmniStore CMS',
  description: 'Install and configure third-party apps like Mailgun, Mailbox, and Wati for messaging and notifications.',
};

export default function AppsPage() {
  return <AppStudio />;
}

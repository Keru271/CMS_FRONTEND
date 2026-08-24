import React from 'react';
import { Metadata } from 'next';
import { NotificationStudio } from '@/src/components/cms/NotificationStudio';

export const metadata: Metadata = {
  title: 'Automated Notifications Studio | Store Studio',
  description: 'Manage automated WhatsApp, SMS, and Email alert workflows for order confirmations, shipping, and abandoned carts.',
};

export default function NotificationsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <NotificationStudio />
    </div>
  );
}

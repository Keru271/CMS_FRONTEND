import React from 'react';
import { CMSProvider } from '@/src/context/CMSContext';
import { LiveNotificationProvider } from '@/src/context/LiveNotificationContext';
import { LiveNotificationToast } from '@/src/components/cms/LiveNotificationToast';
import { CMSDashboardLayout } from '@/src/components/cms/CMSDashboardLayout';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CMSProvider>
      <LiveNotificationProvider>
        <LiveNotificationToast />
        <CMSDashboardLayout>{children}</CMSDashboardLayout>
      </LiveNotificationProvider>
    </CMSProvider>
  );
}

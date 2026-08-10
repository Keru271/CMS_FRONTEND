import React from 'react';
import { CMSProvider } from '@/src/context/CMSContext';
import { CMSDashboardLayout } from '@/src/components/cms/CMSDashboardLayout';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CMSProvider>
      <CMSDashboardLayout>{children}</CMSDashboardLayout>
    </CMSProvider>
  );
}

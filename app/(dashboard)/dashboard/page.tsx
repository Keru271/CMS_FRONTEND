'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { DashboardOverview } from '@/src/components/cms/DashboardOverview';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, orders, products } = useCMSContext();

  const lowStockProducts = products.filter((p) => p.stockQuantity < 10 && p.status === 'active');

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardOverview
      stats={stats}
      recentOrders={orders.slice(0, 5)}
      lowStockProducts={lowStockProducts}
      onNavigateProducts={() => router.push('/products')}
      onNavigateOrders={() => router.push('/orders')}
    />
  );
}

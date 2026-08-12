'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { DashboardOverview } from '@/src/components/cms/DashboardOverview';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, setStats, orders, setOrders, products, setProducts, setCategories } = useCMSContext();
  const [loading, setLoading] = useState(!stats);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls if already fetching
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Single aggregated API call to /analytics/dashboard-details
        const details = await cmsService.getDashboardDetails();
        setStats(details.stats);
        setProducts(details.products);
        setCategories(details.categories);
        setOrders(details.orders);
      } catch (err) {
        console.error('Failed to load dashboard details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [setStats, setProducts, setCategories, setOrders]);

  const handleUpdateOrderStatus = async (id: string, status: any) => {
    await cmsService.updateOrderStatus(id, status);
    const updatedOrders = await cmsService.getOrders();
    setOrders(updatedOrders);
  };

  const lowStockProducts = products.filter((p) => p.stockQuantity < 10 && p.status === 'active');

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
            Loading Merchant Dashboard...
          </span>
        </div>
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
      onUpdateOrderStatus={handleUpdateOrderStatus}
    />
  );
}

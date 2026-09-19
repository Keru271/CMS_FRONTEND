'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { DashboardOverview } from '@/src/components/cms/DashboardOverview';
import { DashboardStats, CMSProduct } from '@/src/types';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, setStats, orders, setOrders, products, setProducts, setCategories } =
    useCMSContext();
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

  // Helper to reliably extract stock count whether stored in inventory or stockQuantity
  const getProductStock = (p: any): number => {
    if (p.inventory !== undefined && p.inventory !== null && !isNaN(Number(p.inventory))) {
      return Number(p.inventory);
    }
    if (p.stockQuantity !== undefined && p.stockQuantity !== null && !isNaN(Number(p.stockQuantity))) {
      return Number(p.stockQuantity);
    }
    return 0;
  };

  // Low stock products: non-archived products with inventory <= 10
  const lowStockProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const status = (p.status || 'ACTIVE').toString().toUpperCase();
      if (status === 'ARCHIVED') return false;
      const stock = getProductStock(p);
      return stock <= 10;
    });
  }, [products]);

  // Synchronize stats with actively computed lowStockCount
  const enrichedStats: DashboardStats | null = useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
      lowStockCount: lowStockProducts.length,
      ...(stats.inventoryHealth
        ? {
            inventoryHealth: {
              ...stats.inventoryHealth,
              lowStockProducts: lowStockProducts.length,
            },
          }
        : {}),
    };
  }, [stats, lowStockProducts.length]);

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
      stats={enrichedStats || stats}
      recentOrders={orders.slice(0, 5)}
      lowStockProducts={lowStockProducts}
      onNavigateProducts={() => router.push('/products')}
      onNavigateOrders={() => router.push('/orders')}
      onUpdateOrderStatus={handleUpdateOrderStatus}
    />
  );
}

'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { DashboardOverview } from '@/src/components/cms/DashboardOverview';
import { DashboardStats, CMSProduct } from '@/src/types';
import { DashboardSkeleton } from '@/src/components/ui/Skeleton';

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

  // Synchronize stats with actively computed lowStockCount, refunds, and conversion rate
  const enrichedStats: DashboardStats | null = useMemo(() => {
    if (!stats) return null;

    // Calculate real refunds from orders list
    const computedRefunds = (orders || []).reduce((sum, o: any) => {
      if (o.refundAmount !== undefined && o.refundAmount !== null && Number(o.refundAmount) > 0) {
        return sum + Number(o.refundAmount);
      }
      const pStatus = (o.paymentStatus || '').toString().toUpperCase();
      const fStatus = (o.fulfillmentStatus || '').toString().toUpperCase();
      if (pStatus === 'REFUNDED' || fStatus === 'REFUNDED') {
        return sum + Number(o.totalAmount || 0);
      }
      return sum;
    }, 0);

    const effectiveRefunds =
      stats.refundsTotal !== undefined && stats.refundsTotal > 0
        ? stats.refundsTotal
        : computedRefunds;

    // Calculate effective conversion rate (if orders exist, conversion rate is at least completion rate)
    const effectiveConversionRate =
      stats.conversionRate !== undefined && stats.conversionRate > 0
        ? stats.conversionRate
        : (orders && orders.length > 0 ? 100 : 0);

    return {
      ...stats,
      conversionRate: effectiveConversionRate,
      refundsTotal: effectiveRefunds,
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
  }, [stats, orders, lowStockProducts.length]);

  if (loading || !stats) {
    return <DashboardSkeleton />;
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

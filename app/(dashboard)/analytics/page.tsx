'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cmsService } from '@/src/services/cmsService';
import { DashboardOverview } from '@/src/components/cms/DashboardOverview';
import { DashboardStats, CMSOrder, CMSProduct } from '@/src/types';

export default function AnalyticsPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 14890.50,
    totalOrders: 142,
    totalCustomers: 88,
    totalProducts: 48,
    conversionRate: 3.42,
    todaySales: 1250.00,
    todayOrders: 12,
    averageOrderValue: 104.86,
    pipeline: { pending: 4, processing: 8, shipped: 15, readyForPickup: 2 },
    healthAlerts: { outOfStock: 2, lowStock: 5, unfulfilledHighValue: 1, uncapturedPayments: 0 },
    revenueTrend: [
      { date: 'Mon', revenue: 1850, orders: 18 },
      { date: 'Tue', revenue: 2100, orders: 21 },
      { date: 'Wed', revenue: 1950, orders: 19 },
      { date: 'Thu', revenue: 2400, orders: 24 },
      { date: 'Fri', revenue: 2800, orders: 28 },
      { date: 'Sat', revenue: 3100, orders: 31 },
      { date: 'Sun', revenue: 2690, orders: 26 },
    ],
    salesByChannel: [
      { channel: 'Storefront Direct', percentage: 65, revenue: 9678 },
      { channel: 'WhatsApp Quick Buy', percentage: 22, revenue: 3275 },
      { channel: 'Instagram Shop', percentage: 13, revenue: 1937 },
    ],
    topProducts: [
      { id: 'p-1', name: 'AeroPulse Wireless Headphones', salesCount: 48, revenue: 9599.52, stock: 45, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80' },
      { id: 'p-2', name: 'Lumix Horizon Smartwatch', salesCount: 32, revenue: 4784.00, stock: 8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80' },
      { id: 'p-3', name: 'UrbanCraft Minimalist Backpack', salesCount: 24, revenue: 1632.00, stock: 120, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=120&q=80' },
    ],
    salesForecast: { next7DaysRevenue: 18500, projectedOrders: 175, confidenceScore: 92 },
  });

  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, productsData] = await Promise.all([
          cmsService.getOrders(),
          cmsService.getProducts(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);

        if (ordersData.length > 0) {
          const revenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          setStats((prev) => ({
            ...prev,
            totalRevenue: revenue,
            totalOrders: ordersData.length,
            averageOrderValue: revenue / ordersData.length,
          }));
        }
      } catch (err) {
        console.warn('Analytics page fetch notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const lowStock = products.filter((p) => (p.inventory || p.stockQuantity || 0) < 10);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <DashboardOverview
        stats={stats}
        recentOrders={orders}
        lowStockProducts={lowStock}
        onNavigateProducts={() => router.push('/products')}
        onNavigateOrders={() => router.push('/orders')}
      />
    </div>
  );
}

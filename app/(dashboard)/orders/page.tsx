'use client';

import React, { useEffect, useState } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { OrderStudio } from '@/src/components/cms/OrderStudio';
import { OrderTable } from '@/src/components/cms/OrderTable';
import { OrderStatus } from '@/src/types';

export default function OrdersPage() {
  const { orders, setOrders } = useCMSContext();
  const [loading, setLoading] = useState(true);

  const loadOrdersData = async () => {
    setLoading(true);
    try {
      const ordersData = await cmsService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    await cmsService.updateOrderStatus(id, status);
    await loadOrdersData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
            Loading Customer Orders & Requests...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderStudio />
      <OrderTable
        orders={orders}
        onStatusChange={handleUpdateOrderStatus}
      />
    </div>
  );
}

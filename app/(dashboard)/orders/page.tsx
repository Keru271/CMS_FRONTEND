'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { OrderStudio } from '@/src/components/cms/OrderStudio';
import { OrderTable } from '@/src/components/cms/OrderTable';

export default function OrdersPage() {
  const { orders, handleUpdateOrderStatus } = useCMSContext();

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

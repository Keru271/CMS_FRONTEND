'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import { CMSOrder, OrderStatus } from '@/src/types';
import { Input } from '@/src/components/ui/Input';

interface OrderTableProps {
  orders: CMSOrder[];
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onStatusChange }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search orders, customer names, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<Search className="w-4 h-4 text-sage-muted" />}
            isClearable
            onClear={() => setSearch('')}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-sage-input-bg border border-sage-border text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-sage-primary text-sage-text font-bold cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="rounded-3xl bg-white dark:bg-card border border-sage-border overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-sage-border bg-sage-accent/50 text-sage-muted uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-5">Order Code</th>
                <th className="py-4 px-4">Customer Details</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Fulfillment Status</th>
                <th className="py-4 px-4 sm:px-5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sage-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-10 h-10 text-sage-primary/40" />
                      <span className="font-extrabold text-sm text-sage-text">No Customer Orders Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-sage-accent/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5 font-black text-sage-primary">{o.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sage-text">{o.customerName}</div>
                      <div className="text-[10px] text-sage-muted">{o.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-sage-muted font-medium">{o.createdAt}</td>
                    <td className="py-3.5 px-4 font-black text-sage-text">${o.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            : o.paymentStatus === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sage-accent text-sage-primary border border-sage-border uppercase">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                        className="bg-sage-input-bg border border-sage-border text-[11px] font-extrabold text-sage-text rounded-xl px-3 py-1.5 focus:outline-none focus:border-sage-primary cursor-pointer"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

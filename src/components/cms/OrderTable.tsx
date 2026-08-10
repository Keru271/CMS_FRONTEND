'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { CMSOrder, OrderStatus } from '@/src/types';

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
    <div className="space-y-4 font-sans">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#5e5a5a] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search orders, customer names, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans text-[#191a1b] placeholder:text-[#beb9b3] outline-none focus:border-[#cbc2ea]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans rounded-lg px-3 py-2 focus:outline-none focus:border-[#cbc2ea] text-[#191a1b] font-medium cursor-pointer"
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
      <div className="rounded-2xl bg-[#ffffff] border border-[#cbd5e0] overflow-hidden shadow-statamic">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-[#cbd5e0] bg-[#fdf1ef] text-[#5e5a5a] uppercase font-medium text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-5">Order Code</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd5e0]/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#5e5a5a]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-10 h-10 text-[#beb9b3]" />
                      <span className="font-serif text-lg text-[#191a1b]">No Customer Orders Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#fdf1ef]/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5 font-mono font-bold text-[#191a1b]">{o.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-medium text-[#191a1b]">{o.customerName}</div>
                      <div className="text-[10px] font-sans text-[#5e5a5a]">{o.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5e5a5a] font-mono text-[10px]">{o.createdAt}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#191a1b]">${o.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-medium ${
                          o.paymentStatus === 'paid'
                            ? 'bg-[#d4ff4c]/40 text-[#191a1b] border border-[#191a1b]'
                            : o.paymentStatus === 'pending'
                            ? 'bg-[#d7e5fe] text-[#191a1b] border border-[#cbd5e0]'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-medium bg-[#f5ddee] text-[#191a1b] border border-[#cbc2ea] uppercase">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                        className="bg-[#fdf1ef] border border-[#cbd5e0] text-[11px] font-sans font-medium text-[#191a1b] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#cbc2ea] cursor-pointer"
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

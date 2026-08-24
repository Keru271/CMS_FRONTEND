'use client';

import React, { useState, useEffect } from 'react';
import { CMSOrder, OrderStatus, PaymentStatus, OrderNote } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  Printer,
  Ban,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  User,
  MapPin,
  CreditCard,
  X,
  Plus,
  Send,
  ExternalLink,
  Download,
} from 'lucide-react';

export const OrderStudio: React.FC = () => {
  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selected Order Drawer / Modal States
  const [selectedOrder, setSelectedOrder] = useState<CMSOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Action Modals
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingCarrier, setTrackingCarrier] = useState('FedEx Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [refundReasonInput, setRefundReasonInput] = useState('');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [noteInput, setNoteInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [storeCurrency, setStoreCurrency] = useState<string>('INR');

  const getCurrencySymbol = (currency?: string): string => {
    const c = (currency || storeCurrency || 'INR').toUpperCase();
    switch (c) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'CA$';
      case 'AUD': return 'A$';
      case 'SGD': return 'S$';
      case 'AED': return 'AED ';
      case 'USD':
      default:
        return '$';
    }
  };

  const formatPrice = (amount: number, currency?: string): string => {
    const curr = (currency || storeCurrency || 'INR').toUpperCase();
    const sym = getCurrencySymbol(curr);
    return `${sym}${Number(amount || 0).toFixed(2)}`;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const [data, setup] = await Promise.all([
        cmsService.getOrders(),
        cmsService.getStoreSetup().catch(() => null),
      ]);
      setOrders(data);
      if (setup?.currency) {
        setStoreCurrency(setup.currency);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsSaving(true);
      const updated = await cmsService.updateOrderStatus(orderId, newStatus as any);
      showToast(`Order #${updated.orderNumber} status updated to ${newStatus}!`, 'success');
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const updated = await cmsService.updateOrderTracking(
        selectedOrder.id,
        trackingCarrier,
        trackingNumberInput
      );
      showToast(`Tracking number assigned to #${selectedOrder.orderNumber}!`, 'success');
      setIsTrackingModalOpen(false);
      await loadOrders();
      setSelectedOrder(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign tracking.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const amount = parseFloat(refundAmountInput) || selectedOrder.totalAmount;
      const updated = await cmsService.refundOrder(
        selectedOrder.id,
        amount,
        refundReasonInput || 'Customer requested return.'
      );
      showToast(`Refund of $${amount.toFixed(2)} processed for #${selectedOrder.orderNumber}!`, 'success');
      setIsRefundModalOpen(false);
      await loadOrders();
      setSelectedOrder(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to process refund.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const updated = await cmsService.cancelOrder(
        selectedOrder.id,
        cancelReasonInput || 'Order cancelled by store merchant.'
      );
      showToast(`Order #${selectedOrder.orderNumber} has been cancelled.`, 'success');
      setIsCancelModalOpen(false);
      await loadOrders();
      setSelectedOrder(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !noteInput.trim()) return;
    try {
      setIsSaving(true);
      const updated = await cmsService.addOrderNote(selectedOrder.id, noteInput.trim());
      setNoteInput('');
      showToast('Staff order note added!', 'success');
      await loadOrders();
      setSelectedOrder(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to add note.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter Orders Logic
  const filteredOrders = orders.filter((o) => {
    const statusMatch =
      activeTab === 'ALL'
        ? true
        : o.orderStatus.toUpperCase() === activeTab || o.fulfillmentStatus?.toUpperCase() === activeTab;

    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerEmail.toLowerCase().includes(query) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query));

    return statusMatch && searchMatch;
  });

  // Calculate status counts
  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.orderStatus.toUpperCase() === 'PENDING').length,
    CONFIRMED: orders.filter((o) => o.orderStatus.toUpperCase() === 'CONFIRMED').length,
    PROCESSING: orders.filter((o) => o.orderStatus.toUpperCase() === 'PROCESSING').length,
    SHIPPED: orders.filter((o) => o.orderStatus.toUpperCase() === 'SHIPPED').length,
    DELIVERED: orders.filter((o) => o.orderStatus.toUpperCase() === 'DELIVERED').length,
    CANCELLED: orders.filter((o) => o.orderStatus.toUpperCase() === 'CANCELLED').length,
    REFUNDED: orders.filter((o) => o.orderStatus.toUpperCase() === 'REFUNDED').length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Orders Suite...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Fulfillment & Logistics
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {orders.length} Total Orders Registered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-indigo-400" />
              <span>Orders Management Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Track customer orders, manage payment & fulfillment statuses, assign shipping tracking numbers, issue refunds, print invoices, and record staff notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/export/excel`;
                window.open(url, '_blank');
                showToast('Downloading Orders Excel export...', 'success');
              }}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Orders (Excel)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 ORDER STATUS FILTER TABS */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Orders', count: statusCounts.ALL, color: 'bg-slate-900 text-white' },
            { id: 'PENDING', label: 'Pending', count: statusCounts.PENDING, color: 'bg-amber-500 text-white' },
            { id: 'CONFIRMED', label: 'Confirmed', count: statusCounts.CONFIRMED, color: 'bg-blue-600 text-white' },
            { id: 'PROCESSING', label: 'Processing', count: statusCounts.PROCESSING, color: 'bg-indigo-600 text-white' },
            { id: 'SHIPPED', label: 'Shipped', count: statusCounts.SHIPPED, color: 'bg-purple-600 text-white' },
            { id: 'DELIVERED', label: 'Delivered', count: statusCounts.DELIVERED, color: 'bg-emerald-600 text-white' },
            { id: 'CANCELLED', label: 'Cancelled', count: statusCounts.CANCELLED, color: 'bg-rose-600 text-white' },
            { id: 'REFUNDED', label: 'Refunded', count: statusCounts.REFUNDED, color: 'bg-slate-600 text-white' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? `${tab.color} shadow-md scale-102`
                    : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-black">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-border pt-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order #, customer, email, tracking..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Showing {filteredOrders.length} of {orders.length} Orders
          </span>
        </div>
      </div>

      {/* ORDERS DATA TABLE */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-accent border-b border-slate-200/80 dark:border-border text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Fulfillment Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border font-medium text-slate-800 dark:text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 font-bold">
                    No orders found matching status tab "{activeTab}".
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const statusUpper = o.orderStatus.toUpperCase();
                  const payUpper = o.paymentStatus.toUpperCase();

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-accent/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-black text-indigo-600 dark:text-indigo-400">
                        #{o.orderNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[11px] font-semibold">{o.createdAt}</td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 dark:text-foreground">{o.customerName}</div>
                        <div className="text-[11px] text-slate-400">{o.customerEmail}</div>
                      </td>
                      <td className="py-4 px-6 font-bold">{o.itemsCount} Items</td>
                      <td className="py-4 px-6 font-black text-sm text-slate-900 dark:text-foreground">
                        {formatPrice(o.totalAmount, o.currency)} <span className="text-[10px] font-normal text-slate-400">{o.currency || storeCurrency}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                            payUpper === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : payUpper === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {payUpper}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-max ${
                            statusUpper === 'DELIVERED'
                              ? 'bg-emerald-500 text-white'
                              : statusUpper === 'SHIPPED'
                              ? 'bg-purple-600 text-white'
                              : statusUpper === 'PROCESSING'
                              ? 'bg-indigo-600 text-white'
                              : statusUpper === 'CONFIRMED'
                              ? 'bg-blue-600 text-white'
                              : statusUpper === 'CANCELLED'
                              ? 'bg-rose-600 text-white'
                              : statusUpper === 'REFUNDED'
                              ? 'bg-slate-700 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {statusUpper}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(o);
                            setIsDetailsOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-accent hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-extrabold text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS DRAWER / MODAL */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                  #
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">Order #{selectedOrder.orderNumber}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Placed on {selectedOrder.createdAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Drawer */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* STATUS CHANGE ACTION BAR */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Change Fulfillment Status:</span>
                  <select
                    value={selectedOrder.orderStatus.toUpperCase()}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-black text-indigo-600"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingCarrier(selectedOrder.carrier || 'FedEx Express');
                      setTrackingNumberInput(selectedOrder.trackingNumber || '');
                      setIsTrackingModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Assign Tracking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRefundAmountInput(selectedOrder.totalAmount.toString());
                      setRefundReasonInput('');
                      setIsRefundModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refund</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCancelReasonInput('');
                      setIsCancelModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>

              {/* GRID: CUSTOMER INFO + SHIPPING INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Customer Information</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="font-extrabold text-slate-900">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Address:</span>
                      <span className="font-mono text-indigo-600">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone Number:</span>
                      <span>{selectedOrder.customerPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Tracking Info */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Shipping Address & Logistics</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <div>
                      <span className="font-extrabold text-slate-900 block">
                        {selectedOrder.shippingAddress?.street || '742 Evergreen Terrace'}
                      </span>
                      <span className="text-slate-500 block">
                        {selectedOrder.shippingAddress?.city || 'Springfield'}, {selectedOrder.shippingAddress?.state || 'IL'} {selectedOrder.shippingAddress?.zip || '62704'}
                      </span>
                      <span className="text-slate-500 block">{selectedOrder.shippingAddress?.country || 'United States'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tracking Number:</span>
                      {selectedOrder.trackingNumber ? (
                        <span className="font-mono font-extrabold text-purple-600 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {selectedOrder.carrier}: {selectedOrder.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ORDER ITEMS TABLE */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Purchased Order Items</span>
                </h4>

                <div className="divide-y divide-slate-100">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, i) => {
                      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                      const quantity = Number(item.quantity ?? 1);
                      const subtotal = Number(item.subtotal ?? (unitPrice * quantity));
                      const productName = item.productName || item.name || 'Ordered Item';

                      return (
                        <div key={i} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border shrink-0">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                                alt={productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-slate-900 block">{productName}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">SKU: {item.sku || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-xs text-slate-900 block">
                              {formatPrice(unitPrice, selectedOrder.currency)} x {quantity}
                            </span>
                            <span className="font-black text-xs text-indigo-600 block">
                              {formatPrice(subtotal, selectedOrder.currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-slate-400 font-semibold text-xs">No item breakdown available.</div>
                  )}
                </div>

                {/* TOTAL BREAKDOWN */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-bold">{formatPrice(selectedOrder.subtotalAmount || selectedOrder.totalAmount * 0.9, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax Fee:</span>
                    <span className="font-bold">{formatPrice(selectedOrder.taxAmount || 0, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Paid Amount:</span>
                    <span className="text-indigo-600 font-mono">{formatPrice(selectedOrder.totalAmount, selectedOrder.currency)} {selectedOrder.currency || storeCurrency}</span>
                  </div>
                </div>
              </div>

              {/* INTERNAL STAFF NOTES TIMELINE */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Internal Staff Notes Timeline</span>
                </h4>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add staff comment or log customer request..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {selectedOrder.notes && selectedOrder.notes.length > 0 ? (
                    selectedOrder.notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="text-indigo-600 font-extrabold">{note.author}</span>
                          <span>{note.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No internal staff notes recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING NUMBER ASSIGNMENT MODAL */}
      {isTrackingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Assign Carrier & Tracking Number</h3>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Shipping Carrier</label>
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="UPS Ground">UPS Ground</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Tracking Number Code</label>
                <input
                  type="text"
                  required
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. TRK-88912344-FEDEX"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save & Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Process Refund</h3>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Refund Amount ({getCurrencySymbol(selectedOrder?.currency || storeCurrency)})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={refundAmountInput}
                  onChange={(e) => setRefundAmountInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-rose-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Refund Reason</label>
                <textarea
                  rows={2}
                  required
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  placeholder="Customer returned item, damaged in transit..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-md"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Cancel Order #{selectedOrder.orderNumber}</h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelOrder} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Cancellation Reason</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="Customer requested cancellation, item out of stock..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md"
                >
                  Cancel Order & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {isInvoiceModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 p-8 space-y-6 text-slate-900">
            {/* Invoice Top Action Bar */}
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Official Merchant Printable Order Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PDF Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    Order ID: #{selectedOrder.orderNumber}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-extrabold text-slate-900 block">OmniStore Merchant Platform</span>
                  <span className="text-slate-500 block">Date: {selectedOrder.createdAt}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border text-xs">
                <div>
                  <span className="font-black text-slate-500 uppercase tracking-wider block mb-1">Billed & Shipped To:</span>
                  <span className="font-extrabold text-slate-900 block">{selectedOrder.customerName}</span>
                  <span className="text-slate-600 block">{selectedOrder.customerEmail}</span>
                  <span className="text-slate-600 block">{selectedOrder.shippingAddress?.street || '742 Evergreen Terrace'}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-500 uppercase tracking-wider block mb-1">Payment Details:</span>
                  <span className="font-extrabold text-slate-900 block">Status: {selectedOrder.paymentStatus}</span>
                  <span className="text-slate-600 block">Carrier: {selectedOrder.carrier || 'Standard Shipping'}</span>
                  <span className="text-slate-600 block">Tracking: {selectedOrder.trackingNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-extrabold uppercase text-[10px] text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  {selectedOrder.items?.map((item, i) => {
                    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                    const quantity = Number(item.quantity ?? 1);
                    const subtotal = Number(item.subtotal ?? (unitPrice * quantity));
                    const productName = item.productName || item.name || 'Ordered Item';

                    return (
                      <tr key={i}>
                        <td className="py-3 font-bold">{productName}</td>
                        <td className="py-3 text-center">{quantity}</td>
                        <td className="py-3 text-right">{formatPrice(unitPrice, selectedOrder.currency)}</td>
                        <td className="py-3 text-right font-bold">{formatPrice(subtotal, selectedOrder.currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-end pt-4 border-t">
                <div className="w-60 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">{formatPrice(selectedOrder.subtotalAmount || selectedOrder.totalAmount * 0.9, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600 font-mono">{formatPrice(selectedOrder.totalAmount, selectedOrder.currency)} {selectedOrder.currency || storeCurrency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

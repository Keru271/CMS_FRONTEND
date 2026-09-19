'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Trash2,
  Mail,
  Phone,
  User,
  ExternalLink,
  Download,
  Send,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  X,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
  FileText,
  Tag,
  Check,
  Ban,
  ChevronRight,
} from 'lucide-react';
import {
  ProductNotification,
  ProductNotificationStatus,
  ProductNotificationStats,
} from '@/src/types';
import { cmsService } from '@/src/services/cmsService';

export function ProductNotificationsStudio() {
  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const [stats, setStats] = useState<ProductNotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action Modals
  const [batchNotifyProduct, setBatchNotifyProduct] = useState<{
    productId: string;
    productName: string;
    pendingCount: number;
  } | null>(null);
  const [batchMessage, setBatchMessage] = useState('');
  const [batchSending, setBatchSending] = useState(false);

  // Notes Modal
  const [editingNoteItem, setEditingNoteItem] = useState<ProductNotification | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [notifsRes, statsRes] = await Promise.all([
        cmsService.getProductNotifications({ limit: 100 }),
        cmsService.getProductNotificationStats(),
      ]);

      const items = Array.isArray(notifsRes) ? notifsRes : notifsRes?.items || [];
      setNotifications(items);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load product notifications:', err);
      showToast('Failed to fetch product notifications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      // Product Filter
      if (selectedProductFilter && item.productId !== selectedProductFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesProduct = item.productName?.toLowerCase().includes(query);
        const matchesSku = item.productSku?.toLowerCase().includes(query);
        const matchesVariant = item.variantName?.toLowerCase().includes(query);
        const matchesEmail = item.customerEmail?.toLowerCase().includes(query);
        const matchesName = item.customerName?.toLowerCase().includes(query);
        const matchesPhone = item.customerPhone?.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);

        if (
          !matchesProduct &&
          !matchesSku &&
          !matchesVariant &&
          !matchesEmail &&
          !matchesName &&
          !matchesPhone &&
          !matchesNotes
        ) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, statusFilter, selectedProductFilter, searchQuery]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Status Change Handler
  const handleStatusChange = async (id: string, newStatus: ProductNotificationStatus) => {
    try {
      const res = await cmsService.updateProductNotification(id, {
        status: newStatus,
      });
      const updatedItem = res?.notification || (res as any);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updatedItem : n)));
      // Refresh stats
      const newStats = await cmsService.getProductNotificationStats();
      setStats(newStats);
      showToast(`Status updated to ${newStatus}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this notification request?')) return;
    try {
      await cmsService.deleteProductNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      const newStats = await cmsService.getProductNotificationStats();
      setStats(newStats);
      showToast('Notification request deleted');
    } catch {
      showToast('Failed to delete request', 'error');
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} selected notification request(s)?`,
      )
    )
      return;

    try {
      await cmsService.bulkDeleteProductNotifications(selectedIds);
      setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      const newStats = await cmsService.getProductNotificationStats();
      setStats(newStats);
      showToast('Selected requests deleted');
    } catch {
      showToast('Failed to delete requests', 'error');
    }
  };

  // Bulk Mark Notified Handler
  const handleBulkMarkNotified = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(
        selectedIds.map((id) => cmsService.updateProductNotification(id, { status: 'NOTIFIED' })),
      );
      await fetchData();
      setSelectedIds([]);
      showToast(`${selectedIds.length} requests marked as Notified`);
    } catch {
      showToast('Failed to update status in bulk', 'error');
    }
  };

  // Batch Notify Broadcast
  const handleBatchNotify = async () => {
    if (!batchNotifyProduct) return;
    try {
      setBatchSending(true);
      const res = await cmsService.batchNotifyProductSubscribers({
        productId: batchNotifyProduct.productId,
        customMessage: batchMessage.trim() || undefined,
      });

      showToast(
        `Success! ${res.notifiedCount} customer(s) notified for ${batchNotifyProduct.productName}`,
      );
      setBatchNotifyProduct(null);
      setBatchMessage('');
      await fetchData();
    } catch {
      showToast('Failed to trigger batch notification', 'error');
    } finally {
      setBatchSending(false);
    }
  };

  // Note Save
  const handleSaveNote = async () => {
    if (!editingNoteItem) return;
    try {
      setSavingNote(true);
      const res = await cmsService.updateProductNotification(editingNoteItem.id, {
        notes: noteText.trim() || null,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === editingNoteItem.id ? res.notification : n)),
      );
      setEditingNoteItem(null);
      showToast('Staff notes saved');
    } catch {
      showToast('Failed to save note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!filteredNotifications.length) {
      showToast('No data to export', 'info');
      return;
    }

    const headers = [
      'ID',
      'Product Name',
      'Product SKU',
      'Variant',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Status',
      'Notes',
      'Created At',
      'Notified At',
    ];

    const rows = filteredNotifications.map((n) => [
      `"${n.id}"`,
      `"${(n.productName || '').replace(/"/g, '""')}"`,
      `"${(n.productSku || '').replace(/"/g, '""')}"`,
      `"${(n.variantName || '').replace(/"/g, '""')}"`,
      `"${(n.customerName || '').replace(/"/g, '""')}"`,
      `"${(n.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(n.customerPhone || '').replace(/"/g, '""')}"`,
      `"${n.status}"`,
      `"${(n.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(n.createdAt).toLocaleString()}"`,
      `"${n.notifiedAt ? new Date(n.notifiedAt).toLocaleString() : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `back-in-stock-requests-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-800 text-emerald-100'
              : toast.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-100'
                : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 text-blue-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Back-in-Stock Alerts
                </h1>
                {stats && stats.pendingRequests > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse">
                    {stats.pendingRequests} Waiting
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track out-of-stock customer demand, notify shoppers on restock, and recover lost
                sales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh requests"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Waitlist
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{stats?.pendingRequests ?? 0}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              awaiting stock
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Alerts Created
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{stats?.totalRequests ?? 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">all time</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shoppers Notified
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {stats?.notifiedRequests ?? 0}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              restocked & alerted
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unique Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{stats?.uniqueCustomers ?? 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">interested shoppers</span>
          </div>
        </div>
      </div>

      {/* Top Demand Products Section */}
      {stats && stats.topProducts && stats.topProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Highest Demand Out-of-Stock Items</h2>
            </div>
            {selectedProductFilter && (
              <button
                onClick={() => setSelectedProductFilter('')}
                className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
              >
                Clear product filter <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.topProducts.map((prod) => {
              const isSelected = selectedProductFilter === prod.productId;
              return (
                <div
                  key={prod.productId}
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      {prod.productImage ? (
                        <Image
                          src={prod.productImage}
                          alt={prod.productName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold truncate" title={prod.productName}>
                        {prod.productName}
                      </h4>
                      {prod.productSku && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          SKU: {prod.productSku}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {prod.pendingCount} Waiting
                        </span>
                        <span className="text-xs text-slate-400">({prod.requestCount} total)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProductFilter(isSelected ? '' : prod.productId)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Filtering by item' : 'Filter requests'}
                    </button>

                    {prod.pendingCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setBatchNotifyProduct({
                            productId: prod.productId,
                            productName: prod.productName,
                            pendingCount: prod.pendingCount,
                          })
                        }
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        Notify All
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Request Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 md:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto">
            {(
              [
                { key: 'ALL', label: 'All Requests', count: notifications.length },
                {
                  key: 'PENDING',
                  label: 'Pending',
                  count: notifications.filter((n) => n.status === 'PENDING').length,
                },
                {
                  key: 'NOTIFIED',
                  label: 'Notified',
                  count: notifications.filter((n) => n.status === 'NOTIFIED').length,
                },
                {
                  key: 'CANCELLED',
                  label: 'Cancelled',
                  count: notifications.filter((n) => n.status === 'CANCELLED').length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === tab.key
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Bulk Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={handleBulkMarkNotified}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark Notified
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}

            <div className="relative min-w-[240px] sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shopper, product, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm">Loading back-in-stock alerts...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold">No back-in-stock alert requests found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {searchQuery || statusFilter !== 'ALL' || selectedProductFilter
                ? 'Try adjusting your search or active filters.'
                : 'When storefront customers request to be notified for out-of-stock items, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredNotifications.length > 0 &&
                        selectedIds.length === filteredNotifications.length
                      }
                      onChange={handleSelectAll}
                      className="rounded text-orange-500 focus:ring-orange-500/20"
                    />
                  </th>
                  <th className="py-3.5 px-3">Product / Variant</th>
                  <th className="py-3.5 px-3">Customer Information</th>
                  <th className="py-3.5 px-3">Date Requested</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Staff Notes</th>
                  <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredNotifications.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isPending = item.status === 'PENDING';
                  const isNotified = item.status === 'NOTIFIED';
                  const isCancelled = item.status === 'CANCELLED';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-orange-500/5 dark:bg-orange-500/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-5 pr-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded text-orange-500 focus:ring-orange-500/20"
                        />
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.variantName && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                  <Tag className="w-2.5 h-2.5" />
                                  {item.variantName}
                                </span>
                              )}
                              {item.productSku && (
                                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                  {item.productSku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.customerName || 'Anonymous Shopper'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <a
                              href={`mailto:${item.customerEmail}`}
                              className="hover:underline hover:text-orange-500 font-mono text-[11px]"
                            >
                              {item.customerEmail}
                            </a>
                          </div>
                          {item.customerPhone && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a
                                href={`tel:${item.customerPhone}`}
                                className="hover:underline font-mono text-[11px]"
                              >
                                {item.customerPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as ProductNotificationStatus)
                          }
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 focus:ring-amber-500/30'
                              : isNotified
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 focus:ring-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="PENDING">Pending Restock</option>
                          <option value="NOTIFIED">Notified</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        {item.notifiedAt && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Notified {new Date(item.notifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        {item.notes ? (
                          <div
                            onClick={() => {
                              setEditingNoteItem(item);
                              setNoteText(item.notes || '');
                            }}
                            className="cursor-pointer group flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0 mt-0.5" />
                            <span className="truncate">{item.notes}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteItem(item);
                              setNoteText('');
                            }}
                            className="text-[11px] text-slate-400 hover:text-orange-500 flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3" /> + Add note
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'NOTIFIED')}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                              title="Mark as Notified"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingNoteItem(item);
                              setNoteText(item.notes || '');
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            title="Edit Staff Notes"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Notify Modal */}
      {batchNotifyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Notify All Subscribers</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Restock notification broadcast
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatchNotifyProduct(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {batchNotifyProduct.productName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {batchNotifyProduct.pendingCount} Waiting
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All {batchNotifyProduct.pendingCount} pending customer requests for this product
                will be marked as <strong className="text-emerald-500">NOTIFIED</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Custom Message / Restock Note (Optional)
              </label>
              <textarea
                value={batchMessage}
                onChange={(e) => setBatchMessage(e.target.value)}
                placeholder="e.g., Limited batch restocked! Use promo code RESTOCK10 for 10% off."
                rows={3}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBatchNotifyProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchNotify}
                disabled={batchSending}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {batchSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Notifications</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Note Modal */}
      {editingNoteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">Staff Notes</h3>
              </div>
              <button
                onClick={() => setEditingNoteItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add internal operational notes for{' '}
              {editingNoteItem.customerName || editingNoteItem.customerEmail} regarding{' '}
              {editingNoteItem.productName}.
            </p>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g., Called customer, confirmed they want 2 units when restocked."
              rows={4}
              className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-5 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

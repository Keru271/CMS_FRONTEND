'use client';
import { SwipeToast } from '@/src/components/ui/SwipeToast';

import React, { useState, useEffect } from 'react';
import { TablePagination } from '@/src/components/ui/TablePagination';
import { TableRefreshButton } from '@/src/components/ui/TableRefreshButton';
import { CMSCustomer, CustomerGroup, CMSOrder } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { useCMSContext } from '@/src/context/CMSContext';
import { getCurrencySymbol } from '@/src/lib/currency';
import { PhoneInputWithCountry } from '@/src/components/ui/PhoneInputWithCountry';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  Building,
  UserCheck,
  UserPlus,
  Send,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  Calendar,
} from 'lucide-react';

export const CustomerStudio: React.FC = () => {
  let currencySymbol = '₹';
  try {
    const cmsCtx = useCMSContext();
    currencySymbol = cmsCtx.currencySymbol || '₹';
  } catch {
    const session = cmsService.getMerchantSession();
    currencySymbol = getCurrencySymbol(session?.store?.currency || 'INR');
  }

  const [customers, setCustomers] = useState<CMSCustomer[]>([]);
  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'RETURNING' | 'VIP' | 'WHOLESALE'>(
    'ALL',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Selected Profile Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<CMSCustomer | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Group & Tag Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<CustomerGroup>('NEW');
  const [editTagsInput, setEditTagsInput] = useState('');

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    group: 'NEW' as CustomerGroup,
    tags: 'New-Customer',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    acceptsMarketing: true,
  });

  const [noteInput, setNoteInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  // Prevent background body scroll when any modal is active
  useEffect(() => {
    if (isProfileOpen || isAddModalOpen || isEditModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isProfileOpen, isAddModalOpen, isEditModalOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [custData, orderData] = await Promise.all([
        cmsService.getCustomers(),
        cmsService.getOrders(),
      ]);
      setCustomers(custData);
      setOrders(orderData);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEditModal = (cust: CMSCustomer) => {
    setSelectedCustomer(cust);
    setEditGroup((cust.group as CustomerGroup) || 'NEW');
    setEditTagsInput(Array.isArray(cust.tags) ? cust.tags.join(', ') : cust.tags || '');
    setIsEditModalOpen(true);
  };

  const handleSaveGroupAndTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      setIsSaving(true);
      const tagsArray = editTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await cmsService.updateCustomer(selectedCustomer.id, {
        group: editGroup,
        tags: tagsArray,
      });

      showToast(`Updated customer profile for ${updated.name}!`, 'success');
      setIsEditModalOpen(false);
      await loadData();
      if (selectedCustomer && selectedCustomer.id === updated.id) {
        setSelectedCustomer(updated);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update customer.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleConsent = async (type: 'EMAIL' | 'SMS') => {
    if (!selectedCustomer) return;
    try {
      setIsSaving(true);
      const updated = await cmsService.toggleMarketingConsent(selectedCustomer.id, type);
      showToast(`${type} marketing subscription updated!`, 'success');
      await loadData();
      setSelectedCustomer(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update consent.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !noteInput.trim()) return;
    try {
      setIsSaving(true);
      const updated = await cmsService.addCustomerNote(selectedCustomer.id, noteInput.trim());
      setNoteInput('');
      showToast('Staff note added to customer profile!', 'success');
      await loadData();
      setSelectedCustomer(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to add note.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      showToast('Please enter full name', 'error');
      return;
    }
    if (!addFormData.email.trim()) {
      showToast('Please enter email address', 'error');
      return;
    }
    if (!addFormData.phone.trim()) {
      showToast('Please enter phone number', 'error');
      return;
    }
    if (!addFormData.group) {
      showToast('Please select a customer group', 'error');
      return;
    }
    if (!addFormData.street.trim()) {
      showToast('Please enter street address', 'error');
      return;
    }
    if (!addFormData.city.trim()) {
      showToast('Please enter city', 'error');
      return;
    }
    if (!addFormData.state.trim()) {
      showToast('Please enter state / province', 'error');
      return;
    }
    if (!addFormData.zip.trim()) {
      showToast('Please enter zip / postal code', 'error');
      return;
    }
    if (!addFormData.tags.trim()) {
      showToast('Please enter tags', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const tagsArray = (addFormData.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await cmsService.createCustomer({
        name: addFormData.name.trim(),
        email: addFormData.email.trim(),
        phone: addFormData.phone.trim(),
        group: addFormData.group,
        tags: tagsArray.length > 0 ? tagsArray : ['New-Customer'],
        acceptsMarketing: addFormData.acceptsMarketing,
        address: {
          name: addFormData.name.trim(),
          street: addFormData.street.trim(),
          city: addFormData.city.trim(),
          state: addFormData.state.trim(),
          zip: addFormData.zip.trim(),
          country: addFormData.country?.trim() || 'United States',
        },
      });

      showToast(`Customer "${created.name}" created successfully!`, 'success');
      setIsAddModalOpen(false);
      setCustomers((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      await loadData();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to create customer.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter Customers
  const filteredCustomers = customers.filter((c) => {
    const groupMatch = activeTab === 'ALL' ? true : c.group.toUpperCase() === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const searchMatch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.toLowerCase().includes(query)) ||
      (Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase().includes(query)));

    return groupMatch && searchMatch;
  });

  // Calculate Group Counts
  const groupCounts = {
    ALL: customers.length,
    NEW: customers.filter((c) => c.group.toUpperCase() === 'NEW').length,
    RETURNING: customers.filter((c) => c.group.toUpperCase() === 'RETURNING').length,
    VIP: customers.filter((c) => c.group.toUpperCase() === 'VIP').length,
    WHOLESALE: customers.filter((c) => c.group.toUpperCase() === 'WHOLESALE').length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">
          Loading Customers CRM...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <SwipeToast
          open={!!toastMessage}
          type={toastMessage.type}
          title={toastMessage.type === 'success' ? 'Success' : 'Error'}
          description={toastMessage.text}
          onClose={() => setToastMessage(null)}
          duration={4000}
        />
      )}

      {/* Header Banner - Updated to light mode design specs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#2C2C2E]/20 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-200/80 dark:border-indigo-800/60">
                CRM & Customer Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {customers.length} Registered Accounts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Customers Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Manage customer profiles, lifetime spend, order history, customer segmentation groups
              (New, Returning, VIP, Wholesale), tags, addresses, and marketing consent options.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">

            <button
              type="button"
              onClick={() => {
                setAddFormData({
                  name: '',
                  email: '',
                  phone: '',
                  group: 'NEW',
                  tags: 'New-Customer',
                  street: '',
                  city: '',
                  state: '',
                  zip: '',
                  country: 'United States',
                  acceptsMarketing: true,
                });
                setIsAddModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow flex items-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 CUSTOMER GROUP SEGMENTATION TABS */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            {
              id: 'ALL',
              label: 'All Customers',
              count: groupCounts.ALL,
              icon: Users,
              color: 'bg-slate-900 text-white',
            },
            {
              id: 'NEW',
              label: 'New Customers',
              count: groupCounts.NEW,
              icon: UserPlus,
              color: 'bg-blue-600 text-white',
            },
            {
              id: 'RETURNING',
              label: 'Returning Customers',
              count: groupCounts.RETURNING,
              icon: UserCheck,
              color: 'bg-indigo-600 text-white',
            },
            {
              id: 'VIP',
              label: 'VIP Spenders',
              count: groupCounts.VIP,
              icon: Crown,
              color: 'bg-amber-500 text-white',
            },
            {
              id: 'WHOLESALE',
              label: 'Wholesale B2B',
              count: groupCounts.WHOLESALE,
              icon: Building,
              color: 'bg-purple-600 text-white',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${isActive
                  ? `${tab.color} shadow-md scale-102`
                  : 'bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
              >
                <IconComp className="w-3.5 h-3.5" />
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
              placeholder="Search by customer name, email, phone, tag..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Showing {filteredCustomers.length} of {customers.length} Customers
          </span>
          <TableRefreshButton onRefresh={loadData} isLoading={isLoading} size="sm" />
        </div>
      </div>

      {/* CUSTOMERS DATA TABLE */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-accent border-b border-slate-200/80 dark:border-border text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Customer Profile</th>
                <th className="py-4 px-6">Group Segment</th>
                <th className="py-4 px-6">Tags</th>
                <th className="py-4 px-6">Orders Count</th>
                <th className="py-4 px-6">Lifetime Spend ({currencySymbol})</th>
                <th className="py-4 px-6">Marketing Consent</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border font-medium text-slate-800 dark:text-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                    No customers found matching group segment "{activeTab}".
                  </td>
                </tr>
              ) : (
                filteredCustomers
                  .slice((customerPage - 1) * customerPageSize, customerPage * customerPageSize)
                  .map((cust) => {
                    const grpUpper = cust.group.toUpperCase();

                    return (
                      <tr
                        key={cust.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                cust.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${cust.email}`
                              }
                              alt={cust.name}
                              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-extrabold text-sm text-slate-900 dark:text-foreground block">
                                {cust.name}
                              </span>
                              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 block">
                                {cust.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-max ${grpUpper === 'VIP'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : grpUpper === 'WHOLESALE'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : grpUpper === 'RETURNING'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {grpUpper}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {Array.isArray(cust.tags) ? (
                              cust.tags.map((tg, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                                >
                                  {tg}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                                {cust.tags || 'General'}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono font-black text-sm text-slate-900 dark:text-foreground">
                          {cust.totalOrders} Orders
                        </td>

                        <td className="py-4 px-6 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {currencySymbol}
                          {cust.totalSpent.toFixed(2)}
                        </td>

                        <td className="py-4 px-6">
                          {cust.acceptsMarketing ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase flex items-center gap-1 w-max">
                              <Check className="w-3 h-3" /> Subscribed
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] uppercase flex items-center gap-1 w-max">
                              <X className="w-3 h-3" /> Opted Out
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setIsProfileOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-accent hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-extrabold text-[11px] inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cust)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={customerPage}
          totalItems={filteredCustomers.length}
          pageSize={customerPageSize}
          onPageChange={(p) => setCustomerPage(p)}
          onPageSizeChange={(s) => { setCustomerPageSize(s); setCustomerPage(1); }}
          itemName="customers"
        />
      </div>

      {/* CUSTOMER PROFILE DRAWER / MODAL */}
      {isProfileOpen && selectedCustomer && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in w-full h-full min-h-screen h-[100dvh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileOpen(false);
          }}
        >
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[90vh] flex flex-col">
            {/* Top Header */}
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/30 border-b border-slate-200/80 dark:border-border flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <img
                  src={
                    selectedCustomer.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.email}`
                  }
                  alt={selectedCustomer.name}
                  className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl object-cover border border-slate-200/80 dark:border-border bg-white shadow-xs p-0.5 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-foreground truncate tracking-tight">
                      {selectedCustomer.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shrink-0 ${selectedCustomer.group === 'VIP'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                        : selectedCustomer.group === 'NEW'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
                          : selectedCustomer.group === 'WHOLESALE'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
                        }`}
                    >
                      {selectedCustomer.group}
                    </span>
                    {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {selectedCustomer.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCustomer.email}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Joined {selectedCustomer.createdAt}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-colors shrink-0 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Drawer Content */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* KPI STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Lifetime Spend (LTV)
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-foreground font-mono block">
                      {currencySymbol}
                      {selectedCustomer.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Total Orders
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-foreground font-mono block">
                      {selectedCustomer.totalOrders} <span className="text-xs font-bold text-slate-400 font-sans">Orders</span>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Average Order Value
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-foreground font-mono block">
                      {currencySymbol}
                      {selectedCustomer.totalOrders > 0
                        ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              {/* GRID: ADDRESS & MARKETING CONSENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Address */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-border">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
                        Primary Shipping Address
                      </h4>
                      <p className="text-[11px] text-slate-400">Default dispatch destination</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-foreground block">
                      {selectedCustomer.address?.name || selectedCustomer.name}
                    </span>
                    <span className="block text-slate-600 dark:text-slate-400">
                      {selectedCustomer.address?.street || '123 Main Street'}
                    </span>
                    <span className="block text-slate-600 dark:text-slate-400">
                      {selectedCustomer.address?.city || 'New York'},{' '}
                      {selectedCustomer.address?.state || 'NY'}{' '}
                      {selectedCustomer.address?.zip || '10001'}
                    </span>
                    <span className="block text-slate-600 dark:text-slate-400">
                      {selectedCustomer.address?.country || 'United States'}
                    </span>
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-border flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.phone || 'Phone not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Marketing Consent Controls */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-border">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
                        Marketing Subscription Consent
                      </h4>
                      <p className="text-[11px] text-slate-400">GDPR & CAN-SPAM communication preferences</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-accent/40 border border-slate-200/80 dark:border-border transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-foreground block">
                          Email Marketing Campaigns
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Newsletters, flash sales & promos
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleConsent('EMAIL')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${selectedCustomer.acceptsMarketing
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-card border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-200/70'
                          }`}
                      >
                        {selectedCustomer.acceptsMarketing ? '✓ Opted-In' : 'Unsubscribed'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-accent/40 border border-slate-200/80 dark:border-border transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-foreground block">
                          SMS Direct Marketing
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Order notifications & SMS alerts
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleConsent('SMS')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${selectedCustomer.acceptsSMSMarketing
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-card border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-200/70'
                          }`}
                      >
                        {selectedCustomer.acceptsSMSMarketing ? '✓ Opted-In' : 'Unsubscribed'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ORDER HISTORY TIMELINE */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
                        Customer Order History
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {orders.filter((o) => o.customerEmail === selectedCustomer.email).length} lifetime orders placed
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 text-[10px] font-extrabold border border-slate-200/80 dark:border-border">
                    {orders.filter((o) => o.customerEmail === selectedCustomer.email).length} Orders
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-border">
                  {orders.filter((o) => o.customerEmail === selectedCustomer.email).length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-accent flex items-center justify-center mx-auto text-slate-400">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                        No order records linked to {selectedCustomer.email}.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        New orders matching this customer email will automatically appear in this timeline.
                      </p>
                    </div>
                  ) : (
                    orders
                      .filter((o) => o.customerEmail === selectedCustomer.email)
                      .map((ord) => (
                        <div key={ord.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-mono font-extrabold text-xs text-indigo-600 dark:text-indigo-400 block">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {ord.createdAt}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-accent font-extrabold text-[10px] uppercase text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-border">
                            {ord.orderStatus}
                          </span>
                          <span className="font-black text-xs text-slate-900 dark:text-foreground font-mono">
                            {ord.currency === 'INR'
                              ? '₹'
                              : ord.currency === 'EUR'
                                ? '€'
                                : ord.currency === 'GBP'
                                  ? '£'
                                  : '$'}
                            {ord.totalAmount.toFixed(2)} {ord.currency || ''}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* INTERNAL CUSTOMER NOTES TIMELINE */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-border">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
                      Internal Customer Notes & Staff Log
                    </h4>
                    <p className="text-[11px] text-slate-400">Private internal CRM logs visible only to team</p>
                  </div>
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add CRM note or special customer preference..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-medium text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isSaving || !noteInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaving ? 'Adding...' : 'Add Note'}</span>
                  </button>
                </form>

                <div className="space-y-2 pt-1">
                  {selectedCustomer.notes && selectedCustomer.notes.length > 0 ? (
                    selectedCustomer.notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-accent/40 border border-slate-200/80 dark:border-border space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{n.author}</span>
                          <span>{n.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{n.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      No internal staff notes recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GROUP & TAGS MODAL */}
      {isEditModalOpen && selectedCustomer && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in w-full h-full min-h-screen h-[100dvh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-foreground">Edit Customer Group & Tags</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update segment categorization for {selectedCustomer.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroupAndTags} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Customer Group Segment
                </label>
                <select
                  value={editGroup}
                  onChange={(e) => setEditGroup(e.target.value as CustomerGroup)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NEW">NEW CUSTOMER</option>
                  <option value="RETURNING">RETURNING CUSTOMER</option>
                  <option value="VIP">VIP HIGH SPENDER</option>
                  <option value="WHOLESALE">WHOLESALE B2B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Customer Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTagsInput}
                  onChange={(e) => setEditTagsInput(e.target.value)}
                  placeholder="VIP, High-Value, Tax-Exempt, EU-Customer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in w-full h-full min-h-screen h-[100dvh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl sm:rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-foreground">Add New Customer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Register customer profile and contact details</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <PhoneInputWithCountry
                    label="Phone Number"
                    required
                    value={addFormData.phone}
                    onChange={(val) => setAddFormData({ ...addFormData, phone: val })}
                    placeholder="98765 43210"
                    defaultCountryCode="+91"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Customer Group *</label>
                  <select
                    required
                    value={addFormData.group}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, group: e.target.value as CustomerGroup })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-bold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="NEW">New Customer</option>
                    <option value="RETURNING">Returning Customer</option>
                    <option value="VIP">VIP Spender</option>
                    <option value="WHOLESALE">Wholesale B2B</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Street Address *</label>
                <input
                  type="text"
                  required
                  value={addFormData.street}
                  onChange={(e) => setAddFormData({ ...addFormData, street: e.target.value })}
                  placeholder="742 Evergreen Terrace"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">City *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.city}
                    onChange={(e) => setAddFormData({ ...addFormData, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.state}
                    onChange={(e) => setAddFormData({ ...addFormData, state: e.target.value })}
                    placeholder="NY"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Zip / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.zip}
                    onChange={(e) => setAddFormData({ ...addFormData, zip: e.target.value })}
                    placeholder="10001"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Tags (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.tags}
                    onChange={(e) => setAddFormData({ ...addFormData, tags: e.target.value })}
                    placeholder="VIP, Retail, Direct"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="addAcceptsMarketing"
                  checked={addFormData.acceptsMarketing}
                  onChange={(e) => setAddFormData({ ...addFormData, acceptsMarketing: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="addAcceptsMarketing" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Customer accepts promotional email & marketing communication
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Customer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
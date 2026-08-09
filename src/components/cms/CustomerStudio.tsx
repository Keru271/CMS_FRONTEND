'use client';

import React, { useState, useEffect } from 'react';
import { CMSCustomer, CustomerGroup, CMSOrder } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
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
} from 'lucide-react';

export const CustomerStudio: React.FC = () => {
  const [customers, setCustomers] = useState<CMSCustomer[]>([]);
  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'RETURNING' | 'VIP' | 'WHOLESALE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

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
    try {
      setIsSaving(true);
      const tagsArray = addFormData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await cmsService.createCustomer({
        name: addFormData.name,
        email: addFormData.email,
        phone: addFormData.phone,
        group: addFormData.group,
        tags: tagsArray,
        acceptsMarketing: addFormData.acceptsMarketing,
        address: {
          name: addFormData.name,
          street: addFormData.street || '123 Main Street',
          city: addFormData.city || 'New York',
          state: addFormData.state || 'NY',
          zip: addFormData.zip || '10001',
          country: addFormData.country || 'United States',
        },
      });

      showToast(`Customer "${created.name}" created successfully!`, 'success');
      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create customer.', 'error');
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
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Customers CRM...</span>
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
                CRM & Customer Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {customers.length} Registered Accounts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-400" />
              <span>Customers Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Manage customer profiles, lifetime spend, order history, customer segmentation groups (New, Returning, VIP, Wholesale), tags, addresses, and marketing consent options.
            </p>
          </div>

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
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* 5 CUSTOMER GROUP SEGMENTATION TABS */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Customers', count: groupCounts.ALL, icon: Users, color: 'bg-slate-900 text-white' },
            { id: 'NEW', label: 'New Customers', count: groupCounts.NEW, icon: UserPlus, color: 'bg-blue-600 text-white' },
            { id: 'RETURNING', label: 'Returning Customers', count: groupCounts.RETURNING, icon: UserCheck, color: 'bg-indigo-600 text-white' },
            { id: 'VIP', label: 'VIP Spenders', count: groupCounts.VIP, icon: Crown, color: 'bg-amber-500 text-white' },
            { id: 'WHOLESALE', label: 'Wholesale B2B', count: groupCounts.WHOLESALE, icon: Building, color: 'bg-purple-600 text-white' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
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
        </div>
      </div>

      {/* CUSTOMERS DATA TABLE */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-accent border-b border-slate-200/80 dark:border-border text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Customer Profile</th>
                <th className="py-4 px-6">Group Segment</th>
                <th className="py-4 px-6">Tags</th>
                <th className="py-4 px-6">Orders Count</th>
                <th className="py-4 px-6">Lifetime Spend ($)</th>
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
                filteredCustomers.map((cust) => {
                  const grpUpper = cust.group.toUpperCase();

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-accent/50 transition-colors">
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
                          className={`px-3 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-max ${
                            grpUpper === 'VIP'
                              ? 'bg-amber-500 text-white'
                              : grpUpper === 'WHOLESALE'
                              ? 'bg-purple-600 text-white'
                              : grpUpper === 'RETURNING'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {grpUpper === 'VIP' && <Crown className="w-3 h-3" />}
                          {grpUpper === 'WHOLESALE' && <Building className="w-3 h-3" />}
                          <span>{grpUpper}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(cust.tags) ? (
                            cust.tags.map((t, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-accent text-slate-700 text-[10px] font-extrabold">
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">No tags</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold">{cust.totalOrders} Orders</td>

                      <td className="py-4 px-6 font-black text-sm text-slate-900 dark:text-foreground">
                        ${cust.totalSpent.toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            cust.acceptsMarketing
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cust.acceptsMarketing ? '✓ Email Opt-in' : 'No Consent'}
                        </span>
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
      </div>

      {/* CUSTOMER PROFILE DRAWER / MODAL */}
      {isProfileOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            {/* Top Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedCustomer.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.email}`
                  }
                  alt={selectedCustomer.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-white">{selectedCustomer.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                      {selectedCustomer.group}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.email} • Joined {selectedCustomer.createdAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Drawer Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* KPI STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">Lifetime Spend (LTV)</span>
                    <span className="text-xl font-black text-indigo-700 block">${selectedCustomer.totalSpent.toFixed(2)}</span>
                  </div>
                  <DollarSign className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider block">Total Orders</span>
                    <span className="text-xl font-black text-emerald-700 block">{selectedCustomer.totalOrders} Orders</span>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">Average Order Value</span>
                    <span className="text-xl font-black text-amber-700 block">
                      ${selectedCustomer.totalOrders > 0 ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              {/* GRID: ADDRESS & MARKETING CONSENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Address */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Primary Shipping Address</span>
                  </h4>
                  <div className="space-y-1 text-xs text-slate-700 font-semibold">
                    <span className="font-extrabold text-slate-900 block">{selectedCustomer.address?.name || selectedCustomer.name}</span>
                    <span className="text-slate-500 block">{selectedCustomer.address?.street || '123 Main Street'}</span>
                    <span className="text-slate-500 block">
                      {selectedCustomer.address?.city || 'New York'}, {selectedCustomer.address?.state || 'NY'} {selectedCustomer.address?.zip || '10001'}
                    </span>
                    <span className="text-slate-500 block">{selectedCustomer.address?.country || 'United States'}</span>
                    <span className="text-slate-400 font-mono text-[11px] block pt-1">Phone: {selectedCustomer.phone || 'N/A'}</span>
                  </div>
                </div>

                {/* Marketing Consent Controls */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Marketing Subscription Consent</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                      <span className="text-xs font-extrabold text-slate-800">Email Marketing Campaign Subscribed</span>
                      <button
                        type="button"
                        onClick={() => handleToggleConsent('EMAIL')}
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          selectedCustomer.acceptsMarketing
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {selectedCustomer.acceptsMarketing ? '✓ Opted-In' : 'Unsubscribed'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                      <span className="text-xs font-extrabold text-slate-800">SMS Direct Marketing Consent</span>
                      <button
                        type="button"
                        onClick={() => handleToggleConsent('SMS')}
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          selectedCustomer.acceptsSMSMarketing
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {selectedCustomer.acceptsSMSMarketing ? '✓ Opted-In' : 'Unsubscribed'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ORDER HISTORY TIMELINE */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>Customer Order History ({orders.filter((o) => o.customerEmail === selectedCustomer.email).length} Orders)</span>
                </h4>

                <div className="divide-y divide-slate-100">
                  {orders.filter((o) => o.customerEmail === selectedCustomer.email).length === 0 ? (
                    <p className="py-4 text-xs text-slate-400 italic text-center">No order records linked to {selectedCustomer.email}.</p>
                  ) : (
                    orders
                      .filter((o) => o.customerEmail === selectedCustomer.email)
                      .map((ord) => (
                        <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-mono font-extrabold text-xs text-indigo-600 block">#{ord.orderNumber}</span>
                            <span className="text-[11px] text-slate-400 block">{ord.createdAt}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-extrabold text-[10px] uppercase text-slate-700">
                            {ord.orderStatus}
                          </span>
                          <span className="font-black text-xs text-slate-900">${ord.totalAmount.toFixed(2)}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* INTERNAL CUSTOMER NOTES TIMELINE */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Internal Customer Notes & Staff Log</span>
                </h4>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add CRM note or special customer preference..."
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
                  {selectedCustomer.notes && selectedCustomer.notes.length > 0 ? (
                    selectedCustomer.notes.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="text-indigo-600 font-extrabold">{n.author}</span>
                          <span>{n.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium">{n.text}</p>
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

      {/* EDIT GROUP & TAGS MODAL */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Edit Customer Group & Tags</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroupAndTags} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Customer Group Segment</label>
                <select
                  value={editGroup}
                  onChange={(e) => setEditGroup(e.target.value as CustomerGroup)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="NEW">NEW CUSTOMER</option>
                  <option value="RETURNING">RETURNING CUSTOMER</option>
                  <option value="VIP">VIP HIGH SPENDER</option>
                  <option value="WHOLESALE">WHOLESALE B2B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Customer Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTagsInput}
                  onChange={(e) => setEditTagsInput(e.target.value)}
                  placeholder="VIP, High-Value, Tax-Exempt, EU-Customer"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Add New Customer</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Customer Group</label>
                  <select
                    value={addFormData.group}
                    onChange={(e) => setAddFormData({ ...addFormData, group: e.target.value as CustomerGroup })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="NEW">New Customer</option>
                    <option value="RETURNING">Returning Customer</option>
                    <option value="VIP">VIP Spender</option>
                    <option value="WHOLESALE">Wholesale B2B</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Street Address</label>
                <input
                  type="text"
                  value={addFormData.street}
                  onChange={(e) => setAddFormData({ ...addFormData, street: e.target.value })}
                  placeholder="742 Evergreen Terrace"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { CMSStoreMember, CreateStoreMemberPayload, StoreMemberRole } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Crown,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Package,
  Truck,
  Headphones,
  Palette,
  Settings,
  DollarSign,
  BarChart3,
  X,
  RefreshCw,
  Search,
  ArrowRightLeft,
  Lock,
  Mail,
  UserCheck,
  Boxes,
  HelpCircle,
  FileCheck,
  Check,
} from 'lucide-react';

const ROLE_PRESETS: {
  role: StoreMemberRole;
  title: string;
  desc: string;
  badgeColor: string;
  icon: any;
  permissions: {
    canManageProducts: boolean;
    canManageInventory: boolean;
    canManageOrders: boolean;
    canManageCustomers: boolean;
    canManageThemes: boolean;
    canManageSettings: boolean;
    canManagePayments: boolean;
    canManageLogistics: boolean;
    canManageAnalytics: boolean;
  };
}[] = [
  {
    role: 'ADMIN',
    title: 'Store Administrator',
    desc: 'Full administrative access across all products, orders, settings, payments, themes, and team members.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    icon: ShieldCheck,
    permissions: {
      canManageProducts: true,
      canManageInventory: true,
      canManageOrders: true,
      canManageCustomers: true,
      canManageThemes: true,
      canManageSettings: true,
      canManagePayments: true,
      canManageLogistics: true,
      canManageAnalytics: true,
    },
  },
  {
    role: 'STOCK_CHECKER',
    title: 'Stock Checker & Inventory Clerk',
    desc: 'Manage catalog products, stock levels, warehouse inventory audits, SKUs, and variant quantities.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    icon: Boxes,
    permissions: {
      canManageProducts: true,
      canManageInventory: true,
      canManageOrders: false,
      canManageCustomers: false,
      canManageThemes: false,
      canManageSettings: false,
      canManagePayments: false,
      canManageLogistics: false,
      canManageAnalytics: false,
    },
  },
  {
    role: 'FULFILLMENT',
    title: 'Logistics & Fulfillment Specialist',
    desc: 'Access orders, packing slips, carrier shipping rates, tracking numbers, and fulfillment status updates.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    icon: Truck,
    permissions: {
      canManageProducts: false,
      canManageInventory: true,
      canManageOrders: true,
      canManageCustomers: false,
      canManageThemes: false,
      canManageSettings: false,
      canManagePayments: false,
      canManageLogistics: true,
      canManageAnalytics: false,
    },
  },
  {
    role: 'SUPPORT',
    title: 'Customer Support Agent',
    desc: 'View customer accounts, lookup order details, process refunds, and respond to support queries.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    icon: Headphones,
    permissions: {
      canManageProducts: false,
      canManageInventory: false,
      canManageOrders: true,
      canManageCustomers: true,
      canManageThemes: false,
      canManageSettings: false,
      canManagePayments: false,
      canManageLogistics: true,
      canManageAnalytics: false,
    },
  },
  {
    role: 'EDITOR',
    title: 'Theme & Content Designer',
    desc: 'Customize storefront templates, landing pages, marketing banners, navigation menus, and media.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    icon: Palette,
    permissions: {
      canManageProducts: true,
      canManageInventory: false,
      canManageOrders: false,
      canManageCustomers: false,
      canManageThemes: true,
      canManageSettings: false,
      canManagePayments: false,
      canManageLogistics: false,
      canManageAnalytics: false,
    },
  },
  {
    role: 'CUSTOM',
    title: 'Custom Staff Role',
    desc: 'Define custom access permissions tailored to your exact store workflow requirements.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-accent dark:text-slate-300 dark:border-border',
    icon: Settings,
    permissions: {
      canManageProducts: true,
      canManageInventory: true,
      canManageOrders: false,
      canManageCustomers: false,
      canManageThemes: false,
      canManageSettings: false,
      canManagePayments: false,
      canManageLogistics: false,
      canManageAnalytics: false,
    },
  },
];

export const UserManagementStudio: React.FC = () => {
  const [members, setMembers] = useState<CMSStoreMember[]>([]);
  const [owner, setOwner] = useState<CMSStoreMember | null>(null);
  const [storeName, setStoreName] = useState('OmniStore');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CMSStoreMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add Member Form
  const [addForm, setAddForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: StoreMemberRole;
    customRoleTitle: string;
    canManageProducts: boolean;
    canManageInventory: boolean;
    canManageOrders: boolean;
    canManageCustomers: boolean;
    canManageThemes: boolean;
    canManageSettings: boolean;
    canManagePayments: boolean;
    canManageLogistics: boolean;
    canManageAnalytics: boolean;
  }>({
    name: '',
    email: '',
    password: 'Staff@12345',
    role: 'STOCK_CHECKER',
    customRoleTitle: 'Stock Checker & Inventory Specialist',
    canManageProducts: true,
    canManageInventory: true,
    canManageOrders: false,
    canManageCustomers: false,
    canManageThemes: false,
    canManageSettings: false,
    canManagePayments: false,
    canManageLogistics: false,
    canManageAnalytics: false,
  });

  // Created Credentials Popup
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);

  // Transfer Ownership Form
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [retainAsAdmin, setRetainAsAdmin] = useState(true);
  const [transferConfirmText, setTransferConfirmText] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getStoreMembers();
      setStoreName(data.storeName || 'OmniStore');
      setOwner(data.owner || null);
      setMembers(data.members || []);
    } catch (err) {
      console.error('Failed to load store members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Preset Role Selection
  const handleSelectRolePreset = (role: StoreMemberRole) => {
    const preset = ROLE_PRESETS.find((p) => p.role === role);
    if (!preset) return;

    setAddForm((prev) => ({
      ...prev,
      role,
      customRoleTitle: preset.title,
      ...preset.permissions,
    }));
  };

  // Open Add Member Modal
  const handleOpenAddModal = () => {
    const defaultPreset = ROLE_PRESETS[1]; // Stock Checker default
    setAddForm({
      name: '',
      email: '',
      password: 'Staff@12345',
      role: 'STOCK_CHECKER',
      customRoleTitle: defaultPreset.title,
      ...defaultPreset.permissions,
    });
    setIsAddModalOpen(true);
  };

  // Submit Add Member
  const handleSubmitAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await cmsService.addStoreMember(addForm);
      showToast(`User "${addForm.name}" added to ${addForm.customRoleTitle}!`, 'success');
      setIsAddModalOpen(false);
      setCreatedCredentials({
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role: addForm.customRoleTitle || addForm.role,
      });
      await loadMembers();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to add user.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Member Modal
  const handleOpenEditModal = (member: CMSStoreMember) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  // Submit Edit Member
  const handleSubmitEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSaving(true);
    try {
      await cmsService.updateStoreMember(editingMember.id, {
        name: editingMember.name,
        role: editingMember.role,
        customRoleTitle: editingMember.customRoleTitle,
        status: editingMember.status,
        canManageProducts: editingMember.canManageProducts,
        canManageInventory: editingMember.canManageInventory,
        canManageOrders: editingMember.canManageOrders,
        canManageCustomers: editingMember.canManageCustomers,
        canManageThemes: editingMember.canManageThemes,
        canManageSettings: editingMember.canManageSettings,
        canManagePayments: editingMember.canManagePayments,
        canManageLogistics: editingMember.canManageLogistics,
        canManageAnalytics: editingMember.canManageAnalytics,
      });
      showToast(`Updated permissions for "${editingMember.name}".`, 'success');
      setIsEditModalOpen(false);
      await loadMembers();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to update member.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete / Revoke Member
  const handleDeleteMember = async (member: CMSStoreMember) => {
    if (member.isOwner || member.role === 'OWNER') {
      alert('The primary Store Owner account cannot be deleted. Use "Transfer Ownership" instead.');
      return;
    }

    if (confirm(`Revoke store access for "${member.name}" (${member.email})?`)) {
      try {
        setIsSaving(true);
        await cmsService.deleteStoreMember(member.id);
        showToast(`Access revoked for "${member.name}".`, 'success');
        await loadMembers();
      } catch (err: any) {
        showToast(err.response?.data?.message || err.message || 'Failed to delete member.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Submit Transfer Ownership
  const handleSubmitTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferConfirmText.trim().toUpperCase() !== 'TRANSFER') {
      showToast('Please type "TRANSFER" to confirm account handover.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await cmsService.transferStoreOwnership({
        targetEmail: transferTargetEmail.trim(),
        retainAsAdmin,
      });
      showToast(res.message || 'Store ownership transferred successfully!', 'success');
      setIsTransferModalOpen(false);
      setTransferConfirmText('');
      setTransferTargetEmail('');
      await loadMembers();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to transfer store ownership.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.customRoleTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = members.filter((m) => m.role === 'ADMIN' || m.isOwner).length;
  const stockCheckerCount = members.filter((m) => m.role === 'STOCK_CHECKER').length;
  const opsCount = members.filter(
    (m) => m.role === 'FULFILLMENT' || m.role === 'SUPPORT' || m.role === 'EDITOR' || m.role === 'MANAGER'
  ).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Store Team & Access Control...</span>
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
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Store Team & Access Control</span>
              </span>
              {owner && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Owner: {owner.email}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <KeyRound className="w-8 h-8 text-indigo-400" />
              <span>User Management & Roles</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Add team members to <strong>{storeName}</strong>, assign granular roles (Admin, Stock Checker, Logistics, Support, Designer), and safely transfer store ownership.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-extrabold flex items-center gap-2 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              <span>Transfer Store Ownership</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-700/60">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
            <span className="text-xl font-black text-white">{members.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admins & Owners</span>
            <span className="text-xl font-black text-purple-300">{adminCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Checkers</span>
            <span className="text-xl font-black text-cyan-300">{stockCheckerCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operations & Support</span>
            <span className="text-xl font-black text-emerald-300">{opsCount}</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Showing <strong>{filteredMembers.length}</strong> active team members
        </span>
      </div>

      {/* TEAM MEMBERS TABLE */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-border bg-slate-50/50 dark:bg-accent/40 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">User & Email</th>
                <th className="py-4 px-6">Assigned Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Access Permissions</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border font-medium">
              {filteredMembers.map((member) => {
                const isOwner = member.isOwner || member.role === 'OWNER';
                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-accent/20 transition-colors">
                    {/* User & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                            isOwner
                              ? 'bg-amber-500 text-white shadow-amber-500/30'
                              : member.role === 'ADMIN'
                              ? 'bg-purple-600 text-white'
                              : member.role === 'STOCK_CHECKER'
                              ? 'bg-cyan-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {isOwner ? (
                            <Crown className="w-5 h-5" />
                          ) : (
                            member.name.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-foreground block truncate">
                            {member.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Role */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            isOwner
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700'
                              : member.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-700'
                              : member.role === 'STOCK_CHECKER'
                              ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-700'
                              : member.role === 'FULFILLMENT'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700'
                              : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-accent dark:text-slate-200'
                          }`}
                        >
                          {isOwner && <Crown className="w-3 h-3 text-amber-600" />}
                          <span>{member.customRoleTitle || member.role}</span>
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : member.status === 'INVITED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{member.status}</span>
                      </span>
                    </td>

                    {/* Access Permissions Badges */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                            Full Unrestricted Access
                          </span>
                        ) : (
                          <>
                            {member.canManageProducts && (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                Products
                              </span>
                            )}
                            {member.canManageInventory && (
                              <span className="px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                                Inventory
                              </span>
                            )}
                            {member.canManageOrders && (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                                Orders
                              </span>
                            )}
                            {member.canManageCustomers && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                Customers
                              </span>
                            )}
                            {member.canManageThemes && (
                              <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                Themes & Pages
                              </span>
                            )}
                            {member.canManageSettings && (
                              <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                                Settings
                              </span>
                            )}
                            {member.canManagePayments && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                Payments
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isOwner ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(member)}
                              title="Edit Member Permissions"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member)}
                              title="Revoke Access"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl">
                            Primary Account
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / INVITE MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Add Staff Member</h3>
                  <p className="text-xs text-slate-400">Grant store access with pre-configured role presets or custom permissions.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddMember} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Member Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Staff Member Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Work Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="alex@omnistore.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-mono font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Initial Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Initial Login Password</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Min 6 characters</span>
                </div>
                <input
                  type="text"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Staff@12345"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-mono font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Role Preset Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Select Role & Access Level Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLE_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = addForm.role === preset.role;
                    return (
                      <div
                        key={preset.role}
                        onClick={() => handleSelectRolePreset(preset.role)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                            : 'bg-white dark:bg-card border-slate-200 dark:border-border hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-foreground flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span>{preset.title}</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{preset.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>Granular Access Permissions</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Role: {addForm.role}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'canManageProducts', label: 'Catalog & Products', icon: Package },
                    { key: 'canManageInventory', label: 'Stock & Inventory Quantities', icon: Boxes },
                    { key: 'canManageOrders', label: 'Orders & Shipments', icon: Truck },
                    { key: 'canManageCustomers', label: 'Customer Directory & Profiles', icon: Users },
                    { key: 'canManageThemes', label: 'Themes, Pages & Navigation', icon: Palette },
                    { key: 'canManageSettings', label: 'Store Settings & Tax', icon: Settings },
                    { key: 'canManagePayments', label: 'Payment Gateways & Payouts', icon: DollarSign },
                    { key: 'canManageAnalytics', label: 'Analytics & Sales Reports', icon: BarChart3 },
                  ].map((perm) => {
                    const Icon = perm.icon;
                    const isChecked = (addForm as any)[perm.key];
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white dark:bg-card border-indigo-300 text-indigo-900 dark:text-indigo-200 shadow-xs'
                            : 'bg-white/50 dark:bg-card/50 border-slate-200/60 opacity-60 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setAddForm({ ...addForm, [perm.key]: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-bold">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Adding User...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Add & Grant Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER PERMISSIONS MODAL */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Edit Access: {editingMember.name}</h3>
                  <span className="text-xs font-mono text-indigo-300">{editingMember.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditMember} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Role Title</label>
                  <input
                    type="text"
                    value={editingMember.customRoleTitle || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, customRoleTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Account Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INVITED">INVITED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-foreground">Permissions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'canManageProducts', label: 'Catalog Products' },
                    { key: 'canManageInventory', label: 'Stock & Inventory' },
                    { key: 'canManageOrders', label: 'Orders & Shipping' },
                    { key: 'canManageCustomers', label: 'Customer Management' },
                    { key: 'canManageThemes', label: 'Themes & Pages' },
                    { key: 'canManageSettings', label: 'Store Settings' },
                    { key: 'canManagePayments', label: 'Payments & Payouts' },
                    { key: 'canManageAnalytics', label: 'Analytics Reports' },
                  ].map((p) => {
                    const isChecked = (editingMember as any)[p.key];
                    return (
                      <label
                        key={p.key}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setEditingMember({ ...editingMember, [p.key]: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-border">
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

      {/* TRANSFER STORE OWNERSHIP MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center text-white">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Transfer Store Ownership</h3>
                  <p className="text-xs text-amber-100">Hand over primary administrative ownership of this store.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransferOwnership} className="p-6 space-y-5">
              {/* Warning Alert */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-extrabold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Important Security Notice</span>
                </div>
                <p className="leading-relaxed">
                  Transferring ownership grants the recipient full primary authority over <strong>{storeName}</strong>, billing subscriptions, domain configurations, and team members.
                </p>
              </div>

              {/* Recipient Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  New Owner's Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={transferTargetEmail}
                  onChange={(e) => setTransferTargetEmail(e.target.value)}
                  placeholder="new-owner@example.com"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-mono font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Quick Pick From Existing Members */}
              {members.filter((m) => !m.isOwner).length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block">Or select from existing team:</span>
                  <div className="flex flex-wrap gap-2">
                    {members
                      .filter((m) => !m.isOwner)
                      .map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setTransferTargetEmail(m.email)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                            transferTargetEmail === m.email
                              ? 'bg-amber-100 border-amber-400 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {m.name} ({m.email})
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Retain as Admin checkbox */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={retainAsAdmin}
                  onChange={(e) => setRetainAsAdmin(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-foreground block">
                    Keep previous owner as Store Administrator
                  </span>
                  <p className="text-[11px] text-slate-500">
                    If unchecked, the current owner's access will be removed completely.
                  </p>
                </div>
              </label>

              {/* Confirmation Input */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                <label className="block text-[11px] font-black text-rose-900 dark:text-rose-300">
                  Type <strong className="font-mono">TRANSFER</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={transferConfirmText}
                  onChange={(e) => setTransferConfirmText(e.target.value)}
                  placeholder="TRANSFER"
                  className="w-full px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-card text-xs font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || transferConfirmText.trim().toUpperCase() !== 'TRANSFER'}
                  className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-md disabled:opacity-40 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Handover Ownership</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF LOGIN CREDENTIALS CREATED MODAL */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Staff Account Created!</h3>
                  <p className="text-xs text-emerald-100">Login credentials ready for the new user.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The user <strong>{createdCredentials.name}</strong> can now log in to the CMS dashboard using the following credentials:
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Role</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{createdCredentials.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Login Email</span>
                  <span className="font-bold text-slate-900 dark:text-foreground">{createdCredentials.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Password</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {createdCredentials.password}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">CMS Portal URL</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">http://localhost:3000/login</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `OmniStore CMS Login Credentials:\nRole: ${createdCredentials.role}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nPortal: http://localhost:3000/login`
                    );
                    showToast('Credentials copied to clipboard!', 'success');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-800 dark:text-foreground text-xs font-bold transition-all"
                >
                  Copy Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedCredentials(null)}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

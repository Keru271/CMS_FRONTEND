'use client';

import React, { useState } from 'react';
import { Search, Plus, Bell, Calendar, ChevronDown, LogOut, Menu } from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onAddProduct?: () => void;
  merchantData?: MerchantOnboardingData | null;
  onLogout?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onSearch,
  onAddProduct,
  merchantData,
  onLogout,
  onToggleMobileSidebar,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const storeName = merchantData?.store?.storeName || 'Car leasing';

  return (
    <header className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 bg-transparent">
      {/* Left Store Selector Dropdown Pill */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Store Selector Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 shadow-xs cursor-pointer hover:bg-slate-50 transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs font-extrabold text-slate-900 dark:text-foreground truncate max-w-[160px] sm:max-w-[200px]">
            {storeName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </div>
      </div>

      {/* Header Actions Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative w-40 sm:w-60">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-[#e2e8f0]/60 dark:bg-card border-none text-xs font-semibold text-slate-800 dark:text-foreground placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-400/50"
          />
        </div>

        {/* Date Button Icon */}
        <button
          className="p-2 rounded-xl bg-white dark:bg-card border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          aria-label="Filter Date"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Quick Action Plus Button Icon */}
        {onAddProduct && (
          <button
            onClick={onAddProduct}
            className="p-2 rounded-xl bg-white dark:bg-card border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            aria-label="Add Product"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Bell Notification Button Icon */}
        <button
          className="relative p-2 rounded-xl bg-white dark:bg-card border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Merchant User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-slate-400 transition-all overflow-hidden"
          >
            {merchantData?.merchant?.firstName?.charAt(0) || 'N'}
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-card border border-slate-200 rounded-3xl shadow-xl p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-900 block">
                  {merchantData?.merchant?.firstName || 'Admin'} {merchantData?.merchant?.lastName || 'User'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {merchantData?.merchant?.email || 'admin@store.com'}
                </span>
              </div>

              <div className="px-3 py-1.5 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Store:</span>
                  <strong className="text-slate-900 font-bold">{storeName}</strong>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-2xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

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

  const storeName = merchantData?.store?.storeName || 'STATAMIC STORE';

  return (
    <header className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 bg-[#fdf1ef]/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#cbd5e0]/60">
      {/* Left Store Selector Dropdown Pill */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] hover:bg-[#fdf1ef] transition-colors shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Store Selector Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] shadow-xs cursor-pointer hover:border-[#cbc2ea] transition-all">
          <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
          <span className="text-xs font-sans font-medium text-[#191a1b] truncate max-w-[160px] sm:max-w-[200px]">
            {storeName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#5e5a5a] shrink-0 ml-1" />
        </div>
      </div>

      {/* Header Actions Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative w-36 sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#5e5a5a] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search CMS..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-xs font-sans text-[#191a1b] placeholder:text-[#beb9b3] outline-none focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 transition-all"
          />
        </div>

        {/* Quick Action Add Button (Filled Primary Action) */}
        {onAddProduct && (
          <button
            onClick={onAddProduct}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#191a1b] text-[#d4ff4c] font-sans font-medium text-xs shadow-xs hover:bg-[#000000] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#d4ff4c]" />
            <span>New Item</span>
          </button>
        )}

        {/* Bell Notification Button Icon */}
        <button
          className="relative p-2 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] hover:bg-[#fdf1ef] hover:border-[#cbc2ea] transition-colors shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Merchant User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-[#191a1b] text-[#d4ff4c] font-sans font-bold flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-[#cbc2ea] transition-all overflow-hidden"
          >
            {merchantData?.merchant?.firstName?.charAt(0) || 'S'}
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#ffffff] border border-[#cbd5e0] rounded-xl shadow-statamic p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#cbd5e0]/60">
                <span className="text-xs font-sans font-semibold text-[#191a1b] block">
                  {merchantData?.merchant?.firstName || 'Admin'} {merchantData?.merchant?.lastName || 'User'}
                </span>
                <span className="text-[11px] font-sans text-[#5e5a5a] block truncate">
                  {merchantData?.merchant?.email || 'admin@statamic.com'}
                </span>
              </div>

              <div className="px-3 py-1.5 text-[11px] font-sans text-[#5e5a5a] space-y-1">
                <div className="flex justify-between">
                  <span>Active Store:</span>
                  <strong className="text-[#191a1b] font-medium">{storeName}</strong>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-left text-xs font-sans font-medium text-[#ef4444] hover:bg-[#fdf1ef] flex items-center gap-2 transition-colors"
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

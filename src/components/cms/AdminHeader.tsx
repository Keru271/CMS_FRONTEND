'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Store,
  Check,
  Globe,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';
import { useCMS } from '@/src/context/CMSContext';
import { useTranslation } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onOpenSpotlight?: () => void;
  onAddProduct?: () => void;
  merchantData?: MerchantOnboardingData | null;
  onLogout?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onSearch,
  onOpenSpotlight,
  onAddProduct,
  merchantData,
  onLogout,
  onToggleMobileSidebar,
}) => {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { stores, activeStore, switchActiveStore, setIsCreateStoreModalOpen } = useCMS();
  const { t, language, setLanguage, languages, currentLanguageOption } = useTranslation();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [storeFilterQuery, setStoreFilterQuery] = useState('');
  const [switchingStoreId, setSwitchingStoreId] = useState<string | null>(null);

  const storeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentStoreName = activeStore?.name || merchantData?.store?.storeName || 'My Store';
  const currentCurrency = activeStore?.currency || merchantData?.store?.currency || 'USD';
  const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (storeMenuRef.current && !storeMenuRef.current.contains(e.target as Node)) {
        setIsStoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStore = async (storeId: string) => {
    if (activeStore?.id === storeId) {
      setIsStoreMenuOpen(false);
      return;
    }
    setSwitchingStoreId(storeId);
    try {
      await switchActiveStore(storeId);
    } finally {
      setSwitchingStoreId(null);
      setIsStoreMenuOpen(false);
    }
  };

  const filteredStores = stores.filter(
    (st) =>
      (st.name || '').toLowerCase().includes(storeFilterQuery.toLowerCase()) ||
      (st.slug || '').toLowerCase().includes(storeFilterQuery.toLowerCase()),
  );

  return (
    <header className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-[#2C2C2E]">
      {/* Left Store Selector Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0" ref={storeMenuRef}>
        {/* Mobile Menu Drawer Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#1E1E1E] text-slate-600 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white md:hidden transition-colors cursor-pointer"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Store Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-800 dark:text-white hover:border-sky-500 dark:hover:border-[#00E5FF]/60 transition-all text-xs font-semibold max-w-[180px] sm:max-w-xs truncate cursor-pointer shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#32D74B] animate-pulse shrink-0" />
            <span className="truncate">{currentStoreName}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 dark:text-[#98989D] shrink-0 transition-transform ${
                isStoreMenuOpen ? 'rotate-180 text-sky-600 dark:text-[#00E5FF]' : ''
              }`}
            />
          </button>

          {/* Store Dropdown Menu */}
          {isStoreMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-slate-200 dark:border-[#2C2C2E] flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-[#98989D] uppercase tracking-wider">
                  Select Active Store
                </span>
                <button
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    setIsCreateStoreModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-sky-600 dark:text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              {/* Search Stores */}
              {stores.length > 3 && (
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={storeFilterQuery}
                    onChange={(e) => setStoreFilterQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-[#2C2C2E] rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-[#00E5FF]"
                  />
                </div>
              )}

              {/* Stores List */}
              <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                {filteredStores.map((st) => {
                  const isSelected = activeStore?.id === st.id;
                  const isSwitching = switchingStoreId === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleSelectStore(st.id)}
                      disabled={isSwitching}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-[#00E5FF]/10 text-sky-700 dark:text-[#00E5FF] border border-sky-200 dark:border-[#00E5FF]/30 font-semibold'
                          : 'text-slate-700 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-slate-900 dark:text-white truncate">{st.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-[#98989D] font-mono">/{st.slug}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-[#00E5FF] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Storefront Link */}
              <div className="p-2 pt-2 border-t border-slate-200 dark:border-[#2C2C2E]">
                <a
                  href={STOREFRONT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-[#2C2C2E] text-xs text-slate-600 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white hover:border-sky-500 dark:hover:border-[#00E5FF] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Live Storefront</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Mode Status Indicator */}
        {(activeStore as any)?.maintenanceMode && (
          <button
            onClick={() => router.push('/store-setup')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold cursor-pointer hover:bg-amber-500/20 transition shrink-0"
            title="Store is currently in Maintenance Mode. Click to configure."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Maintenance Mode</span>
          </button>
        )}
      </div>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Apple Spotlight Search Trigger (Desktop) */}
        <button
          onClick={onOpenSpotlight}
          type="button"
          className="hidden sm:flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs group w-48 md:w-56 lg:w-64"
          title="Search (Ctrl+F or ⌘F)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
            <span className="truncate text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
              Search everywhere...
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#2C2C2E] text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              Ctrl+F
            </kbd>
          </div>
        </button>

        {/* Mobile Spotlight Search Trigger Button */}
        <button
          onClick={onOpenSpotlight}
          type="button"
          className="sm:hidden p-1.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-600 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          title="Search"
          aria-label="Open Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Add Product Button (Primary Action) */}
        {onAddProduct && (
          <button
            onClick={onAddProduct}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-[#00E5FF] dark:hover:bg-[#00b4cc] text-white dark:text-[#121212] font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        )}

        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-700 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white transition-all text-xs font-medium flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Language"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline uppercase text-[11px] font-bold">
              {currentLanguageOption?.code || 'EN'}
            </span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500 dark:text-[#98989D] tracking-wider border-b border-slate-200 dark:border-[#2C2C2E]">
                Language
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5 py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                      language === lang.code
                        ? 'bg-sky-50 dark:bg-[#00E5FF]/10 text-sky-600 dark:text-[#00E5FF] font-bold'
                        : 'text-slate-700 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{lang.nativeName || lang.name}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-[#00E5FF]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Mode Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-700 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme Mode"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-semibold">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-600 dark:text-[#00E5FF] shrink-0" />
              <span className="hidden sm:inline text-[11px] font-semibold">Dark</span>
            </>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-800 dark:text-white hover:border-sky-500 dark:hover:border-[#00E5FF]/60 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-[#00E5FF]/20 border border-sky-300 dark:border-[#00E5FF]/40 text-sky-700 dark:text-[#00E5FF] flex items-center justify-center font-mono font-bold text-xs">
              {(merchantData?.merchant?.firstName || 'M')[0].toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-semibold max-w-[90px] truncate">
              {merchantData?.merchant?.firstName || 'Merchant'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-slate-200 dark:border-[#2C2C2E]">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {merchantData?.merchant
                    ? `${merchantData.merchant.firstName || ''} ${merchantData.merchant.lastName || ''}`.trim() || 'Store Owner'
                    : 'Store Owner'}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#98989D] truncate">
                  {merchantData?.merchant?.email || 'owner@store.com'}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-[#00E5FF]/10 text-sky-700 dark:text-[#00E5FF] border border-sky-200 dark:border-[#00E5FF]/30">
                  {merchantData?.merchant?.role || 'OWNER'}
                </span>
              </div>

              <div className="space-y-1 py-1.5">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Store Settings
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/billing');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Subscription & Plan
                </button>
              </div>

              {onLogout && (
                <div className="pt-1 border-t border-slate-200 dark:border-[#2C2C2E]">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-[#FF453A] hover:bg-rose-50 dark:hover:bg-[#3A1C1C] transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


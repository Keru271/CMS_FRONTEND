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
  Sparkles,
  Store,
  Check,
  Globe,
  ExternalLink,
  MessageSquareCode,
  ShieldCheck,
  CreditCard,
  Sliders,
} from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';
import { useCMS } from '@/src/context/CMSContext';
import { useTranslation } from '@/src/context/LanguageContext';
import { SupportedLanguage } from '@/src/lib/i18n';

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
  const router = useRouter();
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

  const currentStoreName = activeStore?.name || merchantData?.store?.storeName || 'No Store Setup';
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

  const filteredStores = stores.filter((st) =>
    (st.name || '').toLowerCase().includes(storeFilterQuery.toLowerCase()) ||
    (st.slug || '').toLowerCase().includes(storeFilterQuery.toLowerCase())
  );

  return (
    <header className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 bg-[#fdf1ef]/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#cbd5e0]/60">
      {/* Left Store Selector Dropdown Pill */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0" ref={storeMenuRef}>
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] hover:bg-[#fdf1ef] transition-colors shrink-0"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Store Selector Pill & Dropdown */}
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#ffffff] border border-[#cbd5e0] shadow-xs hover:border-[#191a1b] transition-all cursor-pointer group max-w-full"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0 animate-pulse" />
            <span className="text-xs font-sans font-bold text-[#191a1b] truncate max-w-[90px] min-[400px]:max-w-[130px] sm:max-w-[200px]">
              {currentStoreName}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-mono font-bold text-[#5e5a5a]">
              {currentCurrency}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#5e5a5a] shrink-0 ml-0.5 transition-transform duration-200 ${isStoreMenuOpen ? 'rotate-180 text-[#191a1b]' : ''
                }`}
            />
          </button>

          {/* Multi-Store Dropdown Menu */}
          {isStoreMenuOpen && (
            <div className="absolute left-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white border border-[#cbd5e0] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-2 pb-2 border-b border-[#cbd5e0]/60">
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#191a1b]" />
                  <span className="text-xs font-bold text-[#191a1b]">Your Store Portfolio</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {stores.length} {stores.length === 1 ? 'Store' : 'Stores'}
                </span>
              </div>

              {/* Quick Search if multiple stores */}
              {stores.length > 2 && (
                <div className="relative px-1">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={storeFilterQuery}
                    onChange={(e) => setStoreFilterQuery(e.target.value)}
                    placeholder="Search stores..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-sans rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
                  />
                </div>
              )}

              {/* Store List */}
              <div className="max-h-60 overflow-y-auto space-y-1 px-1">
                {filteredStores.length === 0 && (
                  <div className="py-6 text-center text-xs text-gray-500">
                    <Store className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-gray-700">No stores created yet</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Click below to setup and launch your store.</p>
                  </div>
                )}
                {filteredStores.map((st) => {
                  const isActive = activeStore?.id === st.id;
                  const isSwitching = switchingStoreId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleSelectStore(st.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isActive
                          ? 'border-[#191a1b] bg-[#191a1b] text-white shadow-xs'
                          : 'border-transparent hover:border-[#cbd5e0] hover:bg-[#fdf1ef] text-[#191a1b]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${isActive ? 'bg-[#d4ff4c] text-[#191a1b]' : 'bg-gray-100 text-[#191a1b]'
                            }`}
                        >
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#191a1b]'}`}>
                              {st.name}
                            </p>
                          </div>
                          <p className={`text-[10px] font-mono truncate ${isActive ? 'text-gray-300' : 'text-[#5e5a5a]'}`}>
                            {st.slug}.onlinestore.io
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-[#d4ff4c]' : 'bg-gray-100 text-[#5e5a5a]'
                            }`}
                        >
                          {st.currency || 'INR'}
                        </span>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-[#d4ff4c] text-[#191a1b] flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        {isSwitching && (
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#cbd5e0]/60 space-y-1.5 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    setIsCreateStoreModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-[#191a1b] hover:bg-black text-[#d4ff4c] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#d4ff4c]" />
                  <span>{t('header.create_store', 'Create New Store')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsStoreMenuOpen(false);
                    router.push('/store-setup');
                  }}
                  className="w-full py-1.5 px-3 hover:bg-[#fdf1ef] text-[#191a1b] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#5e5a5a]" />
                  <span className="text-[#191a1b]">Store Configuration Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header Actions Right */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Search Bar - expands on focus for mobile */}
        <div className="relative w-24 min-[420px]:w-32 sm:w-52 focus-within:w-36 min-[420px]:focus-within:w-44 sm:focus-within:w-60 transition-all duration-300">
          <Search className="w-3.5 h-3.5 text-[#5e5a5a] absolute left-2.5 sm:left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('header.search_placeholder', 'Search CMS...')}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-xs font-sans text-[#191a1b] placeholder:text-[#beb9b3] outline-none focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 transition-all"
          />
        </div>

        {/* Regional Language Switcher Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] hover:border-[#191a1b] hover:bg-[#fdf1ef] transition-all cursor-pointer shadow-xs group"
            title="Change CMS Regional Language / भाषा बदलें / மொழி மாற்றுக"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-45 transition-transform shrink-0" />
            <span className="text-xs font-sans font-bold text-[#191a1b] hidden min-[480px]:inline">
              {currentLanguageOption.nativeName}
            </span>
            <span className="px-1 py-0.2 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-700">
              {currentLanguageOption.badge}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[#5e5a5a] transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180 text-[#191a1b]' : ''
                }`}
            />
          </button>

          {/* Language Menu Dropdown */}
          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-xs bg-white border border-[#cbd5e0] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
              <div className="px-3 py-2 border-b border-[#cbd5e0]/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#191a1b] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Regional Languages</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {languages.length} Locales
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Select your preferred regional language for CMS dashboard.
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-0.5 py-1">
                {languages.map((langItem) => {
                  const isCurrent = langItem.code === language;
                  return (
                    <button
                      key={langItem.code}
                      type="button"
                      onClick={() => {
                        setLanguage(langItem.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${isCurrent
                          ? 'bg-[#191a1b] text-white font-bold'
                          : 'hover:bg-[#fdf1ef] text-[#191a1b]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${isCurrent
                              ? 'bg-[#d4ff4c] text-[#191a1b]'
                              : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                          {langItem.badge}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{langItem.nativeName}</span>
                            <span
                              className={`text-[10px] ${isCurrent ? 'text-gray-300' : 'text-gray-500'
                                }`}
                            >
                              ({langItem.name})
                            </span>
                          </div>
                          <p
                            className={`text-[9px] ${isCurrent ? 'text-gray-300' : 'text-gray-400'
                              }`}
                          >
                            {langItem.region}
                          </p>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-4 h-4 rounded-full bg-[#d4ff4c] text-[#191a1b] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live Storefront Quick Link */}
        <a
          href={STOREFRONT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] font-sans font-medium text-xs shadow-xs hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all cursor-pointer group"
          title="Open Hosted Live Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span>{t('header.view_storefront', 'Live Store')}</span>
        </a>



        {/* Quick Action Add Button */}
        {onAddProduct && (
          <button
            onClick={onAddProduct}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#191a1b] text-[#d4ff4c] font-sans font-medium text-xs shadow-xs hover:bg-[#000000] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#d4ff4c]" />
            <span>{t('header.add_product', 'New Item')}</span>
          </button>
        )}

        {/* Bell Notification Button */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative p-2 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] hover:bg-[#fdf1ef] hover:border-[#cbc2ea] transition-colors shadow-xs cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Merchant User Profile Avatar & Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-[#191a1b] text-[#d4ff4c] font-sans font-bold flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-[#cbc2ea] transition-all overflow-hidden cursor-pointer"
          >
            {merchantData?.merchant?.firstName?.charAt(0) || 'S'}
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-[#ffffff] border border-[#cbd5e0] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#cbd5e0]/60">
                <span className="text-xs font-sans font-bold text-[#191a1b] block">
                  {merchantData?.merchant?.firstName || 'Admin'} {merchantData?.merchant?.lastName || 'Owner'}
                </span>
                <span className="text-[11px] font-sans text-[#5e5a5a] block truncate">
                  {merchantData?.merchant?.email || 'merchant@omnistore.com'}
                </span>
              </div>

              <div className="px-3 py-2 text-[11px] font-sans text-[#5e5a5a] space-y-1.5 border-b border-[#cbd5e0]/60">
                <div className="flex justify-between items-center">
                  <span>Current Store:</span>
                  <strong className="text-[#191a1b] font-bold truncate max-w-[120px]">{currentStoreName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Language:</span>
                  <span className="font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {currentLanguageOption.nativeName} ({currentLanguageOption.name})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Stores:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {stores.length} Active
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/settings?tab=preferences');
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-[#191a1b] hover:bg-[#fdf1ef] rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('nav.user_preferences', 'User Preferences & Profile')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsCreateStoreModalOpen(true);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-[#191a1b] hover:bg-[#fdf1ef] rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('header.create_store', 'Add Another Store')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    router.push('/payments');
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-[#191a1b] hover:bg-[#fdf1ef] rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#191a1b]" />
                  <span>{t('nav.payments', 'Payment Gateway Studio')}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#cbd5e0]/60">
                <button
                  onClick={onLogout}
                  className="w-full px-3 py-1.5 text-left text-xs font-sans text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('nav.logout', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  Truck,
  Database,
  UserCheck,
  Palette,
  Compass,
  FileText,
  Tag,
  Receipt,
  Megaphone,
  CreditCard,
  Star,
  Zap,
  Globe,
  Bell,
  Code2,
  Crown,
  Search,
  FolderTree,
  BookOpen,
} from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { useTranslation } from '@/src/context/LanguageContext';

export type CMSView =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'settings'
  | 'store-setup'
  | 'themes'
  | 'pages'
  | 'blog'
  | 'navigation'
  | 'discounts'
  | 'payments'
  | 'reviews'
  | 'billing'
  | 'domains'
  | 'shipping'
  | 'tax'
  | 'team'
  | 'marketing'
  | 'notifications'
  | 'seo'
  | 'loyalty'
  | 'developer'
  | 'docs';

interface SidebarProps {
  currentView?: CMSView;
  onViewChange?: (view: CMSView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  productsCount?: number;
  ordersCount?: number;
  merchantData?: MerchantOnboardingData | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  productsCount = 0,
  ordersCount = 0,
  merchantData,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const primaryNavItems = [
    { id: 'dashboard' as CMSView, path: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'store-setup' as CMSView, path: '/store-setup', label: t('nav.store_setup', 'Store Setup'), icon: Store },
    { id: 'themes' as CMSView, path: '/themes', label: t('nav.themes', 'Theme Studio'), icon: Palette },
    { id: 'domains' as CMSView, path: '/domains', label: t('nav.domains', 'Domains & DNS'), icon: Globe },
    { id: 'pages' as CMSView, path: '/pages', label: t('nav.pages', 'Pages'), icon: FileText },
    { id: 'blog' as CMSView, path: '/blog', label: t('nav.blog', 'Blog & Editorial'), icon: BookOpen },
    { id: 'navigation' as CMSView, path: '/navigation', label: t('nav.navigation', 'Navigation'), icon: Compass },
    { id: 'products' as CMSView, path: '/products', label: t('nav.products', 'Products Studio'), icon: Package, badge: productsCount },
    { id: 'categories' as CMSView, path: '/categories', label: t('nav.categories', 'Store Categories'), icon: FolderTree },
    { id: 'seo' as CMSView, path: '/seo', label: t('nav.seo', 'SEO Governance'), icon: Search },
    { id: 'orders' as CMSView, path: '/orders', label: t('nav.orders', 'Orders'), icon: ShoppingBag, badge: 6 },
    { id: 'customers' as CMSView, path: '/customers', label: t('nav.customers', 'Customers'), icon: Users },
    { id: 'reviews' as CMSView, path: '/reviews', label: t('nav.reviews', 'Product Reviews'), icon: Star },
    { id: 'billing' as CMSView, path: '/billing', label: t('nav.billing', 'Pricing & Billing'), icon: Zap },
    { id: 'payments' as CMSView, path: '/payments', label: t('nav.payments', 'Payments'), icon: CreditCard },
    { id: 'team' as CMSView, path: '/team', label: t('nav.team', 'Team & Roles'), icon: UserCheck },
    { id: 'discounts' as CMSView, path: '/discounts', label: t('nav.discounts', 'Discounts'), icon: Tag },
    { id: 'tax' as CMSView, path: '/tax', label: t('nav.tax', 'Taxation'), icon: Receipt },
    { id: 'shipping' as CMSView, path: '/shipping', label: t('nav.shipping', 'Logistics'), icon: Truck },
    { id: 'marketing' as CMSView, path: '/marketing', label: t('nav.marketing', 'Marketing & Pixels'), icon: Megaphone },
    { id: 'notifications' as CMSView, path: '/notifications', label: t('nav.notifications', 'Notifications'), icon: Bell },
    { id: 'loyalty' as CMSView, path: '/loyalty', label: t('nav.loyalty', 'Loyalty & Rewards'), icon: Crown },
    { id: 'developer' as CMSView, path: '/developer', label: t('nav.developer', 'Developer Studio'), icon: Code2 },
    { id: 'docs' as CMSView, path: '/docs', label: t('nav.docs', 'API Documentation'), icon: BookOpen },
  ];

  const secondaryNavItems = [
    { id: 'settings' as CMSView, path: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  const storeName = merchantData?.store?.storeName || 'STATAMIC';

  const userRole = (
    merchantData?.merchant?.role ||
    (typeof window !== 'undefined' ? localStorage.getItem('user_role') : null) ||
    'OWNER'
  ).toUpperCase();

  const userPermissions =
    merchantData?.merchant?.permissions ||
    (typeof window !== 'undefined' && localStorage.getItem('user_permissions')
      ? JSON.parse(localStorage.getItem('user_permissions') || '{}')
      : null);

  const { isStarter, isEnterprise, canUseCustomDomain, canUseLoyalty, canUseDeveloperApi } = usePlanAccess();
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  // Plan and Role-based authorization checker
  const isNavAuthorized = (navId: CMSView) => {
    // Universal access
    if (navId === 'docs') return true;
    if (navId === 'settings') return true;

    // Hide plan-locked features from sidebar
    if (navId === 'domains' && !canUseCustomDomain) return false;
    if (navId === 'loyalty' && !canUseLoyalty) return false;
    if (navId === 'developer' && !canUseDeveloperApi) return false;

    // True Owner and Store Admin have full access across all modules
    if (isOwnerOrAdmin) return true;

    // Role preset shortcuts for specific job functions:
    if (userRole === 'STOCK_CHECKER') {
      return navId === 'products' || navId === 'categories' || navId === 'dashboard';
    }

    if (userRole === 'FULFILLMENT') {
      return navId === 'orders' || navId === 'shipping' || navId === 'dashboard';
    }

    if (userRole === 'SUPPORT') {
      return navId === 'customers' || navId === 'orders' || navId === 'reviews' || navId === 'dashboard';
    }

    if (userRole === 'EDITOR') {
      return navId === 'themes' || navId === 'pages' || navId === 'blog' || navId === 'navigation' || navId === 'seo' || navId === 'dashboard';
    }

    if (userRole === 'MANAGER') {
      return (
        navId === 'dashboard' ||
        navId === 'products' ||
        navId === 'categories' ||
        navId === 'orders' ||
        navId === 'customers' ||
        navId === 'discounts' ||
        navId === 'shipping' ||
        navId === 'marketing' ||
        navId === 'blog' ||
        navId === 'reviews'
      );
    }

    // Dynamic Permission Checks for CUSTOM / STAFF roles or granularly defined permissions:
    if (userPermissions) {
      if (navId === 'dashboard') return true;
      if (navId === 'products') return !!userPermissions.canManageProducts;
      if (navId === 'categories') return !!userPermissions.canManageProducts || !!userPermissions.canManageInventory;
      if (navId === 'orders') return !!userPermissions.canManageOrders;
      if (navId === 'customers') return !!userPermissions.canManageCustomers;
      if (navId === 'reviews') return !!userPermissions.canManageCustomers || !!userPermissions.canManageProducts;
      if (navId === 'themes' || navId === 'pages' || navId === 'blog' || navId === 'navigation') {
        return !!userPermissions.canManageThemes;
      }
      if (navId === 'seo') return !!userPermissions.canManageThemes || !!userPermissions.canManageSettings;
      if (navId === 'shipping') return !!userPermissions.canManageLogistics;
      if (navId === 'discounts' || navId === 'marketing') return !!userPermissions.canManageAnalytics || !!userPermissions.canManageProducts;
      if (navId === 'store-setup') return !!userPermissions.canManageSettings;
      if (navId === 'tax' || navId === 'payments' || (navId as string) === 'payment') return !!userPermissions.canManagePayments;
      if (navId === 'loyalty') return !!userPermissions.canManageCustomers && canUseLoyalty;
      // Sensitive owner-only sections:
      if (navId === 'team' || navId === 'billing' || navId === 'domains' || navId === 'developer') return false;
    }

    return false;
  };

  const visiblePrimaryNavItems = primaryNavItems.filter((item) => isNavAuthorized(item.id));
  const visibleSecondaryNavItems = secondaryNavItems.filter((item) => isNavAuthorized(item.id));

  const handleNavClick = (viewId?: CMSView, path?: string) => {
    if (path) {
      router.push(path);
    } else if (viewId && onViewChange) {
      onViewChange(viewId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isItemActive = (itemPath?: string, itemId?: CMSView) => {
    if (itemPath) {
      if (itemPath === '/dashboard') {
        return pathname === '/dashboard' || pathname === '/';
      }
      return pathname.startsWith(itemPath);
    }
    if (currentView && itemId) {
      return currentView === itemId;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#191a1b]/40 backdrop-blur-xs z-30 md:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`bg-[#fdf1ef] border-r border-[#cbd5e0]/70 h-screen max-h-screen flex flex-col transition-all duration-300 z-40 p-3 sm:p-4 ${
          mobileOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl bg-[#ffffff]' : 'hidden md:flex sticky top-0'
        } ${collapsed ? 'md:w-20' : 'md:w-60'}`}
      >
        {/* Top Brand Header (Pinned) */}
        <div className="flex items-center justify-between px-2 pt-1 h-10 shrink-0 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Statamic S-Mark Logo Pill */}
            <div className="w-7 h-7 rounded-lg bg-[#191a1b] text-[#d4ff4c] flex items-center justify-center font-serif font-black text-sm shrink-0 shadow-xs">
              S
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-base tracking-tight text-[#191a1b] truncate leading-tight">
                  {storeName}
                </span>
                <span className="text-[10px] font-sans text-[#5e5a5a] font-medium tracking-wide">
                  {userRole === 'STOCK_CHECKER'
                    ? 'Stock & Inventory Clerk'
                    : userRole === 'FULFILLMENT'
                    ? 'Logistics Specialist'
                    : userRole === 'SUPPORT'
                    ? 'Customer Support'
                    : userRole === 'EDITOR'
                    ? 'Theme Designer'
                    : 'Editorial CMS'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="text-[#5e5a5a] hover:text-[#191a1b] p-1.5 rounded-lg hover:bg-[#cbc2ea]/30 transition-colors hidden md:block"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="text-[#5e5a5a] hover:text-[#191a1b] p-1 rounded-lg hover:bg-[#cbc2ea]/30 transition-colors md:hidden"
              aria-label="Close Sidebar Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-300/80 hover:scrollbar-thumb-slate-400">
          <nav className="space-y-1">
            {visiblePrimaryNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path, item.id);

              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.id, item.path)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-[#191a1b] text-[#ffffff] font-medium shadow-xs'
                      : 'text-[#5e5a5a] hover:bg-[#ffffff] hover:text-[#191a1b] font-normal'
                  } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#d4ff4c]' : 'text-[#5e5a5a]'
                      }`}
                    />
                    {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || mobileOpen) && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#d4ff4c] text-[#191a1b]' : 'bg-[#191a1b] text-[#d4ff4c]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation Section (Pinned at Bottom) */}
        {visibleSecondaryNavItems.length > 0 && (
          <div className="space-y-1 pt-3 border-t border-[#cbd5e0]/70 shrink-0 mt-2">
            {visibleSecondaryNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path, item.id);

              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.id, item.path)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-[#191a1b] text-[#ffffff] font-medium shadow-xs'
                      : 'text-[#5e5a5a] hover:bg-[#ffffff] hover:text-[#191a1b] font-normal'
                  } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d4ff4c]' : 'text-[#5e5a5a]'}`} />
                    {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
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
  ChevronDown,
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
  BellRing,
  Code2,
  Crown,
  Search,
  FolderTree,
  BookOpen,
  Gift,
  Mail,
  CheckSquare,
  Sparkles,
  Layers,
  Wand2,
  TrendingUp,
  ShieldAlert,
  CircleDollarSign,
  Target,
  LayoutTemplate,
} from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { useTranslation } from '@/src/context/LanguageContext';

export type CMSView =
  | 'dashboard'
  | 'commerce-engine'
  | 'ai-page-builder'
  | 'ai-analytics'
  | 'forecasting'
  | 'inventory-prediction'
  | 'pricing-insights'
  | 'customer-segmentation'
  | 'campaign-optimization'
  | 'products'
  | '3d'
  | 'image-studio'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'settings'
  | 'store-setup'
  | 'themes'
  | 'pages'
  | 'forms'
  | 'blog'
  | 'navigation'
  | 'discounts'
  | 'gift-cards'
  | 'payments'
  | 'reviews'
  | 'billing'
  | 'domains'
  | 'shipping'
  | 'tax'
  | 'team'
  | 'marketing'
  | 'email-templates'
  | 'notifications'
  | 'product-notifications'
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

  const aiNavItems = [
    {
      id: 'commerce-engine' as CMSView,
      path: '/commerce-engine',
      label: 'AI Commerce Hub',
      sublabel: '5-Pillar Orchestrator',
      icon: Zap,
      badge: 'Hub',
    },
    {
      id: 'forecasting' as CMSView,
      path: '/forecasting',
      label: 'Sales Forecasting',
      sublabel: 'Predictive demand models',
      icon: TrendingUp,
    },
    {
      id: 'inventory-prediction' as CMSView,
      path: '/inventory-prediction',
      label: 'Stockout Radar',
      sublabel: 'Inventory velocity & reorders',
      icon: ShieldAlert,
    },
    {
      id: 'customer-segmentation' as CMSView,
      path: '/customer-segmentation',
      label: 'Customer Segments',
      sublabel: 'RFM cohort personas',
      icon: Users,
    },
    {
      id: 'campaign-optimization' as CMSView,
      path: '/campaign-optimization',
      label: 'Campaign Optimizer',
      sublabel: 'Multi-channel WhatsApp/Email',
      icon: Target,
    },
    {
      id: 'pricing-insights' as CMSView,
      path: '/pricing-insights',
      label: 'Pricing Insights',
      sublabel: 'Elasticity & margin scenarios',
      icon: CircleDollarSign,
    },
    {
      id: 'ai-analytics' as CMSView,
      path: '/analytics',
      label: 'AI Analytics & QA',
      sublabel: 'Natural language store QA',
      icon: Sparkles,
    },
    {
      id: 'image-studio' as CMSView,
      path: '/image-studio',
      label: 'AI Image Studio',
      sublabel: 'Generative product visuals',
      icon: Wand2,
    },
    {
      id: 'ai-page-builder' as CMSView,
      path: '/ai-page-builder',
      label: 'AI Page Builder',
      sublabel: 'Prompt-to-page generator',
      icon: LayoutTemplate,
      badge: 'New',
    },
  ];

  const isAnyAiActive = aiNavItems.some(
    (ai) => pathname === ai.path || (ai.path !== '/dashboard' && pathname?.startsWith(ai.path))
  );

  const [aiAccordionOpen, setAiAccordionOpen] = useState<boolean>(true);

  // Auto-expand accordion if user lands directly on an AI route
  useEffect(() => {
    if (isAnyAiActive) {
      setAiAccordionOpen(true);
    }
  }, [isAnyAiActive]);

  const primaryNavItems = [
    {
      id: 'dashboard' as CMSView,
      path: '/dashboard',
      label: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'products' as CMSView,
      path: '/products',
      label: t('nav.products', 'Products'),
      icon: Package,
      badge: productsCount,
    },
    {
      id: 'orders' as CMSView,
      path: '/orders',
      label: t('nav.orders', 'Orders'),
      icon: ShoppingBag,
      badge: ordersCount || undefined,
    },
    {
      id: 'categories' as CMSView,
      path: '/categories',
      label: t('nav.categories', 'Categories'),
      icon: FolderTree,
    },
    {
      id: 'customers' as CMSView,
      path: '/customers',
      label: t('nav.customers', 'Customers'),
      icon: Users,
    },
    {
      id: 'store-setup' as CMSView,
      path: '/store-setup',
      label: t('nav.store_setup', 'Store Setup'),
      icon: Store,
    },
    {
      id: 'themes' as CMSView,
      path: '/themes',
      label: t('nav.themes', 'Themes'),
      icon: Palette,
    },
    {
      id: 'pages' as CMSView,
      path: '/pages',
      label: t('nav.pages', 'Pages'),
      icon: FileText,
    },
    {
      id: 'forms' as CMSView,
      path: '/forms',
      label: t('nav.forms', 'Forms & Surveys'),
      icon: CheckSquare,
    },
    {
      id: 'blog' as CMSView,
      path: '/blog',
      label: t('nav.blog', 'Blog & Editorial'),
      icon: BookOpen,
    },
    {
      id: 'seo' as CMSView,
      path: '/seo',
      label: t('nav.seo', 'SEO Governance'),
      icon: Search,
    },
    {
      id: '3d' as CMSView,
      path: '/3d',
      label: t('nav.three_d', '3D Visuals'),
      icon: Layers,
    },
    {
      id: 'discounts' as CMSView,
      path: '/discounts',
      label: t('nav.discounts', 'Discounts'),
      icon: Tag,
    },
    {
      id: 'gift-cards' as CMSView,
      path: '/gift-cards',
      label: t('nav.gift_cards', 'Gift Cards'),
      icon: Gift,
    },
    {
      id: 'payments' as CMSView,
      path: '/payments',
      label: t('nav.payments', 'Payments'),
      icon: CreditCard,
    },
    {
      id: 'shipping' as CMSView,
      path: '/shipping',
      label: t('nav.shipping', 'Shipping & Logistics'),
      icon: Truck,
    },
    {
      id: 'tax' as CMSView,
      path: '/tax',
      label: t('nav.tax', 'Taxation'),
      icon: Receipt,
    },
    {
      id: 'reviews' as CMSView,
      path: '/reviews',
      label: t('nav.reviews', 'Product Reviews'),
      icon: Star,
    },
    {
      id: 'marketing' as CMSView,
      path: '/marketing',
      label: t('nav.marketing', 'Marketing'),
      icon: Megaphone,
    },
    {
      id: 'notifications' as CMSView,
      path: '/notifications',
      label: t('nav.notifications', 'Notifications & Alerts'),
      icon: Bell,
    },
    {
      id: 'product-notifications' as CMSView,
      path: '/products/notifications',
      label: t('nav.back_in_stock', 'Stock Alerts'),
      icon: BellRing,
    },
    {
      id: 'email-templates' as CMSView,
      path: '/email-templates',
      label: t('nav.email_templates', 'Email Templates'),
      icon: Mail,
    },
    {
      id: 'domains' as CMSView,
      path: '/domains',
      label: t('nav.domains', 'Domains & DNS'),
      icon: Globe,
    },
    {
      id: 'loyalty' as CMSView,
      path: '/loyalty',
      label: t('nav.loyalty', 'Loyalty Rewards'),
      icon: Crown,
    },
    {
      id: 'team' as CMSView,
      path: '/team',
      label: t('nav.team', 'Team & Access'),
      icon: UserCheck,
    },
    {
      id: 'billing' as CMSView,
      path: '/billing',
      label: t('nav.billing', 'Subscription & Billing'),
      icon: Zap,
    },
    {
      id: 'developer' as CMSView,
      path: '/developer',
      label: t('nav.developer', 'Developer Studio'),
      icon: Code2,
    },
    {
      id: 'docs' as CMSView,
      path: '/docs',
      label: t('nav.docs', 'API Docs'),
      icon: BookOpen,
    },
  ];

  const secondaryNavItems = [
    {
      id: 'settings' as CMSView,
      path: '/settings',
      label: t('nav.settings', 'Settings'),
      icon: Settings,
    },
  ];

  const storeName = merchantData?.store?.storeName || 'OmniStore';
  const userRole = (merchantData?.merchant?.role || 'OWNER').toUpperCase();
  const userPermissions = merchantData?.merchant?.permissions || null;
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MERCHANT';

  const isNavAuthorized = (navId: CMSView): boolean => {
    if (isOwnerOrAdmin) return true;
    if (
      navId === 'dashboard' ||
      navId === 'settings' ||
      navId === 'store-setup' ||
      navId === 'docs' ||
      navId === 'ai-analytics' ||
      navId === 'forecasting' ||
      navId === 'inventory-prediction' ||
      navId === 'pricing-insights' ||
      navId === 'customer-segmentation' ||
      navId === 'campaign-optimization'
    ) return true;

    if (userRole === 'STOCK_CHECKER') {
      return navId === 'products' || navId === '3d' || navId === 'categories' || navId === 'product-notifications';
    }
    if (userRole === 'FULFILLMENT') {
      return navId === 'orders' || navId === 'shipping';
    }
    if (userRole === 'SUPPORT') {
      return navId === 'customers' || navId === 'orders' || navId === 'reviews' || navId === 'notifications';
    }
    if (userRole === 'EDITOR') {
      return (
        navId === 'themes' ||
        navId === '3d' ||
        navId === 'pages' ||
        navId === 'forms' ||
        navId === 'blog' ||
        navId === 'navigation' ||
        navId === 'seo'
      );
    }
    if (userRole === 'MANAGER') {
      return (
        navId === 'products' ||
        navId === '3d' ||
        navId === 'categories' ||
        navId === 'orders' ||
        navId === 'customers' ||
        navId === 'discounts' ||
        navId === 'shipping' ||
        navId === 'marketing' ||
        navId === 'notifications' ||
        navId === 'product-notifications' ||
        navId === 'email-templates' ||
        navId === 'blog' ||
        navId === 'reviews'
      );
    }

    if (userPermissions) {
      if (navId === 'products' || navId === 'product-notifications') return !!userPermissions.canManageProducts;
      if (navId === '3d') return userPermissions.canManage3DModels !== false;
      if (navId === 'categories') return !!userPermissions.canManageProducts;
      if (navId === 'orders') return !!userPermissions.canManageOrders;
      if (navId === 'customers') return !!userPermissions.canManageCustomers;
      if (navId === 'reviews') return !!userPermissions.canManageCustomers;
      if (navId === 'themes' || navId === 'pages' || navId === 'blog') return !!userPermissions.canManageThemes;
      if (navId === 'seo') return !!userPermissions.canManageThemes;
      if (navId === 'shipping') return !!userPermissions.canManageLogistics;
      if (navId === 'discounts' || navId === 'marketing' || navId === 'notifications' || navId === 'email-templates') return !!userPermissions.canManageAnalytics;
      if (navId === 'tax' || navId === 'payments') return !!userPermissions.canManagePayments;
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
      if (itemPath === '/payments') {
        return pathname === '/payment' || pathname.startsWith('/payments');
      }
      return pathname.startsWith(itemPath);
    }
    if (currentView && itemId) {
      return currentView === itemId;
    }
    return false;
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`bg-white dark:bg-[#121212] border-r border-slate-200 dark:border-[#2C2C2E] h-screen max-h-screen flex flex-col transition-all duration-300 p-3 sm:p-4 pb-safe ${mobileOpen
            ? 'fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] shadow-2xl bg-white dark:bg-[#121212] z-50 animate-in slide-in-from-left duration-200'
            : 'hidden md:flex sticky top-0 z-20'
          } ${collapsed ? 'md:w-20' : 'md:w-60'}`}
      >
        {/* Top Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 h-10 shrink-0 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Logo Badge */}
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1E1E1E] border border-sky-500/30 dark:border-[#00E5FF]/40 text-sky-600 dark:text-[#00E5FF] flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-sm">
              ⚡
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white truncate leading-tight">
                  {storeName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#98989D] font-mono tracking-wide">
                  {userRole}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E1E1E] border border-transparent hover:border-slate-200 dark:hover:border-[#2C2C2E] transition-colors hidden md:block cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] transition-colors md:hidden cursor-pointer"
              aria-label="Close Sidebar Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-1 scrollbar-thin">
          <nav className="space-y-1">
            {/* 1. Dashboard (Top Anchor) */}
            {visiblePrimaryNavItems
              .filter((item) => item.id === 'dashboard')
              .map((item, idx) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.path, item.id);

                return (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(item.id, item.path)}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${isActive
                        ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                      } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${isActive
                            ? 'text-sky-600 dark:text-[#00E5FF]'
                            : 'text-slate-400 dark:text-[#98989D]'
                          }`}
                      />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                    </div>
                  </button>
                );
              })}

            {/* 2. ✨ AI INTELLIGENCE ACCORDION (Standard Menu Style + Active Class) */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (collapsed && !mobileOpen) {
                    handleNavClick('commerce-engine', '/commerce-engine');
                  } else {
                    setAiAccordionOpen((prev) => !prev);
                  }
                }}
                title={collapsed && !mobileOpen ? 'AI Intelligence' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${aiAccordionOpen || isAnyAiActive
                    ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                  } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles
                    className={`w-4 h-4 shrink-0 transition-colors ${aiAccordionOpen || isAnyAiActive
                        ? 'text-sky-600 dark:text-[#00E5FF]'
                        : 'text-slate-400 dark:text-[#98989D]'
                      }`}
                  />
                  {(!collapsed || mobileOpen) && <span className="truncate">AI Intelligence</span>}
                </div>

                {(!collapsed || mobileOpen) && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${aiAccordionOpen || isAnyAiActive
                          ? 'bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212]'
                          : 'bg-slate-100 dark:bg-[#1E1E1E] text-sky-600 dark:text-[#00E5FF] border border-slate-200 dark:border-[#2C2C2E]'
                        }`}
                    >
                      8
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${aiAccordionOpen
                          ? 'rotate-180 text-slate-600 dark:text-slate-300'
                          : 'text-slate-400 dark:text-[#98989D]'
                        }`}
                    />
                  </div>
                )}
              </button>

              {/* Accordion Child Links */}
              {(!collapsed || mobileOpen) && aiAccordionOpen && (
                <div className="pl-3 ml-3.5 border-l border-slate-200 dark:border-[#2C2C2E] space-y-0.5 pt-1 pb-1 animate-in slide-in-from-top-1 duration-150">
                  {aiNavItems.map((aiItem, aIdx) => {
                    const AiIcon = aiItem.icon;
                    const isAiItemActive = isItemActive(aiItem.path, aiItem.id);

                    return (
                      <button
                        key={aIdx}
                        onClick={() => handleNavClick(aiItem.id, aiItem.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${isAiItemActive
                            ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                          }`}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <AiIcon
                            className={`w-4 h-4 shrink-0 transition-colors ${isAiItemActive
                                ? 'text-sky-600 dark:text-[#00E5FF]'
                                : 'text-slate-400 dark:text-[#98989D]'
                              }`}
                          />
                          <span className="truncate">{aiItem.label}</span>
                        </div>
                        {aiItem.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] uppercase shrink-0 ${isAiItemActive
                                ? 'bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212]'
                                : 'bg-slate-100 dark:bg-[#1E1E1E] text-sky-600 dark:text-[#00E5FF] border border-slate-200 dark:border-[#2C2C2E]'
                              }`}
                          >
                            {aiItem.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Remaining Primary Navigation Items */}
            {visiblePrimaryNavItems
              .filter((item) => item.id !== 'dashboard')
              .map((item, idx) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.path, item.id);

                return (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(item.id, item.path)}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${isActive
                        ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                      } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${isActive
                            ? 'text-sky-600 dark:text-[#00E5FF]'
                            : 'text-slate-400 dark:text-[#98989D]'
                          }`}
                      />
                      {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                    </div>

                    {(!collapsed || mobileOpen) && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${isActive
                            ? 'bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212]'
                            : 'bg-slate-100 dark:bg-[#1E1E1E] text-sky-600 dark:text-[#00E5FF] border border-slate-200 dark:border-[#2C2C2E]'
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

        {/* Footer Navigation (Settings) */}
        {visibleSecondaryNavItems.length > 0 && (
          <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-[#2C2C2E] shrink-0 mt-2">
            {visibleSecondaryNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path, item.id);

              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.id, item.path)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${isActive
                      ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                    } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600 dark:text-[#00E5FF]' : 'text-slate-400 dark:text-[#98989D]'
                        }`}
                    />
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

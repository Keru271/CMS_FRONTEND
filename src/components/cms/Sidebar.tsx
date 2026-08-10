'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  CheckSquare,
  Building,
  Truck,
  Database,
  BarChart2,
  UserCheck,
  Palette,
  Compass,
  FileText,
  Tag,
  Receipt,
  Megaphone,
} from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';

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
  | 'navigation'
  | 'discounts'
  | 'shipping'
  | 'tax'
  | 'marketing';

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

  const primaryNavItems = [
    { id: 'dashboard' as CMSView, path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'store-setup' as CMSView, path: '/store-setup', label: 'Store Setup', icon: Store },
    { id: 'themes' as CMSView, path: '/themes', label: 'Theme Studio', icon: Palette },
    { id: 'pages' as CMSView, path: '/pages', label: 'Pages', icon: FileText },
    { id: 'navigation' as CMSView, path: '/navigation', label: 'Navigation', icon: Compass },
    { id: 'products' as CMSView, path: '/products', label: 'Products Studio', icon: Package, badge: productsCount },
    { id: 'orders' as CMSView, path: '/orders', label: 'Requests', icon: ShoppingBag, badge: 6 },
    { id: 'customers' as CMSView, path: '/customers', label: 'Users', icon: Users },
    { id: 'discounts' as CMSView, path: '/discounts', label: 'Discounts', icon: Tag },
    { id: 'tax' as CMSView, path: '/tax', label: 'Taxation', icon: Receipt },
    { id: 'shipping' as CMSView, path: '/shipping', label: 'Logistics', icon: Truck },
    { id: 'categories' as CMSView, path: '/categories', label: 'CMS', icon: Database },
    { id: 'marketing' as CMSView, path: '/marketing', label: 'Analytics & Growth', icon: Megaphone },
  ];

  const secondaryNavItems = [
    { id: 'pages' as CMSView, path: '/pages', label: 'Pages', icon: FileText },
    { id: 'themes' as CMSView, path: '/themes', label: 'Themes', icon: Palette },
    { id: 'store-setup' as CMSView, path: '/store-setup', label: 'Store Setup', icon: Store },
    { id: 'settings' as CMSView, path: '/settings', label: 'Settings', icon: Settings },
  ];

  const storeName = merchantData?.store?.storeName || 'LEASO';

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
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`bg-[#f4f6f8] dark:bg-card border-r border-slate-200/80 dark:border-border h-screen flex flex-col justify-between transition-all duration-300 z-40 p-3 sm:p-4 ${
          mobileOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' : 'hidden md:flex sticky top-0'
        } ${collapsed ? 'md:w-20' : 'md:w-60'}`}
      >
        <div className="space-y-6">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 h-10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Green Dot Indicator Logo */}
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
              {(!collapsed || mobileOpen) && (
                <span className="font-black text-lg tracking-wider uppercase text-slate-900 dark:text-foreground truncate">
                  {storeName}
                </span>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors hidden md:block"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            {mobileOpen && (
              <button
                onClick={onCloseMobile}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-200/60 transition-colors md:hidden"
                aria-label="Close Sidebar Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1">
            {primaryNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path, item.id);

              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.id, item.path)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all min-h-[42px] ${
                    isActive
                      ? 'bg-white dark:bg-accent text-slate-900 dark:text-foreground font-extrabold shadow-sm border border-slate-200/80'
                      : 'text-slate-500 dark:text-muted-foreground hover:bg-white/60 dark:hover:bg-accent/40 hover:text-slate-900 font-semibold'
                  } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-slate-900 dark:text-foreground' : 'text-slate-400'
                      }`}
                    />
                    {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || mobileOpen) && item.badge !== undefined && item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-foreground text-white dark:text-background font-bold text-[10px] flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation Section */}
        <div className="space-y-1 pt-4 border-t border-slate-200/80 dark:border-border">
          {secondaryNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.path, item.id);

            return (
              <button
                key={idx}
                onClick={() => handleNavClick(item.id, item.path)}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 font-bold border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 font-medium hover:bg-white/60'
                } ${collapsed && !mobileOpen ? 'justify-center' : ''}`}
              >
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

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
  MessageSquare,
  CheckSquare,
  Truck,
  Database,
  UserCheck,
  Palette,
  Compass,
  FileText,
  Tag,
  Receipt,
  Megaphone,
  Sparkles,
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
    { id: 'orders' as CMSView, path: '/orders', label: 'Orders', icon: ShoppingBag, badge: 6 },
    { id: 'customers' as CMSView, path: '/customers', label: 'Customers', icon: Users },
    { id: 'discounts' as CMSView, path: '/discounts', label: 'Discounts', icon: Tag },
    { id: 'tax' as CMSView, path: '/tax', label: 'Taxation', icon: Receipt },
    { id: 'shipping' as CMSView, path: '/shipping', label: 'Logistics', icon: Truck },
    { id: 'categories' as CMSView, path: '/categories', label: 'CMS Taxonomy', icon: Database },
    { id: 'marketing' as CMSView, path: '/marketing', label: 'Analytics & Growth', icon: Megaphone },
  ];

  const secondaryNavItems = [
    { id: 'settings' as CMSView, path: '/settings', label: 'Settings', icon: Settings },
  ];

  const storeName = merchantData?.store?.storeName || 'STATAMIC';

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
        className={`bg-[#fdf1ef] border-r border-[#cbd5e0]/70 h-screen flex flex-col justify-between transition-all duration-300 z-40 p-3 sm:p-4 ${mobileOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl bg-[#ffffff]' : 'hidden md:flex sticky top-0'
          } ${collapsed ? 'md:w-20' : 'md:w-60'}`}
      >
        <div className="space-y-6">
          {/* Statamic Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1 h-10">
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
                    Editorial CMS
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans transition-all min-h-[40px] ${isActive
                    ? 'bg-[#191a1b] text-[#ffffff] font-medium shadow-xs'
                    : 'text-[#5e5a5a] hover:bg-[#ffffff] hover:text-[#191a1b] font-normal'
                    } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d4ff4c]' : 'text-[#5e5a5a]'
                        }`}
                    />
                    {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || mobileOpen) && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${isActive ? 'bg-[#d4ff4c] text-[#191a1b]' : 'bg-[#191a1b] text-[#d4ff4c]'
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

        {/* Footer Navigation Section */}
        <div className="space-y-1 pt-4 border-t border-[#cbd5e0]/70">
          {secondaryNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.path, item.id);

            return (
              <button
                key={idx}
                onClick={() => handleNavClick(item.id, item.path)}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans transition-all ${isActive
                  ? 'bg-[#191a1b] text-[#ffffff] font-medium'
                  : 'text-[#5e5a5a] hover:text-[#191a1b] font-normal hover:bg-[#ffffff]'
                  } ${collapsed && !mobileOpen ? 'justify-center' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d4ff4c]' : 'text-[#5e5a5a]'}`} />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

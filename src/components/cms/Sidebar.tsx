'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  AppWindow,
  GitBranch,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { MerchantOnboardingData } from '@/src/types';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { useTranslation } from '@/src/context/LanguageContext';

export type CMSView =
  | 'dashboard'
  | 'apps'
  | 'commerce-engine'
  | 'ai-builder'
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

export interface NavItem {
  id: CMSView;
  path: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  openInNewTab?: boolean;
}

export interface NavSubGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  items: NavItem[];
  subgroups?: NavSubGroup[];
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

  // Search filter query for quick branch discovery
  const [branchFilter, setBranchFilter] = useState('');
  const [showFilterInput, setShowFilterInput] = useState(false);

  // Floating Popover Flyout in collapsed mode
  const [activeFlyoutId, setActiveFlyoutId] = useState<string | null>(null);
  const [flyoutCoords, setFlyoutCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const flyoutCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Top-level direct menus
  const directNavItems: NavItem[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      path: '/products',
      label: t('nav.products', 'Products'),
      icon: Package,
      badge: productsCount || undefined,
    },
    {
      id: 'orders',
      path: '/orders',
      label: t('nav.orders', 'Orders'),
      icon: ShoppingBag,
      badge: ordersCount || undefined,
    },
    {
      id: 'customers',
      path: '/customers',
      label: t('nav.customers', 'Customers'),
      icon: Users,
    },
  ];

  // Branched Modules Navigation
  const navGroups: NavGroup[] = [
    {
      id: 'ai',
      label: 'AI Intelligence',
      icon: Sparkles,
      badge: 'Hub',
      items: [
        {
          id: 'commerce-engine',
          path: '/commerce-engine',
          label: 'AI Commerce Hub',
          sublabel: '5-Pillar Orchestrator',
          icon: Zap,
          badge: 'Hub',
        },
        {
          id: 'forecasting',
          path: '/forecasting',
          label: 'Sales Forecasting',
          sublabel: 'Predictive demand models',
          icon: TrendingUp,
        },
        {
          id: 'inventory-prediction',
          path: '/inventory-prediction',
          label: 'Stockout Radar',
          sublabel: 'Inventory velocity & reorders',
          icon: ShieldAlert,
        },
        {
          id: 'customer-segmentation',
          path: '/customer-segmentation',
          label: 'Customer Segments',
          sublabel: 'RFM cohort personas',
          icon: Users,
        },
        {
          id: 'campaign-optimization',
          path: '/campaign-optimization',
          label: 'Campaign Optimizer',
          sublabel: 'Multi-channel WhatsApp/Email',
          icon: Target,
        },
        {
          id: 'pricing-insights',
          path: '/pricing-insights',
          label: 'Pricing Insights',
          sublabel: 'Elasticity & margin scenarios',
          icon: CircleDollarSign,
        },
        {
          id: 'ai-analytics',
          path: '/analytics',
          label: 'AI Analytics & QA',
          sublabel: 'Natural language store QA',
          icon: Sparkles,
        },
        {
          id: 'image-studio',
          path: '/image-studio',
          label: 'AI Image Studio',
          sublabel: 'Generative product visuals',
          icon: Wand2,
        },
        {
          id: 'ai-builder',
          path: '/ai-builder',
          label: 'AI Website Builder',
          sublabel: 'Full site with API & Vercel deploy',
          icon: Globe,
          badge: 'Pro AI',
        },
        {
          id: 'ai-page-builder',
          path: '/ai-page-builder',
          label: 'AI Page Builder',
          sublabel: 'Prompt-to-page generator',
          icon: LayoutTemplate,
          badge: 'New',
        },
      ],
      subgroups: [
        {
          id: 'ai-predictive',
          label: 'Predictive Models',
          items: [
            {
              id: 'forecasting',
              path: '/forecasting',
              label: 'Sales Forecasting',
              sublabel: 'Predictive demand models',
              icon: TrendingUp,
            },
            {
              id: 'inventory-prediction',
              path: '/inventory-prediction',
              label: 'Stockout Radar',
              sublabel: 'Inventory velocity & reorders',
              icon: ShieldAlert,
            },
            {
              id: 'pricing-insights',
              path: '/pricing-insights',
              label: 'Pricing Insights',
              sublabel: 'Elasticity & margin scenarios',
              icon: CircleDollarSign,
            },
          ],
        },
        {
          id: 'ai-growth',
          label: 'Targeting & Growth',
          items: [
            {
              id: 'customer-segmentation',
              path: '/customer-segmentation',
              label: 'Customer Segments',
              sublabel: 'RFM cohort personas',
              icon: Users,
            },
            {
              id: 'campaign-optimization',
              path: '/campaign-optimization',
              label: 'Campaign Optimizer',
              sublabel: 'Multi-channel WhatsApp/Email',
              icon: Target,
            },
          ],
        },
        {
          id: 'ai-studio',
          label: 'Intelligence & Studio',
          items: [
            {
              id: 'ai-builder',
              path: '/ai-builder',
              label: 'AI Website Builder',
              sublabel: 'Full site with API & Vercel deploy',
              icon: Globe,
              badge: 'Pro AI',
            },
            {
              id: 'commerce-engine',
              path: '/commerce-engine',
              label: 'AI Commerce Hub',
              sublabel: '5-Pillar Orchestrator',
              icon: Zap,
              badge: 'Hub',
            },
            {
              id: 'ai-analytics',
              path: '/analytics',
              label: 'AI Analytics & QA',
              sublabel: 'Natural language store QA',
              icon: Sparkles,
            },
            {
              id: 'image-studio',
              path: '/image-studio',
              label: 'AI Image Studio',
              sublabel: 'Generative product visuals',
              icon: Wand2,
            },
            {
              id: 'ai-page-builder',
              path: '/ai-page-builder',
              label: 'AI Page Builder',
              sublabel: 'Prompt-to-page generator',
              icon: LayoutTemplate,
              badge: 'New',
            },
          ],
        },
      ],
    },
    {
      id: 'catalog',
      label: 'Catalog & Inventory',
      icon: FolderTree,
      items: [
        {
          id: 'categories',
          path: '/categories',
          label: t('nav.categories', 'Categories'),
          icon: FolderTree,
        },
        {
          id: 'product-notifications',
          path: '/products/notifications',
          label: t('nav.back_in_stock', 'Stock Alerts'),
          icon: BellRing,
        },
        {
          id: '3d',
          path: '/3d',
          label: t('nav.three_d', '3D Visuals'),
          icon: Layers,
        },
      ],
    },
    {
      id: 'storefront',
      label: 'Storefront & Content',
      icon: Palette,
      items: [
        {
          id: 'ai-builder',
          path: '/ai-builder',
          label: 'AI Website Builder',
          sublabel: 'Full site with API & Vercel deploy',
          icon: Globe,
          badge: 'Pro AI',
        },
        {
          id: 'themes',
          path: '/themes',
          label: t('nav.themes', 'Themes'),
          icon: Palette,
        },
        {
          id: 'pages',
          path: '/pages',
          label: t('nav.pages', 'Pages'),
          icon: FileText,
        },
        {
          id: 'navigation',
          path: '/navigation',
          label: t('nav.navigation', 'Navigation'),
          icon: Compass,
        },
        {
          id: 'blog',
          path: '/blog',
          label: t('nav.blog', 'Blog & Editorial'),
          icon: BookOpen,
        },
        {
          id: 'forms',
          path: '/forms',
          label: t('nav.forms', 'Forms & Surveys'),
          icon: CheckSquare,
        },
        {
          id: 'seo',
          path: '/seo',
          label: t('nav.seo', 'SEO Governance'),
          icon: Search,
        },
      ],
      subgroups: [
        {
          id: 'storefront-design',
          label: 'Design & Structure',
          items: [
            {
              id: 'ai-builder',
              path: '/ai-builder',
              label: 'AI Website Builder',
              sublabel: 'Full site with API & Vercel deploy',
              icon: Globe,
              badge: 'Pro AI',
            },
            {
              id: 'themes',
              path: '/themes',
              label: t('nav.themes', 'Themes'),
              icon: Palette,
            },
            {
              id: 'pages',
              path: '/pages',
              label: t('nav.pages', 'Pages'),
              icon: FileText,
            },
            {
              id: 'navigation',
              path: '/navigation',
              label: t('nav.navigation', 'Navigation'),
              icon: Compass,
            },
          ],
        },
        {
          id: 'storefront-editorial',
          label: 'Content & Governance',
          items: [
            {
              id: 'blog',
              path: '/blog',
              label: t('nav.blog', 'Blog & Editorial'),
              icon: BookOpen,
            },
            {
              id: 'forms',
              path: '/forms',
              label: t('nav.forms', 'Forms & Surveys'),
              icon: CheckSquare,
            },
            {
              id: 'seo',
              path: '/seo',
              label: t('nav.seo', 'SEO Governance'),
              icon: Search,
            },
          ],
        },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing & Sales',
      icon: Megaphone,
      items: [
        {
          id: 'marketing',
          path: '/marketing',
          label: t('nav.marketing', 'Marketing'),
          icon: Megaphone,
        },
        {
          id: 'discounts',
          path: '/discounts',
          label: t('nav.discounts', 'Discounts'),
          icon: Tag,
        },
        {
          id: 'gift-cards',
          path: '/gift-cards',
          label: t('nav.gift_cards', 'Gift Cards'),
          icon: Gift,
        },
        {
          id: 'email-templates',
          path: '/email-templates',
          label: t('nav.email_templates', 'Email Templates'),
          icon: Mail,
        },
        {
          id: 'loyalty',
          path: '/loyalty',
          label: t('nav.loyalty', 'Loyalty Rewards'),
          icon: Crown,
        },
        {
          id: 'reviews',
          path: '/reviews',
          label: t('nav.reviews', 'Product Reviews'),
          icon: Star,
        },
        {
          id: 'notifications',
          path: '/notifications',
          label: t('nav.notifications', 'Notifications & Alerts'),
          icon: Bell,
        },
      ],
      subgroups: [
        {
          id: 'marketing-promotions',
          label: 'Campaigns & Offers',
          items: [
            {
              id: 'marketing',
              path: '/marketing',
              label: t('nav.marketing', 'Marketing'),
              icon: Megaphone,
            },
            {
              id: 'discounts',
              path: '/discounts',
              label: t('nav.discounts', 'Discounts'),
              icon: Tag,
            },
            {
              id: 'gift-cards',
              path: '/gift-cards',
              label: t('nav.gift_cards', 'Gift Cards'),
              icon: Gift,
            },
            {
              id: 'loyalty',
              path: '/loyalty',
              label: t('nav.loyalty', 'Loyalty Rewards'),
              icon: Crown,
            },
          ],
        },
        {
          id: 'marketing-engagement',
          label: 'Audience Engagement',
          items: [
            {
              id: 'email-templates',
              path: '/email-templates',
              label: t('nav.email_templates', 'Email Templates'),
              icon: Mail,
            },
            {
              id: 'reviews',
              path: '/reviews',
              label: t('nav.reviews', 'Product Reviews'),
              icon: Star,
            },
            {
              id: 'notifications',
              path: '/notifications',
              label: t('nav.notifications', 'Notifications & Alerts'),
              icon: Bell,
            },
          ],
        },
      ],
    },
    {
      id: 'operations',
      label: 'Operations & Logistics',
      icon: Truck,
      items: [
        {
          id: 'shipping',
          path: '/shipping',
          label: t('nav.shipping', 'Shipping & Logistics'),
          icon: Truck,
        },
        {
          id: 'payments',
          path: '/payments',
          label: t('nav.payments', 'Payments'),
          icon: CreditCard,
        },
        {
          id: 'tax',
          path: '/tax',
          label: t('nav.tax', 'Taxation'),
          icon: Receipt,
        },
      ],
    },
    {
      id: 'management',
      label: 'Store Management',
      icon: Store,
      items: [
        {
          id: 'store-setup',
          path: '/store-setup',
          label: t('nav.store_setup', 'Store Setup'),
          icon: Store,
        },
        {
          id: 'domains',
          path: '/domains',
          label: t('nav.domains', 'Domains & DNS'),
          icon: Globe,
        },
        {
          id: 'team',
          path: '/team',
          label: t('nav.team', 'Team & Access'),
          icon: UserCheck,
        },
        {
          id: 'billing',
          path: '/billing',
          label: t('nav.billing', 'Subscription & Billing'),
          icon: Zap,
        },
        {
          id: 'apps',
          path: '/apps',
          label: 'Apps & Integrations',
          sublabel: 'Mailgun, Wati, Mailbox',
          icon: AppWindow,
          badge: 'New',
        },
        {
          id: 'developer',
          path: '/developer',
          label: t('nav.developer', 'Developer Studio'),
          icon: Code2,
        },
        {
          id: 'docs',
          path: '/docs',
          label: t('nav.docs', 'API Docs'),
          icon: BookOpen,
        },
      ],
      subgroups: [
        {
          id: 'management-setup',
          label: 'Store Configuration',
          items: [
            {
              id: 'store-setup',
              path: '/store-setup',
              label: t('nav.store_setup', 'Store Setup'),
              icon: Store,
            },
            {
              id: 'domains',
              path: '/domains',
              label: t('nav.domains', 'Domains & DNS'),
              icon: Globe,
            },
            {
              id: 'team',
              path: '/team',
              label: t('nav.team', 'Team & Access'),
              icon: UserCheck,
            },
          ],
        },
        {
          id: 'management-platform',
          label: 'Ecosystem & APIs',
          items: [
            {
              id: 'billing',
              path: '/billing',
              label: t('nav.billing', 'Subscription & Billing'),
              icon: Zap,
            },
            {
              id: 'apps',
              path: '/apps',
              label: 'Apps & Integrations',
              sublabel: 'Mailgun, Wati, Mailbox',
              icon: AppWindow,
              badge: 'New',
            },
            {
              id: 'developer',
              path: '/developer',
              label: t('nav.developer', 'Developer Studio'),
              icon: Code2,
            },
            {
              id: 'docs',
              path: '/docs',
              label: t('nav.docs', 'API Docs'),
              icon: BookOpen,
            },
          ],
        },
      ],
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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    ai: false,
    catalog: false,
    storefront: false,
    marketing: false,
    operations: false,
    management: false,
  });

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

  // Auto-expand accordion if user lands directly on a route inside that parent menu
  useEffect(() => {
    navGroups.forEach((group) => {
      const hasActiveChild = group.items.some((item) => isItemActive(item.path, item.id));
      if (hasActiveChild) {
        setOpenSections((prev) => (prev[group.id] ? prev : { ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const storeName = merchantData?.store?.storeName || 'OmniStore';
  const userRole = (merchantData?.merchant?.role || 'OWNER').toUpperCase();
  const userPermissions = merchantData?.merchant?.permissions || null;
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MERCHANT';

  const isNavAuthorized = (navId: CMSView): boolean => {
    if (navId === 'ai-builder') return true;
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
        navId === 'reviews' ||
        navId === 'pages' ||
        navId === 'themes' ||
        navId === 'navigation' ||
        navId === 'forms' ||
        navId === 'seo'
      );
    }

    if (userPermissions) {
      if (navId === 'products' || navId === 'product-notifications') return !!userPermissions.canManageProducts;
      if (navId === '3d') return userPermissions.canManage3DModels !== false;
      if (navId === 'categories') return !!userPermissions.canManageProducts;
      if (navId === 'orders') return !!userPermissions.canManageOrders;
      if (navId === 'customers') return !!userPermissions.canManageCustomers;
      if (navId === 'reviews') return !!userPermissions.canManageCustomers;
      if (navId === 'themes' || navId === 'pages' || navId === 'blog' || navId === 'navigation') return !!userPermissions.canManageThemes;
      if (navId === 'seo') return !!userPermissions.canManageThemes;
      if (navId === 'shipping') return !!userPermissions.canManageLogistics;
      if (navId === 'discounts' || navId === 'marketing' || navId === 'notifications' || navId === 'email-templates') return !!userPermissions.canManageAnalytics;
      if (navId === 'tax' || navId === 'payments') return !!userPermissions.canManagePayments;
      if (navId === 'team' || navId === 'billing' || navId === 'domains' || navId === 'developer') return false;
    }

    return false;
  };

  const visibleDirectNavItems = directNavItems.filter((item) => isNavAuthorized(item.id));
  const visibleSecondaryNavItems = secondaryNavItems.filter((item) => isNavAuthorized(item.id));

  const handleNavClick = (viewId?: CMSView, path?: string, openInNewTab?: boolean) => {
    setActiveFlyoutId(null);
    if (openInNewTab) {
      window.open(path || '/ai-builder', '_blank');
      if (onCloseMobile) {
        onCloseMobile();
      }
      return;
    }
    if (path) {
      router.push(path);
    } else if (viewId && onViewChange) {
      onViewChange(viewId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Toggle all branch sections open/closed
  const areAllSectionsOpen = Object.values(openSections).every(Boolean);
  const toggleAllSections = () => {
    const nextState = !areAllSectionsOpen;
    const updated: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      updated[g.id] = nextState;
    });
    setOpenSections(updated);
  };

  // Handle flyout hovering for collapsed sidebar
  const handleGroupMouseEnter = (groupId: string, e: React.MouseEvent<HTMLElement>) => {
    if (!collapsed || mobileOpen) return;
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutCoords({
      top: Math.max(12, Math.min(rect.top, window.innerHeight - 380)),
      left: rect.right + 10,
    });
    setActiveFlyoutId(groupId);
  };

  const handleGroupMouseLeave = () => {
    if (!collapsed || mobileOpen) return;
    flyoutCloseTimerRef.current = setTimeout(() => {
      setActiveFlyoutId(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
  };

  const handleFlyoutMouseLeave = () => {
    flyoutCloseTimerRef.current = setTimeout(() => {
      setActiveFlyoutId(null);
    }, 180);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (flyoutCloseTimerRef.current) {
        clearTimeout(flyoutCloseTimerRef.current);
      }
    };
  }, [mobileOpen]);

  // Helper renderer for a single leaf branch item
  const renderBranchItem = (
    childItem: NavItem,
    isLast: boolean,
    isInFlyout = false
  ) => {
    const ChildIcon = childItem.icon;
    const isChildActive = isItemActive(childItem.path, childItem.id);

    return (
      <div key={childItem.id} className="relative group/leaf flex items-center min-h-[34px]">
        {/* Continuous vertical trunk stem */}
        <div
          className={`absolute left-[7px] top-0 pointer-events-none transition-colors duration-200 ${
            isLast ? 'h-[17px]' : 'h-full'
          } w-[1.5px] ${
            isChildActive
              ? 'bg-sky-500 dark:bg-[#00E5FF]'
              : 'bg-slate-200 dark:bg-[#2C2C2E] group-hover/leaf:bg-slate-300 dark:group-hover/leaf:bg-[#4C4C4E]'
          }`}
        />

        {/* Curved horizontal elbow connector */}
        <div
          className={`absolute left-[7px] top-[17px] w-[14px] h-[1.5px] pointer-events-none transition-colors duration-200 ${
            isChildActive
              ? 'bg-sky-500 dark:bg-[#00E5FF]'
              : 'bg-slate-200 dark:bg-[#2C2C2E] group-hover/leaf:bg-slate-300 dark:group-hover/leaf:bg-[#4C4C4E]'
          }`}
        />

        {/* Branch Leaf Node Dot */}
        <div
          className={`absolute left-[19px] top-[14px] w-1.5 h-1.5 rounded-full pointer-events-none transition-all duration-200 z-10 ${
            isChildActive
              ? 'bg-sky-500 dark:bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.9)] scale-125'
              : 'bg-slate-300 dark:bg-[#3C3C3E] group-hover/leaf:bg-sky-400 dark:group-hover/leaf:bg-[#00E5FF]/70'
          }`}
        />

        {/* Clickable Nav Link */}
        <button
          onClick={() => handleNavClick(childItem.id, childItem.path, childItem.openInNewTab)}
          className={`w-full ml-[26px] flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            isChildActive
              ? 'bg-sky-50 dark:bg-[#00E5FF]/10 text-sky-900 dark:text-[#00E5FF] font-semibold border border-sky-200/80 dark:border-[#00E5FF]/30 shadow-xs'
              : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
          }`}
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <ChildIcon
              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                isChildActive ? 'text-sky-600 dark:text-[#00E5FF]' : 'text-slate-400 dark:text-[#98989D]'
              }`}
            />
            <div className="flex flex-col text-left truncate min-w-0">
              <span className="truncate leading-tight flex items-center gap-1.5">
                <span>{childItem.label}</span>
                {childItem.openInNewTab && (
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400 dark:text-[#636366] shrink-0" />
                )}
              </span>
              {childItem.sublabel && !isInFlyout && (
                <span className="text-[10px] text-slate-400 dark:text-[#636366] truncate font-normal leading-tight">
                  {childItem.sublabel}
                </span>
              )}
            </div>
          </div>
          {childItem.badge !== undefined && childItem.badge !== '' && (
            <span
              className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] uppercase shrink-0 ${
                isChildActive
                  ? 'bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212]'
                  : 'bg-slate-100 dark:bg-[#1E1E1E] text-sky-600 dark:text-[#00E5FF] border border-slate-200 dark:border-[#2C2C2E]'
              }`}
            >
              {childItem.badge}
            </span>
          )}
        </button>
      </div>
    );
  };

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
        className={`bg-white dark:bg-[#121212] border-r border-slate-200 dark:border-[#2C2C2E] h-screen max-h-screen flex flex-col transition-all duration-300 p-3 sm:p-4 pb-safe ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] shadow-2xl bg-white dark:bg-[#121212] z-50 animate-in slide-in-from-left duration-200'
            : 'hidden md:flex sticky top-0 z-20'
        } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
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
            {/* 1. Necessary Direct Menu Items for Customer */}
            {visibleDirectNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path, item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.path)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                  } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-sky-600 dark:text-[#00E5FF]'
                          : 'text-slate-400 dark:text-[#98989D]'
                      }`}
                    />
                    {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || mobileOpen) && item.badge !== undefined && Number(item.badge) > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${
                        isActive
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

            {/* Separator & Branched Modules Header */}
            {(!collapsed || mobileOpen) ? (
              <div className="pt-3 pb-1.5 px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-sky-500 dark:text-[#00E5FF]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#636366]">
                      Store Branches
                    </span>
                  </div>

                  {/* Branch Toolbar Actions */}
                  <div className="flex items-center gap-1">
                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilterInput((prev) => !prev)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        showFilterInput || branchFilter
                          ? 'text-sky-600 dark:text-[#00E5FF] bg-sky-50 dark:bg-[#00E5FF]/10'
                          : 'text-slate-400 dark:text-[#636366] hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E1E1E]'
                      }`}
                      title="Filter branch items"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Collapse All */}
                    <button
                      onClick={toggleAllSections}
                      className="p-1 rounded-lg text-slate-400 dark:text-[#636366] hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
                      title={areAllSectionsOpen ? 'Collapse all branches' : 'Expand all branches'}
                    >
                      <FolderTree className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Branch Search / Filter Input */}
                {showFilterInput && (
                  <div className="relative mt-2 mb-1 animate-in fade-in duration-150">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      placeholder="Filter branch nodes..."
                      className="w-full bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl pl-8 pr-7 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 dark:focus:border-[#00E5FF]"
                      autoFocus
                    />
                    {branchFilter && (
                      <button
                        onClick={() => setBranchFilter('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="my-2 border-t border-slate-200 dark:border-[#2C2C2E]" />
            )}

            {/* 2. Grouped Branched Menus */}
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              let visibleItems = group.items.filter((item) => isNavAuthorized(item.id));

              // Apply search filter if active
              if (branchFilter.trim()) {
                const q = branchFilter.toLowerCase();
                visibleItems = visibleItems.filter(
                  (item) =>
                    item.label.toLowerCase().includes(q) ||
                    (item.sublabel && item.sublabel.toLowerCase().includes(q))
                );
              }

              if (visibleItems.length === 0) return null;

              const isGroupActive = visibleItems.some((item) => isItemActive(item.path, item.id));
              const isOpen = branchFilter.trim() ? true : !!openSections[group.id];

              return (
                <div
                  key={group.id}
                  className="space-y-1 relative"
                  onMouseEnter={(e) => handleGroupMouseEnter(group.id, e)}
                  onMouseLeave={handleGroupMouseLeave}
                >
                  {/* Group Trunk Button */}
                  <button
                    onClick={() => {
                      if (collapsed && !mobileOpen) {
                        handleNavClick(visibleItems[0].id, visibleItems[0].path);
                      } else {
                        setOpenSections((prev) => ({
                          ...prev,
                          [group.id]: !prev[group.id],
                        }));
                      }
                    }}
                    title={collapsed && !mobileOpen ? group.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${
                      isGroupActive
                        ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                        : isOpen
                        ? 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 border border-transparent font-medium'
                        : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                    } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GroupIcon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isGroupActive
                            ? 'text-sky-600 dark:text-[#00E5FF]'
                            : 'text-slate-400 dark:text-[#98989D]'
                        }`}
                      />
                      {(!collapsed || mobileOpen) && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{group.label}</span>
                          {/* Active circuit dot */}
                          {isGroupActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.8)] shrink-0" />
                          )}
                        </div>
                      )}
                    </div>

                    {(!collapsed || mobileOpen) && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${
                            isGroupActive
                              ? 'bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212]'
                              : 'bg-slate-100 dark:bg-[#1E1E1E] text-sky-600 dark:text-[#00E5FF] border border-slate-200 dark:border-[#2C2C2E]'
                          }`}
                        >
                          {group.badge || visibleItems.length}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                            isOpen
                              ? 'rotate-180 text-slate-600 dark:text-slate-300'
                              : 'text-slate-400 dark:text-[#98989D]'
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  {/* Branched Tree Child Nodes */}
                  {(!collapsed || mobileOpen) && isOpen && (
                    <div className="relative pl-3 ml-3 pt-0.5 pb-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                      {/* Sub-Branch Categorization if subgroups exist and no search filter is active */}
                      {group.subgroups && !branchFilter.trim() ? (
                        <div className="space-y-2">
                          {group.subgroups.map((subgroup, subIdx) => {
                            const isSubLast = subIdx === group.subgroups!.length - 1;
                            const subVisibleItems = subgroup.items.filter((item) =>
                              isNavAuthorized(item.id)
                            );
                            if (subVisibleItems.length === 0) return null;

                            const isSubActive = subVisibleItems.some((item) =>
                              isItemActive(item.path, item.id)
                            );

                            return (
                              <div key={subgroup.id} className="relative">
                                {/* Sub-branch Header Stem */}
                                <div className="flex items-center gap-1.5 pl-6 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#636366]">
                                  <GitBranch
                                    className={`w-3 h-3 ${
                                      isSubActive
                                        ? 'text-sky-500 dark:text-[#00E5FF]'
                                        : 'text-slate-400 dark:text-[#636366]'
                                    }`}
                                  />
                                  <span>{subgroup.label}</span>
                                </div>

                                {/* Leaf items for this sub-branch */}
                                <div className="space-y-0.5">
                                  {subVisibleItems.map((childItem, idx) => {
                                    const isLeafLast = idx === subVisibleItems.length - 1;
                                    return renderBranchItem(childItem, isLeafLast);
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Direct Branch Items */
                        visibleItems.map((childItem, idx) => {
                          const isLeafLast = idx === visibleItems.length - 1;
                          return renderBranchItem(childItem, isLeafLast);
                        })
                      )}
                    </div>
                  )}

                  {/* Collapsed Mode Floating Flyout Tree Popover */}
                  {collapsed && !mobileOpen && activeFlyoutId === group.id && (
                    <div
                      className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
                      style={{
                        top: flyoutCoords.top,
                        left: flyoutCoords.left,
                      }}
                      onMouseEnter={handleFlyoutMouseEnter}
                      onMouseLeave={handleFlyoutMouseLeave}
                    >
                      <div className="w-64 max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-[#1A1A1E]/95 backdrop-blur-xl border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl p-3 scrollbar-thin">
                        {/* Flyout Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#27272A]">
                          <div className="flex items-center gap-2 min-w-0">
                            <GroupIcon className="w-4 h-4 text-sky-500 dark:text-[#00E5FF] shrink-0" />
                            <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                              {group.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-300 font-bold shrink-0">
                            {visibleItems.length}
                          </span>
                        </div>

                        {/* Branched Tree inside Flyout */}
                        <div className="relative pl-2 space-y-0.5">
                          {visibleItems.map((childItem, idx) => {
                            const isLeafLast = idx === visibleItems.length - 1;
                            return renderBranchItem(childItem, isLeafLast, true);
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all min-h-[40px] cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#1E1E1E] border border-slate-300 dark:border-[#2C2C2E] text-slate-900 dark:text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#98989D] hover:bg-slate-50 dark:hover:bg-[#1E1E1E]/60 hover:text-slate-900 dark:hover:text-white border border-transparent font-normal'
                  } ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-sky-600 dark:text-[#00E5FF]' : 'text-slate-400 dark:text-[#98989D]'
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

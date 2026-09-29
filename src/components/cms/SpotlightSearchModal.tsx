'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Package,
  ShoppingBag,
  Users,
  LayoutDashboard,
  Settings,
  Palette,
  FileText,
  CreditCard,
  Truck,
  Receipt,
  Tag,
  Gift,
  Compass,
  Megaphone,
  Mail,
  Bell,
  Globe,
  Code2,
  BookOpen,
  Crown,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  Target,
  ShieldAlert,
  Zap,
  Box,
  Image as ImageIcon,
  FolderTree,
  Plus,
  Moon,
  Sun,
  ExternalLink,
  Command,
  CornerDownLeft,
  Wand2,
} from 'lucide-react';
import { useCMSContext } from '@/src/context/CMSContext';
import { useTheme } from '@/src/context/ThemeContext';
import { cmsService } from '@/src/services/cmsService';
import { CMSProduct } from '@/src/types';

export interface SpotlightItem {
  id: string;
  category: 'Navigation' | 'AI Features' | 'Products' | 'Customers & Team' | 'Quick Actions';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  action: () => void;
  keywords?: string[];
}

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotlightSearchModal: React.FC<SpotlightSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const {
    products,
    merchantData,
    openAddProductModal,
    activeStore,
  } = useCMSContext();

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [customersList, setCustomersList] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  // Smooth mount and unmount animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setSearchQuery('');
      setSelectedIndex(0);
      setActiveCategory('ALL');
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fetch sample customers for spotlight index once mounted
  useEffect(() => {
    if (isMounted) {
      cmsService.getCustomers().then((res: any) => {
        if (Array.isArray(res)) {
          setCustomersList(res);
        } else if (res && Array.isArray(res.customers)) {
          setCustomersList(res.customers);
        }
      }).catch(() => {});
    }
  }, [isMounted]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const executeAction = (action: () => void) => {
    setIsVisible(false);
    setTimeout(() => {
      action();
      onClose();
    }, 120);
  };

  // Build the complete index of search items
  const allItems: SpotlightItem[] = useMemo(() => {
    const items: SpotlightItem[] = [];

    // ─── 1. CORE NAVIGATION & STUDIOS ──────────────────────────
    const navigationList = [
      {
        id: 'nav-dashboard',
        title: 'Executive Dashboard',
        subtitle: 'Store overview, GMV, orders velocity & real-time metrics',
        path: '/dashboard',
        icon: LayoutDashboard,
        badge: 'Main',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        keywords: ['home', 'overview', 'sales', 'analytics', 'revenue', 'chart'],
      },
      {
        id: 'nav-products',
        title: 'Products Studio',
        subtitle: 'Catalog, pricing, variants, inventory, barcode & SKUs',
        path: '/products',
        icon: Package,
        badge: `${products.length} Products`,
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        keywords: ['items', 'inventory', 'stock', 'pricing', 'variants', 'goods'],
      },
      {
        id: 'nav-categories',
        title: 'Taxonomy & Categories Studio',
        subtitle: 'Multi-level category tree, parent hierarchies & smart collections',
        path: '/categories',
        icon: FolderTree,
        keywords: ['collections', 'groups', 'taxonomy', 'departments', 'subcategories'],
      },
      {
        id: 'nav-orders',
        title: 'Orders & Fulfillment Studio',
        subtitle: 'Order tracking, invoice generation, status pipeline & returns',
        path: '/orders',
        icon: ShoppingBag,
        badge: 'Orders',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        keywords: ['shipments', 'tracking', 'invoices', 'checkout', 'sales', 'purchases'],
      },
      {
        id: 'nav-customers',
        title: 'Customers Studio',
        subtitle: 'Customer profiles, lifetime spend, order history & segmentation',
        path: '/customers',
        icon: Users,
        keywords: ['crm', 'users', 'buyers', 'vip', 'wholesale', 'contacts'],
      },
      {
        id: 'nav-themes',
        title: 'Theme Studio & Template Publisher',
        subtitle: 'Multi-tenant storefront layouts, live visual customizer, fonts & colors',
        path: '/themes',
        icon: Palette,
        badge: 'Studio',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        keywords: ['design', 'appearance', 'branding', 'colors', 'typography', 'homepage', 'layout'],
      },
      {
        id: 'nav-pages',
        title: 'Pages & Landing Page Studio',
        subtitle: 'Visual drag-and-drop page builder, policy pages & custom routes',
        path: '/pages',
        icon: FileText,
        keywords: ['landing', 'builder', 'privacy policy', 'terms', 'about', 'contact', 'custom page'],
      },
      {
        id: 'nav-store-setup',
        title: 'Store Setup & Global Configuration',
        subtitle: 'Brand identity, logos, domains, contact info, currencies & Owner SMTP',
        path: '/store-setup',
        icon: Settings,
        badge: 'Config',
        keywords: ['settings', 'logo', 'smtp', 'email', 'domain', 'currency', 'maintenance'],
      },
      {
        id: 'nav-payments',
        title: 'Payment Gateway Studio',
        subtitle: 'Razorpay (UPI 0% MDR) & PayPal (Global Cards & BNPL)',
        path: '/payments',
        icon: CreditCard,
        badge: 'Gateway',
        badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        keywords: ['razorpay', 'paypal', 'upi', 'checkout', 'cards', 'cod', 'cash on delivery'],
      },
      {
        id: 'nav-shipping',
        title: 'Shipping & Logistics Studio',
        subtitle: 'Courier integrations, shipping zones, free shipping rules & rates',
        path: '/shipping',
        icon: Truck,
        keywords: ['delivery', 'couriers', 'rates', 'zones', 'shiprocket', 'delhivery'],
      },
      {
        id: 'nav-tax',
        title: 'Tax & GST Compliance Studio',
        subtitle: 'Regional tax rates, HSN/SAC codes, GSTIN & compliant B2B tax invoices',
        path: '/tax',
        icon: Receipt,
        keywords: ['gst', 'vat', 'hsn', 'sac', 'invoicing', 'compliance', 'taxes'],
      },
      {
        id: 'nav-discounts',
        title: 'Discounts & Promotions Studio',
        subtitle: 'Coupon vouchers, automatic cart discounts, Buy X Get Y & free shipping',
        path: '/discounts',
        icon: Tag,
        keywords: ['promos', 'coupons', 'sales', 'offers', 'vouchers', 'deals'],
      },
      {
        id: 'nav-gift-cards',
        title: 'Gift Cards & Store Credits',
        subtitle: 'Digital gift cards, balance tracking & merchant card issuances',
        path: '/gift-cards',
        icon: Gift,
        keywords: ['gift cards', 'credits', 'vouchers', 'balance'],
      },
      {
        id: 'nav-navigation',
        title: 'Navigation & Mega Menu Studio',
        subtitle: 'Header menus, footer link columns & visual promotional mega menus',
        path: '/navigation',
        icon: Compass,
        keywords: ['menus', 'header', 'footer', 'links', 'mega menu', 'drawer'],
      },
      {
        id: 'nav-marketing',
        title: 'Marketing Automation & Campaigns',
        subtitle: 'Email sender, abandoned cart recovery, automated customer journeys',
        path: '/marketing',
        icon: Megaphone,
        keywords: ['email marketing', 'newsletters', 'abandoned cart', 'broadcasts'],
      },
      {
        id: 'nav-email-templates',
        title: 'Email Template Builder',
        subtitle: 'Responsive transactional and promotional email layout customizer',
        path: '/email-templates',
        icon: Mail,
        keywords: ['templates', 'builder', 'transactional', 'receipts'],
      },
      {
        id: 'nav-team',
        title: 'User Management & Team Roles',
        subtitle: 'Staff members, granular role permissions & ownership transfer',
        path: '/team',
        icon: KeyRound,
        keywords: ['users', 'staff', 'admins', 'roles', 'permissions', 'ownership', 'team'],
      },
      {
        id: 'nav-billing',
        title: 'Store Pricing Tiers & Billing',
        subtitle: 'SaaS subscription plans, API tier add-ons & payment receipts',
        path: '/billing',
        icon: Crown,
        keywords: ['subscription', 'upgrade', 'plan', 'starter', 'pro', 'enterprise', 'invoice'],
      },
      {
        id: 'nav-domains',
        title: 'Custom Domains & SSL Certificates',
        subtitle: 'Connect custom storefront domain with automated SSL encryption',
        path: '/domains',
        icon: Globe,
        keywords: ['dns', 'cname', 'ssl', 'https', 'custom domain'],
      },
      {
        id: 'nav-developer',
        title: 'Developer API & Webhooks',
        subtitle: 'REST APIs, API Keys, Webhook payloads & programmatic integrations',
        path: '/developer',
        icon: Code2,
        keywords: ['api', 'webhooks', 'rest', 'sdk', 'endpoints', 'keys'],
      },
      {
        id: 'nav-docs',
        title: 'System Documentation & Guides',
        subtitle: 'Platform guides, best practices, video tutorials & architecture specs',
        path: '/docs',
        icon: BookOpen,
        keywords: ['help', 'manual', 'support', 'guide', 'tutorial'],
      },
    ];

    navigationList.forEach((nav) => {
      items.push({
        id: nav.id,
        category: 'Navigation',
        title: nav.title,
        subtitle: nav.subtitle,
        badge: nav.badge,
        badgeColor: nav.badgeColor,
        icon: nav.icon,
        keywords: nav.keywords,
        action: () => {
          router.push(nav.path);
          onClose();
        },
      });
    });

    // ─── 2. AI FEATURES & COPILOTS ─────────────────────────────
    const aiFeatures = [
      {
        id: 'ai-store-builder',
        title: 'AI Store Builder 🪄',
        subtitle: 'Generate a complete storefront theme from a text prompt in 15 seconds',
        path: '/themes',
        icon: Wand2,
        badge: 'Generative AI',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        keywords: ['ai theme', 'generate store', 'prompt', 'store builder', 'design ai'],
      },
      {
        id: 'ai-page-builder',
        title: 'AI Visual Page Builder',
        subtitle: 'Create responsive high-converting landing pages with AI section generation',
        path: '/pages',
        icon: Sparkles,
        badge: 'AI Studio',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        keywords: ['landing page', 'ai pages', 'ai copy', 'generate page'],
      },
      {
        id: 'ai-analytics',
        title: 'AI Analytics Copilot',
        subtitle: 'Ask natural language questions: "Why are sales down in footwear?"',
        path: '/ai-analytics',
        icon: Zap,
        badge: 'Copilot',
        badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        keywords: ['chat', 'query', 'insights', 'ai report', 'diagnostics'],
      },
      {
        id: 'ai-3d-studio',
        title: '3D Product Modeling & AR Studio',
        subtitle: 'Synthesize interactive 3D WebGL (.GLB) and iOS AR (.USDZ) from 4 photos',
        path: '/3d',
        icon: Box,
        badge: '3D / AR',
        badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        keywords: ['3d', 'ar', 'augmented reality', 'photogrammetry', 'gltf', 'usdz', 'model'],
      },
      {
        id: 'ai-forecasting',
        title: 'Sales Demand Forecasting',
        subtitle: 'Predictive revenue forecasting and seasonal trend modeling',
        path: '/forecasting',
        icon: TrendingUp,
        keywords: ['forecast', 'trends', 'predict', 'future sales'],
      },
      {
        id: 'ai-inventory-radar',
        title: 'Stockout Radar & Inventory Velocity',
        subtitle: 'Predict exact days until stock depletion and automated reorder alerts',
        path: '/inventory-prediction',
        icon: ShieldAlert,
        keywords: ['stockout', 'reorder', 'velocity', 'safety stock'],
      },
      {
        id: 'ai-customer-segmentation',
        title: 'Customer RFM Persona Segments',
        subtitle: 'Automated clustering into Champions, At Risk, and VIP spenders',
        path: '/customer-segmentation',
        icon: Users,
        keywords: ['rfm', 'cohort', 'personas', 'clustering'],
      },
      {
        id: 'ai-campaign-optimizer',
        title: 'Multi-Channel Campaign Optimizer',
        subtitle: 'AI copywriter and optimal send-time optimizer for WhatsApp & Email',
        path: '/campaign-optimization',
        icon: Target,
        keywords: ['marketing ai', 'whatsapp', 'email campaigns', 'copywriter'],
      },
    ];

    aiFeatures.forEach((ai) => {
      items.push({
        id: ai.id,
        category: 'AI Features',
        title: ai.title,
        subtitle: ai.subtitle,
        badge: ai.badge,
        badgeColor: ai.badgeColor,
        icon: ai.icon,
        keywords: ai.keywords,
        action: () => {
          router.push(ai.path);
          onClose();
        },
      });
    });

    // ─── 3. LIVE PRODUCTS ──────────────────────────────────────
    products.forEach((prod: CMSProduct) => {
      const tagsString = Array.isArray(prod.tags)
        ? prod.tags.join(' ')
        : typeof prod.tags === 'string'
        ? prod.tags
        : '';
      const priceNum = typeof prod.price === 'number' ? prod.price : parseFloat(String(prod.price || 0)) || 0;
      const priceFormatted = `$${priceNum.toFixed(2)}`;

      items.push({
        id: `prod-${prod.id}`,
        category: 'Products',
        title: prod.name || 'Untitled Product',
        subtitle: `SKU: ${prod.sku || 'N/A'} • ${prod.category || 'Uncategorized'} • ${
          prod.status === 'PUBLISHED' ? '🟢 Published' : '🟡 Draft'
        }`,
        badge: priceFormatted,
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold',
        icon: Package,
        keywords: [prod.name || '', prod.sku || '', prod.category || '', tagsString],
        action: () => {
          router.push(`/products`);
          onClose();
        },
      });
    });

    // ─── 4. CUSTOMERS & TEAM USERS ─────────────────────────────
    customersList.forEach((cust) => {
      items.push({
        id: `cust-${cust.id}`,
        category: 'Customers & Team',
        title: cust.name || 'Anonymous Customer',
        subtitle: `${cust.email} • ${cust.group || 'STANDARD'} • Orders: ${cust.ordersCount || 0}`,
        badge: cust.group || 'Customer',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        icon: Users,
        keywords: [cust.name || '', cust.email || '', cust.phone || '', cust.group || ''],
        action: () => {
          router.push('/customers');
          onClose();
        },
      });
    });

    // Add merchant owner if present
    if (merchantData?.merchant) {
      const ownerName =
        `${merchantData.merchant.firstName || ''} ${merchantData.merchant.lastName || ''}`.trim() || 'Store Owner';
      items.push({
        id: 'team-owner',
        category: 'Customers & Team',
        title: ownerName,
        subtitle: `${merchantData.merchant.email} • Role: ${merchantData.merchant.role}`,
        badge: 'Account Owner',
        badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        icon: KeyRound,
        keywords: [ownerName, merchantData.merchant.email || '', 'owner', 'admin'],
        action: () => {
          router.push('/team');
          onClose();
        },
      });
    }

    // ─── 5. QUICK ACTIONS & UTILITIES ──────────────────────────
    const quickActions = [
      {
        id: 'act-add-product',
        title: 'Add New Product',
        subtitle: 'Create and publish a new product with images, variants, and pricing',
        icon: Plus,
        badge: 'Action',
        keywords: ['new product', 'create item', 'upload'],
        action: () => {
          onClose();
          openAddProductModal();
        },
      },
      {
        id: 'act-smtp-setup',
        title: 'Configure Store Owner SMTP',
        subtitle: 'Set up verified Google Workspace, Gmail, or Outlook outbound mail routing',
        icon: Mail,
        badge: 'Owner Setup',
        keywords: ['smtp', 'gmail', 'outlook', 'email settings', 'app password'],
        action: () => {
          router.push('/store-setup');
          onClose();
        },
      },
      {
        id: 'act-payment-gateways',
        title: 'Manage Payment Gateways (Razorpay & PayPal)',
        subtitle: 'Configure domestic UPI 0% MDR and global PayPal / Card processing',
        icon: CreditCard,
        badge: 'Finance',
        keywords: ['payments', 'razorpay', 'paypal', 'upi', 'checkout'],
        action: () => {
          router.push('/payments');
          onClose();
        },
      },
      {
        id: 'act-create-page',
        title: 'Create Custom Landing Page',
        subtitle: 'Build a new merchant promotional campaign or brand landing page',
        icon: FileText,
        badge: 'CMS',
        keywords: ['new page', 'landing', 'builder'],
        action: () => {
          router.push('/pages');
          onClose();
        },
      },
      {
        id: 'act-create-discount',
        title: 'Create New Discount Voucher',
        subtitle: 'Generate coupon code or automated cart discount promo',
        icon: Tag,
        badge: 'Marketing',
        keywords: ['new discount', 'coupon', 'promo'],
        action: () => {
          router.push('/discounts');
          onClose();
        },
      },
      {
        id: 'act-toggle-theme',
        title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: `Toggle the CMS workspace appearance to ${isDark ? 'Light' : 'Dark'} mode`,
        icon: isDark ? Sun : Moon,
        badge: 'Theme',
        keywords: ['dark mode', 'light mode', 'theme', 'color scheme'],
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'act-view-storefront',
        title: 'Open Live Storefront in New Tab',
        subtitle: `Preview active store: ${activeStore?.name || 'Storefront'} (${STOREFRONT_URL})`,
        icon: ExternalLink,
        badge: 'Preview',
        keywords: ['live store', 'open site', 'preview', 'website'],
        action: () => {
          window.open(STOREFRONT_URL, '_blank');
          onClose();
        },
      },
    ];

    quickActions.forEach((act) => {
      items.push({
        id: act.id,
        category: 'Quick Actions',
        title: act.title,
        subtitle: act.subtitle,
        badge: act.badge,
        icon: act.icon,
        keywords: act.keywords,
        action: act.action,
      });
    });

    return items;
  }, [products, customersList, merchantData, activeStore, isDark, toggleTheme, openAddProductModal, router, onClose, STOREFRONT_URL]);

  // Filter items by search query & category tab
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }

      if (!q) return true;

      // Match title, subtitle, category, or keywords
      const titleMatch = item.title.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle?.toLowerCase().includes(q);
      const categoryMatch = item.category.toLowerCase().includes(q);
      const keywordMatch = item.keywords?.some((kw) => kw.toLowerCase().includes(q));

      return titleMatch || subtitleMatch || categoryMatch || keywordMatch;
    });
  }, [allItems, searchQuery, activeCategory]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups: { category: string; items: SpotlightItem[] }[] = [];
    const categoriesOrder: SpotlightItem['category'][] = [
      'Quick Actions',
      'Navigation',
      'AI Features',
      'Products',
      'Customers & Team',
    ];

    categoriesOrder.forEach((cat) => {
      const itemsInCat = filteredItems.filter((it) => it.category === cat);
      if (itemsInCat.length > 0) {
        groups.push({ category: cat, items: itemsInCat });
      }
    });

    return groups;
  }, [filteredItems]);

  // Flattened visible items for keyboard navigation index
  const flatVisibleItems = useMemo(() => {
    return groupedItems.flatMap((g) => g.items);
  }, [groupedItems]);

  // Keyboard navigation listener (Arrow Up/Down, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatVisibleItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatVisibleItems.length) % Math.max(1, flatVisibleItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = flatVisibleItems[selectedIndex];
        if (selectedItem) {
          executeAction(selectedItem.action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatVisibleItems, selectedIndex]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= flatVisibleItems.length) {
      setSelectedIndex(0);
    }
  }, [flatVisibleItems.length, selectedIndex]);

  if (!isMounted) return null;

  let currentItemCounter = 0;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-slate-950/60 transition-all duration-200 ease-out will-change-[opacity,backdrop-filter] ${
        isVisible
          ? 'opacity-100 backdrop-blur-md pointer-events-auto'
          : 'opacity-0 backdrop-blur-none pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-[#2C2C2E] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transform-gpu transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity] ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.96] -translate-y-3'
        }`}
      >
        {/* ─── SPOTLIGHT SEARCH INPUT HEADER ──────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#2C2C2E] flex items-center gap-3 bg-white/50 dark:bg-[#1E1E1E]/50">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search studios, products, customers, AI copilots, or commands..."
            className="w-full bg-transparent text-base sm:text-lg font-bold text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-accent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-accent dark:hover:bg-accent/80 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-border cursor-pointer transition-colors"
            >
              ESC
            </button>
          </div>
        </div>

        {/* ─── CATEGORY FILTER CHIPS ───────────────────────────────── */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#2C2C2E]/60 bg-slate-50/50 dark:bg-accent/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Results' },
            { id: 'Navigation', label: '🧭 Studios & Pages' },
            { id: 'AI Features', label: '🤖 AI Copilots' },
            { id: 'Products', label: `📦 Products (${products.length})` },
            { id: 'Customers & Team', label: '👥 Customers & Team' },
            { id: 'Quick Actions', label: '⚡ Quick Actions' },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-border'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-accent/60 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── SEARCH RESULTS LIST ─────────────────────────────────── */}
        <div
          ref={listContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 max-h-[55vh]"
        >
          {groupedItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-accent text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-foreground">
                  No matching results found
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try searching for a studio name, SKU, customer email, or AI tool.
                </p>
              </div>
            </div>
          ) : (
            groupedItems.map((group) => (
              <div key={group.category} className="space-y-1.5">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>{group.category}</span>
                  <span>{group.items.length}</span>
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const thisIndex = currentItemCounter++;
                    const isSelected = thisIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => executeAction(item.action)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-accent/40 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isSelected
                                    ? 'text-indigo-950 dark:text-indigo-200 font-black'
                                    : 'text-slate-900 dark:text-foreground'
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border ${
                                    item.badgeColor ||
                                    'bg-slate-100 text-slate-700 dark:bg-accent dark:text-slate-300 border-slate-200 dark:border-border'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 animate-in fade-in">
                              <span>Open</span>
                              <CornerDownLeft className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── SPOTLIGHT FOOTER COMMAND BAR ────────────────────────── */}
        <div className="p-3 sm:px-5 sm:py-3 border-t border-slate-100 dark:border-[#2C2C2E] bg-slate-50/60 dark:bg-accent/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-card border border-slate-200 dark:border-border font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                ↑↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-card border border-slate-200 dark:border-border font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                ↵
              </kbd>
              <span>to open</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-card border border-slate-200 dark:border-border font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                ESC
              </kbd>
              <span>to dismiss</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-400 dark:text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

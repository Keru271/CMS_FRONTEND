'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Lock,
  ShieldCheck,
  Camera,
  Leaf,
  Sparkles,
  Check,
  ChevronRight,
  Sliders,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Heart,
  Eye,
  Scan,
  Maximize2,
  CheckCircle2,
  User,
  Zap,
  MapPin,
  Flame,
  Search,
  ChevronDown,
  ShoppingCart,
  Star,
  Layers,
  Plus,
  Cpu,
  Truck,
  Box,
} from 'lucide-react';
import {
  StorefrontTemplateConfig,
  getTemplateConfig,
} from './templateConfigs';

export type ScreenViewport = 'desktop' | 'tablet' | 'mobile';

export interface StitchScreenData {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  path?: string;
  type:
    | 'welcome'
    | 'privacy'
    | 'questionnaire'
    | 'scanner'
    | 'aura'
    | 'catalog'
    | 'tryon'
    | 'checkout'
    | 'custom';
  viewport?: ScreenViewport;
  content?: Record<string, any>;
}

export interface ClaymorphicThemeConfig {
  mode: 'light' | 'dark';
  canvasBg: string;
  cardBg: string;
  primaryColor: string;
  accentColor: string;
  creamBg: string;
  textColor: string;
  textMuted: string;
  shadowIntensity: number; // 0.1 to 1.0
  shadowSoftness: number;  // 6 to 24px
  borderRadius: number;    // 16 to 36px
  fontFamily: string;
}

export const DEFAULT_CLAY_THEME: ClaymorphicThemeConfig = {
  mode: 'light',
  canvasBg: '#F1F5F9',
  cardBg: '#FFFFFF',
  primaryColor: '#2563EB', // Nova tech primary blue
  accentColor: '#38BDF8',
  creamBg: '#E2E8F0',
  textColor: '#0F172A',
  textMuted: '#64748B',
  shadowIntensity: 0.28,
  shadowSoftness: 14,
  borderRadius: 24,
  fontFamily: 'Inter, sans-serif',
};

export const DARK_CLAY_THEME: ClaymorphicThemeConfig = {
  mode: 'dark',
  canvasBg: '#090A0F',
  cardBg: '#13141F',
  primaryColor: '#38BDF8',
  accentColor: '#818CF8',
  creamBg: '#1E212E',
  textColor: '#F8FAFC',
  textMuted: '#94A3B8',
  shadowIntensity: 0.65,
  shadowSoftness: 18,
  borderRadius: 24,
  fontFamily: 'Inter, sans-serif',
};

interface ClaymorphicScreenRendererProps {
  screen: StitchScreenData;
  template?: StorefrontTemplateConfig;
  theme?: ClaymorphicThemeConfig;
  isActive?: boolean;
  onSelect?: () => void;
  onNavigateToScreen?: (screenNumber: number) => void;
  scale?: number;
  viewport?: ScreenViewport;
  onSelectSection?: (sectionId: string, sectionType: string) => void;
  realProducts?: any[];
  useRealProducts?: boolean;
  customWidth?: string | number;
  customHeight?: string | number;
}

export function ClaymorphicScreenRenderer({
  screen,
  template,
  theme = DEFAULT_CLAY_THEME,
  isActive = false,
  onSelect,
  onNavigateToScreen,
  scale = 1,
  viewport,
  onSelectSection,
  realProducts = [],
  useRealProducts = false,
  customWidth,
  customHeight,
}: ClaymorphicScreenRendererProps) {
  // Resolved Active Template Configuration
  const tmpl: StorefrontTemplateConfig = template || getTemplateConfig('nova-tech');

  // Determine effective viewport: prop overrides screen.viewport, defaults to 'mobile'
  const effectiveViewport: ScreenViewport = viewport || screen.viewport || 'mobile';

  // Interactive Local States per Screen
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<string>(tmpl.pdp.variants[0] || 'Default');
  const [selectedColor, setSelectedColor] = useState<string>(tmpl.pdp.colors?.[0]?.name || 'Clay');
  const [selectedSize, setSelectedSize] = useState<string>(tmpl.pdp.sizes?.[2] || '9');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('All');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [activeTabPDP, setActiveTabPDP] = useState<'specs' | 'features' | 'reviews'>('specs');

  // Dynamic Claymorphic Shadow Helper
  const getClayCardShadow = () => {
    if (theme.mode === 'dark') {
      return `8px 8px ${theme.shadowSoftness}px rgba(0,0,0,0.7), -6px -6px ${theme.shadowSoftness}px rgba(255,255,255,0.03), inset 1px 1px 2px rgba(255,255,255,0.1)`;
    }
    return `6px 6px ${theme.shadowSoftness}px rgba(160, 168, 148, ${theme.shadowIntensity}), -6px -6px ${theme.shadowSoftness}px rgba(255, 255, 255, 0.95), inset 1px 1px 2px rgba(255, 255, 255, 0.6)`;
  };

  const getClayPillShadow = () => {
    if (theme.mode === 'dark') {
      return `4px 4px 10px rgba(0,0,0,0.8), -3px -3px 8px rgba(255,255,255,0.05)`;
    }
    return `4px 4px 10px rgba(150, 158, 138, 0.3), -4px -4px 10px rgba(255, 255, 255, 0.9)`;
  };

  const getClayInsetShadow = () => {
    if (theme.mode === 'dark') {
      return `inset 3px 3px 6px rgba(0,0,0,0.8), inset -3px -3px 6px rgba(255,255,255,0.04)`;
    }
    return `inset 3px 3px 6px rgba(170, 175, 160, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.8)`;
  };

  // Curated Catalog Items (Fallback from Template or Real Products)
  const catalogItems = useRealProducts && realProducts.length > 0
    ? realProducts.slice(0, 4).map((p) => ({
        id: p.id || String(Math.random()),
        name: p.title || p.name,
        price: `$${p.price || 199}`,
        tag: 'Live Catalog',
        img: p.images?.[0] || tmpl.products[0]?.img || '',
        description: p.description || '',
        colorDots: (p.colors || []) as string[],
        category: p.category || 'General',
      }))
    : tmpl.products;

  const displayCatalogItems =
    selectedCatalogCategory === 'All'
      ? catalogItems
      : catalogItems.filter((p: any) => p.category === selectedCatalogCategory);

  // Route path
  const routePath = screen.path || (screen.type === 'welcome' ? '/' : `/${screen.slug}`);

  // Determine Dimensions based on Viewport
  let frameWidth: string | number = customWidth || '320px';
  let frameHeight: string | number = customHeight || '670px';

  if (!customWidth) {
    if (effectiveViewport === 'desktop') {
      frameWidth = '920px';
      frameHeight = customHeight || '670px';
    } else if (effectiveViewport === 'tablet') {
      frameWidth = '640px';
      frameHeight = customHeight || '670px';
    }
  }

  // =========================================================================
  // VIEWPORT: DESKTOP & TABLET WEBSITE RENDERER
  // =========================================================================
  if (effectiveViewport === 'desktop' || effectiveViewport === 'tablet') {
    return (
      <div
        onClick={onSelect}
        className={`relative select-none transition-all duration-200 cursor-pointer ${
          isActive ? 'ring-3 ring-sky-500 ring-offset-4 ring-offset-slate-100 rounded-3xl' : ''
        }`}
        style={{
          width: frameWidth,
          height: frameHeight,
          transformOrigin: 'top center',
        }}
      >
        {/* Claymorphic Desktop Browser Chassis */}
        <div
          className="w-full h-full rounded-3xl p-2.5 relative flex flex-col overflow-hidden shadow-2xl transition-all"
          style={{
            backgroundColor: theme.mode === 'dark' ? '#0F1014' : '#E8E4D8',
            boxShadow:
              theme.mode === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.08)'
                : '0 25px 40px -10px rgba(130, 140, 115, 0.35), 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {/* Desktop Browser Window Chrome / Address Bar */}
          <div className="h-9 px-4 flex items-center justify-between text-xs opacity-90 shrink-0 z-20 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-xs" />
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border border-black/5 dark:border-white/10 max-w-sm w-full mx-4 truncate"
              style={{
                backgroundColor: theme.mode === 'dark' ? '#181A22' : '#F5F2E9',
                boxShadow: getClayInsetShadow(),
              }}
            >
              <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              <span className="truncate opacity-80">
                https://{tmpl.slug}.storefront.com{routePath}
              </span>
              <RefreshCw className="w-2.5 h-2.5 opacity-40 shrink-0 ml-auto" />
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono opacity-60">
              <Monitor className="w-3 h-3" />
              <span>{effectiveViewport === 'desktop' ? '1440 × 900' : '768 × 1024'}</span>
            </div>
          </div>

          {/* Browser Interior Surface */}
          <div
            className="w-full flex-1 rounded-2xl flex flex-col overflow-hidden relative"
            style={{
              backgroundColor: theme.canvasBg,
              color: theme.textColor,
              fontFamily: theme.fontFamily,
            }}
          >
            {/* Top Desktop Website Navbar */}
            <header
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection?.('navbar', 'navbar');
              }}
              className="px-6 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md z-10"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: tmpl.primaryColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold tracking-widest text-xs uppercase font-serif">
                  {tmpl.brandName}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/5 font-mono opacity-60">
                  {tmpl.badge}
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-5 text-[11px] font-semibold opacity-80">
                <span onClick={() => onNavigateToScreen?.(1)} className="hover:text-emerald-600 cursor-pointer transition">
                  Home
                </span>
                <span onClick={() => onNavigateToScreen?.(2)} className="hover:text-emerald-600 cursor-pointer transition">
                  Catalog
                </span>
                <span onClick={() => onNavigateToScreen?.(3)} className="hover:text-emerald-600 cursor-pointer transition">
                  Details
                </span>
                <span onClick={() => onNavigateToScreen?.(4)} className="hover:text-emerald-600 cursor-pointer transition">
                  Checkout
                </span>
                <span onClick={() => onNavigateToScreen?.(5)} className="hover:text-emerald-600 cursor-pointer transition">
                  Story
                </span>
                <span onClick={() => onNavigateToScreen?.(6)} className="hover:text-emerald-600 cursor-pointer transition">
                  Reviews
                </span>
              </nav>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[10px] text-slate-500">
                  <Search className="w-3 h-3" />
                  <span>Search {tmpl.category.split(' ')[0]}... ⌘K</span>
                </div>

                <div
                  onClick={() => onNavigateToScreen?.(4)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-bold cursor-pointer transition shadow-sm"
                  style={{ backgroundColor: tmpl.primaryColor }}
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Bag (2)</span>
                </div>
              </div>
            </header>

            {/* Scrollable Desktop Body Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-6 space-y-6 interactive-screen-content">
              {/* ────────────────── SCREEN 1: DESKTOP HOME PAGE (/) ────────────────── */}
              {screen.type === 'welcome' && (
                <div className="space-y-6">
                  {/* Announcement Bar */}
                  <div
                    className="py-1 px-4 rounded-full text-center text-[10px] font-bold tracking-wider uppercase mx-auto max-w-lg"
                    style={{
                      backgroundColor: theme.cardBg,
                      boxShadow: getClayCardShadow(),
                      color: tmpl.primaryColor,
                    }}
                  >
                    ✨ Free Worldwide Insured Shipping on all {tmpl.name} Orders
                  </div>

                  {/* Desktop High-Impact Hero Banner */}
                  <div
                    className="p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                    style={{
                      backgroundColor: theme.cardBg,
                      boxShadow: getClayCardShadow(),
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    {/* Left Hero Copy */}
                    <div className="space-y-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${tmpl.primaryColor}15`, color: tmpl.primaryColor }}>
                        <Flame className="w-3 h-3" />
                        <span>{tmpl.hero.badge}</span>
                      </div>

                      <h1 className="text-2xl font-bold tracking-tight leading-tight">
                        {tmpl.hero.title}
                      </h1>

                      <p className="text-xs opacity-70 leading-relaxed max-w-md">
                        {tmpl.hero.subtitle}
                      </p>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => onNavigateToScreen?.(2)}
                          className="px-5 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                          style={{
                            backgroundColor: tmpl.primaryColor,
                            boxShadow: getClayPillShadow(),
                          }}
                        >
                          <span>{tmpl.hero.ctaPrimary}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigateToScreen?.(3)}
                          className="px-4 py-2.5 rounded-full text-xs font-bold border border-current opacity-80 hover:opacity-100 transition cursor-pointer"
                        >
                          {tmpl.hero.ctaSecondary}
                        </button>
                      </div>

                      <div className="flex items-center gap-4 pt-3 text-[10px] opacity-70">
                        {tmpl.hero.trustBadges.map((badge, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{badge}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Hero Image Card */}
                    <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
                      <img
                        src={tmpl.hero.image}
                        alt={tmpl.hero.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">
                          {tmpl.name}
                        </span>
                        <span className="font-bold text-sm">{tmpl.tagline}</span>
                      </div>

                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-[9px] font-bold flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>{tmpl.hero.floatingBadge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold tracking-tight">Curated Categories</h2>
                    <div className="flex items-center gap-2 text-[10px]">
                      {tmpl.categories.map((cat, idx) => (
                        <span
                          key={cat}
                          onClick={() => onNavigateToScreen?.(2)}
                          className={`px-3 py-1 rounded-full cursor-pointer font-bold ${
                            idx === 0
                              ? 'text-white'
                              : 'opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5'
                          }`}
                          style={idx === 0 ? { backgroundColor: tmpl.primaryColor } : {}}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4-Column Product Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {catalogItems.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="p-2.5 rounded-2xl flex flex-col justify-between group overflow-hidden transition-transform hover:-translate-y-1 duration-200"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div className="w-full h-32 rounded-xl overflow-hidden relative mb-2 bg-black/5">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/70 text-white text-[8.5px] font-mono">
                            {p.tag}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold block truncate">{p.name}</span>
                          {p.colorDots && p.colorDots.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {p.colorDots.map((c: string, ci: number) => (
                                <span
                                  key={ci}
                                  className="w-2 h-2 rounded-full border border-black/10 shadow-2xs"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs font-mono font-semibold">{p.price}</span>
                            <button
                              type="button"
                              onClick={() => onNavigateToScreen?.(3)}
                              className="px-2.5 py-1 rounded-full text-[9px] font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
                              style={{ backgroundColor: tmpl.primaryColor }}
                            >
                              View Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Three Categories Showcase (from Northvale) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold tracking-tight">Three categories. One system.</h3>
                      <span onClick={() => onNavigateToScreen?.(2)} className="text-[10px] font-semibold opacity-70 hover:opacity-100 cursor-pointer">
                        View all products →
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div
                        onClick={() => onNavigateToScreen?.(2)}
                        className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer shadow-md"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80"
                          alt="Outerwear"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3 text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">Outerwear</span>
                        </div>
                      </div>

                      <div
                        onClick={() => onNavigateToScreen?.(2)}
                        className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer shadow-md"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
                          alt="Footwear"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3 text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">Footwear</span>
                        </div>
                      </div>

                      <div
                        onClick={() => onNavigateToScreen?.(2)}
                        className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer shadow-md"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
                          alt="Packs"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3 text-white">
                          <span className="text-xs font-bold uppercase tracking-wider">Packs & Gear</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Macro Performance Features */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">Performance engineered into every fiber.</h3>
                      <p className="text-[10px] opacity-70">Three material standards developed for extreme weather and active trail hiking.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div
                        className="p-3 rounded-2xl space-y-2"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-black/5">
                          <img
                            src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80"
                            alt="Weather Protection"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold block">Weather Protection</span>
                        <p className="text-[9.5px] opacity-70 leading-relaxed">
                          28,000mm hydrostatic head waterproof barrier with non-fluorinated DWR.
                        </p>
                      </div>

                      <div
                        className="p-3 rounded-2xl space-y-2"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-black/5">
                          <img
                            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80"
                            alt="Engineered Construction"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold block">Engineered Construction</span>
                        <p className="text-[9.5px] opacity-70 leading-relaxed">
                          13mm micro-tape seam seals and laser-cut watertight YKK Aquaguard zippers.
                        </p>
                      </div>

                      <div
                        className="p-3 rounded-2xl space-y-2"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-black/5">
                          <img
                            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80"
                            alt="Breathable Performance"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold block">Breathable Performance</span>
                        <p className="text-[9.5px] opacity-70 leading-relaxed">
                          Open 3D air-matrix ventilation allowing internal humidity to escape on uphill pushes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Alpine Story (Alta Via) */}
                  <div
                    className="p-5 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-5 items-center"
                    style={{
                      backgroundColor: theme.cardBg,
                      boxShadow: getClayCardShadow(),
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    <div className="h-44 rounded-2xl overflow-hidden shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&auto=format&fit=crop&q=80"
                        alt="Alta Via Trail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest font-mono opacity-60">
                        FIELD NOTES • ALTA VIA
                      </span>
                      <h3 className="text-base font-bold tracking-tight leading-snug">
                        Two hundred kilometers of quiet weather along the Alta Via.
                      </h3>
                      <p className="text-xs opacity-70 leading-relaxed">
                        Our founders spent four weeks testing lightweight shells and fast-hiking footwear across the northern Dolomites. No summit selfies — just honest miles and mountain air.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateToScreen?.(5)}
                        className="text-xs font-bold flex items-center gap-1.5 opacity-90 hover:opacity-100 cursor-pointer pt-1"
                        style={{ color: tmpl.primaryColor }}
                      >
                        <span>Read story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Panorama Alpine Banner (Outside is waiting) */}
                  <div className="relative h-40 rounded-3xl overflow-hidden shadow-lg group">
                    <img
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80"
                      alt="Alpine Vista"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center p-6 text-white space-y-2">
                      <h3 className="text-xl font-bold tracking-tight">Outside is waiting.</h3>
                      <p className="text-xs opacity-80 max-w-sm">
                        Ultralight shells and trail-tested packs built for your next alpine traverse.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigateToScreen?.(2)}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white w-fit cursor-pointer shadow-md transition active:scale-95"
                        style={{ backgroundColor: tmpl.primaryColor }}
                      >
                        Explore Gear
                      </button>
                    </div>
                  </div>

                  {/* Field Notes Newsletter */}
                  <div
                    className="p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{
                      backgroundColor: '#121316',
                      color: '#FFFFFF',
                    }}
                  >
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase opacity-60 block">FIELD NOTES</span>
                      <h4 className="text-xs font-bold tracking-tight mt-0.5">
                        New releases and quiet drops — no noise, once a month.
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none"
                      />
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-900 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Subscribe →
                      </button>
                    </div>
                  </div>

                  {/* Template Footer */}
                  <footer className="pt-4 border-t border-black/10 dark:border-white/10 text-[10px] space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <span className="font-bold tracking-widest uppercase text-xs block">{tmpl.brandName}</span>
                        <p className="opacity-70 leading-relaxed text-[9.5px]">
                          Outdoor essentials for hikers, weekend campers and the long trail ahead. Designed in the Alpine, tested on the ground.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SHOP</span>
                        <div className="space-y-0.5 opacity-80 text-[9.5px]">
                          <div>Outerwear</div>
                          <div>Footwear</div>
                          <div>Packs</div>
                          <div>Accessories</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">EXPLORE</span>
                        <div className="space-y-0.5 opacity-80 text-[9.5px]">
                          <div>Our Story</div>
                          <div>Journal</div>
                          <div>Technology</div>
                          <div>Sustainability</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SUPPORT</span>
                        <div className="space-y-0.5 opacity-80 text-[9.5px]">
                          <div>Contact</div>
                          <div>Shipping</div>
                          <div>Returns</div>
                          <div>Size Guide</div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-60 text-[9px]">
                      <span>© 2026 {tmpl.brandName} Outdoor Co.</span>
                      <div className="flex gap-3">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Cookies</span>
                      </div>
                    </div>
                  </footer>
                </div>
              )}

              {/* ────────────────── SCREEN 2: PRODUCTS CATALOG (/products) ────────────────── */}
              {screen.type === 'catalog' && (
                <div className="space-y-6 pb-6">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider opacity-60">
                    <span onClick={() => onNavigateToScreen?.(1)} className="cursor-pointer hover:underline">SHOP</span>
                    <span>/</span>
                    <span className="font-semibold text-current opacity-100">
                      {selectedCatalogCategory === 'All' ? 'ALL' : selectedCatalogCategory.toUpperCase()}
                    </span>
                  </div>

                  {/* Header & Product Count */}
                  <div className="flex items-end justify-between border-b border-black/5 dark:border-white/5 pb-3">
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                        {tmpl.slug === 'northvale' ? 'Field-tested essentials, quietly organized.' : `${tmpl.name} Collection`}
                      </h1>
                      <p className="text-[11px] opacity-70 mt-1">
                        High-performance apparel and equipment designed for the quiet distance.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono opacity-60 whitespace-nowrap">
                      {displayCatalogItems.length} products
                    </span>
                  </div>

                  {/* Filter Pills Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {['All', ...tmpl.categories].map((cat) => {
                        const isSelected = selectedCatalogCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCatalogCategory(cat)}
                            className={`px-3 py-1 rounded-full text-[10.5px] font-semibold transition cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                                : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Audience Filter Pills */}
                    <div className="flex items-center gap-1.5">
                      {['All', 'Men', 'Women', 'New Arrivals'].map((aud) => {
                        const isAudSelected = selectedAudience === aud;
                        return (
                          <button
                            key={aud}
                            type="button"
                            onClick={() => setSelectedAudience(aud)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition cursor-pointer ${
                              isAudSelected
                                ? 'bg-black/10 dark:bg-white/10 font-bold opacity-100 border border-current'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            {aud}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4-Column Product Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayCatalogItems.map((p: any, idx: number) => (
                      <div
                        key={p.id || idx}
                        onClick={() => onNavigateToScreen?.(3)}
                        className="group flex flex-col justify-between cursor-pointer rounded-2xl p-2.5 transition duration-300 hover:-translate-y-1"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div>
                          {/* Top index number and image container */}
                          <div className="flex items-center justify-between text-[10px] font-mono opacity-50 px-1 mb-1">
                            <span>{String(idx + 1).padStart(2, '0')}</span>
                            <span className="text-[9px] uppercase tracking-wider">{p.category || 'FOOTWEAR'}</span>
                          </div>

                          <div className="w-full h-44 rounded-xl overflow-hidden relative mb-2.5 bg-black/5">
                            <img
                              src={p.img}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                            />
                            {p.tag && (
                              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[8px] font-mono backdrop-blur-xs">
                                {p.tag}
                              </span>
                            )}
                          </div>

                          <span className="text-[11.5px] font-bold block truncate leading-tight group-hover:underline">
                            {p.name}
                          </span>
                        </div>

                        <div className="pt-2">
                          {/* Color Swatch Dots */}
                          {p.colorDots && p.colorDots.length > 0 && (
                            <div className="flex items-center gap-1.5 mb-2">
                              {p.colorDots.map((c: string, ci: number) => (
                                <span
                                  key={ci}
                                  className="w-2.5 h-2.5 rounded-full border border-black/15 dark:border-white/20 shadow-2xs"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold">{p.price}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToScreen?.(3);
                              }}
                              className="px-2.5 py-1 rounded-full text-[9px] font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
                              style={{ backgroundColor: tmpl.primaryColor }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Newsletter & Footer for Catalog Screen */}
                  <div className="pt-8 space-y-6">
                    {/* Field Notes Newsletter */}
                    <div className="p-6 rounded-2xl bg-black text-white space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-mono tracking-widest uppercase opacity-70 block">FIELD NOTES</span>
                          <h4 className="text-sm font-bold mt-1">New releases and quiet drops — no noise, once a month.</h4>
                        </div>
                        <div className="flex items-center gap-2 max-w-sm w-full">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white text-xs border border-white/20 placeholder:text-white/40 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition active:scale-95"
                            style={{ backgroundColor: tmpl.primaryColor }}
                          >
                            SUBSCRIBE →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4-Column Footer */}
                    <footer className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                        <div className="space-y-1.5 md:col-span-1">
                          <span className="font-bold text-xs uppercase tracking-wider block font-serif">{tmpl.brandName}</span>
                          <p className="text-[9.5px] opacity-70 leading-relaxed">
                            Outdoor essentials for hikers, weekend campers, and the long trail ahead. Designed in the alpine, tested on the ground.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SHOP</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Outerwear</div>
                            <div>Footwear</div>
                            <div>Packs</div>
                            <div>Tops</div>
                            <div>Accessories</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">EXPLORE</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Our Story</div>
                            <div>Journal</div>
                            <div>Technology</div>
                            <div>Sustainability</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SUPPORT</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Contact</div>
                            <div>Shipping</div>
                            <div>Returns</div>
                            <div>Size Guide</div>
                            <div>Warranty</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SOCIAL</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Instagram</div>
                            <div>YouTube</div>
                            <div>Spotify</div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-60 text-[9px]">
                        <span>© 2026 {tmpl.brandName} Outdoor Co.</span>
                        <div className="flex gap-3">
                          <span>Privacy</span>
                          <span>Terms</span>
                          <span>Cookies</span>
                        </div>
                      </div>
                    </footer>
                  </div>
                </div>
              )}

              {/* ────────────────── SCREEN 3: PRODUCT DETAILS PDP ────────────────── */}
              {screen.type === 'questionnaire' && (
                <div className="space-y-8 pb-6">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider opacity-60">
                    <span onClick={() => onNavigateToScreen?.(1)} className="cursor-pointer hover:underline">SHOP</span>
                    <span>/</span>
                    <span onClick={() => onNavigateToScreen?.(2)} className="cursor-pointer hover:underline">FOOTWEAR</span>
                    <span>/</span>
                    <span className="font-semibold text-current opacity-100">{tmpl.pdp.featuredProduct.toUpperCase()}</span>
                  </div>

                  {/* Top Buy Box (2 columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Product Gallery */}
                    <div className="space-y-3">
                      <div className="w-full h-80 rounded-2xl overflow-hidden bg-white dark:bg-black/40 flex items-center justify-center p-4 shadow-sm border border-black/5 dark:border-white/5">
                        <img
                          src={tmpl.pdp.images[0] || tmpl.hero.image}
                          alt={tmpl.pdp.featuredProduct}
                          className="w-full h-full object-contain filter drop-shadow-xl"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {tmpl.pdp.images.map((img, i) => (
                          <div
                            key={i}
                            className="h-20 rounded-xl overflow-hidden bg-white dark:bg-black/30 border border-black/10 flex items-center justify-center p-1.5 cursor-pointer hover:border-black/30"
                          >
                            <img src={img} alt="Thumb" className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Buy Box Options */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 block">
                          FOOTWEAR
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight mt-0.5">{tmpl.pdp.featuredProduct}</h1>
                        <p className="text-xs opacity-70 mt-0.5">Lightweight fast-hike shoe</p>
                        <div className="mt-2 text-xl font-mono font-bold">
                          {tmpl.pdp.price}
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">
                            COLOR: <span className="font-bold text-current opacity-100">{selectedColor}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {(tmpl.pdp.colors || [
                            { name: 'Clay', hex: '#C05621' },
                            { name: 'Sand', hex: '#D5CEBF' },
                          ]).map((col) => {
                            const isColActive = selectedColor === col.name;
                            return (
                              <button
                                key={col.name}
                                type="button"
                                onClick={() => setSelectedColor(col.name)}
                                className={`w-7 h-7 rounded-full transition cursor-pointer relative shadow-xs flex items-center justify-center ${
                                  isColActive ? 'ring-2 ring-black dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-black' : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: col.hex }}
                                title={col.name}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Selection */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">SIZE</span>
                          <span className="text-[10px] underline opacity-60 hover:opacity-100 cursor-pointer">Size guide</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(tmpl.pdp.sizes || ['7', '8', '9', '10', '11', '12']).map((sz) => {
                            const isSzActive = selectedSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setSelectedSize(sz)}
                                className={`w-10 h-10 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                                  isSzActive
                                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                                    : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100 border border-black/10 dark:border-white/10'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantity & Add to Bag CTA */}
                      <div className="flex items-center gap-3 pt-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-black/15 dark:border-white/15 rounded-full px-3 py-2 bg-black/5 dark:bg-white/5">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-1 text-xs opacity-60 hover:opacity-100 font-bold cursor-pointer"
                          >
                            —
                          </button>
                          <span className="mx-3 text-xs font-mono font-bold min-w-[14px] text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-1 text-xs opacity-60 hover:opacity-100 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Terracotta Button */}
                        <button
                          type="button"
                          onClick={() => onNavigateToScreen?.(4)}
                          className="flex-1 py-3 px-6 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                          style={{
                            backgroundColor: tmpl.primaryColor,
                            boxShadow: getClayPillShadow(),
                          }}
                        >
                          <span>Add to Bag - {tmpl.pdp.price.replace('.00', '')}</span>
                        </button>
                      </div>

                      {/* Microcopy */}
                      <div className="text-[10px] opacity-60 text-center pt-1 font-mono">
                        Free shipping over $150 · 30-day returns · Lifetime repair program
                      </div>
                    </div>
                  </div>

                  {/* Below the Fold: Product Story & Technical Specifications */}
                  <div className="pt-8 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Product Story */}
                    <div className="space-y-3">
                      <span className="text-[9.5px] font-mono tracking-widest uppercase opacity-60 block">
                        PRODUCT STORY
                      </span>
                      <h3 className="text-xl font-bold tracking-tight leading-snug">
                        Fast, breathable, honest — for long trail days when weight matters.
                      </h3>
                      <p className="text-xs opacity-70 leading-relaxed">
                        Engineered mesh upper with high-traction multidirectional lugs and rock-plate protection. Field-tested in the Northern Dolomites across 200 kilometers of high-altitude granite passes.
                      </p>
                    </div>

                    {/* Right Column: Material, Details, Technology */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9.5px] font-mono tracking-widest uppercase opacity-60 block mb-1">
                          MATERIAL
                        </span>
                        <p className="text-xs opacity-80 leading-relaxed">
                          Engineered mesh upper with rubber outsole and cushioned EVA midsole.
                        </p>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-mono tracking-widest uppercase opacity-60 block mb-1">
                          DETAILS
                        </span>
                        <ul className="text-xs opacity-80 space-y-1 font-mono">
                          <li>— Weight: 260g / size 9</li>
                          <li>— 4mm heel-toe drop</li>
                          <li>— Breathable mesh upper</li>
                        </ul>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-mono tracking-widest uppercase opacity-60 block mb-1.5">
                          TECHNOLOGY
                        </span>
                        <div className="inline-block px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/10 dark:bg-white/10 border border-current">
                          BREATHABLE PERFORMANCE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* You Might Also Consider (Related Products) */}
                  <div className="pt-8 border-t border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold tracking-tight">You might also consider.</h3>
                      <span onClick={() => onNavigateToScreen?.(2)} className="text-[10px] font-semibold opacity-60 hover:opacity-100 cursor-pointer">
                        View all →
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tmpl.products.slice(0, 4).map((rp: any, idx: number) => (
                        <div
                          key={rp.id || idx}
                          onClick={() => onNavigateToScreen?.(3)}
                          className="group cursor-pointer rounded-2xl p-2.5 transition duration-300 hover:-translate-y-1"
                          style={{
                            backgroundColor: theme.cardBg,
                            boxShadow: getClayCardShadow(),
                            borderRadius: `${theme.borderRadius}px`,
                          }}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono opacity-50 mb-1">
                            <span>{String(idx + 1).padStart(2, '0')}</span>
                          </div>
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-black/5 mb-2">
                            <img
                              src={rp.img}
                              alt={rp.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider opacity-60 block font-mono">{rp.category || 'FOOTWEAR'}</span>
                          <span className="text-[11px] font-bold block truncate">{rp.name}</span>
                          {rp.colorDots && rp.colorDots.length > 0 && (
                            <div className="flex items-center gap-1 my-1">
                              {rp.colorDots.map((c: string, ci: number) => (
                                <span
                                  key={ci}
                                  className="w-2 h-2 rounded-full border border-black/10"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-mono font-semibold">{rp.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter & Footer */}
                  <div className="pt-6 space-y-6">
                    <div className="p-6 rounded-2xl bg-black text-white space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-mono tracking-widest uppercase opacity-70 block">FIELD NOTES</span>
                          <h4 className="text-sm font-bold mt-1">New releases and quiet drops — no noise, once a month.</h4>
                        </div>
                        <div className="flex items-center gap-2 max-w-sm w-full">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white text-xs border border-white/20 placeholder:text-white/40 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
                            style={{ backgroundColor: tmpl.primaryColor }}
                          >
                            SUBSCRIBE →
                          </button>
                        </div>
                      </div>
                    </div>

                    <footer className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                        <div className="space-y-1.5 md:col-span-1">
                          <span className="font-bold text-xs uppercase tracking-wider block font-serif">{tmpl.brandName}</span>
                          <p className="text-[9.5px] opacity-70 leading-relaxed">
                            Outdoor essentials for hikers, weekend campers, and the long trail ahead. Designed in the alpine, tested on the ground.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SHOP</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Outerwear</div>
                            <div>Footwear</div>
                            <div>Packs</div>
                            <div>Tops</div>
                            <div>Accessories</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">EXPLORE</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Our Story</div>
                            <div>Journal</div>
                            <div>Technology</div>
                            <div>Sustainability</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SUPPORT</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Contact</div>
                            <div>Shipping</div>
                            <div>Returns</div>
                            <div>Size Guide</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 block">SOCIAL</span>
                          <div className="space-y-0.5 opacity-80 text-[9.5px]">
                            <div>Instagram</div>
                            <div>YouTube</div>
                            <div>Spotify</div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-60 text-[9px]">
                        <span>© 2026 {tmpl.brandName} Outdoor Co.</span>
                        <div className="flex gap-3">
                          <span>Privacy</span>
                          <span>Terms</span>
                          <span>Cookies</span>
                        </div>
                      </div>
                    </footer>
                  </div>
                </div>
              )}

              {/* ────────────────── SCREEN 4: CHECKOUT ────────────────── */}
              {screen.type === 'checkout' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div
                    className="p-4 rounded-2xl space-y-3"
                    style={{
                      backgroundColor: theme.cardBg,
                      boxShadow: getClayCardShadow(),
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    <span className="text-[11px] font-bold block">
                      Express Checkout ({tmpl.name})
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="py-2 rounded-xl bg-black text-white font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                        <span>Pay</span>
                      </button>
                      <button type="button" className="py-2 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                        <span>GPay</span>
                      </button>
                    </div>

                    <div className="space-y-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-[9.5px] opacity-70 block mb-0.5">Shipping Destination</span>
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 font-medium">
                          742 Evergreen Terrace, New York, NY 10001
                        </div>
                      </div>

                      <div>
                        <span className="text-[9.5px] opacity-70 block mb-0.5">Delivery Method</span>
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 font-medium flex justify-between">
                          <span>Express Tracked Courier</span>
                          <span className="font-bold text-emerald-600">FREE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-2xl space-y-3"
                    style={{
                      backgroundColor: theme.cardBg,
                      boxShadow: getClayCardShadow(),
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    <span className="text-[11px] font-bold block">Order Summary</span>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span>{tmpl.products[0]?.name || 'Item 1'}</span>
                        <span className="font-mono font-bold">{tmpl.products[0]?.price || '$199.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{tmpl.products[1]?.name || 'Item 2'}</span>
                        <span className="font-mono font-bold">{tmpl.products[1]?.price || '$149.00'}</span>
                      </div>
                      <div className="pt-2 border-t border-black/10 dark:border-white/10 flex justify-between font-bold text-sm">
                        <span>Total Due</span>
                        <span className="font-mono">$348.00</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className="w-full py-3 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                      style={{
                        backgroundColor: tmpl.primaryColor,
                        boxShadow: getClayPillShadow(),
                      }}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Order Confirmed & Live Tracking Started!</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Place Order • $348.00</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────── SCREEN 5: BRAND STORY ────────────────── */}
              {screen.type === 'privacy' && (
                <div className="space-y-5">
                  <div className="text-center max-w-lg mx-auto space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tmpl.primaryColor }}>
                      {tmpl.story.badge}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight">
                      {tmpl.story.title}
                    </h2>
                    <p className="text-xs opacity-70">
                      {tmpl.story.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tmpl.story.pillars.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl space-y-2"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold">{p.title}</h3>
                        <p className="text-[10.5px] opacity-70 leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ────────────────── SCREEN 6: REVIEWS ────────────────── */}
              {screen.type === 'aura' && (
                <div className="space-y-4">
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tmpl.primaryColor }}>
                      Social Proof & Trust
                    </span>
                    <h2 className="text-lg font-bold">{tmpl.reviews.trustScore}</h2>
                    <p className="text-xs opacity-70">{tmpl.reviews.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tmpl.reviews.items.map((rev, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl space-y-2"
                        style={{
                          backgroundColor: theme.cardBg,
                          boxShadow: getClayCardShadow(),
                          borderRadius: `${theme.borderRadius}px`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{rev.name}</span>
                          <span className="text-[10px] opacity-60 font-mono">{rev.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                          {'★'.repeat(rev.rating)}
                        </div>
                        <p className="text-[11px] font-medium">{rev.title}</p>
                        <p className="text-[10px] opacity-70 leading-relaxed">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ────────────────── SCREEN 7: INTERACTIVE EXPERIENCE ────────────────── */}
              {screen.type === 'tryon' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div
                    className="w-full h-72 rounded-3xl relative overflow-hidden select-none border border-white/40"
                    style={{
                      boxShadow: getClayInsetShadow(),
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                    onMouseMove={(e) => {
                      if (isDraggingSlider) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                        setSliderPos(Math.round((x / rect.width) * 100));
                      }
                    }}
                    onMouseUp={() => setIsDraggingSlider(false)}
                    onMouseLeave={() => setIsDraggingSlider(false)}
                  >
                    <img
                      src={tmpl.hero.image}
                      alt="Product View"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div
                      className="absolute inset-y-0 right-0 overflow-hidden"
                      style={{ width: `${100 - sliderPos}%` }}
                    >
                      <img
                        src={tmpl.products[1]?.img || tmpl.hero.image}
                        alt="Alternative Look"
                        className="absolute inset-y-0 right-0 max-w-none h-full object-cover"
                        style={{ width: '420px' }}
                      />
                    </div>

                    <div
                      className="absolute inset-y-0 w-0.5 bg-white cursor-ew-resize z-20"
                      style={{ left: `${sliderPos}%` }}
                      onMouseDown={() => setIsDraggingSlider(true)}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-zinc-800 shadow-xl flex items-center justify-center text-[8px] font-bold">
                        ↔
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tmpl.primaryColor }}>
                      Interactive Showcase
                    </span>
                    <h2 className="text-xl font-bold">{tmpl.products[0]?.name}</h2>
                    <p className="text-xs opacity-70">
                      Drag the comparison slider to experience dynamic finishes and tactile craft.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigateToScreen?.(4)}
                      className="w-full py-3 rounded-full text-xs font-bold text-white shadow-md cursor-pointer"
                      style={{ backgroundColor: tmpl.primaryColor }}
                    >
                      Instant Purchase • {tmpl.products[0]?.price}
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────── SCREEN 8: ORDER CONFIRMED ────────────────── */}
              {screen.type === 'scanner' && (
                <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Order Confirmed!</h2>
                    <p className="text-xs opacity-70 mt-1">
                      Your order with {tmpl.brandName} has been received and is being prepared for express delivery.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-xs flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-bold text-emerald-600">TRK-8492049</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToScreen?.(1)}
                    className="w-full py-2.5 rounded-full text-xs font-bold text-white cursor-pointer"
                    style={{ backgroundColor: tmpl.primaryColor }}
                  >
                    Return to Storefront
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEWPORT: MOBILE SMARTPHONE RENDERER (Clean, Real Template Storefront)
  // =========================================================================
  return (
    <div
      onClick={onSelect}
      className={`relative select-none transition-all duration-200 cursor-pointer ${
        isActive ? 'ring-3 ring-sky-500 ring-offset-4 ring-offset-slate-100 rounded-[40px]' : ''
      }`}
      style={{
        width: customWidth || '320px',
        height: customHeight || '670px',
        transformOrigin: 'top center',
      }}
    >
      {/* Device Chassis (Realistic iPhone Frame) */}
      <div
        className="w-full h-full rounded-[38px] p-2.5 relative flex flex-col overflow-hidden shadow-2xl transition-all"
        style={{
          backgroundColor: theme.mode === 'dark' ? '#0F1014' : '#E8E4D8',
          boxShadow:
            theme.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.08)'
              : '0 25px 40px -10px rgba(130, 140, 115, 0.35), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {/* Device Screen Interior */}
        <div
          className="w-full h-full rounded-[30px] flex flex-col overflow-hidden relative"
          style={{
            backgroundColor: theme.canvasBg,
            color: theme.textColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {/* Status Bar */}
          <div className="h-6 px-4 pt-1 flex items-center justify-between text-[10px] font-semibold opacity-70 shrink-0 z-20">
            <span>9:41</span>
            <div className="w-16 h-3.5 bg-black/80 rounded-full mx-auto" />
            <div className="flex items-center gap-1">
              <span className="text-[9px]">5G</span>
              <div className="w-4 h-2 border border-current rounded-xs p-0.5 flex items-center">
                <div className="h-full w-full bg-current rounded-xs" />
              </div>
            </div>
          </div>

          {/* Screen Content Scrollable Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-3.5 space-y-3 interactive-screen-content">
            {/* ── SCREEN 1: MOBILE STOREFRONT HOME PAGE (/) ── */}
            {screen.type === 'welcome' && (
              <div className="space-y-3 pb-2">
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs uppercase tracking-wider font-serif">
                      {tmpl.brandName}
                    </span>
                  </div>
                  <div
                    onClick={() => onNavigateToScreen?.(4)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white cursor-pointer shadow-xs"
                    style={{ backgroundColor: tmpl.primaryColor }}
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </div>
                </div>

                {/* Hero Card */}
                <div
                  className="p-3.5 rounded-2xl relative overflow-hidden group space-y-2.5"
                  style={{
                    backgroundColor: theme.cardBg,
                    boxShadow: getClayCardShadow(),
                    borderRadius: `${theme.borderRadius}px`,
                  }}
                >
                  <div className="w-full h-36 rounded-xl overflow-hidden relative bg-black/5">
                    <img
                      src={tmpl.hero.image}
                      alt={tmpl.hero.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/70 text-white text-[8px] font-mono">
                      {tmpl.badge}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-sm font-bold leading-snug">{tmpl.hero.title}</h1>
                    <p className="text-[10px] opacity-70 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.hero.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToScreen?.(2)}
                    className="w-full py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition"
                    style={{
                      backgroundColor: tmpl.primaryColor,
                      boxShadow: getClayPillShadow(),
                    }}
                  >
                    <span>{tmpl.hero.ctaPrimary}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {tmpl.categories.map((c, i) => (
                    <span
                      key={c}
                      onClick={() => onNavigateToScreen?.(2)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap cursor-pointer ${
                        i === 0 ? 'text-white' : 'bg-black/5 dark:bg-white/5 opacity-70'
                      }`}
                      style={i === 0 ? { backgroundColor: tmpl.primaryColor } : {}}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* 2x2 Product Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {catalogItems.slice(0, 4).map((p: any, idx: number) => (
                    <div
                      key={p.id || idx}
                      onClick={() => onNavigateToScreen?.(3)}
                      className="p-2 rounded-2xl flex flex-col justify-between group overflow-hidden cursor-pointer"
                      style={{
                        backgroundColor: theme.cardBg,
                        boxShadow: getClayCardShadow(),
                        borderRadius: `${theme.borderRadius}px`,
                      }}
                    >
                      <div className="w-full h-24 rounded-xl overflow-hidden relative mb-1.5 bg-black/5">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/70 backdrop-blur-xs text-zinc-800 hover:text-red-500"
                        >
                          <Heart className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold block truncate">{p.name}</span>
                        {p.colorDots && p.colorDots.length > 0 && (
                          <div className="flex items-center gap-1 my-1">
                            {p.colorDots.map((c: string, ci: number) => (
                              <span
                                key={ci}
                                className="w-2 h-2 rounded-full border border-black/10"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-mono font-semibold">{p.price}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToScreen?.(3);
                            }}
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white transition active:scale-95 cursor-pointer shadow-xs"
                            style={{ backgroundColor: tmpl.primaryColor }}
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SCREEN 2: MOBILE CATALOG (/products) ── */}
            {screen.type === 'catalog' && (
              <div className="space-y-2.5 pb-2">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[8.5px] uppercase font-mono tracking-wider opacity-60">SHOP / ALL</span>
                    <h2 className="text-sm font-bold tracking-tight">
                      {tmpl.slug === 'northvale' ? 'Field-tested essentials, quietly organized.' : tmpl.name}
                    </h2>
                  </div>
                  <span className="text-[9px] font-mono opacity-60">{displayCatalogItems.length} items</span>
                </div>

                {/* Mobile Filter Scroll */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {['All', ...tmpl.categories].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCatalogCategory(cat)}
                      className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold whitespace-nowrap ${
                        selectedCatalogCategory === cat
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                          : 'bg-black/5 dark:bg-white/5 opacity-70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {displayCatalogItems.map((p: any, idx: number) => (
                    <div
                      key={p.id || idx}
                      onClick={() => onNavigateToScreen?.(3)}
                      className="p-2 rounded-2xl flex flex-col justify-between group overflow-hidden cursor-pointer"
                      style={{
                        backgroundColor: theme.cardBg,
                        boxShadow: getClayCardShadow(),
                        borderRadius: `${theme.borderRadius}px`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[8px] font-mono opacity-50 mb-0.5">
                          <span>{String(idx + 1).padStart(2, '0')}</span>
                          <span className="uppercase">{p.category || 'FOOTWEAR'}</span>
                        </div>
                        <div className="w-full h-24 rounded-xl overflow-hidden relative mb-1.5 bg-black/5">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          />
                        </div>
                        <span className="text-[10px] font-bold block truncate">{p.name}</span>
                      </div>

                      <div className="mt-1">
                        {p.colorDots && p.colorDots.length > 0 && (
                          <div className="flex items-center gap-1 mb-1">
                            {p.colorDots.map((c: string, ci: number) => (
                              <span
                                key={ci}
                                className="w-1.5 h-1.5 rounded-full border border-black/10"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold">{p.price}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToScreen?.(3);
                            }}
                            className="px-2 py-0.5 rounded-full text-[8.5px] font-bold text-white transition active:scale-95 cursor-pointer"
                            style={{ backgroundColor: tmpl.primaryColor }}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SCREEN 3: MOBILE PRODUCT DETAILS (PDP) ── */}
            {screen.type === 'questionnaire' && (
              <div className="space-y-3 pb-2">
                <div className="flex items-center gap-1 text-[8.5px] font-mono uppercase opacity-60">
                  <span onClick={() => onNavigateToScreen?.(2)} className="cursor-pointer">SHOP</span>
                  <span>/</span>
                  <span>FOOTWEAR</span>
                </div>

                <div className="w-full h-44 rounded-2xl overflow-hidden bg-white dark:bg-black/30 p-2 flex items-center justify-center border border-black/5">
                  <img
                    src={tmpl.pdp.images[0] || tmpl.hero.image}
                    alt={tmpl.pdp.featuredProduct}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                <div>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider opacity-60 block">
                    FOOTWEAR
                  </span>
                  <h2 className="text-sm font-bold mt-0.5">{tmpl.pdp.featuredProduct}</h2>
                  <p className="text-[10px] opacity-70">Lightweight fast-hike shoe</p>
                  <div className="mt-1 text-sm font-mono font-bold">
                    {tmpl.pdp.price}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[9px] font-semibold opacity-70">
                    COLOR: <span className="font-bold opacity-100">{selectedColor}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {(tmpl.pdp.colors || [
                      { name: 'Clay', hex: '#C05621' },
                      { name: 'Sand', hex: '#D5CEBF' },
                    ]).map((col) => {
                      const isColActive = selectedColor === col.name;
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setSelectedColor(col.name)}
                          className={`w-5 h-5 rounded-full transition cursor-pointer relative ${
                            isColActive ? 'ring-2 ring-black dark:ring-white ring-offset-1' : ''
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="font-semibold opacity-70">SIZE</span>
                    <span className="underline opacity-60">Size guide</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(tmpl.pdp.sizes || ['7', '8', '9', '10', '11', '12']).map((sz) => {
                      const isSzActive = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`w-7 h-7 rounded-md text-[9px] font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                            isSzActive
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 opacity-70'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Counter & Terracotta Button */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center border border-black/15 dark:border-white/15 rounded-full px-2 py-1 bg-black/5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-1 font-bold"
                    >
                      —
                    </button>
                    <span className="mx-1.5 font-mono font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-1 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToScreen?.(4)}
                    className="flex-1 py-2 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition"
                    style={{
                      backgroundColor: tmpl.primaryColor,
                      boxShadow: getClayPillShadow(),
                    }}
                  >
                    <span>Add to Bag - {tmpl.pdp.price.replace('.00', '')}</span>
                  </button>
                </div>

                <div className="text-[8.5px] opacity-60 text-center font-mono">
                  Free shipping over $150 · 30-day returns
                </div>

                {/* Specs Box */}
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1.5 text-[9.5px]">
                  <span className="font-bold block uppercase tracking-wider text-[8.5px] opacity-60">Specs & Story</span>
                  <p className="opacity-70 leading-relaxed">
                    Fast, breathable, honest — for long trail days when weight matters. 260g ultralight mesh upper with EVA cushion.
                  </p>
                </div>
              </div>
            )}

            {/* ── SCREEN 4: MOBILE CHECKOUT ── */}
            {screen.type === 'checkout' && (
              <div className="space-y-2.5">
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tmpl.primaryColor }}>
                    Final Step
                  </span>
                  <h2 className="text-sm font-bold tracking-tight">Express Checkout</h2>
                </div>

                <div
                  className="p-3 rounded-2xl space-y-2"
                  style={{
                    backgroundColor: theme.cardBg,
                    boxShadow: getClayCardShadow(),
                    borderRadius: `${theme.borderRadius}px`,
                  }}
                >
                  <span className="text-[10px] font-bold block">Selected Items (2)</span>
                  <div className="flex items-center justify-between text-xs">
                    <span>{tmpl.products[0]?.name || 'Item 1'}</span>
                    <span className="font-mono font-bold">{tmpl.products[0]?.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>{tmpl.products[1]?.name || 'Item 2'}</span>
                    <span className="font-mono font-bold">{tmpl.products[1]?.price}</span>
                  </div>
                  <div className="pt-1.5 border-t border-black/10 flex justify-between font-bold text-xs">
                    <span>Total Due</span>
                    <span className="font-mono text-emerald-600">$348.00</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className="w-full py-3 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition"
                    style={{
                      backgroundColor: tmpl.primaryColor,
                      boxShadow: getClayPillShadow(),
                    }}
                  >
                    {isPaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Order Confirmed!</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay $348.00 with Face ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── SCREEN 5: MOBILE BRAND STORY ── */}
            {screen.type === 'privacy' && (
              <div className="space-y-3">
                <div className="text-center pt-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: tmpl.primaryColor }}>
                    {tmpl.story.badge}
                  </span>
                  <h2 className="text-sm font-bold tracking-tight mt-0.5">{tmpl.story.title}</h2>
                  <p className="text-[10px] opacity-70 px-2 mt-1 leading-snug">
                    {tmpl.story.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {tmpl.story.pillars.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl flex items-start gap-2"
                      style={{
                        backgroundColor: theme.cardBg,
                        boxShadow: getClayCardShadow(),
                        borderRadius: `${theme.borderRadius}px`,
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold block">{p.title}</span>
                        <span className="text-[9px] opacity-70">{p.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToScreen?.(2)}
                    className="w-full py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    style={{
                      backgroundColor: tmpl.primaryColor,
                      boxShadow: getClayPillShadow(),
                    }}
                  >
                    <span>Shop All Pieces</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── SCREEN 6: MOBILE REVIEWS & SOCIAL PROOF ── */}
            {screen.type === 'aura' && (
              <div className="space-y-3">
                <div className="text-center pt-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: tmpl.primaryColor }}>
                    Verified Buyer Proof
                  </span>
                  <h2 className="text-sm font-bold tracking-tight">{tmpl.reviews.trustScore}</h2>
                  <p className="text-[9.5px] opacity-70">{tmpl.reviews.summary}</p>
                </div>

                <div className="space-y-2">
                  {tmpl.reviews.items.map((rev, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-2xl space-y-1"
                      style={{
                        backgroundColor: theme.cardBg,
                        boxShadow: getClayCardShadow(),
                        borderRadius: `${theme.borderRadius}px`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px]">{rev.name}</span>
                        <span className="text-[8.5px] opacity-60 font-mono">{rev.location}</span>
                      </div>
                      <div className="text-amber-500 text-[9px]">{'★'.repeat(rev.rating)}</div>
                      <p className="text-[9.5px] font-medium">{rev.title}</p>
                      <p className="text-[9px] opacity-70 leading-snug">{rev.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SCREEN 7: MOBILE INTERACTIVE SLIDER ── */}
            {screen.type === 'tryon' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tmpl.primaryColor }}>
                    Interactive Studio
                  </span>
                  <span className="text-[9px] font-mono opacity-70">Before / After</span>
                </div>

                <div
                  className="w-full h-64 rounded-3xl relative overflow-hidden select-none border border-white/40"
                  style={{
                    boxShadow: getClayInsetShadow(),
                    borderRadius: `${theme.borderRadius}px`,
                  }}
                  onMouseMove={(e) => {
                    if (isDraggingSlider) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      setSliderPos(Math.round((x / rect.width) * 100));
                    }
                  }}
                  onMouseUp={() => setIsDraggingSlider(false)}
                  onMouseLeave={() => setIsDraggingSlider(false)}
                >
                  <img
                    src={tmpl.hero.image}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <div
                    className="absolute inset-y-0 right-0 overflow-hidden"
                    style={{ width: `${100 - sliderPos}%` }}
                  >
                    <img
                      src={tmpl.products[1]?.img || tmpl.hero.image}
                      alt="Overlay"
                      className="absolute inset-y-0 right-0 max-w-none h-full object-cover"
                      style={{ width: '310px' }}
                    />
                  </div>

                  <div
                    className="absolute inset-y-0 w-0.5 bg-white cursor-ew-resize z-20"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={() => setIsDraggingSlider(true)}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white text-zinc-800 shadow-lg flex items-center justify-center text-[7px] font-bold">
                      ↔
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToScreen?.(4)}
                    className="w-full py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    style={{
                      backgroundColor: tmpl.primaryColor,
                      boxShadow: getClayPillShadow(),
                    }}
                  >
                    <span>Instant Purchase • {tmpl.products[0]?.price}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── SCREEN 8: MOBILE ORDER SUCCESS ── */}
            {screen.type === 'scanner' && (
              <div className="p-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Order Confirmed!</h2>
                  <p className="text-[10px] opacity-70 mt-0.5">
                    Your {tmpl.brandName} order has been processed.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-[10px] flex justify-between">
                  <span>Track ID:</span>
                  <span className="font-bold text-emerald-600">TRK-8492049</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToScreen?.(1)}
                  className="w-full py-2 rounded-full text-xs font-bold text-white cursor-pointer"
                  style={{ backgroundColor: tmpl.primaryColor }}
                >
                  Return to Store
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { StoreTemplate, ThemeConfigData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Palette,
  Layout,
  Type,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Eye,
  Check,
  Save,
  RefreshCw,
  Sliders,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  X,
  CreditCard,
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Mail,
  Share2,
  Star,
  Zap,
  Filter,
  Tag,
  ExternalLink,
  Layers,
  Heart,
  Truck,
  ShoppingBag,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import DragDropUpload from '@/src/components/ui/DragDropUpload';

const PRESET_PALETTES = [
  { name: 'Royal Indigo', primary: '#4F46E5', secondary: '#64748B', background: '#FFFFFF', text: '#0F172A', accent: '#EC4899' },
  { name: 'Midnight Cyber', primary: '#3B82F6', secondary: '#94A3B8', background: '#0F172A', text: '#F8FAFC', accent: '#8B5CF6' },
  { name: 'Emerald Botanical', primary: '#059669', secondary: '#64748B', background: '#F0FDF4', text: '#064E3B', accent: '#F59E0B' },
  { name: 'Sunset Coral', primary: '#F97316', secondary: '#64748B', background: '#FFF7ED', text: '#431407', accent: '#EC4899' },
  { name: 'Luxury Noir', primary: '#18181B', secondary: '#71717A', background: '#FAFAFA', text: '#09090B', accent: '#D97706' },
];

interface TemplateMockData {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;
  categories: { name: string; count: string; image: string }[];
  products: {
    name: string;
    price: string;
    originalPrice?: string;
    rating: number;
    reviews: number;
    badge?: string;
    image: string;
    category: string;
  }[];
  lookbookTitle: string;
  lookbookDesc: string;
  lookbookImage: string;
}

const TEMPLATE_MOCK_DATA: Record<string, TemplateMockData> = {
  funo: {
    heroTitle: 'Furniture for Mindful, Calm Living',
    heroSubtitle: 'Contemporary Scandinavian silhouettes crafted from solid European oak, natural bouclé, and artisanal ceramics.',
    heroBadge: '✨ Spring 2026 Collection Drop',
    heroImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Living Room', count: '32 Items', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80' },
      { name: 'Bedroom Suites', count: '18 Items', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=300&q=80' },
      { name: 'Dining Tables', count: '24 Items', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=80' },
      { name: 'Lighting & Decor', count: '40 Items', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'Oslo Minimalist Lounge Armchair', price: '$480.00', originalPrice: '$540.00', rating: 4.9, reviews: 142, badge: 'Popular', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=80', category: 'Living' },
      { name: 'Stockholm Solid Oak Dining Table', price: '$890.00', rating: 5.0, reviews: 88, badge: 'Solid FSC', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=80', category: 'Dining' },
      { name: 'Kobenhavn Pendant Chandelier', price: '$260.00', rating: 4.8, reviews: 65, badge: 'New', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=500&q=80', category: 'Lighting' },
      { name: 'Malmo Boucle Cushion Lounge Chair', price: '$620.00', originalPrice: '$700.00', rating: 4.9, reviews: 97, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80', category: 'Living' },
    ],
    lookbookTitle: 'Crafted by Master Joiners in Småland',
    lookbookDesc: 'Every dining surface and armchair is shaped by hand using traditional mortise-and-tenon joints and organic beeswax.',
    lookbookImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  funie: {
    heroTitle: 'Furniture for Mindful, Calm Living',
    heroSubtitle: 'Contemporary Scandinavian silhouettes crafted from solid European oak, natural bouclé, and artisanal ceramics.',
    heroBadge: '✨ Spring 2026 Collection Drop',
    heroImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Living Room', count: '32 Items', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80' },
      { name: 'Bedroom Suites', count: '18 Items', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=300&q=80' },
      { name: 'Dining Tables', count: '24 Items', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=80' },
      { name: 'Lighting & Decor', count: '40 Items', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'Oslo Minimalist Lounge Armchair', price: '$480.00', originalPrice: '$540.00', rating: 4.9, reviews: 142, badge: 'Popular', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=80', category: 'Living' },
      { name: 'Stockholm Solid Oak Dining Table', price: '$890.00', rating: 5.0, reviews: 88, badge: 'Solid FSC', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=80', category: 'Dining' },
      { name: 'Kobenhavn Pendant Chandelier', price: '$260.00', rating: 4.8, reviews: 65, badge: 'New', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=500&q=80', category: 'Lighting' },
      { name: 'Malmo Boucle Cushion Lounge Chair', price: '$620.00', originalPrice: '$700.00', rating: 4.9, reviews: 97, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80', category: 'Living' },
    ],
    lookbookTitle: 'Crafted by Master Joiners in Småland',
    lookbookDesc: 'Every dining surface and armchair is shaped by hand using traditional mortise-and-tenon joints and organic beeswax.',
    lookbookImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  'nova-tech': {
    heroTitle: 'Engineered for Peak Performance',
    heroSubtitle: 'Next-generation audio, wearables, and precision hardware crafted with aerospace-grade materials.',
    heroBadge: '⚡ New Cyber Drop 2026',
    heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Spatial Audio', count: '18 Products', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Wearables', count: '12 Products', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80' },
      { name: 'Keyboards', count: '9 Products', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80' },
      { name: 'Optics & Drones', count: '14 Products', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'AeroPulse Spatial Headphones', price: '$299.00', originalPrice: '$349.00', rating: 4.9, reviews: 184, badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80', category: 'Audio' },
      { name: 'Titanium OLED Smart Chrono', price: '$449.00', rating: 4.8, reviews: 92, badge: 'New', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80', category: 'Wearables' },
      { name: 'CyberBlade Mechanical Deck', price: '$189.00', originalPrice: '$219.00', rating: 5.0, reviews: 67, badge: 'Hot', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80', category: 'Accessories' },
      { name: '4K Ultra-Gimbal Drone', price: '$799.00', rating: 4.7, reviews: 43, image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=500&q=80', category: 'Optics' },
    ],
    lookbookTitle: 'Precision Audio Lab Edition',
    lookbookDesc: '40mm custom graphene dynamic drivers with ultra-low latency wireless lossless transmission.',
    lookbookImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  },
  'velvet-luxury': {
    heroTitle: 'Haute Couture & Timeless Opulence',
    heroSubtitle: 'Curated editorial collections crafted from fine silks, cashmere, and hand-finished Italian leather.',
    heroBadge: '✨ Maison Autumn Lookbook',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Evening Wear', count: '24 Designs', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=300&q=80' },
      { name: 'Leather Goods', count: '16 Designs', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80' },
      { name: 'Fine Jewelry', count: '31 Designs', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80' },
      { name: 'Footwear', count: '12 Designs', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'Silk Charmeuse Evening Gown', price: '$890.00', rating: 5.0, reviews: 28, badge: 'Exclusive', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=500&q=80', category: 'Couture' },
      { name: 'Milano Tuscan Calfskin Handbag', price: '$1,250.00', rating: 4.9, reviews: 45, badge: 'Limited', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80', category: 'Leather' },
      { name: '18k Rose Gold Diamond Choker', price: '$2,400.00', rating: 5.0, reviews: 14, badge: 'Rare', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80', category: 'Jewelry' },
      { name: 'Handcrafted Satin Stiletto', price: '$680.00', originalPrice: '$750.00', rating: 4.8, reviews: 19, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80', category: 'Shoes' },
    ],
    lookbookTitle: 'The Autumn Solstice Editorial',
    lookbookDesc: 'Indulge in silhouettes cut with architectural precision and draped in luminous emerald and midnight hues.',
    lookbookImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  'artisan-craft': {
    heroTitle: 'Handmade Objects for Mindful Living',
    heroSubtitle: 'Ethically sourced ceramics, small-batch roast coffee, and natural botanical home essentials.',
    heroBadge: '🌿 100% Sustainable & Handcrafted',
    heroImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Studio Ceramics', count: '32 Items', image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Single Origin Coffee', count: '14 Blends', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Linen & Weaves', count: '19 Items', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80' },
      { name: 'Botanical Scents', count: '11 Items', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'Terra Glazed Pour-Over Dripper', price: '$48.00', rating: 4.9, reviews: 112, badge: 'Artisan Pick', image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=500&q=80', category: 'Kitchen' },
      { name: 'Yirgacheffe Heirloom Coffee Beans', price: '$24.00', rating: 4.8, reviews: 88, badge: 'Fresh Roast', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80', category: 'Pantry' },
      { name: 'Organic Washed Linen Throw', price: '$92.00', originalPrice: '$110.00', rating: 5.0, reviews: 34, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80', category: 'Home' },
      { name: 'Wild Cedar & Bergamot Candle', price: '$36.00', rating: 4.7, reviews: 59, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=80', category: 'Aromas' },
    ],
    lookbookTitle: 'Meet the Ceramicist: Studio Kiln',
    lookbookDesc: 'Every piece is thrown on the potter wheel in small batches using local stoneware clay and wood-fired ash glazes.',
    lookbookImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
  },
  'pulse-streetwear': {
    heroTitle: 'Drop 04 // Future Cyber City',
    heroSubtitle: 'Limited heavy-fleece hoodies, technical cargo vests, and experimental oversized apparel drops.',
    heroBadge: '🔥 Live Drop Countdown: 04:18:22',
    heroImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Graphic Hoodies', count: '15 Drops', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tech Cargos', count: '10 Drops', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80' },
      { name: 'Sneakers', count: '8 Drops', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80' },
      { name: 'Headwear', count: '12 Drops', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'Acid Washed Cyber Neon Hoodie', price: '$140.00', originalPrice: '$165.00', rating: 4.9, reviews: 204, badge: 'Selling Fast', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80', category: 'Hoodies' },
      { name: 'Modular Tactical Cargo Pants', price: '$175.00', rating: 4.8, reviews: 96, badge: 'Restock', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80', category: 'Bottoms' },
      { name: 'Velocity Runner X-Platform', price: '$220.00', rating: 5.0, reviews: 140, badge: 'Drop Exclusive', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&q=80', category: 'Kicks' },
      { name: 'Reflective Utility Crossbody Bag', price: '$65.00', rating: 4.7, reviews: 52, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80', category: 'Gear' },
    ],
    lookbookTitle: 'Tokyo Underground Night Session',
    lookbookDesc: 'Reflective 3M thermal fabrics engineered for motion, nightlife, and futuristic street styling.',
    lookbookImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
  'botanica-wellness': {
    heroTitle: 'Pure Botanical Active Skincare',
    heroSubtitle: 'Clean clinical formulations powered by certified organic superfoods, adaptogens, and marine peptides.',
    heroBadge: '🌸 100% Clean • Vegan • Cruelty-Free',
    heroImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80',
    categories: [
      { name: 'Facial Serums', count: '14 Products', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80' },
      { name: 'Barrier Creams', count: '9 Products', image: 'https://images.unsplash.com/photo-1608248597359-0027f917537b?auto=format&fit=crop&w=300&q=80' },
      { name: 'Clarifying Toners', count: '8 Products', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80' },
      { name: 'Glow Oils', count: '6 Products', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=300&q=80' },
    ],
    products: [
      { name: 'Triple Peptide Barrier Hydra-Serum', price: '$68.00', originalPrice: '$78.00', rating: 4.9, reviews: 310, badge: 'Award Winner', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80', category: 'Serums' },
      { name: 'Cloud Ceramide Recovery Cream', price: '$54.00', rating: 4.9, reviews: 180, badge: 'Dermatologist Loved', image: 'https://images.unsplash.com/photo-1608248597359-0027f917537b?auto=format&fit=crop&w=500&q=80', category: 'Moisturizers' },
      { name: 'Rose & Willow Bark Clarifying Mist', price: '$38.00', rating: 4.8, reviews: 95, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80', category: 'Toners' },
      { name: 'Golden Squalane Botanical Face Oil', price: '$72.00', rating: 5.0, reviews: 128, badge: 'Glow Favorite', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=500&q=80', category: 'Oils' },
    ],
    lookbookTitle: 'The 4-Step Radiant Ritual',
    lookbookDesc: 'Clinically proven to boost skin moisture by 84% in 14 days without synthetic fragrance or silicones.',
    lookbookImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  },
};

const normalizeFontValue = (val: string | undefined | null, defaultVal: string) => {
  if (!val) return defaultVal;
  const clean = val.split(',')[0].trim().replace(/^['"]+|['"]+$/g, '');
  return clean || defaultVal;
};

export const ThemeManager: React.FC = () => {
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfigData | null>(null);
  const [initialConfig, setInitialConfig] = useState<ThemeConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewPage, setPreviewPage] = useState<'home' | 'plp' | 'pdp' | 'cart'>('home');
  const [activeTab, setActiveTab] = useState<'templates' | 'colors' | 'typography' | 'headerFooter'>('templates');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [livePreviewTemplate, setLivePreviewTemplate] = useState<StoreTemplate | null>(null);
  const [livePreviewPage, setLivePreviewPage] = useState<'/' | '/products' | '/cart'>('/');
  const [liveViewport, setLiveViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  useEffect(() => {
    loadData();

    // Dynamically preload Google fonts for Theme Studio live preview
    const fontFamilies = [
      'Inter:wght@300;400;600;700;900',
      'Outfit:wght@300;400;600;700;900',
      'Playfair+Display:wght@400;600;700;900',
      'Plus+Jakarta+Sans:wght@300;400;600;700;800',
      'Space+Grotesk:wght@400;600;700',
      'Cinzel:wght@400;600;700;900',
      'Roboto:wght@300;400;500;700',
      'DM+Sans:wght@400;500;700',
      'Lora:wght@400;600;700',
    ].join('&family=');

    const linkId = 'theme-studio-google-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
      document.head.appendChild(link);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tmplList, themeData] = await Promise.all([
        cmsService.getStoreTemplates(),
        cmsService.getStoreTheme(),
      ]);
      setTemplates(tmplList);
      setThemeConfig(themeData);
      setInitialConfig(themeData);
    } catch (err) {
      console.error('Failed to load theme data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfigChange = (field: keyof ThemeConfigData, value: any) => {
    if (!themeConfig) return;
    setThemeConfig({ ...themeConfig, [field]: value });
  };

  const handleSaveTheme = async () => {
    if (!themeConfig) return;
    setIsSaving(true);
    try {
      const updated = await cmsService.updateStoreTheme(themeConfig);
      setThemeConfig(updated);
      setInitialConfig(updated);
      showToast('Theme configuration saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save theme settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishTemplate = async (slug: string) => {
    setPublishingSlug(slug);
    try {
      await cmsService.publishTemplate(slug);
      handleConfigChange('activeTemplateSlug', slug);
      showToast(`Template "${slug}" published as active store theme!`, 'success');
    } catch (err) {
      showToast('Failed to publish template.', 'error');
    } finally {
      setPublishingSlug(null);
    }
  };

  const handleApplyPreset = (palette: (typeof PRESET_PALETTES)[0]) => {
    if (!themeConfig) return;
    setThemeConfig({
      ...themeConfig,
      themePrimaryColor: palette.primary,
      themeSecondaryColor: palette.secondary,
      themeBackgroundColor: palette.background,
      themeTextColor: palette.text,
      themeAccentColor: palette.accent,
    });
    showToast(`Applied "${palette.name}" color scheme preset!`, 'success');
  };

  if (isLoading || !themeConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Theme & Template Studio...</span>
      </div>
    );
  }

  const isDirty = JSON.stringify(themeConfig) !== JSON.stringify(initialConfig);
  const activeTemplate = templates.find((t) => t.slug === themeConfig.activeTemplateSlug || t.id === themeConfig.activeTemplateSlug) || templates[0];

  const renderTemplateLivePreview = (tmpl: StoreTemplate, config: ThemeConfigData, page: 'home' | 'plp' | 'pdp' | 'cart') => {
    const slugKey = tmpl.slug || 'nova-tech';
    const mock = TEMPLATE_MOCK_DATA[slugKey] || TEMPLATE_MOCK_DATA['nova-tech'];
    const primaryColor = config.themePrimaryColor || tmpl.accentColor || '#4F46E5';
    const accentColor = config.themeAccentColor || '#EC4899';
    const borderRadius =
      config.themeBorderRadius === 'none'
        ? '0px'
        : config.themeBorderRadius === 'full'
          ? '9999px'
          : '14px';

    return (
      <div
        className="min-h-full flex flex-col justify-between text-slate-900 transition-colors duration-200"
        style={{
          backgroundColor: config.themeBackgroundColor || '#FAFAFA',
          backgroundImage: config.themeBackgroundImage ? `url('${config.themeBackgroundImage}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: config.themeTextColor || '#0F172A',
          fontFamily: config.themeBodyFont || 'Inter, sans-serif',
        }}
      >
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          {config.headerAnnouncement && (
            <div
              className="py-1.5 px-4 text-center text-[11px] font-extrabold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{config.headerAnnouncement}</span>
              <span className="opacity-75">| Free returns in 30 days</span>
            </div>
          )}
          <div className="px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {tmpl.name.charAt(0)}
              </div>
              <div>
                <span
                  className="font-black text-lg tracking-tight block leading-tight"
                  style={{ fontFamily: config.themeHeadingFont || 'Inter, sans-serif', color: primaryColor }}
                >
                  {tmpl.name.split(' ')[0]} Store
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{tmpl.tagline}</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setPreviewPage('home')}
                className={`transition-colors hover:text-indigo-600 ${page === 'home' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : ''}`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage('plp')}
                className={`transition-colors hover:text-indigo-600 ${page === 'plp' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : ''}`}
              >
                Catalog & Drops
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage('pdp')}
                className={`transition-colors hover:text-indigo-600 ${page === 'pdp' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : ''}`}
              >
                Featured Product
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage('cart')}
                className={`transition-colors hover:text-indigo-600 ${page === 'cart' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : ''}`}
              >
                Cart & Taxes
              </button>
            </nav>
            <div className="flex items-center gap-3">
              {config.headerShowSearch && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Search products...</span>
                </div>
              )}
              {config.headerShowCurrency && (
                <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                  USD ($)
                </span>
              )}
              <button
                type="button"
                onClick={() => setPreviewPage('cart')}
                className="px-3.5 py-1.5 text-white flex items-center gap-1.5 text-xs font-bold shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: primaryColor, borderRadius }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Bag (2)</span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {page === 'home' && (
            <div className="space-y-10 pb-12">
              <div className="relative overflow-hidden rounded-3xl mx-6 mt-6 min-h-[380px] flex items-center shadow-xl">
                <img
                  src={mock.heroImage}
                  alt={tmpl.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
                <div className="relative z-10 p-8 sm:p-12 max-w-xl text-white space-y-4">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-block shadow-sm"
                    style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
                  >
                    {mock.heroBadge}
                  </span>
                  <h1
                    className="text-2xl sm:text-4xl font-black tracking-tight leading-tight"
                    style={{ fontFamily: config.themeHeadingFont || 'Inter, sans-serif' }}
                  >
                    {mock.heroTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md">
                    {mock.heroSubtitle}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPage('plp')}
                      className="px-6 py-3 text-xs font-extrabold text-white shadow-lg transition-all flex items-center gap-2 hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: primaryColor, borderRadius }}
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPage('pdp')}
                      className="px-5 py-3 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm transition-all"
                      style={{ borderRadius }}
                    >
                      View Bestseller
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black" style={{ fontFamily: config.themeHeadingFont }}>
                    Featured Categories
                  </h2>
                  <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View All →</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mock.categories.map((cat, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewPage('plp')}
                      className="group cursor-pointer p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-400 bg-white shadow-xs hover:shadow-md transition-all space-y-2"
                      style={{ borderRadius }}
                    >
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-100 relative">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{cat.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black" style={{ fontFamily: config.themeHeadingFont }}>
                      Trending Arrivals
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Handpicked essentials ready for dispatch</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewPage('plp')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                  >
                    View All Products
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {mock.products.map((prod, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewPage('pdp')}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 hover:border-indigo-300 bg-white p-3 space-y-3 shadow-xs hover:shadow-lg transition-all"
                      style={{ borderRadius }}
                    >
                      <div className="h-44 rounded-xl overflow-hidden bg-slate-100 relative">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.badge && (
                          <span
                            className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
                            style={{ backgroundColor: accentColor }}
                          >
                            {prod.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPage('cart');
                          }}
                          className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 text-slate-800 shadow-md hover:bg-white transition-all active:scale-90"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{prod.category}</span>
                        <h3 className="text-xs font-black text-slate-800 group-hover:text-indigo-600 line-clamp-1">
                          {prod.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-slate-400 font-normal">({prod.reviews})</span>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-sm font-black" style={{ color: primaryColor }}>
                            {prod.price}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-xs text-slate-400 line-through font-semibold">{prod.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6">
                <div
                  className="rounded-3xl p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl overflow-hidden relative"
                  style={{ borderRadius }}
                >
                  <div className="space-y-3 max-w-md">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                      Editorial Story
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black" style={{ fontFamily: config.themeHeadingFont }}>
                      {mock.lookbookTitle}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{mock.lookbookDesc}</p>
                    <button
                      type="button"
                      onClick={() => setPreviewPage('pdp')}
                      className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition shadow-md"
                      style={{ borderRadius }}
                    >
                      Discover Story & Specs
                    </button>
                  </div>
                  <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-lg shrink-0">
                    <img src={mock.lookbookImage} alt="Lookbook" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {page === 'plp' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-black" style={{ fontFamily: config.themeHeadingFont }}>
                    Full Product Catalog
                  </h1>
                  <p className="text-xs text-slate-400">Showing all items curated for {tmpl.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filter: In Stock</span>
                  </div>
                  <select className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700">
                    <option>Sort: Bestselling</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {mock.products.concat(mock.products).map((prod, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewPage('pdp')}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-3 space-y-3 shadow-xs hover:shadow-lg transition-all"
                    style={{ borderRadius }}
                  >
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-100 relative">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {prod.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{prod.category}</span>
                      <h3 className="text-xs font-black text-slate-800 truncate">{prod.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black" style={{ color: primaryColor }}>{prod.price}</span>
                        {prod.originalPrice && <span className="text-xs text-slate-400 line-through">{prod.originalPrice}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'pdp' && (
            <div className="p-6 max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-3">
                  <div className="h-80 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                    <img src={mock.products[0].image} alt={mock.products[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[mock.products[0].image, mock.lookbookImage, mock.heroImage, mock.categories[0].image].map((img, i) => (
                      <div key={i} className="h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-500 transition">
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: accentColor }}>
                    {mock.products[0].badge || 'Trending Choice'}
                  </span>
                  <h1 className="text-2xl font-black leading-snug" style={{ fontFamily: config.themeHeadingFont }}>
                    {mock.products[0].name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span>4.9 / 5.0 (248 verified customer reviews)</span>
                  </div>
                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-2xl font-black" style={{ color: primaryColor }}>{mock.products[0].price}</span>
                    {mock.products[0].originalPrice && (
                      <span className="text-sm text-slate-400 line-through font-bold">{mock.products[0].originalPrice}</span>
                    )}
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Save 15% Today
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    Crafted with premium components engineered specifically for longevity and high performance. Features custom responsive ergonomics and universal compatibility.
                  </p>
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700">Select Edition:</span>
                    <div className="flex gap-2">
                      {['Midnight Matte', 'Obsidian Slate', 'Silver Frost'].map((v, i) => (
                        <button key={i} className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${i === 0 ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setPreviewPage('cart')}
                      className="flex-1 py-3.5 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: primaryColor, borderRadius }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag & Checkout</span>
                    </button>
                    <button type="button" className="p-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Free Express Shipping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-indigo-600" />
                      <span>30-Day Moneyback Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {page === 'cart' && (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <h1 className="text-xl font-black" style={{ fontFamily: config.themeHeadingFont }}>
                Shopping Bag & Tax Breakdown
              </h1>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  {mock.products.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4" style={{ borderRadius }}>
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800">{item.name}</h4>
                          <span className="text-[11px] font-bold" style={{ color: primaryColor }}>{item.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold">
                        <span>Qty: 1</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-200 bg-white shadow-lg space-y-4" style={{ borderRadius }}>
                  <h3 className="font-black text-sm text-slate-900">Order Summary</h3>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚡ Automatic Promo Active: Save $20.00</span>
                  </div>
                  <div className="space-y-2.5 text-xs divide-y divide-slate-100 pt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">$347.00</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold pt-2">
                      <span>Discount</span>
                      <span>-$20.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-2">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-2">
                      <span>Estimated Tax (18% GST)</span>
                      <span className="font-bold text-slate-900">+$58.86</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-3">
                      <span>Estimated Total</span>
                      <span style={{ color: primaryColor }}>$385.86</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-3.5 text-white font-black text-xs shadow-lg transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: primaryColor, borderRadius }}
                  >
                    Proceed to Secure Checkout →
                  </button>
                  <p className="text-[10px] text-center text-slate-400">🔒 256-Bit Encrypted Checkout</p>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer className="border-t border-slate-200/80 p-6 bg-slate-900 text-slate-300 space-y-4 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="font-bold text-white" style={{ fontFamily: config.themeHeadingFont }}>
              {tmpl.name} • Official Storefront
            </span>
            {config.footerShowSocial && (
              <div className="flex items-center gap-3 text-slate-400">
                <Share2 className="w-4 h-4 hover:text-white cursor-pointer transition" />
                <Mail className="w-4 h-4 hover:text-white cursor-pointer transition" />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-800 pt-3">
            <span>{config.footerCopyright || `© 2026 ${tmpl.name}. All rights reserved.`}</span>
            {config.footerShowPaymentBadges && (
              <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>VISA • MASTERCARD • RAZORPAY • STRIPE</span>
              </div>
            )}
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Multi-Template Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Theme: {activeTemplate?.name || 'Nova Tech'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Palette className="w-8 h-8 text-indigo-400" />
              <span>Theme Studio & Template Publisher</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Preview all storefront layout templates, test responsive viewports (Desktop, Tablet, Mobile), and customize color palettes, typography, and header/footer configurations in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isDirty && initialConfig && (
              <button
                type="button"
                onClick={() => setThemeConfig({ ...initialConfig })}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Theme Config</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-700/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'templates', label: '1. Select & Preview All Templates', icon: Layout },
            { id: 'colors', label: '2. Color Scheme', icon: Palette },
            { id: 'typography', label: '3. Typography & Fonts', icon: Type },
            { id: 'headerFooter', label: '4. Header & Footer Config', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                <Layout className="w-5 h-5 text-indigo-600" />
                <span>All Storefront Multi-Tenant Templates</span>
              </h2>
              <p className="text-xs text-slate-500">Click "Live Preview" on any template below to explore its responsive desktop, tablet, and mobile interface with sample catalog items.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
                {templates.length} Templates Ready
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tmpl) => {
              const isPublished = themeConfig.activeTemplateSlug === tmpl.slug || themeConfig.activeTemplateSlug === tmpl.id;
              const isPublishing = publishingSlug === tmpl.slug || publishingSlug === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white dark:bg-card ${
                    isPublished
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 shadow-xl'
                      : 'border-slate-200/80 dark:border-border hover:border-indigo-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-accent group">
                      <img src={tmpl.previewImage} alt={tmpl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {isPublished ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active Theme</span>
                          </span>
                        ) : tmpl.badge ? (
                          <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                            {tmpl.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-foreground">{tmpl.name}</h3>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{tmpl.tagline}</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{tmpl.description}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex items-center gap-2 border-t border-slate-100 dark:border-border mt-3">
                     <button
                      type="button"
                      onClick={() => {
                        setPreviewTemplate(tmpl);
                        setPreviewPage('home');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Mock Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLivePreviewTemplate(tmpl);
                        setLivePreviewPage('/');
                        setLiveViewport('desktop');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center gap-1.5 transition-all border border-emerald-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Site</span>
                    </button>
                    {isPublished ? (
                      <button type="button" disabled className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200 cursor-default">
                        <Check className="w-4 h-4" />
                        <span>Published</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublishTemplate(tmpl.slug || tmpl.id)}
                        disabled={isPublishing}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeTab !== 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            {activeTab === 'colors' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
                <div className="border-b border-slate-100 dark:border-border pb-3">
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    <span>Store Color Palette</span>
                  </h2>
                  <p className="text-xs text-slate-500">Customize main branding, text contrast, and background colors.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Curated Preset Palettes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_PALETTES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-border hover:border-indigo-400 bg-slate-50/50 dark:bg-card text-left space-y-1.5 transition-all group"
                      >
                        <span className="text-[11px] font-extrabold text-slate-800 dark:text-foreground block truncate">
                          {preset.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: preset.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: preset.secondary }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: preset.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-border">
                  {[
                    { field: 'themePrimaryColor', label: 'Primary Brand Color', desc: 'Used for main buttons, headers, & icons' },
                    { field: 'themeSecondaryColor', label: 'Secondary Color', desc: 'Used for subheadings, borders & badges' },
                    { field: 'themeBackgroundColor', label: 'Background Color', desc: 'Main canvas background fill' },
                    { field: 'themeTextColor', label: 'Primary Text Color', desc: 'Body text and heading font color' },
                    { field: 'themeAccentColor', label: 'Accent / Highlight', desc: 'Callouts, sale tags, and indicators' },
                  ].map((item) => (
                    <div key={item.field} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-card border border-slate-200/80">
                      <div className="space-y-0.5">
                        <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                          {item.label}
                        </label>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(themeConfig as any)[item.field] || '#3B82F6'}
                          onChange={(e) => handleConfigChange(item.field as any, e.target.value)}
                          className="w-8 h-8 rounded-xl cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={(themeConfig as any)[item.field] || '#3B82F6'}
                          onChange={(e) => handleConfigChange(item.field as any, e.target.value)}
                          className="w-20 px-2 py-1 text-center font-mono text-xs font-bold border border-slate-200 rounded-xl bg-white dark:bg-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Store Background Image Drag & Drop */}
                <div className="pt-4 border-t border-slate-100 dark:border-border space-y-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>Store Background Image</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Upload an optional canvas background texture, wallpaper, or brand hero pattern.
                    </p>
                  </div>

                  <DragDropUpload
                    folder="backgrounds"
                    fileType="IMAGE"
                    currentUrl={themeConfig.themeBackgroundImage || undefined}
                    onUploadComplete={(url) => {
                      handleConfigChange('themeBackgroundImage', url || null);
                      if (url) showToast('Background image uploaded successfully!', 'success');
                    }}
                    hint="Drag & drop JPG, PNG, or WebP (max 10MB)"
                    previewShape="rect"
                    maxSizeMB={10}
                  />

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Or paste a direct image URL
                    </label>
                    <input
                      type="url"
                      value={themeConfig.themeBackgroundImage || ''}
                      onChange={(e) => handleConfigChange('themeBackgroundImage', e.target.value)}
                      placeholder="https://images.unsplash.com/... or /uploads/bg.webp"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {themeConfig.themeBackgroundImage && (
                    <button
                      type="button"
                      onClick={() => handleConfigChange('themeBackgroundImage', null)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove background image</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'typography' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
                <div className="border-b border-slate-100 dark:border-border pb-3">
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Type className="w-5 h-5 text-indigo-600" />
                    <span>Typography & Google Fonts</span>
                  </h2>
                  <p className="text-xs text-slate-500">Configure font pairings for headings, buttons, and body reading text.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Heading Font Family
                    </label>
                    <select
                      value={normalizeFontValue(themeConfig.themeHeadingFont, 'Inter')}
                      onChange={(e) => handleConfigChange('themeHeadingFont', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Inter">Inter (Modern & Clean)</option>
                      <option value="Outfit">Outfit (Geometric & Tech)</option>
                      <option value="Playfair Display">Playfair Display (Editorial Luxury)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (High-End SaaS)</option>
                      <option value="Space Grotesk">Space Grotesk (Brutalist Streetwear)</option>
                      <option value="Cinzel">Cinzel (Regal & Classical)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Body Copy Font Family
                    </label>
                    <select
                      value={normalizeFontValue(themeConfig.themeBodyFont, 'Inter')}
                      onChange={(e) => handleConfigChange('themeBodyFont', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Inter">Inter (Highly Readable)</option>
                      <option value="Roboto">Roboto (Neutral & Balanced)</option>
                      <option value="DM Sans">DM Sans (Friendly & Minimal)</option>
                      <option value="Lora">Lora (Warm & Editorial)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (High-End Modern)</option>
                      <option value="Outfit">Outfit (Clean & Geometric)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Base Font Scale
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'sm', label: 'Small (13px)' },
                        { id: 'md', label: 'Default (15px)' },
                        { id: 'lg', label: 'Large (17px)' },
                        { id: 'xl', label: 'X-Large (19px)' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleConfigChange('themeFontSize', sz.id)}
                          className={`p-2.5 rounded-2xl border text-center text-xs font-extrabold transition-all ${
                            themeConfig.themeFontSize === sz.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-slate-50 dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200/80 hover:bg-slate-100'
                          }`}
                        >
                          {sz.id.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'headerFooter' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Header Navigation Configuration</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Announcement Bar Text</label>
                      <input
                        type="text"
                        value={themeConfig.headerAnnouncement}
                        onChange={(e) => handleConfigChange('headerAnnouncement', e.target.value)}
                        placeholder="e.g. Free Shipping on orders over $50"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">Sticky Header on Scroll</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerSticky}
                        onChange={(e) => handleConfigChange('headerSticky', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Search Bar</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerShowSearch}
                        onChange={(e) => handleConfigChange('headerShowSearch', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Currency Selector</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerShowCurrency}
                        onChange={(e) => handleConfigChange('headerShowCurrency', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Footer Section Configuration</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Copyright Text</label>
                      <input
                        type="text"
                        value={themeConfig.footerCopyright}
                        onChange={(e) => handleConfigChange('footerCopyright', e.target.value)}
                        placeholder="© 2026 Store Name. All rights reserved."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">Show Social Media Links</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.footerShowSocial}
                        onChange={(e) => handleConfigChange('footerShowSocial', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Newsletter Box</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.footerShowNewsletter}
                        onChange={(e) => handleConfigChange('footerShowNewsletter', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Payment Method Badges</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.footerShowPaymentBadges}
                        onChange={(e) => handleConfigChange('footerShowPaymentBadges', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-7 sticky top-6 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Live Active Theme Canvas ({activeTemplate?.name})</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'plp', label: 'Catalog' },
                  { id: 'pdp', label: 'Product' },
                  { id: 'cart', label: 'Cart' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreviewPage(p.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      previewPage === p.id ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden min-h-[560px]">
              {renderTemplateLivePreview(activeTemplate, themeConfig, previewPage)}
            </div>
          </div>
        </div>
      )}
      {/* ── LIVE HOSTED SITE PREVIEW MODAL ─────────────────────────────── */}
      {livePreviewTemplate && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-lg flex flex-col animate-in fade-in">
          {/* Top bar */}
          <div className="h-14 px-4 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 font-black text-[10px] uppercase tracking-wider">🌐 Live Hosted Preview</span>
              <div>
                <h3 className="font-black text-sm leading-tight">{livePreviewTemplate.name}</h3>
                <p className="text-[10px] text-emerald-400">{livePreviewTemplate.tagline}</p>
              </div>
            </div>

            {/* Page Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[
                { path: '/', label: '🏠 Home' },
                { path: '/products', label: '🛍️ Products' },
                { path: '/cart', label: '🛒 Cart' },
              ].map(p => (
                <button
                  key={p.path}
                  type="button"
                  onClick={() => setLivePreviewPage(p.path as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    livePreviewPage === p.path ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop', width: 'w-full max-w-none' },
                { id: 'tablet', icon: TabletIcon, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map((vp) => {
                const Icon = vp.icon;
                return (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => setLiveViewport(vp.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      liveViewport === vp.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:block">{vp.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Open in new tab */}
              <a
                href={`${STOREFRONT_URL}${livePreviewPage}?previewTemplate=${livePreviewTemplate.slug || livePreviewTemplate.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Open Tab</span>
              </a>
              {/* Publish button */}
              <button
                type="button"
                onClick={() => {
                  handlePublishTemplate(livePreviewTemplate.slug || livePreviewTemplate.id);
                  setLivePreviewTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Publish Template</span>
              </button>
              <button
                type="button"
                onClick={() => setLivePreviewTemplate(null)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Iframe canvas */}
          <div className="flex-1 overflow-hidden bg-slate-950 flex justify-center items-start p-4 sm:p-8">
            <div
              className={`bg-white overflow-hidden shadow-2xl rounded-2xl border border-slate-800 transition-all duration-300 h-full ${
                liveViewport === 'desktop'
                  ? 'w-full'
                  : liveViewport === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              {/* Simulated browser bar */}
              <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-0.5 text-[10px] font-mono text-slate-500 truncate">
                  🔒 {STOREFRONT_URL.replace(/^https?:\/\//, '')}{livePreviewPage}?previewTemplate={livePreviewTemplate.slug || livePreviewTemplate.id}
                </div>
              </div>
              <iframe
                key={`${livePreviewTemplate.id}-${livePreviewPage}`}
                src={`${STOREFRONT_URL}${livePreviewPage}?previewTemplate=${livePreviewTemplate.slug || livePreviewTemplate.id}`}
                className="w-full border-0"
                style={{ height: 'calc(100% - 36px)' }}
                title={`${livePreviewTemplate.name} live preview`}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col animate-in fade-in">
          <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-600 font-black text-xs">
                Previewing Template
              </span>
              <div>
                <h3 className="font-black text-base leading-tight">{previewTemplate.name}</h3>
                <p className="text-[11px] text-indigo-300 font-medium">{previewTemplate.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
              {[
                { id: 'home', label: '🏠 Homepage' },
                { id: 'plp', label: '🛍️ Catalog' },
                { id: 'pdp', label: '🔎 Product Detail' },
                { id: 'cart', label: '🛒 Cart & Taxes' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreviewPage(p.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    previewPage === p.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet', icon: TabletIcon, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map((vp) => {
                const Icon = vp.icon;
                return (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => setPreviewViewport(vp.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      previewViewport === vp.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{vp.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handlePublishTemplate(previewTemplate.slug || previewTemplate.id);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Publish This Template</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950">
            <div
              className={`bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-800 ${
                previewViewport === 'desktop'
                  ? 'w-full max-w-6xl min-h-[750px]'
                  : previewViewport === 'tablet'
                    ? 'w-[768px] min-h-[650px]'
                    : 'w-[390px] min-h-[600px]'
              }`}
            >
              {renderTemplateLivePreview(previewTemplate, themeConfig, previewPage)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

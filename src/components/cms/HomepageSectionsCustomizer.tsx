'use client';

import React, { useState } from 'react';
import {
  HomepageSection,
  HomepageSectionType,
  CMSForm,
} from '@/src/types';
import {
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layout,
  ShoppingBag,
  Grid,
  FileText,
  Star,
  ShieldCheck,
  Mail,
  Zap,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  ExternalLink,
  Tag,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import DragDropUpload from '@/src/components/ui/DragDropUpload';

export const DEFAULT_TEMPLATE_SECTIONS: Record<string, HomepageSection[]> = {
  mincom: [
    {
      id: 'mincom-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Banner',
      config: {
        headline: 'Organic Comfort for Mindful Living',
        subheadline:
          'Contemporary Scandinavian silhouettes crafted from solid European oak, natural bouclé, and artisanal ceramics.',
        badge: '✨ Spring 2026 Collection Drop',
        ctaLabel: 'Shop Living Room',
        ctaHref: '/products',
        secondaryCtaLabel: 'Explore Catalog',
        secondaryCtaHref: '/products',
        backgroundImage:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'mincom-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Curated Room Categories',
      config: {
        title: 'Explore by Space',
        subtitle: 'Shop furniture & decor crafted for mindful spaces',
        limit: 4,
      },
    },
    {
      id: 'mincom-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Trending Furniture & Pieces',
      config: {
        title: 'Bestselling Minimalist Living',
        subtitle: 'Our most sought-after handcrafted pieces this season',
        limit: 4,
      },
    },
    {
      id: 'mincom-lookbook-1',
      type: 'lookbook',
      enabled: true,
      title: 'Master Joiner Lookbook',
      config: {
        lookbookTitle: 'Crafted by Master Joiners in Småland',
        lookbookDesc:
          'Every dining surface and armchair is shaped by hand using traditional mortise-and-tenon joints and organic beeswax.',
        lookbookImage:
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        ctaLabel: 'Explore Artisan Workshop',
        ctaHref: '/products',
      },
    },
    {
      id: 'mincom-trust-1',
      type: 'trust-badges',
      enabled: true,
      title: 'Value & Trust Badges',
      config: {
        badges: [
          { icon: 'Truck', title: 'Free White-Glove Delivery', desc: 'On all orders exceeding $150' },
          { icon: 'ShieldCheck', title: '10-Year Frame Warranty', desc: 'FSC solid European hardwoods' },
          { icon: 'RotateCcw', title: '60-Night In-Home Trial', desc: 'Easy returns and exchanges' },
        ],
      },
    },
    {
      id: 'mincom-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'VIP Decor Newsletter',
      config: {
        title: 'Join the Mincom Collective',
        description:
          'Receive early access to seasonal drops, interior design guides, and private showroom events.',
        placeholder: 'Enter your email address...',
        ctaLabel: 'Subscribe for 10% Off',
      },
    },
  ],
  funo: [
    {
      id: 'funo-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Banner',
      config: {
        headline: 'Furniture for Mindful, Calm Living',
        subheadline:
          'Contemporary Scandinavian silhouettes crafted from solid European oak, natural bouclé, and artisanal ceramics.',
        badge: '✨ Spring 2026 Collection Drop',
        ctaLabel: 'Shop Living Room',
        ctaHref: '/products',
        secondaryCtaLabel: 'Explore Catalog',
        secondaryCtaHref: '/products',
        backgroundImage:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'funo-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Design Spaces',
      config: {
        title: 'Shop by Curated Room',
        subtitle: 'Living Room, Bedroom, Dining & Studio accents',
        limit: 4,
      },
    },
    {
      id: 'funo-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Trending Essentials',
      config: {
        title: 'Scandinavian Modern Living',
        subtitle: 'Handpicked furniture and accents for mindful interiors',
        limit: 4,
      },
    },
    {
      id: 'funo-lookbook-1',
      type: 'lookbook',
      enabled: true,
      title: 'Artisan Story',
      config: {
        lookbookTitle: 'Crafted by Master Joiners in Småland',
        lookbookDesc:
          'Every dining surface and armchair is shaped by hand using traditional mortise-and-tenon joints.',
        lookbookImage:
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        ctaLabel: 'Discover Specs',
        ctaHref: '/products',
      },
    },
    {
      id: 'funo-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'VIP Newsletter',
      config: {
        title: 'Subscribe to Funo Design Journal',
        description:
          'Get exclusive Scandinavian interior design guides and 10% off your first order.',
        placeholder: 'Enter your email...',
        ctaLabel: 'Join Journal',
      },
    },
  ],
  'nova-tech': [
    {
      id: 'nova-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Cyber Banner',
      config: {
        headline: 'Engineered for Peak Performance',
        subheadline:
          'Next-generation audio, wearables, and precision hardware crafted with aerospace-grade materials.',
        badge: '⚡ New Cyber Drop 2026',
        ctaLabel: 'Shop Hardware',
        ctaHref: '/products',
        secondaryCtaLabel: 'View Specs',
        secondaryCtaHref: '/products',
        backgroundImage:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'nova-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Hardware Categories',
      config: {
        title: 'Browse Hardware Collections',
        subtitle: 'Spatial Audio, Wearables, Keyboards & Optics',
        limit: 4,
      },
    },
    {
      id: 'nova-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'High-Performance Gear',
      config: {
        title: 'Cybernetics & Studio Tech',
        subtitle: 'Precision tuned components with zero-latency',
        limit: 4,
      },
    },
    {
      id: 'nova-lookbook-1',
      type: 'lookbook',
      enabled: true,
      title: 'Audio Lab Lookbook',
      config: {
        lookbookTitle: 'Precision Audio Lab Edition',
        lookbookDesc:
          '40mm custom graphene dynamic drivers with ultra-low latency wireless lossless transmission.',
        lookbookImage:
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        ctaLabel: 'Explore Specs',
        ctaHref: '/products',
      },
    },
    {
      id: 'nova-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'Drop Alerts Newsletter',
      config: {
        title: 'Get Drop Alerts First',
        description: 'Be notified the millisecond limited hardware batches go live.',
        placeholder: 'your.handle@domain.com',
        ctaLabel: 'Notify Me',
      },
    },
  ],
  'velvet-luxury': [
    {
      id: 'velvet-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Editorial Banner',
      config: {
        headline: 'Haute Couture & Timeless Opulence',
        subheadline:
          'Curated editorial collections crafted from fine silks, cashmere, and hand-finished Italian leather.',
        badge: '✨ Maison Autumn Lookbook',
        ctaLabel: 'Explore Runway',
        ctaHref: '/products',
        secondaryCtaLabel: 'View Editorial',
        secondaryCtaHref: '/products',
        backgroundImage:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'velvet-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Maison Departments',
      config: {
        title: 'Discover the Atelier',
        subtitle: 'Evening Wear, Leather Goods, Fine Jewelry & Footwear',
        limit: 4,
      },
    },
    {
      id: 'velvet-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Curated Runway Pieces',
      config: {
        title: 'Private Salon Selections',
        subtitle: 'Numbered couture editions crafted in Florence and Paris',
        limit: 4,
      },
    },
    {
      id: 'velvet-lookbook-1',
      type: 'lookbook',
      enabled: true,
      title: 'Autumn Solstice Editorial',
      config: {
        lookbookTitle: 'The Autumn Solstice Editorial',
        lookbookDesc:
          'Indulge in silhouettes cut with architectural precision and draped in luminous emerald and midnight hues.',
        lookbookImage:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        ctaLabel: 'Read Editorial',
        ctaHref: '/products',
      },
    },
    {
      id: 'velvet-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'Private Salon Invitations',
      config: {
        title: 'Maison Private Invitations',
        description: 'Receive bespoke private shopping previews and concierge trunk shows.',
        placeholder: 'Enter your email...',
        ctaLabel: 'Request Invitation',
      },
    },
  ],
  default: [
    {
      id: 'default-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Banner',
      config: {
        headline: 'Shop the Latest Drops',
        subheadline:
          'Discover thousands of products curated just for you. Free shipping on orders over $50.',
        badge: 'NEW SEASON ARRIVALS',
        ctaLabel: 'Shop Now',
        ctaHref: '/products',
        secondaryCtaLabel: 'Explore Collections',
        secondaryCtaHref: '/collections',
      },
    },
    {
      id: 'default-trust-1',
      type: 'trust-badges',
      enabled: true,
      title: 'Trust Badges',
      config: {
        badges: [
          { icon: 'Truck', title: 'Free Shipping', desc: 'On orders over $50' },
          { icon: 'RotateCcw', title: 'Easy Returns', desc: '30-day return policy' },
          { icon: 'ShieldCheck', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
          { icon: 'Mail', title: '24/7 Support', desc: 'Always here to help' },
        ],
      },
    },
    {
      id: 'default-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Featured Categories',
      config: {
        title: 'Featured Collections',
        subtitle: 'Explore our wide range of curated collections',
        limit: 4,
      },
    },
    {
      id: 'default-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Trending Products',
      config: {
        title: 'New Arrivals',
        subtitle: 'Our top rated customer favorites this week',
        limit: 4,
      },
    },
    {
      id: 'default-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'Newsletter',
      config: {
        title: 'Stay in the Loop',
        description: 'Subscribe to receive updates, access to exclusive deals, and more.',
        placeholder: 'Enter your email address...',
        ctaLabel: 'Subscribe',
      },
    },
  ],
};

const SECTION_LIBRARY: Array<{
  type: HomepageSectionType;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  defaultConfig: Record<string, any>;
}> = [
  {
    type: 'hero',
    name: 'Hero Banner',
    desc: 'High-impact top banner with headline, subtitle, CTAs, and background',
    icon: Layout,
    defaultConfig: {
      headline: 'New Season Collection 2026',
      subheadline: 'Explore our exclusive handcrafted apparel, accessories, and new arrivals.',
      badge: '✨ Limited Edition Drop',
      ctaLabel: 'Shop Collection',
      ctaHref: '/products',
      secondaryCtaLabel: 'Explore More',
      secondaryCtaHref: '/products',
      backgroundImage:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    type: 'featured-products',
    name: 'Featured Products Grid',
    desc: 'Showcase trending catalog products or specific collection items',
    icon: ShoppingBag,
    defaultConfig: {
      title: 'Trending Essentials',
      subtitle: 'Our top customer favorites this week',
      limit: 4,
    },
  },
  {
    type: 'categories',
    name: 'Category Showcase',
    desc: 'Visual category grid with image cards and item counts',
    icon: Grid,
    defaultConfig: {
      title: 'Shop by Curated Category',
      subtitle: 'Find exactly what you are looking for',
      limit: 4,
    },
  },
  {
    type: 'lookbook',
    name: 'Lookbook / Editorial Story',
    desc: 'Rich editorial feature with full-height imagery and story description',
    icon: Sparkles,
    defaultConfig: {
      lookbookTitle: 'The Autumn Solstice Editorial',
      lookbookDesc:
        'Discover architectural silhouettes and mindful materials crafted for modern living.',
      lookbookImage:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'Read Editorial',
      ctaHref: '/products',
    },
  },
  {
    type: 'custom_form',
    name: 'Embedded Form (Form Builder)',
    desc: 'Embed any pre-existing lead gen, contact, feedback, or VIP survey form',
    icon: FileText,
    defaultConfig: {
      heading: 'Get in Touch with our Concierge',
      subtitle: 'Have questions about sizing, delivery, or custom orders? Reach out below.',
      formId: '',
      formSlug: '',
      formTitle: 'Contact Us',
    },
  },
  {
    type: 'testimonials',
    name: 'Customer Testimonials',
    desc: 'Social proof reviews and ratings from verified buyers',
    icon: Star,
    defaultConfig: {
      title: 'Loved by Over 50,000+ Customers',
      testimonials: [
        {
          name: 'Elena Rostova',
          rating: 5,
          text: 'The quality of craftsmanship exceeded all my expectations. Absolutely stunning!',
        },
        {
          name: 'Marcus Vance',
          rating: 5,
          text: 'Arrived within 48 hours. The packaging and finish were pure luxury standard.',
        },
      ],
    },
  },
  {
    type: 'trust-badges',
    name: 'Trust & Value Badges',
    desc: 'Highlight shipping speed, security guarantee, and warranty',
    icon: ShieldCheck,
    defaultConfig: {
      badges: [
        { icon: 'Truck', title: 'Free Express Shipping', desc: 'On all orders over $50' },
        { icon: 'ShieldCheck', title: '100% Secure Checkout', desc: '256-bit encrypted payments' },
        { icon: 'RotateCcw', title: '30-Day Free Returns', desc: 'No questions asked return policy' },
      ],
    },
  },
  {
    type: 'banner',
    name: 'Promo / Announcement Banner',
    desc: 'Eye-catching promotional banner with bold button and discount highlight',
    icon: Zap,
    defaultConfig: {
      title: 'Mid-Season Flash Sale: Save 20% Off',
      description: 'Use promo code FLASH20 at checkout for instant savings across all collections.',
      ctaLabel: 'Claim Promo',
      ctaHref: '/products',
      variant: 'primary',
    },
  },
  {
    type: 'newsletter',
    name: 'VIP Newsletter Signup',
    desc: 'Email subscription box to grow your marketing audience',
    icon: Mail,
    defaultConfig: {
      title: 'Join our VIP Collective',
      description: 'Get 10% off your first order plus early access to limited edition drops.',
      placeholder: 'Enter your email address...',
      ctaLabel: 'Subscribe for 10% Off',
    },
  },
];

interface Props {
  templateSlug: string;
  templateName: string;
  sections: HomepageSection[];
  availableForms: CMSForm[];
  onChange: (sections: HomepageSection[]) => void;
  onResetToDefault: () => void;
}

export const HomepageSectionsCustomizer: React.FC<Props> = ({
  templateSlug,
  templateName,
  sections,
  availableForms,
  onChange,
  onResetToDefault,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sections[0]?.id || null,
  );
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Sync selected section if sections change
  const selectedSection =
    sections.find((s) => s.id === selectedSectionId) || sections[0] || null;

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onChange(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sections.filter((s) => s.id !== id);
    onChange(updated);
    if (selectedSectionId === id) {
      setSelectedSectionId(updated[0]?.id || null);
    }
  };

  const handleAddSection = (libItem: (typeof SECTION_LIBRARY)[0]) => {
    const newSection: HomepageSection = {
      id: `${templateSlug}-${libItem.type}-${Date.now()}`,
      type: libItem.type,
      enabled: true,
      title: libItem.name,
      config: { ...libItem.defaultConfig },
    };
    const updated = [...sections, newSection];
    onChange(updated);
    setSelectedSectionId(newSection.id);
    setShowAddMenu(false);
  };

  const handleUpdateConfig = (field: string, value: any) => {
    if (!selectedSection) return;
    const updated = sections.map((s) => {
      if (s.id === selectedSection.id) {
        return {
          ...s,
          config: {
            ...s.config,
            [field]: value,
          },
        };
      }
      return s;
    });
    onChange(updated);
  };

  const getSectionIcon = (type: HomepageSectionType) => {
    const item = SECTION_LIBRARY.find((l) => l.type === type);
    return item ? item.icon : Layers;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
                Template Sections
              </span>
              <span className="text-[11px] text-slate-400 font-mono">({templateSlug})</span>
            </div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{templateName} Homepage</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetToDefault}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1"
              title="Reset to default template sections"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Block</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Reorder, toggle, and customize modular blocks. All edits instantly update the live preview canvas and store layout.
        </p>
      </div>

      {/* Add Section Library Drawer */}
      {showAddMenu && (
        <div className="p-5 rounded-3xl border-2 border-indigo-500/30 bg-white dark:bg-card shadow-xl space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-2.5">
            <h3 className="text-xs font-black text-slate-900 dark:text-foreground flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Choose a Section to Add</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddMenu(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SECTION_LIBRARY.map((lib) => {
              const Icon = lib.icon;
              return (
                <button
                  key={lib.type}
                  type="button"
                  onClick={() => handleAddSection(lib)}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-border hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-accent/40 hover:bg-white dark:hover:bg-accent text-left transition-all group flex items-start gap-2.5 shadow-xs hover:shadow-md"
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {lib.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{lib.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections List Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Layout Structure ({sections.length} Blocks)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Click any row to configure</span>
        </div>

        <div className="space-y-2">
          {sections.map((sec, idx) => {
            const Icon = getSectionIcon(sec.type);
            const isSelected = selectedSection?.id === sec.id;
            const isFirst = idx === 0;
            const isLast = idx === sections.length - 1;

            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30 shadow-sm'
                    : sec.enabled
                      ? 'border-slate-200/80 dark:border-border bg-slate-50/40 dark:bg-card hover:border-slate-300 shadow-xs'
                      : 'border-slate-200/40 dark:border-border/40 bg-slate-100/50 dark:bg-card/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-foreground truncate">
                        {sec.title || sec.type}
                      </span>
                      {!sec.enabled && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase">
                          Hidden
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      type: {sec.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-accent disabled:opacity-20 transition"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-accent disabled:opacity-20 transition"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleToggle(sec.id, e)}
                    className={`p-1 rounded-lg transition ${
                      sec.enabled
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-accent'
                        : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    }`}
                    title={sec.enabled ? 'Hide Section' : 'Show Section'}
                  >
                    {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(sec.id, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Section Property Inspector */}
      {selectedSection && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-foreground">
                  Editing: {selectedSection.title || selectedSection.type}
                </h3>
                <span className="text-[10px] text-slate-400">Configure parameters below</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300">
              {selectedSection.type}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Hero Inspector */}
            {selectedSection.type === 'hero' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Promo Badge</label>
                  <input
                    type="text"
                    value={selectedSection.config.badge || ''}
                    onChange={(e) => handleUpdateConfig('badge', e.target.value)}
                    placeholder="✨ Spring 2026 Drop"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Headline</label>
                  <input
                    type="text"
                    value={selectedSection.config.headline || ''}
                    onChange={(e) => handleUpdateConfig('headline', e.target.value)}
                    placeholder="Main headline..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subheadline</label>
                  <textarea
                    rows={2}
                    value={selectedSection.config.subheadline || ''}
                    onChange={(e) => handleUpdateConfig('subheadline', e.target.value)}
                    placeholder="Description..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Button Label</label>
                    <input
                      type="text"
                      value={selectedSection.config.ctaLabel || ''}
                      onChange={(e) => handleUpdateConfig('ctaLabel', e.target.value)}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Button Link</label>
                    <input
                      type="text"
                      value={selectedSection.config.ctaHref || ''}
                      onChange={(e) => handleUpdateConfig('ctaHref', e.target.value)}
                      placeholder="/products"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Hero Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.config.backgroundImage || ''}
                    onChange={(e) => handleUpdateConfig('backgroundImage', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium font-mono text-[11px]"
                  />
                </div>
              </>
            )}

            {/* Featured Products Inspector */}
            {selectedSection.type === 'featured-products' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Trending Essentials"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Customer favorites..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Max Products Shown</label>
                  <select
                    value={selectedSection.config.limit || 4}
                    onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  >
                    <option value={2}>2 Products</option>
                    <option value={4}>4 Products (Standard)</option>
                    <option value={6}>6 Products</option>
                    <option value={8}>8 Products</option>
                  </select>
                </div>
              </>
            )}

            {/* Categories Inspector */}
            {selectedSection.type === 'categories' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Shop by Category"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Browse curated collections..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Max Categories Shown</label>
                  <select
                    value={selectedSection.config.limit || 4}
                    onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  >
                    <option value={3}>3 Categories</option>
                    <option value={4}>4 Categories (Standard)</option>
                    <option value={6}>6 Categories</option>
                  </select>
                </div>
              </>
            )}

            {/* Lookbook Inspector */}
            {selectedSection.type === 'lookbook' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Editorial Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.lookbookTitle || ''}
                    onChange={(e) => handleUpdateConfig('lookbookTitle', e.target.value)}
                    placeholder="The Autumn Editorial"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Story Copy</label>
                  <textarea
                    rows={2}
                    value={selectedSection.config.lookbookDesc || ''}
                    onChange={(e) => handleUpdateConfig('lookbookDesc', e.target.value)}
                    placeholder="Crafted by master joiners..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Editorial Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.config.lookbookImage || ''}
                    onChange={(e) => handleUpdateConfig('lookbookImage', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-mono text-[11px]"
                  />
                </div>
              </>
            )}

            {/* Form Builder Embed Inspector */}
            {selectedSection.type === 'custom_form' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Select Form from Form Builder</label>
                  <select
                    value={selectedSection.config.formId || selectedSection.config.formSlug || ''}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const foundForm = availableForms.find(
                        (f) => f.id === selectedVal || f.slug === selectedVal,
                      );
                      if (foundForm) {
                        handleUpdateConfig('formId', foundForm.id);
                        handleUpdateConfig('formSlug', foundForm.slug);
                        handleUpdateConfig('formTitle', foundForm.title);
                      } else {
                        handleUpdateConfig('formId', selectedVal);
                        handleUpdateConfig('formSlug', selectedVal);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 font-bold"
                  >
                    <option value="">-- Choose an interactive form --</option>
                    {availableForms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title} ({f.fields?.length || 0} fields)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Form Section Heading</label>
                  <input
                    type="text"
                    value={selectedSection.config.heading || ''}
                    onChange={(e) => handleUpdateConfig('heading', e.target.value)}
                    placeholder="Get in Touch with our Team"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="We reply within 24 hours..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
              </>
            )}

            {/* Trust Badges Inspector */}
            {selectedSection.type === 'trust-badges' && (
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Trust Badges Overview</label>
                {(selectedSection.config.badges || []).map((badge: any, bIdx: number) => (
                  <div key={bIdx} className="p-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-1.5">
                    <input
                      type="text"
                      value={badge.title || ''}
                      onChange={(e) => {
                        const newBadges = [...(selectedSection.config.badges || [])];
                        newBadges[bIdx] = { ...newBadges[bIdx], title: e.target.value };
                        handleUpdateConfig('badges', newBadges);
                      }}
                      placeholder="Badge title"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={badge.desc || ''}
                      onChange={(e) => {
                        const newBadges = [...(selectedSection.config.badges || [])];
                        newBadges[bIdx] = { ...newBadges[bIdx], desc: e.target.value };
                        handleUpdateConfig('badges', newBadges);
                      }}
                      placeholder="Badge description"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-[11px]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Banner Inspector */}
            {selectedSection.type === 'banner' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Banner Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Mid-Season Sale"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <input
                    type="text"
                    value={selectedSection.config.description || ''}
                    onChange={(e) => handleUpdateConfig('description', e.target.value)}
                    placeholder="Special promo details..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">CTA Label</label>
                    <input
                      type="text"
                      value={selectedSection.config.ctaLabel || ''}
                      onChange={(e) => handleUpdateConfig('ctaLabel', e.target.value)}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">CTA Link</label>
                    <input
                      type="text"
                      value={selectedSection.config.ctaHref || ''}
                      onChange={(e) => handleUpdateConfig('ctaHref', e.target.value)}
                      placeholder="/products"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Newsletter Inspector */}
            {selectedSection.type === 'newsletter' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Join our VIP Newsletter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Description</label>
                  <input
                    type="text"
                    value={selectedSection.config.description || ''}
                    onChange={(e) => handleUpdateConfig('description', e.target.value)}
                    placeholder="Get 10% off your first order..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
              </>
            )}

            {/* Testimonials Inspector */}
            {selectedSection.type === 'testimonials' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Loved by Over 50,000+ Customers"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

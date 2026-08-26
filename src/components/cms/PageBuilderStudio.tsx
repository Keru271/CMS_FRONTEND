'use client';

import React, { useState, useCallback, useRef, useEffect, useReducer } from 'react';
import {
  X, Plus, Trash2, Copy, Eye, EyeOff, Laptop, Tablet, Smartphone,
  CheckCircle2, Save, Layers, Settings, LayoutTemplate, Undo2, Redo2,
  GripVertical, ChevronDown, ChevronRight, Grid3X3, Palette, Type,
  Image as ImageIcon, Video, Star, HelpCircle, Mail, ArrowRight, Zap,
  Quote, BarChart3, Columns, GalleryHorizontal, Package, Hash, AlignLeft,
  Search, Sparkles, AlertCircle, ExternalLink, Globe,
} from 'lucide-react';
import { CMSPageData, PageFormData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';

// ─── Types ──────────────────────────────────────────────────────────────────

export type BlockType =
  | 'hero'
  | 'value_props'
  | 'image_text'
  | 'testimonials'
  | 'faq'
  | 'newsletter'
  | 'cta_banner'
  | 'countdown'
  | 'rich_text'
  | 'video'
  | 'brand_logos'
  | 'featured_products'
  | 'stats'
  | 'columns'
  | 'image_gallery';

export interface PageBlock {
  id: string;
  type: BlockType;
  isVisible: boolean;
  data: Record<string, any>;
}

interface PageBuilderStudioProps {
  initialPage?: CMSPageData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Block Library Definitions ──────────────────────────────────────────────

const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  desc: string;
  category: 'layout' | 'content' | 'media' | 'marketing';
  icon: React.ReactNode;
  defaultData: Record<string, any>;
}[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    desc: 'Full-width banner with headline, subtitle and CTAs',
    category: 'layout',
    icon: <Zap className="w-4 h-4" />,
    defaultData: {
      headline: 'Next-Generation Performance',
      subtitle: 'Engineered for creators and innovators. Explore the flagship 2026 collection.',
      buttonText: 'Shop Now',
      buttonUrl: '/products',
      secondaryButtonText: 'Learn More',
      secondaryButtonUrl: '/pages/about',
      backgroundImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80',
      overlayOpacity: 50,
      textAlign: 'center',
      minHeight: '520px',
    },
  },
  {
    type: 'value_props',
    label: 'Value Props',
    desc: 'Icon grid of features and benefits',
    category: 'content',
    icon: <Grid3X3 className="w-4 h-4" />,
    defaultData: {
      heading: 'Why Customers Love Us',
      columns: 4,
      features: [
        { icon: '🚀', title: 'Express Delivery', desc: 'Ships within 24 hours worldwide.' },
        { icon: '🛡️', title: '2-Year Warranty', desc: 'Full manufacturer guarantee.' },
        { icon: '🔄', title: 'Free Returns', desc: '30-day hassle-free returns.' },
        { icon: '💬', title: '24/7 Support', desc: 'Always here for you.' },
      ],
    },
  },
  {
    type: 'image_text',
    label: 'Image & Text',
    desc: 'Side-by-side image with content block',
    category: 'layout',
    icon: <ImageIcon className="w-4 h-4" />,
    defaultData: {
      tagline: 'OUR CRAFT',
      title: 'Precision Without Compromise',
      description: 'Every detail is crafted with purpose. Stress-tested for durability, refined for beauty.',
      buttonText: 'Discover Our Story',
      buttonUrl: '/pages/about',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&q=80',
      imagePosition: 'right',
    },
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    desc: 'Customer reviews with star ratings',
    category: 'marketing',
    icon: <Quote className="w-4 h-4" />,
    defaultData: {
      heading: 'What Our Customers Say',
      reviews: [
        { author: 'Sarah M.', role: 'Verified Buyer', rating: 5, quote: 'Absolutely love the quality. Worth every penny!' },
        { author: 'James K.', role: 'Verified Buyer', rating: 5, quote: 'Arrived in 2 days. Packaging was premium.' },
        { author: 'Priya L.', role: 'Verified Buyer', rating: 5, quote: 'Customer support was exceptional.' },
      ],
    },
  },
  {
    type: 'faq',
    label: 'FAQ Accordion',
    desc: 'Collapsible question and answer pairs',
    category: 'content',
    icon: <HelpCircle className="w-4 h-4" />,
    defaultData: {
      heading: 'Frequently Asked Questions',
      subtitle: 'Got questions? We have answers.',
      items: [
        { question: 'How long does shipping take?', answer: 'Standard orders arrive in 3–5 business days. Express overnight is also available.' },
        { question: 'What is your return policy?', answer: 'We offer 30-day hassle-free returns with prepaid labels on all orders.' },
        { question: 'Do you offer a warranty?', answer: 'All products carry a 2-year manufacturer warranty against defects.' },
      ],
    },
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    desc: 'Email capture subscription form',
    category: 'marketing',
    icon: <Mail className="w-4 h-4" />,
    defaultData: {
      heading: 'Stay in the Loop',
      subtitle: 'Subscribe for exclusive drops, VIP access and offers.',
      placeholder: 'Enter your email...',
      buttonText: 'Subscribe',
      bgDark: true,
    },
  },
  {
    type: 'cta_banner',
    label: 'CTA Banner',
    desc: 'High-converting call to action section',
    category: 'marketing',
    icon: <ArrowRight className="w-4 h-4" />,
    defaultData: {
      headline: 'Ready to Elevate Your Experience?',
      subtitle: 'Join over 120,000 satisfied customers worldwide.',
      primaryButtonText: 'Browse Catalogue',
      primaryButtonUrl: '/products',
      secondaryButtonText: 'Contact Support',
      secondaryButtonUrl: '/pages/contact',
      bgColor: '#0F172A',
    },
  },
  {
    type: 'countdown',
    label: 'Flash Sale',
    desc: 'Flash sale promo banner with discount code',
    category: 'marketing',
    icon: <Zap className="w-4 h-4" />,
    defaultData: {
      badge: 'LIMITED DROP',
      title: 'Season Sale — Up to 40% OFF',
      discountCode: 'FLASH40',
      buttonText: 'Claim Offer',
      buttonUrl: '/products',
      bgGradient: 'from-indigo-900 via-purple-900 to-slate-900',
    },
  },
  {
    type: 'rich_text',
    label: 'Rich Text',
    desc: 'Full formatted HTML text block',
    category: 'content',
    icon: <AlignLeft className="w-4 h-4" />,
    defaultData: {
      html: '<h2>Add Your Heading Here</h2><p>Write your rich content here. You can use headings, paragraphs, lists, links, and more to communicate your message clearly.</p>',
    },
  },
  {
    type: 'video',
    label: 'Video Embed',
    desc: 'YouTube or Vimeo video embed',
    category: 'media',
    icon: <Video className="w-4 h-4" />,
    defaultData: {
      heading: 'See It in Action',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      aspectRatio: '16/9',
    },
  },
  {
    type: 'brand_logos',
    label: 'Brand Logos',
    desc: 'Partner and brand logo strip',
    category: 'content',
    icon: <Package className="w-4 h-4" />,
    defaultData: {
      heading: 'Trusted By Top Brands',
      logos: [
        { name: 'Apple', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
        { name: 'Google', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
        { name: 'Nike', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
        { name: 'Adidas', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
      ],
    },
  },
  {
    type: 'featured_products',
    label: 'Featured Products',
    desc: 'Manual product showcase grid',
    category: 'marketing',
    icon: <Package className="w-4 h-4" />,
    defaultData: {
      heading: 'Featured Products',
      subtitle: 'Hand-picked bestsellers curated just for you.',
      columns: 3,
      ctaText: 'View All Products',
      ctaUrl: '/products',
      products: [
        { name: 'Premium Wireless Earbuds', price: '₹4,999', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', url: '/products' },
        { name: 'Ultra-Slim Smart Watch', price: '₹12,999', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', url: '/products' },
        { name: 'Noise-Canceling Headphones', price: '₹8,499', image: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&q=80', url: '/products' },
      ],
    },
  },
  {
    type: 'stats',
    label: 'Stats Row',
    desc: 'Animated metrics and numbers row',
    category: 'content',
    icon: <BarChart3 className="w-4 h-4" />,
    defaultData: {
      heading: 'Our Numbers Speak',
      stats: [
        { value: '120K+', label: 'Happy Customers' },
        { value: '4.9★', label: 'Average Rating' },
        { value: '50+', label: 'Countries Shipped' },
        { value: '24hrs', label: 'Avg Dispatch Time' },
      ],
    },
  },
  {
    type: 'columns',
    label: 'Two Columns',
    desc: 'Multi-column text layout',
    category: 'layout',
    icon: <Columns className="w-4 h-4" />,
    defaultData: {
      columns: [
        { heading: 'Our Mission', content: '<p>We are committed to bringing you the finest curated products from around the world, delivered with exceptional care and speed.</p>' },
        { heading: 'Our Vision', content: '<p>To become the most trusted and beloved destination for quality-conscious shoppers everywhere.</p>' },
      ],
    },
  },
  {
    type: 'image_gallery',
    label: 'Image Gallery',
    desc: 'Masonry image grid showcase',
    category: 'media',
    icon: <GalleryHorizontal className="w-4 h-4" />,
    defaultData: {
      heading: 'Gallery',
      columns: 3,
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', alt: 'Product 1' },
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', alt: 'Product 2' },
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', alt: 'Product 3' },
        { url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80', alt: 'Product 4' },
        { url: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80', alt: 'Product 5' },
        { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', alt: 'Product 6' },
      ],
    },
  },
];

const BLOCK_CATEGORIES = [
  { id: 'all', label: 'All Blocks' },
  { id: 'layout', label: 'Layout' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'marketing', label: 'Marketing' },
];

// ─── Helper to parse page content into blocks ────────────────────────────────

function parseContentToBlocks(content?: string | null): PageBlock[] {
  if (!content) return [];
  const trimmed = content.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type) {
        return parsed;
      }
    } catch {}
  }
  // Wrap HTML/text in a rich_text block
  if (trimmed) {
    return [{
      id: `block-rich_text-${Date.now()}`,
      type: 'rich_text',
      isVisible: true,
      data: { html: trimmed },
    }];
  }
  return [];
}

// ─── Undo/Redo Reducer ──────────────────────────────────────────────────────

type HistoryAction =
  | { type: 'SET'; blocks: PageBlock[] }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface HistoryState {
  past: PageBlock[][];
  present: PageBlock[];
  future: PageBlock[][];
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'SET':
      if (JSON.stringify(state.present) === JSON.stringify(action.blocks)) return state;
      return {
        past: [...state.past.slice(-30), state.present],
        present: action.blocks,
        future: [],
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future.slice(0, 30)],
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      return {
        past: [...state.past.slice(-30), state.present],
        present: state.future[0],
        future: state.future.slice(1),
      };
    default:
      return state;
  }
}

// ─── Field helper ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600";

// ─── Inspector Panel ────────────────────────────────────────────────────────

function BlockInspector({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleVisible,
}: {
  block: PageBlock;
  onUpdate: (data: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisible: () => void;
}) {
  const { type, data } = block;

  const set = (key: string, value: any) => onUpdate({ ...data, [key]: value });

  const updateListItem = (key: string, idx: number, field: string, value: any) => {
    const arr = [...(data[key] || [])];
    arr[idx] = { ...arr[idx], [field]: value };
    set(key, arr);
  };

  const addListItem = (key: string, template: Record<string, any>) => {
    set(key, [...(data[key] || []), { ...template }]);
  };

  const removeListItem = (key: string, idx: number) => {
    const arr = [...(data[key] || [])];
    arr.splice(idx, 1);
    set(key, arr);
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Block Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="font-black text-indigo-400 text-[11px] uppercase tracking-wider">
          {type.replace(/_/g, ' ')} Settings
        </span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onToggleVisible} title={block.isVisible ? 'Hide' : 'Show'} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            {block.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
          </button>
          <button type="button" onClick={onDuplicate} title="Duplicate" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onDelete} title="Delete" className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* HERO */}
      {type === 'hero' && (
        <>
          <Field label="Headline"><input className={inputCls} value={data.headline || ''} onChange={e => set('headline', e.target.value)} /></Field>
          <Field label="Subtitle"><textarea className={inputCls} rows={3} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <Field label="Background Image URL"><input className={`${inputCls} font-mono`} value={data.backgroundImage || ''} onChange={e => set('backgroundImage', e.target.value)} /></Field>
          <Field label="Dark Overlay (0–100%)">
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={100} value={data.overlayOpacity ?? 50} onChange={e => set('overlayOpacity', Number(e.target.value))} className="flex-1 accent-indigo-500" />
              <span className="text-slate-400 w-8">{data.overlayOpacity ?? 50}%</span>
            </div>
          </Field>
          <Field label="Text Alignment">
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(a => (
                <button key={a} type="button" onClick={() => set('textAlign', a)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${data.textAlign === a ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>{a}</button>
              ))}
            </div>
          </Field>
          <Field label="Primary Button Text"><input className={inputCls} value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></Field>
          <Field label="Primary Button URL"><input className={`${inputCls} font-mono`} value={data.buttonUrl || ''} onChange={e => set('buttonUrl', e.target.value)} /></Field>
          <Field label="Secondary Button Text"><input className={inputCls} value={data.secondaryButtonText || ''} onChange={e => set('secondaryButtonText', e.target.value)} /></Field>
          <Field label="Secondary Button URL"><input className={`${inputCls} font-mono`} value={data.secondaryButtonUrl || ''} onChange={e => set('secondaryButtonUrl', e.target.value)} /></Field>
        </>
      )}

      {/* VALUE PROPS */}
      {type === 'value_props' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Columns (2–4)">
            <div className="flex gap-2">
              {[2, 3, 4].map(c => (
                <button key={c} type="button" onClick={() => set('columns', c)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${data.columns === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>{c}</button>
              ))}
            </div>
          </Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Feature Cards</label>
            {(data.features || []).map((f: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={`${inputCls} w-14 text-center text-lg p-1`} value={f.icon || ''} onChange={e => updateListItem('features', i, 'icon', e.target.value)} placeholder="🚀" />
                  <input className={inputCls} value={f.title || ''} onChange={e => updateListItem('features', i, 'title', e.target.value)} placeholder="Title" />
                  <button type="button" onClick={() => removeListItem('features', i)} className="p-1 text-rose-400 hover:text-rose-300 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input className={inputCls} value={f.desc || ''} onChange={e => updateListItem('features', i, 'desc', e.target.value)} placeholder="Description" />
              </div>
            ))}
            <button type="button" onClick={() => addListItem('features', { icon: '✨', title: 'New Feature', desc: 'Feature description.' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Feature Card
            </button>
          </div>
        </>
      )}

      {/* IMAGE & TEXT */}
      {type === 'image_text' && (
        <>
          <Field label="Tagline (optional)"><input className={inputCls} value={data.tagline || ''} onChange={e => set('tagline', e.target.value)} /></Field>
          <Field label="Heading"><input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} /></Field>
          <Field label="Description"><textarea className={inputCls} rows={4} value={data.description || ''} onChange={e => set('description', e.target.value)} /></Field>
          <Field label="Image URL"><input className={`${inputCls} font-mono`} value={data.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} /></Field>
          {data.imageUrl && <img src={data.imageUrl} alt="preview" className="rounded-xl w-full h-24 object-cover border border-slate-800" />}
          <Field label="Image Position">
            <div className="flex gap-2">
              <button type="button" onClick={() => set('imagePosition', 'left')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${data.imagePosition === 'left' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Left</button>
              <button type="button" onClick={() => set('imagePosition', 'right')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${data.imagePosition === 'right' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Right</button>
            </div>
          </Field>
          <Field label="Button Text"><input className={inputCls} value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></Field>
          <Field label="Button URL"><input className={`${inputCls} font-mono`} value={data.buttonUrl || ''} onChange={e => set('buttonUrl', e.target.value)} /></Field>
        </>
      )}

      {/* TESTIMONIALS */}
      {type === 'testimonials' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Reviews</label>
            {(data.reviews || []).map((r: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inputCls} value={r.author || ''} onChange={e => updateListItem('reviews', i, 'author', e.target.value)} placeholder="Author Name" />
                  <button type="button" onClick={() => removeListItem('reviews', i)} className="p-1 text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input className={inputCls} value={r.role || ''} onChange={e => updateListItem('reviews', i, 'role', e.target.value)} placeholder="Role (e.g. Verified Buyer)" />
                <Field label="Rating">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => updateListItem('reviews', i, 'rating', s)} className={`text-lg transition ${s <= (r.rating || 5) ? 'text-amber-400' : 'text-slate-700'}`}>★</button>
                    ))}
                  </div>
                </Field>
                <textarea className={inputCls} rows={2} value={r.quote || ''} onChange={e => updateListItem('reviews', i, 'quote', e.target.value)} placeholder="Review text..." />
              </div>
            ))}
            <button type="button" onClick={() => addListItem('reviews', { author: 'New Customer', role: 'Verified Buyer', rating: 5, quote: 'Great product!' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Review
            </button>
          </div>
        </>
      )}

      {/* FAQ */}
      {type === 'faq' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">FAQ Items</label>
            {(data.items || []).map((item: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-start gap-2">
                  <textarea className={`${inputCls} flex-1`} rows={2} value={item.question || ''} onChange={e => updateListItem('items', i, 'question', e.target.value)} placeholder="Question..." />
                  <button type="button" onClick={() => removeListItem('items', i)} className="p-1 text-rose-400 shrink-0 mt-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <textarea className={inputCls} rows={3} value={item.answer || ''} onChange={e => updateListItem('items', i, 'answer', e.target.value)} placeholder="Answer..." />
              </div>
            ))}
            <button type="button" onClick={() => addListItem('items', { question: 'New Question?', answer: 'Answer here.' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add FAQ Item
            </button>
          </div>
        </>
      )}

      {/* NEWSLETTER */}
      {type === 'newsletter' && (
        <>
          <Field label="Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <Field label="Input Placeholder"><input className={inputCls} value={data.placeholder || ''} onChange={e => set('placeholder', e.target.value)} /></Field>
          <Field label="Button Text"><input className={inputCls} value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></Field>
          <Field label="Background">
            <div className="flex gap-2">
              <button type="button" onClick={() => set('bgDark', true)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${data.bgDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Dark</button>
              <button type="button" onClick={() => set('bgDark', false)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${!data.bgDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Light</button>
            </div>
          </Field>
        </>
      )}

      {/* CTA BANNER */}
      {type === 'cta_banner' && (
        <>
          <Field label="Headline"><input className={inputCls} value={data.headline || ''} onChange={e => set('headline', e.target.value)} /></Field>
          <Field label="Subtitle"><textarea className={inputCls} rows={2} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <Field label="Primary Button Text"><input className={inputCls} value={data.primaryButtonText || ''} onChange={e => set('primaryButtonText', e.target.value)} /></Field>
          <Field label="Primary Button URL"><input className={`${inputCls} font-mono`} value={data.primaryButtonUrl || ''} onChange={e => set('primaryButtonUrl', e.target.value)} /></Field>
          <Field label="Secondary Button Text"><input className={inputCls} value={data.secondaryButtonText || ''} onChange={e => set('secondaryButtonText', e.target.value)} /></Field>
          <Field label="Secondary Button URL"><input className={`${inputCls} font-mono`} value={data.secondaryButtonUrl || ''} onChange={e => set('secondaryButtonUrl', e.target.value)} /></Field>
          <Field label="Background Color">
            <div className="flex items-center gap-2">
              <input type="color" value={data.bgColor || '#0F172A'} onChange={e => set('bgColor', e.target.value)} className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer" />
              <input className={inputCls} value={data.bgColor || '#0F172A'} onChange={e => set('bgColor', e.target.value)} />
            </div>
          </Field>
        </>
      )}

      {/* COUNTDOWN */}
      {type === 'countdown' && (
        <>
          <Field label="Badge Label"><input className={inputCls} value={data.badge || ''} onChange={e => set('badge', e.target.value)} /></Field>
          <Field label="Sale Headline"><input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} /></Field>
          <Field label="Discount Code"><input className={`${inputCls} font-mono text-amber-400 font-bold`} value={data.discountCode || ''} onChange={e => set('discountCode', e.target.value)} /></Field>
          <Field label="Button Text"><input className={inputCls} value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></Field>
          <Field label="Button URL"><input className={`${inputCls} font-mono`} value={data.buttonUrl || ''} onChange={e => set('buttonUrl', e.target.value)} /></Field>
          <Field label="Background">
            <select className={inputCls} value={data.bgGradient || ''} onChange={e => set('bgGradient', e.target.value)}>
              <option value="from-indigo-900 via-purple-900 to-slate-900">Indigo Purple</option>
              <option value="from-rose-900 via-pink-900 to-slate-900">Rose Pink</option>
              <option value="from-emerald-900 via-teal-900 to-slate-900">Emerald Teal</option>
              <option value="from-amber-900 via-orange-900 to-slate-900">Amber Orange</option>
              <option value="from-slate-900 via-slate-800 to-slate-900">Slate Dark</option>
            </select>
          </Field>
        </>
      )}

      {/* RICH TEXT */}
      {type === 'rich_text' && (
        <>
          <Field label="HTML Content">
            <textarea className={`${inputCls} font-mono`} rows={10} value={data.html || ''} onChange={e => set('html', e.target.value)} placeholder="<h2>Heading</h2><p>Content...</p>" />
          </Field>
          <p className="text-[10px] text-slate-500">Supports full HTML: headings, paragraphs, lists, links, bold, italic, etc.</p>
        </>
      )}

      {/* VIDEO */}
      {type === 'video' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="YouTube / Vimeo Embed URL"><input className={`${inputCls} font-mono`} value={data.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/embed/..." /></Field>
          <p className="text-[10px] text-slate-500">Use the /embed/ URL format from YouTube or Vimeo.</p>
        </>
      )}

      {/* BRAND LOGOS */}
      {type === 'brand_logos' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Logo Images</label>
            {(data.logos || []).map((l: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} value={l.name || ''} onChange={e => updateListItem('logos', i, 'name', e.target.value)} placeholder="Brand name" />
                <input className={`${inputCls} font-mono flex-1`} value={l.imageUrl || ''} onChange={e => updateListItem('logos', i, 'imageUrl', e.target.value)} placeholder="Logo URL" />
                <button type="button" onClick={() => removeListItem('logos', i)} className="p-1 text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('logos', { name: 'Brand', imageUrl: '' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Logo
            </button>
          </div>
        </>
      )}

      {/* FEATURED PRODUCTS */}
      {type === 'featured_products' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <Field label="CTA Button Text"><input className={inputCls} value={data.ctaText || ''} onChange={e => set('ctaText', e.target.value)} /></Field>
          <Field label="CTA URL"><input className={`${inputCls} font-mono`} value={data.ctaUrl || ''} onChange={e => set('ctaUrl', e.target.value)} /></Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Products</label>
            {(data.products || []).map((p: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inputCls} value={p.name || ''} onChange={e => updateListItem('products', i, 'name', e.target.value)} placeholder="Product name" />
                  <button type="button" onClick={() => removeListItem('products', i)} className="p-1 text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input className={inputCls} value={p.price || ''} onChange={e => updateListItem('products', i, 'price', e.target.value)} placeholder="Price (e.g. ₹999)" />
                <input className={`${inputCls} font-mono`} value={p.image || ''} onChange={e => updateListItem('products', i, 'image', e.target.value)} placeholder="Product image URL" />
              </div>
            ))}
            <button type="button" onClick={() => addListItem('products', { name: 'New Product', price: '₹999', image: '', url: '/products' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        </>
      )}

      {/* STATS */}
      {type === 'stats' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Stat Items</label>
            {(data.stats || []).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} value={s.value || ''} onChange={e => updateListItem('stats', i, 'value', e.target.value)} placeholder="120K+" />
                <input className={inputCls} value={s.label || ''} onChange={e => updateListItem('stats', i, 'label', e.target.value)} placeholder="Customers" />
                <button type="button" onClick={() => removeListItem('stats', i)} className="p-1 text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('stats', { value: '100+', label: 'New Stat' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Stat
            </button>
          </div>
        </>
      )}

      {/* COLUMNS */}
      {type === 'columns' && (
        <>
          {(data.columns || []).map((col: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-slate-400 text-[11px] font-bold flex-1">Column {i + 1}</label>
                {data.columns.length > 1 && <button type="button" onClick={() => removeListItem('columns', i)} className="p-1 text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
              <Field label="Heading"><input className={inputCls} value={col.heading || ''} onChange={e => updateListItem('columns', i, 'heading', e.target.value)} /></Field>
              <Field label="Content (HTML)"><textarea className={`${inputCls} font-mono`} rows={4} value={col.content || ''} onChange={e => updateListItem('columns', i, 'content', e.target.value)} /></Field>
            </div>
          ))}
          {(data.columns || []).length < 4 && (
            <button type="button" onClick={() => addListItem('columns', { heading: 'New Column', content: '<p>Column content here.</p>' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Column
            </button>
          )}
        </>
      )}

      {/* IMAGE GALLERY */}
      {type === 'image_gallery' && (
        <>
          <Field label="Section Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Columns (2–4)">
            <div className="flex gap-2">
              {[2, 3, 4].map(c => (
                <button key={c} type="button" onClick={() => set('columns', c)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${data.columns === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>{c}</button>
              ))}
            </div>
          </Field>
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Images</label>
            {(data.images || []).map((img: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input className={`${inputCls} font-mono flex-1`} value={img.url || ''} onChange={e => updateListItem('images', i, 'url', e.target.value)} placeholder="Image URL" />
                <button type="button" onClick={() => removeListItem('images', i)} className="p-1 text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('images', { url: '', alt: 'Gallery Image' })} className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Image
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Block Preview (Canvas Render) ──────────────────────────────────────────

function BlockPreview({ block }: { block: PageBlock }) {
  const { type, data } = block;

  if (type === 'hero') return (
    <div className="relative rounded-2xl overflow-hidden text-white" style={{ minHeight: '280px', backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black" style={{ opacity: (data.overlayOpacity ?? 50) / 100 }} />
      <div className={`relative z-10 flex flex-col items-${data.textAlign === 'left' ? 'start' : data.textAlign === 'right' ? 'end' : 'center'} justify-center h-full min-h-[280px] p-8 text-${data.textAlign || 'center'}`}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">{data.headline}</h1>
        <p className="text-sm text-slate-200 max-w-lg leading-relaxed mb-5">{data.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          {data.buttonText && <span className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-lg">{data.buttonText}</span>}
          {data.secondaryButtonText && <span className="px-5 py-2.5 rounded-xl bg-white/20 text-white text-xs font-bold backdrop-blur-sm">{data.secondaryButtonText}</span>}
        </div>
      </div>
    </div>
  );

  if (type === 'value_props') return (
    <div className="p-4 space-y-4">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      <div className={`grid grid-cols-${data.columns || 4} gap-4`}>
        {(data.features || []).map((f: any, i: number) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
            <div className="text-2xl">{f.icon}</div>
            <h4 className="font-black text-xs text-slate-900">{f.title}</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'image_text') return (
    <div className={`grid grid-cols-2 gap-6 items-center p-4`}>
      <div className={`${data.imagePosition === 'left' ? 'order-1' : 'order-2'} rounded-2xl overflow-hidden h-48`}>
        {data.imageUrl ? <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No image set</div>}
      </div>
      <div className={`${data.imagePosition === 'left' ? 'order-2' : 'order-1'} space-y-2`}>
        {data.tagline && <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">{data.tagline}</span>}
        <h2 className="text-xl font-black text-slate-900">{data.title}</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{data.description}</p>
        {data.buttonText && <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">{data.buttonText} →</span>}
      </div>
    </div>
  );

  if (type === 'testimonials') return (
    <div className="p-4 space-y-4">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      <div className="grid grid-cols-3 gap-4">
        {(data.reviews || []).map((r: any, i: number) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <div className="flex">{Array.from({ length: r.rating || 5 }).map((_, s) => <span key={s} className="text-amber-400 text-sm">★</span>)}</div>
            <p className="text-[10px] text-slate-600 italic">"{r.quote}"</p>
            <div className="pt-1 border-t border-slate-100">
              <strong className="text-xs text-slate-900">{r.author}</strong>
              <span className="text-[10px] text-slate-400 block">{r.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'faq') return (
    <div className="p-4 max-w-2xl mx-auto space-y-3">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      {data.subtitle && <p className="text-xs text-center text-slate-500">{data.subtitle}</p>}
      <div className="space-y-2">
        {(data.items || []).map((item: any, i: number) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white">
            <h4 className="font-bold text-xs text-slate-900 mb-1">{item.question}</h4>
            <p className="text-[10px] text-slate-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'newsletter') return (
    <div className={`p-8 rounded-2xl text-center space-y-3 ${data.bgDark ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200'}`}>
      <h3 className="text-lg font-black">{data.heading}</h3>
      <p className="text-xs opacity-70">{data.subtitle}</p>
      <div className="flex items-center gap-2 max-w-sm mx-auto">
        <div className={`flex-1 px-3 py-2 rounded-xl text-xs border ${data.bgDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-400'}`}>{data.placeholder || 'Enter email...'}</div>
        <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">{data.buttonText || 'Subscribe'}</span>
      </div>
    </div>
  );

  if (type === 'cta_banner') return (
    <div className="p-8 rounded-2xl text-white text-center space-y-4" style={{ backgroundColor: data.bgColor || '#0F172A' }}>
      <h3 className="text-xl font-black">{data.headline}</h3>
      <p className="text-xs opacity-70 max-w-md mx-auto">{data.subtitle}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {data.primaryButtonText && <span className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-lg">{data.primaryButtonText}</span>}
        {data.secondaryButtonText && <span className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold">{data.secondaryButtonText}</span>}
      </div>
    </div>
  );

  if (type === 'countdown') return (
    <div className={`p-6 rounded-2xl bg-gradient-to-r ${data.bgGradient || 'from-indigo-900 via-purple-900 to-slate-900'} text-white`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase">{data.badge}</span>
          <h3 className="text-lg font-black">{data.title}</h3>
          <p className="text-xs text-slate-300">Use code <strong className="text-amber-400 font-mono">{data.discountCode}</strong></p>
        </div>
        <span className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-black text-xs">{data.buttonText}</span>
      </div>
    </div>
  );

  if (type === 'rich_text') return (
    <div className="p-4 prose prose-slate max-w-none prose-headings:font-black prose-sm" dangerouslySetInnerHTML={{ __html: data.html || '<p class="text-slate-400 text-xs italic">No content yet. Edit in the inspector →</p>' }} />
  );

  if (type === 'video') return (
    <div className="p-4 space-y-3">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
        {data.videoUrl ? (
          <iframe src={data.videoUrl} className="w-full h-full" allowFullScreen title={data.heading} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 space-y-1 flex-col">
            <Video className="w-8 h-8" />
            <span className="text-xs">Paste embed URL in inspector</span>
          </div>
        )}
      </div>
    </div>
  );

  if (type === 'brand_logos') return (
    <div className="p-4 space-y-4">
      {data.heading && <h2 className="text-xs font-black text-center text-slate-400 uppercase tracking-widest">{data.heading}</h2>}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {(data.logos || []).map((l: any, i: number) => (
          l.imageUrl ? <img key={i} src={l.imageUrl} alt={l.name} className="h-7 w-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition" /> : <span key={i} className="text-xs font-black text-slate-400">{l.name}</span>
        ))}
      </div>
    </div>
  );

  if (type === 'featured_products') return (
    <div className="p-4 space-y-4">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      {data.subtitle && <p className="text-xs text-center text-slate-500">{data.subtitle}</p>}
      <div className={`grid grid-cols-${data.columns || 3} gap-4`}>
        {(data.products || []).map((p: any, i: number) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {p.image && <img src={p.image} alt={p.name} className="w-full h-32 object-cover" />}
            <div className="p-3 space-y-1">
              <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
              <span className="text-indigo-600 font-black text-sm">{p.price}</span>
            </div>
          </div>
        ))}
      </div>
      {data.ctaText && <div className="text-center"><span className="inline-block px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">{data.ctaText}</span></div>}
    </div>
  );

  if (type === 'stats') return (
    <div className="p-6 space-y-4">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      <div className="grid grid-cols-4 gap-4">
        {(data.stats || []).map((s: any, i: number) => (
          <div key={i} className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-2xl font-black text-indigo-600">{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'columns') return (
    <div className="p-4">
      <div className={`grid grid-cols-${(data.columns || []).length || 2} gap-6`}>
        {(data.columns || []).map((col: any, i: number) => (
          <div key={i} className="space-y-2">
            {col.heading && <h3 className="font-black text-sm text-slate-900">{col.heading}</h3>}
            <div className="prose prose-slate prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: col.content || '' }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (type === 'image_gallery') return (
    <div className="p-4 space-y-3">
      {data.heading && <h2 className="text-xl font-black text-center text-slate-900">{data.heading}</h2>}
      <div className={`grid grid-cols-${data.columns || 3} gap-3`}>
        {(data.images || []).map((img: any, i: number) => (
          <div key={i} className="rounded-2xl overflow-hidden aspect-square border border-slate-200">
            {img.url ? <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No image</div>}
          </div>
        ))}
      </div>
    </div>
  );

  return <div className="p-4 text-xs text-slate-400 italic">Unknown block type: {type}</div>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://serene-croissant-868f08.netlify.app';

export const PageBuilderStudio: React.FC<PageBuilderStudioProps> = ({ initialPage, isOpen, onClose, onSaved }) => {
  const [pageTitle, setPageTitle] = useState(initialPage?.title || 'New Page');
  const [pageSlug, setPageSlug] = useState(initialPage?.slug || '/pages/new-page');
  const [pageType, setPageType] = useState(initialPage?.pageType || 'CUSTOM');
  const [metaTitle, setMetaTitle] = useState(initialPage?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialPage?.metaDescription || '');
  const [pageStatus, setPageStatus] = useState(initialPage?.status || 'PUBLISHED');

  const pageRoute = (pageSlug || '').startsWith('/') ? pageSlug : `/${pageSlug}`;

  const [historyState, dispatch] = useReducer(historyReducer, {
    past: [],
    present: parseContentToBlocks(initialPage?.content),
    future: [],
  });
  const blocks = historyState.present;

  const setBlocks = useCallback((newBlocks: PageBlock[]) => {
    dispatch({ type: 'SET', blocks: newBlocks });
  }, []);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(blocks[0]?.id || null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [libCategory, setLibCategory] = useState<string>('all');
  const [libSearch, setLibSearch] = useState('');
  const [leftPanel, setLeftPanel] = useState<'library' | 'layers'>('library');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); dispatch({ type: 'REDO' }); }
      if (meta && e.key === 's') { e.preventDefault(); handleSavePage(); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, blocks, pageTitle, pageSlug]);

  const selectedBlock = blocks.find(b => b.id === activeBlockId) || null;

  const updateBlock = (id: string, data: Record<string, any>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data } : b));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) { showToast('Page must have at least one block.', 'error'); return; }
    const next = blocks.filter(b => b.id !== id);
    setBlocks(next);
    if (activeBlockId === id) setActiveBlockId(next[0]?.id || null);
  };

  const duplicateBlock = (block: PageBlock) => {
    const newBlock: PageBlock = { ...block, id: `block-${block.type}-${Date.now()}`, data: JSON.parse(JSON.stringify(block.data)) };
    const idx = blocks.findIndex(b => b.id === block.id);
    const next = [...blocks];
    next.splice(idx + 1, 0, newBlock);
    setBlocks(next);
    setActiveBlockId(newBlock.id);
    showToast(`Duplicated!`);
  };

  const toggleVisible = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, isVisible: !b.isVisible } : b));
  };

  const addBlock = (def: typeof BLOCK_LIBRARY[0]) => {
    const newBlock: PageBlock = {
      id: `block-${def.type}-${Date.now()}`,
      type: def.type,
      isVisible: true,
      data: JSON.parse(JSON.stringify(def.defaultData)),
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
    setShowAddPanel(false);
    showToast(`Added ${def.label}`);
  };

  // Drag reorder
  const onDragStart = (idx: number) => { dragIndexRef.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDropIndex(idx); };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === idx) { setDropIndex(null); return; }
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    setBlocks(next);
    dragIndexRef.current = null;
    setDropIndex(null);
  };
  const onDragEnd = () => { dragIndexRef.current = null; setDropIndex(null); };

  const handleSavePage = async () => {
    setIsSaving(true);
    try {
      const content = JSON.stringify(blocks);
      const slug = pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;
      const payload: PageFormData = {
        title: pageTitle,
        slug,
        content,
        pageType,
        metaTitle: metaTitle || pageTitle,
        metaDescription: metaDescription || `Explore ${pageTitle}.`,
        status: pageStatus,
      };

      if (initialPage?.id) {
        await cmsService.updatePage(initialPage.id, payload);
      } else {
        await cmsService.createPage(payload);
      }

      showToast(`"${pageTitle}" saved!`);
      onSaved();
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save page.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLibrary = BLOCK_LIBRARY.filter(def => {
    const matchCat = libCategory === 'all' || def.category === libCategory;
    const matchSearch = !libSearch || def.label.toLowerCase().includes(libSearch.toLowerCase()) || def.desc.toLowerCase().includes(libSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-white font-bold text-xs animate-in slide-in-from-bottom-5 border ${toast.type === 'error' ? 'bg-rose-600 border-rose-400' : 'bg-indigo-600 border-indigo-400'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
          {toast.text}
        </div>
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <header className="h-14 px-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0 gap-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
            <LayoutTemplate className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase text-indigo-400 tracking-wider leading-none mb-0.5">Page Builder</div>
            <input
              type="text"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              className="font-black text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 text-white hover:bg-slate-800/60 truncate max-w-[200px]"
            />
          </div>
          <div className="hidden md:flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="text-slate-600">Slug:</span>
            <input
              type="text"
              value={pageSlug}
              onChange={e => setPageSlug(e.target.value)}
              className="bg-transparent border-none text-indigo-400 font-bold focus:outline-none w-36"
            />
          </div>
        </div>

        {/* Center: Viewport + Undo/Redo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => dispatch({ type: 'UNDO' })} disabled={historyState.past.length === 0} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition">
              <Undo2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => dispatch({ type: 'REDO' })} disabled={historyState.future.length === 0} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {([['desktop', Laptop], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([vp, Icon]) => (
              <button key={vp} type="button" onClick={() => setViewport(vp)} title={vp} className={`p-1.5 rounded-lg transition-all ${viewport === vp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Live Preview + Settings + Save + Close */}
        <div className="flex items-center gap-2">
          <a
            href={`${STOREFRONT_URL}${pageRoute}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700 transition"
            title="Open Live Page on Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Site</span>
          </a>
          <button type="button" onClick={() => setShowPageSettings(s => !s)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${showPageSettings ? 'bg-slate-800 border-slate-700 text-white' : 'text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'}`}>
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Settings</span>
          </button>
          <button type="button" onClick={handleSavePage} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50">
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving…' : 'Save & Publish'}</span>
          </button>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── PAGE SETTINGS BAR ─────────────────────────────────────────── */}
      {showPageSettings && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-6 py-4 flex flex-wrap items-start gap-4 shrink-0">
          <div className="space-y-1 min-w-40">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Page Type</label>
            <select className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500" value={pageType} onChange={e => setPageType(e.target.value)}>
              <option value="CUSTOM">Custom Page</option>
              <option value="BRAND">Brand Page</option>
              <option value="POLICY">Policy Page</option>
              <option value="SYSTEM">System Page</option>
            </select>
          </div>
          <div className="space-y-1 min-w-40">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
            <select className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500" value={pageStatus} onChange={e => setPageStatus(e.target.value)}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-48">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SEO Title</label>
            <input className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="SEO page title..." />
          </div>
          <div className="space-y-1 flex-1 min-w-48">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SEO Description</label>
            <input className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="SEO meta description..." />
          </div>
        </div>
      )}

      {/* ── MAIN 3-PANEL WORKSPACE ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL: Library + Layers */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/90 flex flex-col shrink-0 overflow-hidden">
          {/* Panel tabs */}
          <div className="flex border-b border-slate-800 shrink-0">
            <button type="button" onClick={() => setLeftPanel('library')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${leftPanel === 'library' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}>
              <Grid3X3 className="w-3.5 h-3.5" /> Blocks
            </button>
            <button type="button" onClick={() => setLeftPanel('layers')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${leftPanel === 'layers' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}>
              <Layers className="w-3.5 h-3.5" /> Layers ({blocks.length})
            </button>
          </div>

          {leftPanel === 'library' && (
            <>
              {/* Search */}
              <div className="p-3 border-b border-slate-800 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input type="text" value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search blocks..." className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* Category filter */}
              <div className="flex gap-1 p-2 border-b border-slate-800 flex-wrap shrink-0">
                {BLOCK_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setLibCategory(cat.id)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${libCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{cat.label}</button>
                ))}
              </div>

              {/* Block grid */}
              <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                  {filteredLibrary.map(def => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => addBlock(def)}
                      title={def.desc}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/30 text-left transition-all group space-y-1.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition">
                        {def.icon}
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-white leading-tight">{def.label}</div>
                        <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{def.desc.split(' ').slice(0, 5).join(' ')}…</div>
                      </div>
                    </button>
                  ))}
                  {filteredLibrary.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-slate-600 text-xs">No blocks match your search</div>
                  )}
                </div>
              </div>
            </>
          )}

          {leftPanel === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
              {blocks.length === 0 && (
                <div className="py-8 text-center text-slate-600 text-xs">No blocks yet. Add blocks from the library.</div>
              )}
              {blocks.map((block, idx) => {
                const def = BLOCK_LIBRARY.find(d => d.type === block.type);
                const isSelected = block.id === activeBlockId;
                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e => onDragOver(e, idx)}
                    onDrop={e => onDrop(e, idx)}
                    onDragEnd={onDragEnd}
                    onClick={() => setActiveBlockId(block.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'} ${dropIndex === idx ? 'border-t-2 border-t-indigo-400' : ''}`}
                  >
                    <GripVertical className="w-3 h-3 text-slate-600 shrink-0 cursor-grab" />
                    <span className="w-5 h-5 flex items-center justify-center text-indigo-400 shrink-0">{def?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate capitalize">{block.type.replace(/_/g, ' ')}</div>
                      <div className="text-[9px] text-slate-500 truncate">
                        {block.data.headline || block.data.heading || block.data.title || block.data.html?.replace(/<[^>]*>/g, '').slice(0, 30) || '—'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleVisible(block.id); }}
                      className={`p-1 rounded shrink-0 ${block.isVisible ? 'text-emerald-400' : 'text-slate-600'}`}
                    >
                      {block.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* CENTER: CANVAS */}
        <main className="flex-1 bg-slate-950 overflow-y-auto flex flex-col items-center p-6">
          {/* Viewport wrapper */}
          <div
            className={`transition-all duration-300 bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 w-full ${
              viewport === 'desktop' ? 'max-w-5xl' : viewport === 'tablet' ? 'max-w-[768px]' : 'max-w-[390px]'
            }`}
          >
            {/* Mock browser chrome */}
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-[10px] font-mono text-slate-500 flex items-center gap-1 max-w-sm w-full">
                  <span className="text-emerald-500">🔒</span>
                  <span className="truncate">{STOREFRONT_URL.replace(/^https?:\/\//, '')}{pageRoute}</span>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700 mb-1">Start building your page</p>
                  <p className="text-xs text-slate-400">Click any block in the library to add it here</p>
                </div>
              </div>
            )}

            {/* Blocks */}
            <div className="divide-y divide-slate-100/50">
              {blocks.map((block, idx) => {
                const isActive = block.id === activeBlockId;
                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e => onDragOver(e, idx)}
                    onDrop={e => onDrop(e, idx)}
                    onDragEnd={onDragEnd}
                    onClick={() => setActiveBlockId(block.id)}
                    className={`relative cursor-pointer transition-all duration-150 ${
                      !block.isVisible ? 'opacity-30' : ''
                    } ${isActive ? 'ring-2 ring-inset ring-indigo-500' : 'hover:ring-1 hover:ring-inset hover:ring-indigo-300/50'} ${
                      dropIndex === idx ? 'border-t-2 border-indigo-400' : ''
                    }`}
                  >
                    {/* Active block toolbar */}
                    {isActive && (
                      <div className="absolute top-0 right-0 z-20 flex items-center gap-1 bg-indigo-600 text-white rounded-bl-xl px-2 py-1">
                        <span className="text-[9px] font-black uppercase tracking-wider mr-1">{block.type.replace(/_/g, ' ')}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); toggleVisible(block.id); }} className="p-0.5 hover:bg-indigo-500 rounded">
                          {block.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); duplicateBlock(block); }} className="p-0.5 hover:bg-indigo-500 rounded">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} className="p-0.5 hover:bg-rose-500 rounded text-rose-200">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {/* Drag handle */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                    </div>
                    <BlockPreview block={block} />
                  </div>
                );
              })}
            </div>

            {/* Add block button at bottom */}
            <div className="p-4 border-t border-slate-100 flex justify-center">
              <button
                type="button"
                onClick={() => { setLeftPanel('library'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" /> Add Block
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT: INSPECTOR */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 shrink-0">
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              {selectedBlock ? `${selectedBlock.type.replace(/_/g, ' ')} Settings` : 'Inspector'}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {selectedBlock ? (
              <BlockInspector
                block={selectedBlock}
                onUpdate={data => updateBlock(selectedBlock.id, data)}
                onDelete={() => deleteBlock(selectedBlock.id)}
                onDuplicate={() => duplicateBlock(selectedBlock)}
                onToggleVisible={() => toggleVisible(selectedBlock.id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">No block selected</p>
                  <p className="text-xs text-slate-600 mt-1">Click any block on the canvas to edit its properties</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

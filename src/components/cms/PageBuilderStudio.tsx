'use client';

import React, { useState, useCallback, useRef, useEffect, useReducer } from 'react';
import {
  X, Plus, Trash2, Copy, Eye, EyeOff, Laptop, Tablet, Smartphone,
  CheckCircle2, Save, Layers, Settings, LayoutTemplate, Undo2, Redo2,
  GripVertical, ChevronDown, ChevronRight, Grid3X3, Palette, Type,
  Image as ImageIcon, Video, Star, HelpCircle, Mail, ArrowRight, Zap,
  Quote, BarChart3, Columns, GalleryHorizontal, Package, Hash, AlignLeft,
  Search, Sparkles, AlertCircle, ExternalLink, Globe, SlidersHorizontal,
  Box, MousePointer, ShieldCheck, ShoppingCart, Percent,
  Clock, DollarSign, Minus, ChevronLeft, ArrowUpRight
} from 'lucide-react';
import { CMSPageData, PageFormData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import DragDropUpload from '@/src/components/ui/DragDropUpload';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type BlockType =
  // Basic HTML & Typography Primitives
  | 'heading'
  | 'span_badge'
  | 'container_box'
  | 'paragraph'
  | 'button_group'
  | 'divider_spacer'
  // Ecommerce & Sliders
  | 'image_slider'
  | 'product_slider'
  | 'announcement_bar'
  | 'pricing_table'
  | 'trust_badges'
  | 'banner_grid'
  | 'instagram_feed'
  | 'countdown_timer'
  // Layout, Content, Media & Marketing
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
  category: 'elements' | 'ecommerce' | 'layout' | 'content' | 'media' | 'marketing';
  icon: React.ReactNode;
  defaultData: Record<string, any>;
}[] = [
  // ── 1. Basic HTML & Typography Primitives ──
  {
    type: 'heading',
    label: 'Heading Tag (H1-H6)',
    desc: 'Semantic heading tag with custom styling, gradient text & alignment',
    category: 'elements',
    icon: <Type className="w-4 h-4" />,
    defaultData: {
      level: 'h2',
      text: 'Discover Our Signature Collection',
      eyebrow: 'SUMMER 2026',
      subtitle: 'Designed for effortless elegance and timeless everyday comfort.',
      textAlign: 'center',
      fontSize: '3xl',
      fontWeight: 'extrabold',
      textColor: '#0f172a',
      isGradient: false,
      gradientPreset: 'from-violet-600 to-indigo-600',
      hasUnderline: true,
    },
  },
  {
    type: 'span_badge',
    label: 'Span / Badge Tag',
    desc: 'Inline badge, pill label, promotion chip or announcement tag',
    category: 'elements',
    icon: <Sparkles className="w-4 h-4" />,
    defaultData: {
      text: '⚡ NEW ARRIVAL — LIMITED STOCK',
      variant: 'pill',
      colorPreset: 'violet',
      size: 'md',
      align: 'center',
      iconEmoji: '✨',
      linkUrl: '/products',
    },
  },
  {
    type: 'container_box',
    label: 'Div / Container Box',
    desc: 'Customizable div container with layout flex/grid, borders & shadows',
    category: 'elements',
    icon: <Box className="w-4 h-4" />,
    defaultData: {
      layout: 'flex_col',
      title: 'Custom Content Box',
      content: '<p class="text-slate-600">Place any text, promotion message, or nested component content inside this customizable container box.</p>',
      bgColor: '#f8fafc',
      padding: 'lg',
      borderRadius: '2xl',
      borderStyle: 'solid',
      borderColor: '#e2e8f0',
      shadow: 'sm',
      maxWidth: '4xl',
      gap: 'md',
    },
  },
  {
    type: 'paragraph',
    label: 'Paragraph Text',
    desc: 'Formatted paragraph text with lead styling and alignment',
    category: 'elements',
    icon: <AlignLeft className="w-4 h-4" />,
    defaultData: {
      text: 'Every product in our catalog is engineered to provide uncompromising quality, unmatched reliability, and modern luxury aesthetics built for discerning customers.',
      fontSize: 'base',
      textAlign: 'center',
      color: '#475569',
      isLead: false,
      lineHeight: 'relaxed',
      maxWidth: '2xl',
    },
  },
  {
    type: 'button_group',
    label: 'Buttons & CTA Group',
    desc: 'Single or multi-button call-to-actions with modern variants',
    category: 'elements',
    icon: <MousePointer className="w-4 h-4" />,
    defaultData: {
      align: 'center',
      gap: 'md',
      buttons: [
        { text: 'Shop All Products', url: '/products', variant: 'primary', size: 'md', icon: 'shopping-bag' },
        { text: 'Explore Collections', url: '/collections', variant: 'secondary', size: 'md', icon: 'arrow-right' },
      ],
    },
  },
  {
    type: 'divider_spacer',
    label: 'Divider & Spacer',
    desc: 'Decorative divider line, spacer, or branded separator',
    category: 'elements',
    icon: <Minus className="w-4 h-4" />,
    defaultData: {
      height: 48,
      style: 'solid',
      color: '#e2e8f0',
      iconText: '✦',
      showIcon: true,
    },
  },

  // ── 2. Ecommerce & Sliders ──
  {
    type: 'image_slider',
    label: 'Hero Banner Slider',
    desc: 'Multi-slide image carousel with autoplay, navigation & CTAs',
    category: 'ecommerce',
    icon: <SlidersHorizontal className="w-4 h-4" />,
    defaultData: {
      autoplay: true,
      interval: 5000,
      height: '520px',
      showArrows: true,
      showDots: true,
      slides: [
        {
          title: 'Unleash Next-Gen Performance',
          subtitle: 'Crafted for creators and innovators with aerospace-grade precision.',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80',
          overlayOpacity: 45,
          buttonText: 'Shop New Arrivals',
          buttonUrl: '/products',
          secondaryButtonText: 'Explore Lookbook',
          secondaryButtonUrl: '/pages/about',
          textAlign: 'center',
        },
        {
          title: 'Pure Aesthetic Elegance',
          subtitle: 'Designed to elevate your everyday lifestyle with seamless craftsmanship.',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
          overlayOpacity: 50,
          buttonText: 'Discover Collection',
          buttonUrl: '/collections',
          secondaryButtonText: 'Watch Video',
          secondaryButtonUrl: '#',
          textAlign: 'left',
        },
        {
          title: 'Exclusive Weekend Flash Drop',
          subtitle: 'Save up to 40% on top trending categories. Limited quantities available.',
          imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&q=80',
          overlayOpacity: 40,
          buttonText: 'Claim 40% Off',
          buttonUrl: '/products',
          secondaryButtonText: 'View Deals',
          secondaryButtonUrl: '/collections/sale',
          textAlign: 'right',
        },
      ],
    },
  },
  {
    type: 'product_slider',
    label: 'Product Carousel Slider',
    desc: 'Interactive sliding carousel of featured ecommerce products',
    category: 'ecommerce',
    icon: <ShoppingCart className="w-4 h-4" />,
    defaultData: {
      heading: 'Trending Bestsellers',
      subtitle: 'Customer favorites backed by thousands of 5-star reviews',
      items: [
        {
          name: 'Pro Wireless Active Earbuds',
          price: '$149.00',
          compareAtPrice: '$199.00',
          discount: '25% OFF',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          rating: 5,
          ratingCount: 320,
          badge: 'BESTSELLER',
          url: '/products',
        },
        {
          name: 'Titanium Smart Fitness Watch',
          price: '$299.00',
          compareAtPrice: '$349.00',
          discount: '15% OFF',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
          rating: 5,
          ratingCount: 184,
          badge: 'NEW DROP',
          url: '/products',
        },
        {
          name: 'Acoustic Studio ANC Headphones',
          price: '$249.00',
          compareAtPrice: '$329.00',
          discount: '24% OFF',
          image: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80',
          rating: 5,
          ratingCount: 245,
          badge: 'TRENDING',
          url: '/products',
        },
        {
          name: 'Minimalist Leather Carry Sleeve',
          price: '$79.00',
          compareAtPrice: '$99.00',
          discount: '20% OFF',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
          rating: 4,
          ratingCount: 96,
          badge: 'SALE',
          url: '/products',
        },
      ],
    },
  },
  {
    type: 'announcement_bar',
    label: 'Announcement & Promo Bar',
    desc: 'Header banner for flash deals, discounts, and coupon highlights',
    category: 'ecommerce',
    icon: <Percent className="w-4 h-4" />,
    defaultData: {
      badge: 'SPRING FLASH SALE',
      message: 'Take 20% OFF your entire order with code',
      couponCode: 'SPRING20',
      ctaText: 'Shop Sale',
      ctaUrl: '/products',
      bgColor: '#1e1b4b',
      textColor: '#ffffff',
      accentColor: '#fbbf24',
    },
  },
  {
    type: 'pricing_table',
    label: 'Pricing & Membership Table',
    desc: 'Side-by-side tier comparison cards with feature checkmarks',
    category: 'ecommerce',
    icon: <DollarSign className="w-4 h-4" />,
    defaultData: {
      heading: 'Flexible Membership Plans',
      subtitle: 'Unlock VIP perks, unlimited free shipping, and exclusive drops',
      plans: [
        {
          name: 'Basic Access',
          price: '$0',
          period: '/ forever',
          description: 'Standard access to seasonal drops and standard dispatch.',
          isPopular: false,
          features: ['Standard Shipping', 'Order Tracking', '30-Day Returns', 'Email Support'],
          buttonText: 'Create Account',
          buttonUrl: '/auth/signup',
        },
        {
          name: 'VIP Club Member',
          price: '$19',
          period: '/ month',
          description: 'For passionate enthusiasts seeking fastest shipping and perks.',
          isPopular: true,
          features: ['Free Express Overnight Shipping', '20% Off All Accessories', 'Early Access to Drops (24h Ahead)', 'Dedicated VIP Concierge Support', 'Free Gift with Every Order'],
          buttonText: 'Join VIP Club',
          buttonUrl: '/checkout',
        },
        {
          name: 'Annual Pass',
          price: '$149',
          period: '/ year',
          description: 'Best value for frequent shoppers with maximum savings.',
          isPopular: false,
          features: ['Everything in VIP Club', 'Exclusive Annual Mystery Box ($100 Value)', 'Free Personalized Monogramming', 'Lifetime Warranty on Select Gear'],
          buttonText: 'Get Annual Pass',
          buttonUrl: '/checkout',
        },
      ],
    },
  },
  {
    type: 'trust_badges',
    label: 'Trust Badges & Security Bar',
    desc: 'Highlights secure checkout, guarantees, free shipping & payment methods',
    category: 'ecommerce',
    icon: <ShieldCheck className="w-4 h-4" />,
    defaultData: {
      heading: 'Why You Can Shop with Confidence',
      badges: [
        { icon: '🛡️', title: '256-Bit SSL Encryption', desc: 'Bank-grade checkout protection' },
        { icon: '🚚', title: 'Free Global Express', desc: 'On all orders above $75' },
        { icon: '🔄', title: '30-Day Money-Back', desc: 'No questions asked returns' },
        { icon: '💬', title: '24/7 Human Support', desc: 'Live chat & phone assistance' },
      ],
      showPaymentIcons: true,
    },
  },
  {
    type: 'banner_grid',
    label: 'Category Banner Grid',
    desc: 'Visual multi-column category tiles with hover effects and shop links',
    category: 'ecommerce',
    icon: <Package className="w-4 h-4" />,
    defaultData: {
      heading: 'Explore Popular Categories',
      columns: 3,
      banners: [
        {
          title: 'Footwear & Runners',
          subtitle: 'Over 140+ Styles',
          badge: 'POPULAR',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
          url: '/collections/footwear',
          height: '320px',
        },
        {
          title: 'Smart Tech Gear',
          subtitle: 'Engineered Precision',
          badge: 'NEW',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          url: '/collections/tech',
          height: '320px',
        },
        {
          title: 'Audio & Acoustics',
          subtitle: 'Pure High-Fidelity Sound',
          badge: 'SAVE 30%',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          url: '/collections/audio',
          height: '320px',
        },
      ],
    },
  },
  {
    type: 'instagram_feed',
    label: 'Instagram & Social Wall',
    desc: 'Lifestyle social photo gallery with handles, likes and modal preview',
    category: 'media',
    icon: <InstagramIcon className="w-4 h-4" />,
    defaultData: {
      heading: 'Follow Us on Instagram',
      handle: '@store_official',
      subtitle: 'Tag your photos with #MyStyle to be featured on our official feed',
      items: [
        { imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', likes: '1.4k', comments: '98', caption: 'Summer drop styling ✨' },
        { imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80', likes: '2.8k', comments: '142', caption: 'Everyday essentials curated.' },
        { imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80', likes: '980', comments: '64', caption: 'Crafted with premium cotton.' },
        { imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80', likes: '3.1k', comments: '210', caption: 'Minimal silhouettes in motion.' },
      ],
    },
  },
  {
    type: 'countdown_timer',
    label: 'Flash Sale Urgency Timer',
    desc: 'Live countdown timer block with discount code and urgency styling',
    category: 'marketing',
    icon: <Clock className="w-4 h-4" />,
    defaultData: {
      badge: 'LIMITED TIME ONLY',
      title: 'Midnight Flash Sale Ends Soon',
      subtitle: 'Claim an extra 35% off your basket before the clock expires.',
      discountCode: 'FLASH35',
      buttonText: 'Shop The Sale Now',
      buttonUrl: '/products',
      targetHours: 18,
      bgGradient: 'from-violet-950 via-indigo-900 to-slate-950',
    },
  },

  // ── 3. Layout & Content Blocks ──
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
    label: 'Flash Sale (Legacy)',
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
    label: 'Rich Text / HTML',
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
    label: 'Featured Products Grid',
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
  { id: 'elements', label: 'Basic Elements' },
  { id: 'ecommerce', label: 'Ecommerce & Sliders' },
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

      {/* ── HEADING TAG (H1-H6) ── */}
      {type === 'heading' && (
        <>
          <Field label="Heading Tag Level">
            <div className="grid grid-cols-6 gap-1">
              {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => set('level', lvl)}
                  className={`py-1.5 rounded-lg font-black text-xs uppercase border transition ${
                    data.level === lvl ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Heading Text">
            <input className={inputCls} value={data.text || ''} onChange={e => set('text', e.target.value)} placeholder="Main heading text..." />
          </Field>
          <Field label="Eyebrow / Top Tag (optional)">
            <input className={inputCls} value={data.eyebrow || ''} onChange={e => set('eyebrow', e.target.value)} placeholder="e.g. SUMMER 2026" />
          </Field>
          <Field label="Subtitle / Description (optional)">
            <textarea className={inputCls} rows={2} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="Subordinate supporting text..." />
          </Field>
          <Field label="Text Alignment">
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set('textAlign', a)}
                  className={`flex-1 py-1.5 rounded-lg font-bold capitalize border transition ${
                    data.textAlign === a ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Font Size">
            <select className={inputCls} value={data.fontSize || '3xl'} onChange={e => set('fontSize', e.target.value)}>
              <option value="xl">Extra Large (XL)</option>
              <option value="2xl">2X Large (2XL)</option>
              <option value="3xl">3X Large (3XL)</option>
              <option value="4xl">4X Large (4XL)</option>
              <option value="5xl">5X Large (5XL)</option>
              <option value="6xl">6X Giant (6XL)</option>
            </select>
          </Field>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Gradient Text Effect</span>
              <span className="text-[10px] text-slate-400">Apply vibrant gradient colors across heading</span>
            </div>
            <input
              type="checkbox"
              checked={Boolean(data.isGradient)}
              onChange={e => set('isGradient', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Decorative Bottom Accent</span>
              <span className="text-[10px] text-slate-400">Show subtle center accent underline</span>
            </div>
            <input
              type="checkbox"
              checked={Boolean(data.hasUnderline)}
              onChange={e => set('hasUnderline', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
        </>
      )}

      {/* ── SPAN / BADGE TAG ── */}
      {type === 'span_badge' && (
        <>
          <Field label="Badge Text">
            <input className={inputCls} value={data.text || ''} onChange={e => set('text', e.target.value)} placeholder="e.g. FLASH SALE 50% OFF" />
          </Field>
          <Field label="Icon / Emoji">
            <input className={inputCls} value={data.iconEmoji || ''} onChange={e => set('iconEmoji', e.target.value)} placeholder="✨ or 🔥 or ⚡" />
          </Field>
          <Field label="Color Theme">
            <div className="grid grid-cols-3 gap-2">
              {['violet', 'emerald', 'rose', 'amber', 'blue', 'slate'].map(cp => (
                <button
                  key={cp}
                  type="button"
                  onClick={() => set('colorPreset', cp)}
                  className={`py-1.5 rounded-lg font-bold capitalize border transition ${
                    data.colorPreset === cp ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {cp}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Shape Style">
            <div className="grid grid-cols-3 gap-2">
              {['pill', 'rounded', 'square'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('variant', v)}
                  className={`py-1.5 rounded-lg font-bold capitalize border transition ${
                    data.variant === v ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Target Link URL (optional)">
            <input className={`${inputCls} font-mono`} value={data.linkUrl || ''} onChange={e => set('linkUrl', e.target.value)} placeholder="/products or /collections" />
          </Field>
        </>
      )}

      {/* ── DIV / CONTAINER BOX ── */}
      {type === 'container_box' && (
        <>
          <Field label="Container Layout">
            <select className={inputCls} value={data.layout || 'flex_col'} onChange={e => set('layout', e.target.value)}>
              <option value="flex_col">Vertical Column (Flex Col)</option>
              <option value="flex_row">Horizontal Row (Flex Row)</option>
              <option value="grid_2">2-Column Grid</option>
              <option value="grid_3">3-Column Grid</option>
              <option value="grid_4">4-Column Grid</option>
            </select>
          </Field>
          <Field label="Inner HTML / Text Content">
            <textarea className={inputCls} rows={4} value={data.content || ''} onChange={e => set('content', e.target.value)} placeholder="<p>HTML or text content...</p>" />
          </Field>
          <Field label="Background Color (Hex)">
            <div className="flex items-center gap-2">
              <input type="color" value={data.bgColor?.startsWith('#') ? data.bgColor : '#f8fafc'} onChange={e => set('bgColor', e.target.value)} className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer" />
              <input className={`${inputCls} font-mono flex-1`} value={data.bgColor || '#f8fafc'} onChange={e => set('bgColor', e.target.value)} />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Padding">
              <select className={inputCls} value={data.padding || 'lg'} onChange={e => set('padding', e.target.value)}>
                <option value="none">None (0)</option>
                <option value="sm">Small (12px)</option>
                <option value="md">Medium (20px)</option>
                <option value="lg">Large (32px)</option>
                <option value="xl">Extra Large (48px)</option>
              </select>
            </Field>
            <Field label="Border Radius">
              <select className={inputCls} value={data.borderRadius || '2xl'} onChange={e => set('borderRadius', e.target.value)}>
                <option value="none">Square (0)</option>
                <option value="md">Medium (8px)</option>
                <option value="xl">Large (16px)</option>
                <option value="2xl">2X Large (24px)</option>
                <option value="3xl">3X Large (32px)</option>
              </select>
            </Field>
          </div>
          <Field label="Border Style">
            <div className="flex gap-2">
              {['none', 'solid', 'dashed'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set('borderStyle', b)}
                  className={`flex-1 py-1.5 rounded-lg font-bold capitalize border transition ${
                    data.borderStyle === b ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {/* ── PARAGRAPH TEXT ── */}
      {type === 'paragraph' && (
        <>
          <Field label="Paragraph Content">
            <textarea className={inputCls} rows={4} value={data.text || ''} onChange={e => set('text', e.target.value)} placeholder="Write your paragraph..." />
          </Field>
          <Field label="Font Size">
            <select className={inputCls} value={data.fontSize || 'base'} onChange={e => set('fontSize', e.target.value)}>
              <option value="xs">Small (XS)</option>
              <option value="sm">Medium (SM)</option>
              <option value="base">Standard (Base)</option>
              <option value="lg">Large (LG)</option>
              <option value="xl">Lead Text (XL)</option>
            </select>
          </Field>
          <Field label="Text Alignment">
            <div className="flex gap-2">
              {['left', 'center', 'right', 'justify'].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set('textAlign', a)}
                  className={`flex-1 py-1.5 rounded-lg font-bold capitalize border transition ${
                    data.textAlign === a ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {/* ── BUTTON GROUP ── */}
      {type === 'button_group' && (
        <>
          <Field label="Buttons Alignment">
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set('align', a)}
                  className={`flex-1 py-1.5 rounded-lg font-bold capitalize border transition ${
                    data.align === a ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Buttons List</label>
            {(data.buttons || []).map((btn: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={inputCls} value={btn.text || ''} onChange={e => updateListItem('buttons', i, 'text', e.target.value)} placeholder="Button Text" />
                  <button type="button" onClick={() => removeListItem('buttons', i)} className="p-1 text-rose-400 hover:text-rose-300 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input className={`${inputCls} font-mono`} value={btn.url || ''} onChange={e => updateListItem('buttons', i, 'url', e.target.value)} placeholder="/products" />
                <div className="grid grid-cols-2 gap-2">
                  <select className={inputCls} value={btn.variant || 'primary'} onChange={e => updateListItem('buttons', i, 'variant', e.target.value)}>
                    <option value="primary">Primary Dark</option>
                    <option value="secondary">Secondary Light</option>
                    <option value="outline">Outline Border</option>
                    <option value="glow">Vibrant Violet</option>
                  </select>
                  <select className={inputCls} value={btn.size || 'md'} onChange={e => updateListItem('buttons', i, 'size', e.target.value)}>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('buttons', { text: 'New Button', url: '/products', variant: 'primary', size: 'md' })}
              className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add CTA Button
            </button>
          </div>
        </>
      )}

      {/* ── HERO BANNER SLIDER (CAROUSEL) ── */}
      {type === 'image_slider' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Banner Height">
              <select className={inputCls} value={data.height || '520px'} onChange={e => set('height', e.target.value)}>
                <option value="420px">Compact (420px)</option>
                <option value="520px">Standard (520px)</option>
                <option value="620px">Immersive (620px)</option>
              </select>
            </Field>
            <Field label="Auto Slide Interval">
              <select className={inputCls} value={data.interval || 5000} onChange={e => set('interval', Number(e.target.value))}>
                <option value={3000}>3 Seconds</option>
                <option value={5000}>5 Seconds</option>
                <option value={7000}>7 Seconds</option>
              </select>
            </Field>
          </div>
          <div className="space-y-4">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Carousel Slides</label>
            {(data.slides || []).map((s: any, i: number) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-white text-xs">Slide #{i + 1}</span>
                  <button type="button" onClick={() => removeListItem('slides', i)} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <Field label="Slide Headline">
                  <input className={inputCls} value={s.title || ''} onChange={e => updateListItem('slides', i, 'title', e.target.value)} placeholder="Headline..." />
                </Field>
                <Field label="Slide Subtitle">
                  <textarea className={inputCls} rows={2} value={s.subtitle || ''} onChange={e => updateListItem('slides', i, 'subtitle', e.target.value)} placeholder="Subtitle..." />
                </Field>
                <Field label="Background Image URL">
                  <input className={`${inputCls} font-mono`} value={s.imageUrl || ''} onChange={e => updateListItem('slides', i, 'imageUrl', e.target.value)} placeholder="https://images.unsplash.com/..." />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="CTA Button Text">
                    <input className={inputCls} value={s.buttonText || ''} onChange={e => updateListItem('slides', i, 'buttonText', e.target.value)} />
                  </Field>
                  <Field label="CTA URL">
                    <input className={`${inputCls} font-mono`} value={s.buttonUrl || ''} onChange={e => updateListItem('slides', i, 'buttonUrl', e.target.value)} />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('slides', {
                title: 'New Promotional Slide',
                subtitle: 'Add compelling subtitle and calls to action.',
                imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
                buttonText: 'Shop Now',
                buttonUrl: '/products',
                textAlign: 'center',
              })}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Slide to Carousel
            </button>
          </div>
        </>
      )}

      {/* ── PRODUCT CAROUSEL SLIDER ── */}
      {type === 'product_slider' && (
        <>
          <Field label="Section Heading">
            <input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />
          </Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Products In Slider</label>
            {(data.items || []).map((p: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <input className={inputCls} value={p.name || ''} onChange={e => updateListItem('items', i, 'name', e.target.value)} placeholder="Product Name" />
                  <button type="button" onClick={() => removeListItem('items', i)} className="p-1 text-rose-400 ml-2 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} value={p.price || ''} onChange={e => updateListItem('items', i, 'price', e.target.value)} placeholder="Price e.g. $99" />
                  <input className={inputCls} value={p.badge || ''} onChange={e => updateListItem('items', i, 'badge', e.target.value)} placeholder="Badge e.g. HOT" />
                </div>
                <input className={`${inputCls} font-mono`} value={p.image || ''} onChange={e => updateListItem('items', i, 'image', e.target.value)} placeholder="Image URL" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('items', {
                name: 'New Featured Product',
                price: '$129.00',
                compareAtPrice: '$169.00',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
                badge: 'NEW',
                rating: 5,
                url: '/products',
              })}
              className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product Card
            </button>
          </div>
        </>
      )}

      {/* ── ANNOUNCEMENT & PROMO BAR ── */}
      {type === 'announcement_bar' && (
        <>
          <Field label="Badge Text">
            <input className={inputCls} value={data.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="FLASH SALE" />
          </Field>
          <Field label="Message Text">
            <input className={inputCls} value={data.message || ''} onChange={e => set('message', e.target.value)} placeholder="Save 20% on all orders" />
          </Field>
          <Field label="Promo / Coupon Code (optional)">
            <input className={`${inputCls} font-mono font-bold uppercase`} value={data.couponCode || ''} onChange={e => set('couponCode', e.target.value.toUpperCase())} placeholder="SAVE20" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="CTA Button Text">
              <input className={inputCls} value={data.ctaText || ''} onChange={e => set('ctaText', e.target.value)} />
            </Field>
            <Field label="CTA URL">
              <input className={`${inputCls} font-mono`} value={data.ctaUrl || ''} onChange={e => set('ctaUrl', e.target.value)} />
            </Field>
          </div>
        </>
      )}

      {/* ── PRICING TABLE ── */}
      {type === 'pricing_table' && (
        <>
          <Field label="Section Heading">
            <input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />
          </Field>
          <Field label="Display Layout">
            <select
              className={inputCls}
              value={data.layout || 'grid'}
              onChange={e => set('layout', e.target.value)}
            >
              <option value="grid">Multi-Column Grid</option>
              <option value="swiper">Interactive Swiper / Carousel</option>
            </select>
          </Field>
          <div className="space-y-4">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pricing Plans</label>
            {(data.plans || []).map((plan: any, i: number) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <input className={inputCls} value={plan.name || ''} onChange={e => updateListItem('plans', i, 'name', e.target.value)} placeholder="Plan Name" />
                  <button type="button" onClick={() => removeListItem('plans', i)} className="text-rose-400 hover:text-rose-300 ml-2 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} value={plan.price || ''} onChange={e => updateListItem('plans', i, 'price', e.target.value)} placeholder="Price e.g. $29" />
                  <input className={inputCls} value={plan.period || ''} onChange={e => updateListItem('plans', i, 'period', e.target.value)} placeholder="/ month" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-300 font-medium">Highlight / Popular</span>
                  <input type="checkbox" checked={Boolean(plan.isPopular)} onChange={e => updateListItem('plans', i, 'isPopular', e.target.checked)} className="accent-indigo-600 rounded" />
                </div>
                <Field label="Features (comma separated)">
                  <input
                    className={inputCls}
                    value={Array.isArray(plan.features) ? plan.features.join(', ') : plan.features || ''}
                    onChange={e => updateListItem('plans', i, 'features', e.target.value.split(',').map((s: string) => s.trim()))}
                    placeholder="Free Shipping, 24/7 Support, VIP Perks"
                  />
                </Field>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('plans', {
                name: 'New Tier',
                price: '$49',
                period: '/ month',
                description: 'Tier description here.',
                features: ['Feature 1', 'Feature 2', 'Feature 3'],
                buttonText: 'Select Plan',
                buttonUrl: '/checkout',
              })}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Pricing Tier
            </button>
          </div>
        </>
      )}

      {/* ── TRUST BADGES ── */}
      {type === 'trust_badges' && (
        <>
          <Field label="Section Heading">
            <input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} />
          </Field>
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Trust Badges</label>
            {(data.badges || []).map((b: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input className={`${inputCls} w-14 text-center text-lg p-1`} value={b.icon || ''} onChange={e => updateListItem('badges', i, 'icon', e.target.value)} placeholder="🛡️" />
                  <input className={inputCls} value={b.title || ''} onChange={e => updateListItem('badges', i, 'title', e.target.value)} placeholder="Badge Title" />
                  <button type="button" onClick={() => removeListItem('badges', i)} className="p-1 text-rose-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <input className={inputCls} value={b.desc || ''} onChange={e => updateListItem('badges', i, 'desc', e.target.value)} placeholder="Description..." />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('badges', { icon: '⭐', title: 'Quality Guarantee', desc: 'Verified 5-star customer experience' })}
              className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Trust Badge
            </button>
          </div>
        </>
      )}

      {/* ── BANNER GRID ── */}
      {type === 'banner_grid' && (
        <>
          <Field label="Section Heading">
            <input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} />
          </Field>
          <Field label="Columns (2, 3, or 4)">
            <div className="flex gap-2">
              {[2, 3, 4].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('columns', c)}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                    data.columns === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {c} Columns
                </button>
              ))}
            </div>
          </Field>
          <div className="space-y-3">
            {(data.banners || []).map((b: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <input className={inputCls} value={b.title || ''} onChange={e => updateListItem('banners', i, 'title', e.target.value)} placeholder="Category Title" />
                  <button type="button" onClick={() => removeListItem('banners', i)} className="p-1 text-rose-400 ml-2 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} value={b.subtitle || ''} onChange={e => updateListItem('banners', i, 'subtitle', e.target.value)} placeholder="Subtitle" />
                  <input className={inputCls} value={b.badge || ''} onChange={e => updateListItem('banners', i, 'badge', e.target.value)} placeholder="Badge e.g. NEW" />
                </div>
                <input className={`${inputCls} font-mono`} value={b.imageUrl || ''} onChange={e => updateListItem('banners', i, 'imageUrl', e.target.value)} placeholder="Banner Image URL" />
                <input className={`${inputCls} font-mono`} value={b.url || ''} onChange={e => updateListItem('banners', i, 'url', e.target.value)} placeholder="Target URL e.g. /collections/women" />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('banners', {
                title: 'New Collection',
                subtitle: 'Discover more styles',
                badge: 'TRENDING',
                imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
                url: '/collections',
              })}
              className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category Banner
            </button>
          </div>
        </>
      )}

      {/* ── INSTAGRAM / SOCIAL WALL ── */}
      {type === 'instagram_feed' && (
        <>
          <Field label="Section Heading">
            <input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} />
          </Field>
          <Field label="Instagram Handle">
            <input className={inputCls} value={data.handle || ''} onChange={e => set('handle', e.target.value)} placeholder="@brand_official" />
          </Field>
          <Field label="Subtitle / Tagline">
            <input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />
          </Field>
          <div className="space-y-3">
            {(data.items || []).map((it: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <input className={`${inputCls} font-mono`} value={it.imageUrl || ''} onChange={e => updateListItem('items', i, 'imageUrl', e.target.value)} placeholder="Image URL" />
                  <button type="button" onClick={() => removeListItem('items', i)} className="p-1 text-rose-400 ml-2 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} value={it.likes || ''} onChange={e => updateListItem('items', i, 'likes', e.target.value)} placeholder="Likes count e.g. 1.2k" />
                  <input className={inputCls} value={it.comments || ''} onChange={e => updateListItem('items', i, 'comments', e.target.value)} placeholder="Comments e.g. 48" />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('items', {
                imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
                likes: '1.2k',
                comments: '56',
                caption: 'Community lookbook',
              })}
              className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Social Photo
            </button>
          </div>
        </>
      )}

      {/* ── COUNTDOWN TIMER BANNER ── */}
      {type === 'countdown_timer' && (
        <>
          <Field label="Urgency Badge">
            <input className={inputCls} value={data.badge || ''} onChange={e => set('badge', e.target.value)} />
          </Field>
          <Field label="Sale Title">
            <input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <textarea className={inputCls} rows={2} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />
          </Field>
          <Field label="Promo Code">
            <input className={`${inputCls} font-mono font-bold uppercase`} value={data.discountCode || ''} onChange={e => set('discountCode', e.target.value.toUpperCase())} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="CTA Button Text">
              <input className={inputCls} value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)} />
            </Field>
            <Field label="CTA URL">
              <input className={`${inputCls} font-mono`} value={data.buttonUrl || ''} onChange={e => set('buttonUrl', e.target.value)} />
            </Field>
          </div>
        </>
      )}

      {/* ── HERO ── */}
      {type === 'hero' && (
        <>
          <Field label="Headline"><input className={inputCls} value={data.headline || ''} onChange={e => set('headline', e.target.value)} /></Field>
          <Field label="Subtitle"><textarea className={inputCls} rows={3} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <div className="space-y-1.5 pt-1 pb-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Hero Background Image</label>
            <DragDropUpload
              folder="hero"
              fileType="IMAGE"
              currentUrl={data.backgroundImage || undefined}
              onUploadComplete={(url) => set('backgroundImage', url)}
              hint="Drag & drop JPG, PNG, or WebP (max 10MB)"
              previewShape="rect"
              maxSizeMB={10}
            />
            <div className="pt-1">
              <label className="block text-[10px] text-slate-500 font-medium mb-1">Or direct image URL</label>
              <input className={`${inputCls} font-mono`} value={data.backgroundImage || ''} onChange={e => set('backgroundImage', e.target.value)} placeholder="https://images.unsplash.com/..." />
            </div>
          </div>
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

      {/* ── VALUE PROPS ── */}
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

      {/* ── IMAGE & TEXT ── */}
      {type === 'image_text' && (
        <>
          <Field label="Tagline (optional)"><input className={inputCls} value={data.tagline || ''} onChange={e => set('tagline', e.target.value)} /></Field>
          <Field label="Heading"><input className={inputCls} value={data.title || ''} onChange={e => set('title', e.target.value)} /></Field>
          <Field label="Description"><textarea className={inputCls} rows={4} value={data.description || ''} onChange={e => set('description', e.target.value)} /></Field>
          <div className="space-y-1.5 pt-1 pb-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Section Image</label>
            <DragDropUpload
              folder="pages"
              fileType="IMAGE"
              currentUrl={data.imageUrl || undefined}
              onUploadComplete={(url) => set('imageUrl', url)}
              hint="Drag & drop JPG, PNG, or WebP (max 10MB)"
              previewShape="rect"
              maxSizeMB={10}
            />
            <div className="pt-1">
              <label className="block text-[10px] text-slate-500 font-medium mb-1">Or direct image URL</label>
              <input className={`${inputCls} font-mono`} value={data.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://images.unsplash.com/..." />
            </div>
          </div>
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

      {/* ── TESTIMONIALS ── */}
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

      {/* ── FAQ ── */}
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

      {/* ── NEWSLETTER ── */}
      {type === 'newsletter' && (
        <>
          <Field label="Heading"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Subtitle"><input className={inputCls} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <Field label="Input Placeholder"><input className={inputCls} value={data.placeholder || ''} onChange={e => set('placeholder', e.target.value)} /></Field>
          <Field label="Button Text"><input className={inputCls} value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></Field>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-bold text-white">Dark Background Style</span>
            <input type="checkbox" checked={Boolean(data.bgDark)} onChange={e => set('bgDark', e.target.checked)} className="w-4 h-4 accent-indigo-600 rounded" />
          </div>
        </>
      )}

      {/* ── CTA BANNER ── */}
      {type === 'cta_banner' && (
        <>
          <Field label="Headline"><input className={inputCls} value={data.headline || ''} onChange={e => set('headline', e.target.value)} /></Field>
          <Field label="Subtitle"><textarea className={inputCls} rows={2} value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} /></Field>
          <Field label="Primary Button Text"><input className={inputCls} value={data.primaryButtonText || ''} onChange={e => set('primaryButtonText', e.target.value)} /></Field>
          <Field label="Primary Button URL"><input className={`${inputCls} font-mono`} value={data.primaryButtonUrl || ''} onChange={e => set('primaryButtonUrl', e.target.value)} /></Field>
          <Field label="Secondary Button Text"><input className={inputCls} value={data.secondaryButtonText || ''} onChange={e => set('secondaryButtonText', e.target.value)} /></Field>
          <Field label="Secondary Button URL"><input className={`${inputCls} font-mono`} value={data.secondaryButtonUrl || ''} onChange={e => set('secondaryButtonUrl', e.target.value)} /></Field>
        </>
      )}

      {/* ── RICH TEXT ── */}
      {type === 'rich_text' && (
        <Field label="HTML Content">
          <textarea className={`${inputCls} font-mono`} rows={8} value={data.html || ''} onChange={e => set('html', e.target.value)} />
        </Field>
      )}

      {/* ── VIDEO EMBED ── */}
      {type === 'video' && (
        <>
          <Field label="Heading (optional)"><input className={inputCls} value={data.heading || ''} onChange={e => set('heading', e.target.value)} /></Field>
          <Field label="Embed URL (YouTube / Vimeo / MP4)"><input className={`${inputCls} font-mono`} value={data.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} /></Field>
        </>
      )}
    </div>
  );
}

// ─── Block Live Visual Canvas Preview ───────────────────────────────────────

function BlockPreview({ block }: { block: PageBlock }) {
  const { type, data } = block;
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // 1. HEADING TAG (H1-H6)
  if (type === 'heading') {
    const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(data.level) ? data.level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const sizeCls = {
      xl: 'text-xl',
      '2xl': 'text-2xl sm:text-3xl',
      '3xl': 'text-3xl sm:text-4xl',
      '4xl': 'text-4xl sm:text-5xl',
      '5xl': 'text-5xl sm:text-6xl',
      '6xl': 'text-6xl sm:text-7xl',
    }[data.fontSize as string] || 'text-3xl sm:text-4xl';

    return (
      <div className={`py-6 px-4 text-${data.textAlign || 'center'} space-y-2`}>
        {data.eyebrow && (
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[11px] tracking-wider uppercase mb-1">
            {data.eyebrow}
          </div>
        )}
        <Tag
          className={`font-black tracking-tight leading-tight ${sizeCls} ${
            data.isGradient
              ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent'
              : 'text-slate-900'
          }`}
        >
          {data.text || 'Heading Title'}
        </Tag>
        {data.subtitle && (
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed mt-1">
            {data.subtitle}
          </p>
        )}
        {data.hasUnderline && (
          <div className={`w-16 h-1 rounded-full bg-indigo-600 mt-3 ${data.textAlign === 'left' ? '' : data.textAlign === 'right' ? 'ml-auto' : 'mx-auto'}`} />
        )}
      </div>
    );
  }

  // 2. SPAN / BADGE TAG
  if (type === 'span_badge') {
    const colorClasses: Record<string, string> = {
      violet: 'bg-violet-100 text-violet-800 border-violet-200',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rose: 'bg-rose-100 text-rose-800 border-rose-200',
      amber: 'bg-amber-100 text-amber-900 border-amber-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      slate: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    const shapeClasses: Record<string, string> = {
      pill: 'rounded-full',
      rounded: 'rounded-xl',
      square: 'rounded-none',
    };
    const activeColor = colorClasses[data.colorPreset || 'violet'] || colorClasses.violet;
    const activeShape = shapeClasses[data.variant || 'pill'] || shapeClasses.pill;

    return (
      <div className={`p-4 flex justify-${data.align === 'left' ? 'start' : data.align === 'right' ? 'end' : 'center'}`}>
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black tracking-wide uppercase border shadow-xs ${activeColor} ${activeShape}`}>
          {data.iconEmoji && <span>{data.iconEmoji}</span>}
          <span>{data.text || 'PROMOTIONAL BADGE'}</span>
        </span>
      </div>
    );
  }

  // 3. DIV / CONTAINER BOX
  if (type === 'container_box') {
    return (
      <div className="p-4 flex justify-center">
        <div
          className={`w-full max-w-${data.maxWidth || '4xl'} p-6 rounded-2xl border transition`}
          style={{
            backgroundColor: data.bgColor || '#f8fafc',
            borderColor: data.borderColor || '#e2e8f0',
            borderStyle: data.borderStyle === 'none' ? 'none' : data.borderStyle || 'solid',
          }}
        >
          {data.title && <h3 className="text-base font-bold text-slate-900 mb-2">{data.title}</h3>}
          <div className="prose prose-slate prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.content || '<p class="text-slate-500">Container text...</p>' }} />
        </div>
      </div>
    );
  }

  // 4. PARAGRAPH TEXT
  if (type === 'paragraph') {
    return (
      <div className={`p-4 text-${data.textAlign || 'center'}`}>
        <p className={`text-${data.fontSize || 'base'} text-slate-600 leading-${data.lineHeight || 'relaxed'} max-w-3xl mx-auto font-medium`}>
          {data.text || 'Write your paragraph text here...'}
        </p>
      </div>
    );
  }

  // 5. BUTTON GROUP
  if (type === 'button_group') {
    return (
      <div className={`p-4 flex flex-wrap gap-3 justify-${data.align === 'left' ? 'start' : data.align === 'right' ? 'end' : 'center'}`}>
        {(data.buttons || []).map((b: any, i: number) => {
          let styleClass = 'bg-slate-900 text-white hover:bg-slate-800';
          if (b.variant === 'secondary') styleClass = 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300';
          if (b.variant === 'outline') styleClass = 'bg-transparent text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white';
          if (b.variant === 'glow') styleClass = 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700';

          return (
            <span key={i} className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition ${styleClass}`}>
              <span>{b.text || 'Button'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          );
        })}
      </div>
    );
  }

  // 6. DIVIDER / SPACER
  if (type === 'divider_spacer') {
    return (
      <div className="px-6 flex items-center justify-center relative" style={{ height: `${data.height || 48}px` }}>
        <div className="w-full border-t border-slate-200" />
        {data.showIcon && (
          <span className="absolute px-3 bg-white text-slate-400 text-xs font-bold">
            {data.iconText || '✦'}
          </span>
        )}
      </div>
    );
  }

  // 7. HERO BANNER SLIDER (CAROUSEL)
  if (type === 'image_slider') {
    const slides = data.slides || [];
    const activeSlide = slides[activeSlideIdx] || slides[0] || {};

    return (
      <div className="relative rounded-3xl overflow-hidden shadow-lg" style={{ height: data.height || '460px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${activeSlide.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80'})` }}
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: (activeSlide.overlayOpacity ?? 45) / 100 }} />

        {/* Slide Content */}
        <div className={`relative z-10 h-full flex flex-col justify-center p-8 sm:p-14 text-white text-${activeSlide.textAlign || 'center'} items-${activeSlide.textAlign === 'left' ? 'start' : activeSlide.textAlign === 'right' ? 'end' : 'center'}`}>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {activeSlide.title || 'Featured Drop'}
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto leading-relaxed">
              {activeSlide.subtitle}
            </p>
            <div className={`pt-2 flex flex-wrap gap-3 justify-${activeSlide.textAlign === 'left' ? 'start' : activeSlide.textAlign === 'right' ? 'end' : 'center'}`}>
              {activeSlide.buttonText && (
                <span className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-lg">
                  {activeSlide.buttonText}
                </span>
              )}
              {activeSlide.secondaryButtonText && (
                <span className="px-6 py-3 rounded-xl bg-white/20 text-white font-bold text-xs backdrop-blur-md">
                  {activeSlide.secondaryButtonText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {slides.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
            <button
              type="button"
              onClick={() => setActiveSlideIdx((activeSlideIdx - 1 + slides.length) % slides.length)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black flex items-center justify-center pointer-events-auto transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlideIdx((activeSlideIdx + 1) % slides.length)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black flex items-center justify-center pointer-events-auto transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Carousel Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 inset-x-0 z-20 flex justify-center gap-2">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlideIdx(i)}
                className={`h-2 rounded-full transition-all ${activeSlideIdx === i ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 8. PRODUCT CAROUSEL SLIDER
  if (type === 'product_slider') {
    return (
      <div className="p-6 space-y-5 bg-slate-50/50 rounded-3xl border border-slate-200/60">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">{data.heading || 'Trending Bestsellers'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{data.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <span className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 bg-white">‹</span>
            <span className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 bg-white">›</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data.items || []).map((p: any, i: number) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="relative aspect-square bg-slate-100">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : null}
                {p.badge && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider">{p.badge}</span>}
              </div>
              <div className="p-3.5 space-y-1">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-black text-xs text-slate-900">{p.price}</span>
                  {p.compareAtPrice && <span className="text-[10px] text-slate-400 line-through">{p.compareAtPrice}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. ANNOUNCEMENT & PROMO BAR
  if (type === 'announcement_bar') {
    return (
      <div className="p-3 rounded-2xl bg-indigo-950 text-white flex flex-wrap items-center justify-center gap-3 text-xs shadow-md">
        {data.badge && <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">{data.badge}</span>}
        <span className="font-bold">{data.message}</span>
        {data.couponCode && <span className="px-2 py-0.5 rounded-md bg-white/20 font-mono font-black text-amber-300">{data.couponCode}</span>}
        {data.ctaText && <span className="underline font-bold text-amber-300 ml-1">{data.ctaText} →</span>}
      </div>
    );
  }

  // 10. PRICING TABLE
  if (type === 'pricing_table') {
    const isSwiper = data.layout === 'swiper';
    const plans = data.plans || [];

    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-slate-900">{data.heading || 'Pricing Plans'}</h3>
          <p className="text-xs text-slate-500">{data.subtitle}</p>
          {isSwiper && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase mt-1">
              🎠 Swiper Mode Active
            </span>
          )}
        </div>

        {isSwiper ? (
          <div className="relative max-w-lg mx-auto py-2">
            {/* Swiper Card Slider Display */}
            <div className="overflow-x-auto flex gap-4 snap-x snap-mandatory pb-4 scrollbar-none">
              {plans.map((p: any, i: number) => (
                <div
                  key={i}
                  className={`min-w-[280px] sm:min-w-[320px] flex-1 snap-center p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                    p.isPopular
                      ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-xl relative'
                      : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  {p.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                      POPULAR CHOICE
                    </span>
                  )}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">Plan {i + 1}/{plans.length}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{p.price}</span>
                      <span className="text-xs text-slate-500">{p.period}</span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {(Array.isArray(p.features) ? p.features : []).map((f: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition ${
                      p.isPopular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {p.buttonText || 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>
            {/* Swiper Pagination Indicator Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {plans.map((_: any, i: number) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-indigo-600 w-5' : 'bg-slate-300'}`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
            {plans.map((p: any, i: number) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  p.isPopular ? 'border-indigo-600 bg-indigo-50/20 shadow-xl relative' : 'border-slate-200 bg-white'
                }`}
              >
                {p.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase">
                    POPULAR
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-500">{p.period}</span>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {(Array.isArray(p.features) ? p.features : []).map((f: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition ${
                    p.isPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {p.buttonText || 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 11. TRUST BADGES
  if (type === 'trust_badges') {
    return (
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-5">
        {data.heading && <h4 className="text-sm font-black text-center text-slate-900 uppercase tracking-wider">{data.heading}</h4>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {(data.badges || []).map((b: any, i: number) => (
            <div key={i} className="p-3 space-y-1">
              <div className="text-2xl mb-1">{b.icon || '🛡️'}</div>
              <div className="font-bold text-xs text-slate-900">{b.title}</div>
              <div className="text-[10px] text-slate-500">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 12. BANNER GRID
  if (type === 'banner_grid') {
    return (
      <div className="p-4 space-y-4">
        {data.heading && <h3 className="text-xl font-black text-slate-900">{data.heading}</h3>}
        <div className={`grid grid-cols-1 sm:grid-cols-${data.columns || 3} gap-4`}>
          {(data.banners || []).map((b: any, i: number) => (
            <div key={i} className="relative rounded-2xl overflow-hidden aspect-4/3 group shadow-xs">
              {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                {b.badge && <span className="self-start px-2 py-0.5 rounded bg-white text-slate-900 font-black text-[9px] uppercase mb-1">{b.badge}</span>}
                <h4 className="font-extrabold text-base text-white">{b.title}</h4>
                <p className="text-xs text-white/80">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 13. INSTAGRAM FEED
  if (type === 'instagram_feed') {
    return (
      <div className="p-6 space-y-4 text-center">
        <div>
          <h3 className="text-xl font-black text-slate-900">{data.heading || 'Follow Us'}</h3>
          <p className="text-xs text-indigo-600 font-bold mt-0.5">{data.handle || '@store_official'}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(data.items || []).map((it: any, i: number) => (
            <div key={i} className="relative rounded-2xl overflow-hidden aspect-square group">
              <img src={it.imageUrl} alt="Instagram post" className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 text-white text-xs font-bold">
                <span>❤️ {it.likes || '1k'}</span>
                <span>💬 {it.comments || '24'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 14. COUNTDOWN TIMER
  if (type === 'countdown_timer') {
    return (
      <div className={`p-8 rounded-3xl bg-gradient-to-r ${data.bgGradient || 'from-violet-950 via-indigo-900 to-slate-950'} text-white space-y-4 shadow-xl`}>
        <div className="text-center space-y-2">
          {data.badge && <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">{data.badge}</span>}
          <h3 className="text-2xl sm:text-3xl font-black">{data.title}</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">{data.subtitle}</p>
        </div>
        {/* Urgency Clock Blocks */}
        <div className="flex justify-center gap-3 py-2">
          {[{ v: '18', l: 'HOURS' }, { v: '44', l: 'MINUTES' }, { v: '29', l: 'SECONDS' }].map((t, idx) => (
            <div key={idx} className="w-20 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <div className="text-2xl font-black text-amber-400 font-mono">{t.v}</div>
              <div className="text-[9px] font-bold text-slate-300 tracking-wider mt-0.5">{t.l}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {data.discountCode && <span className="px-4 py-2 rounded-xl bg-white/15 border border-white/30 font-mono font-black text-amber-300 text-xs">CODE: {data.discountCode}</span>}
          {data.buttonText && <span className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-lg">{data.buttonText}</span>}
        </div>
      </div>
    );
  }

  // 15. HERO
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

  // 16. VALUE PROPS
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

  // 17. IMAGE & TEXT
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

  // 18. TESTIMONIALS
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

  // 19. FAQ
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

  // 20. NEWSLETTER
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

  // 21. CTA BANNER
  if (type === 'cta_banner') return (
    <div
      className="p-8 rounded-2xl text-white text-center space-y-4 relative overflow-hidden"
      style={{
        backgroundColor: data.bgColor || '#0F172A',
        backgroundImage: data.backgroundImage ? `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${data.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h3 className="text-xl font-black relative z-10">{data.headline}</h3>
      <p className="text-xs opacity-80 max-w-md mx-auto relative z-10">{data.subtitle}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
        {data.primaryButtonText && <span className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-lg">{data.primaryButtonText}</span>}
        {data.secondaryButtonText && <span className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold">{data.secondaryButtonText}</span>}
      </div>
    </div>
  );

  // 22. RICH TEXT
  if (type === 'rich_text') return (
    <div className="p-4 prose prose-slate max-w-none prose-headings:font-black prose-sm" dangerouslySetInnerHTML={{ __html: data.html || '<p class="text-slate-400 text-xs italic">No content yet. Edit in the inspector →</p>' }} />
  );

  // 23. VIDEO
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

  return <div className="p-4 text-xs text-slate-400 italic">Unknown block type: {type}</div>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

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
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'blocks' | 'canvas' | 'inspector'>('canvas');

  // Sync state whenever initialPage changes or modal opens
  useEffect(() => {
    if (initialPage) {
      setPageTitle(initialPage.title || 'Untitled Page');
      setPageSlug(initialPage.slug || '/pages/custom-page');
      setPageType(initialPage.pageType || 'CUSTOM');
      setMetaTitle(initialPage.metaTitle || '');
      setMetaDescription(initialPage.metaDescription || '');
      setPageStatus(initialPage.status || 'PUBLISHED');
      const parsed = parseContentToBlocks(initialPage.content);
      dispatch({ type: 'SET', blocks: parsed });
      setActiveBlockId(parsed[0]?.id || null);
    } else {
      setPageTitle('New Page');
      setPageSlug('/pages/new-page');
      setPageType('CUSTOM');
      setMetaTitle('');
      setMetaDescription('');
      setPageStatus('PUBLISHED');
      const defaultBlocks = parseContentToBlocks(undefined);
      dispatch({ type: 'SET', blocks: defaultBlocks });
      setActiveBlockId(defaultBlocks[0]?.id || null);
    }
  }, [initialPage, isOpen]);

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
    const next = blocks.filter(b => b.id !== id);
    setBlocks(next);
    if (activeBlockId === id) setActiveBlockId(next[0]?.id || null);
  };

  const duplicateBlock = (id: string) => {
    const target = blocks.find(b => b.id === id);
    if (!target) return;
    const idx = blocks.findIndex(b => b.id === id);
    const newBlock: PageBlock = {
      id: `block-${target.type}-${Date.now()}`,
      type: target.type,
      isVisible: true,
      data: JSON.parse(JSON.stringify(target.data)),
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, newBlock);
    setBlocks(next);
    setActiveBlockId(newBlock.id);
  };

  const toggleBlockVisibility = (id: string) => {
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
    showToast(`Added "${def.label}" to canvas`);
  };

  // Drag and drop reordering
  const handleDragStart = (idx: number) => { dragIndexRef.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDropIndex(idx); };
  const handleDrop = (idx: number) => {
    const dragIdx = dragIndexRef.current;
    if (dragIdx === null || dragIdx === idx) {
      dragIndexRef.current = null;
      setDropIndex(null);
      return;
    }
    const next = [...blocks];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setBlocks(next);
    dragIndexRef.current = null;
    setDropIndex(null);
  };

  // Save Page
  const handleSavePage = async () => {
    if (!pageTitle.trim()) { showToast('Page title is required', 'error'); return; }
    if (!pageSlug.trim()) { showToast('Page slug is required', 'error'); return; }

    setIsSaving(true);
    try {
      const payload: PageFormData = {
        title: pageTitle.trim(),
        slug: pageSlug.trim().startsWith('/') ? pageSlug.trim() : `/${pageSlug.trim()}`,
        content: JSON.stringify(blocks),
        pageType: pageType as any,
        status: pageStatus as any,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      };

      if (initialPage?.id) {
        await cmsService.updatePage(initialPage.id, payload);
        showToast('Page published successfully!');
      } else {
        await cmsService.createPage(payload);
        showToast('New page created and published!');
      }
      onSaved();
    } catch (err: any) {
      showToast(err.message || 'Failed to save page', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLibrary = BLOCK_LIBRARY.filter(b => {
    const matchCat = libCategory === 'all' || b.category === libCategory;
    const matchSearch = !libSearch || b.label.toLowerCase().includes(libSearch.toLowerCase()) || b.desc.toLowerCase().includes(libSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold border transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.text}</span>
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
            <div className="text-[9px] font-black uppercase text-indigo-400 tracking-wider leading-none mb-0.5">
              {initialPage?.id ? 'Edit Page Builder' : 'New Page Builder'}
            </div>
            <input
              type="text"
              value={pageTitle}
              onChange={e => {
                const val = e.target.value;
                setPageTitle(val);
                if (!initialPage?.id && (!pageSlug || pageSlug === '/pages/new-page')) {
                  const slugified = `/pages/${val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
                  setPageSlug(slugified);
                }
              }}
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

      {/* Mobile/Tablet Workspace View Switcher (< xl) */}
      <div className="xl:hidden bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-sm w-full">
          <button
            type="button"
            onClick={() => setMobileWorkspaceView('blocks')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileWorkspaceView === 'blocks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Blocks</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileWorkspaceView('canvas')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileWorkspaceView === 'canvas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileWorkspaceView('inspector')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileWorkspaceView === 'inspector'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
        </div>
      </div>

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
        <aside className={`w-full xl:w-80 border-r border-slate-800 bg-slate-900/90 flex flex-col shrink-0 overflow-hidden ${mobileWorkspaceView === 'blocks' ? 'flex' : 'hidden xl:flex'}`}>
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
                  <input type="text" value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search elements & blocks..." className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* Category filter */}
              <div className="flex gap-1 p-2 border-b border-slate-800 flex-wrap shrink-0">
                {BLOCK_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setLibCategory(cat.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${libCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{cat.label}</button>
                ))}
              </div>

              {/* Block grid */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                <div className="grid grid-cols-1 gap-2">
                  {filteredLibrary.map(def => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => { addBlock(def); setMobileWorkspaceView('canvas'); }}
                      title={def.desc}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/30 text-left transition-all group flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-indigo-600/30 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 shrink-0 mt-0.5">
                        {def.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white group-hover:text-indigo-300 truncate">{def.label}</span>
                          <span className="text-[9px] font-black uppercase text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{def.category}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">{def.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {leftPanel === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
              {blocks.length === 0 && (
                <div className="text-center py-12 text-slate-600 text-xs">
                  No blocks on page.<br />Add some from the library.
                </div>
              )}
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onClick={() => { setActiveBlockId(block.id); setMobileWorkspaceView('inspector'); }}
                  className={`group flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    activeBlockId === block.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  } ${dropIndex === idx ? 'border-t-2 border-t-indigo-400' : ''}`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 cursor-grab shrink-0" />
                  <span className="w-4 text-[10px] text-slate-600 font-mono shrink-0">{idx + 1}</span>
                  <span className="font-bold truncate flex-1 capitalize">{block.type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button type="button" onClick={e => { e.stopPropagation(); toggleBlockVisibility(block.id); }} className="p-1 hover:text-white">
                      {block.isVisible ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                    </button>
                    <button type="button" onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1 hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* CENTER PANEL: Visual Canvas */}
        <main className={`flex-1 bg-slate-950 overflow-y-auto flex flex-col items-center p-4 sm:p-8 no-scrollbar ${mobileWorkspaceView === 'canvas' ? 'flex' : 'hidden xl:flex'}`}>
          <div
            className={`w-full transition-all duration-300 ${
              viewport === 'mobile' ? 'max-w-[390px]' : viewport === 'tablet' ? 'max-w-[768px]' : 'max-w-5xl'
            }`}
          >
            {/* Canvas Container Shell */}
            <div className="bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-slate-800/40 relative">
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-lg">
                    <LayoutTemplate className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Start Building Your Page</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Choose headings, sliders, div containers, product carousels, or trust badges from the left sidebar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLeftPanel('library')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition"
                  >
                    Browse Block Library
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {blocks.map((block) => {
                    const isSelected = activeBlockId === block.id;
                    if (!block.isVisible) return null;

                    return (
                      <div
                        key={block.id}
                        onClick={() => { setActiveBlockId(block.id); }}
                        className={`relative transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 ring-inset z-10 bg-indigo-50/5'
                            : 'hover:outline hover:outline-1 hover:outline-indigo-300'
                        }`}
                      >
                        {/* Selected overlay tag */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase shadow-md">
                            <span>{block.type.replace(/_/g, ' ')}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMobileWorkspaceView('inspector');
                              }}
                              className="xl:hidden ml-1 underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Render Block Content */}
                        <BlockPreview block={block} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Inspector / Settings */}
        <aside className={`w-full xl:w-80 border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0 overflow-hidden ${mobileWorkspaceView === 'inspector' ? 'flex' : 'hidden xl:flex'}`}>
          <div className="p-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Block Inspector</span>
            {selectedBlock && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800 uppercase">
                {selectedBlock.type}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {selectedBlock ? (
              <BlockInspector
                block={selectedBlock}
                onUpdate={(data) => updateBlock(selectedBlock.id, data)}
                onDelete={() => deleteBlock(selectedBlock.id)}
                onDuplicate={() => duplicateBlock(selectedBlock.id)}
                onToggleVisible={() => toggleBlockVisibility(selectedBlock.id)}
              />
            ) : (
              <div className="text-center py-20 text-slate-600 text-xs space-y-2">
                <Settings className="w-8 h-8 mx-auto text-slate-700" />
                <p>Select any block on the canvas or layers list to inspect and edit its properties.</p>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

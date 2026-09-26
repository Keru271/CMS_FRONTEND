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
  Clock,
  LayoutGrid,
  Columns,
  Edit3,
  HelpCircle,
} from 'lucide-react';

export const DEFAULT_TEMPLATE_SECTIONS: Record<string, HomepageSection[]> = {
  mincom: [
    {
      id: 'mincom-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Lifestyle Banner',
      config: {
        badge: '✨ NEW 2026 COLLECTION',
        headline: 'Elevate Your Living Space With Nordic Craft',
        subheadline:
          'Handcrafted solid oak timber, natural wool upholstery, and ergonomic aesthetics designed for everyday serenity.',
        ctaLabel: 'Shop Collection →',
        ctaHref: '/products',
        secondaryCtaLabel: 'Explore Rooms',
        secondaryCtaHref: '/collections',
        backgroundImage:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1920&auto=format&fit=crop',
      },
    },
    {
      id: 'mincom-trust-1',
      type: 'trust-badges',
      enabled: true,
      title: 'Trust & Guarantee Strip',
      config: {
        badges: [
          { icon: '🚚', title: 'Free Home Delivery', desc: 'On all orders over $150' },
          { icon: '🛡️', title: '10-Year Warranty', desc: '100% solid wood guaranteed' },
          { icon: '🔄', title: '30-Day Easy Returns', desc: 'Hassle-free return policy' },
          { icon: '💳', title: 'Secure Payments', desc: 'Encrypted checkout' },
        ],
      },
    },
    {
      id: 'mincom-room-grid-1',
      type: 'room-grid',
      enabled: true,
      title: 'Room Category Highlights',
      config: {
        tagline: 'INSPIRATION',
        title: 'Shop by Living Space',
        viewAllHref: '/collections',
        viewAllLabel: 'All Spaces →',
        items: [
          {
            title: 'Living Room',
            sub: 'Sofas, Lounges & Coffee Tables',
            count: '48 items',
            image:
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
            href: '/products?category=living-room',
          },
          {
            title: 'Bedroom Sets',
            sub: 'Platform Beds, Nightstands & Linens',
            count: '32 items',
            image:
              'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop',
            href: '/products?category=bedroom',
          },
          {
            title: 'Kitchen & Dining',
            sub: 'Solid Wood Dining Tables & Chairs',
            count: '24 items',
            image:
              'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600&auto=format&fit=crop',
            href: '/products?category=dining',
          },
          {
            title: 'Office & Decor',
            sub: 'Ergonomic Desks, Bookshelves & Lamps',
            count: '40 items',
            image:
              'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
            href: '/products?category=office',
          },
        ],
      },
    },
    {
      id: 'mincom-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Trending Furniture & Pieces',
      config: {
        badge: 'CURATED SELECTION',
        title: 'Trending Furniture & Pieces',
        subtitle: 'Our most sought-after handcrafted pieces this season',
        limit: 8,
        viewAllHref: '/products',
      },
    },
    {
      id: 'mincom-deal-1',
      type: 'deal-countdown',
      enabled: true,
      title: 'Deal of the Day Banner',
      config: {
        badge: '⚡ LIMITED TIME PROMOTION',
        title: 'Deal of the Day',
        subtitle: 'Special promotional pricing on our flagship ergonomic accent chair.',
        discountPercent: 28,
        price: 249.0,
        compareAtPrice: 349.0,
        productName: 'Mid-Century Nordic Ergonomic Lounge Chair in Oat Bouclé',
        productCategory: 'Living Room',
        image:
          'https://images.unsplash.com/photo-1580481077194-4d22223a502f?q=80&w=800&auto=format&fit=crop',
        ctaLabel: 'Claim Deal Now →',
        ctaHref: '/products',
        hoursLeft: 14,
      },
    },
    {
      id: 'mincom-lookbook-1',
      type: 'lookbook',
      enabled: true,
      title: 'Master Joiner Lookbook',
      config: {
        badge: 'ARTISAN SPOTLIGHT',
        lookbookTitle: 'Crafted by Master Joiners in Småland',
        lookbookDesc:
          'Every dining surface and armchair is shaped by hand using traditional mortise-and-tenon joints, sustainably harvested FSC European timber, and organic beeswax finishes.',
        lookbookImage:
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        ctaLabel: 'Explore Artisan Workshop',
        ctaHref: '/products',
      },
    },
    {
      id: 'mincom-matrix-1',
      type: 'product-matrix',
      enabled: true,
      title: 'Multi-Column Matrix Lists',
      config: {
        title: 'Explore Collections',
        subtitle: 'Top rated, best selling, on sale, and featured picks',
        limit: 3,
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
        badge: '✨ Scandinavian Modern Furniture',
        headline: 'Furniture for Mindful, Calm Living',
        subheadline:
          'Contemporary Scandinavian silhouettes crafted from solid European oak, natural bouclé, and artisanal ceramics.',
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
        limit: 8,
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
  pawzy: [
    {
      id: 'pawzy-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Hero Pet Banner',
      config: {
        badge: '🐾 PET CARE & NUTRITION',
        headline: 'Love, Treats, And Care For Your Furry Friend',
        subheadline:
          'Explore biologically appropriate raw diets, vet-certified organic kibbles, orthopedic plush beds, and gentle grooming care designed to keep tails wagging.',
        ctaLabel: 'Shop Now',
        ctaHref: '/products',
        secondaryCtaLabel: 'View Catalog',
        secondaryCtaHref: '/collections',
        backgroundImage:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'pawzy-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Everything Your Pet Needs',
      config: {
        title: 'Everything Your Pet Needs',
        subtitle: 'Pet Picks',
        limit: 6,
      },
    },
    {
      id: 'pawzy-split-features-1',
      type: 'split-features',
      enabled: true,
      title: 'Complete Care For Happy Pets!',
      config: {
        kicker: 'Gentle Service',
        titlePrefix: 'Complete Care For',
        titleHighlight: 'Happy Pets!',
        image:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
        tabs: [
          {
            title: 'Fun & Play',
            icon: '⚽',
            desc: "Bring joy to your pet's day with toys, games, and accessories designed for endless fun, active play, happy moments, and daily excitement.",
          },
          {
            title: 'Healthy Nutrition',
            icon: '🥣',
            desc: 'Biologically balanced raw formulas, vet-certified organic kibbles, and essential supplements formulated for longevity.',
          },
          {
            title: 'Daily Hygiene',
            icon: '🛁',
            desc: 'Gentle plant-based herbal shampoos, paw sanitation balms, and tear-free face wash for pristine grooming.',
          },
          {
            title: 'Comfortable Living',
            icon: '🛏️',
            desc: 'Orthopedic memory foam pet beds, self-warming fleece blankets, and cozy travel crates for deep restorative sleep.',
          },
        ],
      },
    },
    {
      id: 'pawzy-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Favorites This Week',
      config: {
        badge: 'TRENDING',
        title: 'Favorites This Week',
        subtitle: 'Our most sought-after treats, collars, and toys',
        limit: 4,
      },
    },
    {
      id: 'pawzy-trust-1',
      type: 'trust-badges',
      enabled: true,
      title: 'Care Services & Guarantees',
      config: {
        kicker: 'Our Services',
        title: 'Care You Can Trust',
        leftBadges: [
          { icon: '🛁', title: 'Bathing & Grooming', desc: 'Plant-based herbal washes, coat styling, and gentle sanitation.' },
          { icon: '✂️', title: 'Haircut & Styling', desc: 'Professional breed-specific coat trimming and detangling styling.' },
          { icon: '🐕', title: 'Dog Walking', desc: 'Certified and bonded local walkers providing GPS-tracked exercise.' },
        ],
        rightBadges: [
          { icon: '🐾', title: 'Nail & Paw Care', desc: 'Gentle claw clipping, filing, and organic pad moisturizing balm.' },
          { icon: '🏠', title: 'Pet Hotel Stay', desc: 'Safe, climate-controlled play suites with 24/7 live webcams.' },
          { icon: '🩺', title: 'Health Checkup', desc: 'Personalized dietary consults and preventative health assessments.' },
        ],
        centerImage:
          'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      id: 'pawzy-featured-2',
      type: 'featured-products',
      enabled: true,
      title: 'Best Selling Products',
      config: {
        badge: 'HOT PICKS',
        title: 'Best Selling Products',
        subtitle: 'Customer favorites loved by thousands of happy pets',
        limit: 4,
      },
    },
    {
      id: 'pawzy-banner-1',
      type: 'banner',
      enabled: true,
      title: '15% Off Auto-Ship Promo',
      config: {
        badge: '🐱 ORGANIC CAT & DOG DIET',
        title: 'Get 15% Off Either On First Order Or Auto-Ship',
        description:
          'Never worry about running out of food again. Set your preferred delivery frequency and enjoy flexible cancellations.',
        ctaLabel: 'Shop Promotion Now',
        ctaHref: '/products',
        variant: 'accent',
      },
    },
    {
      id: 'pawzy-faq-locations-1',
      type: 'faq-locations',
      enabled: true,
      title: 'Store Locations & Frequently Asked Questions',
      config: {
        locationsTitle: 'Store Location',
        locations: [
          '159 Mulholland Drive, CA, Los Angeles',
          '289 Haight Street, CA, San Francisco',
          '434 5th Avenue, NY, New York',
        ],
        contactCtaLabel: 'Contact Now',
        contactCtaHref: '/contact',
        centerImage:
          'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
        faqTitle: 'Frequently Asked Questions',
        faqs: [
          {
            question: 'What types of pets do you support?',
            answer: 'We offer a wide range of items for dogs, cats, small animals like rabbits and hamsters, birds, and even aquatic pets.',
          },
          {
            question: 'Do you offer grooming appointments?',
            answer: 'Yes! Our certified pet stylists offer herbal baths, nail trimming, coat de-shedding, and full spa sessions.',
          },
          {
            question: 'How long does shipping take?',
            answer: 'Standard domestic delivery arrives in 2–3 business days. We also offer 2-hour rush local delivery in select cities.',
          },
          {
            question: 'Can I return a product if it doesn\'t fit my pet?',
            answer: 'Absolutely! We offer a 30-day hassle-free return and exchange guarantee on all gear and accessories.',
          },
          {
            question: 'Are your products vet-approved?',
            answer: 'Yes! All our organic recipes, raw diets, and wellness formulas are formulated and vetted by licensed veterinary nutritionists.',
          },
        ],
      },
    },
    {
      id: 'pawzy-testimonials-1',
      type: 'testimonials',
      enabled: true,
      title: 'What Pet Parents Say',
      config: {
        title: 'What Pet Parents Say',
        subtitle: 'Real experiences from happy pet owners.',
        testimonials: [
          {
            name: 'Sarah Jenkins',
            rating: 5,
            text: "We saw an incredible transformation in Bella's energy, digestion, and coat shine within just two weeks of switching to Pawzy's salmon recipe!",
            role: 'Proud Golden Retriever Parent',
          },
        ],
      },
    },
    {
      id: 'pawzy-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'VIP Pet Club Signup',
      config: {
        title: 'Subscribe For Our Newsletter',
        description:
          'Get monthly nutrition tips, exclusive treat drops, and 10% off your next purchase.',
        placeholder: 'Enter your email address...',
        ctaLabel: 'Subscribe',
      },
    },
  ],
  luxe: [
    {
      id: 'luxe-hero-1',
      type: 'hero',
      enabled: true,
      title: 'Haute Couture Hero',
      config: {
        badge: 'HAUTE COUTURE 2026',
        headline: 'Timeless Elegance & Modern Luxury',
        subheadline:
          'Discover curated designer collections, exquisite fine jewelry, and bespoke fashion crafted for discerning tastes.',
        ctaLabel: 'Explore Atelier',
        ctaHref: '/products',
        secondaryCtaLabel: 'View Runway',
        secondaryCtaHref: '/collections',
        backgroundImage:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'luxe-trust-1',
      type: 'trust-badges',
      enabled: true,
      title: 'White-Glove Guarantees',
      config: {
        badges: [
          { icon: '💎', title: 'Authenticity Guaranteed', desc: '100% verified luxury pieces' },
          { icon: '✈️', title: 'White-Glove Express', desc: 'Complimentary insured shipping' },
          { icon: '🎁', title: 'Signature Packaging', desc: 'Bespoke gift presentation' },
          { icon: '👑', title: 'Private Styling', desc: 'Dedicated concierge team' },
        ],
      },
    },
    {
      id: 'luxe-collections-1',
      type: 'collections',
      enabled: true,
      title: 'Runway Collections',
      config: {
        title: 'The Season Collections',
        subtitle: 'Artisanal tailoring and limited capsule releases',
        limit: 3,
      },
    },
    {
      id: 'luxe-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'Iconic Pieces',
      config: {
        title: 'Iconic Pieces',
        subtitle: 'Selected by our head stylist',
        limit: 8,
      },
    },
    {
      id: 'luxe-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'Private Salon Invitation',
      config: {
        title: 'The Luxe Private Circle',
        description:
          'Receive private salon invitations, private runway previews, and personal stylist consultations.',
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
        ctaLabel: 'Shop Now',
        ctaHref: '/products',
        secondaryCtaLabel: 'Explore Collections',
        secondaryCtaHref: '/collections',
        backgroundImage:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      },
    },
    {
      id: 'default-trust-1',
      type: 'trust-badges',
      enabled: true,
      title: 'Trust Badges',
      config: {
        badges: [
          { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
          { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
          { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
          { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
        ],
      },
    },
    {
      id: 'default-collections-1',
      type: 'collections',
      enabled: true,
      title: 'Featured Collections',
      config: { title: 'Featured Collections', limit: 3 },
    },
    {
      id: 'default-categories-1',
      type: 'categories',
      enabled: true,
      title: 'Categories',
      config: { showAll: true, limit: 6 },
    },
    {
      id: 'default-featured-1',
      type: 'featured-products',
      enabled: true,
      title: 'New Arrivals',
      config: {
        title: 'New Arrivals',
        subtitle: 'Just In',
        limit: 8,
        viewAllHref: '/products?sort=newest',
      },
    },
    {
      id: 'default-banner-1',
      type: 'banner',
      enabled: true,
      title: 'Promotion Banner',
      config: {
        title: 'Members get more',
        description:
          'Join thousands of shoppers and unlock exclusive deals, early access, and free shipping.',
        ctaLabel: 'Join Free Today',
        ctaHref: '/auth/signup',
        variant: 'accent',
      },
    },
    {
      id: 'default-newsletter-1',
      type: 'newsletter',
      enabled: true,
      title: 'Newsletter',
      config: {
        title: 'Stay in the loop',
        description: 'Subscribe to our newsletter for exclusive discounts and product releases.',
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
    name: 'Hero Lifestyle Banner',
    desc: 'High-impact top banner with headline, subtitle, promo badge, CTAs, and background',
    icon: Layout,
    defaultConfig: {
      headline: 'Elevate Your Living Space With Nordic Craft',
      subheadline:
        'Handcrafted solid oak timber, natural wool upholstery, and ergonomic aesthetics designed for everyday serenity.',
      badge: '✨ NEW 2026 COLLECTION',
      ctaLabel: 'Shop Collection →',
      ctaHref: '/products',
      secondaryCtaLabel: 'Explore Rooms',
      secondaryCtaHref: '/collections',
      backgroundImage:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1920&auto=format&fit=crop',
    },
  },
  {
    type: 'deal-countdown',
    name: 'Deal of the Day (Live Countdown)',
    desc: 'Time-limited promotional spotlight with real-time countdown timer and discounted pricing',
    icon: Clock,
    defaultConfig: {
      badge: '⚡ LIMITED TIME PROMOTION',
      title: 'Deal of the Day',
      subtitle: 'Special promotional pricing on our flagship ergonomic accent chair.',
      discountPercent: 28,
      price: 249.0,
      compareAtPrice: 349.0,
      productName: 'Mid-Century Nordic Ergonomic Lounge Chair in Oat Bouclé',
      productCategory: 'Living Room',
      image:
        'https://images.unsplash.com/photo-1580481077194-4d22223a502f?q=80&w=800&auto=format&fit=crop',
      ctaLabel: 'Claim Deal Now →',
      ctaHref: '/products',
      hoursLeft: 14,
    },
  },
  {
    type: 'room-grid',
    name: 'Room / Lifestyle Category Grid',
    desc: 'Interactive visual grid of room categories with custom images, item counts, and links',
    icon: LayoutGrid,
    defaultConfig: {
      tagline: 'INSPIRATION',
      title: 'Shop by Living Space',
      viewAllHref: '/collections',
      viewAllLabel: 'All Spaces →',
      items: [
        {
          title: 'Living Room',
          sub: 'Sofas, Lounges & Coffee Tables',
          count: '48 items',
          image:
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
          href: '/products?category=living-room',
        },
        {
          title: 'Bedroom Sets',
          sub: 'Platform Beds, Nightstands & Linens',
          count: '32 items',
          image:
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop',
          href: '/products?category=bedroom',
        },
        {
          title: 'Kitchen & Dining',
          sub: 'Solid Wood Dining Tables & Chairs',
          count: '24 items',
          image:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600&auto=format&fit=crop',
          href: '/products?category=dining',
        },
        {
          title: 'Office & Decor',
          sub: 'Ergonomic Desks, Bookshelves & Lamps',
          count: '40 items',
          image:
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
          href: '/products?category=office',
        },
      ],
    },
  },
  {
    type: 'featured-products',
    name: 'Featured Products Grid',
    desc: 'Showcase trending catalog products, category filters, and quick cart actions',
    icon: ShoppingBag,
    defaultConfig: {
      badge: 'CURATED SELECTION',
      title: 'Trending Furniture & Pieces',
      subtitle: 'Our most sought-after handcrafted pieces this season',
      limit: 8,
      viewAllHref: '/products',
    },
  },
  {
    type: 'product-matrix',
    name: 'Multi-Column Product Matrix',
    desc: '4-column list highlighting Top Rated, Best Selling, On Sale, and Featured Picks',
    icon: Columns,
    defaultConfig: {
      title: 'Explore Collections',
      subtitle: 'Top rated, best selling, on sale, and featured picks',
      limit: 3,
    },
  },
  {
    type: 'lookbook',
    name: 'Lookbook / Artisan Feature',
    desc: 'Rich editorial highlight with large photography, artisan story, and specs button',
    icon: Sparkles,
    defaultConfig: {
      badge: 'ARTISAN SPOTLIGHT',
      lookbookTitle: 'Crafted by Master Joiners in Småland',
      lookbookDesc:
        'Every dining surface and armchair is shaped by hand using traditional mortise-and-tenon joints, sustainably harvested timber, and organic beeswax.',
      lookbookImage:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'Explore Artisan Workshop',
      ctaHref: '/products',
    },
  },
  {
    type: 'trust-badges',
    name: 'Trust & Guarantee Strip',
    desc: 'Highlight shipping speed, security guarantee, returns, and warranties',
    icon: ShieldCheck,
    defaultConfig: {
      badges: [
        { icon: '🚚', title: 'Free Home Delivery', desc: 'On all orders over $150' },
        { icon: '🛡️', title: '10-Year Warranty', desc: '100% solid wood guaranteed' },
        { icon: '🔄', title: '30-Day Easy Returns', desc: 'Hassle-free return policy' },
        { icon: '💳', title: 'Secure Payments', desc: 'Encrypted Stripe & Razorpay' },
      ],
    },
  },
  {
    type: 'categories',
    name: 'Category Showcase',
    desc: 'Visual category grid with icons and item counts',
    icon: Grid,
    defaultConfig: {
      title: 'Explore Categories',
      subtitle: 'Shop furniture & decor crafted for mindful spaces',
      limit: 6,
    },
  },
  {
    type: 'custom_form',
    name: 'Interactive Form Embed',
    desc: 'Embed any pre-existing lead gen, contact, feedback, or VIP survey form',
    icon: FileText,
    defaultConfig: {
      heading: 'Get in Touch with our Team',
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
      title: 'Loved by 50,000+ Happy Homes',
      subtitle: 'Read authentic customer experiences from verified owners.',
      testimonials: [
        {
          name: 'Elena Rostova',
          rating: 5,
          text: 'The dining table craftsmanship exceeded our expectations. The solid European oak finish is flawless.',
          role: 'Interior Architect',
        },
        {
          name: 'Marcus Vance',
          rating: 5,
          text: 'White-glove delivery arrived precisely on schedule. Beautiful minimalist aesthetics and superb comfort.',
          role: 'Verified Buyer',
        },
      ],
    },
  },
  {
    type: 'banner',
    name: 'Promo / Announcement Banner',
    desc: 'Eye-catching promotional banner with bold button and discount highlight',
    icon: Zap,
    defaultConfig: {
      badge: 'MEMBERS CLUB',
      title: 'Members Get More',
      description:
        'Join thousands of mindful shoppers and unlock early access, private sales, and free white-glove shipping.',
      ctaLabel: 'Join Free Today',
      ctaHref: '/auth/signup',
      variant: 'accent',
    },
  },
  {
    type: 'split-features',
    name: 'Interactive Feature Tabs (Complete Care)',
    desc: 'Side-by-side hero feature with interactive vertical category tabs, custom icons, and image',
    icon: Sparkles,
    defaultConfig: {
      kicker: 'Gentle Service',
      titlePrefix: 'Complete Care For',
      titleHighlight: 'Happy Pets!',
      image:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      tabs: [
        {
          title: 'Fun & Play',
          icon: '⚽',
          desc: "Bring joy to your pet's day with toys, games, and accessories designed for endless fun, active play, happy moments, and daily excitement.",
        },
        {
          title: 'Healthy Nutrition',
          icon: '🥣',
          desc: 'Biologically balanced raw formulas, vet-certified organic kibbles, and essential supplements formulated for longevity.',
        },
        {
          title: 'Daily Hygiene',
          icon: '🛁',
          desc: 'Gentle plant-based herbal shampoos, paw sanitation balms, and tear-free face wash for pristine grooming.',
        },
        {
          title: 'Comfortable Living',
          icon: '🛏️',
          desc: 'Orthopedic memory foam pet beds, self-warming fleece blankets, and cozy travel crates for deep restorative sleep.',
        },
      ],
    },
  },
  {
    type: 'faq-locations',
    name: 'Store Locations & FAQ Accordion',
    desc: '3-column split section featuring store branch addresses, center 3D pin visual, and interactive FAQ accordion',
    icon: HelpCircle,
    defaultConfig: {
      locationsTitle: 'Store Location',
      locations: [
        '159 Mulholland Drive, CA, Los Angeles',
        '289 Haight Street, CA, San Francisco',
        '434 5th Avenue, NY, New York',
      ],
      contactCtaLabel: 'Contact Now',
      contactCtaHref: '/contact',
      centerImage:
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          question: 'What types of pets do you support?',
          answer: 'We offer a wide range of items for dogs, cats, small animals like rabbits and hamsters, birds, and even aquatic pets.',
        },
        {
          question: 'Do you offer grooming appointments?',
          answer: 'Yes! Our certified pet stylists offer herbal baths, nail trimming, coat de-shedding, and full spa sessions.',
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard domestic delivery arrives in 2–3 business days. We also offer 2-hour rush local delivery in select cities.',
        },
        {
          question: 'Can I return a product if it doesn\'t fit my pet?',
          answer: 'Absolutely! We offer a 30-day hassle-free return and exchange guarantee on all gear and accessories.',
        },
        {
          question: 'Are your products vet-approved?',
          answer: 'Yes! All our organic recipes, raw diets, and wellness formulas are formulated and vetted by licensed veterinary nutritionists.',
        },
      ],
    },
  },
  {
    type: 'newsletter',
    name: 'VIP Newsletter Signup',
    desc: 'Email subscription box to grow your store audience',
    icon: Mail,
    defaultConfig: {
      title: 'Join the Mincom Collective',
      description:
        'Receive early access to seasonal drops, interior design guides, and 10% off your first purchase.',
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
  selectedSectionId?: string | null;
  onSelectSection?: (id: string, type: string, index: number) => void;
  onChange: (sections: HomepageSection[]) => void;
  onResetToDefault: () => void;
}

export const HomepageSectionsCustomizer: React.FC<Props> = ({
  templateSlug,
  templateName,
  sections,
  availableForms,
  selectedSectionId: externalSelectedId,
  onSelectSection,
  onChange,
  onResetToDefault,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    sections[0]?.id || null,
  );
  const [showAddMenu, setShowAddMenu] = useState(false);

  const selectedSectionId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  const setSelectedSectionId = (id: string | null) => {
    setInternalSelectedId(id);
    if (id) {
      const idx = sections.findIndex((s) => s.id === id);
      const sec = sections[idx];
      if (sec) {
        onSelectSection?.(sec.id, sec.type, idx);
      }
    }
  };

  const handleSelectSection = (sec: HomepageSection, idx: number) => {
    setSelectedSectionId(sec.id);
  };

  // Sync selected section if sections change
  const selectedSection =
    sections.find((s) => s.id === selectedSectionId) || sections[0] || null;

  // Trigger initial selection on mount or when sections change
  React.useEffect(() => {
    if (selectedSection) {
      const idx = sections.findIndex((s) => s.id === selectedSection.id);
      onSelectSection?.(selectedSection.id, selectedSection.type, idx >= 0 ? idx : 0);
    }
  }, [selectedSectionId, sections.length]);

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
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                Template Sections
              </span>
              <span className="text-[11px] text-slate-400 font-mono">({templateSlug})</span>
            </div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{templateName} Homepage Customizer</span>
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
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Block</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Section Modal / Dropdown */}
      {showAddMenu && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-card border border-slate-200 dark:border-border shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-border pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
              Add a Section Block
            </h3>
            <button
              type="button"
              onClick={() => setShowAddMenu(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto p-1">
            {SECTION_LIBRARY.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleAddSection(item)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-accent/40 hover:border-amber-500 hover:bg-amber-50/40 text-left transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-foreground">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {item.desc}
                    </p>
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
            <Sliders className="w-4 h-4 text-amber-500" />
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
                onClick={() => handleSelectSection(sec, idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-sm'
                    : sec.enabled
                      ? 'border-slate-200/80 dark:border-border bg-slate-50/40 dark:bg-card hover:border-slate-300 shadow-xs'
                      : 'border-slate-200/40 dark:border-border/40 bg-slate-100/50 dark:bg-card/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950'
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
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
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
            {/* 1. Hero Inspector */}
            {selectedSection.type === 'hero' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Promo Badge Tag</label>
                  <input
                    type="text"
                    value={selectedSection.config.badge || ''}
                    onChange={(e) => handleUpdateConfig('badge', e.target.value)}
                    placeholder="✨ NEW 2026 COLLECTION"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Headline</label>
                  <input
                    type="text"
                    value={selectedSection.config.headline || ''}
                    onChange={(e) => handleUpdateConfig('headline', e.target.value)}
                    placeholder="Elevate Your Living Space"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subheadline / Description</label>
                  <textarea
                    rows={2}
                    value={selectedSection.config.subheadline || ''}
                    onChange={(e) => handleUpdateConfig('subheadline', e.target.value)}
                    placeholder="Handcrafted solid timber..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Primary Button Label</label>
                    <input
                      type="text"
                      value={selectedSection.config.ctaLabel || ''}
                      onChange={(e) => handleUpdateConfig('ctaLabel', e.target.value)}
                      placeholder="Shop Collection →"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Primary Button Link</label>
                    <input
                      type="text"
                      value={selectedSection.config.ctaHref || ''}
                      onChange={(e) => handleUpdateConfig('ctaHref', e.target.value)}
                      placeholder="/products"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Secondary Button Label</label>
                    <input
                      type="text"
                      value={selectedSection.config.secondaryCtaLabel || ''}
                      onChange={(e) => handleUpdateConfig('secondaryCtaLabel', e.target.value)}
                      placeholder="Explore Rooms"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Secondary Button Link</label>
                    <input
                      type="text"
                      value={selectedSection.config.secondaryCtaHref || ''}
                      onChange={(e) => handleUpdateConfig('secondaryCtaHref', e.target.value)}
                      placeholder="/collections"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Background Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.config.backgroundImage || ''}
                    onChange={(e) => handleUpdateConfig('backgroundImage', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium font-mono text-[11px]"
                  />
                </div>
              </>
            )}

            {/* 2. Deal of the Day Inspector */}
            {selectedSection.type === 'deal-countdown' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={selectedSection.config.badge || ''}
                    onChange={(e) => handleUpdateConfig('badge', e.target.value)}
                    placeholder="⚡ LIMITED TIME PROMOTION"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Deal Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Deal of the Day"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Deal Product Name</label>
                  <input
                    type="text"
                    value={selectedSection.config.productName || ''}
                    onChange={(e) => handleUpdateConfig('productName', e.target.value)}
                    placeholder="Mid-Century Nordic Ergonomic Lounge Chair"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Deal Price ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={selectedSection.config.price || ''}
                      onChange={(e) => handleUpdateConfig('price', parseFloat(e.target.value) || 0)}
                      placeholder="249.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Original Price ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={selectedSection.config.compareAtPrice || ''}
                      onChange={(e) => handleUpdateConfig('compareAtPrice', parseFloat(e.target.value) || 0)}
                      placeholder="349.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Product Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.config.image || ''}
                    onChange={(e) => handleUpdateConfig('image', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-mono text-[11px]"
                  />
                </div>
              </>
            )}

            {/* 3. Room Grid Inspector */}
            {selectedSection.type === 'room-grid' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Tagline</label>
                  <input
                    type="text"
                    value={selectedSection.config.tagline || ''}
                    onChange={(e) => handleUpdateConfig('tagline', e.target.value)}
                    placeholder="INSPIRATION"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Shop by Living Space"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Room Cards (4)</label>
                  {(selectedSection.config.items || []).map((card: any, cIdx: number) => (
                    <div key={cIdx} className="p-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={card.title || ''}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.config.items || [])];
                            newItems[cIdx] = { ...newItems[cIdx], title: e.target.value };
                            handleUpdateConfig('items', newItems);
                          }}
                          placeholder="Room Title (e.g. Living Room)"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={card.count || ''}
                          onChange={(e) => {
                            const newItems = [...(selectedSection.config.items || [])];
                            newItems[cIdx] = { ...newItems[cIdx], count: e.target.value };
                            handleUpdateConfig('items', newItems);
                          }}
                          placeholder="Count (e.g. 48 items)"
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        value={card.image || ''}
                        onChange={(e) => {
                          const newItems = [...(selectedSection.config.items || [])];
                          newItems[cIdx] = { ...newItems[cIdx], image: e.target.value };
                          handleUpdateConfig('items', newItems);
                        }}
                        placeholder="Image URL"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-[11px] font-mono"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 4. Featured Products Inspector */}
            {selectedSection.type === 'featured-products' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={selectedSection.config.badge || ''}
                    onChange={(e) => handleUpdateConfig('badge', e.target.value)}
                    placeholder="CURATED SELECTION"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Trending Furniture & Pieces"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Our most sought-after handcrafted pieces..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Max Products Shown</label>
                  <select
                    value={selectedSection.config.limit || 8}
                    onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  >
                    <option value={4}>4 Products</option>
                    <option value={8}>8 Products (Standard)</option>
                    <option value={12}>12 Products</option>
                    <option value={16}>16 Products</option>
                  </select>
                </div>
              </>
            )}

            {/* 5. Lookbook Inspector */}
            {selectedSection.type === 'lookbook' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={selectedSection.config.badge || ''}
                    onChange={(e) => handleUpdateConfig('badge', e.target.value)}
                    placeholder="ARTISAN SPOTLIGHT"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Editorial Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.lookbookTitle || ''}
                    onChange={(e) => handleUpdateConfig('lookbookTitle', e.target.value)}
                    placeholder="Crafted by Master Joiners in Småland"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Story Copy</label>
                  <textarea
                    rows={3}
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

            {/* 6. Form Builder Embed Inspector */}
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
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 font-bold"
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

            {/* 7. Trust Badges Inspector */}
            {selectedSection.type === 'trust-badges' && (
              <>
                {(selectedSection.config.leftBadges || selectedSection.config.rightBadges) ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">Kicker</label>
                      <input
                        type="text"
                        value={selectedSection.config.kicker || ''}
                        onChange={(e) => handleUpdateConfig('kicker', e.target.value)}
                        placeholder="Our Services"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                      <input
                        type="text"
                        value={selectedSection.config.title || ''}
                        onChange={(e) => handleUpdateConfig('title', e.target.value)}
                        placeholder="Care You Can Trust"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">Center Image URL</label>
                      <input
                        type="text"
                        value={selectedSection.config.centerImage || ''}
                        onChange={(e) => handleUpdateConfig('centerImage', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                      />
                    </div>

                    {/* Left Badges */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">Left Side Services</label>
                      {(selectedSection.config.leftBadges || []).map((b: any, bIdx: number) => (
                        <div key={bIdx} className="p-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-1.5">
                          <div className="grid grid-cols-4 gap-1.5">
                            <input
                              type="text"
                              value={b.icon || ''}
                              onChange={(e) => {
                                const newBadges = [...(selectedSection.config.leftBadges || [])];
                                newBadges[bIdx] = { ...newBadges[bIdx], icon: e.target.value };
                                handleUpdateConfig('leftBadges', newBadges);
                              }}
                              placeholder="Icon"
                              className="col-span-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-center text-sm"
                            />
                            <input
                              type="text"
                              value={b.title || ''}
                              onChange={(e) => {
                                const newBadges = [...(selectedSection.config.leftBadges || [])];
                                newBadges[bIdx] = { ...newBadges[bIdx], title: e.target.value };
                                handleUpdateConfig('leftBadges', newBadges);
                              }}
                              placeholder="Service Title"
                              className="col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                            />
                          </div>
                          <input
                            type="text"
                            value={b.desc || ''}
                            onChange={(e) => {
                              const newBadges = [...(selectedSection.config.leftBadges || [])];
                              newBadges[bIdx] = { ...newBadges[bIdx], desc: e.target.value };
                              handleUpdateConfig('leftBadges', newBadges);
                            }}
                            placeholder="Service description"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-[11px]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Right Badges */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">Right Side Services</label>
                      {(selectedSection.config.rightBadges || []).map((b: any, bIdx: number) => (
                        <div key={bIdx} className="p-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-1.5">
                          <div className="grid grid-cols-4 gap-1.5">
                            <input
                              type="text"
                              value={b.icon || ''}
                              onChange={(e) => {
                                const newBadges = [...(selectedSection.config.rightBadges || [])];
                                newBadges[bIdx] = { ...newBadges[bIdx], icon: e.target.value };
                                handleUpdateConfig('rightBadges', newBadges);
                              }}
                              placeholder="Icon"
                              className="col-span-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-center text-sm"
                            />
                            <input
                              type="text"
                              value={b.title || ''}
                              onChange={(e) => {
                                const newBadges = [...(selectedSection.config.rightBadges || [])];
                                newBadges[bIdx] = { ...newBadges[bIdx], title: e.target.value };
                                handleUpdateConfig('rightBadges', newBadges);
                              }}
                              placeholder="Service Title"
                              className="col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                            />
                          </div>
                          <input
                            type="text"
                            value={b.desc || ''}
                            onChange={(e) => {
                              const newBadges = [...(selectedSection.config.rightBadges || [])];
                              newBadges[bIdx] = { ...newBadges[bIdx], desc: e.target.value };
                              handleUpdateConfig('rightBadges', newBadges);
                            }}
                            placeholder="Service description"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-[11px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
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
              </>
            )}

            {/* 8. Banner Inspector */}
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

            {/* 9. Categories Showcase Inspector */}
            {selectedSection.type === 'categories' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Section Heading</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Everything Your Pet Needs"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Kicker / Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Pet Picks"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Visible Item Limit</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={selectedSection.config.limit || 6}
                    onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value) || 6)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900 space-y-2">
                  <span className="text-xs font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <span>🐾</span>
                    <span>Live Vector Pet Categories Badge</span>
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Pawzy template dynamically presents 6 soft-blue organic blob line-art vector icons: <strong>Birds, Cats, Dogs, Rabbit, Fish, Hamster</strong>.
                  </p>
                </div>
              </>
            )}

            {/* 10. Testimonials Inspector */}
            {selectedSection.type === 'testimonials' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Section Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="What Pet Parents Say"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Real customer experiences..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Reviews List</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newReviews = [
                          ...(selectedSection.config.testimonials || []),
                          {
                            name: 'Happy Customer',
                            role: 'Pet Parent',
                            text: 'Excellent quality and lightning-fast delivery!',
                            rating: 5,
                          },
                        ];
                        handleUpdateConfig('testimonials', newReviews);
                      }}
                      className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline uppercase"
                    >
                      + Add Review
                    </button>
                  </div>
                  {(selectedSection.config.testimonials || []).map((review: any, rIdx: number) => (
                    <div key={rIdx} className="p-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={review.name || ''}
                          onChange={(e) => {
                            const newReviews = [...(selectedSection.config.testimonials || [])];
                            newReviews[rIdx] = { ...newReviews[rIdx], name: e.target.value };
                            handleUpdateConfig('testimonials', newReviews);
                          }}
                          placeholder="Customer name"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={review.role || ''}
                          onChange={(e) => {
                            const newReviews = [...(selectedSection.config.testimonials || [])];
                            newReviews[rIdx] = { ...newReviews[rIdx], role: e.target.value };
                            handleUpdateConfig('testimonials', newReviews);
                          }}
                          placeholder="Role / Title"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={review.text || ''}
                        onChange={(e) => {
                          const newReviews = [...(selectedSection.config.testimonials || [])];
                          newReviews[rIdx] = { ...newReviews[rIdx], text: e.target.value };
                          handleUpdateConfig('testimonials', newReviews);
                        }}
                        placeholder="Quote text..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500">Stars:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => {
                                const newReviews = [...(selectedSection.config.testimonials || [])];
                                newReviews[rIdx] = { ...newReviews[rIdx], rating: star };
                                handleUpdateConfig('testimonials', newReviews);
                              }}
                              className={`text-xs ${star <= (review.rating || 5) ? 'text-amber-500' : 'text-slate-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newReviews = (selectedSection.config.testimonials || []).filter((_: any, i: number) => i !== rIdx);
                            handleUpdateConfig('testimonials', newReviews);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 11. Collections Inspector */}
            {selectedSection.type === 'collections' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Featured Collections"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Curated seasonal drops..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={selectedSection.config.limit || 3}
                    onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
              </>
            )}

            {/* 12. Product Matrix Inspector */}
            {selectedSection.type === 'product-matrix' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Explore Catalog Matrix"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) => handleUpdateConfig('subtitle', e.target.value)}
                    placeholder="Top rated, best selling, on sale..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Items per Column</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={selectedSection.config.limit || 3}
                    onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
              </>
            )}

            {/* 13. Newsletter Inspector */}
            {selectedSection.type === 'newsletter' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.title || ''}
                    onChange={(e) => handleUpdateConfig('title', e.target.value)}
                    placeholder="Join the Mincom Collective"
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

            {/* 14. Spacer Inspector */}
            {selectedSection.type === 'spacer' && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Height (Pixels)</label>
                <input
                  type="number"
                  min={8}
                  max={200}
                  value={selectedSection.config.height || 32}
                  onChange={(e) => handleUpdateConfig('height', parseInt(e.target.value) || 32)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                />
              </div>
            )}

            {/* 15. Split Features Inspector */}
            {selectedSection.type === 'split-features' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Kicker</label>
                  <input
                    type="text"
                    value={selectedSection.config.kicker || ''}
                    onChange={(e) => handleUpdateConfig('kicker', e.target.value)}
                    placeholder="Gentle Service"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Title Prefix</label>
                    <input
                      type="text"
                      value={selectedSection.config.titlePrefix || ''}
                      onChange={(e) => handleUpdateConfig('titlePrefix', e.target.value)}
                      placeholder="Complete Care For"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Title Highlight</label>
                    <input
                      type="text"
                      value={selectedSection.config.titleHighlight || ''}
                      onChange={(e) => handleUpdateConfig('titleHighlight', e.target.value)}
                      placeholder="Happy Pets!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Left Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.config.image || ''}
                    onChange={(e) => handleUpdateConfig('image', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Feature Tabs List</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newTabs = [
                          ...(selectedSection.config.tabs || []),
                          { title: 'New Feature Tab', icon: '✨', desc: 'Detailed description of this pet service or benefit...' },
                        ];
                        handleUpdateConfig('tabs', newTabs);
                      }}
                      className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline uppercase"
                    >
                      + Add Tab
                    </button>
                  </div>
                  {(selectedSection.config.tabs || []).map((tab: any, tIdx: number) => (
                    <div key={tIdx} className="p-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={tab.icon || ''}
                          onChange={(e) => {
                            const newTabs = [...(selectedSection.config.tabs || [])];
                            newTabs[tIdx] = { ...newTabs[tIdx], icon: e.target.value };
                            handleUpdateConfig('tabs', newTabs);
                          }}
                          placeholder="Icon"
                          className="col-span-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-center text-sm"
                        />
                        <input
                          type="text"
                          value={tab.title || ''}
                          onChange={(e) => {
                            const newTabs = [...(selectedSection.config.tabs || [])];
                            newTabs[tIdx] = { ...newTabs[tIdx], title: e.target.value };
                            handleUpdateConfig('tabs', newTabs);
                          }}
                          placeholder="Tab Title"
                          className="col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={tab.desc || ''}
                        onChange={(e) => {
                          const newTabs = [...(selectedSection.config.tabs || [])];
                          newTabs[tIdx] = { ...newTabs[tIdx], desc: e.target.value };
                          handleUpdateConfig('tabs', newTabs);
                        }}
                        placeholder="Tab description..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newTabs = (selectedSection.config.tabs || []).filter((_: any, i: number) => i !== tIdx);
                            handleUpdateConfig('tabs', newTabs);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 16. Store Locations & FAQ Inspector */}
            {selectedSection.type === 'faq-locations' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Store Locations Title</label>
                  <input
                    type="text"
                    value={selectedSection.config.locationsTitle || ''}
                    onChange={(e) => handleUpdateConfig('locationsTitle', e.target.value)}
                    placeholder="Store Location"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Branch Addresses</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newLocs = [...(selectedSection.config.locations || []), 'New Store Address, City'];
                        handleUpdateConfig('locations', newLocs);
                      }}
                      className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline uppercase"
                    >
                      + Add Address
                    </button>
                  </div>
                  {(selectedSection.config.locations || []).map((loc: string, lIdx: number) => (
                    <div key={lIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={loc || ''}
                        onChange={(e) => {
                          const newLocs = [...(selectedSection.config.locations || [])];
                          newLocs[lIdx] = e.target.value;
                          handleUpdateConfig('locations', newLocs);
                        }}
                        placeholder="Address"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newLocs = (selectedSection.config.locations || []).filter((_: any, i: number) => i !== lIdx);
                          handleUpdateConfig('locations', newLocs);
                        }}
                        className="text-rose-500 hover:text-rose-700 font-bold text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Contact CTA Label</label>
                    <input
                      type="text"
                      value={selectedSection.config.contactCtaLabel || ''}
                      onChange={(e) => handleUpdateConfig('contactCtaLabel', e.target.value)}
                      placeholder="Contact Now"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Contact Link</label>
                    <input
                      type="text"
                      value={selectedSection.config.contactCtaHref || ''}
                      onChange={(e) => handleUpdateConfig('contactCtaHref', e.target.value)}
                      placeholder="/contact"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Center Image URL</label>
                  <input
                    type="text"
                    value={selectedSection.config.centerImage || ''}
                    onChange={(e) => handleUpdateConfig('centerImage', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">FAQ Heading</label>
                  <input
                    type="text"
                    value={selectedSection.config.faqTitle || ''}
                    onChange={(e) => handleUpdateConfig('faqTitle', e.target.value)}
                    placeholder="Frequently Asked Questions"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-slate-900 dark:text-foreground font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">FAQs List</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaqs = [
                          ...(selectedSection.config.faqs || []),
                          { question: 'New Question?', answer: 'Detailed answer explaining the policy or service.' },
                        ];
                        handleUpdateConfig('faqs', newFaqs);
                      }}
                      className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline uppercase"
                    >
                      + Add Question
                    </button>
                  </div>
                  {(selectedSection.config.faqs || []).map((faq: any, fIdx: number) => (
                    <div key={fIdx} className="p-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent space-y-2">
                      <input
                        type="text"
                        value={faq.question || ''}
                        onChange={(e) => {
                          const newFaqs = [...(selectedSection.config.faqs || [])];
                          newFaqs[fIdx] = { ...newFaqs[fIdx], question: e.target.value };
                          handleUpdateConfig('faqs', newFaqs);
                        }}
                        placeholder="Question title"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer || ''}
                        onChange={(e) => {
                          const newFaqs = [...(selectedSection.config.faqs || [])];
                          newFaqs[fIdx] = { ...newFaqs[fIdx], answer: e.target.value };
                          handleUpdateConfig('faqs', newFaqs);
                        }}
                        placeholder="Answer details..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card text-xs"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newFaqs = (selectedSection.config.faqs || []).filter((_: any, i: number) => i !== fIdx);
                            handleUpdateConfig('faqs', newFaqs);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export interface StorefrontSection {
  id: string;
  name: string;
  type:
    | 'announcement'
    | 'header'
    | 'hero'
    | 'video_showcase'
    | 'video_reels'
    | 'widgets'
    | 'products'
    | 'features'
    | 'reviews'
    | 'story'
    | 'faq'
    | 'whatsapp_cta'
    | 'newsletter'
    | 'footer'
    | 'custom';
  title: string;
  subtitle?: string;
  enabled: boolean;
  contentJson?: Record<string, unknown>;
}

export interface StorefrontTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBg: string;
  textColor: string;
  textMuted: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  styleArchetype: string;
}

export interface StorefrontProject {
  id: string;
  brandName: string;
  tagline: string;
  industry: string;
  templateSlug?: string;
  theme: StorefrontTheme;
  sections: StorefrontSection[];
  activePage: string;
  pages: Array<{ slug: string; title: string }>;
  updatedAt: string;
}

export interface StorefrontTemplateArchetype {
  slug: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  previewColors: string[];
  defaultTheme: StorefrontTheme;
}

export const STOREFRONT_ARCHETYPES: StorefrontTemplateArchetype[] = [
  {
    slug: 'mincom',
    name: 'Mincom',
    category: 'Artisan Living & Furniture',
    description: 'Warm oak craftsmanship, modern modular grid, and refined typography.',
    badge: 'Artisan Living',
    previewColors: ['#1A1A1A', '#C89355', '#F5F2EC', '#2B2824'],
    defaultTheme: {
      primary: '#2B2824',
      secondary: '#E8E3DA',
      accent: '#C89355',
      background: '#F5F2EC',
      cardBg: '#FFFFFF',
      textColor: '#2B2824',
      textMuted: '#78736B',
      border: '#E0DAD0',
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      borderRadius: '8px',
      styleArchetype: 'Modern Artisan Living',
    },
  },
  {
    slug: 'luxe',
    name: 'Luxe',
    category: 'Haute Horlogerie & Fashion',
    description: 'Obsidian black canvas with champagne gold metallic accents and serif typography.',
    badge: 'Haute Luxury',
    previewColors: ['#050608', '#D4AF37', '#0F111A', '#F8FAFC'],
    defaultTheme: {
      primary: '#090A0F',
      secondary: '#161922',
      accent: '#D4AF37',
      background: '#050608',
      cardBg: '#0F111A',
      textColor: '#F8FAFC',
      textMuted: '#94A3B8',
      border: '#232738',
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      borderRadius: '8px',
      styleArchetype: 'Obsidian Haute Luxe',
    },
  },
  {
    slug: 'minimal',
    name: 'Minimal',
    category: 'Scandinavian Aesthetics',
    description: 'Pure clean whitespace, subtle borders, high contrast and pill geometry.',
    badge: 'Clean Minimalist',
    previewColors: ['#FFFFFF', '#4F46E5', '#F8FAFC', '#0F172A'],
    defaultTheme: {
      primary: '#0F172A',
      secondary: '#F1F5F9',
      accent: '#4F46E5',
      background: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      borderRadius: '9999px',
      styleArchetype: 'Minimalist Scandinavian',
    },
  },
  {
    slug: 'funo',
    name: 'Funo',
    category: 'Nordic Modern Decor',
    description: 'Airy layout with warm sand tones, rounded cards, and natural lifestyle focus.',
    badge: 'Nordic Decor',
    previewColors: ['#FAF8F5', '#9E6B4E', '#FFFFFF', '#23201D'],
    defaultTheme: {
      primary: '#23201D',
      secondary: '#EFEAE2',
      accent: '#9E6B4E',
      background: '#FAF8F5',
      cardBg: '#FFFFFF',
      textColor: '#23201D',
      textMuted: '#7A7570',
      border: '#E5DFD7',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      borderRadius: '16px',
      styleArchetype: 'Nordic Modern Decor',
    },
  },
  {
    slug: 'pawzy',
    name: 'Pawzy',
    category: 'Pet Care & Organic Lifestyle',
    description: 'Playful warm honey palette, rounded friendly cards, and organic treat badges.',
    badge: 'Pet Care',
    previewColors: ['#FFFDF9', '#FF9F43', '#FFFFFF', '#2D3436'],
    defaultTheme: {
      primary: '#2D3436',
      secondary: '#FFF2E2',
      accent: '#FF9F43',
      background: '#FFFDF9',
      cardBg: '#FFFFFF',
      textColor: '#2D3436',
      textMuted: '#636E72',
      border: '#FFE5C8',
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      borderRadius: '20px',
      styleArchetype: 'Organic Pet Care',
    },
  },
  {
    slug: 'fern',
    name: 'Fern',
    category: 'Botanical Wellness & Plants',
    description: 'Fresh eucalyptus sage tones, clean porcelain cards, and gentle botanical vibes.',
    badge: 'Botanical Wellness',
    previewColors: ['#F7FAFC', '#10B981', '#FFFFFF', '#1A202C'],
    defaultTheme: {
      primary: '#1E293B',
      secondary: '#E2E8F0',
      accent: '#10B981',
      background: '#F7FAFC',
      cardBg: '#FFFFFF',
      textColor: '#1A202C',
      textMuted: '#64748B',
      border: '#E2E8F0',
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      borderRadius: '16px',
      styleArchetype: 'Botanical Wellness',
    },
  },
  {
    slug: 'techno',
    name: 'Techno',
    category: 'Cyber Tech & Gadgets',
    description: 'Midnight navy canvas with electric cyan accents, glassmorphic cards and audio focus.',
    badge: 'Cyber Tech',
    previewColors: ['#020617', '#00E5FF', '#0B0F19', '#F8FAFC'],
    defaultTheme: {
      primary: '#030712',
      secondary: '#0F172A',
      accent: '#00E5FF',
      background: '#020617',
      cardBg: '#0B0F19',
      textColor: '#F8FAFC',
      textMuted: '#94A3B8',
      border: '#1E293B',
      headingFont: 'Syne',
      bodyFont: 'Inter',
      borderRadius: '14px',
      styleArchetype: 'Cyberpunk Next-Gen',
    },
  },
  {
    slug: 'default',
    name: 'Default',
    category: 'Pulse Streetwear & Drops',
    description: 'High-energy streetwear canvas with bold typography and high-converting CTA buttons.',
    badge: 'Streetwear & Drops',
    previewColors: ['#090A0F', '#6366F1', '#12141F', '#FFFFFF'],
    defaultTheme: {
      primary: '#090A0F',
      secondary: '#1E1B4B',
      accent: '#6366F1',
      background: '#090A0F',
      cardBg: '#12141F',
      textColor: '#FFFFFF',
      textMuted: '#94A3B8',
      border: '#1E2235',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      borderRadius: '12px',
      styleArchetype: 'Pulse Modern Streetwear',
    },
  },
];

export interface DesignPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  theme: StorefrontTheme;
  previewColors: string[];
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'luxe-dark',
    name: 'Obsidian Haute Luxe',
    badge: 'Luxury & Horlogerie',
    description: 'Pitch-black obsidian canvas with champagne gold metallic accents and serif typography.',
    previewColors: ['#050608', '#D4AF37', '#0F111A', '#F8FAFC'],
    theme: {
      primary: '#090A0F',
      secondary: '#161922',
      accent: '#D4AF37',
      background: '#050608',
      cardBg: '#0F111A',
      textColor: '#F8FAFC',
      textMuted: '#94A3B8',
      border: '#232738',
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      borderRadius: '8px',
      styleArchetype: 'Obsidian Haute Luxe',
    },
  },
  {
    id: 'neo-brutalist',
    name: 'Neo-Brutalist High Impact',
    badge: 'Streetwear & Drops',
    description: 'Electric cadmium yellow with bold black ink borders and geometric typography.',
    previewColors: ['#F5F5F0', '#FFE600', '#000000', '#FF3366'],
    theme: {
      primary: '#000000',
      secondary: '#FFE600',
      accent: '#FFE600',
      background: '#F5F5F0',
      cardBg: '#FFFFFF',
      textColor: '#000000',
      textMuted: '#4A4A4A',
      border: '#000000',
      headingFont: 'Space Grotesk',
      bodyFont: 'Plus Jakarta Sans',
      borderRadius: '0px',
      styleArchetype: 'Neo-Brutalist High Impact',
    },
  },
  {
    id: 'cyber-tech',
    name: 'Cyberpunk Next-Gen',
    badge: 'Audio & Tech',
    description: 'Deep midnight blue with neon cyan glow, glassmorphism cards, and modern tech fonts.',
    previewColors: ['#020617', '#00E5FF', '#0B0F19', '#F8FAFC'],
    theme: {
      primary: '#030712',
      secondary: '#0F172A',
      accent: '#00E5FF',
      background: '#020617',
      cardBg: '#0B0F19',
      textColor: '#F8FAFC',
      textMuted: '#94A3B8',
      border: '#1E293B',
      headingFont: 'Syne',
      bodyFont: 'Inter',
      borderRadius: '14px',
      styleArchetype: 'Cyberpunk Next-Gen',
    },
  },
  {
    id: 'botanical-wellness',
    name: 'Pastel Botanical Organic',
    badge: 'Skincare & Wellness',
    description: 'Soft porcelain canvas with emerald sage green, gentle shadows, and warm organic vibes.',
    previewColors: ['#F7FAFC', '#10B981', '#FFFFFF', '#1A202C'],
    theme: {
      primary: '#2D3748',
      secondary: '#E2E8F0',
      accent: '#10B981',
      background: '#F7FAFC',
      cardBg: '#FFFFFF',
      textColor: '#1A202C',
      textMuted: '#718096',
      border: '#E2E8F0',
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      borderRadius: '16px',
      styleArchetype: 'Pastel Botanical Organic',
    },
  },
  {
    id: 'clean-scandi',
    name: 'Minimalist Scandinavian',
    badge: 'Contemporary Fashion',
    description: 'Pure white canvas with generous whitespace, crisp slate borders, and pill geometry.',
    previewColors: ['#FFFFFF', '#4F46E5', '#F8FAFC', '#0F172A'],
    theme: {
      primary: '#0F172A',
      secondary: '#F1F5F9',
      accent: '#4F46E5',
      background: '#FFFFFF',
      cardBg: '#FFFFFF',
      textColor: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      borderRadius: '9999px',
      styleArchetype: 'Minimalist Scandinavian',
    },
  },
];

export const INITIAL_SECTIONS: StorefrontSection[] = [
  {
    id: 'announcement',
    name: 'Announcement Bar',
    type: 'announcement',
    title: 'Complimentary Worldwide Insured Express Shipping & Concierge',
    subtitle: 'Limited Drop Edition • 24/7 VIP Assistance',
    enabled: true,
    contentJson: {
      badge: 'LIMITED DROP',
      text: 'Complimentary Worldwide Insured Express Shipping on Orders Over $250',
      ctaText: 'Shop New Arrivals →',
      ctaLink: '#collections',
    },
  },
  {
    id: 'header',
    name: 'Storefront Navigation Header',
    type: 'header',
    title: 'Velvet Haute',
    subtitle: 'Artisanal Horlogerie & High Craft',
    enabled: true,
    contentJson: {
      logoText: 'VELVET HAUTE',
      links: [
        { label: 'Timepieces', href: '#collections' },
        { label: 'Motion Reels', href: '#video-reels' },
        { label: 'Widgets', href: '#widgets' },
        { label: 'Craft & Story', href: '#story' },
        { label: 'Reviews', href: '#reviews' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
  },
  {
    id: 'hero',
    name: 'Cinematic Hero Banner with Video Background',
    type: 'hero',
    title: 'Timeless Precision Crafted for Modern Visionaries',
    subtitle:
      'Engineered in Geneva, handcrafted in limited numbers. Each mechanical masterwork represents the summit of chronometric precision and dark luxury aesthetic.',
    enabled: true,
    contentJson: {
      badge: '✨ SS26 ATELIER COLLECTION',
      primaryCta: 'Explore Collections',
      primaryLink: '#collections',
      secondaryCta: 'Watch Brand Film',
      secondaryLink: '#video-showcase',
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
      posterUrl:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop',
      hasVideoBackground: true,
      stats: [
        { label: 'Verified Collectors', value: '25,000+' },
        { label: 'Global Service Centers', value: '42' },
        { label: 'Handcrafted Heritage', value: 'Since 1984' },
      ],
    },
  },
  {
    id: 'video_showcase',
    name: 'Cinematic Motion Film Showcase',
    type: 'video_showcase',
    title: 'The Art of Motion: Chronometric Cinema',
    subtitle:
      'Immerse yourself in the mechanical heartbeat of our atelier through 4K macro cinematography.',
    enabled: true,
    contentJson: {
      badge: '🎬 CINEMATIC FILM',
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
      tagline: 'Forged in Titanium • Assembled by Hand',
      ctaText: 'Discover The Atelier',
    },
  },
  {
    id: 'video_reels',
    name: 'Social Video Reels & Unboxings',
    type: 'video_reels',
    title: 'Collector Stories & Wrist Shots',
    subtitle: 'Real moments captured by watchmakers, connoisseurs, and tastemakers worldwide.',
    enabled: true,
    contentJson: {
      badge: '📱 LIVE REELS',
      reels: [
        {
          id: 'reel-1',
          title: 'Aura Chrono in Natural Sunlight',
          author: '@marcus_haute',
          videoUrl:
            'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
          poster:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
          views: '48.2K',
        },
        {
          id: 'reel-2',
          title: 'Unboxing the Titanium Tourbillon',
          author: '@luxetimepiece',
          videoUrl:
            'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
          poster:
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
          views: '112K',
        },
        {
          id: 'reel-3',
          title: 'Tuscan Leather Quick-Change Strap',
          author: '@saddle_atelier',
          videoUrl:
            'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
          poster:
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop',
          views: '84.6K',
        },
        {
          id: 'reel-4',
          title: 'Luminescent Night Dial Test',
          author: '@horology_journal',
          videoUrl:
            'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
          poster:
            'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop',
          views: '63.9K',
        },
      ],
    },
  },
  {
    id: 'widgets',
    name: 'Modular Signature Widgets',
    type: 'widgets',
    title: 'Signature Modular Components',
    subtitle: 'Interchangeable bezel rings, magnetic straps, and horological attachments.',
    enabled: true,
    contentJson: {
      hasSlider: true,
      items: [
        {
          name: 'Aura Chrono Widget',
          category: 'Titanium Core',
          price: 320,
          image:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
          badge: 'Widget Drop',
        },
        {
          name: 'Lumina Planar Widget',
          category: 'Acoustic Module',
          price: 450,
          image:
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
          badge: 'Bestseller',
        },
        {
          name: 'Italian Saddle Strap',
          category: 'Leather Hide',
          price: 145,
          image:
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop',
          badge: 'Handcrafted',
        },
        {
          name: 'Solstice Clip-On Lens',
          category: 'Optics Module',
          price: 190,
          image:
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop',
          badge: 'Selling Fast',
        },
      ],
    },
  },
  {
    id: 'products',
    name: 'Curated Catalog & Live Inventory',
    type: 'products',
    title: 'Featured Masterpieces',
    subtitle: 'Synchronized live with OmniStore headless e-commerce inventory.',
    enabled: true,
    contentJson: {
      categories: ['All', 'Timepieces', 'Straps', 'Accessories'],
      products: [
        {
          id: 'prod-1',
          name: 'Chrono Imperiale Onyx',
          category: 'Timepieces',
          price: 1250,
          comparePrice: 1450,
          badge: 'Atelier Flagship',
          image:
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop',
          description: 'Automatic mechanical caliber with obsidian dial and sapphire crystal.',
        },
        {
          id: 'prod-2',
          name: 'Kuro Skeleton Skeletonized',
          category: 'Timepieces',
          price: 1890,
          badge: 'Limited to 500',
          image:
            'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop',
          description: 'Open-worked movement revealing the pulsating tourbillon escapement.',
        },
        {
          id: 'prod-3',
          name: 'Artisan Tuscan Calfskin Strap',
          category: 'Straps',
          price: 195,
          badge: 'Hand-Stitched',
          image:
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop',
          description: 'Supple vegetable-tanned Italian leather with quick-release deployment buckle.',
        },
        {
          id: 'prod-4',
          name: 'Monolith Watch Winder Cube',
          category: 'Accessories',
          price: 340,
          comparePrice: 390,
          badge: 'Quiet Motor',
          image:
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop',
          description: 'Silent Japanese rotor with customizable bi-directional TPD settings.',
        },
      ],
    },
  },
  {
    id: 'features',
    name: 'Brand Guarantees & Pillars',
    type: 'features',
    title: 'The Velvet Standard',
    subtitle: 'Every creation is accompanied by our lifetime commitment to excellence.',
    enabled: true,
    contentJson: {
      pillars: [
        {
          icon: 'Shield',
          title: '5-Year International Warranty',
          desc: 'Comprehensive coverage backed by our global authorized service network.',
        },
        {
          icon: 'Truck',
          title: 'Armored & Insured Transit',
          desc: 'Complimentary expedited delivery with full tamper-evident packaging.',
        },
        {
          icon: 'Award',
          title: 'COSC Chronometer Certified',
          desc: 'Each movement passes 15 days of grueling precision trials.',
        },
        {
          icon: 'MessageSquare',
          title: '24/7 Concierge Support',
          desc: 'Direct line to our master horologists via private WhatsApp chat.',
        },
      ],
    },
  },
  {
    id: 'reviews',
    name: 'Verified Collector Testimonials',
    type: 'reviews',
    title: 'Voices of Our Collectors',
    subtitle: 'Rated 4.96 / 5.0 across 1,840+ verified client appraisals.',
    enabled: true,
    contentJson: {
      averageRating: 4.96,
      totalReviews: 1842,
      reviews: [
        {
          author: 'Lord Julian Sterling',
          location: 'Mayfair, London',
          rating: 5,
          text: 'The finishing on the Chrono Imperiale rivals timepieces triple its investment. The brushed titanium bezel and micro-rotor are sublime.',
          verified: true,
          date: '3 days ago',
        },
        {
          author: 'Dr. Elena Rostova',
          location: 'Zurich, Switzerland',
          rating: 5,
          text: 'Delivered in an armored vault case with handwritten authenticity certificates. Exceptional horological precision (+1.2s/day).',
          verified: true,
          date: '1 week ago',
        },
        {
          author: 'Kenji Takahashi',
          location: 'Ginza, Tokyo',
          rating: 5,
          text: 'The video reel showcase accurately captured the dial depth, but in person the anti-reflective crystal looks completely invisible.',
          verified: true,
          date: '2 weeks ago',
        },
      ],
    },
  },
  {
    id: 'faq',
    name: 'Frequently Asked Questions',
    type: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about acquisition, sizing, and global service.',
    enabled: true,
    contentJson: {
      items: [
        {
          q: 'How does the OmniStore instant checkout & WhatsApp order work?',
          a: 'You can complete your acquisition directly in our encrypted checkout or tap "Order via WhatsApp" to communicate 1-on-1 with a concierge member who will confirm availability, custom sizing, and payment link.',
        },
        {
          q: 'Are the video reels and photographs representative of actual production?',
          a: 'Yes. All video reels and high-definition photographs are captured directly from production units under natural and studio lighting without CGI embellishment.',
        },
        {
          q: 'What is your international return and exchange window?',
          a: 'We offer a 30-day trial period with complimentary return shipping in unworn condition with security tags intact.',
        },
        {
          q: 'How often should a mechanical timepiece be serviced?',
          a: 'We recommend a complimentary health check every 3 years. All routine adjustments are performed by our Geneva-trained horologists.',
        },
      ],
    },
  },
  {
    id: 'whatsapp_cta',
    name: 'WhatsApp VIP Concierge Banner',
    type: 'whatsapp_cta',
    title: 'Prefer Personal Assistance?',
    subtitle: 'Our private client advisors are available 24/7 on WhatsApp for custom requests, sizing, and priority reservations.',
    enabled: true,
    contentJson: {
      buttonText: 'Chat on WhatsApp with Concierge',
      statusText: 'Online Now • Responds in < 2 mins',
    },
  },
  {
    id: 'newsletter',
    name: 'VIP Newsletter & Private Drops',
    type: 'newsletter',
    title: 'Receive Private Allocations',
    subtitle: 'Members receive 48-hour early access to numbered timepiece allocations and private drops.',
    enabled: true,
    contentJson: {
      placeholder: 'Enter your private email address',
      buttonText: 'Request VIP Access',
    },
  },
  {
    id: 'footer',
    name: 'Mega Storefront Footer',
    type: 'footer',
    title: 'Velvet Haute Horlogerie',
    subtitle: 'Geneva • London • Tokyo • New York',
    enabled: true,
    contentJson: {
      columns: [
        {
          title: 'Collections',
          links: ['Atelier Chronographs', 'Tourbillon Series', 'Tuscan Leather Straps', 'Watch Winders'],
        },
        {
          title: 'Concierge',
          links: ['Track Order', 'Service & Repairs', 'Certificate Verification', 'WhatsApp Support'],
        },
        {
          title: 'Legal & Heritage',
          links: ['Our 1984 Heritage', 'Privacy Policy', 'Terms of Acquisition', 'Sustainability'],
        },
      ],
      copyright: '© 2026 Velvet Haute S.A. All rights reserved. Powered by OmniStore Headless Engine.',
    },
  },
];

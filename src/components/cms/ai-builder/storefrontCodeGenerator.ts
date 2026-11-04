import { StorefrontProject } from './storefrontTemplates';

export interface GeneratedCodeFile {
  file: string;
  data: string;
  description: string;
}

/**
 * Generates application files structured strictly according to the OmniStore storefront-frontend
 * Next.js 16 App Router & multi-template architecture.
 */
export function generateNextjsProjectFiles(project: StorefrontProject): GeneratedCodeFile[] {
  const { brandName, tagline, theme, templateSlug = 'mincom' } = project;
  const slug = templateSlug.toLowerCase().trim() || 'mincom';

  return [
    {
      file: 'package.json',
      description: 'Storefront Next.js 16 package manifest with React 19 and Tailwind v4',
      data: `{
  "name": "${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-storefront",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.3.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "lucide-react": "^1.34.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}`,
    },
    {
      file: 'app/layout.tsx',
      description: 'Next.js 16 root layout with Google Fonts, metadata and dynamic CSS variables',
      data: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${brandName} — ${tagline}',
  description: '${tagline}',
  openGraph: {
    title: '${brandName}',
    description: '${tagline}',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            theme.headingFont
          )}:wght@400;600;700;800&family=${encodeURIComponent(
            theme.bodyFont
          )}:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: 'var(--sf-bg)', color: 'var(--sf-text)' }}>
        {children}
      </body>
    </html>
  );
}`,
    },
    {
      file: 'app/globals.css',
      description: 'Global CSS defining OmniStore theme variables and Tailwind v4 directives',
      data: `@import "tailwindcss";

:root {
  --sf-primary: ${theme.primary};
  --sf-secondary: ${theme.secondary};
  --sf-accent: ${theme.accent};
  --sf-bg: ${theme.background};
  --sf-card-bg: ${theme.cardBg};
  --sf-text: ${theme.textColor};
  --sf-muted: ${theme.textMuted};
  --sf-border: ${theme.border};
  --sf-radius: ${theme.borderRadius};
  --font-heading: "${theme.headingFont}", serif;
  --font-body: "${theme.bodyFont}", sans-serif;
}

body {
  background-color: var(--sf-bg);
  color: var(--sf-text);
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}`,
    },
    {
      file: 'app/page.tsx',
      description: 'Homepage dynamic route invoking resolveTemplate() matching storefront architecture',
      data: `import { resolveTemplate } from '@/templates';
import { getProducts } from '@/lib/api/products';
import { getTheme } from '@/lib/api/theme';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const activeSlug = '${slug}';
  const { Header, HomePage: TemplateHomePage, Footer } = resolveTemplate(activeSlug);

  const [theme, products] = await Promise.all([
    getTheme(),
    getProducts({ limit: 12 }),
  ]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--sf-bg)' }}>
      <Header />
      <main className="flex-1">
        <TemplateHomePage theme={theme} products={products} />
      </main>
      <Footer />
    </div>
  );
}`,
    },
    {
      file: 'templates/index.ts',
      description: 'Storefront dynamic template registry supporting code-split template bundles',
      data: `import dynamic from 'next/dynamic';

// Dynamic Template Chunk Resolvers
const CurrentHeader = dynamic(() => import('./${slug}/Header'));
const CurrentHomePage = dynamic(() => import('./${slug}/HomePage'));
const CurrentFooter = dynamic(() => import('./${slug}/Footer'));
const CurrentPLP = dynamic(() => import('./${slug}/PLPPage'));
const CurrentPDP = dynamic(() => import('./${slug}/PDPPage'));

export function resolveTemplate(templateSlug?: string) {
  return {
    Header: CurrentHeader,
    HomePage: CurrentHomePage,
    Footer: CurrentFooter,
    PLPPage: CurrentPLP,
    PDPPage: CurrentPDP,
  };
}`,
    },
    {
      file: `templates/${slug}/Header.tsx`,
      description: `Header component for the ${slug} storefront template`,
      data: `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--sf-card-bg)', borderColor: 'var(--sf-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--sf-text)' }}>
          ${brandName}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/products" className="hover:opacity-80 transition" style={{ color: 'var(--sf-text)' }}>Collections</Link>
          <Link href="/categories" className="hover:opacity-80 transition" style={{ color: 'var(--sf-text)' }}>Categories</Link>
          <Link href="/story" className="hover:opacity-80 transition" style={{ color: 'var(--sf-text)' }}>Our Story</Link>
          <Link href="/reviews" className="hover:opacity-80 transition" style={{ color: 'var(--sf-text)' }}>Reviews</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-black/10 transition" style={{ color: 'var(--sf-text)' }}>
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2 rounded-full hover:bg-black/10 transition" style={{ color: 'var(--sf-text)' }}>
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: 'var(--sf-accent)' }}>
              2
            </span>
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}`,
    },
    {
      file: `templates/${slug}/HomePage.tsx`,
      description: `Modular landing page component assembling Hero, Featured Products & Testimonials`,
      data: `'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { Sparkles, ArrowRight, Star } from 'lucide-react';

export default function HomePage({ theme, products = [] }: { theme?: any; products?: any[] }) {
  return (
    <div className="space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 px-6 text-center border-b" style={{ borderColor: 'var(--sf-border)' }}>
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--sf-accent)20', color: 'var(--sf-accent)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            NEW ARRIVALS NOW LIVE
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
            ${brandName}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--sf-muted)' }}>
            ${tagline}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a
              href="#products"
              className="px-8 py-4 font-bold uppercase tracking-wider text-sm transition shadow-xl"
              style={{
                backgroundColor: 'var(--sf-accent)',
                color: '#000000',
                borderRadius: 'var(--sf-radius)',
              }}
            >
              Explore Collection
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Catalog</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--sf-muted)' }}>Curated for discerning collectors & clientele.</p>
          </div>
          <a href="/products" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: 'var(--sf-accent)' }}>
            View All <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(products.length > 0 ? products : [1, 2, 3, 4]).map((item: any, idx: number) => (
            <ProductCard key={idx} product={item} />
          ))}
        </div>
      </section>

      {/* Verified Reviews */}
      <section className="max-w-7xl mx-auto px-6 py-12 rounded-2xl border" style={{ backgroundColor: 'var(--sf-card-bg)', borderColor: 'var(--sf-border)' }}>
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="flex justify-center gap-1" style={{ color: 'var(--sf-accent)' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h3 className="text-2xl font-bold">“Exceptional craftsmanship & seamless fulfillment.”</h3>
          <p className="text-sm" style={{ color: 'var(--sf-muted)' }}>Rated 4.96/5.0 by 1,800+ clients across the globe.</p>
        </div>
      </section>
    </div>
  );
}`,
    },
    {
      file: `templates/${slug}/ProductCard.tsx`,
      description: `Interactive product card with image zoom, price tag and add to cart trigger`,
      data: `'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }: { product: any }) {
  const isPlaceholder = typeof product === 'number';
  const name = isPlaceholder ? \`Signature Edition #\${product}\` : product.name || 'Artisan Collection Piece';
  const price = isPlaceholder ? 149 + product * 50 : product.price || 199;
  const image = isPlaceholder
    ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'
    : product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden border transition duration-300 hover:shadow-2xl"
      style={{ backgroundColor: 'var(--sf-card-bg)', borderColor: 'var(--sf-border)', borderRadius: 'var(--sf-radius)' }}
    >
      <div className="aspect-square overflow-hidden bg-black/10">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1">{name}</h3>
          <p className="text-xs mt-1 font-bold" style={{ color: 'var(--sf-accent)' }}>$\${price}.00</p>
        </div>
        <button
          className="mt-3 w-full py-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
          style={{ backgroundColor: 'var(--sf-accent)', color: '#000000', borderRadius: 'var(--sf-radius)' }}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Quick Add
        </button>
      </div>
    </div>
  );
}`,
    },
    {
      file: `templates/${slug}/Footer.tsx`,
      description: `Storefront footer with brand manifesto, newsletter intake and legal links`,
      data: `'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t py-16 px-6" style={{ backgroundColor: 'var(--sf-card-bg)', borderColor: 'var(--sf-border)' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <span className="text-xl font-bold uppercase tracking-tight">${brandName}</span>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--sf-muted)' }}>${tagline}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--sf-muted)' }}>
            <li><Link href="/products" className="hover:underline">All Products</Link></li>
            <li><Link href="/categories" className="hover:underline">Collections</Link></li>
            <li><Link href="/story" className="hover:underline">Atelier Story</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Customer Care</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--sf-muted)' }}>
            <li><Link href="/shipping" className="hover:underline">Global Shipping</Link></li>
            <li><Link href="/returns" className="hover:underline">Warranty & Returns</Link></li>
            <li><Link href="/contact" className="hover:underline">VIP Concierge</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Join the Dispatch</h4>
          <p className="text-xs" style={{ color: 'var(--sf-muted)' }}>Receive VIP allocations and private collection drops.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 text-xs rounded-lg border flex-1"
              style={{ backgroundColor: 'var(--sf-bg)', borderColor: 'var(--sf-border)' }}
            />
            <button
              className="px-4 py-2 text-xs font-bold uppercase"
              style={{ backgroundColor: 'var(--sf-accent)', color: '#000000', borderRadius: 'var(--sf-radius)' }}
            >
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between text-xs" style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-muted)' }}>
        <p>© {new Date().getFullYear()} ${brandName}. Powered by OmniStore Headless Engine.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}`,
    },
    {
      file: `templates/${slug}/PLPPage.tsx`,
      description: 'Product Listing Page with faceted filters and category sorting',
      data: `'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function PLPPage({ products = [] }: { products?: any[] }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Complete Store Catalog</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sf-muted)' }}>Browse all active releases, seasonal drops, and limited editions.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(products.length > 0 ? products : [1, 2, 3, 4, 5, 6, 7, 8]).map((p: any, idx: number) => (
          <ProductCard key={idx} product={p} />
        ))}
      </div>
    </div>
  );
}`,
    },
    {
      file: `templates/${slug}/PDPPage.tsx`,
      description: 'Product Detail Page with high-res gallery and specifications',
      data: `'use client';

import React from 'react';
import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export default function PDPPage({ product }: { product?: any }) {
  const name = product?.name || '${brandName} Flagship Edition';
  const price = product?.price || 249;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--sf-border)' }}>
        <img
          src={product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop'}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="space-y-6 flex flex-col justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold">{name}</h1>
        <p className="text-2xl font-extrabold" style={{ color: 'var(--sf-accent)' }}>$\${price}.00</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--sf-muted)' }}>
          Crafted with uncompromising precision. Every detail has been engineered to reflect ${brandName}'s signature standard of quality and modern craftsmanship.
        </p>
        <button
          className="w-full py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
          style={{ backgroundColor: 'var(--sf-accent)', color: '#000000', borderRadius: 'var(--sf-radius)' }}
        >
          <ShoppingBag className="w-4 h-4" />
          Acquire Now
        </button>
        <div className="pt-4 border-t space-y-2 text-xs" style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-muted)' }}>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Complimentary insured express delivery in 2-4 business days</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>2-Year Comprehensive Manufacturer Warranty</span>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    },
    {
      file: 'lib/api/client.ts',
      description: 'OmniStore headless e-commerce API client with automated tenant resolution',
      data: `// OmniStore Headless E-Commerce API Client
const API_URL = process.env.NEXT_PUBLIC_OMNISTORE_API_URL || 'http://localhost:5000/api';
const STORE_ID = process.env.NEXT_PUBLIC_OMNISTORE_STORE_ID || 'default_store';

export async function fetchStoreCatalog(endpoint: string, options?: RequestInit) {
  const url = \`\${API_URL}/\${endpoint}\`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-store-id': STORE_ID,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(\`OmniStore API error: \${res.statusText}\`);
  return res.json();
}

export const omnistoreApi = {
  getProducts: (params?: Record<string, any>) => fetchStoreCatalog('products'),
  getCategories: () => fetchStoreCatalog('categories'),
  getTheme: () => fetchStoreCatalog('store/theme'),
  createOrder: (orderData: any) =>
    fetchStoreCatalog('orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
};`,
    },
    {
      file: 'lib/sections/types.ts',
      description: 'Section schema types supporting CMS SectionResolver rendering',
      data: `// OmniStore CMS Section Types
export interface SectionConfig {
  type: 'hero' | 'featured-products' | 'banner' | 'categories' | 'testimonials' | 'video-reel' | 'newsletter';
  config: Record<string, any>;
}

export interface ThemeConfig {
  activeTemplateSlug: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  homeSectionsJson?: string;
}`,
    },
  ];
}

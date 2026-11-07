import { StorefrontProject } from './storefrontTemplates';

export interface GeneratedCodeFile {
  file: string;
  data: string;
  description: string;
}

/**
 * Generates an autonomous, production-ready Next.js 16 web application
 * with clean component-driven App Router architecture.
 *
 * Designed as a standalone modern website without direct coupling or reference
 * to internal multi-template monolith registries.
 */
export function generateNextjsProjectFiles(project: StorefrontProject): GeneratedCodeFile[] {
  const { brandName, tagline, theme } = project;
  const projectSlug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'omnistore-website';

  const isMarketplace =
    project.sections.some(
      (s) => s.type === 'marketplace_header' || s.type === 'marketplace_grid' || s.type === 'lightning_deals' || (s.contentJson && s.contentJson.isMarketplace)
    ) ||
    (project.industry && project.industry.toLowerCase().includes('marketplace')) ||
    brandName.toLowerCase().includes('market') ||
    brandName.toLowerCase().includes('amazon');

  // Extract products and currency from project or database bound sections
  const prodSec = project.sections.find((s) => s.type === 'products' || s.id === 'products');
  const marketSec = project.sections.find((s) => s.type === 'marketplace_grid' || s.id === 'marketplace_grid');
  const rawProducts = ((prodSec?.contentJson?.products as any[]) || (marketSec?.contentJson?.products as any[]) || []);
  const currencySymbol =
    project.currencySymbol ||
    (project.currency === 'INR' ? '₹' : project.currency === 'EUR' ? '€' : project.currency === 'GBP' ? '£' : '$');

  const formattedProducts =
    rawProducts.length > 0
      ? rawProducts.map((p, idx) => ({
          id: String(p.id || `prod-${idx + 1}`),
          name: p.name || `Product ${idx + 1}`,
          price: Number(p.price) || 99,
          category: p.category || 'Curated',
          imageUrl:
            p.image ||
            p.imageUrl ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
          description: p.description || 'Authentic verified store item.',
          inStock: true,
        }))
      : [
          {
            id: '1',
            name: `${brandName} Flagship Edition`,
            price: 249,
            category: 'Signature',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
            description: 'Refined craftsmanship crafted with verified sustainable materials.',
            inStock: true,
          },
          {
            id: '2',
            name: 'Atelier Artisan Piece',
            price: 185,
            category: 'Handcrafted',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
            description: 'Special release finished to exacting specifications.',
            inStock: true,
          },
          {
            id: '3',
            name: 'Minimalist Modular Object',
            price: 320,
            category: 'Limited Drop',
            imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop',
            description: 'Designed for daily luxury and enduring aesthetic balance.',
            inStock: true,
          },
          {
            id: '4',
            name: 'Curated Heritage Essential',
            price: 140,
            category: 'Essential',
            imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop',
            description: 'Our pinnacle achievement in modern design distinction.',
            inStock: true,
          },
        ];

  const topProduct = formattedProducts[0];
  const productsCode = JSON.stringify(formattedProducts, null, 2);

  // Identify custom sections with customHtml
  const customSecMap = new Map<string, string>();
  const customSecFiles: GeneratedCodeFile[] = [];

  project.sections.forEach((sec, idx) => {
    if (sec.customHtml && sec.customHtml.trim().length > 0) {
      const cleanBase = (sec.name || `CustomSection${idx + 1}`)
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('') || `CustomSection${idx + 1}`;
      const compName = cleanBase.endsWith('Section') ? cleanBase : `${cleanBase}Section`;
      customSecMap.set(sec.id, compName);

      customSecFiles.push({
        file: `components/${compName}.tsx`,
        description: `Bespoke UI component for ${sec.name || 'custom section'}`,
        data: `'use client';

import React from 'react';

export default function ${compName}() {
  return (
    <section id="${sec.id}" className="w-full" dangerouslySetInnerHTML={{ __html: ${JSON.stringify(sec.customHtml)} }} />
  );
}`,
      });
    }
  });

  const customImports = Array.from(customSecMap.values())
    .map((comp) => `import ${comp} from '@/components/${comp}';`)
    .join('\n');

  const customRenders = Array.from(customSecMap.values())
    .map((comp) => `<${comp} />`)
    .join('\n        ');

  const files: GeneratedCodeFile[] = [
    {
      file: 'package.json',
      description: 'Autonomous Next.js 16 package manifest with React 19 and Tailwind CSS v4',
      data: `{
  "name": "${projectSlug}-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^1.16.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}`,
    },
    {
      file: 'next.config.ts',
      description: 'Next.js configuration with remote image optimization patterns',
      data: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.omnistore.shop' },
    ],
  },
};

export default nextConfig;`,
    },
    {
      file: 'app/layout.tsx',
      description: 'Root layout with Google Fonts, metadata, and dynamic CSS theme variables',
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
      <body className="antialiased min-h-screen" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
        {children}
      </body>
    </html>
  );
}`,
    },
    {
      file: 'app/globals.css',
      description: 'Global CSS defining design tokens and Tailwind directives',
      data: `@import "tailwindcss";

:root {
  --theme-primary: ${theme.primary};
  --theme-secondary: ${theme.secondary};
  --theme-accent: ${theme.accent};
  --theme-bg: ${theme.background};
  --theme-card-bg: ${theme.cardBg};
  --theme-text: ${theme.textColor};
  --theme-muted: ${theme.textMuted};
  --theme-border: ${theme.border};
  --theme-radius: ${theme.borderRadius};
  --font-heading: "${theme.headingFont}", serif;
  --font-body: "${theme.bodyFont}", sans-serif;
}

body {
  background-color: var(--theme-bg);
  color: var(--theme-text);
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}`,
    },
    {
      file: 'app/page.tsx',
      description: isMarketplace
        ? 'Modular marketplace landing page with search header, category deals grid, and lightning deals'
        : 'Modular landing page composed of clean, independent React components',
      data: isMarketplace
        ? `'use client';

import React, { useState } from 'react';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import Hero from '@/components/Hero';
import MarketplaceDealsGrid from '@/components/MarketplaceDealsGrid';
import LightningDeals from '@/components/LightningDeals';
import FeaturedProducts from '@/components/FeaturedProducts';
import Reviews from '@/components/Reviews';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';${customImports ? '\n' + customImports : ''}

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <MarketplaceHeader cartCount={cartCount} />

      <main className="flex-1">
        <Hero onCtaClick={() => {
          document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });
        }} />
        <MarketplaceDealsGrid onAddToCart={handleAddToCart} />
        <LightningDeals onAddToCart={handleAddToCart} />
        <FeaturedProducts onAddToCart={handleAddToCart} />${customRenders ? '\n        {/* Bespoke AI Custom Sections */}\n        ' + customRenders : ''}
        <Reviews />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}`
        : `'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import SignatureWidgets from '@/components/SignatureWidgets';
import VideoShowcase from '@/components/VideoShowcase';
import Reviews from '@/components/Reviews';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';${customImports ? '\n' + customImports : ''}

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Top Announcement Banner */}
      <div
        className="py-2.5 px-4 text-center text-xs font-medium tracking-wide border-b flex items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--theme-secondary)', borderColor: 'var(--theme-border)', color: 'var(--theme-muted)' }}
      >
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-accent)' }} />
        <span>COMPLIMENTARY INSURED COURIER ON ORDERS OVER $150 &bull; CODE: WELCOME10</span>
      </div>

      <Navbar cartCount={cartCount} />

      <main className="flex-1">
        <Hero onCtaClick={() => {
          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        }} />
        <FeaturedProducts onAddToCart={handleAddToCart} />
        <SignatureWidgets onAddToCart={handleAddToCart} />
        <VideoShowcase />${customRenders ? '\n        {/* Bespoke AI Custom Sections */}\n        ' + customRenders : ''}
        <Reviews />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}`,
    },
    {
      file: 'app/products/page.tsx',
      description: 'Product catalog & listing page (PLP) with live search, category filtering, and responsive grid',
      data: `'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';
import { Product } from '@/lib/types';

const CATALOG_PRODUCTS: Product[] = ${productsCode};

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [cartCount, setCartCount] = useState(0);

  const categories = ['All', 'Timepieces', 'Audio', 'Home & Living', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <Navbar cartCount={cartCount} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <nav className="text-xs flex items-center gap-2 mb-3" style={{ color: 'var(--theme-muted)' }}>
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--theme-text)' }}>Catalog</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>
                Explore Collection
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--theme-muted)' }}>
                Showing {filteredProducts.length} craftsmanship items
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  placeholder="Filter collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--theme-primary)' : 'var(--theme-card-bg)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--theme-text)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={() => setCartCount((prev) => prev + 1)} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-2xl border" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-card-bg)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
              No items match your filter criteria.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              style={{ backgroundColor: 'var(--theme-primary)', color: '#ffffff' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}`,
    },
    {
      file: 'app/products/[id]/page.tsx',
      description: 'Dynamic Product Description Page (PDP) with multi-angle gallery, variant selector, and instant buy',
      data: `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, ShieldCheck, Truck, RotateCcw, Check } from 'lucide-react';

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Obsidian');
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const images = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
  ];

  const colors = [
    { name: 'Obsidian', hex: '#1C1917' },
    { name: 'Titanium', hex: '#71717A' },
    { name: 'Warm Cream', hex: '#E7E5E4' },
  ];

  const sizes = ['Compact', 'Standard', 'Collector Edition'];

  const handleAddToCart = () => {
    setCartCount((prev) => prev + quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <Navbar cartCount={cartCount} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-xs flex items-center gap-2 mb-6" style={{ color: 'var(--theme-muted)' }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:underline">Collection</Link>
          <span>/</span>
          <span style={{ color: 'var(--theme-text)' }}>${topProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden border relative bg-black/5" style={{ borderColor: 'var(--theme-border)' }}>
              <img
                src={images[selectedImage]}
                alt="Product preview"
                className="w-full h-full object-cover transition-all duration-300"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                In Stock & Ready to Ship
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className="aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer"
                  style={{
                    borderColor: selectedImage === i ? 'var(--theme-primary)' : 'var(--theme-border)',
                  }}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-amber-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--theme-text)' }}>4.9</span>
                <span className="text-xs" style={{ color: 'var(--theme-muted)' }}>(128 verified reviews)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>
                ${topProduct.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--theme-primary)' }}>${currencySymbol}${topProduct.price}.00</span>
                <span className="text-sm line-through" style={{ color: 'var(--theme-muted)' }}>$420.00</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Save 17%</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
              Forged from aerospace-grade zirconium ceramic, this timepiece pairs minimalist modern silhouettes with Swiss quartz movement. Scratch-proof, lightweight, and engineered for uncompromising precision.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text)' }}>
                Finish: <span style={{ color: 'var(--theme-primary)' }}>{selectedColor}</span>
              </label>
              <div className="flex items-center gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className="w-8 h-8 rounded-full border-2 transition relative flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: selectedColor === c.name ? 'var(--theme-primary)' : 'var(--theme-border)',
                      boxShadow: selectedColor === c.name ? '0 0 0 2px var(--theme-primary)' : 'none',
                    }}
                  >
                    {selectedColor === c.name && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text)' }}>
                Edition
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer"
                    style={{
                      backgroundColor: selectedSize === s ? 'var(--theme-primary)' : 'var(--theme-card-bg)',
                      color: selectedSize === s ? '#ffffff' : 'var(--theme-text)',
                      borderColor: selectedSize === s ? 'var(--theme-primary)' : 'var(--theme-border)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border rounded-xl" style={{ borderColor: 'var(--theme-border)' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm hover:opacity-75 cursor-pointer"
                  style={{ color: 'var(--theme-text)' }}
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold" style={{ color: 'var(--theme-text)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-sm hover:opacity-75 cursor-pointer"
                  style={{ color: 'var(--theme-text)' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                style={{
                  backgroundColor: isAdded ? '#10B981' : 'var(--theme-primary)',
                  color: '#ffffff',
                }}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag
                  </>
                ) : (
                  <>Add to Shopping Bag • \${349 * quantity}</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-muted)' }}>
                <Truck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Express 2-Day Air</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-muted)' }}>
                <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-muted)' }}>
                <RotateCcw className="w-4 h-4 shrink-0 text-amber-400" />
                <span>30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}`,
    },
    {
      file: 'components/Navbar.tsx',
      description: 'Responsive header navigation with brand logo, quick search, and cart counter',
      data: `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';

export default function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b transition"
      style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight uppercase" style={{ color: 'var(--theme-text)' }}>
          ${brandName}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#products" className="hover:opacity-80 transition" style={{ color: 'var(--theme-text)' }}>
            Collections
          </Link>
          <Link href="#widgets" className="hover:opacity-80 transition" style={{ color: 'var(--theme-text)' }}>
            Signature Pieces
          </Link>
          <Link href="#reviews" className="hover:opacity-80 transition" style={{ color: 'var(--theme-text)' }}>
            Reviews
          </Link>
          <Link href="#newsletter" className="hover:opacity-80 transition" style={{ color: 'var(--theme-text)' }}>
            VIP Club
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
            style={{ color: 'var(--theme-text)' }}
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            aria-label="Shopping Cart"
            className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
            style={{ color: 'var(--theme-text)' }}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--theme-text)' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-3"
          style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}
        >
          <Link
            href="#products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold"
            style={{ color: 'var(--theme-text)' }}
          >
            Collections
          </Link>
          <Link
            href="#widgets"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold"
            style={{ color: 'var(--theme-text)' }}
          >
            Signature Pieces
          </Link>
          <Link
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold"
            style={{ color: 'var(--theme-text)' }}
          >
            Reviews
          </Link>
        </div>
      )}
    </header>
  );
}`,
    },
    {
      file: 'components/Hero.tsx',
      description: isMarketplace
        ? 'Amazon festival deals panoramic hero banner with mega discount badges and promotional splash'
        : 'High-converting hero section with badge, typography headline, and action CTAs',
      data: isMarketplace
        ? `'use client';

import React from 'react';

export default function Hero({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <section className="relative overflow-hidden w-full pb-20 pt-8 px-4 sm:px-6 border-b" style={{ background: 'linear-gradient(180deg, var(--theme-secondary) 0%, var(--theme-bg) 100%)', borderColor: 'var(--theme-border)' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase" style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}>
            ⚡ GREAT FESTIVAL EDITION — MEGA DEALS
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight" style={{ color: 'var(--theme-text)' }}>
            ${brandName}
          </h1>
          <p className="text-sm sm:text-lg leading-relaxed font-normal" style={{ color: 'var(--theme-muted)' }}>
            ${tagline}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onCtaClick}
              className="px-6 py-3 font-bold text-xs uppercase tracking-wider rounded shadow-lg transition hover:brightness-105"
              style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}
            >
              Shop All Deals
            </button>
            <a
              href="#products"
              className="px-6 py-3 font-semibold text-xs uppercase tracking-wider rounded border transition hover:opacity-80"
              style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
            >
              Explore Best Sellers
            </a>
          </div>
        </div>
        <div className="shrink-0 relative hidden lg:block w-96 aspect-4/3 rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: 'var(--theme-border)' }}>
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop" alt="Mega Deals" className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg">
            UP TO 80% OFF
          </div>
        </div>
      </div>
    </section>
  );
}`
        : `'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Hero({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <section className="relative py-24 sm:py-32 px-6 text-center border-b" style={{ borderColor: 'var(--theme-border)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
          style={{ backgroundColor: 'var(--theme-accent)20', color: 'var(--theme-accent)' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          NEW ARRIVALS NOW LIVE &bull; 2026 EDITION
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
          ${brandName}
        </h1>

        <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
          ${tagline}
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={onCtaClick}
            className="px-8 py-4 font-bold uppercase tracking-wider text-sm transition shadow-xl hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: '#000000',
              borderRadius: 'var(--theme-radius)',
            }}
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}`,
    },
    {
      file: 'components/FeaturedProducts.tsx',
      description: 'Product catalog showcase with category filters and responsive grid',
      data: `'use client';

  import React from 'react';
  import ProductCard from './ProductCard';
  import { ArrowRight } from 'lucide-react';

  const PRODUCTS = ${productsCode};

  export default function FeaturedProducts({ onAddToCart }: { onAddToCart?: () => void }) {
    return (
      <section id= "products" className = "py-20 px-6 max-w-7xl mx-auto" >
        <div className="flex items-center justify-between mb-8" >
          <div>
          <span className="text-xs font-bold uppercase tracking-widest" style = {{ color: 'var(--theme-accent)' }
  }>
    Curated Catalog
      </span>
      < h2 className = "text-2xl sm:text-3xl font-bold mt-1" > Featured Releases </h2>
        < p className = "text-sm mt-1" style = {{ color: 'var(--theme-muted)' }
}>
  Curated for discerning collectors & clientele worldwide.
          </p>
    </div>
    < a
          href = "#products"
className = "inline-flex items-center gap-1 text-sm font-semibold hover:underline"
style = {{ color: 'var(--theme-accent)' }}
        >
  View All < ArrowRight className = "w-4 h-4" />
    </a>
    </div>

    < div className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" >
    {
      PRODUCTS.map((product) => (
        <ProductCard key= { product.id } product = { product } onAddToCart = { onAddToCart } />
        ))
    }
      </div>
      </section>
  );
}`,
    },
    {
      file: 'components/ProductCard.tsx',
      description: 'Reusable product card with image hover zoom, pricing, and add-to-bag button',
      data: `'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: { id: string; name: string; price: number; category?: string; imageUrl: string };
  onAddToCart?: () => void;
}) {
  return (
    <div
      className= "group relative flex flex-col rounded-xl overflow-hidden border transition duration-300 hover:shadow-2xl"
  style = {{
    backgroundColor: 'var(--theme-card-bg)',
      borderColor: 'var(--theme-border)',
        borderRadius: 'var(--theme-radius)',
      }
}
    >
  <div className="aspect-square overflow-hidden bg-black/10" >
    <img
          src={ product.imageUrl }
alt = { product.name }
className = "w-full h-full object-cover group-hover:scale-105 transition duration-500"
  />
  </div>
  < div className = "p-4 flex-1 flex flex-col justify-between" >
    <div>
    {
      product.category && (
        <span className="text-[10px] font-bold uppercase tracking-wider" style = {{ color: 'var(--theme-accent)' }}>
          { product.category }
          </span>
          )}
<h3 className="font-semibold text-sm line-clamp-1 mt-0.5" > { product.name } </h3>
  < p className = "text-sm mt-1 font-bold" style = {{ color: 'var(--theme-accent)' }}>
    ${currencySymbol}\${product.price}.00
      </p>
      </div>
      < button
onClick = { onAddToCart }
className = "mt-3 w-full py-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition hover:opacity-90"
style = {{
  backgroundColor: 'var(--theme-accent)',
    color: '#000000',
      borderRadius: 'var(--theme-radius)',
          }}
        >
  <ShoppingBag className="w-3.5 h-3.5" />
    Add to Bag
      </button>
      </div>
      </div>
  );
}`,
    },
    {
      file: 'components/SignatureWidgets.tsx',
      description: 'Interactive modular carousel showcasing limited edition drop pieces',
      data: `'use client';

import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

const WIDGETS = [
  { id: '1', title: 'Aura Titanium Dial', price: 320, badge: 'Limited Drop' },
  { id: '2', title: 'Lumina Planar Acoustic Module', price: 450, badge: 'Bestseller' },
  { id: '3', title: 'Artisanal Saddle Leather Strap', price: 145, badge: 'Handmade' },
  { id: '4', title: 'Solstice Polarized Module', price: 190, badge: 'Selling Fast' },
];

export default function SignatureWidgets({ onAddToCart }: { onAddToCart?: () => void }) {
  return (
    <section id= "widgets" className = "py-16 px-6 max-w-7xl mx-auto border-t border-b" style = {{ borderColor: 'var(--theme-border)' }
}>
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4" >
    <div>
    <span className="text-xs uppercase tracking-wider font-bold inline-flex items-center gap-1" style = {{ color: 'var(--theme-accent)' }}>
      <Sparkles className="w-3 h-3" />
        Signature Modules
          </span>
          < h2 className = "text-2xl sm:text-3xl font-bold mt-1" > Curated Widgets & Drops </h2>
            < p className = "text-sm mt-1" style = {{ color: 'var(--theme-muted)' }}>
              Explore artisanal modular pieces engineered for exceptional longevity.
          </p>
                </div>
                </div>

                < div className = "flex gap-6 overflow-x-auto pb-4 scroll-smooth" >
                {
                  WIDGETS.map((w) => (
                    <div
            key= { w.id }
            className = "min-w-[280px] p-5 rounded-xl border flex flex-col justify-between"
            style = {{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-border)',
                    borderRadius: 'var(--theme-radius)',
                  }}
                >
                <div>
                <span className= "text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/60 text-white" >
                  { w.badge }
                  </span>
                  < h3 className = "font-bold text-base mt-2" > { w.title } </h3>
                    < p className = "text-lg font-bold mt-1" style = {{ color: 'var(--theme-accent)' }}>
                      $\${ w.price } .00
                        </p>
                        </div>
                        < button
onClick = { onAddToCart }
className = "mt-4 py-2 px-3 rounded font-semibold text-xs transition hover:opacity-90 flex items-center justify-center gap-1.5"
style = {{
  backgroundColor: 'var(--theme-accent)',
    color: '#000000',
      borderRadius: 'var(--theme-radius)',
              }}
            >
  <ShoppingBag className="w-3.5 h-3.5" />
    Add to Bag
      </button>
      </div>
        ))}
</div>
  </section>
  );
}`,
    },
    {
      file: 'components/VideoShowcase.tsx',
      description: 'Cinematic multimedia showcase with high-definition brand reel',
      data: `'use client';

import React from 'react';
import { Play } from 'lucide-react';

export default function VideoShowcase() {
  return (
    <section className= "py-20 px-6 max-w-7xl mx-auto" >
    <div
        className="relative aspect-video sm:aspect-21/9 rounded-2xl overflow-hidden border flex items-center justify-center text-center p-8 shadow-2xl"
  style = {{
    borderColor: 'var(--theme-border)',
      backgroundColor: 'var(--theme-card-bg)',
        }
}
      >
  <div className="absolute inset-0 bg-cover bg-center opacity-40" style = {{
  backgroundImage: "url('https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop')",
        }} />
  < div className = "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

    <div className="relative z-10 max-w-2xl space-y-4" >
      <button
            aria - label="Play Brand Reel"
className = "w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-xl hover:scale-110 transition"
style = {{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}
          >
  <Play className="w-6 h-6 fill-current translate-x-0.5" />
    </button>
    < h3 className = "text-2xl sm:text-4xl font-extrabold text-white tracking-tight" >
      The Making of ${ brandName }
</h3>
  < p className = "text-sm sm:text-base text-zinc-300" >
    A short cinematic glimpse into our workshop, raw materials, and precision craftsmanship.
          </p>
      </div>
      </div>
      </section>
  );
}`,
    },
    {
      file: 'components/Reviews.tsx',
      description: 'Customer reviews & social proof testimonials with star ratings',
      data: `'use client';

import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'The craftsmanship and attention to detail completely surpassed all expectations. Truly timeless.',
    author: 'Elena R.',
    location: 'Geneva, Switzerland',
    rating: 5,
  },
  {
    quote: 'Seamless ordering experience and insured global delivery reached me in just 3 business days.',
    author: 'Marcus V.',
    location: 'New York, USA',
    rating: 5,
  },
  {
    quote: 'One of the best independent brand experiences I have ever had. The quality speaks for itself.',
    author: 'Hiroshi T.',
    location: 'Tokyo, Japan',
    rating: 5,
  },
];

export default function Reviews() {
  return (
    <section id= "reviews" className = "py-20 px-6 max-w-7xl mx-auto border-t" style = {{ borderColor: 'var(--theme-border)' }
}>
  <div className="text-center max-w-2xl mx-auto space-y-3 mb-12" >
    <div className="flex justify-center gap-1" style = {{ color: 'var(--theme-accent)' }}>
    {
      [...Array(5)].map((_, i) => (
        <Star key= { i } className = "w-5 h-5 fill-current" />
          ))
    }
      </div>
      < h2 className = "text-3xl font-bold" > Loved by 10,000 + Discerning Patrons </h2>
        < p className = "text-sm" style = {{ color: 'var(--theme-muted)' }}>
          Rated 4.96 / 5.0 by verified clientele around the globe.
        </p>
            </div>

            < div className = "grid grid-cols-1 md:grid-cols-3 gap-6" >
            {
              TESTIMONIALS.map((t, idx) => (
                <div
            key= { idx }
            className = "p-6 rounded-xl border flex flex-col justify-between space-y-4"
            style = {{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border)',
                borderRadius: 'var(--theme-radius)',
              }}
              >
              <p className="text-sm leading-relaxed italic" >“{ t.quote }”</p>
                < div className = "border-t pt-3 flex items-center justify-between text-xs" style = {{ borderColor: 'var(--theme-border)' }}>
                  <span className="font-bold" > { t.author } </span>
                    < span style = {{ color: 'var(--theme-muted)' }}> { t.location } </span>
                      </div>
                      </div>
        ))}
</div>
  </section>
  );
}`,
    },
    {
      file: 'components/Newsletter.tsx',
      description: 'VIP lead generation and dispatch invitation banner',
      data: `'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id= "newsletter" className = "py-16 px-6 max-w-4xl mx-auto text-center space-y-6" >
      <div
        className="p-8 sm:p-12 rounded-2xl border"
  style = {{
    backgroundColor: 'var(--theme-card-bg)',
      borderColor: 'var(--theme-border)',
        borderRadius: 'var(--theme-radius)',
        }
}
      >
  <h3 className="text-2xl sm:text-3xl font-bold" > Join the ${ brandName } Dispatch </h3>
    < p className = "text-sm max-w-lg mx-auto mt-2" style = {{ color: 'var(--theme-muted)' }}>
      Receive private drop allocations, seasonal catalogs, and an instant 10 % welcome voucher.
        </p>

{
  submitted ? (
    <div className= "mt-6 flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm" >
    <CheckCircle2 className="w-5 h-5" />
      <span>Thank you for subscribing.Check your inbox for code WELCOME10! </span>
        </div>
        ) : (
          <form onSubmit= { handleSubmit } className = "mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" >
            <input
              type="email"
  required
  placeholder = "Enter your email"
  value = { email }
  onChange = {(e) => setEmail(e.target.value)
}
className = "px-4 py-3 rounded-lg border flex-1 text-sm outline-hidden"
style = {{
  backgroundColor: 'var(--theme-bg)',
    borderColor: 'var(--theme-border)',
      color: 'var(--theme-text)',
              }}
            />
  < button
type = "submit"
className = "px-6 py-3 font-bold uppercase text-xs transition hover:opacity-90"
style = {{
  backgroundColor: 'var(--theme-accent)',
    color: '#000000',
      borderRadius: 'var(--theme-radius)',
              }}
            >
  Subscribe
  </button>
  </form>
        )}
</div>
  </section>
  );
}`,
    },
    {
      file: 'components/Footer.tsx',
      description: 'Store footer with brand bio, customer care, and legal policies',
      data: `'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className= "border-t py-16 px-6" style = {{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }
}>
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10" >
    <div className="space-y-4" >
      <span className="text-xl font-bold uppercase tracking-tight" > ${ brandName } </span>
        < p className = "text-sm leading-relaxed" style = {{ color: 'var(--theme-muted)' }}> ${ tagline } </p>
          </div>
          < div >
          <h4 className="font-semibold text-sm mb-4" > Explore </h4>
            < ul className = "space-y-2 text-sm" style = {{ color: 'var(--theme-muted)' }}>
              <li><Link href="#products" className = "hover:underline" > Catalog Releases < /Link></li >
                <li><Link href="#widgets" className = "hover:underline" > Signature Pieces < /Link></li >
                  <li><Link href="#reviews" className = "hover:underline" > Client Testimonials < /Link></li >
                    </ul>
                    </div>
                    < div >
                    <h4 className="font-semibold text-sm mb-4" > Customer Care </h4>
                      < ul className = "space-y-2 text-sm" style = {{ color: 'var(--theme-muted)' }}>
                        <li><a href="#" className = "hover:underline" > Global Shipping Terms < /a></li >
                          <li><a href="#" className = "hover:underline" > Warranty & Care Guide < /a></li >
                            <li><a href="#" className = "hover:underline" > VIP Concierge Contact < /a></li >
                              </ul>
                              </div>
                              < div className = "space-y-4" >
                                <h4 className="font-semibold text-sm" > Direct Concierge </h4>
                                  < p className = "text-xs leading-relaxed" style = {{ color: 'var(--theme-muted)' }}>
                                    Need immediate assistance or bespoke sizing ? Our atelier concierge is available 7 days a week.
          </p>
                                      </div>
                                      </div>
                                      < div
className = "max-w-7xl mx-auto mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between text-xs"
style = {{ borderColor: 'var(--theme-border)', color: 'var(--theme-muted)' }}
      >
  <p>© { new Date().getFullYear() } ${ brandName }. Powered by OmniStore.</p>
    < div className = "flex gap-4 mt-2 sm:mt-0" >
      <a href="#" className = "hover:underline" > Privacy Policy </a>
        < a href = "#" className = "hover:underline" > Terms of Service </a>
          </div>
          </div>
          </footer>
  );
}`,
    },
    {
      file: 'lib/api.ts',
      description: 'Headless OmniStore REST API client with automatic fallback simulation',
      data: `// OmniStore Headless E-Commerce Client
const API_URL = process.env.NEXT_PUBLIC_OMNISTORE_API_URL || 'https://api.omnistore.shop';
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'store_default';

export async function fetchStoreProducts(category?: string) {
  try {
    const endpoint = category
      ?\`\${API_URL}/api/products?storeId=\${STORE_ID}&category=\${encodeURIComponent(category)}\`
      : \`\${API_URL}/api/products?storeId=\${STORE_ID}\`;
    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Catalog fetch error');
    return await res.json();
  } catch (err) {
    console.warn('[OmniStore Client] Utilizing local catalog cache:', err);
    const files: GeneratedCodeFile[] = [];
  }
}

export async function submitCartOrder(payload: any) {
  const res = await fetch(\`\${API_URL}/api/orders\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-store-id': STORE_ID },
    body: JSON.stringify(payload),
  });
  return await res.json();
}`,
    },
  {
    file: 'lib/types.ts',
      description: 'Core TypeScript interfaces for catalog items, sections, and theme tokens',
        data: `export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl: string;
  description?: string;
  inStock?: boolean;
}

export interface ThemeTokens {
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
}`,
    },
  ];

  if (isMarketplace) {
    files.push(
      {
        file: 'components/MarketplaceHeader.tsx',
        description: 'Amazon-style multi-tier marketplace navigation bar with department selector, search bar, and cart badge',
        data: `'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, MapPin, Globe } from 'lucide-react';

export default function MarketplaceHeader({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="sticky top-0 z-40 w-full flex flex-col shadow-md">
      {/* Top Tier Navy Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4 text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="text-2xl font-black tracking-tight uppercase flex items-center gap-1 text-white">
            <span>${brandName}</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}>.shop</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-300 hover:border border-white/40 p-1 rounded cursor-pointer">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <div>
              <div className="text-[10px] text-zinc-400 leading-none">Deliver to</div>
              <div className="font-bold text-white text-[11px] leading-tight">All Locations</div>
            </div>
          </div>
        </div>

        {/* Central Search Bar with Department Selector */}
        <div className="flex-1 max-w-3xl mx-2 flex items-center">
          <div className="w-full flex rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2" style={{ ringColor: 'var(--theme-accent)' }}>
            <select className="px-3 py-2 text-xs bg-zinc-100 text-zinc-800 border-r border-zinc-300 outline-none cursor-pointer hidden sm:block">
              <option>All Departments</option>
              <option>Mega Deals</option>
              <option>Electronics</option>
              <option>Home & Kitchen</option>
              <option>Fashion</option>
            </select>
            <input
              type="text"
              placeholder="Search ${brandName} for electronics, fashion, home..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            <button className="px-5 py-2 flex items-center justify-center transition hover:brightness-105" style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}>
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
          <div className="hidden md:flex items-center gap-1 font-bold text-white hover:border border-white/40 p-1.5 rounded cursor-pointer">
            <Globe className="w-3.5 h-3.5" />
            <span>EN</span>
          </div>
          <div className="hidden sm:block hover:border border-white/40 p-1.5 rounded cursor-pointer">
            <div className="text-[10px] text-zinc-300 leading-none">Hello, Sign In</div>
            <div className="font-bold text-white text-xs leading-tight">Account & Lists ▾</div>
          </div>
          <Link href="#cart" className="flex items-center gap-1.5 p-1.5 hover:border border-white/40 rounded transition cursor-pointer">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-black text-black" style={{ backgroundColor: 'var(--theme-accent)' }}>
                {cartCount}
              </span>
            </div>
            <span className="font-bold text-white hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Secondary Category Subnav Bar */}
      <div className="px-4 py-2 flex items-center gap-6 text-xs text-white overflow-x-auto whitespace-nowrap border-t" style={{ backgroundColor: 'var(--theme-secondary)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <span className="font-bold cursor-pointer">☰ All</span>
        <Link href="#deals" className="hover:underline font-semibold" style={{ color: 'var(--theme-accent)' }}>⚡ Today's Deals</Link>
        <Link href="#products" className="hover:underline">Best Sellers</Link>
        <Link href="#products" className="hover:underline">Electronics</Link>
        <Link href="#products" className="hover:underline">Home & Living</Link>
        <Link href="#newsletter" className="hover:underline">Gift Cards</Link>
      </div>
    </header>
  );
}`,
      },
      {
        file: 'components/MarketplaceDealsGrid.tsx',
        description: 'Amazon signature 4-box category deals grid with quadrant item previews and deal timers',
        data: `'use client';

import React from 'react';

export default function MarketplaceDealsGrid({ onAddToCart }: { onAddToCart?: () => void }) {
  return (
    <section className="relative z-20 -mt-16 sm:-mt-24 px-4 sm:px-6 max-w-7xl mx-auto w-full mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Box 1 */}
        <div className="p-5 rounded-lg border shadow-md flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}>
          <div>
            <h3 className="font-bold text-base mb-3" style={{ color: 'var(--theme-text)' }}>Deals in Electronics & PCs</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="group cursor-pointer">
                <div className="aspect-square rounded overflow-hidden bg-zinc-100">
                  <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="text-[11px] font-medium mt-1 truncate" style={{ color: 'var(--theme-text)' }}>Laptops & PCs</div>
              </div>
              <div className="group cursor-pointer">
                <div className="aspect-square rounded overflow-hidden bg-zinc-100">
                  <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="text-[11px] font-medium mt-1 truncate" style={{ color: 'var(--theme-text)' }}>Smartwatches</div>
              </div>
            </div>
          </div>
          <a href="#products" className="text-xs font-semibold mt-4 hover:underline" style={{ color: 'var(--theme-accent)' }}>See all tech deals →</a>
        </div>

        {/* Box 2 */}
        <div className="p-5 rounded-lg border shadow-md flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}>
          <div>
            <h3 className="font-bold text-base mb-3" style={{ color: 'var(--theme-text)' }}>Refresh Your Home & Kitchen</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="group cursor-pointer">
                <div className="aspect-square rounded overflow-hidden bg-zinc-100">
                  <img src="https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="text-[11px] font-medium mt-1 truncate" style={{ color: 'var(--theme-text)' }}>Air Fryers</div>
              </div>
              <div className="group cursor-pointer">
                <div className="aspect-square rounded overflow-hidden bg-zinc-100">
                  <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="text-[11px] font-medium mt-1 truncate" style={{ color: 'var(--theme-text)' }}>Comfort Living</div>
              </div>
            </div>
          </div>
          <a href="#products" className="text-xs font-semibold mt-4 hover:underline" style={{ color: 'var(--theme-accent)' }}>Explore kitchen & home →</a>
        </div>

        {/* Box 3: Deal of Day */}
        <div className="p-5 rounded-lg border shadow-md flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base" style={{ color: 'var(--theme-text)' }}>Deal of the Day</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">55% OFF</span>
            </div>
            <div className="aspect-video rounded overflow-hidden bg-zinc-100 my-2">
              <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs font-bold line-clamp-1 mt-2" style={{ color: 'var(--theme-text)' }}>Mechanical RGB Gaming Keyboard Pro</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-black text-rose-600">$79.99</span>
              <span className="text-xs line-through" style={{ color: 'var(--theme-muted)' }}>$159.99</span>
            </div>
          </div>
          <button onClick={onAddToCart} className="mt-4 w-full py-2 text-xs font-bold uppercase rounded shadow-md transition hover:brightness-105" style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}>
            Claim Lightning Deal
          </button>
        </div>

        {/* Box 4 */}
        <div className="p-5 rounded-lg border shadow-md flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}>
          <div>
            <h3 className="font-bold text-base mb-2" style={{ color: 'var(--theme-text)' }}>Sign in for your best experience</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-muted)' }}>Get personalized deals, tracking, and Prime 1-day delivery.</p>
            <button className="w-full mt-3 py-2 text-xs font-bold uppercase rounded shadow-xs" style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}>
              Sign in securely
            </button>
          </div>
          <div className="border-t pt-3 mt-3 space-y-2" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)' }}>Certified Prime Brands</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-zinc-100 font-bold" style={{ color: 'var(--theme-text)' }}>⚡ Prime Delivery</span>
              <span className="px-2 py-1 rounded bg-zinc-100 font-bold text-emerald-600">✓ A-to-Z Safe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
      },
      {
        file: 'components/LightningDeals.tsx',
        description: 'Amazon Today Lightning Deals horizontal slider with timer and claim progress bars',
        data: `'use client';

import React from 'react';

export default function LightningDeals({ onAddToCart }: { onAddToCart?: () => void }) {
  const deals = [
    { title: 'AeroPulse ANC Headphone', price: 149, original: 229, discount: '35% off', claimed: 82, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop' },
    { title: 'OLED 4K Smart Television', price: 649, original: 899, discount: '28% off', claimed: 91, img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop' },
    { title: 'Digital Air Fryer XL', price: 79, original: 129, discount: '39% off', claimed: 64, img: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=300&auto=format&fit=crop' },
    { title: 'Tactile Keyboard Pro', price: 69, original: 119, discount: '42% off', claimed: 78, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop' },
  ];

  return (
    <section id="deals" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full my-6 p-6 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--theme-text)' }}>
            Today's Lightning Deals
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">LIMITED TIME</span>
        </div>
        <span className="text-xs font-semibold" style={{ color: 'var(--theme-muted)' }}>Ends in 03:24:18</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {deals.map((deal, idx) => (
          <div key={idx} className="p-3 rounded-lg border flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <div className="aspect-square rounded overflow-hidden mb-2 bg-zinc-100">
              <img src={deal.img} alt={deal.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">{deal.discount}</span>
              <span className="text-[11px] font-bold text-rose-600">Deal</span>
            </div>
            <div className="text-xs font-bold line-clamp-1 mb-1" style={{ color: 'var(--theme-text)' }}>{deal.title}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black" style={{ color: 'var(--theme-text)' }}>\${deal.price}</span>
              <span className="text-xs line-through" style={{ color: 'var(--theme-muted)' }}>\${deal.original}</span>
            </div>
            <button onClick={onAddToCart} className="w-full py-1.5 text-xs font-bold uppercase rounded shadow-xs" style={{ backgroundColor: 'var(--theme-accent)', color: '#000000' }}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}`,
      }
    );
  }

  // Include bespoke AI custom sections
  if (customSecFiles.length > 0) {
    files.push(...customSecFiles);
  }

  return files;
}

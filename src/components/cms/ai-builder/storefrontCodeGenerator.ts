import { StorefrontProject } from './storefrontTemplates';

export interface GeneratedCodeFile {
  file: string;
  data: string;
  description: string;
}

export function generateNextjsProjectFiles(project: StorefrontProject): GeneratedCodeFile[] {
  const { brandName, tagline, theme } = project;

  return [
    {
      file: 'app/layout.tsx',
      description: 'Root layout with Google Fonts, dynamic metadata and theme tokens',
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
      <body className="antialiased min-h-screen bg-[${theme.background}] text-[${theme.textColor}]">
        {children}
      </body>
    </html>
  );
}`,
    },
    {
      file: 'app/page.tsx',
      description: 'Main storefront landing page assembling modular sections & cart state',
      data: `'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { VideoShowcase } from '@/components/VideoShowcase';
import { VideoReels } from '@/components/VideoReels';
import { ProductCatalog } from '@/components/ProductCatalog';
import { CartDrawer, CartItem } from '@/components/CartDrawer';
import { ReviewsSection } from '@/components/ReviewsSection';
import { Footer } from '@/components/Footer';

export default function StorefrontPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: { name: string; price: number; image: string }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === product.name);
      if (existing) {
        return prev.map((i) => (i.name === product.name ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, id: String(Date.now()), qty: 1 }];
    });
    setIsCartOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[${theme.background}] text-[${theme.textColor}]">
      <Navbar
        brandName="${brandName}"
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        <HeroSection onExplore={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} />
        <VideoShowcase />
        <VideoReels />
        <ProductCatalog onAddToCart={handleAddToCart} />
        <ReviewsSection />
      </main>

      <Footer brandName="${brandName}" />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={(name, delta) =>
          setCart((prev) =>
            prev
              .map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i))
              .filter((i) => i.qty > 0)
          )
        }
      />
    </div>
  );
}`,
    },
    {
      file: 'components/HeroSection.tsx',
      description: 'Cinematic hero with looped video background and trust indicators',
      data: `'use client';

import React, { useState } from 'react';

export function HeroSection({ onExplore }: { onExplore: () => void }) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center text-center px-6 overflow-hidden border-b border-[${theme.border}]">
      <video
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
        poster="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&auto=format&fit=crop"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-12 pb-16">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[${theme.accent}]/20 text-[${theme.accent}] border border-[${theme.accent}]/30">
          ✨ SS26 ATELIER COLLECTION
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-serif">
          ${brandName}
        </h1>

        <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          ${tagline}
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={onExplore}
            className="px-8 py-4 rounded-[${theme.borderRadius}] bg-[${theme.accent}] text-black font-bold uppercase tracking-wider shadow-2xl hover:brightness-110 transition"
          >
            Explore Drops
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="px-6 py-4 rounded-[${theme.borderRadius}] bg-white/10 hover:bg-white/15 text-white font-semibold uppercase tracking-wider backdrop-blur-md transition"
          >
            {isMuted ? '🔇 Unmute Video' : '🔊 Sound Active'}
          </button>
        </div>
      </div>
    </section>
  );
}`,
    },
    {
      file: 'components/CartDrawer.tsx',
      description: 'Slide-over shopping cart drawer with checkout & WhatsApp integration',
      data: `'use client';

import React from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQty,
}: {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (name: string, delta: number) => void;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[${theme.cardBg}] border-l border-[${theme.border}] shadow-2xl flex flex-col">
        <div className="p-6 border-b border-[${theme.border}] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Acquisition Bag ({items.length})</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item) => (
            <div key={item.name} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-white">{item.name}</h4>
                <p className="text-xs text-[${theme.accent}] mt-0.5">$\${item.price}.00</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQty(item.name, -1)} className="w-5 h-5 bg-white/10 text-white rounded">-</button>
                  <span className="text-xs text-white">\${item.qty}</span>
                  <button onClick={() => onUpdateQty(item.name, 1)} className="w-5 h-5 bg-white/10 text-white rounded">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-[${theme.border}] space-y-3">
          <div className="flex justify-between text-white font-bold">
            <span>Subtotal</span>
            <span>$\${subtotal}.00</span>
          </div>
          <button className="w-full py-3.5 rounded-[${theme.borderRadius}] bg-[${theme.accent}] text-black font-bold uppercase tracking-wider shadow-lg">
            Checkout with OmniStore →
          </button>
        </div>
      </div>
    </div>
  );
}`,
    },
    {
      file: 'lib/omnistore-api.ts',
      description: 'OmniStore headless e-commerce client connector',
      data: `// OmniStore Headless E-Commerce Client
const API_URL = process.env.NEXT_PUBLIC_OMNISTORE_API_URL || 'http://localhost:5000/api';
const STORE_ID = process.env.NEXT_PUBLIC_OMNISTORE_STORE_ID || 'default_store';

export async function fetchStorefrontCatalog() {
  const res = await fetch(\`\${API_URL}/products?storeId=\${STORE_ID}\`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch store inventory');
  return res.json();
}

export async function createCheckoutSession(cart: any[]) {
  const res = await fetch(\`\${API_URL}/orders\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-store-id': STORE_ID },
    body: JSON.stringify({ items: cart }),
  });
  return res.json();
}`,
    },
    {
      file: 'tailwind.config.ts',
      description: 'Tailwind CSS design token configuration',
      data: `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '${theme.primary}',
        secondary: '${theme.secondary}',
        accent: '${theme.accent}',
        background: '${theme.background}',
        card: '${theme.cardBg}',
        text: '${theme.textColor}',
        muted: '${theme.textMuted}',
        border: '${theme.border}',
      },
      borderRadius: {
        custom: '${theme.borderRadius}',
      },
    },
  },
  plugins: [],
};

export default config;`,
    },
  ];
}

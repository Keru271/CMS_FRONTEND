'use client';

import React, { useState } from 'react';
import {
  Store,
  X,
  Sparkles,
  CheckCircle2,
  Globe,
  Coins,
  Palette,
  Layers,
  ArrowRight,
  RefreshCw,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useCMS } from '@/src/context/CMSContext';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', gateway: 'Razorpay / UPI' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', gateway: 'Stripe / Global Cards' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', gateway: 'Stripe / SEPA' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', gateway: 'Stripe / Cards' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', gateway: 'Stripe' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', gateway: 'Stripe' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', gateway: 'Stripe' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', gateway: 'Stripe' },
];

const CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Apparel', icon: '👗' },
  { id: 'electronics', label: 'Tech & Electronics', icon: '⚡' },
  { id: 'beauty', label: 'Beauty & Wellness', icon: '✨' },
  { id: 'jewelry', label: 'Jewelry & Luxury', icon: '💎' },
  { id: 'home', label: 'Home & Living', icon: '🏡' },
  { id: 'food', label: 'Food & Gourmet', icon: '☕' },
  { id: 'fitness', label: 'Sports & Activewear', icon: '👟' },
  { id: 'art', label: 'Art & Collectibles', icon: '🎨' },
];

const THEMES = [
  {
    slug: 'nova-tech',
    name: 'Nova Tech',
    accent: '#3b82f6',
    desc: 'High-conversion cyber dark tech aesthetic',
  },
  {
    slug: 'aura-luxe',
    name: 'Aura Luxe',
    accent: '#d97706',
    desc: 'Editorial luxury boutique with serif elegance',
  },
  {
    slug: 'pulse-minimal',
    name: 'Pulse Minimal',
    accent: '#10b981',
    desc: 'Clean Scandinavian monochrome grid layout',
  },
  {
    slug: 'zenith-bold',
    name: 'Zenith Bold',
    accent: '#8b5cf6',
    desc: 'Vibrant punchy street style with neon badges',
  },
];

export const CreateStoreModal: React.FC = () => {
  const { isCreateStoreModalOpen, setIsCreateStoreModalOpen, createNewStore } = useCMS();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [categoryName, setCategoryName] = useState('Fashion & Apparel');
  const [templateSlug, setTemplateSlug] = useState('nova-tech');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCreateStoreModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Store name is required.');
      return;
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!finalSlug) {
      setErrorMessage('Store URL handle is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createNewStore({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || `Official ${name.trim()} Online Store`,
        currency,
        categoryName,
        templateSlug,
      });

      // Reset form
      setName('');
      setSlug('');
      setIsCustomSlug(false);
      setDescription('');
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Failed to create store. Please check slug uniqueness and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#cbd5e0] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#191a1b] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d4ff4c]/20 border border-[#d4ff4c]/40 flex items-center justify-center text-[#d4ff4c]">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Add New Store to Portfolio
              </h3>
              <p className="text-xs text-gray-300 font-sans">
                Each store has its own independent dashboard, analytics & payment gateway.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateStoreModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Store Name & Slug */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#191a1b] mb-1">
                Store Name *
              </label>
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Aura Artisan Atelier"
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#191a1b]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#191a1b]">
                  Store URL Handle (Slug)
                </label>
                <span className="text-[11px] text-[#5e5a5a]">
                  Unique Web Storefront Address
                </span>
              </div>
              <div className="flex items-center rounded-xl bg-[#fdf1ef] border border-[#cbd5e0] px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#191a1b]">
                <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-[#5e5a5a] pl-2 font-mono">onlinestore.io/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setIsCustomSlug(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  }}
                  placeholder="aura-artisan"
                  className="w-full px-1.5 py-2.5 text-xs font-mono bg-transparent focus:outline-none text-[#191a1b]"
                />
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#191a1b] flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Primary Currency & Payment Engine</span>
              </label>
              <span className="text-[10px] text-[#5e5a5a]">Independent Gateway Keys</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURRENCIES.map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#191a1b] bg-[#191a1b] text-white shadow-xs'
                        : 'border-[#cbd5e0] bg-[#fdf1ef] hover:border-gray-400 text-[#191a1b]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{curr.flag}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-[#d4ff4c]' : 'bg-gray-200 text-[#191a1b]'
                        }`}
                      >
                        {curr.symbol}
                      </span>
                    </div>
                    <p className={`text-xs font-bold mt-1 ${isSelected ? 'text-white' : 'text-[#191a1b]'}`}>
                      {curr.code}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-gray-300' : 'text-[#5e5a5a]'
                      }`}
                    >
                      {curr.gateway}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#191a1b]">
              Industry Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = categoryName === cat.label;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryName(cat.label)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#191a1b] text-[#d4ff4c] border-[#191a1b]'
                        : 'bg-[#fdf1ef] text-[#191a1b] border-[#cbd5e0] hover:bg-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#191a1b] flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Initial Designer Theme</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEMES.map((th) => {
                const isSelected = templateSlug === th.slug;
                return (
                  <button
                    type="button"
                    key={th.slug}
                    onClick={() => setTemplateSlug(th.slug)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#191a1b] bg-[#191a1b]/5 ring-2 ring-[#191a1b]'
                        : 'border-[#cbd5e0] bg-[#fdf1ef] hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: th.accent }}
                    >
                      {th.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#191a1b]">{th.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#5e5a5a] line-clamp-1">{th.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security & Multi-Tenant Notice */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              This new store will have completely segregated inventory, order books, domain settings, and encrypted payment credentials (AES-256-GCM).
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#cbd5e0]/60">
            <button
              type="button"
              onClick={() => setIsCreateStoreModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-[#5e5a5a] hover:text-[#191a1b] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 bg-[#191a1b] hover:bg-black text-[#d4ff4c] text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#d4ff4c]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#d4ff4c]" />
              )}
              <span>{isSubmitting ? 'Creating Store...' : 'Launch & Switch to Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

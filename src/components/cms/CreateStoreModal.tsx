'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  X,
  Sparkles,
  CheckCircle2,
  Globe,
  Coins,
  Palette,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useCMS } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { StoreTemplate } from '@/src/types';

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

export const CreateStoreModal: React.FC = () => {
  const { isCreateStoreModalOpen, setIsCreateStoreModalOpen, createNewStore } = useCMS();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [categoryName, setCategoryName] = useState('Fashion & Apparel');
  const [templateSlug, setTemplateSlug] = useState('nova-tech');
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isCreateStoreModalOpen) return;
    let isMounted = true;
    setIsLoadingTemplates(true);
    setErrorMessage(null);
    cmsService
      .getStoreTemplates()
      .then((data) => {
        if (!isMounted) return;
        setTemplates(data || []);
        if (data && data.length > 0 && data[0].slug) {
          setTemplateSlug(data[0].slug);
        }
      })
      .catch((err) => {
        console.error('Failed to load store templates in modal:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTemplates(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isCreateStoreModalOpen]);

  if (!isCreateStoreModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated);
    }
  };

  const handleSlugChange = (raw: string) => {
    setIsCustomSlug(true);
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Store name is required.');
      return;
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!finalSlug) {
      setErrorMessage('A valid store URL handle is required.');
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
      setIsCreateStoreModalOpen(false);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          'Failed to create store. Please check slug uniqueness and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          setIsCreateStoreModalOpen(false);
        }
      }}
    >
      <div className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 dark:border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shadow-xs shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-foreground">
                Add New Store to Portfolio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Each store has its own independent dashboard, analytics & payment gateway.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !isSubmitting && setIsCreateStoreModalOpen(false)}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-accent transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-600 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Store Name & Slug */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Aura Artisan Atelier"
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-slate-900 dark:text-foreground placeholder:text-slate-400 placeholder:font-normal focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Store URL Handle (Slug) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Unique Web Storefront Address</span>
              </div>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 overflow-hidden focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-accent text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-border select-none shrink-0 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>onlinestore.io/</span>
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="aura-artisan"
                  className="w-full px-3.5 py-2 bg-transparent text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none placeholder:font-sans placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Tagline / Description <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Curated luxury essentials & artisan goods"
                className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/40 text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Primary Currency & Payment Engine</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Independent Gateway Keys</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURRENCIES.map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-border bg-slate-50/60 dark:bg-accent/20 hover:bg-white dark:hover:bg-accent/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{curr.flag}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200/80 dark:bg-accent text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {curr.symbol}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-black mt-1.5 ${
                        isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-foreground'
                      }`}
                    >
                      {curr.code}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-500 dark:text-slate-400'
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Industry Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = categoryName === cat.label;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryName(cat.label)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/30 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-accent hover:border-slate-300'
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Initial Storefront Template</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {templates.length} from API
              </span>
            </div>

            {isLoadingTemplates ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Loading templates from API...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">No Store Templates Configured</p>
                <p className="text-[11px] text-slate-500">
                  Your store will be created with default settings. You can assign templates later once added.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {templates.map((th) => {
                  const thSlug = th.slug || th.id || '';
                  const isSelected = templateSlug === thSlug;
                  return (
                    <button
                      type="button"
                      key={thSlug}
                      onClick={() => thSlug && setTemplateSlug(thSlug)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-2 border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-border bg-slate-50/60 dark:bg-accent/20 hover:bg-white dark:hover:bg-accent/40 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs"
                        style={{ backgroundColor: th.accentColor || '#4f46e5' }}
                      >
                        {th.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-foreground truncate">{th.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-auto" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{th.tagline || th.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Security & Multi-Tenant Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              This new store will have completely segregated inventory, order books, domain
              settings, and encrypted payment credentials (AES-256-GCM).
            </p>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-accent/20 border-t border-slate-200/80 dark:border-border flex items-center justify-end gap-3 shrink-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6">
            <button
              type="button"
              onClick={() => setIsCreateStoreModalOpen(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Store...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Launch & Switch to Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

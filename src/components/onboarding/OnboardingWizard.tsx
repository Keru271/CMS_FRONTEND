'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { StoreSetupData, CMSProduct } from '@/src/types';
import { getCurrencySymbol } from '@/src/lib/currency';
import { AiStoreBuilderModal } from '@/src/components/ai/AiStoreBuilderModal';
import {
  Store,
  Sparkles,
  Wand2,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Layers,
  Palette,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Rocket,
  ShieldCheck,
  Check,
  Building2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';

// Store Industry Categories
const CATEGORIES = [
  { id: 'Fashion & Apparel', name: 'Fashion & Apparel', icon: '👗', desc: 'Clothing, shoes, accessories & jewelry' },
  { id: 'Electronics & Gadgets', name: 'Electronics & Gadgets', icon: '⚡', desc: 'Audio, tech accessories, hardware & devices' },
  { id: 'Beauty & Cosmetics', name: 'Beauty & Cosmetics', icon: '💄', desc: 'Skincare, haircare, makeup & perfumes' },
  { id: 'Home & Living', name: 'Home & Living', icon: '🛋️', desc: 'Furniture, kitchenware, decor & lighting' },
  { id: 'Food & Groceries', name: 'Food & Groceries', icon: '🥑', desc: 'Artisan snacks, coffee, organic & pantry' },
  { id: 'Health & Fitness', name: 'Health & Fitness', icon: '🏃', desc: 'Supplements, sports gear & activewear' },
  { id: 'Digital Products', name: 'Digital Products', icon: '💻', desc: 'Software, eBooks, courses & digital art' },
  { id: 'General Catalog', name: 'General Catalog', icon: '🛍️', desc: 'Multi-category retail and marketplace store' },
];

// Currencies
const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
];

// Countries
const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', timezone: 'Asia/Kolkata' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', timezone: 'Europe/London' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', timezone: 'America/Toronto' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', timezone: 'Australia/Sydney' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', timezone: 'Asia/Dubai' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', timezone: 'Asia/Singapore' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', timezone: 'Europe/Berlin' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', timezone: 'Asia/Tokyo' },
];

// Storefront Templates
const THEMES = [
  {
    id: 'nova-tech',
    name: 'Nova High-Tech',
    desc: 'Cutting-edge headless layout with dark accents, high conversions, and dynamic grids.',
    accent: '#4f46e5',
    tag: 'Popular',
    previewBg: 'from-slate-900 via-indigo-950 to-slate-900',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    desc: 'Clean scandinavian design emphasizing high-resolution photography and typography.',
    accent: '#0f172a',
    tag: 'Clean',
    previewBg: 'from-zinc-100 via-stone-50 to-zinc-200',
  },
  {
    id: 'luxe-atelier',
    name: 'Luxe Atelier',
    desc: 'Editorial luxury aesthetic with dark obsidian tones, serif accents, and gold finishes.',
    accent: '#d97706',
    tag: 'Premium',
    previewBg: 'from-stone-950 via-amber-950 to-stone-900',
  },
  {
    id: 'bold-streetwear',
    name: 'Streetwear Brutalist',
    desc: 'High-energy layout with bold borders, sticker badges, and high-impact typography.',
    accent: '#e11d48',
    tag: 'Trendy',
    previewBg: 'from-rose-950 via-zinc-900 to-black',
  },
];

export const OnboardingWizard: React.FC = () => {
  const router = useRouter();

  let merchantData: any = null;
  let setMerchantData: any = null;
  try {
    const cmsCtx = useCMSContext();
    merchantData = cmsCtx.merchantData;
    setMerchantData = cmsCtx.setMerchantData;
  } catch {
    // Fallback if rendered outside CMSProvider
  }

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Identity
    storeName: '',
    slug: '',
    tagline: '',
    category: 'Fashion & Apparel',
    // Step 2: Regional
    currency: 'INR',
    country: 'India',
    timezone: 'Asia/Kolkata',
    language: 'English',
    // Step 3: Contact & Channels
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    addressCity: '',
    addressState: '',
    addressCountry: 'India',
    // Step 4: Theme & Starter Catalog
    theme: 'nova-tech',
    seedSampleProducts: true,
    logoUrl: '',
  });

  const [isReady, setIsReady] = useState(false);

  // Check database if merchant has already completed onboarding
  useEffect(() => {
    let isMounted = true;

    async function verifyDbOnboardingStatus() {
      try {
        const session = cmsService.getMerchantSession();
        const userFirstName = session?.merchant?.firstName || merchantData?.merchant?.firstName || '';
        const existingStore = session?.store || merchantData?.store;

        // Fetch fresh user profile directly from database
        const dbUser = await cmsService.getCurrentUser();

        if (dbUser && dbUser.onboardingCompleted === true) {
          router.replace('/dashboard');
          return;
        }

        const initialName = existingStore?.storeName || (userFirstName ? `${userFirstName}'s Store` : 'My Online Store');
        const initialSlug = existingStore?.slug || initialName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-store';

        if (isMounted) {
          setFormData((prev) => ({
            ...prev,
            storeName: prev.storeName || initialName,
            slug: prev.slug || initialSlug,
            contactEmail: prev.contactEmail || dbUser?.email || session?.merchant?.email || '',
            contactPhone: prev.contactPhone || existingStore?.supportPhone || '',
            currency: prev.currency || existingStore?.currency || 'INR',
            tagline: prev.tagline || existingStore?.tagline || 'Curated essentials and quality goods',
          }));
          setIsReady(true);
        }
      } catch (err) {
        console.error('Notice checking DB onboarding status:', err);
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    verifyDbOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, [merchantData, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
          <span className="text-xs font-mono font-semibold text-zinc-600 tracking-wide animate-pulse">
            Checking Setup Status from Database...
          </span>
        </div>
      </div>
    );
  }

  // Handle Store Name change to automatically suggest clean slug
  const handleStoreNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({
      ...prev,
      storeName: name,
      slug: autoSlug || 'store',
    }));
  };

  const handleCountryChange = (countryName: string) => {
    const cObj = COUNTRIES.find((c) => c.name === countryName);
    if (cObj) {
      setFormData((prev) => ({
        ...prev,
        country: cObj.name,
        currency: cObj.currency,
        timezone: cObj.timezone,
        addressCountry: cObj.name,
      }));
    } else {
      setFormData((prev) => ({ ...prev, country: countryName, addressCountry: countryName }));
    }
  };

  // Navigation validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return Boolean(formData.storeName.trim() && formData.slug.trim());
    }
    if (step === 2) {
      return Boolean(formData.currency && formData.country);
    }
    if (step === 3) {
      return Boolean(formData.contactEmail.trim());
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submission handler
  const handleCompleteLaunch = async () => {
    setIsSubmitting(true);

    try {
      // 1. Prepare Store Setup Payload
      const storePayload: StoreSetupData = {
        name: formData.storeName.trim(),
        slug: formData.slug.trim(),
        description: formData.tagline.trim(),
        currency: formData.currency,
        language: formData.language,
        timezone: formData.timezone,
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim() || formData.whatsappNumber.trim(),
        addressCity: formData.addressCity.trim(),
        addressState: formData.addressState.trim(),
        addressCountry: formData.addressCountry.trim(),
        logo: formData.logoUrl || null,
      };

      // 2. Persist store configuration to backend database
      const savedStore = await cmsService.updateStoreSetup(storePayload);

      // 3. Persist onboarding completion status directly into the database
      await cmsService.completeOnboarding();

      // 4. Update in-memory session
      const session = cmsService.getMerchantSession();
      if (session) {
        const updatedSession = {
          ...session,
          merchant: {
            ...session.merchant,
            onboardingCompleted: true,
          },
          store: {
            id: savedStore.id || session.store?.id || 'store_default',
            slug: savedStore.slug || formData.slug,
            storeName: savedStore.name || formData.storeName,
            currency: savedStore.currency || formData.currency,
            tagline: savedStore.description || formData.tagline,
            category: formData.category,
            status: 'ACTIVE' as const,
            supportEmail: savedStore.contactEmail || formData.contactEmail,
            supportPhone: savedStore.contactPhone || formData.contactPhone,
          },
        };
        cmsService.saveMerchantSession(updatedSession);
        if (setMerchantData) {
          setMerchantData(updatedSession);
        }
      }

      // 4. Optionally Seed Demo Catalog
      if (formData.seedSampleProducts) {
        try {
          const sampleProducts: Partial<CMSProduct>[] = [
            {
              name: 'AeroPulse Wireless Headphones',
              sku: 'AP-W100',
              price: formData.currency === 'INR' ? 4999 : 79.99,
              inventory: 24,
              categoryName: formData.category,
              brandName: formData.storeName,
              status: 'ACTIVE',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
              description: 'High-fidelity audio with active noise cancellation and 40-hour battery life.',
            },
            {
              name: 'Minimalist Horizon Leather Backpack',
              sku: 'HZ-BP02',
              price: formData.currency === 'INR' ? 3499 : 59.99,
              inventory: 15,
              categoryName: formData.category,
              brandName: formData.storeName,
              status: 'ACTIVE',
              image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
              description: 'Handcrafted water-resistant canvas and full-grain leather everyday carrier.',
            },
            {
              name: 'Studio Mechanical Keychron Pro',
              sku: 'KB-M300',
              price: formData.currency === 'INR' ? 7999 : 129.00,
              inventory: 30,
              categoryName: formData.category,
              brandName: formData.storeName,
              status: 'ACTIVE',
              image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
              description: 'Hot-swappable custom tactile switches with RGB per-key backlighting.',
            },
          ];

          for (const item of sampleProducts) {
            await cmsService.createProduct(item as any).catch(() => null);
          }
        } catch (seedErr) {
          console.warn('Notice seeding starter products:', seedErr);
        }
      }

      // Mark as completed
      setIsCompleted(true);

      // Redirect to dashboard after brief celebration
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setIsSubmitting(false);
    }
  };

  const currentCurrencySymbol = getCurrencySymbol(formData.currency);

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col justify-between font-sans selection:bg-black selection:text-white">
      {/* Top Brand Header */}
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md font-black text-sm">
              ⚡
            </div>
            <div>
              <span className="font-sans font-bold text-base text-zinc-950 block">OmniStore CMS</span>
              <span className="text-[11px] text-zinc-500 font-mono block">Storefront Launch Onboarding</span>
            </div>
          </div>

          {/* Step Pill & Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-zinc-600">Step {currentStep} of {totalSteps}</span>
            <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
              <div
                className="h-full bg-black transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="max-w-4xl w-full mx-auto px-6 py-8 md:py-10 flex-1 flex flex-col justify-center space-y-6">
        
        {/* Header Hero Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-50 text-zinc-950 border-2 border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-md bg-zinc-200/80 text-zinc-800 font-mono font-bold text-[10px] uppercase tracking-widest border border-zinc-300">
                  Store Setup Wizard
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Quick Launch Mode
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 flex items-center gap-3 uppercase">
                <Store className="w-8 h-8 text-black" />
                <span>Configure Your New Storefront</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                Complete these essential steps to configure your store brand identity, currency, contact channels, and storefront layout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-black shadow-md transition-all cursor-pointer transform active:scale-95 shrink-0"
            >
              <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Auto-Build with AI 🪄</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { step: 1, title: 'Identity', icon: Store },
            { step: 2, title: 'Regional', icon: DollarSign },
            { step: 3, title: 'Contact', icon: Phone },
            { step: 4, title: 'Storefront', icon: Palette },
            { step: 5, title: 'Launch', icon: Rocket },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                disabled={s.step > currentStep}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-black text-white border-2 border-black shadow-sm scale-[1.02]'
                    : isDone
                      ? 'bg-zinc-50 border-zinc-300 text-zinc-800 hover:border-zinc-400 cursor-pointer'
                      : 'bg-zinc-50/50 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black font-mono ${
                  isCurrent ? 'bg-white text-black' : isDone ? 'bg-emerald-100 border border-emerald-300 text-emerald-800' : 'bg-zinc-200 text-zinc-500'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span className={`text-xs uppercase tracking-wider hidden sm:inline-block ${isCurrent ? 'font-black text-white' : 'font-bold text-zinc-700'}`}>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body Card */}
        <div className="bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-zinc-950">

          {/* ─────────────────────────────────────────────────────────────
              STEP 1: STORE IDENTITY & BASICS
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Step 1 of 5 • Store Brand Identity
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  What is the name of your online store?
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  Give your storefront a recognizable brand name. You can modify this anytime in Store Settings.
                </p>
              </div>

              <div className="space-y-4">
                {/* Store Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                    Store Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="e.g. Apex Streetwear & Gear"
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                {/* Subdomain Preview */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                    Store Subdomain URL
                  </label>
                  <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-xs font-mono">
                    <span className="text-zinc-500 select-none">https://</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="my-store"
                      className="bg-transparent text-zinc-950 font-bold focus:outline-none flex-1 px-1"
                    />
                    <span className="text-zinc-500 select-none">.omnistore.internal</span>
                  </div>
                </div>

                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                    Brand Catchphrase / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Curated apparel, footwear, and limited drops"
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                    Primary Industry / Product Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = formData.category === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.name })}
                          className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-100 border-2 border-black text-zinc-950 shadow-sm'
                              : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className={`text-xs truncate ${isSelected ? 'font-black text-black' : 'font-bold'}`}>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: REGIONAL & CURRENCY
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Step 2 of 5 • Regional & Currency Configuration
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  Where is your business located?
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  OmniStore formats all catalog pricing, payment gateway settlements, and cart totals in this currency.
                </p>
              </div>

              <div className="space-y-5">
                {/* Currency Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                    Store Currency <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                    {CURRENCIES.map((cur) => {
                      const isSelected = formData.currency === cur.code;
                      return (
                        <button
                          key={cur.code}
                          type="button"
                          onClick={() => setFormData({ ...formData, currency: cur.code })}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-100 border-2 border-black text-zinc-950 shadow-sm'
                              : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cur.flag}</span>
                            <div>
                              <span className="text-xs font-black block text-zinc-950">{cur.code}</span>
                              <span className={`text-[10px] ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>{cur.name}</span>
                            </div>
                          </div>
                          <span className={`text-sm font-black font-mono ${isSelected ? 'text-black' : 'text-zinc-600'}`}>{cur.symbol}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Country & Timezone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                      Operating Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-bold text-zinc-950 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name} className="bg-white text-zinc-950">
                          {c.flag} {c.name} ({c.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                      Store Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-bold text-zinc-950 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    >
                      <option value="Asia/Kolkata" className="bg-white text-zinc-950">Asia/Kolkata (IST +5:30)</option>
                      <option value="America/New_York" className="bg-white text-zinc-950">America/New_York (EST -5:00)</option>
                      <option value="Europe/London" className="bg-white text-zinc-950">Europe/London (GMT +0:00)</option>
                      <option value="Asia/Dubai" className="bg-white text-zinc-950">Asia/Dubai (GST +4:00)</option>
                      <option value="America/Los_Angeles" className="bg-white text-zinc-950">America/Los_Angeles (PST -8:00)</option>
                      <option value="Asia/Singapore" className="bg-white text-zinc-950">Asia/Singapore (SGT +8:00)</option>
                      <option value="Asia/Tokyo" className="bg-white text-zinc-950">Asia/Tokyo (JST +9:00)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: CONTACT CHANNELS & SUPPORT
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Step 3 of 5 • Customer Support & Invoicing
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  Contact & Support Details
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  Displayed on customer order invoice receipts, tracking emails, and footer links.
                </p>
              </div>

              <div className="space-y-4">
                {/* Support Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                    Customer Support Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="support@yourstore.com"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                      Support Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                      WhatsApp Business Support (Optional)
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                      Headquarters / City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.addressCity}
                        onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                        placeholder="e.g. Mumbai, New York, London"
                        className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={formData.addressState}
                      onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                      placeholder="e.g. Maharashtra, NY, England"
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 4: STOREFRONT THEME & STARTER CATALOG
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Step 4 of 5 • Storefront Template & Catalog Starter
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  Select your initial storefront theme
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  Choose a high-converting storefront layout. You can customize colors, fonts, and banners in Theme Studio anytime.
                </p>
              </div>

              <div className="space-y-5">
                {/* Theme Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEMES.map((th) => {
                    const isSelected = formData.theme === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, theme: th.id })}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-50 border-2 border-black text-zinc-950 shadow-md ring-1 ring-black'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.accent }} />
                            <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-zinc-900'}`}>{th.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                            {th.tag}
                          </span>
                        </div>
                        <p className={`text-xs ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>{th.desc}</p>
                        <div className={`h-10 w-full rounded-lg bg-gradient-to-r ${th.previewBg} border border-zinc-200 flex items-center px-3 justify-between text-white text-[10px] font-mono font-bold shadow-xs`}>
                          <span>LIVE TEMPLATE</span>
                          <span className="bg-white/20 px-2 py-0.5 rounded">PREVIEW</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Seed Demo Products */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="seed-checkbox"
                    checked={formData.seedSampleProducts}
                    onChange={(e) => setFormData({ ...formData, seedSampleProducts: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-black focus:ring-black border-zinc-300 bg-white cursor-pointer"
                  />
                  <label htmlFor="seed-checkbox" className="cursor-pointer">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Seed Starter Products & Catalog Categories (Recommended)
                    </span>
                    <span className="text-[11px] text-emerald-800 block mt-0.5">
                      Automatically generates 3 ready-to-sell demo catalog products with {currentCurrencySymbol} pricing so your storefront is ready for instant testing.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 5: SUMMARY & LAUNCH
             ───────────────────────────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Step 5 of 5 • Review & Ready for Launch
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                  Ready to launch your online storefront!
                </h2>
                <p className="text-xs text-zinc-600 mt-1">
                  Review your initial configuration below before entering the Master Admin Control Panel.
                </p>
              </div>

              {/* Review Card */}
              <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">Storefront Name</span>
                    <h3 className="text-lg font-bold text-zinc-950">{formData.storeName}</h3>
                    <span className="text-xs text-zinc-700 font-mono font-semibold">https://{formData.slug}.omnistore.internal</span>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-black text-white border border-black text-xs font-mono font-black uppercase">
                    ✓ Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Currency</span>
                    <span className="text-xs font-bold text-zinc-950">{formData.currency} ({currentCurrencySymbol})</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Category</span>
                    <span className="text-xs font-bold text-zinc-950 truncate block">{formData.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Country</span>
                    <span className="text-xs font-bold text-zinc-950">{formData.country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Storefront Theme</span>
                    <span className="text-xs font-bold text-zinc-950 capitalize">{formData.theme.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-semibold text-zinc-950">{formData.contactEmail}</span>
                  </div>
                  {formData.seedSampleProducts && (
                    <span className="text-emerald-700 font-bold">✨ 3 Demo Products Included</span>
                  )}
                </div>
              </div>

              {/* Status Note */}
              <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center gap-3 text-xs text-zinc-800">
                <ShieldCheck className="w-5 h-5 text-black shrink-0" />
                <span>
                  All settings are saved directly to your store tenant and can be customized anytime from the dashboard.
                </span>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              BOTTOM ACTIONS (BACK & NEXT / LAUNCH)
             ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transform active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteLaunch}
                disabled={isSubmitting || isCompleted}
                className="px-8 py-3 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black shadow-lg transition-all disabled:opacity-50 cursor-pointer transform active:scale-95"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span>Store Launched! Redirecting...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Configuring Storefront...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 text-white" />
                    <span>Launch Store &amp; Go to Dashboard 🚀</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-zinc-500 font-mono border-t border-zinc-200 bg-white">
        OmniStore CMS Engine • Headless E-Commerce Platform
      </footer>

      {/* AI Store Builder Modal */}
      {isAiModalOpen && (
        <AiStoreBuilderModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onBlueprintApplied={async () => {
            try {
              await cmsService.completeOnboarding();
            } catch (err) {
              console.warn('Onboarding complete hook failed:', err);
            }
            setIsAiModalOpen(false);
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
};

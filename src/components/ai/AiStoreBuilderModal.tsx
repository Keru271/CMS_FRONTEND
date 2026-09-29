'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Palette,
  Layers,
  ShoppingBag,
  Globe,
  FileText,
  Search,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Zap,
  Tag,
  Store,
  ChevronRight,
  Eye,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { StoreBlueprint, AiStoreBuilderInput } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { getCurrencySymbol } from '@/src/lib/currency';

interface AiStoreBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlueprintApplied?: (store: any) => void;
  targetStoreId?: string;
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Handmade Leather Goods',
    prompt: 'I sell handmade leather wallets and accessories in India. My brand should feel premium, minimal and masculine.',
    badge: 'Artisan & Craft',
  },
  {
    title: 'Organic Skincare',
    prompt: 'Create an online store for a premium organic skincare brand. Natural, soothing, pastel tones with clean botanical formulations.',
    badge: 'Beauty & Wellness',
  },
  {
    title: 'Urban Streetwear',
    prompt: 'A bold, high-energy streetwear brand specializing in limited-edition sneaker drops, oversized graphic hoodies, and edgy aesthetics.',
    badge: 'Fashion & Drop',
  },
  {
    title: 'Scandinavian Living',
    prompt: 'Modern Scandinavian furniture and home decor atelier. Warm organic tones, sustainable solid wood, and clean functional lines.',
    badge: 'Home & Decor',
  },
  {
    title: 'High-Tech Audio & Gadgets',
    prompt: 'Next-gen wireless audiophile headphones, mechanical keyboards, and minimalist desk gear with dark mode aesthetics.',
    badge: 'Tech & Hardware',
  },
];

const GENERATION_STEPS = [
  { id: 1, label: 'Analyzing Brand Identity & Market Positioning' },
  { id: 2, label: 'Synthesizing Harmonic Color Palette & Typography' },
  { id: 3, label: 'Matching High-Converting Headless Template Architecture' },
  { id: 4, label: 'Composing Hero, Trust Badges, and Dynamic Homepage Sections' },
  { id: 5, label: 'Generating Curated Catalog, High-Res Assets & Pricing' },
  { id: 6, label: 'Generating Essential Pages (About, Contact, FAQ) & SEO' },
];

export function AiStoreBuilderModal({
  isOpen,
  onClose,
  onBlueprintApplied,
  targetStoreId,
}: AiStoreBuilderModalProps) {
  const [prompt, setPrompt] = useState('');
  const [storeName, setStoreName] = useState('');
  const [country, setCountry] = useState('India');
  const [currency, setCurrency] = useState('INR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [blueprint, setBlueprint] = useState<StoreBlueprint | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'theme' | 'sections' | 'products' | 'pages' | 'seo'>('overview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (selectedPrompt?: string) => {
    const textToUse = selectedPrompt || prompt;
    if (!textToUse || textToUse.trim().length < 3) {
      setErrorMessage('Please provide a short description of your business.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setCurrentStepIndex(0);
    setBlueprint(null);
    setAppliedSuccess(false);

    // Simulated progress ticker while backend generates
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const payload: AiStoreBuilderInput = {
        prompt: textToUse,
        storeName: storeName.trim() || undefined,
        country,
        currency,
      };

      const result = await cmsService.generateStoreBlueprint(payload);
      clearInterval(interval);
      setCurrentStepIndex(GENERATION_STEPS.length - 1);
      setTimeout(() => {
        setBlueprint(result);
        setIsGenerating(false);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to generate store blueprint.');
    }
  };

  const handleApplyBlueprint = async () => {
    if (!blueprint) return;
    setIsApplying(true);
    setErrorMessage(null);

    try {
      const storeId = targetStoreId || (typeof window !== 'undefined' ? localStorage.getItem('current_store_id') || undefined : undefined);
      const res = await cmsService.applyStoreBlueprint({
        storeId,
        blueprint,
        overwriteProducts: true,
        overwriteTheme: true,
        overwritePages: true,
        overwriteNavigation: true,
      });

      setAppliedSuccess(true);
      setIsApplying(false);
      if (onBlueprintApplied) {
        onBlueprintApplied(res.store);
      }
    } catch (err: any) {
      setIsApplying(false);
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to apply blueprint to store.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white border-2 border-zinc-200 text-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-black flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-zinc-950 uppercase">AI Store Builder</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black text-white rounded-md uppercase tracking-widest">
                  NEXT-GEN
                </span>
              </div>
              <p className="text-xs text-zinc-500">Describe your vision. AI configures theme, template, catalog & copy.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-xl text-xs text-rose-800 flex items-center justify-between font-mono">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-950 cursor-pointer font-bold">✕</button>
            </div>
          )}

          {!blueprint && !isGenerating && (
            /* Stage 1: Prompt Input & Inspiration */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-black" />
                  What are you building? Tell us about your brand
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. I sell handmade leather wallets and accessories in India. My brand should feel premium, minimal and masculine..."
                  className="w-full bg-white border border-zinc-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl p-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none resize-none transition-all font-medium"
                />
              </div>

              {/* Optional Quick Config */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide mb-1.5 block">Store Name (Optional)</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-black focus:ring-1 focus:ring-black font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide mb-1.5 block">Country / Market</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-950 outline-none focus:border-black focus:ring-1 focus:ring-black font-medium"
                  >
                    <option value="India" className="bg-white text-zinc-950">India (₹ INR)</option>
                    <option value="United States" className="bg-white text-zinc-950">United States ($ USD)</option>
                    <option value="United Kingdom" className="bg-white text-zinc-950">United Kingdom (£ GBP)</option>
                    <option value="European Union" className="bg-white text-zinc-950">European Union (€ EUR)</option>
                    <option value="United Arab Emirates" className="bg-white text-zinc-950">UAE (د.إ AED)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wide mb-1.5 block">Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-950 outline-none focus:border-black focus:ring-1 focus:ring-black font-medium font-mono"
                  >
                    <option value="INR" className="bg-white text-zinc-950">INR (₹)</option>
                    <option value="USD" className="bg-white text-zinc-950">USD ($)</option>
                    <option value="EUR" className="bg-white text-zinc-950">EUR (€)</option>
                    <option value="GBP" className="bg-white text-zinc-950">GBP (£)</option>
                    <option value="AED" className="bg-white text-zinc-950">AED (AED)</option>
                  </select>
                </div>
              </div>

              {/* Inspiration Presets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider">
                    Or choose an example prompt
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXAMPLE_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(item.prompt);
                        handleGenerate(item.prompt);
                      }}
                      className="group text-left p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black rounded-2xl transition-all flex flex-col justify-between cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xs font-bold text-zinc-950 group-hover:text-black transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-zinc-700 border border-zinc-200 font-bold">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim()}
                  className="px-6 py-3 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-md flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Generate Complete Store
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            /* Stage 2: Generation Live Ticker */
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 border-2 border-black flex items-center justify-center p-1 shadow-lg">
                  <Sparkles className="w-8 h-8 text-black animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-zinc-950 uppercase tracking-tight">Synthesizing Your Store Blueprint...</h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto">
                  Architecting themes, templates, catalog items, and homepage sections tailored to your brand.
                </p>
              </div>

              <div className="w-full max-w-md bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 text-left">
                {GENERATION_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 text-xs transition-colors ${
                        isDone
                          ? 'text-emerald-700 font-bold'
                          : isCurrent
                          ? 'text-black font-black animate-pulse'
                          : 'text-zinc-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-black animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-300 flex-shrink-0" />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {blueprint && !isGenerating && (
            /* Stage 3: Generated Blueprint Review & Apply */
            <div className="space-y-6">
              {appliedSuccess ? (
                <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950 uppercase">Store Successfully Configured!</h3>
                    <p className="text-xs text-zinc-700 mt-1 max-w-md mx-auto">
                      All theme tokens, template configurations, homepage sections, categories, products, and pages have been created in your database.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Brand Highlight Banner */}
                  <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black text-white rounded uppercase tracking-wider">
                          Blueprint Ready
                        </span>
                        <h3 className="text-base font-bold text-zinc-950">{blueprint.brand.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-600 italic">"{blueprint.brand.tagline}"</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">{blueprint.brand.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBlueprint(null);
                          handleGenerate();
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyBlueprint}
                        disabled={isApplying}
                        className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer transform active:scale-95"
                      >
                        {isApplying ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                            Applying to Store...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            Apply Blueprint & Launch
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Navigation Tabs for Blueprint Explorer */}
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-mono ${
                        activeTab === 'overview'
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('theme')}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-mono ${
                        activeTab === 'theme'
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" /> Theme & Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sections')}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-mono ${
                        activeTab === 'sections'
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" /> Homepage Sections ({blueprint.homeSections?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-mono ${
                        activeTab === 'products'
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Catalog Products ({blueprint.products?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pages')}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-mono ${
                        activeTab === 'pages'
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> Pages & Nav
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('seo')}
                      className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-mono ${
                        activeTab === 'seo'
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-950 bg-zinc-50 border border-zinc-200'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" /> SEO Metadata
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Theme Card */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-black" /> Matched Theme
                          </span>
                          <span className="text-[11px] font-mono font-bold text-black">
                            {blueprint.theme.templateSlug}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-md border border-zinc-300 shadow-sm"
                            style={{ backgroundColor: blueprint.theme.primaryColor }}
                            title="Primary"
                          />
                          <div
                            className="w-7 h-7 rounded-md border border-zinc-300 shadow-sm"
                            style={{ backgroundColor: blueprint.theme.accentColor }}
                            title="Accent"
                          />
                          <div
                            className="w-7 h-7 rounded-md border border-zinc-300 shadow-sm"
                            style={{ backgroundColor: blueprint.theme.secondaryColor }}
                            title="Secondary"
                          />
                          <div
                            className="w-7 h-7 rounded-md border border-zinc-300 shadow-sm"
                            style={{ backgroundColor: blueprint.theme.backgroundColor }}
                            title="Background"
                          />
                        </div>
                        <p className="text-xs text-zinc-600">
                          Fonts: <strong className="text-zinc-950">{blueprint.theme.headingFont}</strong> & <strong className="text-zinc-950">{blueprint.theme.bodyFont}</strong>
                        </p>
                      </div>

                      {/* Catalog Card */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-black" /> Catalog Seed
                          </span>
                          <span className="text-[11px] font-mono font-bold text-black">
                            {blueprint.products.length} Products
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {blueprint.products.slice(0, 2).map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-zinc-700">
                              <span className="truncate max-w-[160px] text-zinc-950 font-medium">{p.name}</span>
                              <span className="font-semibold text-black font-mono">
                                {getCurrencySymbol(blueprint.brand.currency)}{p.price}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          {blueprint.categories.length} Categories • {blueprint.collections.length} Collections
                        </p>
                      </div>

                      {/* Homepage & Copy */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-black" /> Homepage Structure
                          </span>
                          <span className="text-[11px] font-mono font-bold text-black">
                            {blueprint.homeSections.length} Sections
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {blueprint.homeSections.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-[10px] text-zinc-700 border border-zinc-200 font-mono">
                              {s.type}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-600 line-clamp-1">
                          Hero: "{blueprint.homeSections[0]?.config?.headline || 'Dynamic Hero'}"
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'theme' && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-white rounded-xl border border-zinc-200">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">Template Engine</span>
                          <p className="text-sm font-bold text-zinc-950 mt-1">{blueprint.theme.templateSlug}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-zinc-200">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">Heading Font</span>
                          <p className="text-sm font-bold text-zinc-950 mt-1">{blueprint.theme.headingFont}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-zinc-200">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">Body Font</span>
                          <p className="text-sm font-bold text-zinc-950 mt-1">{blueprint.theme.bodyFont}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-zinc-200">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">Button Style</span>
                          <p className="text-sm font-bold text-zinc-950 mt-1">{blueprint.theme.buttonStyle || 'solid'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-zinc-800 font-mono uppercase tracking-wider">Harmonic Palette Tokens</span>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            { label: 'Primary Color', val: blueprint.theme.primaryColor },
                            { label: 'Accent Color', val: blueprint.theme.accentColor },
                            { label: 'Secondary Color', val: blueprint.theme.secondaryColor },
                            { label: 'Background Color', val: blueprint.theme.backgroundColor },
                            { label: 'Text Color', val: blueprint.theme.textColor },
                          ].map((c, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg border border-zinc-300 shadow-xs" style={{ backgroundColor: c.val }} />
                              <div>
                                <span className="text-[10px] text-zinc-500 block">{c.label}</span>
                                <span className="text-xs font-mono font-bold text-zinc-950">{c.val}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sections' && (
                    <div className="space-y-3">
                      {blueprint.homeSections.map((sec, idx) => (
                        <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-mono font-bold uppercase">
                                Section {idx + 1}: {sec.type}
                              </span>
                              {sec.config?.badge && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
                                  {sec.config.badge}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-950">
                              {sec.config?.headline || sec.config?.title || `${sec.type.toUpperCase()} Section`}
                            </h4>
                            <p className="text-xs text-zinc-600 line-clamp-2">
                              {sec.config?.subheadline || sec.config?.description || sec.config?.subtitle || 'Configured with dynamic template binding.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'products' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {blueprint.products.map((prod, idx) => (
                        <div key={idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex gap-3.5 items-start">
                          {prod.images && prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-zinc-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl flex items-center justify-center flex-shrink-0 border border-zinc-300">
                              <ShoppingBag className="w-6 h-6 text-zinc-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-zinc-950 truncate">{prod.name}</h5>
                              <span className="text-xs font-bold text-black font-mono flex-shrink-0">
                                {getCurrencySymbol(blueprint.brand.currency)}{prod.price}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">{prod.description}</p>
                            <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500 font-mono">
                              <span className="bg-white px-2 py-0.5 rounded text-zinc-800 border border-zinc-200 font-bold">{prod.categoryName}</span>
                              <span>SKU: {prod.sku || 'Auto'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'pages' && (
                    <div className="space-y-4">
                      {/* Nav Bar Preview */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-zinc-700 font-mono uppercase tracking-wider">Navigation Menu</span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {blueprint.navigation.map((item, idx) => (
                            <div key={idx} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-950 flex items-center gap-2 shadow-xs">
                              <span>{item.label}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{item.url}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pages List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {blueprint.pages.map((pg, idx) => (
                          <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-zinc-950">{pg.title}</h5>
                              <span className="text-[10px] font-mono text-zinc-500">/{pg.slug}</span>
                            </div>
                            <p className="text-xs text-zinc-700 line-clamp-3 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-zinc-200">
                              {pg.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-zinc-700 font-mono uppercase tracking-wider">
                          Search Preview
                        </span>
                        <div className="p-4 bg-white border border-zinc-200 rounded-2xl space-y-1 shadow-xs">
                          <span className="text-xs text-zinc-500 font-mono block">https://{blueprint.brand.suggestedSlug}.omnistore.internal</span>
                          <h4 className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                            {blueprint.seo.siteTitle}
                          </h4>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {blueprint.seo.metaDescription}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-zinc-200">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">OG Title</span>
                          <p className="text-zinc-950 font-medium mt-0.5">{blueprint.seo.ogTitle || blueprint.seo.siteTitle}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-zinc-200">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">OG Description</span>
                          <p className="text-zinc-950 font-medium mt-0.5">{blueprint.seo.ogDescription || blueprint.seo.metaDescription}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

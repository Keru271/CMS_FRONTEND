'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Wand2,
  Layers,
  LayoutTemplate,
  Palette,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Zap,
  ShoppingBag,
  HelpCircle,
  Users,
  Clock,
  DollarSign,
  Star,
  Eye,
  Check,
  Sliders,
  ChevronRight,
  Flame,
  FileText,
  Copy,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { GenerateAiPagePayload, GeneratedAiPageResult } from '@/src/types';

interface AiPageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBlocks: (blocks: any[], meta?: { title: string; slug: string; metaTitle: string; metaDescription: string }, mode?: 'replace' | 'append') => void;
  currentPageTitle?: string;
}

const PAGE_TEMPLATES = [
  {
    id: 'LANDING_PAGE',
    label: 'High-Converting Landing Page',
    desc: 'Hero slider, value props, featured bestsellers, trust badges & reviews.',
    icon: Rocket,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900',
    defaultSections: ['announcement_bar', 'hero', 'value_props', 'product_slider', 'trust_badges', 'testimonials', 'cta_banner'],
  },
  {
    id: 'PRODUCT_LAUNCH',
    label: 'New Product Drop / Launch',
    desc: 'Impact hero with countdown, spec deep-dives, video & pre-order perks.',
    icon: Flame,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900',
    defaultSections: ['announcement_bar', 'hero', 'countdown_timer', 'value_props', 'product_slider', 'testimonials', 'cta_banner'],
  },
  {
    id: 'FLASH_SALE',
    label: 'Flash Sale & Holiday Campaign',
    desc: 'Countdown timer, promo banner, discounted product grid & urgency CTAs.',
    icon: Zap,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
    defaultSections: ['announcement_bar', 'countdown_timer', 'image_slider', 'product_slider', 'trust_badges', 'faq', 'cta_banner'],
  },
  {
    id: 'BRAND_STORY',
    label: 'Brand Story & About Us',
    desc: 'Narrative storytelling, craftsmanship values, media quotes & team ethos.',
    icon: Star,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    defaultSections: ['hero', 'value_props', 'trust_badges', 'testimonials', 'faq', 'cta_banner'],
  },
  {
    id: 'VIP_LOYALTY',
    label: 'VIP & Membership Tiers',
    desc: 'Tiered pricing cards, member perks, VIP concierge guarantees & FAQ.',
    icon: DollarSign,
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900',
    defaultSections: ['announcement_bar', 'hero', 'pricing_table', 'trust_badges', 'testimonials', 'faq', 'cta_banner'],
  },
  {
    id: 'FAQ_SUPPORT',
    label: 'FAQ & Support Hub',
    desc: 'Structured accordion questions, dispatch policies, and concierge contact.',
    icon: HelpCircle,
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900',
    defaultSections: ['hero', 'faq', 'trust_badges', 'cta_banner'],
  },
];

const THEME_PRESETS = [
  {
    id: 'modern_clean',
    name: 'Modern Clean',
    desc: 'Indigo & crisp slate',
    preview: ['bg-white', 'bg-indigo-600', 'bg-slate-900'],
  },
  {
    id: 'minimal_luxe',
    name: 'Minimal Luxe',
    desc: 'Obsidian black & gold',
    preview: ['bg-zinc-950', 'bg-amber-400', 'bg-zinc-800'],
  },
  {
    id: 'vibrant_ecommerce',
    name: 'Vibrant Commerce',
    desc: 'Emerald green & amber',
    preview: ['bg-white', 'bg-emerald-600', 'bg-amber-500'],
  },
  {
    id: 'warm_boutique',
    name: 'Warm Boutique',
    desc: 'Amber, burgundy & cream',
    preview: ['bg-amber-50', 'bg-rose-700', 'bg-amber-900'],
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    desc: 'Dark violet & cyan glass',
    preview: ['bg-slate-950', 'bg-violet-600', 'bg-sky-400'],
  },
];

const PROMPT_SUGGESTIONS = [
  '⚡ Black Friday 40% Off electronics clearance with countdown timer & customer reviews',
  '💎 Minimalist luxury watch brand story showcasing artisanal craftsmanship & press logos',
  '🌿 Pure organic botanical skincare launch with value props, product carousel & VIP club',
  '🚀 Limited summer drop for designer sunglasses with hero banner & trust badges',
];

const AVAILABLE_SECTIONS = [
  { id: 'announcement_bar', label: 'Announcement Bar', icon: Zap },
  { id: 'hero', label: 'Hero Banner Slider', icon: LayoutTemplate },
  { id: 'countdown_timer', label: 'Flash Countdown', icon: Clock },
  { id: 'trust_badges', label: 'Trust Badges', icon: ShieldCheck },
  { id: 'value_props', label: 'Value Propositions', icon: Star },
  { id: 'product_slider', label: 'Product Carousel', icon: ShoppingBag },
  { id: 'pricing_table', label: 'Pricing / VIP Tiers', icon: DollarSign },
  { id: 'testimonials', label: 'Customer Proof / Reviews', icon: Users },
  { id: 'faq', label: 'FAQ Accordion', icon: HelpCircle },
  { id: 'cta_banner', label: 'Newsletter & CTA Banner', icon: Rocket },
];

export const AiPageBuilderModal: React.FC<AiPageBuilderModalProps> = ({
  isOpen,
  onClose,
  onApplyBlocks,
  currentPageTitle,
}) => {
  const [prompt, setPrompt] = useState(
    'Modern Black Friday sale for signature wireless headphones with 25% discount countdown, customer reviews, and VIP perks'
  );
  const [pageType, setPageType] = useState('LANDING_PAGE');
  const [themePreset, setThemePreset] = useState('modern_clean');
  const [tone, setTone] = useState<'high_conversion' | 'luxury' | 'energetic' | 'friendly' | 'urgency'>('high_conversion');
  const [targetAudience, setTargetAudience] = useState('Modern shoppers seeking premium everyday audio');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'announcement_bar',
    'hero',
    'countdown_timer',
    'trust_badges',
    'value_props',
    'product_slider',
    'testimonials',
    'cta_banner',
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [result, setResult] = useState<GeneratedAiPageResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'blueprint' | 'blocks'>('blueprint');

  // Check current user role & privileges
  const currentUser = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || localStorage.getItem('cms_user') || '{}')
    : null;
  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN' || !currentUser?.role;
  const userPermissions = currentUser?.permissions || currentUser?.storeMemberships?.[0];
  const hasAiPrivilege = isOwnerOrAdmin || userPermissions?.canManageAiPageBuilder !== false;

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: string) => {
    setPageType(templateId);
    const tmpl = PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedSections(tmpl.defaultSections);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!hasAiPrivilege) return;
    setIsGenerating(true);
    setGenerationStep(1);

    const stepTimer1 = setTimeout(() => setGenerationStep(2), 500);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1000);
    const stepTimer3 = setTimeout(() => setGenerationStep(4), 1500);

    try {
      const payload: GenerateAiPagePayload = {
        prompt,
        pageType: pageType as any,
        themePreset: themePreset as any,
        tone,
        targetAudience,
        selectedSections,
      };

      const res = await cmsService.generatePageWithAi(payload);
      setResult(res);
    } catch (err) {
      console.error('Failed to generate AI page:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleApply = (mode: 'replace' | 'append') => {
    if (!result || !result.blocks) return;
    onApplyBlocks(
      result.blocks,
      {
        title: result.title,
        slug: result.slug,
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
      },
      mode
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-6xl w-full h-[92vh] max-h-[900px] flex flex-col overflow-hidden text-slate-100">
        
        {/* ─── MODAL HEADER ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  AI Page Builder & Layout Architect
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Generative Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transform natural language prompts into complete, high-converting responsive storefront pages in seconds.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privilege Warning Banner if restricted */}
        {!hasAiPrivilege && (
          <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-3 shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <strong>Privilege Notice:</strong> Your current staff role does not have the{' '}
              <code className="px-1 py-0.5 rounded bg-amber-500/20 font-mono text-[11px]">canManageAiPageBuilder</code>{' '}
              privilege. Contact your Store Administrator to enable AI Page & Block generation access.
            </div>
          </div>
        )}

        {/* ─── MODAL BODY (TWO PANELS) ─────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT: PROMPT & GENERATION CONTROLS (5 COLS) */}
          <div className="lg:col-span-5 p-5 border-r border-slate-800 overflow-y-auto space-y-5 bg-slate-900/50">
            
            {/* 1. Prompt Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Page Concept & Campaign Prompt</span>
                <span className="text-[10px] font-normal text-slate-500">Natural language</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Minimalist luxury jewelry brand story with artisanal craftsmanship, press reviews, and VIP coupon..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 outline-none transition resize-none leading-relaxed"
              />
              
              {/* Prompt Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Ideas:
                </span>
                <div className="flex flex-col gap-1.5">
                  {PROMPT_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sug.replace(/^[^\s]+\s/, ''))}
                      className="text-left text-[11px] text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 p-1.5 rounded-lg border border-slate-800/80 hover:border-indigo-800/50 transition truncate"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Page Type Template */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Page Intent & Blueprint Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAGE_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = pageType === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-xs'
                          : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`p-1.5 rounded-lg ${tmpl.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] font-bold leading-tight truncate">{tmpl.label}</div>
                      <div className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{tmpl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Theme & Color Palette Preset */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Color Palette & Theme Vibe</span>
                <Palette className="w-3 h-3 text-slate-500" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {THEME_PRESETS.map((th) => {
                  const isSelected = themePreset === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemePreset(th.id)}
                      className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-[11px] font-bold">{th.name}</div>
                        <div className="text-[9px] text-slate-500">{th.desc}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {th.preview.map((bg, idx) => (
                          <span key={idx} className={`w-3 h-3 rounded-full border border-slate-700 ${bg}`} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Tone & Audience */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">Copywriting Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="high_conversion">🎯 High Conversion</option>
                  <option value="luxury">👑 Luxury / Timeless</option>
                  <option value="urgency">⚡ Urgency & FOMO</option>
                  <option value="friendly">🤝 Friendly & Warm</option>
                  <option value="energetic">🔥 Bold & Energetic</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Luxury buyers"
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* 5. Sections to Include */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Included Responsive Sections ({selectedSections.length})</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSections(
                      selectedSections.length === AVAILABLE_SECTIONS.length
                        ? ['hero', 'product_slider', 'cta_banner']
                        : AVAILABLE_SECTIONS.map((s) => s.id)
                    )
                  }
                  className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                >
                  {selectedSections.length === AVAILABLE_SECTIONS.length ? 'Reset' : 'Select All'}
                </button>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isChecked = selectedSections.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{sec.label}</span>
                      {isChecked && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Blocks & Visuals (Step {generationStep}/4)…</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Full Page with AI</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT: GENERATION PREVIEW & BLUEPRINT MATRIX (7 COLS) */}
          <div className="lg:col-span-7 p-6 flex flex-col bg-slate-950/40 overflow-hidden">
            
            {/* Real-time Generating Animation Screen */}
            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-600/30 animate-pulse">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
                  </span>
                </div>

                <div className="space-y-2 max-w-md">
                  <h3 className="text-base font-black text-white">
                    Architecting High-Converting Page Structure
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    AI engine is applying marketing best practices, structuring semantic HTML primitives, and writing punchy value propositions.
                  </p>
                </div>

                {/* Stepper Pipeline */}
                <div className="w-full max-w-sm space-y-2.5 text-left bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div className={`flex items-center gap-2.5 text-xs font-semibold ${generationStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 1 ? 'text-emerald-400' : 'text-slate-700'}`} />
                    <span>1. Formulating Marketing Copy & Value Hooks</span>
                  </div>
                  <div className={`flex items-center gap-2.5 text-xs font-semibold ${generationStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 2 ? 'text-emerald-400' : 'text-slate-700'}`} />
                    <span>2. Architecting Responsive Blocks & Hierarchy</span>
                  </div>
                  <div className={`flex items-center gap-2.5 text-xs font-semibold ${generationStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 3 ? 'text-emerald-400' : 'text-slate-700'}`} />
                    <span>3. Curating High-Conversion Visuals & Badges</span>
                  </div>
                  <div className={`flex items-center gap-2.5 text-xs font-semibold ${generationStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${generationStep >= 4 ? 'text-emerald-400' : 'text-slate-700'}`} />
                    <span>4. Finalizing SEO Meta & Responsiveness</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Result View */}
            {!isGenerating && result && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                
                {/* Result Headline Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                        AI Blueprint Ready
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-xs">{result.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {result.explanation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900">
                      {result.blocksCount} Blocks
                    </span>
                  </div>
                </div>

                {/* Tabs: Blueprint Overview vs Blocks List */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('blueprint')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        previewTab === 'blueprint'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      Blueprint Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('blocks')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        previewTab === 'blocks'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      Blocks Sequence ({result.blocks.length})
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Slug: {result.slug}
                  </span>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {previewTab === 'blueprint' && (
                    <div className="space-y-4">
                      {/* SEO Card */}
                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>SEO Meta & URL Slug</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Page Title</span>
                            <div className="font-semibold text-slate-200 mt-0.5">{result.title}</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">SEO Slug</span>
                            <div className="font-mono text-indigo-400 mt-0.5">{result.slug}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Meta Description</span>
                            <div className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                              {result.metaDescription}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Blocks Flow Timeline */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-300">Constructed Block Sequence</div>
                        <div className="space-y-2">
                          {result.blocks.map((block, idx) => (
                            <div
                              key={block.id || idx}
                              className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <span className="capitalize">{block.type.replace(/_/g, ' ')}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                      {block.type}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-sm">
                                    {block.data.heading || block.data.title || block.data.badge || block.data.text || 'Custom element'}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900">
                                Ready
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTab === 'blocks' && (
                    <div className="space-y-3">
                      {result.blocks.map((block, idx) => (
                        <div
                          key={block.id || idx}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-indigo-400">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-black text-white uppercase tracking-wider">
                                {block.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">ID: {block.id}</span>
                          </div>
                          <pre className="text-[10px] font-mono bg-slate-950 p-2.5 rounded-xl text-slate-300 overflow-x-auto max-h-36">
                            {JSON.stringify(block.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons Bar */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-[11px] text-slate-400">
                    Choose how to apply the generated blocks to your canvas:
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleApply('append')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
                    >
                      Append to Canvas (+{result.blocks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply('replace')}
                      className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Replace Current Canvas</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State when no generation yet */}
            {!isGenerating && !result && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <LayoutTemplate className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-bold text-white">Ready to Generate Your Custom Page</h3>
                  <p className="text-xs text-slate-400">
                    Adjust your prompt, blueprint type, and color palette on the left, then click{' '}
                    <span className="text-indigo-400 font-semibold">Generate Full Page with AI</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

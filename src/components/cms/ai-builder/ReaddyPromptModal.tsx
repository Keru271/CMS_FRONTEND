'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Wand2,
  Layers,
  ArrowRight,
  Palette,
  Check,
  Store,
  Lightbulb,
  Compass,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ReaddyDesignGeneratedData {
  brandName: string;
  tagline: string;
  category: string;
  theme: any;
  templateConfig: any;
  sections: any[];
  reply: string;
  suggestedReplies: string[];
  appliedChanges: string[];
}

interface ReaddyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payload: {
    prompt: string;
    brandName?: string;
    industry?: string;
    visualStyle?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  generationStepMessage?: string;
}

const INSPIRATION_PROMPTS = [
  {
    label: '🛋️ Nordic Minimalist Furniture',
    prompt:
      'Warm Scandinavian furniture and interior decor store with warm cream canvas, olive green accents, minimalist hero banner with lookbook, bestselling catalog grid, and customer review cards.',
    style: 'clean-sand',
  },
  {
    label: '🌿 Organic Botanical Skincare',
    prompt:
      'Clean organic herbal skincare and wellness brand with soft sage tones, clinical efficacy proof, ingredient transparency highlights, and customer reviews.',
    style: 'botanical-sage',
  },
  {
    label: '⚡ Quantum Audio & Cyber Tech',
    prompt:
      'High-performance planar magnetic audio and creator desk setups with ultra-clean contrast, beryllium driver specs, and interactive product comparison.',
    style: 'modern-minimal',
  },
  {
    label: '☕ Artisan Coffee & Tea Roastery',
    prompt:
      'Artisan single-origin coffee roastery and ceramic tableware boutique with warm terracotta accents, origin tasting notes cards, and subscription hero.',
    style: 'artisan-warm',
  },
  {
    label: '💎 Haute Couture & Fine Jewelry',
    prompt:
      'Editorial luxury jewelry and bespoke timepieces with subtle gold accents, high-fashion typography, and curated heritage storytelling.',
    style: 'luxe-gold',
  },
];

const STYLE_PRESETS = [
  {
    id: 'clean-sand',
    name: 'Clean Light & Sand',
    desc: 'Warm cream base, terracotta & olive accents (DESIGN.md)',
    colors: ['#FAF8F2', '#C2410C', '#2B5246', '#FFFFFF'],
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    desc: 'High contrast slate & electric blue',
    colors: ['#F8FAFC', '#2563EB', '#0F172A', '#FFFFFF'],
  },
  {
    id: 'botanical-sage',
    name: 'Botanical Sage',
    desc: 'Calm herbal green & soft ivory',
    colors: ['#F7FAFC', '#059669', '#34D399', '#FFFFFF'],
  },
  {
    id: 'luxe-gold',
    name: 'Luxe Editorial',
    desc: 'Champagne gold, deep noir & off-white',
    colors: ['#FAF9F6', '#D4AF37', '#111827', '#FFFFFF'],
  },
];

export function ReaddyPromptModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  generationStepMessage,
}: ReaddyPromptModalProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('clean-sand');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    await onGenerate({
      prompt: prompt.trim(),
      brandName: brandName.trim() || undefined,
      industry: industry.trim() || undefined,
      visualStyle: selectedStyle,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1A1C24] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-[#FAF8F2]/60 dark:bg-[#1B1D25]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Create New Design with Readdy AI
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Prompt to Storefront
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Describe your store vision or paste UI ideas. The AI will synthesize a complete responsive design.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Prompt Input Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>What would you like to build?</span>
              <span className="text-[11px] font-normal text-slate-400">Natural language or UI requirements</span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. Modern Scandinavian ceramic tableware boutique with warm cream canvas, olive green accents, minimalist hero banner with lookbook, bestselling catalog grid, customer review cards, and newsletter..."
                className="w-full p-3.5 rounded-2xl bg-[#FAF8F2] dark:bg-[#20232F] border border-[#E5E0D3] dark:border-[#2F3442] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Inspiration Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Inspiration Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    setPrompt(item.prompt);
                    setSelectedStyle(item.style);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Style Archetype Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Visual Style & Palette (Light Mode Default)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLE_PRESETS.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedStyle === st.id
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#1E212B]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {st.desc}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {st.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Advanced Brand Options */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Optional Brand & Niche Customization</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Nordic Living"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F2] dark:bg-[#20232F] border border-[#E5E0D3] dark:border-[#2F3442] text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Industry / Niche (Optional)
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Modern Home & Interior"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F2] dark:bg-[#20232F] border border-[#E5E0D3] dark:border-[#2F3442] text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step Progress indicator when generating */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                {generationStepMessage || 'Readdy AI is synthesizing brand identity, colors, and responsive artboards...'}
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#181A22] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Powered by Readdy AI Engine • Instant responsive layout
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing Design...' : 'Generate Storefront Design'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

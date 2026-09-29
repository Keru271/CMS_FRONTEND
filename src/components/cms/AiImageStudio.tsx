'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  UploadCloud,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Eye,
  Download,
  Copy,
  Layers,
  ArrowRight,
  Sun,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Split,
  SlidersHorizontal,
  FolderPlus,
  Box,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { CMSProduct, ImageStudioVariation, ProcessImageStudioResult } from '@/src/types';
import DragDropUpload from '@/src/components/ui/DragDropUpload';

const SAMPLE_PRODUCTS = [
  {
    name: 'AeroPulse Stealth Runner',
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    prompt: 'floating above a dark concrete architectural pedestal with subtle rim light',
  },
  {
    name: 'Luxe Botanicals Glow Serum',
    category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
    prompt: 'placed on smooth travertine stone with water ripples and sunlit palm shadows',
  },
  {
    name: 'Chronos Minimalist Watch',
    category: 'Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    prompt: 'resting on dark obsidian slab with soft gold ambient illumination',
  },
  {
    name: 'Artisan Cognac Leather Tote',
    category: 'Bags & Accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
    prompt: 'staged in a bright Scandinavian sunlit studio with oak flooring',
  },
  {
    name: 'Nova Pro Studio Wireless Headphones',
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    prompt: 'hovering over futuristic minimalist metallic ring stand with soft indigo glow',
  },
];

const PRESET_STYLES = [
  { id: 'white', label: 'E-Commerce White', icon: '⚪', prompt: 'clean pure white backdrop with subtle floor contact shadow' },
  { id: 'pedestal', label: 'Marble Pedestal', icon: '🏛️', prompt: 'geometric white marble pedestal with warm directional spotlight' },
  { id: 'loft', label: 'Modern Loft', icon: '🏡', prompt: 'sunlit modern apartment loft with wooden table and soft indoor plants' },
  { id: 'nature', label: 'Sunlit Nature', icon: '🌿', prompt: 'outdoor natural sunlight with organic botanicals and golden hour warmth' },
  { id: 'luxury', label: 'Silk & Velvet', icon: '✨', prompt: 'draped premium champagne silk background with soft cinematic depth of field' },
  { id: 'neon', label: 'Cyber Tech Glow', icon: '⚡', prompt: 'dark futuristic neon gradient studio with subtle cyan and violet backlight' },
];

export const AiImageStudio: React.FC = () => {
  // Input State
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_PRODUCTS[0].image);
  const [productName, setProductName] = useState<string>(SAMPLE_PRODUCTS[0].name);
  const [productCategory, setProductCategory] = useState<string>(SAMPLE_PRODUCTS[0].category);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedPresetStyle, setSelectedPresetStyle] = useState<string>('pedestal');

  // Enhancement controls
  const [autoEnhance, setAutoEnhance] = useState<boolean>(true);
  const [sharpness, setSharpness] = useState<number>(85);
  const [contrast, setContrast] = useState<number>(15);
  const [shadowIntensity, setShadowIntensity] = useState<number>(65);

  // Store Products for direct linking
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Processing & Results State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [studioResult, setStudioResult] = useState<ProcessImageStudioResult | null>(null);
  const [activeVariationId, setActiveVariationId] = useState<string>('var_0');
  const [activeTab, setActiveTab] = useState<'all' | 'compare' | 'settings'>('all');
  const [compareSplit, setCompareSplit] = useState<number>(50);

  // Feedback Toasts
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadProducts();
    // Auto trigger initial pipeline run for preview
    handleRunPipeline(SAMPLE_PRODUCTS[0].image, SAMPLE_PRODUCTS[0].name, SAMPLE_PRODUCTS[0].category);
  }, []);

  const loadProducts = async () => {
    try {
      const list = await cmsService.getProducts();
      setProducts(list);
      if (list.length > 0) {
        setSelectedProductId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to load store products:', err);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectSample = (sample: typeof SAMPLE_PRODUCTS[0]) => {
    setImageUrl(sample.image);
    setProductName(sample.name);
    setProductCategory(sample.category);
    setCustomPrompt(sample.prompt);
    handleRunPipeline(sample.image, sample.name, sample.category, sample.prompt);
  };

  const handleSelectStoreProduct = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setSelectedProductId(prod.id);
      const prodImg = prod.image || (prod.images && prod.images[0]) || '';
      if (prodImg) setImageUrl(prodImg);
      setProductName(prod.name);
      setProductCategory(prod.category || prod.categoryName || 'General');
      if (prodImg) {
        handleRunPipeline(prodImg, prod.name, prod.category || prod.categoryName || 'General');
      }
    }
  };

  const handleRunPipeline = async (
    targetUrl = imageUrl,
    targetName = productName,
    targetCat = productCategory,
    targetPrompt = customPrompt
  ) => {
    if (!targetUrl) {
      showToast('Please provide an image URL or upload a product photo.', 'error');
      return;
    }

    setIsProcessing(true);
    setPipelineStep(1);

    // Simulate progressive pipeline milestones
    const stepTimer1 = setTimeout(() => setPipelineStep(2), 600);
    const stepTimer2 = setTimeout(() => setPipelineStep(3), 1300);
    const stepTimer3 = setTimeout(() => setPipelineStep(4), 2000);

    try {
      const result = await cmsService.processImageStudio({
        imageUrl: targetUrl,
        productName: targetName,
        productCategory: targetCat,
        customPrompt: targetPrompt,
        enhancements: {
          autoEnhance,
          sharpness,
          contrast,
          shadowIntensity,
          reflection: true,
        },
      });

      setStudioResult(result);
      if (result.variations.length > 0) {
        setActiveVariationId(result.variations[1]?.id || result.variations[0].id);
      }
      showToast(`✨ Generated ${result.variations.length} studio-ready product variations!`);
    } catch (err) {
      console.error('Image Studio pipeline error:', err);
      showToast('Pipeline processing failed. Please try again.', 'error');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsProcessing(false);
      setPipelineStep(0);
    }
  };

  const handleSaveToProduct = async (variation: ImageStudioVariation, isCover = false) => {
    if (!selectedProductId) {
      showToast('Please select a target store product from the dropdown.', 'error');
      return;
    }

    try {
      await cmsService.saveVariationToProduct({
        productId: selectedProductId,
        imageUrl: variation.url,
        isCoverImage: isCover,
      });

      const prod = products.find((p) => p.id === selectedProductId);
      showToast(
        isCover
          ? `👑 Set variation as Cover Image for "${prod?.name || 'product'}"!`
          : `➕ Added variation to gallery for "${prod?.name || 'product'}"!`
      );
    } catch (err) {
      console.error('Failed to save variation to product:', err);
      showToast('Failed to attach image to product.', 'error');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('📋 Image URL copied to clipboard!');
  };

  const activeVariation =
    studioResult?.variations.find((v) => v.id === activeVariationId) ||
    studioResult?.variations[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-foreground">
                  AI Image Studio
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black tracking-wider uppercase border border-indigo-200/60 dark:border-indigo-800/60">
                  Separate Vision Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated 5-stage pipeline: Background Removal → Image Enhancement → AI Background Synthesis → Multi-Variation Generation → Store-Ready Output.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleRunPipeline()}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Studio...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Variations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-md ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* PIPELINE PROGRESS BAR */}
      {isProcessing && (
        <div className="p-6 rounded-3xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
              AI Image Studio Pipeline in Progress
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Stage {pipelineStep} of 4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Background Removal (Alpha Cutout)' },
              { num: 2, label: 'Micro-Contrast & Shadow Synthesis' },
              { num: 3, label: 'AI Scene Backdrops Generation' },
              { num: 4, label: 'Multi-Aspect Store Assets' },
            ].map((st) => {
              const isDone = pipelineStep > st.num;
              const isCurrent = pipelineStep === st.num;
              return (
                <div
                  key={st.num}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800'
                      : isCurrent
                      ? 'bg-white dark:bg-card border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] flex items-center justify-center shrink-0">
                      {st.num}
                    </span>
                  )}
                  <span className="truncate">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: UPLOAD, CONFIGURATION & SCENE CONTROLS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Image Source Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>1. Upload Product Photo</span>
            </h3>

            {/* Drag Drop Area */}
            <div className="space-y-3">
              <DragDropUpload
                folder="products"
                fileType="PRODUCT_IMAGE"
                label="Upload Raw Product Photo"
                currentUrl={imageUrl}
                onUploadComplete={(url) => {
                  setImageUrl(url);
                  handleRunPipeline(url);
                }}
                hint="Shoe, cosmetics, bag, watch, gadget (JPG, PNG, WebP)"
                previewShape="square"
                maxSizeMB={8}
              />

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Or Paste Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRunPipeline()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Load
                  </button>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Quick Demo Products:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_PRODUCTS.slice(0, 4).map((sp) => (
                    <button
                      key={sp.name}
                      type="button"
                      onClick={() => handleSelectSample(sp)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                        imageUrl === sp.image
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs'
                      }`}
                    >
                      <img
                        src={sp.image}
                        alt={sp.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11px] font-medium truncate">{sp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Product Details & AI Scene Backdrops */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>2. AI Scene & Backdrops</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Product Title</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Leather Oxford Shoes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="e.g. Footwear"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Preset Background Styles */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Preset AI Background Styles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetStyle(st.id);
                        setCustomPrompt(st.prompt);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer text-xs ${
                        selectedPresetStyle === st.id
                          ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-sm">{st.icon}</span>
                      <span className="truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom AI Prompt Box */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Custom AI Scene Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. resting on smooth wet black river stone with warm sunset illumination..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                />
              </div>

              {/* Enhancement Sliders */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    Image Engine Settings
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoEnhance}
                      onChange={(e) => setAutoEnhance(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Auto-Calibrate</span>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                    <span>Edge Sharpness</span>
                    <span>{sharpness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharpness}
                    onChange={(e) => setSharpness(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                    <span>Contact Shadow Intensity</span>
                    <span>{shadowIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadowIntensity}
                    onChange={(e) => setShadowIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Direct Link to Store Product */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>3. Target Catalog Product</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Select Store Product to Attach Generated Images
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectStoreProduct(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer text-slate-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category || 'General'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                You can save any variation directly as the product's primary cover image or add to its photo gallery.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE GALLERY & STORE-READY ASSETS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Large Active Variation Display */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-foreground">
                    {activeVariation?.title || 'Selected Variation'}
                  </h3>
                  {activeVariation?.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                      {activeVariation.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {activeVariation?.tagline || 'High-resolution store-ready asset'}
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gallery View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('compare')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeTab === 'compare'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Before / After</span>
                </button>
              </div>
            </div>

            {/* Display Canvas */}
            {activeTab === 'all' ? (
              <div className="relative aspect-square max-h-[460px] w-full rounded-2xl bg-slate-950/5 border border-slate-200 overflow-hidden flex items-center justify-center group">
                <img
                  src={activeVariation?.url || imageUrl}
                  alt={activeVariation?.title || 'Product'}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Floating Action Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg animate-in fade-in">
                  <div className="text-[11px] font-bold text-slate-700">
                    <span>{activeVariation?.width || 1200} × {activeVariation?.height || 1200} px</span>
                    <span className="text-slate-400 ml-2">({activeVariation?.aspectRatio || '1:1'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(activeVariation?.url || imageUrl)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                      title="Copy CDN URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveToProduct(activeVariation!, false)}
                      className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Add to Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveToProduct(activeVariation!, true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Set as Cover Image</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Before / After Comparison Slider */
              <div className="space-y-3">
                <div className="relative aspect-square max-h-[460px] w-full rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden select-none">
                  {/* Background: Generated Variation */}
                  <img
                    src={activeVariation?.url || imageUrl}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Foreground: Original Image with Clip Path */}
                  <div
                    className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl"
                    style={{ width: `${compareSplit}%` }}
                  >
                    <img
                      src={imageUrl}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-contain max-w-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                    Original Capture
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shadow-md">
                    AI Studio Enhanced
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>← Original Photo</span>
                    <span>Slide to Compare</span>
                    <span>AI Enhanced →</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={compareSplit}
                    onChange={(e) => setCompareSplit(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* All 6 Generated Variations Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Generated Multi-Variation Suite ({studioResult?.variations.length || 0})</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500">Click any asset to inspect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {studioResult?.variations.map((v) => {
                const isSelected = v.id === activeVariationId;
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVariationId(v.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-square rounded-xl bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center">
                      <img
                        src={v.url}
                        alt={v.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-foreground truncate">
                          {v.title}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                          {v.aspectRatio}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {v.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveToProduct(v, true);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply Cover</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(v.url);
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

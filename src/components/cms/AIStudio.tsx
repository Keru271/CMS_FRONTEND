'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  FileText,
  Image as ImageIcon,
  Megaphone,
  BookOpen,
  Headphones,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Zap,
  Globe,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Maximize2,
  Download,
  Share2,
  ArrowRight,
  Bot,
  Lightbulb,
  Award,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { useTranslation } from '@/src/context/LanguageContext';

export function AIStudio() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'seo' | 'copywriter' | 'image' | 'marketing' | 'blog' | 'support'
  >('seo');

  const [aiStatus, setAiStatus] = useState<{
    provider: string;
    model: string;
    hasApiKey: boolean;
  }>({
    provider: 'Checking...',
    model: 'gpt-4o-mini',
    hasApiKey: false,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. SEO State
  const [seoTitle, setSeoTitle] = useState('Minimalist Ceramic Coffee Mug');
  const [seoDescription, setSeoDescription] = useState(
    'Handcrafted ceramic mug with matte obsidian glaze, heat-retention walls, and ergonomic grip.',
  );
  const [seoCategory, setSeoCategory] = useState('Drinkware & Kitchen');
  const [seoKeywords, setSeoKeywords] = useState('ceramic mug, handmade coffee cup, minimalist kitchen');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<any>(null);

  // 2. Product Copywriter State
  const [copyProductName, setCopyProductName] = useState('AeroGrip Ergonomic Wireless Mouse');
  const [copyCategory, setCopyCategory] = useState('Electronics & Workstation');
  const [copyFeatures, setCopyFeatures] = useState(
    'Tri-mode wireless (Bluetooth 5.3 + 2.4GHz), 26000 DPI sensor, silent optical switches, 85-hour battery life',
  );
  const [copyTone, setCopyTone] = useState<
    'persuasive' | 'luxurious' | 'minimalist' | 'technical' | 'casual' | 'urgent'
  >('persuasive');
  const [copyAudience, setCopyAudience] = useState('Designers, Developers & Gamers');
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyResult, setCopyResult] = useState<any>(null);

  // 3. AI Image Studio State
  const [imagePrompt, setImagePrompt] = useState('Matte black stainless steel insulated water bottle sitting on a minimalist wet granite pedestal');
  const [imageStyle, setImageStyle] = useState<
    'studio_photography' | 'minimalist_podium' | 'lifestyle_scene' | 'cyberpunk_neon' | '3d_claymorphism' | 'luxury_editorial'
  >('minimalist_podium');
  const [imageLighting, setImageLighting] = useState<
    'softbox_diffused' | 'dramatic_rim_light' | 'natural_golden_hour' | 'cyber_neon' | 'high_key_clean'
  >('dramatic_rim_light');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '9:16'>('1:1');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);

  // 4. Marketing Copy State
  const [mktProductName, setMktProductName] = useState('Lumina SoundPulse ANC Headphones');
  const [mktDescription, setMktDescription] = useState('Active noise cancellation, 40mm beryllium drivers, spatial audio, memory foam earcups.');
  const [mktCampaign, setMktCampaign] = useState<'flash_sale' | 'new_launch' | 'seasonal_promo' | 'vip_exclusive' | 'abandoned_cart'>('new_launch');
  const [mktDiscount, setMktDiscount] = useState('SOUND25');
  const [mktPercent, setMktPercent] = useState(25);
  const [mktTone, setMktTone] = useState<'energetic' | 'exclusive' | 'friendly' | 'humorous' | 'premium'>('energetic');
  const [mktLoading, setMktLoading] = useState(false);
  const [mktResult, setMktResult] = useState<any>(null);

  // 5. Blog Writer State
  const [blogTopic, setBlogTopic] = useState('10 Essential Workstation Upgrades to Double Your Productivity in 2026');
  const [blogKeywords, setBlogKeywords] = useState('desk setup, ergonomic accessories, productivity tips, home office 2026');
  const [blogTone, setBlogTone] = useState<'informative' | 'casual' | 'thought_leadership' | 'guide_tutorial' | 'listicle'>('guide_tutorial');
  const [blogLength, setBlogLength] = useState<'short' | 'medium' | 'in_depth'>('medium');
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogResult, setBlogResult] = useState<any>(null);

  // 6. Support Copilot State
  const [supportMsg, setSupportMsg] = useState('Hi, I ordered the headphones 4 days ago and tracking hasn\'t updated. When will it arrive? My order is #ORD-9821.');
  const [supportOrder, setSupportOrder] = useState('ORD-9821');
  const [supportSentiment, setSupportSentiment] = useState<'angry' | 'confused' | 'inquiry' | 'happy' | 'neutral'>('inquiry');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportResult, setSupportResult] = useState<any>(null);

  useEffect(() => {
    cmsService
      .getAiStatus()
      .then((res) => {
        if (res.success) {
          setAiStatus({
            provider: res.provider,
            model: res.model,
            hasApiKey: res.hasApiKey,
          });
        }
      })
      .catch(() => {
        setAiStatus({
          provider: 'Hybrid Engine (Pollinations AI + Smart Generators)',
          model: 'rule-based-nlp-v2',
          hasApiKey: false,
        });
      });
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handlers
  const handleOptimizeSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeoLoading(true);
    try {
      const res = await cmsService.optimizeSeoWithAi({
        title: seoTitle,
        description: seoDescription,
        category: seoCategory,
        targetKeywords: seoKeywords,
      });
      if (res.success) {
        setSeoResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to optimize SEO');
    } finally {
      setSeoLoading(false);
    }
  };

  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopyLoading(true);
    try {
      const res = await cmsService.generateProductDescriptionWithAi({
        productName: copyProductName,
        category: copyCategory,
        keyFeatures: copyFeatures,
        tone: copyTone,
        targetAudience: copyAudience,
      });
      if (res.success) {
        setCopyResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate copy');
    } finally {
      setCopyLoading(false);
    }
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageLoading(true);
    try {
      const res = await cmsService.generateProductImageWithAi({
        prompt: imagePrompt,
        style: imageStyle,
        lighting: imageLighting,
        aspectRatio: imageAspectRatio,
      });
      if (res.success) {
        setImageResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleGenerateMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    setMktLoading(true);
    try {
      const res = await cmsService.generateMarketingCopyWithAi({
        productName: mktProductName,
        productDescription: mktDescription,
        campaignType: mktCampaign,
        discountCode: mktDiscount,
        discountPercent: mktPercent,
        tone: mktTone,
      });
      if (res.success) {
        setMktResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate marketing copy');
    } finally {
      setMktLoading(false);
    }
  };

  const handleGenerateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogLoading(true);
    try {
      const res = await cmsService.generateBlogPostWithAi({
        topic: blogTopic,
        keywords: blogKeywords,
        tone: blogTone,
        targetLength: blogLength,
      });
      if (res.success) {
        setBlogResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate blog post');
    } finally {
      setBlogLoading(false);
    }
  };

  const handleGenerateSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);
    try {
      const res = await cmsService.generateSupportReplyWithAi({
        customerMessage: supportMsg,
        orderNumber: supportOrder,
        sentiment: supportSentiment,
      });
      if (res.success) {
        setSupportResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to draft support reply');
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 p-6 rounded-3xl border border-indigo-900/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">AI Commerce Studio</h1>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                ChatGPT & AI Vision
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Automated SEO metadata, high-converting product copy, studio product photography renders & marketing campaigns.
            </p>
          </div>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active AI Engine</div>
            <div className="text-xs font-bold text-slate-200">{aiStatus.provider}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO & SERP Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab('copywriter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'copywriter'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Product Copywriter</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'image'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>AI Image Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'marketing'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Marketing & Socials</span>
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'blog'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SEO Blog Creator</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'support'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support Copilot</span>
        </button>
      </div>

      {/* ─── TAB 1: SEO OPTIMIZER ─── */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Search className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">SEO Target Parameters</h2>
            </div>

            <form onSubmit={handleOptimizeSeo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product / Page Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category or Collection
                </label>
                <input
                  type="text"
                  value={seoCategory}
                  onChange={(e) => setSeoCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Seed Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="e.g. coffee mug, ceramic, matte"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Summary / Details
                </label>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={seoLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${seoLoading ? 'animate-spin' : ''}`} />
                <span>{seoLoading ? 'Analyzing & Optimizing...' : 'Generate SEO Strategy'}</span>
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {seoResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-slate-100 text-base">Generated SEO Metadata</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                    <span>SEO Score:</span>
                    <span>{seoResult.seoScore || 95}/100</span>
                  </div>
                </div>

                {/* Google SERP Preview Simulator */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Google Search Result Snippet</span>
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    https://yourstore.com/products/{seoResult.slugSuggestion}
                  </div>
                  <div className="text-blue-400 font-semibold text-base hover:underline cursor-pointer">
                    {seoResult.metaTitle}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {seoResult.metaDescription}
                  </div>
                </div>

                {/* Structured Fields */}
                <div className="space-y-3">
                  {/* Meta Title */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">Optimized Meta Title ({seoResult.metaTitle?.length || 0} chars)</div>
                      <div className="text-sm font-medium text-slate-100 mt-0.5">{seoResult.metaTitle}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(seoResult.metaTitle, 'seoTitle')}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Copy Meta Title"
                    >
                      {copiedKey === 'seoTitle' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Meta Description */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">Meta Description ({seoResult.metaDescription?.length || 0} chars)</div>
                      <div className="text-sm text-slate-200 mt-0.5 leading-relaxed">{seoResult.metaDescription}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(seoResult.metaDescription, 'seoDesc')}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Copy Meta Description"
                    >
                      {copiedKey === 'seoDesc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Keywords Tag Cloud */}
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2">Recommended Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {[...(seoResult.primaryKeywords || []), ...(seoResult.secondaryKeywords || [])].map((kw: string, i: number) => (
                        <span
                          key={i}
                          onClick={() => copyToClipboard(kw, `kw-${i}`)}
                          className="bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Tag className="w-3 h-3 text-indigo-400" />
                          <span>{kw}</span>
                          {copiedKey === `kw-${i}` && <Check className="w-3 h-3 text-emerald-400 ml-1" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actionable Tips */}
                  {seoResult.optimizationTips && (
                    <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-4">
                      <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>AI Optimization Checklist</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {seoResult.optimizationTips.map((tip: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <Search className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">No SEO Audit Generated Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Fill in your product title and target keywords on the left, then click Generate SEO Strategy to receive comprehensive ranking metadata.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRODUCT COPYWRITER ─── */}
      {activeTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">Product Copy Inputs</h2>
            </div>

            <form onSubmit={handleGenerateCopy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={copyProductName}
                  onChange={(e) => setCopyProductName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={copyCategory}
                    onChange={(e) => setCopyCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tone of Voice</label>
                  <select
                    value={copyTone}
                    onChange={(e) => setCopyTone(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="persuasive">Persuasive (High Conversion)</option>
                    <option value="luxurious">Luxurious & Elegant</option>
                    <option value="minimalist">Minimalist & Clean</option>
                    <option value="technical">Technical & Detailed</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="urgent">Urgent & Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Buyer Persona</label>
                <input
                  type="text"
                  value={copyAudience}
                  onChange={(e) => setCopyAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Features / Specs</label>
                <textarea
                  rows={3}
                  value={copyFeatures}
                  onChange={(e) => setCopyFeatures(e.target.value)}
                  placeholder="Battery life, materials, dimensions, certifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={copyLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${copyLoading ? 'animate-spin' : ''}`} />
                <span>{copyLoading ? 'Crafting High-Converting Copy...' : 'Generate Product Copy'}</span>
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="lg:col-span-7 space-y-4">
            {copyResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-base">{copyResult.headline}</h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${copyResult.headline}\n\n${copyResult.shortDescription}\n\nFeatures:\n${(
                          copyResult.featureBullets || []
                        ).join('\n')}`,
                        'allCopy',
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copiedKey === 'allCopy' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>Copy All Copy</span>
                  </button>
                </div>

                {/* Short Overview */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Executive Summary</div>
                  <p className="text-sm text-slate-200 leading-relaxed">{copyResult.shortDescription}</p>
                </div>

                {/* Feature Bullets */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Benefit-Driven Feature Bullets</div>
                  <div className="space-y-2">
                    {copyResult.featureBullets?.map((bullet: string, i: number) => (
                      <div
                        key={i}
                        className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2 text-xs text-slate-200"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Hooks */}
                {copyResult.salesHooks && (
                  <div className="bg-purple-950/30 border border-purple-900/30 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Sales & Conversion Hooks</span>
                    </div>
                    {copyResult.salesHooks.map((hook: string, idx: number) => (
                      <div key={idx} className="text-xs text-slate-200 flex items-center gap-2">
                        <span>{hook}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">No Product Copy Generated</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Enter product details to generate sales-boosting headlines, short descriptions, and benefit bullet points.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: AI IMAGE STUDIO ─── */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">AI Studio Product Visuals</h2>
            </div>

            <form onSubmit={handleGenerateImage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Image Prompt / Description
                </label>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  required
                  placeholder="Describe your product, background, materials, and composition..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Photography Style</label>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="minimalist_podium">Minimalist Architectural Podium</option>
                  <option value="studio_photography">Commercial Clean Studio Shoot</option>
                  <option value="lifestyle_scene">Luxury Lifestyle Interior Scene</option>
                  <option value="cyberpunk_neon">Cyberpunk Neon Glossy</option>
                  <option value="3d_claymorphism">Trendy 3D Claymorphism</option>
                  <option value="luxury_editorial">High-End Vogue Editorial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lighting Mood</label>
                  <select
                    value={imageLighting}
                    onChange={(e) => setImageLighting(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="dramatic_rim_light">Dramatic Rim Lighting</option>
                    <option value="softbox_diffused">Softbox Diffused</option>
                    <option value="natural_golden_hour">Natural Golden Hour</option>
                    <option value="cyber_neon">Dual-Tone Cyber Neon</option>
                    <option value="high_key_clean">High-Key Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Aspect Ratio</label>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="1:1">1:1 Square (1024x1024)</option>
                    <option value="4:3">4:3 Product Grid</option>
                    <option value="16:9">16:9 Hero Banner</option>
                    <option value="9:16">9:16 Social Story</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={imageLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${imageLoading ? 'animate-spin' : ''}`} />
                <span>{imageLoading ? 'Rendering 8K Product Scene...' : 'Render Product Visual'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {imageResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-slate-100 text-base">Generated Studio Render</h3>
                  </div>
                  <a
                    href={imageResult.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="product-render.png"
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open High-Res</span>
                  </a>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[380px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageResult.imageUrl}
                    alt="AI Product Render"
                    className="w-full h-auto object-cover max-h-[440px] rounded-2xl transition-all hover:scale-105"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="truncate font-mono text-xs text-slate-400">
                    <span className="text-slate-500">Image URL: </span>
                    <span className="text-slate-200">{imageResult.imageUrl}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(imageResult.imageUrl, 'imgUrl')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                  >
                    {copiedKey === 'imgUrl' ? 'Copied!' : 'Copy Direct Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">No Image Rendered Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Describe your product styling and choose lighting parameters to produce clean commercial catalog photos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: MARKETING & SOCIALS ─── */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Megaphone className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">Campaign Parameters</h2>
            </div>

            <form onSubmit={handleGenerateMarketing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product / Collection</label>
                <input
                  type="text"
                  value={mktProductName}
                  onChange={(e) => setMktProductName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Type</label>
                <select
                  value={mktCampaign}
                  onChange={(e) => setMktCampaign(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="new_launch">Product Launch Drop</option>
                  <option value="flash_sale">Flash Sale (Urgency)</option>
                  <option value="seasonal_promo">Seasonal Promotion</option>
                  <option value="vip_exclusive">VIP Exclusive Access</option>
                  <option value="abandoned_cart">Cart Recovery Special</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={mktDiscount}
                    onChange={(e) => setMktDiscount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={mktPercent}
                    onChange={(e) => setMktPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Details</label>
                <textarea
                  rows={2}
                  value={mktDescription}
                  onChange={(e) => setMktDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={mktLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${mktLoading ? 'animate-spin' : ''}`} />
                <span>{mktLoading ? 'Generating Multi-Channel Copy...' : 'Generate Marketing Kit'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {mktResult ? (
              <div className="space-y-4">
                {/* Instagram */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-400">📸 Instagram Caption & Hashtags</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${mktResult.instagram?.caption}\n\n${(mktResult.instagram?.hashtags || []).join(' ')}`,
                          'insta',
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-100 rounded cursor-pointer"
                    >
                      {copiedKey === 'insta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    {mktResult.instagram?.caption}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mktResult.instagram?.hashtags?.map((tag: string, i: number) => (
                      <span key={i} className="text-[11px] text-pink-400 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Email Subject & Body */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">✉️ Email Newsletter Subject Lines</span>
                  </div>
                  <div className="space-y-1.5">
                    {mktResult.email?.subjectLines?.map((sub: string, i: number) => (
                      <div
                        key={i}
                        onClick={() => copyToClipboard(sub, `sub-${i}`)}
                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-200 cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <span>{sub}</span>
                        {copiedKey === `sub-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <Megaphone className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">No Marketing Kit Generated</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Generate high-impact Instagram posts, high-converting email subject lines, and Google Ads headlines with 1 click.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: SEO BLOG WRITER ─── */}
      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">SEO Blog Configuration</h2>
            </div>

            <form onSubmit={handleGenerateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Blog Topic / Title</label>
                <input
                  type="text"
                  value={blogTopic}
                  onChange={(e) => setBlogTopic(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Focus SEO Keywords</label>
                <input
                  type="text"
                  value={blogKeywords}
                  onChange={(e) => setBlogKeywords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Writing Style</label>
                  <select
                    value={blogTone}
                    onChange={(e) => setBlogTone(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="guide_tutorial">How-To Guide</option>
                    <option value="listicle">Listicle (Top 10)</option>
                    <option value="thought_leadership">Thought Leadership</option>
                    <option value="informative">Informative Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Length</label>
                  <select
                    value={blogLength}
                    onChange={(e) => setBlogLength(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="short">Short (~500 words)</option>
                    <option value="medium">Standard (~1000 words)</option>
                    <option value="in_depth">In-Depth Pillar (~2000 words)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={blogLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${blogLoading ? 'animate-spin' : ''}`} />
                <span>{blogLoading ? 'Writing Article & Outline...' : 'Generate Full Blog Article'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {blogResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{blogResult.title}</h3>
                    <div className="text-xs text-indigo-400 font-semibold mt-0.5">
                      Estimated Read: {blogResult.readingTimeMinutes} min
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(blogResult.contentMarkdown, 'blogMarkdown')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {copiedKey === 'blogMarkdown' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Markdown</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-[420px] overflow-y-auto space-y-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {blogResult.contentMarkdown}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">No Blog Article Written</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Write complete, SEO-structured blog posts with headings, bullet points, and FAQ schema ready for immediate publication.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: SUPPORT COPILOT ─── */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Headphones className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">Customer Ticket Context</h2>
            </div>

            <form onSubmit={handleGenerateSupport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Inbound Message</label>
                <textarea
                  rows={4}
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  required
                  placeholder="Paste the customer's email or chat message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Order # (Optional)</label>
                  <input
                    type="text"
                    value={supportOrder}
                    onChange={(e) => setSupportOrder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Emotion</label>
                  <select
                    value={supportSentiment}
                    onChange={(e) => setSupportSentiment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="inquiry">General Inquiry</option>
                    <option value="confused">Confused / Needs Guidance</option>
                    <option value="angry">Frustrated / Urgent</option>
                    <option value="happy">Happy / Compliment</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={supportLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${supportLoading ? 'animate-spin' : ''}`} />
                <span>{supportLoading ? 'Drafting Empathetic Response...' : 'Draft Support Reply'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {supportResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-slate-100 text-base">Recommended Customer Response</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(supportResult.replyMessage, 'supportReply')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {copiedKey === 'supportReply' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Reply</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {supportResult.replyMessage}
                </div>

                {supportResult.actionableSteps && (
                  <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-4">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Internal Action Checklist for Support Agent</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {supportResult.actionableSteps.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                <Headphones className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">No Ticket Response Drafted</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Paste the customer question to automatically generate high-empathy, policy-compliant support responses with action steps.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

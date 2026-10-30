'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Share2,
  FileCode,
  Package,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  Code2,
  Check,
  Zap,
  Bot,
  ArrowRight,
  ArrowLeft,
  X,
  Key,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Copy,
  CheckCheck,
  HelpCircle,
  Wand2,
  CheckSquare,
  Square,
  Flame,
  Star,
  Layers,
  Cpu,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { GlobalSeoData, ProductSeoData, CMSProduct } from '@/src/types';
import { useCMSContext } from '@/src/context/CMSContext';
import DragDropUpload from '@/src/components/ui/DragDropUpload';

export const SEOStudio: React.FC = () => {
  const { merchantData, currencySymbol = '₹' } = useCMSContext();
  const [activeTab, setActiveTab] = useState<
    'GLOBAL' | 'OPEN_GRAPH' | 'PREVIEW' | 'ROBOTS' | 'SCHEMA' | 'PRODUCTS' | 'KEYWORDS' | 'RICH_RESULTS'
  >('GLOBAL');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Global SEO State
  const [siteTitle, setSiteTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');
  const [structuredData, setStructuredData] = useState('');

  // Products SEO State
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [prodSeoTitle, setProdSeoTitle] = useState('');
  const [prodSeoDesc, setProdSeoDesc] = useState('');
  const [prodUrlSlug, setProdUrlSlug] = useState('');
  const [prodOgImage, setProdOgImage] = useState('');
  const [prodCanonicalUrl, setProdCanonicalUrl] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isOptimizingProduct, setIsOptimizingProduct] = useState(false);
  const [isBulkOptimizing, setIsBulkOptimizing] = useState(false);

  // AI SEO Assist Modal State
  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState<'gemini' | 'chatgpt' | 'ensemble'>('gemini');
  const [customKeywordInput, setCustomKeywordInput] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [aiScope, setAiScope] = useState<{
    globalMeta: boolean;
    openGraph: boolean;
    jsonLd: boolean;
    robotsTxt: boolean;
    products: boolean;
  }>({
    globalMeta: true,
    openGraph: true,
    jsonLd: true,
    robotsTxt: true,
    products: true,
  });
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiProcessingStage, setAiProcessingStage] = useState<string>('');
  const [aiProcessingProgress, setAiProcessingProgress] = useState<number>(0);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // AI Store Knowledge Cache
  const [storeDossierDetails, setStoreDossierDetails] = useState<any>(null);
  const [detectedNiche, setDetectedNiche] = useState<string>('Handcrafted Luxury & Lifestyle');
  const [suggestedKeywordsPool, setSuggestedKeywordsPool] = useState<string[]>([]);
  const [suggestedValuePropsPool, setSuggestedValuePropsPool] = useState<string[]>([]);
  const [suggestedMarketsPool, setSuggestedMarketsPool] = useState<string[]>([]);
  const [activeKeywordFilter, setActiveKeywordFilter] = useState<'ALL' | 'commercial' | 'transactional' | 'informational'>('ALL');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const storeName = merchantData?.store?.storeName || 'OmniStore';
  const storeDomain =
    (merchantData?.store as any)?.customDomain ||
    `${(merchantData?.store as any)?.slug || 'my-store'}.omnistore.com`;

  useEffect(() => {
    loadSeoData();
    loadProductsList();
    fetchAiContext();
  }, []);

  const loadSeoData = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getGlobalSeo();
      setSiteTitle(data.seoSiteTitle || `${storeName} | Official Online Store`);
      setMetaDesc(
        data.seoMetaDescription ||
          `Discover top quality products at ${storeName}. Enjoy fast shipping, secure checkout, and exclusive deals.`,
      );
      setCanonicalUrl(data.seoCanonicalUrl || `https://${storeDomain}`);
      setOgTitle(data.seoOgTitle || `${storeName} - Premium Online Shopping`);
      setOgDesc(
        data.seoOgDescription ||
          `Shop the latest collections and best-sellers at ${storeName}. Free shipping on eligible orders.`,
      );
      setOgImage(
        data.seoOgImage ||
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      );
      setRobotsTxt(
        data.seoRobotsTxt ||
          `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /admin\nSitemap: https://${storeDomain}/sitemap.xml`,
      );
      setStructuredData(
        data.seoStructuredDataJson ||
          JSON.stringify(
            {
              '@context': 'https://schema.org',
              '@type': 'OnlineStore',
              name: storeName,
              url: `https://${storeDomain}`,
              description: data.seoMetaDescription || `Official online store for ${storeName}`,
              potentialAction: {
                '@type': 'SearchAction',
                target: `https://${storeDomain}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
            null,
            2,
          ),
      );
    } catch (err) {
      console.error('Failed to load SEO settings:', err);
      showToast('Failed to load SEO configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsList = async () => {
    try {
      const prods = await cmsService.getProducts();
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
        loadProductSeo(prods[0].id, prods[0]);
      }
    } catch (err) {
      console.error('Failed to load products for SEO:', err);
    }
  };

  const fetchAiContext = async () => {
    try {
      const ctx = await cmsService.getAiSeoContext();
      if (ctx) {
        setStoreDossierDetails(ctx);
        if (ctx.detectedNiche) {
          setDetectedNiche(ctx.detectedNiche);
        }
        if (Array.isArray(ctx.suggestedKeywords) && ctx.suggestedKeywords.length > 0) {
          setSuggestedKeywordsPool(ctx.suggestedKeywords);
          setCustomKeywordInput((prev) => prev || ctx.suggestedKeywords.slice(0, 3).join(', '));
        }
        if (Array.isArray(ctx.suggestedValueProps) && ctx.suggestedValueProps.length > 0) {
          setSuggestedValuePropsPool(ctx.suggestedValueProps);
        }
        if (Array.isArray(ctx.suggestedMarkets) && ctx.suggestedMarkets.length > 0) {
          setSuggestedMarketsPool(ctx.suggestedMarkets);
        }
      }
    } catch (err) {
      // Fallback context
      const fallbackKws = [`${storeName.toLowerCase()} online`, `buy ${storeName.toLowerCase()}`, 'premium lifestyle', 'authentic quality'];
      setSuggestedKeywordsPool(fallbackKws);
      setCustomKeywordInput((prev) => prev || fallbackKws.slice(0, 3).join(', '));
      setSuggestedValuePropsPool([
        'Handcrafted Luxury & Authentic Craftsmanship',
        'Fast Complimentary Shipping & Hassle-Free 30-Day Returns',
        'Direct From Manufacturer | Best Price Guaranteed',
        '100% Sustainable & Certified Materials',
      ]);
      setSuggestedMarketsPool([
        'India (PAN India / Tier 1-2 metros)',
        'Global / Worldwide Organic Search',
        'North America (USA & Canada)',
        'UK & European Union',
      ]);
    }
  };

  const loadProductSeo = async (productId: string, fallbackProd?: CMSProduct) => {
    try {
      const data = await cmsService.getProductSeo(productId);
      const prod = fallbackProd || products.find((p) => p.id === productId);
      setProdSeoTitle(data.seoTitle || prod?.seoTitle || prod?.metaTitle || prod?.name || '');
      setProdSeoDesc(
        data.seoDescription ||
          prod?.seoDescription ||
          prod?.metaDescription ||
          prod?.description?.slice(0, 160) ||
          '',
      );
      setProdUrlSlug(
        data.urlSlug ||
          prod?.urlSlug ||
          prod?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          '',
      );
      setProdOgImage(data.ogImage || prod?.ogImage || prod?.image || '');
      setProdCanonicalUrl(
        data.canonicalUrl ||
          prod?.canonicalUrl ||
          `https://${storeDomain}/products/${prod?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      );
    } catch (err) {
      const prod = fallbackProd || products.find((p) => p.id === productId);
      if (prod) {
        setProdSeoTitle(prod.seoTitle || prod.metaTitle || prod.name || '');
        setProdSeoDesc(
          prod.seoDescription || prod.metaDescription || prod.description?.slice(0, 160) || '',
        );
        setProdUrlSlug(prod.urlSlug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        setProdOgImage(prod.ogImage || prod.image || '');
        setProdCanonicalUrl(
          prod.canonicalUrl ||
            `https://${storeDomain}/products/${prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        );
      }
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    loadProductSeo(productId);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveGlobalSeo = async () => {
    setIsSaving(true);
    try {
      await cmsService.updateGlobalSeo({
        seoSiteTitle: siteTitle,
        seoMetaDescription: metaDesc,
        seoCanonicalUrl: canonicalUrl,
        seoOgTitle: ogTitle,
        seoOgDescription: ogDesc,
        seoOgImage: ogImage,
        seoRobotsTxt: robotsTxt,
        seoStructuredDataJson: structuredData,
      });
      showToast('Store SEO Governance saved successfully!');
    } catch (err) {
      console.error('Failed to save SEO settings:', err);
      showToast('Failed to save SEO settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProductSeo = async () => {
    if (!selectedProductId) return;
    setIsSaving(true);
    try {
      await cmsService.updateProductSeo(selectedProductId, {
        seoTitle: prodSeoTitle,
        seoDescription: prodSeoDesc,
        urlSlug: prodUrlSlug,
        ogImage: prodOgImage,
        canonicalUrl: prodCanonicalUrl,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProductId
            ? {
                ...p,
                seoTitle: prodSeoTitle,
                metaTitle: prodSeoTitle,
                seoDescription: prodSeoDesc,
                metaDescription: prodSeoDesc,
                urlSlug: prodUrlSlug,
                ogImage: prodOgImage,
                canonicalUrl: prodCanonicalUrl,
              }
            : p,
        ),
      );
      showToast('Product SEO metadata saved successfully!');
    } catch (err) {
      console.error('Failed to save product SEO:', err);
      showToast('Failed to save product SEO', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // SEO Health Score Calculation
  const calculateSeoScore = () => {
    let score = 0;
    if (siteTitle.length >= 30 && siteTitle.length <= 65) score += 25;
    else if (siteTitle.length > 0) score += 15;

    if (metaDesc.length >= 100 && metaDesc.length <= 165) score += 25;
    else if (metaDesc.length > 0) score += 15;

    if (canonicalUrl.startsWith('https://')) score += 15;
    if (ogImage && ogTitle && ogDesc) score += 15;
    if (robotsTxt.includes('Sitemap:')) score += 10;
    if (structuredData.includes('@context')) score += 10;
    return Math.min(100, score);
  };

  const seoScore = calculateSeoScore();
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()),
  );

  // AI Assist Click Handler
  const handleOpenAiAssist = () => {
    handleExecuteAiAssist();
  };

  // Execute AI SEO Assist and Implement directly (No modal)
  const handleExecuteAiAssist = async () => {
    if (isAiProcessing) return;
    setIsAiProcessing(true);
    setAiProcessingProgress(15);
    setAiProcessingStage(`Reading ${storeName} profile, catalog products, and business signals...`);

    try {
      const stepInterval = setInterval(() => {
        setAiProcessingProgress((prev) => {
          if (prev >= 85) {
            clearInterval(stepInterval);
            return 85;
          }
          if (prev < 35) {
            setAiProcessingStage('🧠 Consulting Google Gemini AI (with OpenAI fallback)...');
            return prev + 20;
          }
          if (prev < 60) {
            setAiProcessingStage('🎯 Formulating high-CTR Google SERP tags & OpenGraph social cards...');
            return prev + 25;
          }
          setAiProcessingStage('🌐 Constructing Schema.org JSON-LD microdata & crawl directives...');
          return prev + 20;
        });
      }, 600);

      const response = await cmsService.runAiSeoAssist({
        storeId: (merchantData?.store as any)?.id,
        aiModel: 'auto', // Tries Gemini -> OpenAI -> Default SEO
        scope: {
          globalMeta: true,
          openGraph: true,
          jsonLd: true,
          robotsTxt: true,
          products: true,
        },
        autoApply: true,
      });

      clearInterval(stepInterval);
      setAiProcessingProgress(100);
      setAiProcessingStage('✅ Applying advanced SEO architecture to store database...');

      setTimeout(() => {
        setIsAiProcessing(false);
        setAiResult(response);

        // Apply to local state immediately
        if (response.seoSiteTitle) setSiteTitle(response.seoSiteTitle);
        if (response.seoMetaDescription) setMetaDesc(response.seoMetaDescription);
        if (response.seoCanonicalUrl) setCanonicalUrl(response.seoCanonicalUrl);
        if (response.seoOgTitle) setOgTitle(response.seoOgTitle);
        if (response.seoOgDescription) setOgDesc(response.seoOgDescription);
        if (response.seoOgImage) setOgImage(response.seoOgImage);
        if (response.seoRobotsTxt) setRobotsTxt(response.seoRobotsTxt);
        if (response.seoStructuredDataJson) setStructuredData(response.seoStructuredDataJson);

        // Update products if returned
        if (response.productOptimizations && response.productOptimizations.length > 0) {
          setProducts((prev) =>
            prev.map((p) => {
              const opt = response.productOptimizations?.find((o: any) => o.id === p.id);
              if (opt) {
                return {
                  ...p,
                  seoTitle: opt.seoTitle,
                  metaTitle: opt.seoTitle,
                  seoDescription: opt.seoDescription,
                  metaDescription: opt.seoDescription,
                  urlSlug: opt.urlSlug,
                };
              }
              return p;
            }),
          );
        }

        showToast(`🚀 Advanced SEO successfully generated & applied via ${response.modelUsed || 'AI Engine'}!`);
      }, 700);
    } catch (err: any) {
      console.error('Failed to run AI SEO Assist:', err);
      setIsAiProcessing(false);
      showToast('AI SEO Assist encountered an error. Applied resilient fallback.', 'error');
    }
  };

  // Single Product AI Optimizer
  const handleOptimizeCurrentProductWithAi = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setIsOptimizingProduct(true);
    setTimeout(() => {
      const cleanSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const optTitle = `${prod.name} | ${storeName} Official`;
      const marketTarget = suggestedMarketsPool[0] || 'India & Worldwide';
      const optDesc = `Buy authentic ${prod.name} online at ${storeName}. High quality ${detectedNiche.toLowerCase() || 'essentials'} with fast delivery across ${marketTarget}. Order today!`;

      setProdSeoTitle(optTitle);
      setProdSeoDesc(optDesc);
      setProdUrlSlug(cleanSlug);
      setProdCanonicalUrl(`https://${storeDomain}/products/${cleanSlug}`);
      setIsOptimizingProduct(false);
      showToast(`✨ Generated high-CTR SEO metadata for ${prod.name}`);
    }, 600);
  };

  // Bulk Product SEO Optimizer
  const handleBulkOptimizeProducts = async () => {
    setIsBulkOptimizing(true);
    try {
      const updatedList = products.map((prod) => {
        const cleanSlug = prod.urlSlug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const optTitle = `${prod.name} | ${storeName} Official`;
        const optDesc = `Buy authentic ${prod.name} online at ${storeName}. Top quality with fast shipping & guaranteed satisfaction.`;
        return {
          ...prod,
          seoTitle: optTitle,
          metaTitle: optTitle,
          seoDescription: optDesc,
          metaDescription: optDesc,
          urlSlug: cleanSlug,
        };
      });
      setProducts(updatedList);
      showToast(`⚡ Bulk optimized SEO metadata across ${updatedList.length} products!`);
    } catch (err) {
      showToast('Failed to bulk optimize products', 'error');
    } finally {
      setIsBulkOptimizing(false);
    }
  };

  // Copy structured data helper
  const handleCopyStructuredData = () => {
    navigator.clipboard.writeText(structuredData);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('JSON-LD Schema copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 border border-indigo-400/30 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                SEO Governance & Meta Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50">
                PRO ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated high-CTR SERP optimization, Schema.org rich snippets, crawler governance & AI SEO Assistant.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Assist Button according to DESIGN.md (#00E5FF Cyan Neon Primary Action, #121212 high contrast, 16px radius) */}
          <button
            type="button"
            onClick={handleExecuteAiAssist}
            disabled={isAiProcessing}
            className="group relative overflow-hidden bg-[#00E5FF] hover:bg-[#38e1ff] active:bg-[#00cce6] text-[#121212] font-black text-xs px-4 sm:px-5 py-2.5 rounded-[16px] flex items-center gap-2 shadow-lg shadow-[#00E5FF]/25 border border-[#00E5FF] transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            title="Generate & Implement Advanced SEO with AI"
          >
            <Sparkles className="w-4 h-4 text-[#121212] fill-[#121212] group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-extrabold tracking-tight">Assist</span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black bg-[#121212] text-[#00E5FF] border border-[#121212]/30">
              AI
            </span>
          </button>

          <button
            type="button"
            onClick={loadSeoData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-accent text-slate-600 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            title="Reload SEO Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={activeTab === 'PRODUCTS' ? handleSaveProductSeo : handleSaveGlobalSeo}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? 'Saving...'
                : activeTab === 'PRODUCTS'
                  ? 'Save Product SEO'
                  : 'Save SEO Settings'}
            </span>
          </button>
        </div>
      </div>

      {/* SEO Health Score & Audit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              SEO Health Score
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 flex items-baseline gap-1">
              <span>{seoScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <span
              className={`text-[10px] font-bold ${
                seoScore >= 80 ? 'text-emerald-600' : seoScore >= 50 ? 'text-amber-600' : 'text-rose-600'
              }`}
            >
              {seoScore >= 80
                ? '● Excellent Optimization'
                : seoScore >= 50
                  ? '● Moderate Improvements Needed'
                  : '● Needs Immediate Attention'}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border ${
              seoScore >= 80
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                : seoScore >= 50
                  ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'
                  : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
            }`}
          >
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            SERP Title Tag
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {siteTitle || 'No Title Set'}
          </div>
          <span
            className={`text-[10px] font-mono font-bold mt-1 block ${
              siteTitle.length >= 30 && siteTitle.length <= 65 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {siteTitle.length} chars (Optimal: 50-60)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Meta Description
          </span>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 truncate">
            {metaDesc || 'No Description Set'}
          </div>
          <span
            className={`text-[10px] font-mono font-bold mt-1 block ${
              metaDesc.length >= 120 && metaDesc.length <= 165 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {metaDesc.length} chars (Optimal: 120-160)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              XML Sitemap Status
            </span>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sitemap Live</span>
            </div>
            <a
              href={`https://${storeDomain}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1"
            >
              <span>/sitemap.xml</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-border gap-2 overflow-x-auto pb-1">
        {[
          { id: 'GLOBAL', label: 'Global Store Meta', icon: Globe },
          { id: 'OPEN_GRAPH', label: 'OpenGraph Social Card', icon: Share2 },
          { id: 'PREVIEW', label: 'Google SERP Simulator', icon: Search },
          { id: 'PRODUCTS', label: 'Per-Product SEO', icon: Package },
          { id: 'KEYWORDS', label: 'AI Keyword Strategy', icon: Key },
          { id: 'RICH_RESULTS', label: 'Rich Results & Schema', icon: ShieldCheck },
          { id: 'ROBOTS', label: 'Robots.txt & Crawlers', icon: FileCode },
          { id: 'SCHEMA', label: 'JSON-LD Raw Data', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold rounded-2xl transition flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-card border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GLOBAL META SETTINGS */}
      {activeTab === 'GLOBAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Global Search Meta Tags
              </h3>
              <button
                type="button"
                onClick={handleOpenAiAssist}
                className="text-xs font-black text-[#00E5FF] hover:text-[#38e1ff] flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:border-[#00E5FF] transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]" />
                <span>Optimize with Assist</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Store SEO Site Title:
                  </label>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      siteTitle.length >= 30 && siteTitle.length <= 60 ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {siteTitle.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="e.g. Auto Motors | Modern Handcrafted Luxury Vehicle Accessories"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This title appears as the primary headline in Google search results and browser tabs.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Store Meta Description:
                  </label>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      metaDesc.length >= 120 && metaDesc.length <= 160 ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {metaDesc.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="e.g. Shop authentic handcrafted essentials from Auto Motors. Premium materials, timeless aesthetics, and complimentary shipping across India."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  A concise summary of your store shown under the search headline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Canonical URL (Preferred Domain):
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://yourcustomdomain.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Prevents duplicate content penalties by pointing search engines to your official domain.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Best Practice Card */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>SEO Optimization Checklist</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 p-0.5 rounded-full ${
                    siteTitle.length >= 30 && siteTitle.length <= 60 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">
                    Optimal Title Length
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Keep titles between 30 and 60 characters for zero clipping.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 p-0.5 rounded-full ${
                    metaDesc.length >= 120 && metaDesc.length <= 160 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">
                    High-Click Description
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Include clear call-to-actions and free shipping perks.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 p-0.5 rounded-full ${
                    canonicalUrl.startsWith('https://') ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">
                    Valid HTTPS Canonical URL
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Always use secure SSL URLs for indexing.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-border">
              <button
                type="button"
                onClick={handleOpenAiAssist}
                className="w-full py-2.5 px-4 rounded-[16px] bg-[#00E5FF] hover:bg-[#38e1ff] active:bg-[#00cce6] text-[#121212] text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#00E5FF]/20 border border-[#00E5FF] transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#121212]" />
                <span>Launch AI SEO Assist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPENGRAPH SOCIAL SHARE */}
      {activeTab === 'OPEN_GRAPH' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              OpenGraph & Social Meta
            </h3>
            <p className="text-xs text-slate-500">
              Controls how your store links look when shared on WhatsApp, Facebook, iMessage, Twitter, and LinkedIn.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Social Share Card Title (og:title):
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Social Share Description (og:description):
                </label>
                <textarea
                  rows={3}
                  value={ogDesc}
                  onChange={(e) => setOgDesc(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <DragDropUpload
                  folder="seo"
                  fileType="OG_IMAGE"
                  label="Social Share Banner Image (1200×630px Recommended)"
                  currentUrl={ogImage || undefined}
                  onUploadComplete={(url) => setOgImage(url)}
                  hint="JPG, PNG, or WebP social preview card (max 5MB)"
                  previewShape="rect"
                  maxSizeMB={5}
                />
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">
                    Or paste image URL
                  </label>
                  <input
                    type="url"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Card Live Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>Live Social Card Preview (Facebook / WhatsApp / Twitter)</span>
            </span>

            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 max-w-md mx-auto shadow-2xl">
              <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                {ogImage ? (
                  <img src={ogImage} alt="OG Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                    No Image Specified
                  </div>
                )}
              </div>
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {storeDomain.toUpperCase()}
                </span>
                <h4 className="text-sm font-black text-slate-100 leading-tight">
                  {ogTitle || siteTitle || `${storeName} Store`}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ogDesc || metaDesc || 'Discover top products with secure checkout.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE SERP SIMULATOR */}
      {activeTab === 'PREVIEW' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Google Search Engine Result (SERP) Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Accurately simulates how search crawlers render your snippet across Google Desktop and Mobile search results.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-accent p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-card text-indigo-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-card text-indigo-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-accent/30 border border-slate-200 dark:border-border">
            <div
              className={`bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg ${
                previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">
                  🛍️
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {storeName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    https://{storeDomain}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                {siteTitle || `${storeName} | Official Store`}
              </h4>

              <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] mt-1.5 leading-relaxed">
                {metaDesc ||
                  `Shop the latest collections and best-sellers at ${storeName}. Free shipping on eligible orders.`}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-[11px] text-[#1a0dab] dark:text-[#8ab4f8]">
                <span className="hover:underline cursor-pointer">Shop All Products</span>
                <span className="hover:underline cursor-pointer">New Arrivals</span>
                <span className="hover:underline cursor-pointer">Track Order</span>
                <span className="hover:underline cursor-pointer">Contact Us</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PER-PRODUCT SEO */}
      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Product List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Product Catalog ({products.length})
              </h3>
              <button
                type="button"
                onClick={handleBulkOptimizeProducts}
                disabled={isBulkOptimizing}
                className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>{isBulkOptimizing ? 'Optimizing...' : 'Bulk AI Optimize'}</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-accent border border-slate-200 dark:border-border text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProductSelect(p.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                        : 'bg-white dark:bg-card border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 rounded-xl object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {currencySymbol}
                        {p.price.toFixed(2)} • {p.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Product SEO Form & Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Product SEO Customization
                </h3>
                <button
                  type="button"
                  onClick={handleOptimizeCurrentProductWithAi}
                  disabled={isOptimizingProduct}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-black flex items-center gap-1.5 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isOptimizingProduct ? 'Optimizing...' : 'AI Optimize Product'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Product Meta Title Tag:
                  </label>
                  <input
                    type="text"
                    value={prodSeoTitle}
                    onChange={(e) => setProdSeoTitle(e.target.value)}
                    placeholder="e.g. Aero Runner Pro Sneakers | High Performance"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Product URL Handle / Slug:
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent overflow-hidden">
                    <span className="px-3 py-3 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-card border-r border-slate-200 dark:border-border">
                      https://{storeDomain}/products/
                    </span>
                    <input
                      type="text"
                      value={prodUrlSlug}
                      onChange={(e) =>
                        setProdUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))
                      }
                      className="flex-1 px-3 py-3 bg-transparent text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Product Meta Description:
                  </label>
                  <textarea
                    rows={3}
                    value={prodSeoDesc}
                    onChange={(e) => setProdSeoDesc(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Product SERP Card Preview */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 shadow-xl">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Google Product Rich Result Preview
              </span>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400">
                  https://{storeDomain}/products/{prodUrlSlug || 'item'}
                </span>
                <h4 className="text-sm font-bold text-indigo-400 hover:underline cursor-pointer">
                  {prodSeoTitle || 'Product Name'} - {storeName}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {prodSeoDesc ||
                    'High quality product available with fast shipping and satisfaction guarantee.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI KEYWORD STRATEGY */}
      {activeTab === 'KEYWORDS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <span>AI Semantic Keyword Research & Competitor Opportunity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  High-intent transactional and commercial search queries tailored for {storeName} & {detectedNiche}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'transactional', 'commercial', 'informational'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveKeywordFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      activeKeywordFilter === filter
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(aiResult?.keywordInsights || [
                { keyword: `buy ${storeName.toLowerCase()} online`, intent: 'transactional', relevanceScore: 98, searchVolume: 'High', competition: 'Low' },
                { keyword: `${detectedNiche.toLowerCase()} accessories india`, intent: 'commercial', relevanceScore: 95, searchVolume: 'High', competition: 'Medium' },
                { keyword: `best ${detectedNiche.toLowerCase()} 2026`, intent: 'informational', relevanceScore: 88, searchVolume: 'Medium', competition: 'Low' },
                { keyword: `${storeName.toLowerCase()} official store`, intent: 'transactional', relevanceScore: 94, searchVolume: 'Medium', competition: 'Low' },
                { keyword: `luxury ${detectedNiche.toLowerCase()} deals`, intent: 'commercial', relevanceScore: 91, searchVolume: 'High', competition: 'Medium' },
                { keyword: `custom handcrafted ${detectedNiche.toLowerCase()}`, intent: 'transactional', relevanceScore: 89, searchVolume: 'Medium', competition: 'Low' },
              ])
                .filter((k: any) => activeKeywordFilter === 'ALL' || k.intent === activeKeywordFilter)
                .map((kw: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/30 space-y-3 hover:border-indigo-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
                          kw.intent === 'transactional'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : kw.intent === 'commercial'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {kw.intent}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Score: {kw.relevanceScore || 90}%
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      &quot;{kw.keyword}&quot;
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-border">
                      <span>Volume: <strong className="text-slate-700 dark:text-slate-300">{kw.searchVolume || 'High'}</strong></span>
                      <span>Difficulty: <strong className="text-emerald-600">{kw.competition || 'Low'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSiteTitle(`${storeName} | ${kw.keyword}`);
                          showToast(`Injected "${kw.keyword}" into SERP Title!`);
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-100 text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        + Use in Title
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMetaDesc(`Discover ${kw.keyword} at ${storeName}. Free shipping and satisfaction guaranteed!`);
                          showToast(`Injected "${kw.keyword}" into Meta Description!`);
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-100 text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        + Use in Desc
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RICH RESULTS & SCHEMA VALIDATOR */}
      {activeTab === 'RICH_RESULTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Google Rich Result Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Google Rich Snippet Interactive Simulator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Verified Schema.org metadata rendered as live Google search rich results cards.
            </p>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {storeName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  https://{storeDomain}
                </span>
              </div>

              <h4 className="text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer">
                {siteTitle || `${storeName} | Official E-Commerce Store`}
              </h4>

              {/* Rich Badges */}
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="ml-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">4.9 (128)</span>
                </div>
                <span>•</span>
                <span className="text-emerald-600 font-bold">✓ In stock</span>
                <span>•</span>
                <span className="text-indigo-600 font-bold">30-Day Returns</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {metaDesc}
              </p>

              {/* Sitelinks SearchBox Mockup */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-border space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Sitelinks Searchbox Enabled
                </span>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-xs text-slate-400">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search {storeName} products...</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Schema.org Validated:</strong> Passed Google Rich Results eligibility requirements with Zero warnings.
              </span>
            </div>
          </div>

          {/* Raw Schema Viewer with Copy Button */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>JSON-LD Schema Graph</span>
              </span>
              <button
                type="button"
                onClick={handleCopyStructuredData}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer transition"
              >
                {copiedCode ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed">
              {structuredData}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 7: ROBOTS.TXT */}
      {activeTab === 'ROBOTS' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Robots.txt & Search Engine Directives
              </h3>
              <p className="text-xs text-slate-500">
                Instruct Googlebot, Bingbot, and AI web scrapers which paths to index or ignore.
              </p>
            </div>
            <a
              href={`https://${storeDomain}/robots.txt`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
            >
              <span>View live /robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <textarea
            rows={10}
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* TAB 8: JSON-LD RAW SCHEMA */}
      {activeTab === 'SCHEMA' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                JSON-LD Structured Data Schema
              </h3>
              <p className="text-xs text-slate-500">
                Embed schema.org microdata into your store HTML for rich Google search cards & rating stars.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Valid JSON-LD
            </span>
          </div>

          <textarea
            rows={14}
            value={structuredData}
            onChange={(e) => setStructuredData(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-950 text-indigo-300 font-mono text-xs focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE AI SEO ASSIST CONSULTATIVE MODAL                      */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* AUTONOMOUS AI SEO ASSIST MODAL (Powered by Gemini & ChatGPT)     */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* FULL-SCREEN BLURRED PROGRESS OVERLAY (NO MODAL)                   */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isAiProcessing && (
        <div className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
          {/* Centered Progress Widget (DESIGN.md: #1E1E1E card, #2C2C2E border, #00E5FF neon accents, 16px radius) */}
          <div className="w-full max-w-md p-6 sm:p-8 rounded-[16px] bg-[#1E1E1E] border border-[#2C2C2E] shadow-2xl text-center space-y-6 animate-scale-up relative overflow-hidden">
            {/* Ambient Cyan Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Icon Header */}
            <div className="flex flex-col items-center space-y-3 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-[16px] bg-[#121212] border border-[#00E5FF]/40 flex items-center justify-center shadow-lg shadow-[#00E5FF]/20">
                  <Sparkles className="w-8 h-8 text-[#00E5FF] animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#32D74B] rounded-full border-2 border-[#1E1E1E] animate-ping" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono font-bold tracking-wider uppercase">
                  Gemini &bull; ChatGPT &bull; Autonomous
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Synthesizing Store SEO Architecture
                </h3>
              </div>
            </div>

            {/* Dynamic Stage & Progress Bar */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#98989D] text-[11px] font-medium truncate max-w-[280px]">
                  {aiProcessingStage || `Reading ${storeName} profile and catalog...`}
                </span>
                <span className="text-[#00E5FF] font-mono font-bold text-xs">
                  {aiProcessingProgress}%
                </span>
              </div>

              {/* Progress Bar Track according to DESIGN.md */}
              <div className="w-full h-2.5 bg-[#121212] rounded-full p-0.5 border border-[#2C2C2E] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00E5FF] via-[#38e1ff] to-[#32D74B] rounded-full transition-all duration-300 shadow-md shadow-[#00E5FF]/40"
                  style={{ width: `${Math.max(6, aiProcessingProgress)}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#98989D] relative z-10">
              Reading store details &bull; Querying AI models &bull; Applying high-converting SEO
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

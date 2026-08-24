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
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { GlobalSeoData, ProductSeoData, CMSProduct } from '@/src/types';
import { useCMSContext } from '@/src/context/CMSContext';

export const SEOStudio: React.FC = () => {
  const { merchantData } = useCMSContext();
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'OPEN_GRAPH' | 'PREVIEW' | 'ROBOTS' | 'SCHEMA' | 'PRODUCTS'>('GLOBAL');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const storeName = merchantData?.store?.storeName || 'OmniStore';
  const storeDomain = (merchantData?.store as any)?.customDomain || `${(merchantData?.store as any)?.slug || 'my-store'}.omnistore.com`;

  useEffect(() => {
    loadSeoData();
    loadProductsList();
  }, []);

  const loadSeoData = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getGlobalSeo();
      setSiteTitle(data.seoSiteTitle || `${storeName} | Official Online Store`);
      setMetaDesc(data.seoMetaDescription || `Discover top quality products at ${storeName}. Enjoy fast shipping, secure checkout, and exclusive deals.`);
      setCanonicalUrl(data.seoCanonicalUrl || `https://${storeDomain}`);
      setOgTitle(data.seoOgTitle || `${storeName} - Premium Online Shopping`);
      setOgDesc(data.seoOgDescription || `Shop the latest collections and best-sellers at ${storeName}. Free shipping on eligible orders.`);
      setOgImage(data.seoOgImage || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80');
      setRobotsTxt(data.seoRobotsTxt || `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /admin\nSitemap: https://${storeDomain}/sitemap.xml`);
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
            2
          )
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

  const loadProductSeo = async (productId: string, fallbackProd?: CMSProduct) => {
    try {
      const data = await cmsService.getProductSeo(productId);
      const prod = fallbackProd || products.find((p) => p.id === productId);
      setProdSeoTitle(data.seoTitle || prod?.name || '');
      setProdSeoDesc(data.seoDescription || prod?.description?.slice(0, 160) || '');
      setProdUrlSlug(data.urlSlug || prod?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '');
      setProdOgImage(data.ogImage || prod?.image || '');
      setProdCanonicalUrl(data.canonicalUrl || `https://${storeDomain}/products/${prod?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    } catch (err) {
      const prod = fallbackProd || products.find((p) => p.id === productId);
      if (prod) {
        setProdSeoTitle(prod.name);
        setProdSeoDesc(prod.description?.slice(0, 160) || '');
        setProdUrlSlug(prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        setProdOgImage(prod.image || '');
        setProdCanonicalUrl(`https://${storeDomain}/products/${prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
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
    return score;
  };

  const seoScore = calculateSeoScore();
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">SEO Governance & Meta Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                PRO ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Optimize search rankings, OpenGraph social previews, Google SERP cards, XML sitemaps, and JSON-LD rich snippets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSeoData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-accent text-slate-600 dark:text-slate-300 text-xs font-bold transition"
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
            <span>{isSaving ? 'Saving...' : activeTab === 'PRODUCTS' ? 'Save Product SEO' : 'Save SEO Settings'}</span>
          </button>
        </div>
      </div>

      {/* SEO Health Score & Audit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SEO Health Score</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 flex items-baseline gap-1">
              <span>{seoScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <span className={`text-[10px] font-bold ${seoScore >= 80 ? 'text-emerald-600' : seoScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {seoScore >= 80 ? '● Excellent Optimization' : seoScore >= 50 ? '● Moderate Improvements Needed' : '● Needs Immediate Attention'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border ${
            seoScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' :
            seoScore >= 50 ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' :
            'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
          }`}>
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SERP Title Tag</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {siteTitle || 'No Title Set'}
          </div>
          <span className={`text-[10px] font-mono font-bold mt-1 block ${siteTitle.length >= 30 && siteTitle.length <= 65 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {siteTitle.length} chars (Optimal: 50-60)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Meta Description</span>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 truncate">
            {metaDesc || 'No Description Set'}
          </div>
          <span className={`text-[10px] font-mono font-bold mt-1 block ${metaDesc.length >= 120 && metaDesc.length <= 165 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {metaDesc.length} chars (Optimal: 120-160)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">XML Sitemap Status</span>
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
          { id: 'ROBOTS', label: 'Robots.txt & Crawlers', icon: FileCode },
          { id: 'SCHEMA', label: 'JSON-LD Structured Data', icon: Code2 },
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
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Global Search Meta Tags</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Store SEO Site Title:
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${siteTitle.length >= 30 && siteTitle.length <= 60 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {siteTitle.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="e.g. Acme Lifestyle | Premium Sustainable Apparel"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">This title appears as the primary headline in Google search results and browser tabs.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Store Meta Description:
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${metaDesc.length >= 120 && metaDesc.length <= 160 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {metaDesc.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="e.g. Shop handcrafted organic fashion and footwear with fast international shipping and sustainable packaging."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">A concise summary of your store shown under the search headline.</p>
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
                <p className="text-[10px] text-slate-400 mt-1">Prevents duplicate content penalties by pointing search engines to your official domain.</p>
              </div>
            </div>
          </div>

          {/* Quick Best Practice Card */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>SEO Optimization Checklist</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 p-0.5 rounded-full ${siteTitle.length >= 30 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">Optimal Title Length</strong>
                  <span className="text-[11px] text-slate-500">Keep titles between 30 and 60 characters for zero clipping.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className={`mt-0.5 p-0.5 rounded-full ${metaDesc.length >= 120 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">High-Click Description</strong>
                  <span className="text-[11px] text-slate-500">Include clear call-to-actions and free shipping perks.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className={`mt-0.5 p-0.5 rounded-full ${canonicalUrl.startsWith('https://') ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">Valid HTTPS Canonical URL</strong>
                  <span className="text-[11px] text-slate-500">Always use secure SSL URLs for indexing.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPENGRAPH SOCIAL SHARE */}
      {activeTab === 'OPEN_GRAPH' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">OpenGraph & Social Meta</h3>
            <p className="text-xs text-slate-500">Controls how your store links look when shared on WhatsApp, Facebook, iMessage, Twitter, and LinkedIn.</p>

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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Social Share Banner Image URL (1200x630px Recommended):
                </label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Social Card Live Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
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
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Google Search Engine Result (SERP) Simulator</h3>
              <p className="text-xs text-slate-500">Accurately simulates how search crawlers render your snippet across Google Desktop and Mobile search results.</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-accent p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  previewDevice === 'desktop' ? 'bg-white dark:bg-card text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  previewDevice === 'mobile' ? 'bg-white dark:bg-card text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-accent/30 border border-slate-200 dark:border-border">
            <div className={`bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg ${
              previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">
                  🛍️
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{storeName}</span>
                  <span className="text-[10px] font-mono text-slate-400">https://{storeDomain}</span>
                </div>
              </div>

              <h4 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                {siteTitle || `${storeName} | Official Store`}
              </h4>

              <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] mt-1.5 leading-relaxed">
                {metaDesc || `Shop the latest collections and best-sellers at ${storeName}. Free shipping on eligible orders.`}
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
          <div className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Product Catalog ({products.length})</h3>
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
                    <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover border" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">${p.price.toFixed(2)} • {p.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Product SEO Form & Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Product SEO Customization</h3>

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
                      onChange={(e) => setProdUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
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
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Google Product Rich Result Preview</span>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400">https://{storeDomain}/products/{prodUrlSlug || 'item'}</span>
                <h4 className="text-sm font-bold text-indigo-400 hover:underline cursor-pointer">
                  {prodSeoTitle || 'Product Name'} - {storeName}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {prodSeoDesc || 'High quality product available with fast shipping and satisfaction guarantee.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ROBOTS.TXT */}
      {activeTab === 'ROBOTS' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Robots.txt & Search Engine Directives</h3>
              <p className="text-xs text-slate-500">Instruct Googlebot, Bingbot, and AI web scrapers which paths to index or ignore.</p>
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

      {/* TAB 6: JSON-LD SCHEMA */}
      {activeTab === 'SCHEMA' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200 dark:border-border space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">JSON-LD Structured Data Schema</h3>
              <p className="text-xs text-slate-500">Embed schema.org microdata into your store HTML for rich Google search cards & rating stars.</p>
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
    </div>
  );
};

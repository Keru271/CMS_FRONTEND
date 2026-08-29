'use client';

import React, { useState, useEffect } from 'react';
import { CMSPageData, PageFormData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { PageBuilderStudio } from '@/src/components/cms/PageBuilderStudio';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  RefreshCw,
  ExternalLink,
  X,
  FileCode,
  Shield,
  Layers,
  HelpCircle,
  FileCheck,
  LayoutTemplate,
  Monitor,
  Tablet as TabletIcon,
  Smartphone,
} from 'lucide-react';

export const PageManager: React.FC = () => {
  const [pages, setPages] = useState<CMSPageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'SYSTEM' | 'BRAND' | 'POLICY' | 'CUSTOM' | 'DRAFT'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://serene-croissant-868f08.netlify.app';

  // Page Builder States
  const [isPageBuilderOpen, setIsPageBuilderOpen] = useState(false);
  const [builderEditingPage, setBuilderEditingPage] = useState<CMSPageData | null>(null);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPageData | null>(null);
  const [previewPage, setPreviewPage] = useState<CMSPageData | null>(null);
  const [previewMode, setPreviewMode] = useState<'live' | 'mock'>('live');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    pageType: 'CUSTOM',
    metaTitle: '',
    metaDescription: '',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getPages();
      setPages(data);
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingPage(null);
    setModalError(null);
    setFormData({
      title: '',
      slug: '/pages/',
      content: '<h2>New Page Title</h2>\n<p>Write your custom page content here using HTML or formatted text...</p>',
      pageType: 'CUSTOM',
      metaTitle: '',
      metaDescription: '',
      status: 'PUBLISHED',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (page: CMSPageData) => {
    setEditingPage(page);
    setModalError(null);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      pageType: page.pageType,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      status: page.status,
    });
    setIsEditModalOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!editingPage) {
      const generatedSlug = `/pages/${newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')}`;
      setFormData({
        ...formData,
        title: newTitle,
        slug: generatedSlug,
        metaTitle: `${newTitle} | OmniStore`,
      });
    } else {
      setFormData({ ...formData, title: newTitle });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);
    const normalizedPayload: PageFormData = {
      ...formData,
      slug: (formData.slug || '').toLowerCase().trim(),
    };
    try {
      if (editingPage) {
        await cmsService.updatePage(editingPage.id, normalizedPayload);
        showToast(`Page "${formData.title}" updated successfully!`, 'success');
      } else {
        await cmsService.createPage(normalizedPayload);
        showToast(`Custom Page "${formData.title}" created!`, 'success');
      }
      setIsEditModalOpen(false);
      await loadPages();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save page.';
      setModalError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (page: CMSPageData) => {
    if (page.pageType === 'SYSTEM') {
      alert('System core pages cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete the page "${page.title}"?`)) {
      try {
        await cmsService.deletePage(page.id);
        showToast(`Page "${page.title}" deleted.`, 'success');
        await loadPages();
      } catch (err) {
        showToast('Failed to delete page.', 'error');
      }
    }
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'DRAFT') return page.status === 'DRAFT';
    return page.pageType === activeTab;
  });

  const systemCount = pages.filter((p) => p.pageType === 'SYSTEM').length;
  const brandCount = pages.filter((p) => p.pageType === 'BRAND').length;
  const policyCount = pages.filter((p) => p.pageType === 'POLICY').length;
  const customCount = pages.filter((p) => p.pageType === 'CUSTOM').length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Storefront Pages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Storefront Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {pages.length} Pages Configured
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400" />
              <span>Pages & Custom Page Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Manage system routes (Home, Catalog, Cart, Checkout, 404), policy pages (Privacy, Terms, Shipping, Refund), brand pages (About, Contact, FAQ), and create custom merchant landing pages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setBuilderEditingPage(null);
                setIsPageBuilderOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 shadow-lg backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <LayoutTemplate className="w-4 h-4 text-indigo-300" />
              <span>Visual Page Builder</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Page</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-700/60">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Pages</span>
            <span className="text-xl font-black text-white">{systemCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand Pages</span>
            <span className="text-xl font-black text-indigo-300">{brandCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Legal & Policies</span>
            <span className="text-xl font-black text-amber-300">{policyCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Merchant</span>
            <span className="text-xl font-black text-emerald-300">{customCount}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categorized Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {[
            { id: 'ALL', label: `All Pages (${pages.length})` },
            { id: 'SYSTEM', label: `System (${systemCount})` },
            { id: 'BRAND', label: `Brand (${brandCount})` },
            { id: 'POLICY', label: `Policies (${policyCount})` },
            { id: 'CUSTOM', label: `Custom (${customCount})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-accent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* PAGES TABLE & CARDS LIST */}
      <div className="rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-accent/40 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">Page Title</th>
                <th className="py-4 px-4">URL Slug Route</th>
                <th className="py-4 px-4">Category Type</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border text-xs">
              {filteredPages.map((page) => {
                const isSystem = page.pageType === 'SYSTEM';

                return (
                  <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-accent/30 transition-colors">
                    {/* Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            isSystem
                              ? 'bg-blue-50 text-blue-600'
                              : page.pageType === 'POLICY'
                                ? 'bg-amber-50 text-amber-600'
                                : page.pageType === 'BRAND'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {isSystem ? (
                            <Layers className="w-4 h-4" />
                          ) : page.pageType === 'POLICY' ? (
                            <Shield className="w-4 h-4" />
                          ) : page.pageType === 'BRAND' ? (
                            <FileCheck className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-foreground block text-sm">
                            {page.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                            {page.metaTitle || page.title}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center gap-1">
                        <span>{page.slug}</span>
                        <a
                          href={`${STOREFRONT_URL}${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-600 transition"
                          title="Open on Live Storefront"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* Category Type */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isSystem
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : page.pageType === 'POLICY'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : page.pageType === 'BRAND'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {page.pageType}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${
                          page.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            page.status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{page.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewPage(page)}
                          title="Preview Page"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBuilderEditingPage(page);
                            setIsPageBuilderOpen(true);
                          }}
                          title="Open Visual Block Page Builder"
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                        >
                          <LayoutTemplate className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(page)}
                          title="Edit Content & SEO"
                          className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {!isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeletePage(page)}
                            title="Delete Custom Page"
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PAGE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New Custom Page'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure page content, URL handle, type, and search engine metadata.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Modal Error Banner */}
              {modalError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError(null)}
                    className="p-1 text-rose-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Page Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Sustainability & Eco Pledge"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    URL Slug Handle <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="/pages/my-custom-page"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-mono font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Page Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Page Category Type</label>
                  <select
                    value={formData.pageType}
                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                    disabled={editingPage?.pageType === 'SYSTEM'}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CUSTOM">Custom Merchant Page</option>
                    <option value="BRAND">Brand & Support Page (About, FAQ, Contact)</option>
                    <option value="POLICY">Legal Policy Page (Privacy, Terms, Shipping)</option>
                    <option value="SYSTEM">System Core Page</option>
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PUBLISHED">Published (Visible on Storefront)</option>
                    <option value="DRAFT">Draft (Hidden from Storefront)</option>
                  </select>
                </div>
              </div>

              {/* Visual Page Builder Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200/80 dark:border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <LayoutTemplate className="w-4 h-4 text-purple-600" />
                    <span>Visual Page Content & Design</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Design and edit page sections, heroes, products, banners, and layouts visually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetPage = editingPage || ({
                      ...formData,
                      id: '',
                    } as any);
                    setIsEditModalOpen(false);
                    setBuilderEditingPage(targetPage);
                    setIsPageBuilderOpen(true);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>Open Visual Page Builder</span>
                </button>
              </div>

              {/* SEO METADATA SETTINGS CARD */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 space-y-4">
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Search Engine Optimization (SEO) Metadata</span>
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">Meta Title</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(formData.metaTitle || '').length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={formData.metaTitle || ''}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Page Title | Store Name"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">Meta Description</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(formData.metaDescription || '').length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={160}
                      value={formData.metaDescription || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Summarize this page content for search engines..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                    />
                  </div>

                  {/* Google Search Result Preview Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Google Search Result Preview
                    </span>
                    <span className="text-xs font-extrabold text-blue-700 truncate block">
                      {formData.metaTitle || formData.title || 'Page Title'}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 block">
                      {STOREFRONT_URL}{formData.slug.startsWith('/') ? formData.slug : '/' + formData.slug}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {formData.metaDescription || 'No meta description configured yet.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Page...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE / MOCK PAGE PREVIEW MODAL */}
      {previewPage && (() => {
        const rawSlug = previewPage.slug || '';
        const pageRoute = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;
        const liveUrl = `${STOREFRONT_URL}${pageRoute}`;

        const renderMockContent = (content: string) => {
          if (!content) return <p className="text-slate-400 italic">No content available for this page.</p>;
          const trimmed = content.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                return (
                  <div className="space-y-6">
                    {parsed.map((block: any, idx: number) => {
                      if (block.isVisible === false) return null;
                      return (
                        <div key={block.id || idx} className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {block.type?.replace(/_/g, ' ')}
                            </span>
                            {block.data?.title || block.data?.headline || block.data?.heading ? (
                              <span className="text-xs font-bold text-slate-700">
                                {block.data?.title || block.data?.headline || block.data?.heading}
                              </span>
                            ) : null}
                          </div>
                          {block.data?.subtitle && <p className="text-xs text-slate-600">{block.data.subtitle}</p>}
                          {block.data?.description && <p className="text-xs text-slate-600">{block.data.description}</p>}
                          {block.data?.html && <div className="prose prose-slate max-w-none text-xs" dangerouslySetInnerHTML={{ __html: block.data.html }} />}
                          {block.data?.buttonText && (
                            <span className="inline-block px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold mt-2">
                              {block.data.buttonText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }
            } catch {
              // fallback below
            }
          }
          return <div className="prose prose-slate max-w-none text-sm space-y-4" dangerouslySetInnerHTML={{ __html: content }} />;
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col animate-in fade-in">
            {/* Modal Top Bar */}
            <div className="h-14 px-4 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-indigo-600 font-black text-[10px] uppercase tracking-wider">
                  {previewPage.pageType} Page
                </span>
                <div>
                  <h3 className="font-black text-sm leading-tight">{previewPage.title}</h3>
                  <p className="text-[10px] text-indigo-300 font-mono truncate max-w-xs">{pageRoute}</p>
                </div>
              </div>

              {/* Mode Switcher: Live Storefront vs Visual Mock */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewMode('live')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === 'live' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Hosted Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mock')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === 'mock' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Canvas</span>
                </button>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'tablet', icon: TabletIcon, label: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                ].map((vp) => {
                  const Icon = vp.icon;
                  return (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => setPreviewViewport(vp.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        previewViewport === vp.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{vp.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {/* Open in new tab */}
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Open Live Tab</span>
                </a>

                {/* Quick Edit in Visual Page Builder */}
                <button
                  type="button"
                  onClick={() => {
                    const target = previewPage;
                    setPreviewPage(null);
                    setBuilderEditingPage(target);
                    setIsPageBuilderOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>Page Builder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPage(null)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Body with simulated browser chrome */}
            <div className="flex-1 overflow-hidden bg-slate-950 flex justify-center items-start p-4 sm:p-8">
              <div
                className={`bg-white overflow-hidden shadow-2xl rounded-2xl border border-slate-800 transition-all duration-300 h-full flex flex-col ${
                  previewViewport === 'desktop'
                    ? 'w-full'
                    : previewViewport === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[390px]'
                }`}
              >
                {/* Simulated browser address bar */}
                <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2 shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-0.5 text-[10px] font-mono text-slate-500 truncate flex items-center gap-1.5">
                    <span className="text-emerald-500">🔒</span>
                    <span className="truncate">{STOREFRONT_URL.replace(/^https?:\/\//, '')}{pageRoute}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                    {previewMode === 'live' ? 'Live Storefront' : 'Mock Preview'}
                  </span>
                </div>

                {/* Iframe or Mock Canvas */}
                {previewMode === 'live' ? (
                  <iframe
                    key={`${previewPage.id}-${pageRoute}`}
                    src={liveUrl}
                    className="w-full flex-1 border-0"
                    title={`${previewPage.title} Live Preview`}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex-1 overflow-y-auto bg-white text-slate-900 flex flex-col justify-between font-sans">
                    {/* Top utility announcement bar */}
                    <div className="w-full bg-[#1e2022] text-[#9ca3af] text-[11px] py-1.5 px-4 border-b border-[#2d3135] shrink-0">
                      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-amber-400 font-bold">⚡ 🚀 Free shipping on orders over $50!</span>
                          <span className="hidden md:inline text-slate-400">📞 +1 (800) 555-0199</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="cursor-pointer hover:text-white">❤️ Wishlist</span>
                          <span>|</span>
                          <span className="cursor-pointer hover:text-white">Sign In / Register</span>
                          <span>|</span>
                          <span className="text-white font-bold">USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Storefront Main Header */}
                    <header className="w-full bg-[#23272a] text-white py-3 px-4 shadow-md sticky top-0 z-20 shrink-0">
                      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow">
                            O
                          </div>
                          <div className="flex flex-col leading-none">
                            <span className="text-base sm:text-lg font-black tracking-tight uppercase">OmniStore Retail</span>
                            <span className="text-[8px] tracking-[0.2em] font-bold text-indigo-400 uppercase mt-0.5">FURNITURE & LIVING</span>
                          </div>
                        </div>

                        <div className="hidden md:flex flex-1 max-w-md mx-4">
                          <div className="flex items-center bg-white rounded-full p-1 w-full border border-slate-300">
                            <select className="bg-transparent text-slate-700 text-[11px] font-semibold px-2 py-1 outline-none border-r border-slate-200">
                              <option>All Categories</option>
                              <option>Living Room</option>
                              <option>Bedroom</option>
                              <option>Dining & Kitchen</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Search products, sofa, decor..."
                              className="flex-1 px-3 py-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                              readOnly
                            />
                            <button type="button" className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full font-bold text-xs">
                              Search
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold">
                          <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
                            <span className="text-sm">👤</span>
                            <span>Account</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                            <span>🛒 Bag</span>
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">0</span>
                          </div>
                        </div>
                      </div>
                    </header>

                    {/* Navigation Bar */}
                    <nav className="w-full bg-[#2a2f34] text-white border-b border-[#373e45] hidden sm:block shrink-0">
                      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center">
                          <span className="bg-indigo-600 text-white font-bold px-4 py-2.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            ☰ All Departments
                          </span>
                          <span className="px-3 py-2.5 text-slate-200 hover:text-amber-400 transition cursor-pointer">Home</span>
                          <span className="px-3 py-2.5 text-slate-200 hover:text-amber-400 transition cursor-pointer">Living Room</span>
                          <span className="px-3 py-2.5 text-slate-200 hover:text-amber-400 transition cursor-pointer">Bedroom</span>
                          <span className="px-3 py-2.5 text-slate-200 hover:text-amber-400 transition cursor-pointer">Dining & Kitchen</span>
                          <span className="px-3 py-2.5 text-slate-200 hover:text-amber-400 transition cursor-pointer">Office & Study</span>
                          <span className="px-3 py-2.5 text-slate-200 hover:text-amber-400 transition cursor-pointer">Collections</span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-400">Special Deals 🔥</span>
                      </div>
                    </nav>

                    {/* Main Page Article Container */}
                    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full">
                      {/* Breadcrumbs */}
                      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-slate-600">{previewPage.pageType === 'POLICY' ? 'Policies' : 'Pages'}</span>
                        <span>/</span>
                        <span className="text-indigo-600 font-bold">{previewPage.title}</span>
                      </nav>

                      {/* Header */}
                      <header className="mb-8 pb-6 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white bg-indigo-600">
                            {previewPage.pageType}
                          </span>
                          <span className="text-xs text-slate-400">Published on Live Storefront</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">{previewPage.title}</h1>
                        {previewPage.metaDescription && (
                          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">{previewPage.metaDescription}</p>
                        )}
                      </header>

                      {/* Content */}
                      <article className="p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs bg-white">
                        {renderMockContent(previewPage.content)}
                      </article>

                      {/* Support Help Banner */}
                      <div className="mt-10 p-6 sm:p-8 rounded-3xl border border-slate-200 bg-indigo-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <h4 className="font-bold text-sm text-slate-900">Have questions or need assistance?</h4>
                          <p className="text-xs text-slate-600">Our customer support concierge is always available to help.</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button type="button" className="px-4 py-2 text-white text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 transition shadow">
                            Contact Support
                          </button>
                          <button type="button" className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition">
                            Continue Shopping
                          </button>
                        </div>
                      </div>
                    </main>

                    {/* Storefront Footer */}
                    <footer className="w-full bg-[#181a1c] text-[#9ca3af] text-xs pt-12 pb-6 border-t border-[#26292d] mt-12 shrink-0">
                      <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        {/* Newsletter box */}
                        <div className="bg-[#23272a] rounded-2xl p-6 sm:p-8 mb-10 border border-[#2e3338] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="md:col-span-7 space-y-1">
                            <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">✉️ NEWSLETTER</span>
                            <h3 className="text-lg font-black text-white">Get 20% Off Your First Order</h3>
                            <p className="text-slate-400 text-xs">Subscribe to get special offers, design tips, and member drops.</p>
                          </div>
                          <div className="md:col-span-5 flex gap-2">
                            <input
                              type="email"
                              placeholder="Enter your email..."
                              className="flex-1 px-3 py-2 rounded-xl bg-white text-slate-900 text-xs placeholder:text-slate-400 outline-none"
                              readOnly
                            />
                            <button type="button" className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shrink-0">
                              Subscribe
                            </button>
                          </div>
                        </div>

                        {/* 4-column footer links */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-b border-[#26292d]">
                          <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Departments</h4>
                            <ul className="space-y-1 text-slate-400 text-[11px]">
                              <li>Living Room</li>
                              <li>Bedroom Suites</li>
                              <li>Kitchen & Dining</li>
                              <li>Lighting & Decor</li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Customer Care</h4>
                            <ul className="space-y-1 text-slate-400 text-[11px]">
                              <li>Track My Order</li>
                              <li>Shipping & Delivery</li>
                              <li>30-Day Returns</li>
                              <li>Contact Concierge</li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Company</h4>
                            <ul className="space-y-1 text-slate-400 text-[11px]">
                              <li>About Our Store</li>
                              <li>Design Journal</li>
                              <li>Privacy Policy</li>
                              <li>Terms & Conditions</li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Store Information</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              Official OmniStore Flagship. Crafted for modern mindful living.
                            </p>
                          </div>
                        </div>

                        {/* Copyright & Badges */}
                        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                          <p>© {new Date().getFullYear()} OmniStore Retail. All rights reserved.</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#23272a] rounded text-[10px] font-bold text-white border border-[#373e45]">VISA</span>
                            <span className="px-2 py-0.5 bg-[#23272a] rounded text-[10px] font-bold text-white border border-[#373e45]">MASTERCARD</span>
                            <span className="px-2 py-0.5 bg-[#23272a] rounded text-[10px] font-bold text-white border border-[#373e45]">AMEX</span>
                            <span className="px-2 py-0.5 bg-[#23272a] rounded text-[10px] font-bold text-white border border-[#373e45]">STRIPE</span>
                          </div>
                        </div>
                      </div>
                    </footer>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Visual Block Page Builder Studio */}
      {isPageBuilderOpen && (
        <PageBuilderStudio
          key={builderEditingPage?.id ? `edit-page-${builderEditingPage.id}` : `new-page-${Date.now()}`}
          initialPage={builderEditingPage}
          isOpen={isPageBuilderOpen}
          onClose={() => {
            setIsPageBuilderOpen(false);
            setBuilderEditingPage(null);
          }}
          onSaved={() => {
            loadPages();
            showToast('Storefront page updated with Visual Page Builder!', 'success');
          }}
        />
      )}
    </div>
  );
};

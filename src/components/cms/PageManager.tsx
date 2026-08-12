'use client';

import React, { useState, useEffect } from 'react';
import { CMSPageData, PageFormData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
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
  Code2,
} from 'lucide-react';

export const PageManager: React.FC = () => {
  const [pages, setPages] = useState<CMSPageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'SYSTEM' | 'BRAND' | 'POLICY' | 'CUSTOM' | 'DRAFT'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPageData | null>(null);
  const [previewPage, setPreviewPage] = useState<CMSPageData | null>(null);
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

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Page</span>
          </button>
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
                          href={`https://omnistore.com${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-600"
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

              {/* Rich Body Content Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    <span>Formatted HTML & Text Content</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          content: formData.content + '\n<h2>Subheading Title</h2>',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold"
                    >
                      + H2 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          content: formData.content + '\n<p>Paragraph description text goes here...</p>',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold"
                    >
                      + Paragraph
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<h1>Page Title</h1><p>Write your page content here...</p>"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                      https://omnistore.com{formData.slug}
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

      {/* LIVE PAGE PREVIEW MODAL */}
      {previewPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in">
          {/* Modal Top Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-600 font-black text-xs uppercase">
                {previewPage.pageType} Page
              </span>
              <h3 className="font-black text-base">{previewPage.title}</h3>
              <span className="text-xs font-mono text-indigo-300">https://omnistore.com{previewPage.slug}</span>
            </div>

            <button
              type="button"
              onClick={() => setPreviewPage(null)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Page Preview Body */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950">
            <div className="bg-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-4xl min-h-[600px] flex flex-col justify-between overflow-hidden">
              {/* Header Mock */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="font-black text-lg text-indigo-600">OmniStore Flagship</span>
                <span className="text-xs font-bold text-slate-500">Live Storefront Route: {previewPage.slug}</span>
              </div>

              {/* Rendered HTML Content */}
              <div className="p-8 sm:p-12 space-y-6 flex-1 text-slate-800">
                <div className="border-b border-slate-200 pb-4">
                  <h1 className="text-3xl font-black text-slate-900">{previewPage.title}</h1>
                  {previewPage.metaDescription && (
                    <p className="text-xs text-slate-500 mt-1">{previewPage.metaDescription}</p>
                  )}
                </div>

                <div
                  className="prose prose-slate max-w-none text-sm space-y-4"
                  dangerouslySetInnerHTML={{ __html: previewPage.content }}
                />
              </div>

              {/* Footer Mock */}
              <div className="p-6 bg-slate-900 text-slate-400 text-xs flex items-center justify-between border-t border-slate-800">
                <span>© {new Date().getFullYear()} OmniStore. All rights reserved.</span>
                <span>Powered by Next.js CMS Platform</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

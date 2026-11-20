'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Share2,
  Trash2,
  Copy,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import {
  websiteService,
  WebsitePage,
  UpdatePageSeoInput,
} from '@/src/services/websiteService';

interface PageSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: WebsitePage | null;
  storeDomain?: string;
  onPageUpdated: (updatedPage: WebsitePage) => void;
  onPageDeleted: (pageId: string) => void;
  onPageDuplicated: (newPage: WebsitePage) => void;
}

export function PageSeoModal({
  isOpen,
  onClose,
  page,
  storeDomain = 'mystore.com',
  onPageUpdated,
  onPageDeleted,
  onPageDuplicated,
}: PageSeoModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [activeTab, setActiveTab] = useState<'seo' | 'social'>('seo');

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setSeoTitle(page.seoTitle || page.title);
      setSeoDesc(page.seoDesc || `Explore ${page.title} at our store.`);
      setOgImage(page.ogImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80');
      setIsPublished(page.isPublished);
    }
  }, [page]);

  if (!isOpen || !page) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const input: UpdatePageSeoInput = {
        title: title.trim(),
        slug: page.isSystem ? undefined : slug.trim(),
        seoTitle: seoTitle.trim(),
        seoDesc: seoDesc.trim(),
        ogImage: ogImage.trim(),
        isPublished,
      };

      const updated = await websiteService.updatePageSeo(page.id, input);
      onPageUpdated(updated);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update page settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      const duplicated = await websiteService.duplicatePage(page.id);
      onPageDuplicated(duplicated);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to duplicate page');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (page.isSystem) return;
    if (!confirm(`Are you sure you want to permanently delete '${page.title}' (${page.slug})?`)) return;
    try {
      setIsDeleting(true);
      await websiteService.deletePage(page.id);
      onPageDeleted(page.id);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete page');
    } finally {
      setIsDeleting(false);
    }
  };

  const fullUrl = `https://${storeDomain}${slug === '/' ? '' : slug}`;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-xs overflow-hidden text-slate-900 font-sans">
        {/* HEADER */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Page Settings & SEO Metadata</h3>
                {page.isSystem && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> System Route
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Configure search engine tags, social previews, publish state, and URL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {/* GENERAL INFO ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                URL Slug {page.isSystem && <span className="text-amber-700 text-[10px] font-bold">(Locked)</span>}
              </label>
              <input
                type="text"
                disabled={page.isSystem}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono disabled:opacity-50 focus:ring-1 focus:ring-slate-900 shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status</label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full p-2 rounded-xl border flex items-center justify-between font-semibold transition-colors cursor-pointer ${
                  isPublished
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span>{isPublished ? 'Published' : 'Draft (Hidden)'}</span>
                {isPublished ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* TAB BAR (SEO VS SOCIAL) */}
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'seo'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Google Search Results (SERP)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'social'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                OpenGraph & Social Card
              </button>
            </div>

            {/* TAB 1: GOOGLE SERP PREVIEW */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">SEO Meta Title</label>
                    <span className="text-[10px] text-slate-500 font-mono">{seoTitle.length}/60 chars</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Search Title (Recommended under 60 chars)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-semibold">SEO Meta Description</label>
                    <span className="text-[10px] text-slate-500 font-mono">{seoDesc.length}/160 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Search Snippet (Recommended under 160 chars)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 resize-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                  />
                </div>

                {/* SERP PREVIEW CARD */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Live Google Search Snippet Preview
                  </span>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-mono truncate block">
                      {fullUrl}
                    </span>
                    <h4 className="text-base text-blue-700 font-semibold hover:underline cursor-pointer truncate">
                      {seoTitle || title} | {storeDomain}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {seoDesc || 'Explore our full collection, bespoke offerings, and fast shipping.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OPENGRAPH SOCIAL CARD PREVIEW */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    OpenGraph Image URL (1200x630 recommended)
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://.../preview.jpg"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-1 focus:ring-slate-900 shadow-2xs"
                  />
                </div>

                {/* SOCIAL CARD PREVIEW */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Social Card Share Preview (Facebook / X / LinkedIn)
                  </span>
                  <div className="max-w-md border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-md">
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      {ogImage ? (
                        <img src={ogImage} alt="Social Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          No Image Provided
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {storeDomain}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {seoTitle || title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {seoDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DANGER ZONE / ACTIONS ROW */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isDuplicating ? 'Duplicating...' : 'Duplicate Page'}</span>
              </button>

              {!page.isSystem && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Page'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Page Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

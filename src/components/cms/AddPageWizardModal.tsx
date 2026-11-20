'use client';

import React, { useState } from 'react';
import {
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  Check,
  Bot,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  websiteService,
  WebsitePage,
  SectionDefinition,
} from '@/src/services/websiteService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPageCreated: (page: WebsitePage) => void;
  sectionLibrary: SectionDefinition[];
}

export function AddPageWizardModal({ isOpen, onClose, onPageCreated, sectionLibrary }: Props) {
  const [templateMode, setTemplateMode] = useState<'ai' | 'library' | 'blank'>('ai');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [pageType, setPageType] = useState('custom');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedSectionTypes, setSelectedSectionTypes] = useState<string[]>([
    'hero',
    'featured_products',
  ]);

  // Optional SEO Metadata
  const [showAdvancedSeo, setShowAdvancedSeo] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [ogImage, setOgImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === `/${title.toLowerCase().replace(/\s+/g, '-')}`) {
      setSlug(`/${val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
    }
  };

  const toggleSectionType = (type: string) => {
    if (selectedSectionTypes.includes(type)) {
      setSelectedSectionTypes(selectedSectionTypes.filter((t) => t !== type));
    } else {
      setSelectedSectionTypes([...selectedSectionTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    try {
      setIsSubmitting(true);
      const cleanSlug = slug.startsWith('/') ? slug : `/${slug}`;
      const payload: any = {
        title: title.trim(),
        slug: cleanSlug,
        pageType,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDesc.trim() || undefined,
        ogImage: ogImage.trim() || undefined,
      };

      if (templateMode === 'ai' && aiPrompt.trim()) {
        payload.aiPrompt = aiPrompt.trim();
      } else if (templateMode === 'library') {
        payload.initialSectionTypes = selectedSectionTypes;
      }

      const created = await websiteService.createPage(payload);
      onPageCreated(created);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-xs overflow-hidden text-slate-900 font-sans">
        {/* HEADER */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">New Page Creation Wizard</h3>
              <p className="text-[11px] text-slate-500">
                Scaffold new Next.js pages with AI, pre-built section blocks, or a blank canvas
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
          {/* 1. TEMPLATE MODE TABS */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              1. Choose Creation Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTemplateMode('ai')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  templateMode === 'ai'
                    ? 'border-2 border-slate-900 bg-white shadow-xs text-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Flash AI
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">AI Generated</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Describe your page and let Gemini generate custom sections.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTemplateMode('library')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  templateMode === 'library'
                    ? 'border-2 border-slate-900 bg-white shadow-xs text-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Modular
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Section Library</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Assemble chosen blocks from our pre-built section library.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTemplateMode('blank')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  templateMode === 'blank'
                    ? 'border-2 border-slate-900 bg-white shadow-xs text-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileCode className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">Starter</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Blank Canvas</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Start clean with a minimal hero and build from scratch.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. BASIC PAGE ATTRIBUTES */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Page Identity & URL
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Page Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bridal Lookbook, Our Craft, FAQ"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Path (Slug)</label>
                <input
                  type="text"
                  placeholder="/bridal-lookbook"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Page Category / Type</label>
              <select
                value={pageType}
                onChange={(e) => setPageType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 capitalize focus:ring-1 focus:ring-slate-900 shadow-2xs"
              >
                {['custom', 'about', 'faq', 'lookbook', 'contact', 'landing', 'story'].map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. MODE-SPECIFIC PROMPT / SECTION SELECTOR */}
          {templateMode === 'ai' && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-slate-800" /> 3. Describe What Should Be on This Page
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 'Create an artisan craftsmanship page highlighting our 5-generation heritage, atelier embroidery process, customer quotes, and an appointment booking button.'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none leading-relaxed shadow-2xs"
                required
              />
            </div>
          )}

          {templateMode === 'library' && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                3. Select Initial Sections to Include
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sectionLibrary.map((def) => {
                  const isSelected = selectedSectionTypes.includes(def.type);
                  return (
                    <button
                      type="button"
                      key={def.type}
                      onClick={() => toggleSectionType(def.type)}
                      className={`p-2 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate text-[11px]">{def.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. OPTIONAL SEO & SOCIAL METADATA */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAdvancedSeo(!showAdvancedSeo)}
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showAdvancedSeo ? 'Hide SEO Metadata' : '+ Add Custom SEO & Social Meta (Optional)'}</span>
            </button>

            {showAdvancedSeo && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    SEO Meta Title ({seoTitle.length}/60 chars)
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Search Engine Result Title"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    SEO Meta Description ({seoDesc.length}/160 chars)
                  </label>
                  <textarea
                    rows={2}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Brief snippet shown on Google search results"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 resize-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    OpenGraph Social Image URL
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://.../preview.jpg"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !slug.trim()}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Next.js Page...</span>
                </>
              ) : (
                <>
                  <span>Create Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

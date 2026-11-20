'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Package,
  Trash2,
} from 'lucide-react';
import { websiteService, WebsiteTheme } from '@/src/services/websiteService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentThemeSlug?: string;
  onTemplateApplied?: () => void;
}

export const MiordrTemplatePickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentThemeSlug = 'fashion-luxe',
  onTemplateApplied,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'updates' | 'demo'>('templates');
  const [templates, setTemplates] = useState<WebsiteTheme[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentThemeSlug);
  const [resetSections, setResetSections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Platform patch state (ADR-03)
  const [patchInfo, setPatchInfo] = useState<{
    currentVersion: string;
    latestVersion: string;
    isUpdateAvailable: boolean;
    severity: string;
    changelog: string[];
  } | null>(null);
  const [patching, setPatching] = useState(false);

  // Demo data state (ADR-05)
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tpls, patch] = await Promise.all([
        websiteService.listMiordrTemplates(),
        websiteService.getPlatformPatchStatus().catch(() => null),
      ]);
      setTemplates(tpls || []);
      if (patch) setPatchInfo(patch);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    setApplying(true);
    setMessage(null);
    try {
      const res = await websiteService.applyMiordrTemplate(selectedTemplate, resetSections);
      setMessage({ text: res.message || 'Template applied successfully!', type: 'success' });
      if (onTemplateApplied) onTemplateApplied();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || err.message || 'Failed to apply template', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  const handleApplyPatch = async () => {
    if (!patchInfo) return;
    setPatching(true);
    try {
      const res = await websiteService.applyPlatformPatch(patchInfo.latestVersion);
      setMessage({ text: res.message, type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || err.message, type: 'error' });
    } finally {
      setPatching(false);
    }
  };

  const handleLoadDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await websiteService.loadDemoData(selectedTemplate);
      setMessage({ text: res.message, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || err.message, type: 'error' });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleRemoveDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await websiteService.removeDemoData();
      setMessage({ text: res.message, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || err.message, type: 'error' });
    } finally {
      setDemoLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-900">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Miordr Business Templates
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                  Base Template v1.0.0
                </span>
              </h2>
              <p className="text-sm text-slate-500">
                Industry-specific themes built on top of the canonical Next.js 16 base template
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex gap-2 border-b border-slate-200 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={16} /> Business Themes ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'updates'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={16} /> Platform Updates
            {patchInfo?.isUpdateAvailable && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'demo'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package size={16} /> Sample Content
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`px-6 py-3 text-sm font-medium flex items-center justify-between border-b ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tab 1: Templates Grid */}
        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {/* Preservation Notice (ADR-02) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Your section customizations are always preserved
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switching templates changes typography, brand tokens, and shell layouts. Custom sections stay intact.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={resetSections}
                  onChange={(e) => setResetSections(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                Reset sections to template default
              </label>
            </div>

            {/* Grid */}
            {templates.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h4 className="text-base font-bold text-slate-900">No Templates Seeded</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Dummy templates have been removed. Your storefront runs on the canonical Next.js 16 base template.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.slug;
                  return (
                    <div
                      key={tpl.slug}
                      onClick={() => setSelectedTemplate(tpl.slug)}
                      className={`group relative rounded-2xl border p-3.5 flex flex-col cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-50/60 ring-2 ring-slate-900/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={tpl.previewImage}
                          alt={tpl.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {tpl.badge && (
                          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur uppercase tracking-wider">
                            {tpl.badge}
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-slate-900">{tpl.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="capitalize">{tpl.categories?.[0] || 'Business'}</span>
                        <a
                          href={tpl.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-slate-900 font-semibold flex items-center gap-1"
                        >
                          Preview <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Platform Updates (ADR-03) */}
        {activeTab === 'updates' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-6 w-full">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Base Template Engine</h3>
                  <p className="text-xs text-slate-500">Current version: {patchInfo?.currentVersion || '1.0.0'}</p>
                </div>
                {patchInfo?.isUpdateAvailable ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Update Available ({patchInfo.latestVersion})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                    <Check size={12} /> Up to Date
                  </span>
                )}
              </div>

              {/* Sacred layer notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Sacred Layer Guarantee:</strong> Platform patches only touch core Next.js routes, middleware, and libraries. Your custom components, sections, and tokens are never modified.
              </div>

              {/* Changelog */}
              {patchInfo?.changelog && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">What's New</h4>
                  <ul className="space-y-2">
                    {patchInfo.changelog.map((c, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {patchInfo?.isUpdateAvailable && (
                <button
                  onClick={handleApplyPatch}
                  disabled={patching}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  {patching ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Apply Platform Patch v{patchInfo.latestVersion}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Sample Content (ADR-05) */}
        {activeTab === 'demo' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-6 w-full">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Demo Product Management</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seed industry-appropriate products, pricing, and imagery to preview your template in full context before uploading live inventory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Load Demo Catalog</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Injects 4 curated demo products tagged with <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono">demo-content</code>.
                    </p>
                  </div>
                  <button
                    onClick={handleLoadDemo}
                    disabled={demoLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                  >
                    {demoLoading ? <RefreshCw size={14} className="animate-spin" /> : <Package size={14} />}
                    Load Sample Products
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Remove Demo Catalog</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Safely deletes all tagged demo products to ensure clean live storefront operations.
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveDemo}
                    disabled={demoLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {demoLoading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Clean Up Demo Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {activeTab === 'templates' && (
          <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="text-xs text-slate-500">
              Selected: <strong className="text-slate-900 capitalize font-bold">{selectedTemplate}</strong>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                disabled={applying || templates.length === 0}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {applying ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Apply Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

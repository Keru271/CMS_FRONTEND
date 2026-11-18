'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import {
  getStorefrontUrl,
  formatStorefrontDisplay,
  getStoredStorefrontUrl,
  setStoredStorefrontUrl,
} from '@/src/utils/storefront';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  RotateCcw,
  Save,
  Eye,
  Layers,
  ExternalLink,
  Columns,
  AlertCircle,
  Globe,
  Edit3,
  Check,
  ShoppingBag,
  Store,
  Layers2,
  Info,
} from 'lucide-react';
import { HomepageSection, CMSForm, ThemeConfigData } from '@/src/types';
import { HomepageSectionsCustomizer } from './HomepageSectionsCustomizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templateSlug: string;
  templateName: string;
  sections: HomepageSection[];
  availableForms: CMSForm[];
  themeConfig: ThemeConfigData | null;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string, type: string, index: number) => void;
  onChange: (sections: HomepageSection[]) => void;
  onResetToDefault: () => void;
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
}

export const HomepageStudioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  templateSlug,
  templateName,
  sections,
  availableForms,
  themeConfig,
  selectedSectionId: externalSelectedId,
  onSelectSection,
  onChange,
  onResetToDefault,
  onSave,
  isSaving = false,
}) => {
  const { activeStore } = useCMSContext();

  // Storefront target URL state
  const [customStorefrontUrl, setCustomStorefrontUrl] = useState<string>(getStoredStorefrontUrl());
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(getStoredStorefrontUrl() || '');
  const [canvasMode, setCanvasMode] = useState<'live' | 'mockup'>('live');

  // Compute actual storefront preview URL
  const previewUrl = getStorefrontUrl(activeStore, '/', { previewTemplate: templateSlug });

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'split' | 'canvas' | 'controls'>('split');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    sections[0]?.id || null,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeTimedOut, setIframeTimedOut] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedSectionId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  // Listen to storefront-url-changed events
  useEffect(() => {
    const handleUrlChange = () => {
      setCustomStorefrontUrl(getStoredStorefrontUrl());
      setIframeKey((k) => k + 1);
      setIframeTimedOut(false);
    };
    window.addEventListener('storefront-url-changed', handleUrlChange);
    return () => window.removeEventListener('storefront-url-changed', handleUrlChange);
  }, []);

  // Sync internal selected ID when sections change
  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      setInternalSelectedId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  // Iframe connection timeout guard (detect if iframe refuses connection)
  useEffect(() => {
    if (!isOpen || canvasMode !== 'live') return;
    setIframeTimedOut(false);
    const timer = setTimeout(() => {
      // If after 4.5 seconds iframe hasn't notified readiness
      setIframeTimedOut(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [isOpen, iframeKey, canvasMode, previewUrl]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUrlModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUrlModalOpen, onClose]);

  // Post sections and theme updates to the iframe
  const postSyncToIframe = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      setIsSyncing(true);
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'CMS_SECTIONS_UPDATE',
          sections,
        },
        '*',
      );

      if (themeConfig) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'CMS_THEME_UPDATE',
            theme: themeConfig,
          },
          '*',
        );
      }
      setTimeout(() => setIsSyncing(false), 300);
    } catch (err) {
      console.warn('[HomepageStudioModal] Failed to postSyncToIframe:', err);
      setIsSyncing(false);
    }
  };

  // Post highlight to iframe when section selection changes
  const postHighlightToIframe = (id: string, type: string, idx: number) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'CMS_HIGHLIGHT_SECTION',
          sectionId: id,
          sectionType: type,
          sectionIndex: idx,
        },
        '*',
      );
    } catch (err) {
      console.warn('[HomepageStudioModal] Failed to postHighlightToIframe:', err);
    }
  };

  // Sync whenever sections or themeConfig change
  useEffect(() => {
    if (isOpen) {
      postSyncToIframe();
    }
  }, [sections, themeConfig, isOpen]);

  // Listen for messages from the storefront iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'STOREFRONT_SECTION_CLICKED') {
          const idx = data.sectionIndex;
          const targetSec = sections[idx] || sections.find((s) => s.type === data.sectionType);
          if (targetSec) {
            setInternalSelectedId(targetSec.id);
            onSelectSection?.(targetSec.id, targetSec.type, idx);
          }
        }

        if (data.type === 'STOREFRONT_READY') {
          setIframeTimedOut(false);
          postSyncToIframe();
          if (selectedSectionId) {
            const idx = sections.findIndex((s) => s.id === selectedSectionId);
            const sec = sections[idx];
            if (sec) {
              postHighlightToIframe(sec.id, sec.type, idx);
            }
          }
        }
      } catch (err) {
        console.warn('[HomepageStudioModal] Error handling postMessage:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sections, selectedSectionId]);

  if (!isOpen) return null;

  const handleSectionSelect = (id: string, type: string, idx: number) => {
    setInternalSelectedId(id);
    onSelectSection?.(id, type, idx);
    postHighlightToIframe(id, type, idx);
  };

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveClick = async () => {
    if (onSave) {
      await onSave();
      showToast('Homepage layout and sections saved successfully!', 'success');
    }
  };

  const handleApplyCustomUrl = () => {
    setStoredStorefrontUrl(urlInput);
    setCustomStorefrontUrl(urlInput);
    setIsUrlModalOpen(false);
    setIframeKey((k) => k + 1);
    setIframeTimedOut(false);
    showToast('Storefront target URL updated!', 'success');
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[390px] h-[844px] max-h-[88vh] rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[92vh] rounded-2xl border-[6px] border-slate-800 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-2xl border border-slate-800 shadow-2xl';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col w-screen h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden animate-in fade-in duration-150">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed top-16 right-8 z-[120] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/40 shadow-emerald-950/40'
              : notification.type === 'error'
              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
              : 'bg-slate-900 text-indigo-400 border-indigo-500/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Target Storefront URL Settings Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Target Storefront URL</h3>
              </div>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Configure where the Visual Studio points for live storefront previews. If your shop is running locally on port 3001 or on a production domain, set it here.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300">Base Storefront URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://localhost:3001 or https://wendr.store"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUrlInput('http://localhost:3001')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
              >
                localhost:3001 (Dev)
              </button>
              <button
                type="button"
                onClick={() => setUrlInput('http://localhost:3000')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
              >
                localhost:3000
              </button>
              {activeStore?.customDomain && (
                <button
                  type="button"
                  onClick={() => setUrlInput(`https://${activeStore.customDomain}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
                >
                  {activeStore.customDomain}
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
              >
                Apply Target URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOP BAR ─── */}
      <header className="h-16 px-4 sm:px-6 bg-[#0E131F] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 z-20 shadow-xs">
        {/* Left: Close Button, Studio Title & Template Pill */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            title="Exit Studio (Esc)"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                Homepage Visual Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider hidden md:inline-flex items-center gap-1">
                <span>{templateName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Sync</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-400">{sections.length} Active Blocks</span>
            </div>
          </div>
        </div>

        {/* Center: Viewport & View Mode Selectors */}
        <div className="hidden md:flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              title="Split View"
              className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('controls')}
              title="Blocks Only"
              className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'controls'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              title="Canvas Only"
              className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onResetToDefault}
            title="Reset Sections to Default Template Layout"
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIframeKey((k) => k + 1);
              setIframeTimedOut(false);
            }}
            title="Reload Canvas Preview"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Save className="w-4 h-4 text-white" />
              )}
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── WORKSPACE (Split / Canvas / Controls) ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: Section Tree & Property Inspector */}
        {(viewMode === 'split' || viewMode === 'controls') && (
          <div
            className={`${
              viewMode === 'controls'
                ? 'w-full max-w-4xl mx-auto'
                : 'w-full lg:w-[420px] xl:w-[480px]'
            } bg-[#0E131F] border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto z-10 custom-scrollbar p-4 sm:p-5 space-y-4`}
          >
            <HomepageSectionsCustomizer
              templateSlug={templateSlug}
              templateName={templateName}
              sections={sections}
              availableForms={availableForms}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleSectionSelect}
              onChange={onChange}
              onResetToDefault={onResetToDefault}
            />
          </div>
        )}

        {/* RIGHT PANEL: Live Interactive Storefront Canvas */}
        {(viewMode === 'split' || viewMode === 'canvas') && (
          <div className="flex-1 bg-[#070A11] flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Responsive Container Frame */}
            <div
              className={`flex flex-col overflow-hidden bg-slate-900 transition-all duration-300 relative z-10 ${getViewportWidthClass()}`}
            >
              {/* Browser Mock Navigation Bar */}
              <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 gap-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput(customStorefrontUrl || previewUrl.split('?')[0]);
                      setIsUrlModalOpen(true);
                    }}
                    title="Click to edit or switch target storefront URL"
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-0.5 text-[11px] font-mono text-slate-300 truncate max-w-xs sm:max-w-md flex items-center gap-1.5 transition cursor-pointer group"
                  >
                    <span className="text-emerald-400">🔒</span>
                    <span className="truncate">{formatStorefrontDisplay(previewUrl)}</span>
                    <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-1" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode switcher: Live vs Mockup */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setCanvasMode('live')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                        canvasMode === 'live'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Live iframe storefront"
                    >
                      Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasMode('mockup')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                        canvasMode === 'mockup'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Native layout block mockup"
                    >
                      Mockup
                    </button>
                  </div>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs"
                    title="Open live shop in new browser tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Shop</span>
                  </a>
                </div>
              </div>

              {/* Storefront Live Frame / Native Visual Mockup */}
              <div className="flex-1 bg-white relative overflow-hidden">
                {canvasMode === 'live' ? (
                  <>
                    <iframe
                      ref={iframeRef}
                      key={`studio-preview-${templateSlug}-${iframeKey}`}
                      src={previewUrl}
                      onLoad={() => {
                        setIframeTimedOut(false);
                        postSyncToIframe();
                        if (selectedSectionId) {
                          const idx = sections.findIndex((s) => s.id === selectedSectionId);
                          const sec = sections[idx];
                          if (sec) {
                            postHighlightToIframe(sec.id, sec.type, idx);
                          }
                        }
                      }}
                      className="w-full h-full border-0 bg-white"
                      title="Homepage Visual Studio Preview"
                    />

                    {/* Connection Helper Overlay if iframe is blocked / times out */}
                    {iframeTimedOut && (
                      <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                          <Store className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">
                          Live Storefront Canvas View
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                          Your browser or deployment host may restrict embedding inside an iframe (X-Frame-Options protection). You can open your actual shop directly or view the native block mockup.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Actual Shop Link ↗</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setCanvasMode('mockup')}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                          >
                            View Layout Mockup
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUrlInput(customStorefrontUrl || 'http://localhost:3001');
                              setIsUrlModalOpen(true);
                            }}
                            className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
                          >
                            Change Shop URL
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Native Visual Block Mockup */
                  <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-slate-50 text-slate-900 custom-scrollbar space-y-4">
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Interactive block mockup rendered from your active layout structure.</span>
                      </div>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Open Live Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {sections.map((sec, idx) => {
                      const isSelected = selectedSectionId === sec.id;
                      return (
                        <div
                          key={sec.id}
                          onClick={() => handleSectionSelect(sec.id, sec.type, idx)}
                          className={`p-5 rounded-2xl border transition cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-white ring-2 ring-indigo-600/20 shadow-md'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                          } ${!sec.enabled ? 'opacity-40' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-50">
                              {sec.type}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              Block #{idx + 1}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900">
                            {sec.title || sec.config?.headline || sec.config?.title || sec.type}
                          </h4>

                          {sec.config?.subheadline && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {sec.config.subheadline}
                            </p>
                          )}

                          {sec.config?.ctaLabel && (
                            <div className="mt-3">
                              <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold">
                                {sec.config.ctaLabel}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Save,
  Eye,
  Layers,
  ExternalLink,
  Columns,
  Layout,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { HomepageSection, CMSForm, ThemeConfigData } from '@/src/types';
import { HomepageSectionsCustomizer } from './HomepageSectionsCustomizer';

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

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
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'split' | 'canvas' | 'controls'>('split');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    sections[0]?.id || null,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedSectionId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  // Sync internal selected ID when sections change
  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      setInternalSelectedId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  // Listen for messages from the storefront iframe (e.g. user clicked section on canvas)
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

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[390px] h-[844px] max-h-[88vh] rounded-[3rem] border-[10px] border-[#2C2C2E] shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[92vh] rounded-3xl border-[8px] border-[#2C2C2E] shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-2xl border border-[#2C2C2E] shadow-2xl';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col w-screen h-screen bg-[#121212] text-white font-sans selection:bg-[#00E5FF] selection:text-[#121212] overflow-hidden animate-in fade-in duration-150">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed top-16 right-8 z-[120] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-[#1E1E1E] text-[#32D74B] border-[#32D74B]/40 shadow-emerald-950/40'
              : notification.type === 'error'
              ? 'bg-[#3A1C1C] text-[#FF453A] border-[#FF453A]/40'
              : 'bg-[#1E1E1E] text-[#00E5FF] border-[#00E5FF]/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#32D74B]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF453A]" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ─── TOP BAR (WattVision Clean Tech Style) ─── */}
      <header className="h-16 px-4 sm:px-6 bg-[#121212] border-b border-[#2C2C2E] flex items-center justify-between gap-4 shrink-0 z-20 shadow-md">
        {/* Left: Close Button, Studio Title & Template Pill */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            title="Exit Fullscreen Studio (Esc)"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#2C2C2E] hover:border-[#00E5FF]/50 bg-[#1E1E1E] hover:bg-[#252525] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs group"
          >
            <X className="w-4 h-4 text-[#98989D] group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <div className="h-6 w-px bg-[#2C2C2E] hidden sm:block" />

          {/* Logo Badge */}
          <div className="w-8 h-8 rounded-xl bg-[#1E1E1E] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-sm">
            ⚡
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                Homepage Visual Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono font-bold uppercase tracking-wider hidden md:inline-flex items-center gap-1">
                <span>{templateName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#98989D]">
              <span className="inline-flex items-center gap-1.5 text-[#32D74B] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#32D74B] animate-pulse" />
                <span>Live Canvas Sync</span>
              </span>
              <span className="text-[#2C2C2E] hidden sm:inline">•</span>
              <span className="hidden sm:inline text-[#98989D]">{sections.length} Active Blocks</span>
            </div>
          </div>
        </div>

        {/* Center: Viewport & View Mode Selectors */}
        <div className="hidden md:flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-[#1E1E1E] border border-[#2C2C2E] p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile View (390px)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#1E1E1E] border border-[#2C2C2E] p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              title="Split View (Controls & Canvas)"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('controls')}
              title="Controls Only"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'controls'
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              title="Canvas Only"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-[#00E5FF] text-[#121212] shadow-sm'
                  : 'text-[#98989D] hover:text-white'
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
            className="px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] text-[#98989D] hover:text-white text-xs font-semibold border border-[#2C2C2E] transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload Canvas Preview"
            className="p-2 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] text-[#98989D] hover:text-white border border-[#2C2C2E] transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#00E5FF]' : ''}`} />
          </button>

          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38e1ff] text-[#121212] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#121212]" />
              ) : (
                <Save className="w-4 h-4 text-[#121212]" />
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
                : 'w-full lg:w-[480px] xl:w-[540px]'
            } bg-[#121212] border-r border-[#2C2C2E] flex flex-col shrink-0 overflow-y-auto z-10 custom-scrollbar p-4 sm:p-6 space-y-4`}
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
          <div className="flex-1 bg-[#0d0d0d] flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden relative">
            {/* Canvas Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Responsive Container Frame */}
            <div
              className={`flex flex-col overflow-hidden bg-[#121212] transition-all duration-300 relative z-10 ${getViewportWidthClass()}`}
            >
              {/* Browser Mock Navigation Bar */}
              <div className="h-10 bg-[#1E1E1E] border-b border-[#2C2C2E] flex items-center justify-between px-4 gap-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#32D74B]" />
                  </div>
                  <div className="bg-[#121212] border border-[#2C2C2E] rounded-lg px-3 py-0.5 text-[11px] font-mono text-[#98989D] truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
                    <span className="text-[#32D74B]">🔒</span>
                    <span className="truncate">{STOREFRONT_URL}/?previewTemplate={templateSlug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#98989D] uppercase tracking-wider hidden sm:inline">
                    Click block to highlight & edit
                  </span>
                  <a
                    href={`${STOREFRONT_URL}/?previewTemplate=${templateSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#38e1ff] text-[#121212] text-[10px] font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                </div>
              </div>

              {/* Storefront Live Frame */}
              <div className="flex-1 bg-white relative overflow-hidden">
                <iframe
                  ref={iframeRef}
                  key={`studio-preview-${templateSlug}-${iframeKey}`}
                  src={`${STOREFRONT_URL}/?previewTemplate=${templateSlug}`}
                  onLoad={() => {
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

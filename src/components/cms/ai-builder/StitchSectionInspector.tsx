'use client';

import React, { useState } from 'react';
import {
  X,
  Layers,
  ChevronUp,
  ChevronDown,
  Trash2,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Plus,
  Palette,
  Check,
  Layout,
  Type,
  MousePointer,
} from 'lucide-react';
import { ClaymorphicThemeConfig } from './ClaymorphicScreenRenderer';

export interface WebsiteSectionItem {
  id: string;
  type:
    | 'navbar'
    | 'hero'
    | 'catalog'
    | 'tryon'
    | 'features'
    | 'testimonials'
    | 'faq'
    | 'newsletter'
    | 'footer'
    | 'custom';
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  isVisible: boolean;
  customHtml?: string;
  contentJson?: Record<string, any>;
}

interface StitchSectionInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreenTitle: string;
  activeScreenNumber: number;
  sections: WebsiteSectionItem[];
  selectedSectionId?: string;
  onSelectSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updated: Partial<WebsiteSectionItem>) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onDeleteSection: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string) => void;
  onOpenAddSectionModal: () => void;
  theme: ClaymorphicThemeConfig;
}

export function StitchSectionInspector({
  isOpen,
  onClose,
  activeScreenTitle,
  activeScreenNumber,
  sections,
  selectedSectionId,
  onSelectSection,
  onUpdateSection,
  onMoveSection,
  onDeleteSection,
  onToggleVisibility,
  onOpenAddSectionModal,
  theme,
}: StitchSectionInspectorProps) {
  const [inspectorWidth, setInspectorWidth] = useState<number>(384);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = inspectorWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = startX - ev.clientX;
      const nextW = Math.max(320, Math.min(650, startW + deltaX));
      setInspectorWidth(nextW);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!isOpen) return null;

  const currentSection =
    sections.find((s) => s.id === selectedSectionId) || sections[0];

  return (
    <div
      style={{ width: `${inspectorWidth}px` }}
      className="fixed right-20 top-18 bottom-6 z-50 bg-white/95 dark:bg-[#1A1C24]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs animate-in fade-in slide-in-from-right-4 max-w-[85vw]"
    >
      {/* Left Edge Resize Handle */}
      <div
        onMouseDown={startResize}
        className="absolute top-0 left-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center group z-30 select-none"
        title="Drag edge to resize inspector width"
      >
        <div className="w-0.5 h-12 rounded-full group-hover:bg-emerald-500 bg-transparent transition-colors" />
      </div>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Website Section Builder
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Page {activeScreenNumber}: {activeScreenTitle}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Sections List & Active Inspector */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Sections Layer Order */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Page Sections ({sections.length})
            </span>
            <button
              type="button"
              onClick={onOpenAddSectionModal}
              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Add Block</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {sections.map((sec, idx) => {
              const isSelected = sec.id === selectedSectionId;

              return (
                <div
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-mono opacity-50 w-4">
                      {idx + 1}
                    </span>
                    <span className="font-bold truncate text-[11px] capitalize">
                      {sec.title || sec.type}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(sec.id);
                      }}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={sec.isVisible ? 'Hide Section' : 'Show Section'}
                    >
                      {sec.isVisible ? (
                        <Eye className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSection(sec.id, 'up');
                      }}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSection(sec.id, 'down');
                      }}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(sec.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Section Customizer */}
        {currentSection && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customize Block: {currentSection.type}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-500">
                #{currentSection.id}
              </span>
            </div>

            {/* Title / Headline Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Section Headline / Title
              </label>
              <input
                type="text"
                value={currentSection.title || ''}
                onChange={(e) =>
                  onUpdateSection(currentSection.id, { title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter headline..."
              />
            </div>

            {/* Subtitle / Description Input */}
            {currentSection.subtitle !== undefined && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Subtitle / Subtext
                </label>
                <textarea
                  rows={2}
                  value={currentSection.subtitle || ''}
                  onChange={(e) =>
                    onUpdateSection(currentSection.id, { subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Enter subtext..."
                />
              </div>
            )}

            {/* CTA Button Text Input */}
            {currentSection.buttonText !== undefined && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Primary CTA Button Label
                </label>
                <input
                  type="text"
                  value={currentSection.buttonText || ''}
                  onChange={(e) =>
                    onUpdateSection(currentSection.id, { buttonText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Try On Now / Shop Drop"
                />
              </div>
            )}

            {/* Quick Claymorphic Style Preview Badge */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold block text-[11px] text-slate-800 dark:text-white">
                  DOUGH TIME Style
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Inherited from global claymorphic theme
                </span>
              </div>
              <div
                className="w-6 h-6 rounded-lg shadow-sm border border-black/10"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenAddSectionModal}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-black dark:hover:bg-slate-100 transition shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Insert Website Section Block</span>
        </button>
      </div>
    </div>
  );
}


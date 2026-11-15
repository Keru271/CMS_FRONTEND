'use client';

import React from 'react';
import {
  MousePointer2,
  Hand,
  Square,
  Pencil,
  MessageSquare,
  Image as ImageIcon,
  Palette,
  Star,
  Plus,
  Rocket,
  Layers,
  Layout,
} from 'lucide-react';

export type StitchTool =
  | 'select'
  | 'pan'
  | 'frame'
  | 'pencil'
  | 'comment'
  | 'image'
  | 'palette'
  | 'components'
  | 'publish';

interface StitchToolbarProps {
  activeTool: StitchTool;
  onSelectTool: (tool: StitchTool) => void;
  onAddNewScreen?: () => void;
  onTogglePalette?: () => void;
  onOpenAddSectionModal?: () => void;
  onOpenPublishModal?: () => void;
  onOpenSectionInspector?: () => void;
}

export function StitchToolbar({
  activeTool,
  onSelectTool,
  onAddNewScreen,
  onTogglePalette,
  onOpenAddSectionModal,
  onOpenPublishModal,
  onOpenSectionInspector,
}: StitchToolbarProps) {
  const tools = [
    { id: 'select' as StitchTool, icon: MousePointer2, label: 'Select & Inspect (V)' },
    { id: 'pan' as StitchTool, icon: Hand, label: 'Hand / Pan Canvas (H)' },
    {
      id: 'frame' as StitchTool,
      icon: Square,
      label: 'Add Page / Artboard (F)',
      action: onAddNewScreen,
    },
    {
      id: 'components' as StitchTool,
      icon: Plus,
      label: 'Add Website Section Block (+)',
      action: onOpenAddSectionModal,
    },
    {
      id: 'palette' as StitchTool,
      icon: Palette,
      label: 'Design System & Claymorphism',
      action: onTogglePalette,
    },
    {
      id: 'publish' as StitchTool,
      icon: Rocket,
      label: 'Publish to Live Storefront',
      action: onOpenPublishModal,
    },
    { id: 'pencil' as StitchTool, icon: Pencil, label: 'Draw / Annotate (P)' },
    { id: 'comment' as StitchTool, icon: MessageSquare, label: 'Merchant Feedback (C)' },
  ];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-[#FAF8F2]/95 dark:bg-[#1B1D24]/95 backdrop-blur-xl border border-[#E5E0D3] dark:border-[#2E323D] rounded-full p-1.5 shadow-2xl flex flex-col items-center gap-1">
        {tools.map((t) => {
          const Icon = t.icon;
          const isSelected = activeTool === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelectTool(t.id);
                if (t.action) t.action();
              }}
              title={t.label}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />

              {/* Tooltip on left */}
              <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-black/85 dark:bg-white/95 text-white dark:text-black text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-50">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  Palette,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  ClaymorphicThemeConfig,
  DEFAULT_CLAY_THEME,
  DARK_CLAY_THEME,
} from './ClaymorphicScreenRenderer';

interface StitchClaymorphismPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ClaymorphicThemeConfig;
  onUpdateTheme: (updated: Partial<ClaymorphicThemeConfig>) => void;
  onResetTheme: () => void;
}

export function StitchClaymorphismPanel({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
  onResetTheme,
}: StitchClaymorphismPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-20 top-20 z-50 w-80 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 text-xs space-y-4 animate-in fade-in slide-in-from-right-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900 dark:text-white">
            Claymorphic Design Engine
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Aesthetic Canvas Mode
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdateTheme({ ...DEFAULT_CLAY_THEME, mode: 'light' })}
            className={`p-2.5 rounded-2xl flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              theme.mode === 'light'
                ? 'bg-amber-50/80 border-amber-300 font-bold text-amber-900 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Dough Cream</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateTheme({ ...DARK_CLAY_THEME, mode: 'dark' })}
            className={`p-2.5 rounded-2xl flex items-center justify-center gap-1.5 border transition cursor-pointer ${
              theme.mode === 'dark'
                ? 'bg-indigo-950/60 border-indigo-500 font-bold text-indigo-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dark Clay</span>
          </button>
        </div>
      </div>

      {/* Shadow Intensity Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Clay Shadow Depth
          </span>
          <span className="font-mono text-slate-500">{Math.round(theme.shadowIntensity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.8"
          step="0.05"
          value={theme.shadowIntensity}
          onChange={(e) => onUpdateTheme({ shadowIntensity: parseFloat(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer"
        />
      </div>

      {/* Shadow Softness / Blur Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Softness & Tactility
          </span>
          <span className="font-mono text-slate-500">{theme.shadowSoftness}px</span>
        </div>
        <input
          type="range"
          min="6"
          max="26"
          step="1"
          value={theme.shadowSoftness}
          onChange={(e) => onUpdateTheme({ shadowSoftness: parseInt(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer"
        />
      </div>

      {/* Organic Border Radius Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Pill Corner Radius
          </span>
          <span className="font-mono text-slate-500">{theme.borderRadius}px</span>
        </div>
        <input
          type="range"
          min="16"
          max="36"
          step="2"
          value={theme.borderRadius}
          onChange={(e) => onUpdateTheme({ borderRadius: parseInt(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer"
        />
      </div>

      {/* Palette Colors */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Brand Palette Swatches
        </span>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Primary Brand</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
              className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
            />
            <span className="font-mono text-[10px] text-slate-500">{theme.primaryColor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Accent Sage</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
              className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
            />
            <span className="font-mono text-[10px] text-slate-500">{theme.accentColor}</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onResetTheme}
          className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default DOUGH TIME</span>
        </button>
      </div>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor,
  Tablet,
  Share2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  StitchScreenData,
  ClaymorphicScreenRenderer,
  ClaymorphicThemeConfig,
  ScreenViewport,
} from './ClaymorphicScreenRenderer';
import { StorefrontTemplateConfig } from './templateConfigs';

interface StitchPrototypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  screens: StitchScreenData[];
  theme: ClaymorphicThemeConfig;
  template?: StorefrontTemplateConfig;
  initialScreenIndex?: number;
}

export function StitchPrototypeModal({
  isOpen,
  onClose,
  screens,
  theme,
  template,
  initialScreenIndex = 1,
}: StitchPrototypeModalProps) {
  const [currentScreenNumber, setCurrentScreenNumber] = useState<number>(initialScreenIndex);
  const [prototypeViewport, setPrototypeViewport] = useState<ScreenViewport>('desktop');

  if (!isOpen) return null;

  const currentScreen =
    screens.find((s) => s.number === currentScreenNumber) || screens[0];

  const handlePrev = () => {
    setCurrentScreenNumber((prev) => (prev > 1 ? prev - 1 : screens.length));
  };

  const handleNext = () => {
    setCurrentScreenNumber((prev) => (prev < screens.length ? prev + 1 : 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Floating Control Bar */}
      <div className="fixed top-6 inset-x-0 max-w-xl mx-auto px-4 py-2.5 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-between text-xs backdrop-blur-lg shadow-2xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Live Storefront Prototype</span>
          <span className="text-[10px] opacity-60 font-mono">
            Page {currentScreen.number} of {screens.length}: {currentScreen.title}
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-full">
          <button
            type="button"
            onClick={() => setPrototypeViewport('desktop')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
              prototypeViewport === 'desktop'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setPrototypeViewport('tablet')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
              prototypeViewport === 'tablet'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3 h-3" />
            <span>Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setPrototypeViewport('mobile')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
              prototypeViewport === 'mobile'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer transition"
            title="Previous Screen"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer transition"
            title="Next Screen"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer transition ml-2"
            title="Close Prototype"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Device Center */}
      <div className="pt-16 pb-8 flex items-center justify-center min-h-screen">
        <ClaymorphicScreenRenderer
          screen={currentScreen}
          template={template}
          theme={theme}
          isActive={true}
          viewport={prototypeViewport}
          onNavigateToScreen={(targetNum) => setCurrentScreenNumber(targetNum)}
        />
      </div>

      {/* Bottom Route Indicator */}
      <div className="fixed bottom-6 text-center inset-x-0 pointer-events-none">
        <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
          {currentScreen.number}. {currentScreen.title} ({currentScreen.path || (currentScreen.type === 'welcome' ? '/' : '/' + currentScreen.slug)})
        </span>
      </div>
    </div>
  );
}

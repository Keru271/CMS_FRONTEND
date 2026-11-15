'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronDown,
  CornerDownRight,
  Plus,
  Sliders,
  Palette,
  Mic,
  ArrowUp,
  RefreshCw,
  X,
  FileCode,
  Layers,
  Wand2,
  Monitor,
  Smartphone,
  Rocket,
  Trash2,
  CheckCircle2,
  Bot,
  User,
} from 'lucide-react';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  appliedChanges?: string[];
  suggestedReplies?: string[];
}

interface StitchCopilotPanelProps {
  screensCount: number;
  activeScreenIndex: number;
  onSelectScreen: (screenNumber: number) => void;
  onSendPrompt: (prompt: string, mode?: string) => void;
  isGenerating: boolean;
  generationStepMessage?: string;
  screensList: Array<{ number: number; title: string }>;
  onOpenColorPalette?: () => void;
  onAddNewScreen?: () => void;
  onSwitchGlobalViewport?: (viewport: 'desktop' | 'mobile' | 'tablet') => void;
  onOpenPublishModal?: () => void;
  // Enhanced props for Readdy Flow
  messages?: CopilotMessage[];
  suggestedReplies?: string[];
  activeTemplateName?: string;
  brandName?: string;
  onOpenPromptModal?: () => void;
  onClearHistory?: () => void;
}

export function StitchCopilotPanel({
  screensCount,
  activeScreenIndex,
  onSelectScreen,
  onSendPrompt,
  isGenerating,
  generationStepMessage,
  screensList,
  onOpenColorPalette,
  onAddNewScreen,
  onSwitchGlobalViewport,
  onOpenPublishModal,
  messages: externalMessages,
  suggestedReplies: externalSuggestions,
  activeTemplateName = 'Nova Tech',
  brandName,
  onOpenPromptModal,
  onClearHistory,
}: StitchCopilotPanelProps) {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>('');
  const [mode, setMode] = useState<'Balanced' | 'Creative' | 'Precise'>('Balanced');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const [isScreensDropdownOpen, setIsScreensDropdownOpen] = useState<boolean>(false);
  const [isSlashCommandsOpen, setIsSlashCommandsOpen] = useState<boolean>(false);

  // Resizable Copilot Panel State with localStorage persistence
  const [panelWidth, setPanelWidth] = useState<number>(440);
  const [panelHeight, setPanelHeight] = useState<number>(230);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedW = localStorage.getItem('readdy_copilot_width');
      const savedH = localStorage.getItem('readdy_copilot_height');
      if (savedW) {
        const w = parseInt(savedW, 10);
        if (!isNaN(w) && w >= 340 && w <= 700) setPanelWidth(w);
      }
      if (savedH) {
        const h = parseInt(savedH, 10);
        if (!isNaN(h) && h >= 180 && h <= 550) setPanelHeight(h);
      }
    } catch {}
  }, []);

  const startResizeWidth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const nextW = Math.max(340, Math.min(700, startW + deltaX));
      setPanelWidth(nextW);
    };

    const onMouseUp = (ev: MouseEvent) => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const deltaX = ev.clientX - startX;
      const finalW = Math.max(340, Math.min(700, startW + deltaX));
      try {
        localStorage.setItem('readdy_copilot_width', String(finalW));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResizeCorner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelWidth;
    const startH = panelHeight;
    document.body.style.cursor = 'ne-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = startY - ev.clientY;
      const nextW = Math.max(340, Math.min(700, startW + deltaX));
      const nextH = Math.max(180, Math.min(550, startH + deltaY));
      setPanelWidth(nextW);
      setPanelHeight(nextH);
    };

    const onMouseUp = (ev: MouseEvent) => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const deltaX = ev.clientX - startX;
      const deltaY = startY - ev.clientY;
      const finalW = Math.max(340, Math.min(700, startW + deltaX));
      const finalH = Math.max(180, Math.min(550, startH + deltaY));
      try {
        localStorage.setItem('readdy_copilot_width', String(finalW));
        localStorage.setItem('readdy_copilot_height', String(finalH));
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fallback internal messages if external not provided
  const [internalMessages, setInternalMessages] = useState<CopilotMessage[]>([
    {
      id: 'm-welcome',
      role: 'assistant',
      text: `👋 Welcome to Readdy AI Studio! You're currently customizing "${activeTemplateName}". Ask me to change colors, redesign the hero, add custom sections, or update copy however you like!`,
      timestamp: 'Just now',
      suggestedReplies: [
        'Change primary color to emerald green',
        'Add a 20% discount hero banner',
        'Make all buttons rounded-full',
        'Sync real products from my store',
      ],
    },
  ]);

  const activeMessages = externalMessages && externalMessages.length > 0 ? externalMessages : internalMessages;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, isGenerating]);

  // Contextual suggestion chips: prefer external AI suggestions if present
  const defaultSuggestions = [
    'Change primary color to emerald green',
    'Add a 20% discount hero banner',
    'Switch all pages to Desktop 1440px layout',
    'Add verified customer reviews with 4.9★ rating',
    'Make buttons pill shaped & add shadow',
  ];

  const displaySuggestions =
    externalSuggestions && externalSuggestions.length > 0
      ? externalSuggestions
      : activeMessages[activeMessages.length - 1]?.suggestedReplies || defaultSuggestions;

  const handleSend = (text?: string) => {
    const finalPrompt = text || promptText.trim();
    if (!finalPrompt || isGenerating) return;

    // Handle Quick Slash Commands
    if (finalPrompt.startsWith('/viewport desktop')) {
      onSwitchGlobalViewport?.('desktop');
    } else if (finalPrompt.startsWith('/viewport mobile')) {
      onSwitchGlobalViewport?.('mobile');
    } else if (finalPrompt.startsWith('/publish')) {
      onOpenPublishModal?.();
    } else if (finalPrompt.startsWith('/new') || finalPrompt.startsWith('/prompt')) {
      onOpenPromptModal?.();
    }

    if (!externalMessages) {
      setInternalMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'user',
          text: finalPrompt,
          timestamp: 'Just now',
        },
      ]);
    }

    setPromptText('');
    setIsSlashCommandsOpen(false);
    onSendPrompt(finalPrompt, mode);
  };

  const slashCommands = [
    { cmd: '/new', desc: 'Create a brand new storefront design from a prompt' },
    { cmd: '/viewport desktop', desc: 'Switch all pages to 1440px Desktop layout' },
    { cmd: '/viewport mobile', desc: 'Switch all pages to mobile smartphone layout' },
    { cmd: '/section hero', desc: 'Insert high-impact Hero banner with CTA' },
    { cmd: '/section catalog', desc: 'Insert dynamic product showcase grid' },
    { cmd: '/section reviews', desc: 'Insert customer testimonials & star ratings' },
    { cmd: '/dark', desc: 'Transform design to obsidian dark mode' },
    { cmd: '/light', desc: 'Transform design to warm cream light mode (DESIGN.md)' },
    { cmd: '/publish', desc: 'Publish and activate on your live store domain' },
  ];

  if (isMinimized) {
    return (
      <div className="fixed left-6 bottom-6 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-4 py-2.5 rounded-full bg-[#FAF8F2] dark:bg-[#1B1D24] border border-[#E5E0D3] dark:border-[#2E323D] shadow-2xl flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-white cursor-pointer hover:scale-105 transition"
        >
          <div className="flex items-center gap-1 text-emerald-500">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>Readdy Copilot</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 rounded-full font-mono">
            {activeTemplateName}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ width: `${panelWidth}px` }}
      className="fixed left-6 bottom-6 z-40 max-w-[92vw]"
    >
      <div className="relative bg-[#FAF8F2]/95 dark:bg-[#181A22]/95 backdrop-blur-2xl border border-[#E8E3D5] dark:border-[#2D313D] rounded-[32px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col gap-3 transition-all duration-150">
        {/* Resize Handle on Top-Right Corner */}
        <div
          onMouseDown={startResizeCorner}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 cursor-ne-resize flex items-center justify-center group z-30 select-none"
          title="Drag corner to resize width & height"
        >
          <div className="w-3 h-3 border-t-2 border-r-2 border-slate-300 dark:border-slate-600 group-hover:border-emerald-500 rounded-tr-md transition-colors" />
        </div>

        {/* Resize Handle on Right Border */}
        <div
          onMouseDown={startResizeWidth}
          className="absolute top-8 -right-1.5 bottom-8 w-3 cursor-col-resize flex items-center justify-center group z-30 select-none"
          title="Drag edge to resize width"
        >
          <div className="w-0.5 h-10 rounded-full group-hover:bg-emerald-500 bg-transparent transition-colors" />
        </div>

        {/* Top Header Pill Bar */}
        <div className="flex items-center justify-between px-1 border-b border-black/5 dark:border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Readdy Copilot</span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeTemplateName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* New Design from Prompt Button */}
            {onOpenPromptModal && (
              <button
                type="button"
                onClick={onOpenPromptModal}
                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-500/20"
                title="Create a completely new design from prompt"
              >
                <Wand2 className="w-3 h-3" />
                <span className="hidden sm:inline">New Design</span>
              </button>
            )}

            {/* Clear Conversation */}
            {onClearHistory && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Minimize */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              title="Minimize Copilot"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div
          style={{ maxHeight: `${panelHeight}px` }}
          className="space-y-2.5 overflow-y-auto pr-1 no-scrollbar scroll-smooth"
        >
          {activeMessages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 transition-all ${
                m.role === 'user'
                  ? 'bg-[#EFECE2] dark:bg-[#232733] text-slate-800 dark:text-slate-100 font-medium ml-4'
                  : 'bg-white dark:bg-[#1E212B] text-slate-800 dark:text-slate-200 shadow-xs border border-slate-200/60 dark:border-slate-800 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold flex items-center gap-1">
                  {m.role === 'user' ? (
                    <>
                      <User className="w-3 h-3" />
                      <span>You</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">Readdy AI</span>
                    </>
                  )}
                </span>
                {m.timestamp && <span>{m.timestamp}</span>}
              </div>

              <div className="text-slate-800 dark:text-slate-200 text-xs whitespace-pre-line">
                {m.text}
              </div>

              {/* Applied Changes Badges */}
              {m.appliedChanges && m.appliedChanges.length > 0 && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Applied Changes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {m.appliedChanges.map((change, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 font-medium"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        <span>{change}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Real-time AI Generation Step Indicator */}
          {isGenerating && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-emerald-600" />
              <span className="font-medium">
                {generationStepMessage || 'Readdy AI is applying changes & refining artboards...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Screens Counter & View Switcher Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-semibold relative border-t border-black/5 dark:border-white/5 pt-1.5">
          <span>{screensCount} Pages generated</span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsScreensDropdownOpen(!isScreensDropdownOpen)}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs"
            >
              <span>View Artboards</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Dropdown Menu */}
            {isScreensDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-[#1E212B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95">
                {screensList.map((sc) => (
                  <button
                    key={sc.number}
                    type="button"
                    onClick={() => {
                      onSelectScreen(sc.number);
                      setIsScreensDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between cursor-pointer transition ${
                      activeScreenIndex === sc.number
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>
                      {sc.number}. {sc.title}
                    </span>
                    {activeScreenIndex === sc.number && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddNewScreen) onAddNewScreen();
                      setIsScreensDropdownOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestion Chips Stack */}
        <div className="space-y-1">
          {displaySuggestions.slice(0, 3).map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isGenerating}
              onClick={() => handleSend(chip)}
              className="w-full text-left p-2 rounded-xl bg-white/70 dark:bg-[#20232F]/70 hover:bg-white dark:hover:bg-[#252937] border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-start gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <CornerDownRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
              <span className="truncate">{chip}</span>
            </button>
          ))}
        </div>

        {/* Input Bar Area */}
        <div className="relative pt-0.5">
          {/* Slash Commands Dropdown Menu */}
          {isSlashCommandsOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-[#1E212B] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Readdy Copilot Commands
              </span>
              {slashCommands.map((item) => (
                <button
                  key={item.cmd}
                  type="button"
                  onClick={() => {
                    handleSend(item.cmd);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer group"
                >
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    {item.cmd}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Pill Container */}
          <div className="rounded-[24px] bg-[#EBE7DC] dark:bg-[#21242E] p-1.5 pl-3 flex flex-col gap-1.5 border border-black/5 dark:border-white/5 shadow-inner">
            {/* Input Field */}
            <input
              type="text"
              value={promptText}
              disabled={isGenerating}
              onChange={(e) => {
                setPromptText(e.target.value);
                if (e.target.value.startsWith('/')) {
                  setIsSlashCommandsOpen(true);
                } else {
                  setIsSlashCommandsOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={`Ask Readdy to customize "${activeTemplateName}"...`}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none py-1"
            />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-0.5">
              {/* Left Helpers: + and / */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onAddNewScreen) onAddNewScreen();
                  }}
                  className="w-6 h-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer transition"
                  title="Add New Page"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setIsSlashCommandsOpen(!isSlashCommandsOpen)}
                  className="w-6 h-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 font-mono text-xs cursor-pointer transition"
                  title="Slash Commands"
                >
                  /
                </button>
              </div>

              {/* Right Helpers: Style Pill + Mic + Send */}
              <div className="flex items-center gap-1.5">
                {/* Style Dropdown Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#2C303D] shadow-2xs border border-black/5 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#343948] transition"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-sky-400 via-emerald-400 to-amber-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenColorPalette) onOpenColorPalette();
                      }}
                      title="Open Color Palette"
                    />
                    <span>{mode}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {/* Mode Dropdown */}
                  {isModeDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-28 bg-white dark:bg-[#1E212B] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-1 space-y-0.5 z-50">
                      {(['Balanced', 'Creative', 'Precise'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMode(m);
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            mode === m
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice / Quick Idea Button */}
                <button
                  type="button"
                  onClick={() => handleSend('Add a high-converting flash sale countdown banner with 20% off')}
                  className="w-6 h-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                  title="Flash Sale Prompt"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  disabled={!promptText.trim() || isGenerating}
                  onClick={() => handleSend()}
                  className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center cursor-pointer transition shadow-2xs hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

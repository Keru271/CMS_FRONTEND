'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Play,
  Share2,
  Download,
  RotateCcw,
  RotateCw,
  HelpCircle,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  Sparkles,
  Maximize2,
  Sliders,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Rocket,
  Layers,
  Layout,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ShoppingBag,
  Store,
  ArrowLeft,
  MoreHorizontal,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  ClaymorphicScreenRenderer,
  StitchScreenData,
  ClaymorphicThemeConfig,
  DEFAULT_CLAY_THEME,
  DARK_CLAY_THEME,
  ScreenViewport,
} from './ai-builder/ClaymorphicScreenRenderer';
import { StitchCopilotPanel, CopilotMessage } from './ai-builder/StitchCopilotPanel';
import { ReaddyPromptModal } from './ai-builder/ReaddyPromptModal';
import { StitchToolbar, StitchTool } from './ai-builder/StitchToolbar';
import { StitchPrototypeModal } from './ai-builder/StitchPrototypeModal';
import { StitchClaymorphismPanel } from './ai-builder/StitchClaymorphismPanel';
import { StitchExportModal } from './ai-builder/StitchExportModal';
import { StitchShareModal } from './ai-builder/StitchShareModal';
import {
  StitchSectionInspector,
  WebsiteSectionItem,
} from './ai-builder/StitchSectionInspector';
import {
  StitchAddSectionModal,
  SectionTemplateDef,
} from './ai-builder/StitchAddSectionModal';
import { StitchPublishModal } from './ai-builder/StitchPublishModal';
import { cmsService } from '@/src/services/cmsService';
import { CMSProduct } from '@/src/types';
import {
  StorefrontTemplateConfig,
  getTemplateConfig,
  STOREFRONT_TEMPLATES_LIST,
  getScreensForTemplate,
} from './ai-builder/templateConfigs';

// 8 Core eCommerce Website Pages matching the chosen template & website builder flow
export const INITIAL_AURAFIT_SCREENS: StitchScreenData[] = getScreensForTemplate(
  getTemplateConfig('nova-tech')
) as StitchScreenData[];

// Initial modular website sections
const INITIAL_PAGE_SECTIONS: Record<number, WebsiteSectionItem[]> = {
  1: [
    {
      id: 'sec-ann',
      type: 'hero',
      title: 'Announcement Bar',
      subtitle: 'Complimentary Worldwide Insured Shipping',
      isVisible: true,
    },
    {
      id: 'sec-hero',
      type: 'hero',
      title: 'High-Fashion Silhouettes',
      subtitle: 'Calibrated by Neural Biometrics',
      buttonText: 'Start 3D Virtual Fitting',
      buttonUrl: '/try-on',
      isVisible: true,
    },
    {
      id: 'sec-cat',
      type: 'catalog',
      title: 'Curated Collection',
      subtitle: 'Ready for instant virtual fitting',
      buttonText: 'Explore Fits',
      buttonUrl: '/products',
      isVisible: true,
    },
    {
      id: 'sec-try',
      type: 'tryon',
      title: 'Virtual Fitting Room Teaser',
      subtitle: 'See garments draped over your silhouette',
      buttonText: 'Launch Fitting Room',
      buttonUrl: '/try-on',
      isVisible: true,
    },
    {
      id: 'sec-rev',
      type: 'testimonials',
      title: 'Discerning Connoisseurs',
      subtitle: '4.9★ rating worldwide',
      isVisible: true,
    },
    {
      id: 'sec-foot',
      type: 'footer',
      title: 'AURAFIT Global Atelier',
      isVisible: true,
    },
  ],
  6: [
    {
      id: 'sec-cat-head',
      type: 'catalog',
      title: 'Curated Catalog (18 Items)',
      subtitle: 'Bespoke tailoring and outerwear',
      isVisible: true,
    },
    {
      id: 'sec-cat-grid',
      type: 'catalog',
      title: '4-Column Product Grid',
      isVisible: true,
    },
  ],
  7: [
    {
      id: 'sec-try-slider',
      type: 'tryon',
      title: 'Tactile Split Comparison Slider',
      subtitle: 'Raw silhouette vs. neural drape',
      isVisible: true,
    },
    {
      id: 'sec-try-pdp',
      type: 'tryon',
      title: 'Garment Specification & Size Match',
      buttonText: 'Add Look to Bag • $480',
      isVisible: true,
    },
  ],
};

const TYPOGRAPHY_PRESETS = [
  { name: 'Plus Jakarta Sans', font: 'Plus Jakarta Sans, sans-serif' },
  { name: 'Inter Tight', font: 'Inter, sans-serif' },
  { name: 'Playfair Display', font: 'Playfair Display, serif' },
  { name: 'Cinzel Couture', font: 'Cinzel, serif' },
  { name: 'Outfit Modern', font: 'Outfit, sans-serif' },
];

export function AiWebsiteBuilderStudio({
  isFullscreenStandalone = false,
}: {
  isFullscreenStandalone?: boolean;
}) {
  const router = useRouter();

  // Active Chosen Store Template & Readdy Custom Generated Template
  const [activeTemplateSlug, setActiveTemplateSlug] = useState<string>('nova-tech');
  const [customTemplateConfig, setCustomTemplateConfig] = useState<StorefrontTemplateConfig | null>(null);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState<boolean>(false);
  const activeTemplate: StorefrontTemplateConfig = customTemplateConfig || getTemplateConfig(activeTemplateSlug);

  // Readdy AI Prompt Modal State
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [isSavingToStore, setIsSavingToStore] = useState<boolean>(false);

  // Readdy AI Conversational Copilot History
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'm-welcome',
      role: 'assistant',
      text: `👋 Welcome to Readdy AI Studio! You are currently editing "${activeTemplate.name}".
You can customize colors, copy, sections, and layout simply by chatting with me below — or click "New Design with AI" above to generate a completely new design from your prompt!`,
      timestamp: 'Just now',
      suggestedReplies: [
        'Change primary color to emerald green',
        'Add a 20% discount hero banner',
        'Make all buttons rounded-full',
        'Add customer photo testimonials',
      ],
    },
  ]);
  const [dynamicSuggestedReplies, setDynamicSuggestedReplies] = useState<string[]>([
    'Change primary color to emerald green',
    'Add a 20% discount hero banner',
    'Switch all pages to Desktop 1440px layout',
    'Add verified customer reviews with 4.9★ rating',
  ]);
  const [recentAppliedChanges, setRecentAppliedChanges] = useState<string[]>([]);

  // Project Title
  const [projectTitle, setProjectTitle] = useState<string>('Nova Tech & Minimal Storefront');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

  // Active Screens Flow (Dynamically generated from chosen template)
  const [screens, setScreens] = useState<StitchScreenData[]>(INITIAL_AURAFIT_SCREENS);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(1);

  // Global Viewport Mode ('desktop' | 'tablet' | 'mobile' | 'mixed')
  const [globalViewportMode, setGlobalViewportMode] = useState<
    'desktop' | 'tablet' | 'mobile' | 'mixed'
  >('mixed');

  // Website Sections State per Page
  const [pageSections, setPageSections] = useState<Record<number, WebsiteSectionItem[]>>(
    INITIAL_PAGE_SECTIONS
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>('sec-hero');

  // Real Store Data Integration
  const [useRealStoreProducts, setUseRealStoreProducts] = useState<boolean>(false);
  const [realStoreProducts, setRealStoreProducts] = useState<CMSProduct[]>([]);

  // Design Engine & Claymorphism Theme
  const [clayTheme, setClayTheme] = useState<ClaymorphicThemeConfig>(DEFAULT_CLAY_THEME);

  // Active Canvas Tool
  const [activeTool, setActiveTool] = useState<StitchTool>('select');

  // Infinite Canvas Pan & Zoom State (Initially 100% in draggable area)
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 80, y: 50 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load merchant's configured store template from backend / local storage
  useEffect(() => {
    let isMounted = true;
    async function resolveStoreTemplate() {
      try {
        const themeConfig = await cmsService.getStoreTheme();
        const storeSetup = await cmsService.getStoreSetup();
        const session = cmsService.getMerchantSession();

        const resolvedSlug =
          themeConfig?.activeTemplateSlug ||
          storeSetup?.activeTemplateSlug ||
          session?.selectedTemplate?.slug ||
          session?.selectedTemplate?.id ||
          'nova-tech';

        if (!isMounted) return;

        const tmpl = getTemplateConfig(resolvedSlug);
        setActiveTemplateSlug(tmpl.slug);
        const baseName = storeSetup?.name || tmpl.name;
        const formattedTitle = baseName.toLowerCase().includes('storefront')
          ? baseName
          : `${baseName} Storefront`;
        setProjectTitle(formattedTitle);

        const templateScreens = getScreensForTemplate(tmpl) as StitchScreenData[];
        setScreens(templateScreens);

        const newTheme: ClaymorphicThemeConfig = {
          ...DEFAULT_CLAY_THEME,
          primaryColor: tmpl.primaryColor,
          accentColor: tmpl.accentColor,
          canvasBg: tmpl.canvasBg,
          cardBg: tmpl.cardBg,
          creamBg: tmpl.creamBg,
          textColor: tmpl.textColor,
          textMuted: tmpl.textMuted,
          fontFamily: tmpl.fontFamily,
        };
        setClayTheme(newTheme);
        setHistory([{ screens: templateScreens, theme: newTheme }]);
      } catch (err) {
        console.warn('Unable to resolve merchant store template, using default:', err);
      }
    }
    resolveStoreTemplate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Switch to another eCommerce Storefront Template
  const handleSwitchTemplate = async (slug: string) => {
    const tmpl = getTemplateConfig(slug);
    setCustomTemplateConfig(null);
    setActiveTemplateSlug(tmpl.slug);
    setIsTemplateDropdownOpen(false);

    const newScreens = getScreensForTemplate(tmpl) as StitchScreenData[];
    setScreens(newScreens);
    setProjectTitle(`${tmpl.name} Storefront`);

    const updatedTheme: ClaymorphicThemeConfig = {
      ...clayTheme,
      primaryColor: tmpl.primaryColor,
      accentColor: tmpl.accentColor,
      canvasBg: tmpl.canvasBg,
      cardBg: tmpl.cardBg,
      creamBg: tmpl.creamBg,
      textColor: tmpl.textColor,
      textMuted: tmpl.textMuted,
      fontFamily: tmpl.fontFamily,
    };
    setClayTheme(updatedTheme);

    // Push checkpoint to history
    setHistory((prev) => [
      ...prev.slice(0, historyIndex + 1),
      { screens: newScreens, theme: updatedTheme },
    ]);
    setHistoryIndex((prev) => prev + 1);

    // Add notification to Readdy AI Copilot
    const switchMsg: CopilotMessage = {
      id: `m-${Date.now()}-sw`,
      role: 'assistant',
      text: `Switched active template to "${tmpl.name}". You can now chat with me to customize its layout, colors, sections, or copy however you like!`,
      timestamp: 'Just now',
      suggestedReplies: [
        `Change ${tmpl.name} primary color`,
        'Add high-converting Hero banner with countdown',
        'Make buttons rounded-full',
        'Add customer verified reviews',
      ],
    };
    setCopilotMessages((prev) => [...prev, switchMsg]);
    setDynamicSuggestedReplies(switchMsg.suggestedReplies || []);

    // Save active template preference to backend in background
    try {
      await cmsService.updateStoreTheme({
        activeTemplateSlug: tmpl.slug,
        themePrimaryColor: tmpl.primaryColor,
        themeAccentColor: tmpl.accentColor,
      } as any);
      await cmsService.updateStoreSetup({
        activeTemplateSlug: tmpl.slug,
      } as any);
    } catch (err) {
      console.warn('Template switch auto-sync notice:', err);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.15, x: 0.3 },
      });
    } catch {}
  };

  // Spacebar pan listener for design studio navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // AI Generator Engine State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStepMessage, setGenerationStepMessage] = useState<string>('');

  // Modals & Sub-Panels
  const [isPrototypeOpen, setIsPrototypeOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isSectionInspectorOpen, setIsSectionInspectorOpen] = useState<boolean>(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  // History Checkpoints
  const [history, setHistory] = useState<
    Array<{ screens: StitchScreenData[]; theme: ClaymorphicThemeConfig }>
  >([{ screens: INITIAL_AURAFIT_SCREENS, theme: DEFAULT_CLAY_THEME }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Fetch real store products for live sync toggle
  useEffect(() => {
    async function loadStoreCatalog() {
      try {
        const prods = await cmsService.getProducts();
        if (prods && prods.length > 0) {
          setRealStoreProducts(prods);
        }
      } catch (err) {
        console.warn('Unable to load live store catalog, using curated demo fits:', err);
      }
    }
    loadStoreCatalog();
  }, []);

  // Handle Canvas Mouse Drag for Smooth Panning Anywhere in Draggable Area
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Do not initiate pan if clicking on an interactive control (button, input, select, link)
    if (
      !isSpacePressed &&
      activeTool !== 'pan' &&
      (target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('a'))
    ) {
      return;
    }

    if (
      activeTool === 'pan' ||
      isSpacePressed ||
      e.button === 1 || // Middle mouse click
      target.id === 'canvas-grid-bg' ||
      target.id === 'canvas-surface-area' ||
      !target.closest('.interactive-screen-content')
    ) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanPosition({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Prevent whole browser window zoom and zoom canvas centered at cursor position
  useEffect(() => {
    // 1. Global window listener to block native browser window zoom (Ctrl + wheel / trackpad pinch)
    const preventNativeWindowZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventNativeWindowZoom, { passive: false });

    // 2. Keyboard shortcuts Ctrl + / Ctrl - / Ctrl 0 to zoom canvas instead of window
    const handleKeyZoom = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')
      ) {
        e.preventDefault();
        if (e.key === '=' || e.key === '+') {
          setZoomScale((prev) => Math.min(2.5, prev * 1.15));
        } else if (e.key === '-') {
          setZoomScale((prev) => Math.max(0.15, prev * 0.85));
        } else if (e.key === '0') {
          handleFitToScreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyZoom, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventNativeWindowZoom);
      window.removeEventListener('keydown', handleKeyZoom);
    };
  }, []);

  // 3. Canvas-specific non-passive Wheel listener for cursor-centered canvas zoom and smooth pan
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const onNativeCanvasWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const isInsideScrollableScreen = Boolean(
        target.closest('.interactive-screen-content')
      );

      // If user is zooming (Ctrl+wheel, Cmd+wheel, trackpad pinch):
      // ALWAYS zoom the canvas draggable area, NEVER zoom the browser window!
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        const rect = canvasEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoomScale((prevScale) => {
          const newScale = Math.min(Math.max(0.15, prevScale * zoomFactor), 2.5);
          // Zoom centered right around the mouse cursor position
          setPanPosition((prevPan) => {
            const scaleRatio = newScale / prevScale;
            return {
              x: mouseX - (mouseX - prevPan.x) * scaleRatio,
              y: mouseY - (mouseY - prevPan.y) * scaleRatio,
            };
          });
          return newScale;
        });
        return;
      }

      // If mouse is scrolling inside a screen's scrollable list and NOT holding Ctrl: let screen scroll
      if (isInsideScrollableScreen) {
        return;
      }

      // Otherwise (on canvas background/gaps/headers): pan the canvas
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        setPanPosition((prev) => ({
          x: prev.x - e.deltaY,
          y: prev.y,
        }));
      } else {
        setPanPosition((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    // Attach non-passive wheel listener directly to canvas DOM element
    canvasEl.addEventListener('wheel', onNativeCanvasWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', onNativeCanvasWheel);
    };
  }, []);

  // Fit All Screens to Viewport (100% scale default)
  const handleFitToScreen = () => {
    setZoomScale(1.0);
    setPanPosition({ x: 80, y: 50 });
  };

  // Focus on specific screen
  const handleFocusScreen = (screenNumber: number) => {
    setActiveScreenIndex(screenNumber);
    // Smooth horizontal offset
    const screenWidth = screens[screenNumber - 1]?.viewport === 'desktop' ? 980 : 380;
    const targetX = 80 - (screenNumber - 1) * screenWidth * zoomScale;
    setPanPosition({ x: targetX, y: 50 });
  };

  // Switch Viewport for a Specific Screen Artboard
  const handleToggleScreenViewport = (
    screenNumber: number,
    targetViewport: ScreenViewport
  ) => {
    setScreens((prev) =>
      prev.map((s) => (s.number === screenNumber ? { ...s, viewport: targetViewport } : s))
    );
  };

  // Switch Global Viewport for all screens
  const handleSetGlobalViewport = (mode: 'desktop' | 'tablet' | 'mobile' | 'mixed') => {
    setGlobalViewportMode(mode);
    if (mode !== 'mixed') {
      setScreens((prev) => prev.map((s) => ({ ...s, viewport: mode })));
    }
  };

  // Flow 1: Readdy AI - Synthesize brand-new storefront design from prompt or UI idea
  const handleGenerateDesignFromPrompt = async (payload: {
    prompt: string;
    brandName?: string;
    industry?: string;
    visualStyle?: string;
  }) => {
    setIsGenerating(true);
    setGenerationStepMessage('Readdy AI: Analyzing store vision & niche requirements...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStepMessage('Readdy AI: Synthesizing light-mode palette, typography & tokens...');
      }, 900);
      const stepTimer2 = setTimeout(() => {
        setGenerationStepMessage('Readdy AI: Generating high-converting sections & responsive artboards...');
      }, 2000);

      const storeSetup = await cmsService.getStoreSetup().catch(() => null);
      const storeId = storeSetup?.id;

      const res = await cmsService.createDesignFromPrompt({
        prompt: payload.prompt,
        brandName: payload.brandName || storeSetup?.name,
        industry: payload.industry,
        visualStyle: payload.visualStyle,
        storeId,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res && res.templateConfig) {
        setCustomTemplateConfig(res.templateConfig);
        setActiveTemplateSlug(res.templateConfig.slug);
        const title = `${res.brandName} Storefront`;
        setProjectTitle(title);

        const newTheme: ClaymorphicThemeConfig = {
          ...clayTheme,
          mode: 'light',
          primaryColor: res.templateConfig.primaryColor,
          accentColor: res.templateConfig.accentColor,
          canvasBg: res.templateConfig.canvasBg,
          cardBg: res.templateConfig.cardBg,
          creamBg: res.templateConfig.creamBg,
          textColor: res.templateConfig.textColor,
          textMuted: res.templateConfig.textMuted,
          fontFamily: res.templateConfig.fontFamily,
          borderRadius: 20,
        };
        setClayTheme(newTheme);

        const newScreens = getScreensForTemplate(res.templateConfig) as StitchScreenData[];
        setScreens(newScreens);

        // Update page sections
        if (res.sections && Array.isArray(res.sections)) {
          setPageSections((prev) => ({
            ...prev,
            1: res.sections.map((s) => ({
              id: s.id,
              type: s.type,
              title: s.title,
              subtitle: s.subtitle,
              isVisible: s.enabled !== false,
              customHtml: s.customHtml,
              buttonText: s.contentJson?.primaryCta,
            })),
          }));
        }

        // Add to copilot messages
        const userMsg: CopilotMessage = {
          id: `m-${Date.now()}-u`,
          role: 'user',
          text: `Create new storefront: "${payload.prompt}"`,
          timestamp: 'Just now',
        };
        const aiMsg: CopilotMessage = {
          id: `m-${Date.now()}-a`,
          role: 'assistant',
          text: res.reply || `I've synthesized your custom storefront for "${res.brandName}"! You can now chat with me below to customize any aspect of it.`,
          timestamp: 'Just now',
          appliedChanges: res.appliedChanges || [
            `Created brand architecture: "${res.brandName}"`,
            `Engineered light-mode palette: ${res.templateConfig.primaryColor}`,
            `Generated ${res.templateConfig.products.length} products & responsive artboards`,
          ],
          suggestedReplies: res.suggestedReplies || [
            'Change primary color to emerald green',
            'Add a 20% discount hero banner',
            'Make all buttons rounded-full',
            'Add customer photo testimonials',
          ],
        };

        setCopilotMessages((prev) => [...prev, userMsg, aiMsg]);
        if (res.suggestedReplies) {
          setDynamicSuggestedReplies(res.suggestedReplies);
        }
        if (res.appliedChanges) {
          setRecentAppliedChanges(res.appliedChanges);
        }

        // Save checkpoint
        setHistory((prev) => [
          ...prev.slice(0, historyIndex + 1),
          { screens: newScreens, theme: newTheme },
        ]);
        setHistoryIndex((prev) => prev + 1);

        setIsPromptModalOpen(false);

        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to create design from prompt:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStepMessage('');
    }
  };

  // Flow 2: Conversational AI Customization of the Selected Template
  const handleExecuteAiPrompt = async (prompt: string, mode?: string) => {
    setIsGenerating(true);
    setGenerationStepMessage('Readdy AI: Interpreting prompt & inspecting active layout...');

    const userMessage: CopilotMessage = {
      id: `m-${Date.now()}-u`,
      role: 'user',
      text: prompt,
      timestamp: 'Just now',
    };
    setCopilotMessages((prev) => [...prev, userMessage]);

    const lower = prompt.toLowerCase();

    // Check for quick slash commands or layout switches immediately
    if (lower.startsWith('/viewport desktop') || lower.includes('1440') || lower.includes('desktop layout')) {
      handleSetGlobalViewport('desktop');
    } else if (lower.startsWith('/viewport mobile') || lower.includes('phone layout') || lower.includes('mobile layout')) {
      handleSetGlobalViewport('mobile');
    }

    try {
      const storeSetup = await cmsService.getStoreSetup().catch(() => null);
      const storeId = storeSetup?.id;

      // Call backend AI
      const res = await cmsService.chatAiWebsite({
        message: prompt,
        history: copilotMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.text,
        })),
        brandName: activeTemplate.brandName,
        industry: activeTemplate.category,
        storeId,
        currentTheme: {
          primary: clayTheme.primaryColor,
          secondary: clayTheme.accentColor,
          accent: clayTheme.accentColor,
          background: clayTheme.canvasBg,
          cardBg: clayTheme.cardBg,
          textColor: clayTheme.textColor,
          textMuted: clayTheme.textMuted,
          headingFont: clayTheme.fontFamily.split(',')[0].replace(/'/g, '').trim(),
          bodyFont: clayTheme.fontFamily.split(',')[0].replace(/'/g, '').trim(),
          borderRadius: `${clayTheme.borderRadius}px`,
          styleArchetype: activeTemplate.slug,
        },
        currentSections: (pageSections[activeScreenIndex] || []).map((s) => ({
          id: s.id,
          name: s.title,
          type: s.type,
          title: s.title,
          subtitle: s.subtitle,
          enabled: s.isVisible !== false,
          customHtml: s.customHtml,
        })),
      });

      if (res && res.project) {
        const proj = res.project;
        const newThemeTokens = proj.theme;

        // Apply updated theme tokens
        let updatedTheme = { ...clayTheme };
        if (newThemeTokens) {
          updatedTheme = {
            ...clayTheme,
            primaryColor: newThemeTokens.primary || clayTheme.primaryColor,
            accentColor: newThemeTokens.accent || clayTheme.accentColor,
            canvasBg: newThemeTokens.background || clayTheme.canvasBg,
            cardBg: newThemeTokens.cardBg || clayTheme.cardBg,
            textColor: newThemeTokens.textColor || clayTheme.textColor,
            textMuted: newThemeTokens.textMuted || clayTheme.textMuted,
            fontFamily: newThemeTokens.headingFont ? `${newThemeTokens.headingFont}, sans-serif` : clayTheme.fontFamily,
          };
          setClayTheme(updatedTheme);
        }

        // Apply template updates if brand/hero changed
        const updatedTmpl: StorefrontTemplateConfig = {
          ...activeTemplate,
          brandName: proj.brandName || activeTemplate.brandName,
          tagline: proj.tagline || activeTemplate.tagline,
          primaryColor: updatedTheme.primaryColor,
          accentColor: updatedTheme.accentColor,
          canvasBg: updatedTheme.canvasBg,
          cardBg: updatedTheme.cardBg,
          textColor: updatedTheme.textColor,
          textMuted: updatedTheme.textMuted,
          fontFamily: updatedTheme.fontFamily,
        };

        // If specific hero modifications returned
        if (lower.includes('hero') || lower.includes('title') || lower.includes('headline')) {
          const heroSec = proj.pages?.[0]?.sections?.find((s: any) => s.type === 'hero');
          if (heroSec) {
            updatedTmpl.hero = {
              ...updatedTmpl.hero,
              title: heroSec.title || updatedTmpl.hero.title,
              subtitle: heroSec.subtitle || updatedTmpl.hero.subtitle,
            };
          }
        }

        setCustomTemplateConfig(updatedTmpl);

        // Apply sections updates
        if (proj.pages?.[0]?.sections && Array.isArray(proj.pages[0].sections)) {
          const newSectionItems: WebsiteSectionItem[] = proj.pages[0].sections.map((s: any) => ({
            id: s.id,
            type: s.type,
            title: s.title || s.name,
            subtitle: s.subtitle,
            isVisible: s.enabled !== false,
            customHtml: s.customHtml,
            buttonText: s.contentJson?.primaryCta,
          }));
          setPageSections((prev) => ({
            ...prev,
            [activeScreenIndex]: newSectionItems,
          }));
        }

        // Refresh screens
        const refreshedScreens = getScreensForTemplate(updatedTmpl) as StitchScreenData[];
        setScreens(refreshedScreens);

        // Assistant reply message
        const assistantMsg: CopilotMessage = {
          id: `m-${Date.now()}-a`,
          role: 'assistant',
          text: res.reply || `I've updated your storefront as requested!`,
          timestamp: 'Just now',
          appliedChanges: res.appliedChanges || ['Applied real-time modifications'],
          suggestedReplies: res.suggestedReplies || [
            'Change background to warm cream',
            'Add verified reviews section',
            'Make CTA button emerald green',
          ],
        };

        setCopilotMessages((prev) => [...prev, assistantMsg]);
        if (res.suggestedReplies) {
          setDynamicSuggestedReplies(res.suggestedReplies);
        }
        if (res.appliedChanges) {
          setRecentAppliedChanges(res.appliedChanges);
        }

        // Save checkpoint
        setHistory((prev) => [
          ...prev.slice(0, historyIndex + 1),
          { screens: refreshedScreens, theme: updatedTheme },
        ]);
        setHistoryIndex((prev) => prev + 1);

        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.85, x: 0.2 },
          });
        } catch {}
      }
    } catch (err) {
      console.warn('AI chat call notice (falling back to smart heuristic):', err);
      handleOfflinePromptHeuristic(prompt);
    } finally {
      setIsGenerating(false);
      setGenerationStepMessage('');
    }
  };

  // Graceful Offline Heuristic Fallback
  const handleOfflinePromptHeuristic = (prompt: string) => {
    const lower = prompt.toLowerCase();
    const applied: string[] = [];

    // 1. Template switch heuristics
    if (lower.includes('funo') || lower.includes('furniture')) {
      handleSwitchTemplate('funo');
      applied.push('Switched to Funo Scandinavian Modern template');
    } else if (lower.includes('velvet') || lower.includes('luxury')) {
      handleSwitchTemplate('velvet-luxury');
      applied.push('Switched to Velvet Luxury template');
    } else if (lower.includes('artisan') || lower.includes('ceramic') || lower.includes('craft')) {
      handleSwitchTemplate('artisan-craft');
      applied.push('Switched to Artisan Craft template');
    } else if (lower.includes('pulse') || lower.includes('streetwear')) {
      handleSwitchTemplate('pulse-streetwear');
      applied.push('Switched to Pulse Streetwear template');
    } else if (lower.includes('botanica') || lower.includes('skincare')) {
      handleSwitchTemplate('botanica-wellness');
      applied.push('Switched to Botanica Wellness template');
    } else if (lower.includes('nova') || lower.includes('electronics')) {
      handleSwitchTemplate('nova-tech');
      applied.push('Switched to Nova Tech template');
    }

    // 2. Color adjustments
    if (lower.includes('emerald') || lower.includes('green')) {
      setClayTheme((prev) => ({ ...prev, primaryColor: '#059669', accentColor: '#34D399' }));
      applied.push('Changed primary color to Emerald Green (#059669)');
    } else if (lower.includes('terracotta') || lower.includes('orange')) {
      setClayTheme((prev) => ({ ...prev, primaryColor: '#C2410C', accentColor: '#D4A373' }));
      applied.push('Changed primary color to Terracotta (#C2410C)');
    } else if (lower.includes('blue') || lower.includes('indigo')) {
      setClayTheme((prev) => ({ ...prev, primaryColor: '#2563EB', accentColor: '#38BDF8' }));
      applied.push('Changed primary color to Indigo Blue (#2563EB)');
    } else if (lower.includes('dark') || lower.includes('obsidian')) {
      setClayTheme({ ...DARK_CLAY_THEME, shadowIntensity: 0.65, shadowSoftness: 20 });
      applied.push('Transformed canvas to Dark Obsidian theme');
    } else if (lower.includes('light') || lower.includes('cream') || lower.includes('sand')) {
      setClayTheme({ ...DEFAULT_CLAY_THEME, canvasBg: '#FAF8F2', cardBg: '#FFFFFF', shadowIntensity: 0.35 });
      applied.push('Transformed canvas to Warm Light Sand mode');
    }

    // 3. Button radius
    if (lower.includes('round') || lower.includes('pill')) {
      setClayTheme((prev) => ({ ...prev, borderRadius: 32 }));
      applied.push('Updated buttons and cards to rounded pill geometry');
    }

    // 4. Products / Catalog
    if (lower.includes('catalog') || lower.includes('products')) {
      setUseRealStoreProducts(true);
      applied.push('Synchronized real catalog items from your store');
    }

    const replyMsg =
      applied.length > 0
        ? `I have updated your storefront layout: ${applied.join(', ')}.`
        : `I've analyzed your prompt "${prompt}" and calibrated the design tokens accordingly!`;

    const assistantMsg: CopilotMessage = {
      id: `m-${Date.now()}-a`,
      role: 'assistant',
      text: replyMsg,
      timestamp: 'Just now',
      appliedChanges: applied,
      suggestedReplies: [
        'Change primary color to emerald green',
        'Add a 20% discount hero banner',
        'Switch all pages to Desktop 1440px layout',
      ],
    };

    setCopilotMessages((prev) => [...prev, assistantMsg]);
  };

  // Save customized storefront template and theme tokens to live store
  const handleSaveToStore = async () => {
    setIsSavingToStore(true);
    try {
      const storeSetup = await cmsService.getStoreSetup().catch(() => null);
      const storeId = storeSetup?.id;

      await cmsService.saveAiWebsite(
        {
          brandName: activeTemplate.brandName,
          templateSlug: activeTemplate.slug,
          designStyle: activeTemplate.slug,
          theme: {
            primary: clayTheme.primaryColor,
            secondary: clayTheme.accentColor,
            accent: clayTheme.accentColor,
            background: clayTheme.canvasBg,
            cardBg: clayTheme.cardBg,
            textColor: clayTheme.textColor,
            textMuted: clayTheme.textMuted,
            headingFont: clayTheme.fontFamily.split(',')[0].replace(/'/g, '').trim(),
            bodyFont: clayTheme.fontFamily.split(',')[0].replace(/'/g, '').trim(),
            borderRadius: `${clayTheme.borderRadius}px`,
          },
          sections: pageSections[activeScreenIndex] || [],
        },
        storeId
      );

      await cmsService.publishTemplate(activeTemplate.slug).catch(() => null);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.3 },
        });
      } catch {}

      alert(`✅ Successfully saved and activated "${activeTemplate.brandName}" on your live store!`);
    } catch (err: any) {
      console.error('Failed to save to store:', err);
      alert('Failed to save to store. Please verify your connection.');
    } finally {
      setIsSavingToStore(false);
    }
  };

  // Add a New Screen Artboard
  const handleAddNewScreen = () => {
    const newNumber = screens.length + 1;
    const newScreen: StitchScreenData = {
      id: `sc-${Date.now()}`,
      number: newNumber,
      slug: `page-${newNumber}`,
      title: `Custom Page ${newNumber}`,
      path: `/page-${newNumber}`,
      subtitle: 'Tailored AI page ready for section synthesis.',
      type: 'catalog',
      viewport: globalViewportMode === 'desktop' ? 'desktop' : 'mobile',
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenIndex(newNumber);
    handleFocusScreen(newNumber);
  };

  // Duplicate a Screen
  const handleDuplicateScreen = (screenNumber: number) => {
    const original = screens.find((s) => s.number === screenNumber);
    if (!original) return;

    const newNumber = screens.length + 1;
    const duplicated: StitchScreenData = {
      ...original,
      id: `sc-${Date.now()}`,
      number: newNumber,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      path: `${original.path || ''}-copy`,
    };

    setScreens((prev) => [...prev, duplicated]);
    setActiveScreenIndex(newNumber);
  };

  // Delete a Screen
  const handleDeleteScreen = (screenNumber: number) => {
    if (screens.length <= 1) return;
    setScreens((prev) =>
      prev
        .filter((s) => s.number !== screenNumber)
        .map((s, idx) => ({ ...s, number: idx + 1 }))
    );
    if (activeScreenIndex === screenNumber) {
      setActiveScreenIndex(1);
    }
  };

  // Add Section to Active Page
  const handleAddSectionToActivePage = (template: SectionTemplateDef) => {
    const currentSections = pageSections[activeScreenIndex] || [];
    const newSection: WebsiteSectionItem = {
      id: `sec-${Date.now()}`,
      type: template.type as any,
      title: template.defaultTitle,
      subtitle: template.defaultSubtitle,
      buttonText: template.defaultButtonText,
      isVisible: true,
    };

    setPageSections((prev) => ({
      ...prev,
      [activeScreenIndex]: [...currentSections, newSection],
    }));

    setSelectedSectionId(newSection.id);
    setIsSectionInspectorOpen(true);
  };

  // Update Section in Active Page
  const handleUpdateSection = (
    sectionId: string,
    updated: Partial<WebsiteSectionItem>
  ) => {
    const currentSections = pageSections[activeScreenIndex] || [];
    setPageSections((prev) => ({
      ...prev,
      [activeScreenIndex]: currentSections.map((s) =>
        s.id === sectionId ? { ...s, ...updated } : s
      ),
    }));
  };

  // Move Section Up/Down
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentSections = [...(pageSections[activeScreenIndex] || [])];
    const index = currentSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    const [removed] = currentSections.splice(index, 1);
    currentSections.splice(targetIndex, 0, removed);

    setPageSections((prev) => ({
      ...prev,
      [activeScreenIndex]: currentSections,
    }));
  };

  // Delete Section
  const handleDeleteSection = (sectionId: string) => {
    const currentSections = pageSections[activeScreenIndex] || [];
    setPageSections((prev) => ({
      ...prev,
      [activeScreenIndex]: currentSections.filter((s) => s.id !== sectionId),
    }));
  };

  // Toggle Visibility
  const handleToggleSectionVisibility = (sectionId: string) => {
    const currentSections = pageSections[activeScreenIndex] || [];
    setPageSections((prev) => ({
      ...prev,
      [activeScreenIndex]: currentSections.map((s) =>
        s.id === sectionId ? { ...s, ...isVisibleToggle(s.isVisible) } : s
      ),
    }));
  };

  const isVisibleToggle = (curr: boolean) => ({ isVisible: !curr });

  // Active Screen Metadata
  const activeScreen = screens.find((s) => s.number === activeScreenIndex) || screens[0];
  const activeSections = pageSections[activeScreenIndex] || [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FAF8F2] dark:bg-[#14151B] select-none flex flex-col font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER NAVIGATION BAR (Clean & Minimal)               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-[#E8E3D5] dark:border-[#262A36] bg-[#FAF8F2]/95 dark:bg-[#181A22]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Back / Clean Title / Template Selector */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title="Return to CMS Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Project Title with Inline Rename */}
          <div className="flex items-center gap-1.5">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="font-semibold text-xs sm:text-sm bg-white dark:bg-[#20232D] border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-lg focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer hover:opacity-75 transition truncate max-w-[120px] sm:max-w-[180px]"
                title="Click to rename"
              >
                {projectTitle.replace(/\s*Storefront\s*$/i, '')}
              </h1>
            )}
          </div>

          {/* Compact Template Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-[#222530] border border-[#DDD8C9] dark:border-[#2F3442] shadow-2xs text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-400 transition cursor-pointer"
              title="Switch Template"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeTemplate.primaryColor }}
              />
              <span className="truncate max-w-[85px] sm:max-w-[120px] text-[11.5px]">
                {activeTemplate.name}
              </span>
              <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
            </button>

            {isTemplateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsTemplateDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#1E212B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Storefront Template
                    </span>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                      {STOREFRONT_TEMPLATES_LIST.length}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-0.5 py-1 no-scrollbar">
                    {STOREFRONT_TEMPLATES_LIST.map((tmpl) => (
                      <button
                        key={tmpl.slug}
                        type="button"
                        onClick={() => {
                          handleSwitchTemplate(tmpl.slug);
                          setIsTemplateDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition flex items-center justify-between cursor-pointer ${
                          activeTemplateSlug === tmpl.slug
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: tmpl.primaryColor }}
                          />
                          <span className="text-xs truncate">{tmpl.name}</span>
                        </div>
                        {activeTemplateSlug === tmpl.slug && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Sleek Icon-Only Viewport Toggle */}
        <div className="hidden md:flex items-center bg-white/80 dark:bg-[#20232F]/80 border border-[#DDD8C9] dark:border-[#2F3442] p-0.5 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => handleSetGlobalViewport('desktop')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              globalViewportMode === 'desktop'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Desktop View (1440px)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSetGlobalViewport('tablet')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              globalViewportMode === 'tablet'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSetGlobalViewport('mobile')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              globalViewportMode === 'mobile'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSetGlobalViewport('mixed')}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              globalViewportMode === 'mixed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="All Devices / Multi-Flow Canvas"
          >
            <Layout className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: New Design + Save + Publish + More Menu + Avatar */}
        <div className="flex items-center gap-2">
          {/* Readdy AI: New Design with AI */}
          <button
            type="button"
            onClick={() => setIsPromptModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
            title="Create new design from prompt"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Design</span>
          </button>

          {/* Save to Store */}
          <button
            type="button"
            onClick={handleSaveToStore}
            disabled={isSavingToStore}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#222530] hover:bg-slate-50 dark:hover:bg-[#2A2E3B] border border-[#DDD8C9] dark:border-[#2F3442] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Save changes to store"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{isSavingToStore ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Publish Store */}
          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
            title="Publish Store Live"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          {/* More Actions Dropdown (•••) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-[#DDD8C9] dark:border-[#2F3442] bg-white dark:bg-[#222530]"
              title="More actions & tools"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#1E212B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrototypeOpen(true);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                    <span>Launch Prototype</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPaletteOpen(true);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-blue-500" />
                    <span>Colors & Styling</span>
                  </button>

                  {/* Typography Quick Selector */}
                  <div className="px-2.5 py-1.5 border-y border-slate-100 dark:border-slate-800 my-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs">Aa</span>
                        <span>Typography</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {TYPOGRAPHY_PRESETS.map((f) => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => {
                            setClayTheme((prev) => ({ ...prev, fontFamily: f.font }));
                          }}
                          className={`px-2 py-1 text-[11px] rounded-md text-left transition cursor-pointer flex items-center justify-between ${
                            clayTheme.fontFamily === f.font
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span>{f.name}</span>
                          {clayTheme.fontFamily === f.font && (
                            <Check className="w-3 h-3 text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUseRealStoreProducts(!useRealStoreProducts);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-3.5 h-3.5 text-amber-500" />
                      <span>{useRealStoreProducts ? 'Real Store Catalog' : 'AI Demo Catalog'}</span>
                    </div>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {useRealStoreProducts ? 'LIVE' : 'DEMO'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. INFINITE DOT GRID CANVAS WITH RESPONSIVE ARTBOARDS         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        id="canvas-grid-bg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex-1 relative overflow-hidden select-none ${
          isPanning
            ? 'cursor-grabbing'
            : activeTool === 'pan' || isSpacePressed
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
        style={{
          backgroundImage:
            clayTheme.mode === 'dark'
              ? 'radial-gradient(#252936 1.5px, transparent 1.5px)'
              : 'radial-gradient(#D5D0C0 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: `${panPosition.x}px ${panPosition.y}px`,
        }}
      >
        {/* Transformable Canvas Surface */}
        <div
          id="canvas-surface-area"
          className="absolute transition-transform duration-75 ease-out flex items-start gap-12 p-8"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
            transformOrigin: '0 0',
          }}
        >
          {screens.map((screen) => {
            const screenViewport = screen.viewport || 'mobile';

            return (
              <div key={screen.id} className="flex flex-col items-start gap-2.5 shrink-0">
                {/* Rendered Device / Desktop Artboard */}
                <ClaymorphicScreenRenderer
                  screen={screen}
                  template={activeTemplate}
                  theme={clayTheme}
                  isActive={activeScreenIndex === screen.number}
                  viewport={screenViewport}
                  onSelect={() => setActiveScreenIndex(screen.number)}
                  onNavigateToScreen={(targetNum) => handleFocusScreen(targetNum)}
                  onSelectSection={(secId) => {
                    setActiveScreenIndex(screen.number);
                    setSelectedSectionId(secId);
                    setIsSectionInspectorOpen(true);
                  }}
                  realProducts={realStoreProducts}
                  useRealProducts={useRealStoreProducts}
                  scale={1}
                />
              </div>
            );
          })}

          {/* Add Screen Artboard Pill Card */}
          <div
            onClick={handleAddNewScreen}
            className="w-[320px] h-[670px] rounded-[38px] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 transition flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0 bg-white/20 dark:bg-black/10"
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm">Add New Page Artboard</span>
            <span className="text-xs opacity-60">Synthesize customized eCommerce route</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. FLOATING VERTICAL RIGHT TOOLBAR                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <StitchToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onAddNewScreen={handleAddNewScreen}
        onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
        onOpenAddSectionModal={() => setIsAddSectionModalOpen(true)}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenSectionInspector={() => setIsSectionInspectorOpen(!isSectionInspectorOpen)}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. FLOATING BOTTOM-LEFT DOUGH TIME AI COPILOT                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <StitchCopilotPanel
        screensCount={screens.length}
        activeScreenIndex={activeScreenIndex}
        onSelectScreen={handleFocusScreen}
        onSendPrompt={handleExecuteAiPrompt}
        isGenerating={isGenerating}
        generationStepMessage={generationStepMessage}
        screensList={screens.map((s) => ({ number: s.number, title: s.title }))}
        onOpenColorPalette={() => setIsPaletteOpen(true)}
        onAddNewScreen={handleAddNewScreen}
        onSwitchGlobalViewport={handleSetGlobalViewport}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        messages={copilotMessages}
        suggestedReplies={dynamicSuggestedReplies}
        activeTemplateName={activeTemplate.name}
        brandName={activeTemplate.brandName}
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        onClearHistory={() => setCopilotMessages([])}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. FLOATING BOTTOM-RIGHT ZOOM & HISTORY CONTROLS              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="fixed right-6 bottom-6 z-40 flex items-center gap-2">
        <div className="bg-[#FAF8F2]/95 dark:bg-[#1B1D24]/95 backdrop-blur-xl border border-[#E5E0D3] dark:border-[#2E323D] rounded-full px-3 py-1.5 shadow-xl flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => {
              if (historyIndex > 0) {
                const prev = history[historyIndex - 1];
                setScreens(prev.screens);
                setClayTheme(prev.theme);
                setHistoryIndex(historyIndex - 1);
              }
            }}
            disabled={historyIndex <= 0}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (historyIndex < history.length - 1) {
                const next = history[historyIndex + 1];
                setScreens(next.screens);
                setClayTheme(next.theme);
                setHistoryIndex(historyIndex + 1);
              }
            }}
            disabled={historyIndex >= history.length - 1}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer disabled:opacity-30"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3 bg-black/10 dark:bg-white/10 mx-0.5" />

          {/* Zoom Percentage (from screenshot: 26%) */}
          <button
            type="button"
            onClick={handleFitToScreen}
            className="font-mono text-[11px] font-bold px-1.5 hover:text-black dark:hover:text-white cursor-pointer"
            title="Click to reset zoom to 26% (Fit)"
          >
            {Math.round(zoomScale * 100)}%
          </button>

          <div className="w-px h-3 bg-black/10 dark:bg-white/10 mx-0.5" />

          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(1.5, prev * 1.15))}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(0.12, prev * 0.85))}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Help button '?' */}
        <button
          type="button"
          onClick={() =>
            alert(
              'OmniStore AI Website Builder Studio (Google Stitch Engine)\n\n• Switch Viewports: Toggle between 1440px Desktop, 768px Tablet, and 375px Mobile per screen or globally.\n• Modular Sections: Click "Sections" on any artboard to customize headlines, reorder blocks, or add new sections.\n• Sync Store Catalog: Toggle "My Store Catalog" to pull live products from your CMS.\n• Live Storefront: Click "Publish Store" to deploy to your production domain with global CDN.'
            )
          }
          className="w-8 h-8 rounded-full bg-[#FAF8F2]/95 dark:bg-[#1B1D24]/95 backdrop-blur-xl border border-[#E5E0D3] dark:border-[#2E323D] shadow-xl flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition cursor-pointer"
          title="Studio Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. MODALS & SUB-PANELS                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Interactive Mobile & Desktop Prototype Player */}
      <StitchPrototypeModal
        isOpen={isPrototypeOpen}
        onClose={() => setIsPrototypeOpen(false)}
        screens={screens}
        template={activeTemplate}
        theme={clayTheme}
        initialScreenIndex={activeScreenIndex}
      />

      {/* Claymorphic Design & Palette Fine-Tuner */}
      <StitchClaymorphismPanel
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        theme={clayTheme}
        onUpdateTheme={(upd) => setClayTheme((p) => ({ ...p, ...upd }))}
        onResetTheme={() => setClayTheme(DEFAULT_CLAY_THEME)}
      />

      {/* Code & Tokens Export Modal */}
      <StitchExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectTitle={projectTitle}
        screens={screens}
        theme={clayTheme}
      />

      {/* Share Prototype Link Modal */}
      <StitchShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        projectTitle={projectTitle}
      />

      {/* Website Section Inspector Drawer */}
      <StitchSectionInspector
        isOpen={isSectionInspectorOpen}
        onClose={() => setIsSectionInspectorOpen(false)}
        activeScreenTitle={activeScreen.title}
        activeScreenNumber={activeScreen.number}
        sections={activeSections}
        selectedSectionId={selectedSectionId}
        onSelectSection={setSelectedSectionId}
        onUpdateSection={handleUpdateSection}
        onMoveSection={handleMoveSection}
        onDeleteSection={handleDeleteSection}
        onToggleVisibility={handleToggleSectionVisibility}
        onOpenAddSectionModal={() => setIsAddSectionModalOpen(true)}
        theme={clayTheme}
      />

      {/* Add Website Section Block Modal */}
      <StitchAddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={handleAddSectionToActivePage}
      />

      {/* Publish Storefront Modal */}
      <StitchPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        projectTitle={projectTitle}
        theme={clayTheme}
        screensCount={screens.length}
        templateSlug={activeTemplateSlug}
      />

      {/* Readdy AI: Create Storefront Design from Prompt / UI Ideas Modal */}
      <ReaddyPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onGenerate={handleGenerateDesignFromPrompt}
        isGenerating={isGenerating}
        generationStepMessage={generationStepMessage}
      />
    </div>
  );
}

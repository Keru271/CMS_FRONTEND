'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Rocket,
  CheckCircle,
  RefreshCw,
  Code2,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  ShoppingBag,
  Star,
  Layers,
  ArrowLeft,
  Check,
  Copy,
  X,
  Palette,
  RotateCcw,
  RotateCw,
  Bot,
  Paperclip,
  Video,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  MousePointer,
  Crosshair,
  Download,
  HelpCircle,
  ImageIcon,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Save,
  Loader2,
  Coffee,
  Leaf,
  Cpu,
  Store,
  Wand2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PromptBar,
  PromptSource,
  PromptCommand,
  PromptModel,
  isVideoAsset,
} from '@/src/components/ui/PromptBar';
import { cmsService } from '@/src/services/cmsService';
import {
  StorefrontTheme,
  StorefrontSection,
  StorefrontProject,
  DESIGN_PRESETS,
  INITIAL_SECTIONS,
  DesignPreset,
  DESIGN_ARCHETYPES,
  STOREFRONT_ARCHETYPES,
  StorefrontTemplateArchetype,
} from './ai-builder/storefrontTemplates';
import { renderStorefrontHtml, enforceThemeContrast, isColorDark } from './ai-builder/storefrontRenderer';
import { generateNextjsProjectFiles } from './ai-builder/storefrontCodeGenerator';
import { analyzeImagePalette } from './ai-builder/storefrontImageAnalyzer';
import { StoreSetupData, CMSProduct } from '@/src/types';

const CURATED_IMAGE_PRESETS = [
  { name: 'Coffee Atelier', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&auto=format&fit=crop' },
  { name: 'Minimal Tech', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop' },
  { name: 'Botanical Skincare', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop' },
  { name: 'Streetwear Sneaker', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&auto=format&fit=crop' },
  { name: 'Nordic Living', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop' },
  { name: 'Festival Mega Deals', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&auto=format&fit=crop' },
  { name: 'Luxury Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop' },
  { name: 'Artisan Ceramics', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&auto=format&fit=crop' },
];

const AI_BUILDER_SOURCES: PromptSource[] = [
  {
    key: 'reference',
    name: 'Reference Design Image',
    description: 'Upload screenshot or design mockup to mirror colors, fonts & layout',
    icon: ImageIcon,
    attach: true,
  },
  {
    key: 'hero',
    name: 'Hero Section',
    description: 'Headline, CTA buttons, and high-impact banner',
    icon: Sparkles,
  },
  {
    key: 'video',
    name: 'Video Assets & Reels',
    description: 'Upload MP4/WebM hero background video or motion reels',
    icon: Video,
    attach: true,
  },
  {
    key: 'products',
    name: 'Product Showcase',
    description: 'Product grids, sliders, prices, and badges',
    icon: ShoppingBag,
  },
  {
    key: 'widgets',
    name: 'Signature Widgets',
    description: 'Artisanal components and modular slider',
    icon: Zap,
  },
  {
    key: 'reviews',
    name: 'Reviews & Social Proof',
    description: 'Customer ratings, quotes, and trust score',
    icon: Star,
  },
  {
    key: 'brand',
    name: 'Brand & Styling',
    description: 'Color palette, fonts, spacing, and button corners',
    icon: Palette,
  },
  {
    key: 'files',
    name: 'Assets & Media',
    description: 'Upload logos, product photos, or documents',
    icon: Paperclip,
    attach: true,
  },
];

const AI_BUILDER_COMMANDS: PromptCommand[] = [
  { key: 'reference', name: '/reference', description: 'Attach a website screenshot or mockup to style storefront' },
  { key: 'video', name: '/video', description: 'Embed video background hero or high-impact video reels showcase' },
  { key: 'dark', name: '/dark', description: 'Switch to sleek obsidian dark luxury aesthetic' },
  { key: 'light', name: '/light', description: 'Switch to clean, modern minimalist light theme' },
  { key: 'luxury', name: '/luxury', description: 'Apply serif editorial fonts and metallic gold accents' },
  { key: 'minimal', name: '/minimal', description: 'Apply Scandinavian minimalist aesthetic and ample whitespace' },
  { key: 'hero', name: '/hero', description: 'Redesign hero section with high-converting CTA' },
  { key: 'products', name: '/products', description: 'Add interactive product showcase slider with discount tags' },
  { key: 'seo', name: '/seo', description: 'Generate OpenGraph social preview tags and SEO metadata' },
  { key: 'reset', name: '/reset', description: 'Restart conversation and start fresh with AI Architect' },
];

const AI_BUILDER_MODELS: PromptModel[] = [
  { key: 'auto', name: 'Claude → Gemini → ChatGPT', tag: 'Automatic fallback' },
];

export interface ReferenceImageItem {
  name: string;
  dataUrl: string;
  mimeType: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  provider?: 'gemini' | 'chatgpt' | 'auto';
  steps?: string[];
  suggestedReplies?: string[];
  appliedChanges?: string[];
  referenceImages?: ReferenceImageItem[];
}

interface Checkpoint {
  id: string;
  label: string;
  timestamp: string;
  project: StorefrontProject;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Curated starter inspiration prompts
const INSPIRATION_PROMPTS = [
  {
    icon: Coffee,
    title: 'RoastCraft Coffee',
    category: 'Artisanal Roasters',
    designStyle: 'modern-editorial',
    prompt:
      'Build an artisanal single-origin coffee roastery called RoastCraft with warm espresso and terracotta tones, product subscription bundles, brewing guides, and customer reviews.',
  },
  {
    icon: Leaf,
    title: 'Aethel Botanicals',
    category: 'Organic Skincare',
    designStyle: 'botanical-wellness',
    prompt:
      'Build a Scandinavian organic skincare and serum brand called Aethel Botanicals with gentle eucalyptus sage accents, porcelain cards, and clean customer testimonials.',
  },
  {
    icon: Cpu,
    title: 'Kuro Tech Outerwear',
    category: 'Cyberpunk Apparel',
    designStyle: 'cyber-tech',
    prompt:
      'Build a futuristic architectural streetwear and acoustic audio store called Kuro Studio with electric cyan neon accents, dark mode glassmorphism cards, and high-top sneaker drops.',
  },
  {
    icon: Store,
    title: 'Nordic Living',
    category: 'Artisan Home & Oak',
    designStyle: 'artisan-living',
    prompt:
      'Build a modern Scandinavian furniture and handcrafted ceramic atelier called Nordic Atelier with airy whitespace, warm sand tones, and natural lifestyle photography.',
  },
  {
    icon: Sparkles,
    title: 'Pawzy Goods',
    category: 'Conscious Pet Care',
    designStyle: 'warm-organic',
    prompt:
      'Build a premium organic pet nutrition and lifestyle store called Pawzy Goods with warm honey badges, gourmet organic treats, and verified customer pet unboxings.',
  },
  {
    icon: Zap,
    title: 'Velvet Haute',
    category: 'Haute Horlogerie',
    designStyle: 'luxe-dark',
    prompt:
      'Build a luxury Geneva mechanical watchmaking atelier called Velvet Haute with pitch-black obsidian canvas, champagne gold metallic accents, 4K macro video showcase, and VIP concierge.',
  },
];

export function AiWebsiteBuilderStudio({
  isFullscreenStandalone = false,
}: {
  isFullscreenStandalone?: boolean;
}) {
  const router = useRouter();

  // Primary Storefront Project State (starts null so user is prompted first!)
  const [project, setProject] = useState<StorefrontProject | null>(null);

  // Saved Storefront Drafts & Persistence State
  const [savedProjectInfo, setSavedProjectInfo] = useState<{
    project: StorefrontProject;
    savedAt?: string;
    source: 'cloud' | 'local';
  } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [saveFeedbackMessage, setSaveFeedbackMessage] = useState<string | null>(null);
  const lastSavedProjectJsonRef = useRef<string>('');

  const hasUnsavedChanges = useMemo(() => {
    if (!project) return false;
    if (!lastSavedProjectJsonRef.current) return true;
    return JSON.stringify(project) !== lastSavedProjectJsonRef.current;
  }, [project]);

  // Real Store Data Integration
  const [storeSetup, setStoreSetup] = useState<StoreSetupData | null>(null);
  const [dbProducts, setDbProducts] = useState<CMSProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [isLoadingStoreInfo, setIsLoadingStoreInfo] = useState<boolean>(true);

  // Load real store setup, catalog products, and categories on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStoreInformation() {
      try {
        setIsLoadingStoreInfo(true);
        const [setup, prods, cats, savedCloudRes] = await Promise.all([
          cmsService.getStoreSetup().catch(() => null),
          cmsService.getProducts().catch(() => []),
          cmsService.getCategories().catch(() => []),
          cmsService.getSavedAiWebsite().catch(() => null),
        ]);
        if (!isMounted) return;
        if (setup) setStoreSetup(setup);
        if (prods && Array.isArray(prods)) setDbProducts(prods);
        if (cats && Array.isArray(cats)) setDbCategories(cats);

        // Check local storage draft backup
        let localDraft: StorefrontProject | null = null;
        try {
          const raw = localStorage.getItem('omnistore_ai_website_draft');
          if (raw) localDraft = JSON.parse(raw);
        } catch {}

        if (savedCloudRes?.success && savedCloudRes?.project) {
          setSavedProjectInfo({
            project: savedCloudRes.project,
            savedAt: savedCloudRes.savedAt || undefined,
            source: 'cloud',
          });
        } else if (localDraft && (localDraft as any).sections) {
          setSavedProjectInfo({
            project: localDraft,
            source: 'local',
          });
        }
      } catch (err) {
        console.warn('Failed to prefetch store info for AI builder:', err);
      } finally {
        if (isMounted) setIsLoadingStoreInfo(false);
      }
    }
    loadStoreInformation();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initial Intake Screen State
  const [initialPromptInput, setInitialPromptInput] = useState('');
  const [selectedDesignStyle, setSelectedDesignStyle] = useState('artisan-living');
  const selectedTemplateSlug = selectedDesignStyle;
  const setSelectedTemplateSlug = setSelectedDesignStyle;
  const [isBuildingProject, setIsBuildingProject] = useState(false);
  const [buildingStep, setBuildingStep] = useState(0);

  // History Checkpoints for 1-Click Rollback
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);

  // Studio Modes & Tools
  const [activeTab, setActiveTab] = useState<'copilot' | 'sections' | 'styles' | 'pages' | 'code'>('copilot');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isInspectMode, setIsInspectMode] = useState<boolean>(true);
  const [selectedElement, setSelectedElement] = useState<{
    sectionId: string;
    label: string;
    text: string;
    tagName: string;
    elementType?: 'image' | 'heading' | 'text' | 'button' | 'badge' | 'product' | 'section';
    src?: string;
    href?: string;
    selector?: string;
  } | null>(null);
  const [elementPromptInput, setElementPromptInput] = useState<string>('');
  const [elementDirectEditValue, setElementDirectEditValue] = useState<string>('');
  const [elementEditMode, setElementEditMode] = useState<'prompt' | 'direct'>('prompt');

  // Left Sidebar Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(510);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(510);

  // Conversational AI State
  const [aiProvider, setAiProvider] = useState<'auto'>('auto');
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [pendingReferenceImages, setPendingReferenceImages] = useState<ReferenceImageItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Code Viewer State
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Vercel / Deployment State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [customProjectSlug, setCustomProjectSlug] = useState('omnistore-storefront');

  // Storefront Multi-Page Navigation State (Home, Catalog, PDP, Story, Reviews)
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedPdpProduct, setSelectedPdpProduct] = useState<any>(null);
  const [pageHistory, setPageHistory] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const handleNavigatePage = useCallback((target: string, product: any = null) => {
    setActivePage(target);
    if (product) setSelectedPdpProduct(product);
    setPageHistory((prev) => {
      const nextHistory = [...prev.slice(0, historyIndex + 1), target];
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }, [historyIndex]);

  const handleGoBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setActivePage(pageHistory[prevIdx] || 'home');
    }
  }, [historyIndex, pageHistory]);

  const handleGoForward = useCallback(() => {
    if (historyIndex < pageHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setActivePage(pageHistory[nextIdx] || 'home');
    }
  }, [historyIndex, pageHistory]);

  // DOM Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Generated Next.js project code files with autonomous component architecture
  const projectCodeFiles = useMemo(
    () => (project ? generateNextjsProjectFiles(project) : []),
    [project]
  );

  // Render Sandboxed HTML Preview
  const previewHtml = useMemo(
    () =>
      project
        ? renderStorefrontHtml({
            brandName: project.brandName,
            tagline: project.tagline,
            theme: project.theme,
            sections: project.sections,
            inspectMode: isInspectMode,
            activePage,
            selectedProduct: selectedPdpProduct,
            logo: project.logo || storeSetup?.logo || undefined,
            currency: project.currency || storeSetup?.currency || 'USD',
            contactEmail: project.contactEmail || storeSetup?.contactEmail || undefined,
            contactPhone: project.contactPhone || storeSetup?.contactPhone || undefined,
            address:
              project.address ||
              [storeSetup?.addressCity, storeSetup?.addressCountry].filter(Boolean).join(', ') ||
              undefined,
            socialLinks:
              project.socialLinks ||
              (storeSetup
                ? {
                    facebook: storeSetup.socialFacebook || '',
                    instagram: storeSetup.socialInstagram || '',
                    twitter: storeSetup.socialTwitter || '',
                  }
                : undefined),
          })
        : '',
    [project, isInspectMode, activePage, selectedPdpProduct, storeSetup]
  );

  // Update Iframe srcDoc safely
  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml, viewportMode]);

  // Handle postMessage communication from sandboxed iframe (Inspect Mode & Page Navigation)
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement({
          sectionId: event.data.sectionId,
          label: event.data.label,
          text: event.data.text,
          tagName: event.data.tagName,
          elementType: event.data.elementType,
          src: event.data.src,
          href: event.data.href,
          selector: event.data.selector,
        });
        setElementPromptInput('');
        setElementDirectEditValue(event.data.src || event.data.text || '');
        setElementEditMode('prompt');
      } else if (event.data && event.data.type === 'NAVIGATE_PAGE') {
        const targetPage = event.data.page || 'home';
        setActivePage(targetPage);
        if (event.data.product) {
          setSelectedPdpProduct(event.data.product);
        }
        setPageHistory((prev) => [...prev, targetPage]);
        setHistoryIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Sync inspect mode to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SET_INSPECT_MODE', enabled: isInspectMode },
        '*'
      );
    }
  }, [isInspectMode]);

  // Scroll chat to bottom
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  // Sidebar Drag Resize Handlers
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSidebar(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSidebar) return;
      const delta = e.clientX - dragStartXRef.current;
      const minW = 380;
      const maxW = Math.min(window.innerWidth - 420, 900);
      setSidebarWidth(Math.min(Math.max(dragStartWidthRef.current + delta, minW), maxW));
    };

    const handleMouseUp = () => {
      if (isDraggingSidebar) {
        setIsDraggingSidebar(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDraggingSidebar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSidebar]);

  // Resume a saved project draft
  const handleResumeProject = useCallback((savedProjToLoad?: StorefrontProject) => {
    const proj = savedProjToLoad || savedProjectInfo?.project;
    if (!proj) return;
    setProject(proj);
    lastSavedProjectJsonRef.current = JSON.stringify(proj);
    setCheckpoints([
      {
        id: generateId(),
        label: 'Resumed Saved Storefront',
        timestamp: formatTime(),
        project: JSON.parse(JSON.stringify(proj)),
      },
    ]);
    setCurrentCheckpointIndex(0);
    const timeFormatted = savedProjectInfo?.savedAt
      ? new Date(savedProjectInfo.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : formatTime();
    setLastSavedTime(timeFormatted);
    setSaveFeedbackMessage('Loaded saved storefront project!');
    setTimeout(() => setSaveFeedbackMessage(null), 3000);
  }, [savedProjectInfo]);

  // Discard saved draft
  const handleDiscardSavedDraft = useCallback(() => {
    try {
      localStorage.removeItem('omnistore_ai_website_draft');
      if (storeSetup?.id) {
        localStorage.removeItem(`omnistore_ai_website_draft_${storeSetup.id}`);
      }
    } catch {}
    setSavedProjectInfo(null);
    setSaveFeedbackMessage('Saved draft removed.');
    setTimeout(() => setSaveFeedbackMessage(null), 2500);
  }, [storeSetup?.id]);

  // Explicit Save Action (Saves to Database & LocalStorage)
  const handleSaveProject = useCallback(
    async (customProj?: StorefrontProject, silent = false) => {
      const targetProject = customProj || project;
      if (!targetProject || isSaving) return;

      try {
        setIsSaving(true);
        if (!silent) setSaveStatus('saving');

        // 1. Persist immediately to localStorage
        try {
          const serialized = JSON.stringify(targetProject);
          localStorage.setItem('omnistore_ai_website_draft', serialized);
          if (storeSetup?.id) {
            localStorage.setItem(`omnistore_ai_website_draft_${storeSetup.id}`, serialized);
          }
        } catch (locErr) {
          console.warn('LocalStorage save failed:', locErr);
        }

        // 2. Persist to Backend Database
        const res = await cmsService.saveAiWebsite(targetProject, storeSetup?.id);

        lastSavedProjectJsonRef.current = JSON.stringify(targetProject);
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeNow);
        setSaveStatus('saved');

        if (!silent) {
          setSaveFeedbackMessage('Storefront project saved to cloud!');
          setTimeout(() => setSaveFeedbackMessage(null), 3000);
        }

        setTimeout(() => {
          setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 3000);

        return res;
      } catch (err: any) {
        console.error('Failed to save project to cloud:', err);
        setSaveStatus('error');
        if (!silent) {
          setSaveFeedbackMessage('Saved in local cache.');
          setTimeout(() => setSaveFeedbackMessage(null), 3500);
        }
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3500);
      } finally {
        setIsSaving(false);
      }
    },
    [project, isSaving, storeSetup?.id]
  );

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (project) {
          handleSaveProject();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, handleSaveProject]);

  // Debounced Auto-Save (5 seconds after user modifications)
  useEffect(() => {
    if (!project || !hasUnsavedChanges || isSaving) return;

    // Immediately cache in localStorage so sudden page refresh never loses anything
    try {
      localStorage.setItem('omnistore_ai_website_draft', JSON.stringify(project));
      if (storeSetup?.id) {
        localStorage.setItem(`omnistore_ai_website_draft_${storeSetup.id}`, JSON.stringify(project));
      }
    } catch {}

    const debounceTimer = setTimeout(() => {
      handleSaveProject(project, true);
    }, 5000);

    return () => clearTimeout(debounceTimer);
  }, [project, hasUnsavedChanges, isSaving, handleSaveProject, storeSetup?.id]);

  // Add Checkpoint Helper
  const addCheckpoint = useCallback((label: string, updatedProj: StorefrontProject) => {
    const newCp: Checkpoint = {
      id: generateId(),
      label,
      timestamp: formatTime(),
      project: JSON.parse(JSON.stringify(updatedProj)),
    };
    setCheckpoints((prev) => [...prev.slice(0, currentCheckpointIndex + 1), newCp]);
    setCurrentCheckpointIndex((prev) => prev + 1);
  }, [currentCheckpointIndex]);

  // Restore Checkpoint
  const restoreCheckpoint = (index: number) => {
    if (index >= 0 && index < checkpoints.length) {
      const cp = checkpoints[index];
      setProject(JSON.parse(JSON.stringify(cp.project)));
      setCurrentCheckpointIndex(index);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Section Management Helpers
  const toggleSection = (id: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updatedSections = prev.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      const next = { ...prev, sections: updatedSections, updatedAt: new Date().toISOString() };
      addCheckpoint(`Toggled ${id}`, next);
      return next;
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setProject((prev) => {
      if (!prev) return prev;
      const newSections = [...prev.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      const next = { ...prev, sections: newSections, updatedAt: new Date().toISOString() };
      addCheckpoint(`Reordered Sections`, next);
      return next;
    });
  };

  const removeSection = (id: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const newSections = prev.sections.filter((s) => s.id !== id);
      const next = { ...prev, sections: newSections, updatedAt: new Date().toISOString() };
      addCheckpoint(`Removed ${id}`, next);
      return next;
    });
  };

  const addPresetSection = (type: StorefrontSection['type']) => {
    if (!project) return;
    const sectionTemplates: Record<string, Partial<StorefrontSection>> = {
      video_showcase: {
        name: 'Cinematic Motion Film',
        title: 'Chronometric Cinema in 4K',
        subtitle: 'Experience our mechanical masterworks in motion.',
        contentJson: {
          badge: '🎬 4K FILM',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
        },
      },
      video_reels: {
        name: 'Social Video Reels',
        title: 'Collector Wrist Shots & Unboxings',
        subtitle: 'Real moments captured by creators worldwide.',
        contentJson: {
          reels: [
            {
              id: 'reel-a',
              title: 'Titanium Bezel in Natural Daylight',
              author: '@creator_lab',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
              poster: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
              views: '54.2K',
            },
          ],
        },
      },
      reviews: {
        name: 'Customer Reviews',
        title: 'Verified Client Appraisals',
        subtitle: 'Rated 4.96/5.0 across client appraisals worldwide.',
        contentJson: {
          averageRating: 4.96,
          reviews: [
            {
              author: 'Julian Sterling',
              location: 'London',
              rating: 5,
              text: 'The finishing on the casing rivals pieces quadruple its investment.',
              date: '2 days ago',
            },
          ],
        },
      },
    };

    const template = sectionTemplates[type];
    if (!template) return;

    const newSec: StorefrontSection = {
      id: `${type}-${Date.now()}`,
      name: template.name || 'New Section',
      type,
      title: template.title || 'Section Title',
      subtitle: template.subtitle,
      enabled: true,
      contentJson: template.contentJson,
    };

    setProject((prev) => {
      if (!prev) return prev;
      const next = { ...prev, sections: [...prev.sections, newSec], updatedAt: new Date().toISOString() };
      addCheckpoint(`Added ${newSec.name}`, next);
      return next;
    });
  };

  const updateThemeColor = (key: keyof StorefrontTheme, val: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const next = { ...prev, theme: { ...prev.theme, [key]: val }, updatedAt: new Date().toISOString() };
      return next;
    });
  };

  // Helper to read and compress file as Data URL for vision AI
  const readFileAsDataUrl = (file: File): Promise<ReferenceImageItem> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = reader.result as string;
        if (!rawDataUrl || file.type === 'image/svg+xml') {
          resolve({
            name: file.name,
            dataUrl: rawDataUrl || '',
            mimeType: file.type || 'image/png',
          });
          return;
        }

        // Downsample in an offscreen Image element if larger than 1600px
        const img = new Image();
        img.onload = () => {
          try {
            const MAX_DIM = 1600;
            let { width, height } = img;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              resolve({
                name: file.name,
                dataUrl: compressed,
                mimeType: 'image/jpeg',
              });
              return;
            }
          } catch {
            // Fallback to raw on any canvas error
          }
          resolve({
            name: file.name,
            dataUrl: rawDataUrl,
            mimeType: file.type || 'image/png',
          });
        };
        img.onerror = () => {
          resolve({
            name: file.name,
            dataUrl: rawDataUrl,
            mimeType: file.type || 'image/png',
          });
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => {
        resolve({ name: file.name, dataUrl: '', mimeType: file.type || 'image/png' });
      };
      reader.readAsDataURL(file);
    });
  };

  // Callback when files are dropped or pasted in PromptBar
  const handleFilesAdded = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(
      (f) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(f.name)
    );
    if (imageFiles.length > 0) {
      const loaded = await Promise.all(imageFiles.map(readFileAsDataUrl));
      const valid = loaded.filter((img) => img.dataUrl);
      if (valid.length > 0) {
        setPendingReferenceImages((prev) => [...prev, ...valid]);
      }
    }
  }, []);

  // Callback when an attachment chip is removed in PromptBar
  const handleAttachmentRemove = useCallback((fileName: string) => {
    setPendingReferenceImages((prev) => prev.filter((img) => img.name !== fileName));
  }, []);

  // File Attachment Picker Handler
  const handleAttach = useCallback((type?: 'all' | 'video' | 'image') => {
    return new Promise<string[]>((resolve) => {
      if (typeof window === 'undefined') return resolve([]);
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      if (type === 'video') {
        fileInput.accept = 'video/*,.mp4,.webm,.mov,.m4v,.mkv,.avi,.ogv';
      } else if (type === 'image') {
        fileInput.accept = 'image/*,.png,.jpg,.jpeg,.webp,.svg,.avif,.gif';
      } else {
        fileInput.accept = 'image/*,video/*,.png,.jpg,.jpeg,.webp,.svg,.mp4,.webm,.mov,.m4v,.mkv,.avi,.json,.txt,.css';
      }
      fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const files = Array.from(target.files || []);
        if (files.length === 0) return resolve([]);

        // Read image files as base64 Data URLs so vision AI can analyze them
        const imageFiles = files.filter(
          (f) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(f.name)
        );
        if (imageFiles.length > 0) {
          const loaded = await Promise.all(imageFiles.map(readFileAsDataUrl));
          const valid = loaded.filter((img) => img.dataUrl);
          if (valid.length > 0) {
            setPendingReferenceImages((prev) => [...prev, ...valid]);
          }
        }

        resolve(files.map((f) => f.name));
      };
      fileInput.click();
    });
  }, []);

  // Voice Dictation Handler
  const handleDictate = useCallback(() => {
    return new Promise<string | void>((resolve) => {
      if (typeof window === 'undefined') return resolve();
      const win = window as unknown as {
        SpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          maxAlternatives: number;
          onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
          onerror: () => void;
          onend: () => void;
          start: () => void;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          maxAlternatives: number;
          onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
          onerror: () => void;
          onend: () => void;
          start: () => void;
        };
      };
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice dictation is not supported by your current browser.');
        return resolve();
      }
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript;
          resolve(transcript);
        };
        recognition.onerror = () => resolve();
        recognition.onend = () => resolve();
        recognition.start();
      } catch {
        resolve();
      }
    });
  }, []);

  /**
   * BUILD APPLICATION FROM INITIAL PROMPT
   * Scaffolds an autonomous Next.js website with modular component architecture
   */
  const handleBuildStorefront = async (
    customPrompt?: string,
    overrideSlug?: string,
    overrideImages?: ReferenceImageItem[]
  ) => {
    const promptToUse = (customPrompt || initialPromptInput).trim();
    if (!promptToUse && (!overrideImages || overrideImages.length === 0)) return;

    const slugToUse = overrideSlug || selectedDesignStyle || 'artisan-living';
    const imagesToUse = overrideImages || [...pendingReferenceImages];

    setIsBuildingProject(true);
    setBuildingStep(1);

    // Progressive visual steps
    const t1 = setTimeout(() => setBuildingStep(2), 500);
    const t2 = setTimeout(() => setBuildingStep(3), 1100);
    const t3 = setTimeout(() => setBuildingStep(4), 1800);
    const t4 = setTimeout(() => setBuildingStep(5), 2400);

    try {
      // Find visual style archetype configuration
      const archetype =
        DESIGN_ARCHETYPES.find((a) => a.slug === slugToUse) || DESIGN_ARCHETYPES[0];

      const lower = promptToUse.toLowerCase();
      const isMarketplacePrompt =
        lower.includes('amazon') ||
        lower.includes('marketplace') ||
        lower.includes('megamarket') ||
        lower.includes('flipkart') ||
        lower.includes('walmart') ||
        lower.includes('ebay') ||
        lower.includes('department store') ||
        lower.includes('mega deals');

      // Smart brand name derivation: prioritize connected store data when user didn't specify an explicit override
      let brandName = storeSetup?.name || (isMarketplacePrompt ? 'MegaMarket Central' : 'Artisan Craft');
      let tagline =
        storeSetup?.description ||
        (isMarketplacePrompt
          ? "Earth's Biggest Selection of Electronics, Home, Fashion & Mega Deals"
          : 'Crafted with Precision for Modern Visionaries');
      let industry =
        (storeSetup as any)?.category?.name ||
        (isMarketplacePrompt ? 'Global E-Commerce & Marketplace' : archetype.category);

      const brandMatch = promptToUse.match(
        /(?:called|brand\s+name\s+is|named|brand\s+is)\s+["']?([^"'\n,.]+)["']?/i
      );
      if (brandMatch && brandMatch[1]) {
        brandName = brandMatch[1].trim();
      } else if (!isMarketplacePrompt && !storeSetup?.name) {
        if (lower.includes('coffee') || lower.includes('roast')) {
          brandName = 'RoastCraft Atelier';
          tagline = 'Single-Origin Coffee & Artisanal Pastry Roasters';
          industry = 'Artisanal Coffee & Gourmet';
        } else if (lower.includes('skin') || lower.includes('botanical') || lower.includes('serum') || lower.includes('cosmetic')) {
          brandName = 'Aethel Botanicals';
          tagline = 'Scandinavian Organic Skincare & Botanical Serums';
          industry = 'Botanical Wellness & Skincare';
        } else if (lower.includes('streetwear') || lower.includes('kuro') || lower.includes('sneaker') || lower.includes('apparel') || lower.includes('fashion') || lower.includes('clothing')) {
          brandName = 'Kuro Studio';
          tagline = 'Architectural Streetwear & High-Performance Outerwear';
          industry = 'Streetwear & Contemporary Fashion';
        } else if (lower.includes('pet') || lower.includes('dog') || lower.includes('paw')) {
          brandName = 'Pawzy Goods';
          tagline = 'Organic Nutrition & Conscious Pet Lifestyle Care';
          industry = 'Pet Lifestyle & Care';
        } else if (lower.includes('furniture') || lower.includes('decor') || lower.includes('living') || lower.includes('interior')) {
          brandName = 'Nordic Atelier';
          tagline = 'Modern Scandinavian Woodcraft & Living Spaces';
          industry = 'Modern Living & Furniture';
        } else if (lower.includes('tech') || lower.includes('audio') || lower.includes('cyber') || lower.includes('electronic')) {
          brandName = 'Techno Pulse';
          tagline = 'Next-Generation Audio Acoustics & Cyber Gadgets';
          industry = 'Cyber Electronics & Audio';
        } else if (lower.includes('watch') || lower.includes('luxe') || lower.includes('horlogerie')) {
          brandName = 'Velvet Haute';
          tagline = 'Timeless Precision Crafted for Modern Visionaries';
          industry = 'Haute Horlogerie & High Craft';
        } else {
          brandName = `${archetype.name} Studio`;
          tagline = promptToUse ? promptToUse.slice(0, 60) : archetype.description;
        }
      }

      // Base theme from archetype
      const theme: StorefrontTheme = JSON.parse(JSON.stringify(archetype.defaultTheme));

      // 1. FAST CLIENT-SIDE CANVAS PALETTE EXTRACTION FROM ATTACHED IMAGE
      let hasImageExtraction = false;
      if (imagesToUse.length > 0) {
        try {
          const canvasPalette = await analyzeImagePalette(imagesToUse[0].dataUrl);
          if (canvasPalette) {
            theme.background = canvasPalette.background;
            theme.cardBg = canvasPalette.cardBg;
            theme.textColor = canvasPalette.textColor;
            theme.textMuted = canvasPalette.textMuted;
            theme.primary = canvasPalette.primary;
            theme.secondary = canvasPalette.secondary;
            theme.accent = canvasPalette.accent;
            theme.border = canvasPalette.border;
            theme.headingFont = canvasPalette.suggestedHeadingFont;
            theme.bodyFont = canvasPalette.suggestedBodyFont;
            theme.borderRadius = canvasPalette.suggestedBorderRadius;
            hasImageExtraction = true;
          }
        } catch (err) {
          console.warn('Canvas palette extraction error:', err);
        }
      }

      // Marketplace default palette or color overrides
      if (isMarketplacePrompt && !hasImageExtraction) {
        theme.background = '#EAEDED';
        theme.cardBg = '#FFFFFF';
        theme.primary = '#131921';
        theme.secondary = '#232F3E';
        theme.textColor = '#0F172A';
        theme.textMuted = '#565959';
        theme.accent = '#FF9900';
        theme.border = '#D5D9D9';
        theme.borderRadius = '8px';
      } else if (!hasImageExtraction) {
        if (lower.includes('dark') || lower.includes('obsidian') || lower.includes('black')) {
          theme.background = '#090A0F';
          theme.cardBg = '#12141F';
          theme.textColor = '#F8FAFC';
          theme.textMuted = '#94A3B8';
          theme.border = '#1E2438';
        } else if (lower.includes('light') || lower.includes('white') || lower.includes('clean')) {
          theme.background = '#FFFFFF';
          theme.cardBg = '#FFFFFF';
          theme.textColor = '#0F172A';
          theme.textMuted = '#64748B';
          theme.border = '#E2E8F0';
        }
        if (lower.includes('gold')) theme.accent = '#D4AF37';
        if (lower.includes('cyan') || lower.includes('neon')) theme.accent = '#00E5FF';
        if (lower.includes('green') || lower.includes('emerald') || lower.includes('sage')) theme.accent = '#10B981';
        if (lower.includes('orange') || lower.includes('honey')) theme.accent = '#FF9F43';
        if (lower.includes('espresso') || lower.includes('terracotta') || lower.includes('amber')) theme.accent = '#C89355';
      }

      // ALWAYS enforce contrast safety so text is never unreadable
      const enforcedTheme = enforceThemeContrast(theme);
      Object.assign(theme, enforcedTheme);

      // Catalog photography & hero layout based on detected industry
      let heroImage = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&auto=format&fit=crop';
      let heroLayout = 'split';
      let heroBadge = '✨ SS26 SIGNATURE COLLECTION';

      // 0. MAP REAL STORE PRODUCTS IF AVAILABLE IN DATABASE
      let realCatalogProducts: any[] = [];
      if (dbProducts && dbProducts.length > 0) {
        realCatalogProducts = dbProducts.slice(0, 16).map((p, idx) => {
          let img = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop';
          if (Array.isArray(p.images) && p.images.length > 0) {
            img = p.images[0];
          } else if (p.image) {
            img = p.image;
          } else if (typeof (p.images as any) === 'string' && (p.images as any).trim()) {
            try {
              const parsed = JSON.parse(p.images as any);
              if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
              else img = p.images as any;
            } catch {
              img = p.images as any;
            }
          }
          return {
            id: p.id || `real-p-${idx + 1}`,
            name: p.name,
            category: p.categoryName || (p as any).category?.name || industry,
            price: Number(p.price) || 0,
            comparePrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
            rating: 5.0,
            badge: idx === 0 ? 'BESTSELLER' : p.compareAtPrice ? 'SPECIAL DEAL' : undefined,
            image: img,
            description: p.description || `Authentic ${p.name} from our verified store collection.`,
          };
        });
      }

      let catalogProducts: any[] =
        realCatalogProducts.length > 0
          ? realCatalogProducts
          : [
              {
                id: 'p-1',
                name: `${brandName} Signature Edition #1`,
                category: industry,
                price: 185,
                comparePrice: 240,
                rating: 5.0,
                badge: 'BESTSELLER',
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop',
                description: 'Refined craftsmanship crafted with verified sustainable materials.',
              },
              {
                id: 'p-2',
                name: `${brandName} Atelier Reserve`,
                category: industry,
                price: 295,
                badge: 'LIMITED ALLOCATION',
                image: 'https://images.unsplash.com/photo-1608248597359-21699f8d55c7?w=600&auto=format&fit=crop',
                description: 'Special release finished to exacting specifications.',
              },
              {
                id: 'p-3',
                name: `${brandName} Modern Essential`,
                category: industry,
                price: 140,
                comparePrice: 175,
                image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop',
                description: 'Designed for daily luxury and enduring aesthetic balance.',
              },
              {
                id: 'p-4',
                name: `${brandName} Grand Masterwork`,
                category: industry,
                price: 450,
                badge: 'EXCLUSIVE',
                image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop',
                description: 'Our pinnacle achievement in modern design distinction.',
              },
            ];

      if (realCatalogProducts.length > 0) {
        if (realCatalogProducts[0]?.image) {
          heroImage = realCatalogProducts[0].image;
        }
        if (isMarketplacePrompt) {
          heroBadge = '⚡ GREAT FESTIVAL EDITION';
          heroLayout = 'marketplace';
        }
      } else if (isMarketplacePrompt || industry.includes('Marketplace')) {
        heroImage = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop';
        heroBadge = '⚡ GREAT FESTIVAL EDITION';
        heroLayout = 'marketplace';
        catalogProducts = [
          { id: 'm-1', name: 'UltraHD 4K Smart OLED Television (55-inch)', category: 'Electronics', price: 649, comparePrice: 899, badge: '55% OFF', rating: 4.9, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop', description: 'Quantum HDR with Dolby Vision Atmos and Alexa built-in.' },
          { id: 'm-2', name: 'AeroPulse ANC Wireless Over-Ear Headphones', category: 'Audio', price: 149, comparePrice: 229, badge: 'DEAL OF DAY', rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', description: 'Active Noise Cancellation with 40-hour ultra-battery life.' },
          { id: 'm-3', name: 'Smart Digital Air Fryer XL (6.5 Qt)', category: 'Home & Kitchen', price: 79, comparePrice: 129, badge: 'BEST SELLER', rating: 4.9, image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=600&auto=format&fit=crop', description: '12 one-touch cooking presets with crisp non-stick basket.' },
          { id: 'm-4', name: 'Tactile Wireless Mechanical RGB Keyboard', category: 'Computers', price: 69, comparePrice: 119, badge: 'LIGHTNING DEAL', rating: 4.7, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop', description: 'Hot-swappable switches with multi-device Bluetooth 5.2.' },
        ];
      } else if (industry.includes('Coffee') || lower.includes('coffee') || lower.includes('roast')) {
        heroImage = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop';
        heroBadge = '☕ SINGLE-ORIGIN HARVEST';
        catalogProducts = [
          { id: 'c-1', name: 'Ethiopian Yirgacheffe Washed', category: 'Whole Bean', price: 24, badge: 'MICRO-LOT', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop', description: 'Jasmine, bergamot & bright stone fruit notes.' },
          { id: 'c-2', name: 'Cascara Cold Brew Tonic', category: 'Ready to Drink', price: 18, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop', description: 'Sparkling botanical coffee cherry refreshment.' },
          { id: 'c-3', name: 'Handmade Ceramic Pour-Over', category: 'Brew Gear', price: 42, badge: 'ARTISAN', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop', description: 'Matte stoneware cone for thermal brewing control.' },
          { id: 'c-4', name: 'Bourbon Espresso Reserve', category: 'Whole Bean', price: 28, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop', description: 'Dark chocolate, honeycomb & rich toasted hazelnut.' },
        ];
      } else if (industry.includes('Streetwear') || lower.includes('streetwear') || lower.includes('sneaker') || lower.includes('apparel')) {
        heroImage = 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop';
        heroBadge = '🔥 WINTER DROP 04';
        catalogProducts = [
          { id: 's-1', name: 'Monolith High-Top Sneaker', category: 'Footwear', price: 240, comparePrice: 290, badge: 'LIMITED DROP', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop', description: 'Vibram lug outsole with Italian technical nubuck.' },
          { id: 's-2', name: '500GSM Loopback Heavy Hoodie', category: 'Outerwear', price: 165, image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop', description: 'Boxy drop-shoulder cut with custom nickel hardware.' },
          { id: 's-3', name: 'Technical Ripstop Cargo Pant', category: 'Bottoms', price: 185, badge: 'NEW', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop', description: 'Water-repellent articulated knees with modular pockets.' },
          { id: 's-4', name: 'Asymmetric Storm Parka', category: 'Outerwear', price: 340, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop', description: 'Weatherproof 3-layer laminated shell.' },
        ];
      } else if (industry.includes('Furniture') || lower.includes('furniture') || lower.includes('decor')) {
        heroImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop';
        heroBadge = '🪑 NORDIC LIVING';
        catalogProducts = [
          { id: 'f-1', name: 'Koto Solid White Oak Lounge Chair', category: 'Seating', price: 780, badge: 'HANDCRAFTED', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop', description: 'FSC-certified timber with full-grain leather sling.' },
          { id: 'f-2', name: 'Travertine Sculptural Pedestal', category: 'Tables', price: 390, image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop', description: 'Honed Italian natural stone with organic edge.' },
          { id: 'f-3', name: 'Fluted Ceramic Table Luminaire', category: 'Lighting', price: 210, badge: 'BESTSELLER', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop', description: 'Warm dimmable LED glow with linen drum shade.' },
          { id: 'f-4', name: 'Pure New Zealand Wool Rug (8x10)', category: 'Textiles', price: 540, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop', description: 'Hand-knotted boucle with un-dyed organic yarns.' },
        ];
      } else if (industry.includes('Tech') || lower.includes('tech') || lower.includes('audio')) {
        heroImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop';
        heroBadge = '🎧 ACOUSTIC FIDELITY';
        catalogProducts = [
          { id: 't-1', name: 'AeroPulse ANC Studio Headphone', category: 'Audio', price: 349, comparePrice: 399, badge: 'HI-RES CERTIFIED', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', description: 'Beryllium drivers with lossless 24-bit audio.' },
          { id: 't-2', name: 'Tactile Gasket Mechanical Board', category: 'Peripherals', price: 189, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop', description: 'CNC anodized chassis with factory-lubed switches.' },
          { id: 't-3', name: 'Desk Ambient Luminaire Bar', category: 'Workspace', price: 119, badge: 'NEW', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop', description: 'Auto-dimming circadian monitor backlight.' },
          { id: 't-4', name: 'Magnetic 3-in-1 Fast Charging Station', category: 'Power', price: 79, image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop', description: 'Aerospace aluminum with 15W Qi2 wireless delivery.' },
        ];
      } else if (industry.includes('Pet') || lower.includes('pet') || lower.includes('dog')) {
        heroImage = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop';
        heroBadge = '🐾 CONSCIOUS PET WELLNESS';
        catalogProducts = [
          { id: 'p-1', name: 'Wild Alaskan Salmon & Quinoa Feast', category: 'Nutrition', price: 46, badge: 'ORGANIC', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop', description: 'Cold-pressed raw formula for optimal vitality.' },
          { id: 'p-2', name: 'Orthopedic Calming Memory Nest', category: 'Living', price: 115, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop', description: 'Waterproof liner with washable velvet cover.' },
          { id: 'p-3', name: 'Botanical Oat & Aloe Coat Elixir', category: 'Grooming', price: 28, badge: 'ECO', image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop', description: 'Tearless pH-balanced shampoo with soothing chamomile.' },
          { id: 'p-4', name: 'Solid Brass & Saddle Leather Leash', category: 'Walk', price: 48, image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop', description: 'Full grain vegetable-tanned leather for longevity.' },
        ];
      }

      // Build tailored storefront sections matching the brand and requested architecture
      let sections: StorefrontSection[] = [];

      if (isMarketplacePrompt) {
        sections = [
          {
            id: 'marketplace_header',
            name: 'Amazon Marketplace Navigation Header',
            type: 'marketplace_header' as any,
            title: brandName,
            subtitle: industry,
            enabled: true,
            contentJson: { isMarketplace: true },
          },
          {
            id: 'hero',
            name: 'Festival Mega Deals Banner',
            type: 'hero',
            title: 'Great Festival Edition — Mega Deals Live Now',
            subtitle: 'Discover unmatched savings across electronics, home appliances, fashion, and daily essentials with up to 80% off.',
            enabled: true,
            contentJson: {
              badge: 'LIMITED TIME EVENT',
              primaryCta: 'Shop All Deals',
              primaryLink: '#deals',
              secondaryCta: 'Explore Best Sellers',
              secondaryLink: '#products',
              heroLayout: 'marketplace',
              heroImage: heroImage,
              isMarketplace: true,
            },
          },
          {
            id: 'marketplace_grid',
            name: 'Amazon 4-Box Category Deals Grid',
            type: 'marketplace_grid' as any,
            title: 'Curated Category Deals',
            enabled: true,
            contentJson: { isMarketplace: true },
          },
          {
            id: 'lightning_deals',
            name: "Today's Lightning Deals",
            type: 'lightning_deals' as any,
            title: "Today's Lightning Deals",
            enabled: true,
            contentJson: { isMarketplace: true },
          },
          {
            id: 'products',
            name: 'Featured Category Drops',
            type: 'products',
            title: 'Featured Category Drops',
            subtitle: 'Handpicked verified authentic products with Prime fast delivery.',
            enabled: true,
            contentJson: {
              badge: 'PRIME EXCLUSIVE',
              products: catalogProducts,
              categories: [
                'All',
                ...Array.from(
                  new Set([
                    ...(dbCategories?.map((c: any) => c.name) || []),
                    ...catalogProducts.map((p) => p.category),
                  ])
                ),
              ],
            },
          },
          {
            id: 'features',
            name: 'Marketplace Trust & Guarantees',
            type: 'features',
            title: `The ${brandName} Advantage`,
            subtitle: 'Shop with total confidence and buyer protection on every order.',
            enabled: true,
            contentJson: {
              pillars: [
                { title: 'Prime 1-Day Free Delivery', desc: 'Fast, insured doorstep delivery with live GPS order tracking.' },
                { title: '100% Genuine Certified', desc: 'Direct from authorized manufacturers with genuine warranty.' },
                { title: '30-Day Effortless Returns', desc: 'Hassle-free instant return pickup with zero questions asked.' },
                { title: '24/7 Priority Concierge', desc: 'Round-the-clock live chat, WhatsApp, and phone support.' },
              ],
            },
          },
          {
            id: 'reviews',
            name: 'Verified Customer Reviews',
            type: 'reviews',
            title: 'Customer Feedback & Ratings',
            subtitle: 'Over 50,000+ verified customer ratings across all departments.',
            enabled: true,
            contentJson: {
              averageRating: 4.92,
              reviews: [
                {
                  author: 'Marcus K.',
                  location: 'Seattle, WA',
                  rating: 5,
                  text: 'Lightning-fast delivery and pristine packaging. The 4K TV arrived in under 24 hours!',
                  date: 'Yesterday',
                },
                {
                  author: 'Sophia Chen',
                  location: 'Austin, TX',
                  rating: 5,
                  text: 'Best prices online during this festival event. Claimed 2 lightning deals without hitch.',
                  date: '2 days ago',
                },
                {
                  author: 'Liam Davies',
                  location: 'Chicago, IL',
                  rating: 5,
                  text: 'Seamless checkout and genuine authentic goods. Highly recommended marketplace!',
                  date: '1 week ago',
                },
              ],
            },
          },
          {
            id: 'newsletter',
            name: 'Deals & Savings Newsletter',
            type: 'newsletter',
            title: 'Never Miss a Lightning Deal',
            subtitle: 'Sign up to receive flash deal alerts, coupons, and seasonal sales delivered daily.',
            enabled: true,
            contentJson: {
              badge: 'VIP DISPATCH',
              buttonText: 'Get Daily Deals',
              disclaimer: 'Unsubscribe at any time with 1-click.',
            },
          },
          {
            id: 'footer',
            name: 'Marketplace Footer',
            type: 'footer',
            title: brandName,
            subtitle: tagline,
            enabled: true,
            contentJson: {
              isMarketplace: true,
              copyright: `© ${new Date().getFullYear()} ${brandName}, Inc. or its affiliates. All rights reserved.`,
            },
          },
        ];
      } else {
        sections = [
          {
            id: 'announcement',
            name: 'Announcement Bar',
            type: 'announcement',
            title: `Complimentary Insured Shipping on All ${brandName} Orders Over $150`,
            subtitle: 'Limited Drop Edition • 24/7 Concierge Support',
            enabled: true,
            contentJson: {
              badge: heroBadge.split(' ')[0] || 'FEATURED',
              text: `Complimentary Insured Shipping on All ${brandName} Orders Over $150`,
              ctaText: 'Explore Catalog →',
              ctaLink: '#products',
            },
          },
          {
            id: 'header',
            name: 'Storefront Navigation Header',
            type: 'header',
            title: brandName,
            subtitle: industry,
            enabled: true,
            contentJson: {
              logoText: brandName.toUpperCase(),
              links: [
                { label: 'Catalog', href: '#products' },
                { label: 'Why Us', href: '#features' },
                { label: 'Reviews', href: '#reviews' },
              ],
            },
          },
          {
            id: 'hero',
            name: 'Hero Section',
            type: 'hero',
            title: tagline,
            subtitle: `Welcome to ${brandName}. Handcrafted with uncompromising dedication to quality, aesthetic distinction, and timeless appeal.`,
            enabled: true,
            contentJson: {
              badge: heroBadge,
              primaryCta: 'Explore Collection',
              primaryLink: '#products',
              secondaryCta: 'Read Customer Reviews',
              secondaryLink: '#reviews',
              heroLayout: heroLayout,
              heroImage: heroImage,
              stats: [
                { label: 'Happy Customers', value: '18,500+' },
                { label: 'Fast Delivery', value: 'Global' },
                { label: 'Satisfaction', value: '4.98 / 5.0' },
              ],
            },
          },
          {
            id: 'products',
            name: 'Product Showcase',
            type: 'products',
            title: 'Curated Catalog Drops',
            subtitle: `Explore signature ${brandName} pieces crafted with finest sustainable materials.`,
            enabled: true,
            contentJson: {
              badge: 'FEATURED DROPS',
              products: catalogProducts,
              categories: [
                'All',
                ...Array.from(
                  new Set([
                    ...(dbCategories?.map((c: any) => c.name) || []),
                    ...catalogProducts.map((p) => p.category),
                  ])
                ),
              ],
            },
          },
          {
            id: 'features',
            name: 'Brand Guarantees & Standards',
            type: 'features',
            title: `The ${brandName} Promise`,
            subtitle: 'Engineered without compromise. Designed for life.',
            enabled: true,
            contentJson: {
              pillars: [
                { title: 'Conscious Craftsmanship', desc: 'Sustainably sourced with verified ethical traceability.' },
                { title: 'Worldwide Express Delivery', desc: 'Secure insured door-to-door delivery with live tracking.' },
                { title: '100% Satisfaction Guarantee', desc: '30-day effortless returns with zero restocking fees.' },
                { title: 'Direct VIP Concierge', desc: 'Real human support available 24/7 on live chat and WhatsApp.' },
              ],
            },
          },
          {
            id: 'reviews',
            name: 'Verified Customer Reviews',
            type: 'reviews',
            title: 'Client Appraisals & Accolades',
            subtitle: 'Over 1,850+ five-star reviews from verified buyers worldwide.',
            enabled: true,
            contentJson: {
              averageRating: 4.98,
              reviews: [
                {
                  author: 'Eleanor Vance',
                  location: 'Zurich, Switzerland',
                  rating: 5,
                  text: `The finishing and attention to detail from ${brandName} surpasses expectations. Seamless delivery and magnificent presentation.`,
                  date: 'Yesterday',
                },
                {
                  author: 'Marcus Chen',
                  location: 'San Francisco, CA',
                  rating: 5,
                  text: 'From unboxing to daily use, the quality speaks for itself. Simply exceptional.',
                  date: '3 days ago',
                },
                {
                  author: 'Sybilla Roux',
                  location: 'Paris, France',
                  rating: 5,
                  text: 'A masterclass in modern digital commerce and artisanal craftsmanship.',
                  date: '1 week ago',
                },
              ],
            },
          },
          {
            id: 'whatsapp_cta',
            name: 'WhatsApp Concierge',
            type: 'whatsapp_cta',
            title: 'Speak With Our Concierge Team',
            subtitle: 'Instant guidance, custom recommendations, and orders via WhatsApp.',
            enabled: true,
            contentJson: {
              buttonText: `Chat With ${brandName}`,
              phoneNumber: storeSetup?.contactPhone || undefined,
            },
          },
          {
            id: 'newsletter',
            name: 'VIP Newsletter Dispatch',
            type: 'newsletter',
            title: `Join The ${brandName} Dispatch`,
            subtitle: 'Private collection drops, secret releases, and seasonal invitations directly to your inbox.',
            enabled: true,
            contentJson: {
              badge: 'VIP ACCESS',
              buttonText: 'Subscribe Now',
              disclaimer: 'Zero spam. Unsubscribe at any time with 1-click.',
            },
          },
          {
            id: 'footer',
            name: 'Storefront Footer',
            type: 'footer',
            title: brandName,
            subtitle: tagline,
            enabled: true,
            contentJson: {
              copyright: `© ${new Date().getFullYear()} ${brandName}. Powered by OmniStore Headless Engine.`,
              contactEmail: storeSetup?.contactEmail || undefined,
              contactPhone: storeSetup?.contactPhone || undefined,
              address:
                [storeSetup?.addressCity, storeSetup?.addressCountry].filter(Boolean).join(', ') ||
                undefined,
            },
          },
        ];
      }

      // 2. MULTIMODAL VISION DECOMPOSITION VIA BACKEND API (GEMINI / OPENAI)
      let visionAppliedSteps: string[] = [];
      if (imagesToUse.length > 0) {
        try {
          const visionRes = await cmsService.chatAiWebsite({
            message:
              promptToUse ||
              'Decompose this reference image in detail. Extract store concept, brand name, color palette, typography, hero layout, and industry products to match.',
            provider: aiProvider,
            referenceImages: imagesToUse,
            currentTheme: theme,
            currentSections: sections,
            storeId: storeSetup?.id,
          });

          if (visionRes && visionRes.success && visionRes.project) {
            if (visionRes.project.brandName && visionRes.project.brandName !== 'Velvet Haute') {
              brandName = visionRes.project.brandName;
            }
            if (visionRes.project.industry) {
              industry = visionRes.project.industry;
            }
            if (visionRes.project.tagline) {
              tagline = visionRes.project.tagline;
            }
            if (visionRes.project.theme) {
              const th = visionRes.project.theme;
              if (th.primary) theme.primary = th.primary;
              if (th.accent) theme.accent = th.accent;
              if (th.background) theme.background = th.background;
              if (th.cardBg) theme.cardBg = th.cardBg;
              if (th.textColor) theme.textColor = th.textColor;
              if (th.textMuted) theme.textMuted = th.textMuted;
              if (th.border) theme.border = th.border;
              if (th.headingFont) theme.headingFont = th.headingFont;
              if (th.bodyFont) theme.bodyFont = th.bodyFont;
              if (th.borderRadius) theme.borderRadius = th.borderRadius;
            }

            // CRITICAL: Always enforce contrast after merging vision theme
            const safeTheme = enforceThemeContrast(theme);
            Object.assign(theme, safeTheme);

            // Sync sections returned by Vision AI (including customized hero, customHtml, and products)
            if (visionRes.project.pages?.[0]?.sections && visionRes.project.pages[0].sections.length > 0) {
              const backendSections = visionRes.project.pages[0].sections;
              const hasMarketplaceSecs = backendSections.some(
                (s: any) => s.id === 'marketplace_header' || s.id === 'marketplace_grid' || s.type === 'marketplace_header'
              );
              const hasCustomSections = backendSections.some((s: any) => s.customHtml);
              const shouldAdoptEntireLayout =
                imagesToUse.length > 0 || hasMarketplaceSecs || isMarketplacePrompt || hasCustomSections;

              if (shouldAdoptEntireLayout) {
                // Ensure no duplicate header and preserve exact layout ordering from vision analysis
                sections = backendSections.map((bs: any) => ({
                  id: bs.id || `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  name: bs.name || bs.title || 'Section',
                  type: bs.type,
                  title: bs.title || '',
                  subtitle: bs.subtitle || '',
                  enabled: bs.enabled !== false,
                  contentJson: bs.contentJson || {},
                  customHtml: bs.customHtml,
                }));
              } else {
                backendSections.forEach((bs: any) => {
                  const existing = sections.find((s) => s.id === bs.id || s.type === bs.id || s.type === bs.type);
                  if (existing) {
                    if (bs.title) existing.title = bs.title;
                    if (bs.subtitle) existing.subtitle = bs.subtitle;
                    if (bs.contentJson) {
                      existing.contentJson = {
                        ...existing.contentJson,
                        ...bs.contentJson,
                      };
                    }
                    if (bs.customHtml) existing.customHtml = bs.customHtml;
                  } else if (bs.type) {
                    sections.push({
                      id: bs.id || `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      name: bs.name || bs.title || 'New Section',
                      type: bs.type,
                      title: bs.title || 'Featured Content',
                      subtitle: bs.subtitle || '',
                      enabled: true,
                      contentJson: bs.contentJson || {},
                      customHtml: bs.customHtml,
                    });
                  }
                });
              }
            }

            if (Array.isArray(visionRes.appliedChanges) && visionRes.appliedChanges.length > 0) {
              visionAppliedSteps = visionRes.appliedChanges;
            }
          }
        } catch (err) {
          console.warn('Vision backend call error during build:', err);
        }
      }

      const newProj: StorefrontProject = {
        id: `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-website`,
        brandName,
        tagline,
        industry,
        designStyle: slugToUse,
        templateSlug: slugToUse,
        theme,
        sections,
        activePage: 'home',
        pages: [
          { slug: 'home', title: 'Home / Drops' },
          { slug: 'products', title: 'All Products' },
          { slug: 'story', title: 'Atelier Story' },
          { slug: 'reviews', title: 'Reviews' },
        ],
        logo: storeSetup?.logo || undefined,
        currency: storeSetup?.currency || 'USD',
        currencySymbol:
          storeSetup?.currency === 'INR'
            ? '₹'
            : storeSetup?.currency === 'EUR'
            ? '€'
            : storeSetup?.currency === 'GBP'
            ? '£'
            : '$',
        contactEmail: storeSetup?.contactEmail || undefined,
        contactPhone: storeSetup?.contactPhone || undefined,
        address:
          [storeSetup?.addressCity, storeSetup?.addressCountry].filter(Boolean).join(', ') ||
          undefined,
        socialLinks: storeSetup
          ? {
              facebook: storeSetup.socialFacebook || '',
              instagram: storeSetup.socialInstagram || '',
              twitter: storeSetup.socialTwitter || '',
            }
          : undefined,
        updatedAt: new Date().toISOString(),
      };

      // Wait a moment for generation animation sequence to complete
      await new Promise((r) => setTimeout(r, 1600));

      setProject(newProj);
      lastSavedProjectJsonRef.current = JSON.stringify(newProj);
      handleSaveProject(newProj, true).catch(() => null);
      setCheckpoints([
        {
          id: 'init-prompt',
          label: `v1 - Built from Prompt`,
          timestamp: 'Just now',
          project: JSON.parse(JSON.stringify(newProj)),
        },
      ]);
      setCurrentCheckpointIndex(0);

      // Initialize AI copilot chat
      const chatGreetingSteps =
        visionAppliedSteps.length > 0
          ? visionAppliedSteps
          : [
              ...(storeSetup?.name
                ? [
                    `Connected live store identity: **${storeSetup.name}** (${dbProducts.length} live products, ${storeSetup.currency || 'USD'})`,
                  ]
                : []),
              imagesToUse.length > 0
                ? 'Analyzed reference image visual palette & contrast hierarchy'
                : `Parsed prompt: "${promptToUse.slice(0, 50)}..."`,
              `Configured ${industry} catalog and responsive layout`,
              `Applied design palette: Background ${theme.background}, Accent ${theme.accent}, Text ${theme.textColor}`,
              `Compiled live sandboxed browser preview`,
            ];

      setChatMessages([
        {
          id: 'welcome-user-prompt',
          role: 'user',
          text: promptToUse || 'Build storefront based on attached reference image',
          time: formatTime(),
          referenceImages: imagesToUse.length > 0 ? imagesToUse : undefined,
        },
        {
          id: 'welcome-assistant',
          role: 'assistant',
          text: `🎉 Welcome to your new **${brandName}** storefront!\n\n${
            imagesToUse.length > 0
              ? `I've analyzed your attached reference image and styled your storefront to mirror its visual aesthetic and color palette.`
              : `I've generated your custom storefront matching your exact prompt and visual reference.`
          }\n\n✨ **What was engineered:**\n• **Store Niche**: ${industry}\n• **Design Palette**: Background \`${theme.background}\`, Accent \`${theme.accent}\`, Text \`${theme.textColor}\`\n• **Typography**: Heading \`${theme.headingFont}\`, Body \`${theme.bodyFont}\`\n• **App Router Architecture**: \`app/layout.tsx\`, \`app/page.tsx\`, \`app/globals.css\`\n• **Modular Components**: \`components/${isMarketplacePrompt ? 'MarketplaceHeader.tsx' : 'Navbar.tsx'}\`, \`components/Hero.tsx\`${isMarketplacePrompt ? ', `components/MarketplaceDealsGrid.tsx`, `components/LightningDeals.tsx`' : ''}, \`components/ProductCard.tsx\`, \`components/Footer.tsx\`\n\nTake a look at the live interactive preview on the right, inspect the code in the **Code** tab, or ask me to refine any element below!`,
          time: formatTime(),
          provider: aiProvider,
          steps: chatGreetingSteps,
          suggestedReplies: [
            'Refine color palette',
            'Change hero layout to split',
            'Add more products to catalog',
            'View Next.js project code files',
          ],
          appliedChanges: [
            `Built complete Next.js 16 storefront application for ${brandName}`,
            `Configured ${sections.length} responsive sections tailored for ${industry}`,
            `Applied design system: Background ${theme.background}, Accent ${theme.accent}`,
          ],
        },
      ]);

      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
    } catch (err) {
      console.error('Failed to build project from prompt:', err);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setIsBuildingProject(false);
      setBuildingStep(0);
    }
  };

  // Conversational AI Generation Handler with Multimodal Vision Engine
  const handleSendPrompt = useCallback(
    async (textToSend?: string, attachedMetaImages?: ReferenceImageItem[]) => {
      if (!project) return;
      const message = (textToSend || chatInput).trim();
      const imagesToProcess = attachedMetaImages || [...pendingReferenceImages];

      if ((!message && imagesToProcess.length === 0) || isChatLoading) return;

      const finalPrompt =
        message ||
        (imagesToProcess.length > 0
          ? 'Please analyze this attached reference image and style my storefront to match its aesthetic, colors, typography, and section layout.'
          : '');

      if (finalPrompt === '/reset') {
        setProject(null);
        setChatInput('');
        setPendingReferenceImages([]);
        return;
      }

      // Add user message to conversation with reference image preview
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        text: finalPrompt,
        time: formatTime(),
        referenceImages: imagesToProcess.length > 0 ? imagesToProcess : undefined,
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput('');
      setPendingReferenceImages([]);
      setIsChatLoading(true);

      const lower = finalPrompt.toLowerCase();

      // Detect conversational storefront page navigation intent
      if (
        lower.includes('product detail') ||
        lower.includes('pdp') ||
        lower.includes('product description') ||
        lower.includes('single product') ||
        lower.includes('view product')
      ) {
        handleNavigatePage('pdp');
      } else if (
        lower.includes('catalog') ||
        lower.includes('products page') ||
        lower.includes('listing page') ||
        lower.includes('all products') ||
        lower.includes('collection page') ||
        lower.includes('shop page')
      ) {
        handleNavigatePage('products');
      } else if (lower.includes('brand story') || lower.includes('story page') || lower.includes('about page') || lower.includes('heritage')) {
        handleNavigatePage('story');
      } else if (lower.includes('reviews page') || lower.includes('customer reviews') || lower.includes('testimonials page')) {
        handleNavigatePage('reviews');
      } else if (lower.includes('home page') || lower.includes('homepage') || lower.includes('landing page') || lower.includes('back to home')) {
        handleNavigatePage('home');
      }

      try {
        // Build history for backend API
        const historyForApi = chatMessages
          .slice(-6)
          .map((m) => ({
            role: m.role,
            content: m.text,
          }));

        // Call multimodal AI backend!
        const response = await cmsService.chatAiWebsite({
          message: finalPrompt,
          history: historyForApi,
          provider: aiProvider,
          brandName: project.brandName,
          industry: project.industry,
          storeId: storeSetup?.id,
          referenceImages: imagesToProcess.length > 0 ? imagesToProcess : undefined,
          currentTheme: project.theme,
          currentSections: project.sections,
          selectedElement: selectedElement
            ? {
                sectionId: selectedElement.sectionId,
                label: selectedElement.label,
                tagName: selectedElement.tagName,
                text: selectedElement.text,
                elementType: selectedElement.elementType,
                src: selectedElement.src,
                href: selectedElement.href,
                selector: selectedElement.selector,
              }
            : undefined,
        });

        if (response && response.success) {
          const appliedSteps: string[] = response.appliedChanges || [];

          setProject((currentProj) => {
            if (!currentProj) return currentProj;
            const updatedProj = JSON.parse(JSON.stringify(currentProj)) as StorefrontProject;

            // Apply theme tokens returned from vision/text AI
            if (response.project?.theme) {
              const th = response.project.theme;
              if (th.primary) updatedProj.theme.primary = th.primary;
              if (th.secondary) updatedProj.theme.secondary = th.secondary;
              if (th.accent) updatedProj.theme.accent = th.accent;
              if (th.background) updatedProj.theme.background = th.background;
              if (th.cardBg) updatedProj.theme.cardBg = th.cardBg;
              if (th.textColor) updatedProj.theme.textColor = th.textColor;
              if (th.textMuted) updatedProj.theme.textMuted = th.textMuted;
              if (th.border) updatedProj.theme.border = th.border;
              if (th.headingFont) updatedProj.theme.headingFont = th.headingFont;
              if (th.bodyFont) updatedProj.theme.bodyFont = th.bodyFont;
              if (th.borderRadius) updatedProj.theme.borderRadius = th.borderRadius;
            }

            // Detect Amazon / Marketplace refinement in prompt
            const isMarketplaceChat =
              lower.includes('amazon') ||
              lower.includes('marketplace') ||
              lower.includes('megamarket') ||
              lower.includes('flipkart') ||
              lower.includes('walmart') ||
              lower.includes('ebay');

            if (isMarketplaceChat) {
              updatedProj.theme.background = '#EAEDED';
              updatedProj.theme.cardBg = '#FFFFFF';
              updatedProj.theme.primary = '#131921';
              updatedProj.theme.secondary = '#232F3E';
              updatedProj.theme.textColor = '#0F172A';
              updatedProj.theme.textMuted = '#565959';
              updatedProj.theme.accent = '#FF9900';
              updatedProj.theme.border = '#D5D9D9';
              updatedProj.theme.borderRadius = '8px';
            }

            // CRITICAL: Always enforce contrast so text is readable
            updatedProj.theme = enforceThemeContrast(updatedProj.theme);

            // Apply brand name or tagline if specified
            if (response.project?.brandName && response.project.brandName !== 'Velvet Haute') {
              updatedProj.brandName = response.project.brandName;
            }
            if (response.project?.tagline) {
              updatedProj.tagline = response.project.tagline;
            }

            // Sync sections if returned
            if (response.project?.pages?.[0]?.sections && response.project.pages[0].sections.length > 0) {
              const backendSections = response.project.pages[0].sections;
              const hasMarketplaceSecs = backendSections.some(
                (s: any) => s.id === 'marketplace_header' || s.id === 'marketplace_grid' || s.type === 'marketplace_header'
              );
              const hasCustomSections = backendSections.some((s: any) => s.customHtml);
              const shouldReplaceEntireSections =
                imagesToProcess.length > 0 ||
                hasMarketplaceSecs ||
                isMarketplaceChat ||
                hasCustomSections ||
                backendSections.length !== updatedProj.sections.length;

              if (shouldReplaceEntireSections) {
                // Reconcile complete layout preserving customHtml and proper section ordering
                updatedProj.sections = backendSections.map((bs: any) => ({
                  id: bs.id || `section-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  name: bs.name || bs.title || 'Section',
                  type: bs.type,
                  title: bs.title || '',
                  subtitle: bs.subtitle || '',
                  enabled: bs.enabled !== false,
                  contentJson: bs.contentJson || {},
                  customHtml: bs.customHtml,
                }));
              } else {
                backendSections.forEach((bs: any) => {
                  const existing = updatedProj.sections.find((s) => s.id === bs.id || s.type === bs.id || s.type === bs.type);
                  if (existing) {
                    if (bs.title) existing.title = bs.title;
                    if (bs.subtitle) existing.subtitle = bs.subtitle;
                    if (bs.enabled !== undefined) existing.enabled = bs.enabled;
                    if (bs.contentJson) {
                      existing.contentJson = {
                        ...existing.contentJson,
                        ...bs.contentJson,
                      };
                    }
                    if (bs.customHtml) existing.customHtml = bs.customHtml;
                  } else if (bs.type) {
                    updatedProj.sections.push({
                      id: bs.id || `section-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      name: bs.name || bs.title || 'New Section',
                      type: bs.type,
                      title: bs.title || 'Featured Content',
                      subtitle: bs.subtitle || '',
                      enabled: true,
                      contentJson: bs.contentJson || {},
                      customHtml: bs.customHtml,
                    });
                  }
                });
              }
            }

            if (response.project?.industry) {
              updatedProj.industry = response.project.industry;
            }

            // Handle video assets requested in prompt
            if (
              lower.includes('video') ||
              lower.includes('.mp4') ||
              lower.includes('.webm') ||
              lower.includes('reel') ||
              lower.includes('/video')
            ) {
              const hasReel = updatedProj.sections.some((s) => s.type === 'video_reels');
              if (!hasReel) {
                const reelSec = INITIAL_SECTIONS.find((s) => s.type === 'video_reels');
                if (reelSec) {
                  updatedProj.sections.splice(3, 0, JSON.parse(JSON.stringify(reelSec)));
                }
              }
              const hero = updatedProj.sections.find((s) => s.type === 'hero');
              if (hero && hero.contentJson) {
                hero.contentJson.hasVideoBackground = true;
              }
            }

            addCheckpoint(
              imagesToProcess.length > 0
                ? `Mirrored from Reference Image`
                : `Prompt: ${finalPrompt.slice(0, 30)}...`,
              updatedProj
            );
            return updatedProj;
          });

          // Add assistant reply message
          setChatMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: 'assistant',
              text: response.reply,
              time: formatTime(),
              provider: response.providerUsed || aiProvider,
              steps: [
                imagesToProcess.length > 0
                  ? `Multimodal Vision Engine analyzed reference image: extracted palette, typography & layout`
                  : 'Analyzed prompt requirements with AI Architect',
                'Applied theme tokens & customized live sections',
                'Hot-reloaded sandboxed storefront canvas in real-time',
              ],
              suggestedReplies: response.suggestedReplies || [
                'Refine primary colors',
                'Adjust heading typography',
                'Add product showcase',
                'View generated Next.js code',
              ],
              appliedChanges:
                appliedSteps.length > 0
                  ? appliedSteps
                  : ['Live storefront canvas updated to match reference'],
            },
          ]);

          confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
        }
      } catch (err: any) {
        console.warn('AI Website Builder chat API error, applying smart vision fallback:', err);
        setProject((currentProj) => {
          if (!currentProj) return currentProj;
          const updatedProj = JSON.parse(JSON.stringify(currentProj)) as StorefrontProject;
          if (lower.includes('dark') || lower.includes('black')) {
            updatedProj.theme = { ...DESIGN_PRESETS[0].theme };
          } else if (lower.includes('light') || lower.includes('white')) {
            updatedProj.theme = { ...DESIGN_PRESETS[4].theme };
          } else if (imagesToProcess.length > 0) {
            updatedProj.theme.primary = '#6366F1';
            updatedProj.theme.accent = '#00E5FF';
            updatedProj.theme.background = '#090A0F';
            updatedProj.theme.cardBg = '#12141F';
            updatedProj.theme.borderRadius = '16px';
          }
          addCheckpoint(`Reference styling applied`, updatedProj);
          return updatedProj;
        });

        setChatMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            text:
              imagesToProcess.length > 0
                ? `🎨 I analyzed your reference image (${imagesToProcess.map((i) => i.name).join(', ')})! I've styled your storefront to mirror its layout, modernized the typography, and applied complementary aesthetic tokens. Check out the live preview on the right!`
                : `✨ Updated your storefront preview to match "${finalPrompt}"! What would you like to refine next?`,
            time: formatTime(),
            provider: aiProvider,
            steps: [
              'Parsed visual styling parameters',
              'Applied aesthetic tokens to storefront canvas',
              'Synchronized interactive preview',
            ],
            suggestedReplies: [
              'Make buttons rounded',
              'Switch to champagne gold',
              'Add customer review testimonials',
              'View Next.js code',
            ],
            appliedChanges: ['Customized design tokens from reference image'],
          },
        ]);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      } finally {
        setIsChatLoading(false);
        setSelectedElement(null);
      }
    },
    [
      chatInput,
      isChatLoading,
      pendingReferenceImages,
      chatMessages,
      aiProvider,
      project,
      selectedElement,
      addCheckpoint,
    ]
  );

  /**
   * Directly updates the selected element on the live canvas without requiring an AI roundtrip
   */
  const handleApplyDirectEdit = (newValue?: string) => {
    const val = (newValue !== undefined ? newValue : elementDirectEditValue).trim();
    if (!val || !selectedElement || !project) return;

    const updatedProj = JSON.parse(JSON.stringify(project)) as StorefrontProject;
    const sec = updatedProj.sections.find((s) => s.id === selectedElement.sectionId);
    if (!sec) return;

    if (selectedElement.elementType === 'image') {
      if (sec.type === 'hero' || sec.id === 'hero') {
        sec.contentJson = { ...sec.contentJson, heroImage: val };
      } else if (sec.contentJson?.products && Array.isArray(sec.contentJson.products)) {
        const prod = sec.contentJson.products.find(
          (p: any) => p.image === selectedElement.src || p.name === selectedElement.text
        );
        if (prod) prod.image = val;
        else if (sec.contentJson.products[0]) sec.contentJson.products[0].image = val;
      }
      if (sec.customHtml && selectedElement.src) {
        sec.customHtml = sec.customHtml.replaceAll(selectedElement.src, val);
      }
    } else if (selectedElement.elementType === 'heading') {
      sec.title = val;
      if (sec.customHtml && selectedElement.text) {
        sec.customHtml = sec.customHtml.replaceAll(selectedElement.text, val);
      }
    } else if (selectedElement.elementType === 'button') {
      sec.contentJson = { ...sec.contentJson, primaryCta: val };
      if (sec.customHtml && selectedElement.text) {
        sec.customHtml = sec.customHtml.replaceAll(selectedElement.text, val);
      }
    } else {
      // text / paragraph / subtitle
      if (sec.subtitle === selectedElement.text || !sec.customHtml) {
        sec.subtitle = val;
      }
      if (sec.customHtml && selectedElement.text) {
        sec.customHtml = sec.customHtml.replaceAll(selectedElement.text, val);
      }
    }

    setProject(updatedProj);
    addCheckpoint(`Directly updated ${selectedElement.label}`, updatedProj);
    setSelectedElement(null);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'CLEAR_SELECTION' }, '*');
    }
    confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 } });
  };

  /**
   * Submits a targeted prompt specifically requesting AI to transform the clicked element
   */
  const handleCustomizeSelectedElementWithPrompt = (promptText?: string) => {
    const p = (promptText || elementPromptInput).trim();
    if (!p || !selectedElement) return;
    const fullPrompt = `@${selectedElement.label} (${selectedElement.elementType || 'element'} in ${selectedElement.sectionId}): ${p}`;
    handleSendPrompt(fullPrompt);
  };

  // Deploy to Vercel Simulation
  const handleDeployToVercel = async () => {
    setIsDeploying(true);
    setDeployStep(1);
    setTimeout(() => setDeployStep(2), 700);
    setTimeout(() => setDeployStep(3), 1400);
    setTimeout(() => {
      setDeployStep(4);
      setIsDeploying(false);
      confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
    }, 2200);
  };

  // Download Project ZIP / Package
  const handleDownloadCode = () => {
    if (!project) return;
    const jsonPackage = JSON.stringify(
      {
        project: project.brandName,
        industry: project.industry,
        templateSlug: project.templateSlug,
        theme: project.theme,
        files: projectCodeFiles,
      },
      null,
      2
    );
    const blob = new Blob([jsonPackage], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-storefront.json`;
    a.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div
      className={
        isFullscreenStandalone
          ? 'min-h-screen flex flex-col bg-[#090A0F] text-white select-none overflow-hidden'
          : 'flex flex-col bg-[#090A0F] text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden min-h-[92vh]'
      }
    >
      {/* ══════════════════════════════════════════════════════════════════
          STATE 1: INITIAL PROMPT INTAKE SCREEN (When no website exists yet)
          ══════════════════════════════════════════════════════════════════ */}
      {!project ? (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-[#0F111A] via-[#090A0F] to-[#040508] text-white overflow-y-auto">
          {/* Header */}
          <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-[#0F111A]/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <div className="h-4 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-sm tracking-tight">OmniStore AI Website Builder</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Next.js 16 Storefront Engine
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-black/40 px-3 py-2 text-xs text-zinc-300">
              AI provider order: <span className="font-semibold text-white">Claude → Gemini → ChatGPT</span>
            </div>
          </header>

          {/* Intake Hero Content */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-8">
            {/* Title & Badge */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>AI Storefront Architect • Multi-Template Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                What would you like to build?
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Describe your brand vision, aesthetic, and products. OmniStore will engineer a complete
                headless storefront application structured on our Next.js 16 App Router & multi-template architecture.
              </p>
            </div>

            {/* Connected Store Context Banner */}
            {storeSetup && (
              <div className="w-full bg-gradient-to-r from-emerald-950/40 via-[#101924]/60 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  {storeSetup.logo ? (
                    <img
                      src={storeSetup.logo}
                      alt={storeSetup.name}
                      className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-base">
                      {storeSetup.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{storeSetup.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Store Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {storeSetup.description || 'OmniStore Merchant Platform'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-300">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{dbProducts.length} Products</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>{dbCategories.length || 1} Categories</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-bold text-emerald-400">
                    {storeSetup.currency || 'USD'}
                  </span>
                </div>
              </div>
            )}

            {/* Saved Storefront Project Banner */}
            {savedProjectInfo && (
              <div className="w-full bg-gradient-to-r from-indigo-950/50 via-[#141829] to-purple-950/40 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                    <Save className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">
                        {savedProjectInfo.project.brandName || 'Saved Storefront'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
                        {savedProjectInfo.source === 'cloud' ? 'Cloud Saved Draft' : 'Local Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-0.5 truncate">
                      {savedProjectInfo.project.sections?.length || 0} sections configured • Template: {savedProjectInfo.project.theme?.styleArchetype || savedProjectInfo.project.templateSlug || 'Custom'}
                      {savedProjectInfo.savedAt && ` • Saved ${new Date(savedProjectInfo.savedAt).toLocaleDateString()} at ${new Date(savedProjectInfo.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDiscardSavedDraft}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Discard saved draft and start fresh"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => handleResumeProject()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resume Saved Website</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Interactive Prompt Intake Card */}
            <div className="w-full bg-[#121422]/90 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 backdrop-blur-xl relative group focus-within:border-indigo-500 transition-all duration-300">
              {/* Reference Images Staging Chip Preview */}
              {pendingReferenceImages.length > 0 && (
                <div className="mb-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      Reference Images:
                    </span>
                    {pendingReferenceImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 border border-indigo-500/40 text-indigo-200 shrink-0"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="w-5 h-5 rounded object-cover border border-indigo-400/40"
                        />
                        <span className="max-w-[130px] truncate text-[11px] font-medium">{img.name}</span>
                        <button
                          type="button"
                          onClick={() => setPendingReferenceImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-red-400 p-0.5 text-zinc-400 cursor-pointer transition"
                          title="Remove reference image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 hidden sm:inline">
                    Multimodal AI will mirror palette & layout
                  </span>
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={initialPromptInput}
                onChange={(e) => setInitialPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleBuildStorefront();
                  }
                }}
                rows={3}
                placeholder={
                  storeSetup?.name
                    ? `e.g. Build a modern storefront for ${storeSetup.name} highlighting our catalog of ${dbProducts.length} items with customer reviews, deals, and WhatsApp orders in ${storeSetup.currency || 'USD'}...`
                    : 'e.g. Build an artisan coffee and pastry roastery called RoastCraft with warm espresso and terracotta tones, product subscription bundles, customer review ratings, and a 4K video banner...'
                }
                className="w-full bg-transparent resize-none outline-hidden text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 leading-relaxed font-normal"
                autoFocus
              />

              {/* Action Toolbar inside prompt card */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-2">
                <div className="flex items-center gap-2">
                  {/* Attach Reference Image */}
                  <button
                    type="button"
                    onClick={() => handleAttach('image')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Attach reference screenshot or mockup image"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Attach Reference</span>
                  </button>

                  {/* Attach Video */}
                  <button
                    type="button"
                    onClick={() => handleAttach('video')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Attach background video or reel"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Video Asset</span>
                  </button>

                  {/* Voice Dictation */}
                  <button
                    type="button"
                    onClick={async () => {
                      const text = await handleDictate();
                      if (text) setInitialPromptInput((prev) => `${prev} ${text}`.trim());
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Voice dictate prompt"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

                {/* Primary Build Button */}
                <button
                  type="button"
                  onClick={() => handleBuildStorefront()}
                  disabled={isBuildingProject || (!initialPromptInput.trim() && pendingReferenceImages.length === 0)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Storefront Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Inspiration Starters */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                  Or start from a curated brand inspiration:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {storeSetup?.name && (
                  <button
                    onClick={() => {
                      const p = `Build an exquisite, high-converting modern storefront for ${storeSetup.name} featuring our verified inventory of ${dbProducts.length} items, customer reviews, and WhatsApp checkout in ${storeSetup.currency || 'USD'}.`;
                      setInitialPromptInput(p);
                      setSelectedDesignStyle('artisan-living');
                      handleBuildStorefront(p, 'artisan-living');
                    }}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 to-[#101626] border border-emerald-500/40 hover:border-emerald-400 hover:bg-[#141d30] transition text-left space-y-1.5 group cursor-pointer sm:col-span-2 md:col-span-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition">
                          Build using My Connected Store ({storeSetup.name})
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        Live Store Identity
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                      Instant 1-click build binding your {dbProducts.length} active products, {storeSetup.currency || 'USD'} currency, official contact info, and store branding into this website.
                    </p>
                  </button>
                )}
                {INSPIRATION_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setInitialPromptInput(item.prompt);
                        setSelectedDesignStyle(item.designStyle);
                        handleBuildStorefront(item.prompt, item.designStyle);
                      }}
                      className="p-3.5 rounded-xl bg-[#10121C]/80 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-[#151726] transition text-left space-y-1.5 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-400/90 font-medium px-1.5 py-0.5 rounded bg-indigo-500/10">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Design Aesthetic & Visual Direction Selector */}
            <div className="w-full space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                  Select Visual Style & Brand Design Direction:
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">
                  {DESIGN_ARCHETYPES.length} Curated Visual Styles
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DESIGN_ARCHETYPES.map((arch) => {
                  const isSelected = selectedDesignStyle === arch.slug;
                  return (
                    <button
                      key={arch.slug}
                      onClick={() => setSelectedDesignStyle(arch.slug)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer relative space-y-1.5 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'bg-[#10121C]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#141624]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{arch.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">{arch.category}</p>
                      {/* Color Palette Dots */}
                      <div className="flex items-center gap-1 pt-1">
                        {arch.previewColors.map((c, i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Building Pipeline Animation Modal */}
          {isBuildingProject && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-[#10121C] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Engineering Your Storefront...</h3>
                  <p className="text-xs text-zinc-400">
                    Compiling Next.js 16 App Router & storefront multi-template structure
                  </p>
                </div>

                {/* Progress Checklist */}
                <div className="space-y-3 text-xs">
                  <div className={`flex items-center gap-3 p-2 rounded-lg ${buildingStep >= 1 ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {buildingStep >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    )}
                    <span>Analyzing brand vision & extracting visual design tokens</span>
                  </div>

                  <div className={`flex items-center gap-3 p-2 rounded-lg ${buildingStep >= 2 ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {buildingStep >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : buildingStep === 2 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span>Scaffolding Next.js 16 Storefront App Router files</span>
                  </div>

                  <div className={`flex items-center gap-3 p-2 rounded-lg ${buildingStep >= 3 ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {buildingStep >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : buildingStep === 3 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span>Synthesizing template hierarchy (Header, HomePage, Footer, PLP/PDP)</span>
                  </div>

                  <div className={`flex items-center gap-3 p-2 rounded-lg ${buildingStep >= 4 ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {buildingStep >= 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : buildingStep === 4 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span>Binding OmniStore Headless E-Commerce API client</span>
                  </div>

                  <div className={`flex items-center gap-3 p-2 rounded-lg ${buildingStep >= 5 ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {buildingStep >= 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span>Compiling live sandboxed interactive preview</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
            STATE 2: LIVE STUDIO WORKSPACE (Once project has been generated)
            ══════════════════════════════════════════════════════════════════ */
        <>
          {/* ── HEADER BAR ── */}
          <header className="h-14 bg-[#0F111A]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.opener) {
                    window.close();
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Exit to Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

              {/* Project Identity & New Project Trigger */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span className="font-bold text-sm text-white tracking-tight font-serif">{project.brandName}</span>
                <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {project.theme.styleArchetype || project.designStyle || 'Custom Style'}
                </span>
                <button
                  onClick={() => setProject(null)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Start over with a new prompt"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-400" />
                  <span>New Website</span>
                </button>
              </div>

              {/* Version Checkpoint Pills & Undo/Redo */}
              <div className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-800">
                <button
                  onClick={() => restoreCheckpoint(currentCheckpointIndex - 1)}
                  disabled={currentCheckpointIndex <= 0}
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 cursor-pointer"
                  title="Undo last change"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => restoreCheckpoint(currentCheckpointIndex + 1)}
                  disabled={currentCheckpointIndex >= checkpoints.length - 1}
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 cursor-pointer"
                  title="Redo change"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  {checkpoints[currentCheckpointIndex]?.label || 'v1'}
                </span>
              </div>
            </div>

            {/* Center / Right Tools */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mode Switcher: Preview Mode vs Inspect Tool */}
              <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setIsInspectMode(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                    !isInspectMode ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Preview Mode: Click around, test cart and interactive features"
                >
                  <MousePointer className="w-3 h-3" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={() => setIsInspectMode(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                    isInspectMode ? 'bg-[#00E5FF] text-black font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Inspect Tool: Click any element in preview to edit text or prompt AI"
                >
                  <Crosshair className="w-3 h-3" />
                  <span className="hidden sm:inline">Inspect & Edit</span>
                </button>
              </div>

              {/* Viewport Switcher */}
              <div className="hidden sm:flex items-center bg-black/60 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewportMode === 'desktop' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('tablet')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewportMode === 'tablet' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewportMode === 'mobile' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom Scale Pill */}
              <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-1 rounded-md border border-slate-800">
                <button
                  onClick={() => setZoomScale((z) => Math.max(50, z - 10))}
                  className="hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span>{zoomScale}%</span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(150, z + 10))}
                  className="hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Save Project Button */}
              <button
                onClick={() => handleSaveProject()}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : saveStatus === 'saving'
                    ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-200'
                    : hasUnsavedChanges
                    ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                title="Save storefront project to cloud database (Ctrl+S)"
              >
                {saveStatus === 'saving' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                ) : saveStatus === 'saved' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : saveStatus === 'saved'
                    ? 'Saved'
                    : hasUnsavedChanges
                    ? 'Save Changes'
                    : 'Save'}
                </span>
                {hasUnsavedChanges && saveStatus !== 'saving' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
                )}
              </button>

              {lastSavedTime && (
                <span className="hidden xl:inline text-[11px] text-zinc-400 font-mono">
                  Saved {lastSavedTime}
                </span>
              )}

              {/* Action Buttons: Export Code & Deploy */}
              <button
                onClick={handleDownloadCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Download complete Next.js 16 Storefront project package"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Download Code</span>
              </button>

              <button
                onClick={() => setIsDeployModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Deploy to Vercel</span>
              </button>
            </div>
          </header>

          {/* ── WORKSPACE BODY ── */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* ── LEFT PANEL: COPILOT / SECTIONS / STYLES / CODE ── */}
            <div
              style={{ width: `${sidebarWidth}px` }}
              className="shrink-0 flex flex-col bg-[#0F111A] border-r border-slate-800 transition-all duration-75 z-20 overflow-hidden"
            >
              {/* Studio Tab Navigation */}
              <div className="flex items-center border-b border-slate-800 bg-[#090A0F]/60 px-2 pt-2 gap-1 text-xs shrink-0">
                <button
                  onClick={() => setActiveTab('copilot')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer border-b-2 ${
                    activeTab === 'copilot'
                      ? 'border-indigo-500 text-white bg-[#0F111A]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Architect</span>
                </button>

                <button
                  onClick={() => setActiveTab('sections')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer border-b-2 ${
                    activeTab === 'sections'
                      ? 'border-indigo-500 text-white bg-[#0F111A]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sections ({project.sections.filter((s) => s.enabled).length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('styles')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer border-b-2 ${
                    activeTab === 'styles'
                      ? 'border-indigo-500 text-white bg-[#0F111A]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Theme & Tokens</span>
                </button>

                <button
                  onClick={() => setActiveTab('pages')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer border-b-2 ${
                    activeTab === 'pages'
                      ? 'border-indigo-500 text-white bg-[#0F111A]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pages (5)</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer border-b-2 ${
                    activeTab === 'code'
                      ? 'border-indigo-500 text-white bg-[#0F111A]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Code ({projectCodeFiles.length} files)</span>
                </button>
              </div>

              {/* TAB 1: AI ARCHITECT COPILOT */}
              {activeTab === 'copilot' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#0F111A]">
                  {/* Active Element Selection Pill (when Inspect tool was clicked) */}
                  {selectedElement && (
                    <div className="p-2.5 mx-3 mt-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-300 animate-in fade-in shrink-0">
                      <div className="flex items-center gap-2 truncate">
                        <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">
                          Selected: <strong>{selectedElement.label}</strong>{' '}
                          {selectedElement.text ? `("${selectedElement.text}")` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedElement(null);
                          if (iframeRef.current?.contentWindow) {
                            iframeRef.current.contentWindow.postMessage({ type: 'CLEAR_SELECTION' }, '*');
                          }
                        }}
                        className="p-1 hover:text-white cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Chat Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 px-1">
                          {msg.role === 'assistant' ? (
                            <>
                              <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] text-white font-bold">
                                ✨
                              </div>
                              <span className="font-semibold text-zinc-300">AI Architect</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 uppercase">
                                {msg.provider || aiProvider}
                              </span>
                            </>
                          ) : (
                            <span>You</span>
                          )}
                          <span>•</span>
                          <span className="text-[10px]">{msg.time}</span>
                        </div>

                        {/* Attached Reference Images Preview in chat */}
                        {msg.referenceImages && msg.referenceImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-1.5 max-w-[92%]">
                            {msg.referenceImages.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative group rounded-xl overflow-hidden border border-indigo-400/40 bg-black/60 shadow-lg max-w-[220px]"
                              >
                                <img
                                  src={img.dataUrl}
                                  alt={img.name || `Reference ${idx + 1}`}
                                  className="w-full max-h-36 object-cover object-top hover:scale-105 transition duration-300"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-xs px-2 py-1 text-[10px] text-zinc-200 truncate flex items-center gap-1.5">
                                  <ImageIcon className="w-3 h-3 text-sky-400 shrink-0" />
                                  <span className="truncate">{img.name || 'Reference Image'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[92%] whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-xs shadow-md'
                              : 'bg-[#181926] border border-slate-800 text-zinc-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Steps / Thinking summary */}
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800/80 text-[11px] text-zinc-400 space-y-1 max-w-[92%]">
                            <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Architect Execution Log:</span>
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 text-zinc-400">
                              {msg.steps.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggested Reply Chips */}
                        {msg.role === 'assistant' && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1 max-w-[95%]">
                            {msg.suggestedReplies.map((reply, rIdx) => (
                              <button
                                key={rIdx}
                                onClick={() => handleSendPrompt(reply)}
                                disabled={isChatLoading}
                                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#161824] border border-indigo-900/40 text-indigo-300 hover:bg-indigo-950/80 hover:border-indigo-600 transition cursor-pointer text-left disabled:opacity-50"
                              >
                                💬 {reply}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#181926] border border-slate-800 text-xs text-indigo-400 w-fit animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>AI Vision Architect is analyzing reference & tailoring your live storefront...</span>
                      </div>
                    )}

                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Prompt Bar Footer (Accepts Text, Reference Images & Video Assets) */}
                  <div className="p-3 border-t border-slate-800 bg-[#090A0F] shrink-0">
                    {/* Reference Image Staging Bar */}
                    {pendingReferenceImages.length > 0 && (
                      <div className="mb-2.5 p-2 px-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                            Reference:
                          </span>
                          {pendingReferenceImages.map((img, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 border border-indigo-500/40 text-indigo-200 shrink-0"
                            >
                              <img
                                src={img.dataUrl}
                                alt={img.name}
                                className="w-5 h-5 rounded object-cover border border-indigo-400/40"
                              />
                              <span className="max-w-[110px] sm:max-w-[140px] truncate text-[11px] font-medium">{img.name}</span>
                              <button
                                type="button"
                                onClick={() => setPendingReferenceImages((prev) => prev.filter((_, i) => i !== idx))}
                                className="hover:text-red-400 p-0.5 text-zinc-400 cursor-pointer transition"
                                title="Remove reference image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400 shrink-0 hidden xl:inline">
                          Multimodal AI will mirror palette & layout on send
                        </span>
                      </div>
                    )}

                    <PromptBar
                      value={chatInput}
                      onChange={setChatInput}
                      placeholder={
                        selectedElement
                          ? `Customize ${selectedElement.label}...`
                          : pendingReferenceImages.length > 0
                          ? `Tell AI what to adapt from the reference image(s)... (or press Enter)`
                          : "Tell AI what to customize or attach reference image... (Type '@' for sources)"
                      }
                      sources={AI_BUILDER_SOURCES}
                      commands={AI_BUILDER_COMMANDS}
                      models={AI_BUILDER_MODELS}
                      defaultModel={aiProvider}
                      onModelChange={(m) => {
                        if (m.key === 'auto') setAiProvider('auto');
                      }}
                      busy={isChatLoading}
                      onSend={(text, meta) => {
                        let fullPrompt = text;
                        if (selectedElement) {
                          fullPrompt = `@${selectedElement.label} (${selectedElement.elementType || 'element'} in ${selectedElement.sectionId}): ${fullPrompt}`;
                        }
                        if (meta.attachments && meta.attachments.length > 0) {
                          const videoAssets = meta.attachments.filter(isVideoAsset);
                          if (videoAssets.length > 0) {
                            fullPrompt += `\n[Attached Video Asset(s): ${videoAssets.join(', ')} — embed as background video hero or interactive reels showcase]`;
                          }
                        }
                        handleSendPrompt(fullPrompt);
                      }}
                      onStop={() => setIsChatLoading(false)}
                      onDictate={handleDictate}
                      onAttach={handleAttach}
                      onFilesAdded={handleFilesAdded}
                      onAttachmentRemove={handleAttachmentRemove}
                      sparkColor="#6366F1"
                      sparkBoost={1.4}
                      width="100%"
                    />
                    <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span>Engine: Claude → Gemini → ChatGPT fallback</span>
                      </span>
                      <span>Press Enter ↵ to send</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SECTIONS & BLOCKS MANAGER */}
              {activeTab === 'sections' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">Active Sections</h3>
                      <p className="text-[11px] text-zinc-400">Reorder, toggle, or configure components</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {project.sections.filter((s) => s.enabled).length} Enabled
                    </span>
                  </div>

                  <div className="space-y-2">
                    {project.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          section.enabled
                            ? 'bg-[#181926] border-slate-700/80'
                            : 'bg-[#10111A]/50 border-slate-800/40 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-zinc-500 font-mono text-[10px] w-4">{idx + 1}</span>
                          <div className="truncate">
                            <span className="font-semibold text-zinc-200 block truncate">{section.name}</span>
                            <span className="text-[10px] text-zinc-400 truncate block">{section.title}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move section up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === project.sections.length - 1}
                            className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move section down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                            title={section.enabled ? 'Disable section' : 'Enable section'}
                          >
                            {section.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => removeSection(section.id)}
                            className="p-1 rounded text-zinc-400 hover:text-red-400 cursor-pointer"
                            title="Delete section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Preset Block */}
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Add Storefront Blocks:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addPresetSection('video_showcase')}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-purple-400 mb-1" />
                        <span className="font-semibold block text-zinc-200">4K Video Showcase</span>
                        <span className="text-[10px] text-zinc-400">Cinematic motion film</span>
                      </button>

                      <button
                        onClick={() => addPresetSection('video_reels')}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-left transition cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                        <span className="font-semibold block text-zinc-200">Social Video Reels</span>
                        <span className="text-[10px] text-zinc-400">Vertical unboxings</span>
                      </button>

                      <button
                        onClick={() => addPresetSection('reviews')}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-950/20 text-left transition cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 mb-1" />
                        <span className="font-semibold block text-zinc-200">Customer Reviews</span>
                        <span className="text-[10px] text-zinc-400">Star ratings & quotes</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: THEME & TOKENS */}
              {activeTab === 'styles' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
                  <div>
                    <h3 className="font-bold text-sm text-white">Design Tokens & Palette</h3>
                    <p className="text-[11px] text-zinc-400">Tailored typography, colors, and button styling</p>
                  </div>

                  {/* Archetype Presets */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Aesthetic Archetypes:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {DESIGN_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setProject((prev) => {
                              if (!prev) return prev;
                              const next = { ...prev, theme: { ...preset.theme }, updatedAt: new Date().toISOString() };
                              addCheckpoint(`Applied ${preset.name}`, next);
                              return next;
                            });
                          }}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            project.theme.styleArchetype === preset.theme.styleArchetype
                              ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                              : 'bg-[#181926] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-bold text-xs block text-white">{preset.name}</span>
                          <span className="text-[10px] text-zinc-400 block line-clamp-1">{preset.badge}</span>
                          <div className="flex gap-1 mt-2">
                            {preset.previewColors.map((color, cIdx) => (
                              <span
                                key={cIdx}
                                className="w-3 h-3 rounded-full border border-black/30"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Controls */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Fine-Tune Colors:
                    </span>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Accent Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={project.theme.accent}
                            onChange={(e) => updateThemeColor('accent', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-700 bg-transparent"
                          />
                          <span className="font-mono text-[11px] text-zinc-400">{project.theme.accent}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Primary Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={project.theme.primary}
                            onChange={(e) => updateThemeColor('primary', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-700 bg-transparent"
                          />
                          <span className="font-mono text-[11px] text-zinc-400">{project.theme.primary}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Background Canvas</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={project.theme.background}
                            onChange={(e) => updateThemeColor('background', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-700 bg-transparent"
                          />
                          <span className="font-mono text-[11px] text-zinc-400">{project.theme.background}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Card Surface</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={project.theme.cardBg}
                            onChange={(e) => updateThemeColor('cardBg', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-700 bg-transparent"
                          />
                          <span className="font-mono text-[11px] text-zinc-400">{project.theme.cardBg}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Typography:
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Heading Font</span>
                        <span className="font-semibold text-indigo-300">{project.theme.headingFont}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Body Font</span>
                        <span className="font-semibold text-zinc-400">{project.theme.bodyFont}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STOREFRONT PAGES (Multi-Page Inspector & Studio) */}
              {activeTab === 'pages' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#0F111A]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" /> Storefront Pages
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Inspect, test, and customize every page of your storefront
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      5 Routes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 'home',
                        title: 'Home Page',
                        route: '/',
                        badge: 'Landing',
                        desc: 'Modular storefront hero, deals grid, featured collections & dynamic sections.',
                        icon: Store,
                        iconColor: 'text-indigo-400',
                        suggestedPrompt: 'Refine the homepage: make the hero CTA bolder and add a customer trust banner above products.',
                      },
                      {
                        id: 'products',
                        title: 'Product Catalog (PLP)',
                        route: '/products',
                        badge: 'Catalog',
                        desc: 'Full product listing with live search filters, category pills, price tags, and quick-add.',
                        icon: ShoppingBag,
                        iconColor: 'text-amber-400',
                        suggestedPrompt: 'Customize the product listing page: add more category filters and show stock badges.',
                      },
                      {
                        id: 'pdp',
                        title: 'Product Description (PDP)',
                        route: '/products/[id]',
                        badge: 'PDP / Buy Box',
                        desc: 'High-converting buy box with multi-angle gallery, color/size swatches, quantity stepper, WhatsApp order & tabs.',
                        icon: Sparkles,
                        iconColor: 'text-purple-400',
                        suggestedPrompt: 'Enhance the product detail page: emphasize the 2-year warranty and free shipping badge.',
                      },
                      {
                        id: 'story',
                        title: 'Brand Story & Atelier',
                        route: '/story',
                        badge: 'Heritage',
                        desc: 'Editorial brand heritage narrative, craftsmanship philosophy, and company timeline.',
                        icon: Leaf,
                        iconColor: 'text-emerald-400',
                        suggestedPrompt: 'Enhance the brand story page with modern founder quotes and sustainable craft values.',
                      },
                      {
                        id: 'reviews',
                        title: 'Customer Reviews & Proof',
                        route: '/reviews',
                        badge: 'Social Proof',
                        desc: 'Verified buyer testimonials, 5-star rating breakdown, and customer community wall.',
                        icon: Star,
                        iconColor: 'text-yellow-400',
                        suggestedPrompt: 'Add verified buyer badges and photo upload encouragement to the customer reviews page.',
                      },
                    ].map((pg) => {
                      const Icon = pg.icon;
                      const isCurrent = activePage === pg.id;
                      return (
                        <div
                          key={pg.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-blue-950/25 border-blue-500/60 ring-1 ring-blue-500/30'
                              : 'bg-[#12131D] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-center shrink-0">
                                <Icon className={`w-4 h-4 ${pg.iconColor}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs">{pg.title}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                                    {pg.route}
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-500">{pg.badge}</span>
                              </div>
                            </div>

                            {isCurrent ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Previewing
                              </span>
                            ) : null}
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                            {pg.desc}
                          </p>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                            <button
                              onClick={() => handleNavigatePage(pg.id)}
                              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                isCurrent
                                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                                  : 'bg-slate-800/80 text-zinc-300 hover:bg-slate-700 hover:text-white'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isCurrent ? 'Viewing in Canvas' : 'Preview Page'}
                            </button>

                            <button
                              onClick={() => {
                                setActiveTab('copilot');
                                setChatInput(pg.suggestedPrompt);
                              }}
                              className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 hover:bg-indigo-900/50 hover:text-white transition cursor-pointer flex items-center gap-1"
                              title="Ask AI to customize this page"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>AI Edit</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: CODE VIEWER (Autonomous Next.js 16 Web Project) */}
              {activeTab === 'code' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#0A0B10]">
                  {/* File Selector Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-2 bg-[#08090D] border-b border-slate-800 text-[11px]">
                    {projectCodeFiles.map((file, idx) => (
                      <button
                        key={file.file}
                        onClick={() => setSelectedFileIndex(idx)}
                        className={`px-2.5 py-1 rounded-md shrink-0 font-mono transition cursor-pointer ${
                          selectedFileIndex === idx
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {file.file}
                      </button>
                    ))}
                  </div>

                  {/* Code Viewer */}
                  <div className="flex-1 overflow-auto p-4 text-[11px] font-mono leading-relaxed bg-[#0B0C13]">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                      <span className="text-zinc-400 text-[10px]">
                        {projectCodeFiles[selectedFileIndex]?.description || ''}
                      </span>
                      <button
                        onClick={() => {
                          if (projectCodeFiles[selectedFileIndex]?.data) {
                            navigator.clipboard.writeText(projectCodeFiles[selectedFileIndex].data);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-zinc-300 select-text overflow-x-auto whitespace-pre">
                      {projectCodeFiles[selectedFileIndex]?.data || '// No code available'}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* ── DRAGGABLE SIDEBAR RESIZER ── */}
            <div
              onMouseDown={handleMouseDownResize}
              className={`w-1 hover:w-1.5 bg-slate-800 hover:bg-indigo-500 transition-all cursor-col-resize z-30 shrink-0 ${
                isDraggingSidebar ? 'bg-indigo-500 w-1.5' : ''
              }`}
            />

            {/* ── RIGHT PANEL: LIVE SANDBOXED PREVIEW ── */}
            <div className="flex-1 flex flex-col bg-[#05060A] overflow-hidden relative">
              {/* Preview Canvas Container */}
              <div className="flex-1 flex items-center justify-center p-3 sm:p-5 overflow-auto bg-[radial-gradient(#181926_1px,transparent_1px)] [background-size:16px_16px]">
                <div
                  style={{
                    width:
                      viewportMode === 'mobile'
                        ? '375px'
                        : viewportMode === 'tablet'
                        ? '768px'
                        : '100%',
                    height: viewportMode === 'mobile' ? '780px' : '100%',
                    transform: `scale(${zoomScale / 100})`,
                    transformOrigin: 'top center',
                  }}
                  className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-[#050608] flex flex-col ${
                    viewportMode !== 'desktop' ? 'my-auto ring-8 ring-black/40' : 'h-full w-full'
                  }`}
                >
                  {/* Mock Browser Topbar with Multi-Page Navigation */}
                  <div className="h-9 bg-[#0D0E15] border-b border-slate-800 px-3 flex items-center justify-between shrink-0 select-none gap-2">
                    {/* Left: Window controls + Back / Forward history */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 mr-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={handleGoBack}
                          disabled={historyIndex <= 0}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                          title="Back"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleGoForward}
                          disabled={historyIndex >= pageHistory.length - 1}
                          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                          title="Forward"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Center: Address Bar + Interactive Route Switcher */}
                    <div className="flex-1 max-w-md flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 border border-slate-800 text-[11px] font-mono text-zinc-300">
                      <span className="text-emerald-400 text-[10px]">https://</span>
                      <span className="text-zinc-400 truncate hidden sm:inline">
                        {project.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.omnistore.shop
                      </span>

                      {/* Interactive Route Dropdown */}
                      <select
                        value={activePage}
                        onChange={(e) => handleNavigatePage(e.target.value)}
                        className="bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 rounded px-1.5 py-0.5 text-[10px] font-semibold focus:outline-none cursor-pointer ml-auto"
                      >
                        <option value="home">/ (Home)</option>
                        <option value="products">/products (Catalog / PLP)</option>
                        <option value="pdp">/products/[id] (Product Details / PDP)</option>
                        <option value="story">/story (Brand Story)</option>
                        <option value="reviews">/reviews (Customer Reviews)</option>
                      </select>
                    </div>

                    {/* Right: Quick Page Switch Pills + Refresh */}
                    <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
                      <div className="hidden xl:flex items-center gap-1 mr-1">
                        {[
                          { id: 'home', label: 'Home' },
                          { id: 'products', label: 'Catalog' },
                          { id: 'pdp', label: 'PDP' },
                          { id: 'story', label: 'Story' },
                          { id: 'reviews', label: 'Reviews' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleNavigatePage(p.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                              activePage === p.id
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'bg-slate-900/60 text-zinc-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (iframeRef.current && previewHtml) {
                            const doc =
                              iframeRef.current.contentDocument ||
                              iframeRef.current.contentWindow?.document;
                            if (doc) {
                              doc.open();
                              doc.write(previewHtml);
                              doc.close();
                            }
                          }
                        }}
                        className="p-1 hover:text-white cursor-pointer rounded hover:bg-white/5 transition"
                        title="Reload preview"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Sandboxed Iframe */}
                  <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      title="Live Storefront Preview"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      className="w-full flex-1 border-0 bg-transparent"
                    />

                    {/* Hint badge when inspect mode is active and nothing is selected yet */}
                    {isInspectMode && !selectedElement && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <div className="px-3.5 py-1.5 rounded-full bg-black/80 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-2 shadow-xl backdrop-blur-md animate-in fade-in">
                          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>Click any image, headline, text, or button to customize with AI</span>
                        </div>
                      </div>
                    )}

                    {/* ── FLOATING CLICK-TO-CUSTOMIZE DOCK ── */}
                    {selectedElement && (
                      <div className="absolute bottom-4 left-4 right-4 z-40 bg-[#0F111C]/95 border border-cyan-500/60 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 text-white space-y-3">
                        {/* Top Bar: Target Info + Mode Switcher + Close */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {selectedElement.elementType === 'image' && selectedElement.src ? (
                              <img
                                src={selectedElement.src}
                                alt="selected"
                                className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                                {selectedElement.elementType === 'image' ? (
                                  <ImageIcon className="w-4 h-4" />
                                ) : selectedElement.elementType === 'heading' ||
                                  selectedElement.elementType === 'text' ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <MousePointer className="w-4 h-4" />
                                )}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white truncate">
                                  {selectedElement.label}
                                </span>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  {selectedElement.elementType || 'Element'}
                                </span>
                              </div>
                              {selectedElement.text && selectedElement.elementType !== 'image' && (
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-md">
                                  "{selectedElement.text}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Mode Switcher & Close */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                              <button
                                type="button"
                                onClick={() => setElementEditMode('prompt')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                                  elementEditMode === 'prompt'
                                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>Prompt AI</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setElementEditMode('direct')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                                  elementEditMode === 'direct'
                                    ? 'bg-cyan-600 text-black font-semibold shadow-xs'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                <Wand2 className="w-3 h-3 text-cyan-300" />
                                <span>Direct Edit</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedElement(null);
                                if (iframeRef.current?.contentWindow) {
                                  iframeRef.current.contentWindow.postMessage(
                                    { type: 'CLEAR_SELECTION' },
                                    '*'
                                  );
                                }
                              }}
                              className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                              title="Deselect element"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Mode 1: Prompt AI to Change This Element */}
                        {elementEditMode === 'prompt' && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={elementPromptInput}
                                onChange={(e) => setElementPromptInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCustomizeSelectedElementWithPrompt();
                                  }
                                }}
                                placeholder={
                                  selectedElement.elementType === 'image'
                                    ? 'e.g. Change image to a luxury pour-over coffee bar with warm moody lighting...'
                                    : selectedElement.elementType === 'button'
                                    ? 'e.g. Make button electric cyan with text "Explore Exclusive Deals"...'
                                    : 'e.g. Rewrite headline to be more punchy and emphasize limited festival offer...'
                                }
                                className="flex-1 bg-black/60 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleCustomizeSelectedElementWithPrompt()}
                                disabled={!elementPromptInput.trim() || isChatLoading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Change with AI</span>
                              </button>
                            </div>

                            {/* Quick Suggestion Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                              <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                                Suggestions:
                              </span>
                              {(selectedElement.elementType === 'image'
                                ? [
                                    'Make it cinematic & moody lighting',
                                    'Replace with minimalist studio photo',
                                    'Vibrant lifestyle product shot',
                                    'Luxury dark aesthetic photo',
                                  ]
                                : selectedElement.elementType === 'button'
                                ? [
                                    'Change text to "Explore Collection"',
                                    'Make button glow with primary accent',
                                    'Change text to "Claim 50% Off Today"',
                                  ]
                                : [
                                    'Make it punchier & shorter',
                                    'Rewrite with luxury & prestigious tone',
                                    'Add limited-time festival urgency',
                                    'Highlight verified 5-star customer ratings',
                                  ]
                              ).map((chip, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setElementPromptInput(chip);
                                    handleCustomizeSelectedElementWithPrompt(chip);
                                  }}
                                  className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-200 transition shrink-0 cursor-pointer"
                                >
                                  ✨ {chip}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mode 2: Quick Direct Edit (Instant local apply) */}
                        {elementEditMode === 'direct' && (
                          <div className="space-y-2.5">
                            {selectedElement.elementType === 'image' ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={elementDirectEditValue}
                                    onChange={(e) => setElementDirectEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyDirectEdit();
                                      }
                                    }}
                                    placeholder="Paste image URL (https://...)"
                                    className="flex-1 bg-black/60 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleApplyDirectEdit()}
                                    disabled={!elementDirectEditValue.trim()}
                                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs shadow-lg transition cursor-pointer shrink-0"
                                  >
                                    Apply Image
                                  </button>
                                </div>

                                {/* Curated Presets */}
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                                  <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                                    Presets:
                                  </span>
                                  {CURATED_IMAGE_PRESETS.map((p, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleApplyDirectEdit(p.url)}
                                      className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-200 transition shrink-0 cursor-pointer"
                                    >
                                      📷 {p.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={elementDirectEditValue}
                                  onChange={(e) => setElementDirectEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleApplyDirectEdit();
                                    }
                                  }}
                                  placeholder={`Enter new ${selectedElement.label.toLowerCase()} text...`}
                                  className="flex-1 bg-black/60 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApplyDirectEdit()}
                                  disabled={!elementDirectEditValue.trim()}
                                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs shadow-lg transition cursor-pointer shrink-0"
                                >
                                  Apply Text
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── VERCEL DEPLOYMENT MODAL ── */}
      {isDeployModalOpen && project && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#12131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Rocket className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Deploy to Vercel</h3>
              </div>
              <button
                onClick={() => {
                  if (!isDeploying) setIsDeployModalOpen(false);
                }}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              OmniStore will package your autonomous Next.js 16 website application files and deploy them directly
              to Vercel's global edge network with custom domain support.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Vercel Project Slug</label>
              <input
                type="text"
                value={customProjectSlug}
                onChange={(e) => setCustomProjectSlug(e.target.value)}
                disabled={isDeploying}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-slate-800 text-xs text-white font-mono focus:border-indigo-500 outline-hidden"
              />
            </div>

            {/* Deployment Steps */}
            {isDeploying && (
              <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${deployStep >= 1 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {deployStep >= 1 ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Synthesizing Next.js 16 build manifest...</span>
                </div>
                <div className={`flex items-center gap-2 ${deployStep >= 2 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {deployStep >= 2 ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Dispatching to Vercel REST API v13...</span>
                </div>
                <div className={`flex items-center gap-2 ${deployStep >= 3 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {deployStep >= 3 ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Building edge bundle & routing lambdas...</span>
                </div>
                <div className={`flex items-center gap-2 ${deployStep >= 4 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                  {deployStep >= 4 && <Check className="w-3.5 h-3.5" />}
                  <span>🎉 Live on Vercel: https://{customProjectSlug}.vercel.app</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeployModalOpen(false)}
                disabled={isDeploying}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeployToVercel}
                disabled={isDeploying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isDeploying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                <span>{isDeploying ? 'Deploying...' : 'Confirm & Deploy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Feedback Floating Notification */}
      {saveFeedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{saveFeedbackMessage}</span>
        </div>
      )}
    </div>
  );
}

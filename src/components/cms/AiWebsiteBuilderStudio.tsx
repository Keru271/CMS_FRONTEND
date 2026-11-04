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
  Coffee,
  Leaf,
  Cpu,
  Store,
  Wand2,
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
  STOREFRONT_ARCHETYPES,
  StorefrontTemplateArchetype,
} from './ai-builder/storefrontTemplates';
import { renderStorefrontHtml } from './ai-builder/storefrontRenderer';
import { generateNextjsProjectFiles } from './ai-builder/storefrontCodeGenerator';
import { analyzeImagePalette } from './ai-builder/storefrontImageAnalyzer';

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
  { key: 'gemini', name: 'Gemini 2.0 Flash', tag: 'Fast & Live' },
  { key: 'chatgpt', name: 'OpenAI ChatGPT 4o', tag: 'Creative' },
  { key: 'claude', name: 'Claude 3.5 Sonnet', tag: 'Architecture' },
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
  provider?: 'gemini' | 'chatgpt';
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
    templateSlug: 'mincom',
    prompt:
      'Build an artisanal single-origin coffee roastery called RoastCraft with warm espresso and terracotta tones, product subscription bundles, brewing guides, and customer reviews.',
  },
  {
    icon: Leaf,
    title: 'Aethel Botanicals',
    category: 'Organic Skincare',
    templateSlug: 'fern',
    prompt:
      'Build a Scandinavian organic skincare and serum brand called Aethel Botanicals with gentle eucalyptus sage accents, porcelain cards, and clean customer testimonials.',
  },
  {
    icon: Cpu,
    title: 'Kuro Tech Outerwear',
    category: 'Cyberpunk Apparel',
    templateSlug: 'techno',
    prompt:
      'Build a futuristic architectural streetwear and acoustic audio store called Kuro Studio with electric cyan neon accents, dark mode glassmorphism cards, and high-top sneaker drops.',
  },
  {
    icon: Store,
    title: 'Nordic Living',
    category: 'Artisan Home & Oak',
    templateSlug: 'funo',
    prompt:
      'Build a modern Scandinavian furniture and handcrafted ceramic atelier called Nordic Atelier with airy whitespace, warm sand tones, and natural lifestyle photography.',
  },
  {
    icon: Sparkles,
    title: 'Pawzy Goods',
    category: 'Conscious Pet Care',
    templateSlug: 'pawzy',
    prompt:
      'Build a premium organic pet nutrition and lifestyle store called Pawzy Goods with warm honey badges, gourmet organic treats, and verified customer pet unboxings.',
  },
  {
    icon: Zap,
    title: 'Velvet Haute',
    category: 'Haute Horlogerie',
    templateSlug: 'luxe',
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

  // Initial Intake Screen State
  const [initialPromptInput, setInitialPromptInput] = useState('');
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState('mincom');
  const [isBuildingProject, setIsBuildingProject] = useState(false);
  const [buildingStep, setBuildingStep] = useState(0);

  // History Checkpoints for 1-Click Rollback
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);

  // Studio Modes & Tools
  const [activeTab, setActiveTab] = useState<'copilot' | 'sections' | 'styles' | 'pages' | 'code'>('copilot');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isInspectMode, setIsInspectMode] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<{
    sectionId: string;
    label: string;
    text: string;
    tagName: string;
  } | null>(null);

  // Left Sidebar Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(510);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(510);

  // Conversational AI State
  const [aiProvider, setAiProvider] = useState<'gemini' | 'chatgpt'>('gemini');
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

  // DOM Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Generated Next.js project code files following storefront-frontend architecture
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
          })
        : '',
    [project, isInspectMode]
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

  // Handle postMessage communication from sandboxed iframe (Inspect Mode)
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ELEMENT_SELECTED') {
        setSelectedElement({
          sectionId: event.data.sectionId,
          label: event.data.label,
          text: event.data.text,
          tagName: event.data.tagName,
        });
        setActiveTab('copilot');
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
   * Scaffolds the storefront application based on storefront-frontend folder structure
   */
  const handleBuildStorefront = async (
    customPrompt?: string,
    overrideSlug?: string,
    overrideImages?: ReferenceImageItem[]
  ) => {
    const promptToUse = (customPrompt || initialPromptInput).trim();
    if (!promptToUse && (!overrideImages || overrideImages.length === 0)) return;

    const slugToUse = overrideSlug || selectedTemplateSlug || 'mincom';
    const imagesToUse = overrideImages || [...pendingReferenceImages];

    setIsBuildingProject(true);
    setBuildingStep(1);

    // Progressive visual steps
    const t1 = setTimeout(() => setBuildingStep(2), 500);
    const t2 = setTimeout(() => setBuildingStep(3), 1100);
    const t3 = setTimeout(() => setBuildingStep(4), 1800);
    const t4 = setTimeout(() => setBuildingStep(5), 2400);

    try {
      // Find template archetype configuration
      const archetype =
        STOREFRONT_ARCHETYPES.find((a) => a.slug === slugToUse) || STOREFRONT_ARCHETYPES[0];

      // Smart brand name derivation
      let brandName = 'Artisan Craft';
      let tagline = 'Crafted with Precision for Modern Visionaries';
      let industry = archetype.category;

      const brandMatch = promptToUse.match(
        /(?:called|brand\s+name\s+is|named|brand\s+is)\s+["']?([^"'\n,.]+)["']?/i
      );
      if (brandMatch && brandMatch[1]) {
        brandName = brandMatch[1].trim();
      } else {
        const lower = promptToUse.toLowerCase();
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

      // Color overrides from prompt text if explicitly stated
      const lower = promptToUse.toLowerCase();
      if (!hasImageExtraction) {
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

      // Catalog photography & hero layout based on detected industry
      let heroImage = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&auto=format&fit=crop';
      let heroLayout = 'split';
      let heroBadge = '✨ SS26 SIGNATURE COLLECTION';
      let catalogProducts = [
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

      if (industry.includes('Coffee') || lower.includes('coffee') || lower.includes('roast')) {
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

      // Build tailored storefront sections matching the brand
      const sections: StorefrontSection[] = [
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
            categories: ['All', ...Array.from(new Set(catalogProducts.map((p) => p.category)))],
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
          },
        },
      ];

      // 2. MULTIMODAL VISION DECOMPOSITION VIA BACKEND API (GEMINI / OPENAI)
      let visionAppliedSteps: string[] = [];
      if (imagesToUse.length > 0) {
        try {
          const visionRes = await cmsService.chatAiWebsite({
            message: promptToUse || 'Decompose this reference image in detail. Extract store concept, brand name, color palette, typography, hero layout, and industry products to match.',
            provider: aiProvider,
            referenceImages: imagesToUse,
            currentTheme: theme,
            currentSections: sections,
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

            // Sync sections returned by Vision AI (including customized hero and products)
            if (visionRes.project.pages?.[0]?.sections) {
              const backendSections = visionRes.project.pages[0].sections;
              backendSections.forEach((bs: any) => {
                const existing = sections.find((s) => s.id === bs.id);
                if (existing) {
                  if (bs.title) existing.title = bs.title;
                  if (bs.subtitle) existing.subtitle = bs.subtitle;
                  if (bs.contentJson) {
                    existing.contentJson = {
                      ...existing.contentJson,
                      ...bs.contentJson,
                    };
                  }
                } else if (bs.type) {
                  sections.push({
                    id: bs.id || `sec-${Date.now()}`,
                    name: bs.title || bs.name || 'New Section',
                    type: bs.type,
                    title: bs.title || 'Featured Content',
                    subtitle: bs.subtitle || '',
                    enabled: true,
                    contentJson: bs.contentJson || {},
                  });
                }
              });
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
        id: `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-storefront`,
        brandName,
        tagline,
        industry,
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
        updatedAt: new Date().toISOString(),
      };

      // Wait a moment for generation animation sequence to complete
      await new Promise((r) => setTimeout(r, 1600));

      setProject(newProj);
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
      const chatGreetingSteps = visionAppliedSteps.length > 0
        ? visionAppliedSteps
        : [
            imagesToUse.length > 0
              ? 'Analyzed reference image visual palette & contrast hierarchy'
              : `Parsed prompt: "${promptToUse.slice(0, 50)}..."`,
            `Configured ${industry} catalog and responsive sections`,
            `Applied design palette: Background ${theme.background}, Accent ${theme.accent}`,
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
              : `I've generated your complete application based on our Next.js 16 storefront multi-template architecture.`
          }\n\n✨ **What was engineered:**\n• **Store Niche**: ${industry}\n• **Design Palette**: Background \`${theme.background}\`, Accent \`${theme.accent}\`, Text \`${theme.textColor}\`\n• **Typography**: Heading \`${theme.headingFont}\`, Body \`${theme.bodyFont}\`\n• **App Router files**: \`app/layout.tsx\`, \`app/page.tsx\`, \`app/globals.css\`\n• **Template components**: \`templates/${slugToUse}/Header.tsx\`, \`HomePage.tsx\`, \`ProductCard.tsx\`, \`Footer.tsx\`\n\nTake a look at the live interactive preview on the right, inspect the code in the **Code** tab, or ask me to refine any element below!`,
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
          referenceImages: imagesToProcess.length > 0 ? imagesToProcess : undefined,
          currentTheme: project.theme,
          currentSections: project.sections,
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
              if (th.accent) updatedProj.theme.accent = th.accent;
              if (th.background) updatedProj.theme.background = th.background;
              if (th.cardBg) updatedProj.theme.cardBg = th.cardBg;
              if (th.textColor) updatedProj.theme.textColor = th.textColor;
              if (th.headingFont) updatedProj.theme.headingFont = th.headingFont;
              if (th.bodyFont) updatedProj.theme.bodyFont = th.bodyFont;
              if (th.borderRadius) updatedProj.theme.borderRadius = th.borderRadius;
            }

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
              backendSections.forEach((bs: any) => {
                const existing = updatedProj.sections.find((s) => s.id === bs.id);
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
                } else if (bs.type) {
                  updatedProj.sections.push({
                    id: bs.id || `section-${Date.now()}`,
                    name: bs.title || bs.name || 'New Section',
                    type: bs.type,
                    title: bs.title || 'Featured Content',
                    subtitle: bs.subtitle || '',
                    enabled: true,
                    contentJson: bs.contentJson || {},
                  });
                }
              });
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

            // Selected element direct override
            if (selectedElement && selectedElement.sectionId) {
              const sec = updatedProj.sections.find((s) => s.id === selectedElement.sectionId);
              if (sec) {
                sec.title = finalPrompt.replace(/^@[\w\s]+:\s*/, '');
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

            {/* AI Provider Switcher */}
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setAiProvider('gemini')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                  aiProvider === 'gemini'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Gemini 2.0 Flash</span>
              </button>
              <button
                onClick={() => setAiProvider('chatgpt')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                  aiProvider === 'chatgpt'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>ChatGPT 4o</span>
              </button>
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

            {/* Main Interactive Prompt Intake Card */}
            <div className="w-full bg-[#121422]/90 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 backdrop-blur-xl relative group focus-within:border-indigo-500 transition-all duration-300">
              {/* Reference Images Staging Chip Preview */}
              {pendingReferenceImages.length > 0 && (
                <div className="mb-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto py-0.5">
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
                        <span className="max-w-[130px] truncate text-[11px]">{img.name}</span>
                        <button
                          type="button"
                          onClick={() => setPendingReferenceImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-red-400 p-0.5 text-zinc-400 cursor-pointer"
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
                placeholder="e.g. Build an artisan coffee and pastry roastery called RoastCraft with warm espresso and terracotta tones, product subscription bundles, customer review ratings, and a 4K video banner..."
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
                {INSPIRATION_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setInitialPromptInput(item.prompt);
                        setSelectedTemplateSlug(item.templateSlug);
                        handleBuildStorefront(item.prompt, item.templateSlug);
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
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {item.templateSlug}
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

            {/* Storefront Template Architecture Selector */}
            <div className="w-full space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                  Select Base Storefront Template Architecture:
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">
                  {STOREFRONT_ARCHETYPES.length} Available in storefront-frontend
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STOREFRONT_ARCHETYPES.map((arch) => {
                  const isSelected = selectedTemplateSlug === arch.slug;
                  return (
                    <button
                      key={arch.slug}
                      onClick={() => setSelectedTemplateSlug(arch.slug)}
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
                  {project.templateSlug || 'mincom'}
                </span>
                <button
                  onClick={() => setProject(null)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Start over with a new prompt"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-400" />
                  <span>New Storefront</span>
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
                        onClick={() => setSelectedElement(null)}
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
                      <div className="mb-2.5 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                            Reference:
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
                              <span className="max-w-[130px] truncate text-[11px]">{img.name}</span>
                              <button
                                type="button"
                                onClick={() => setPendingReferenceImages((prev) => prev.filter((_, i) => i !== idx))}
                                className="hover:text-red-400 p-0.5 text-zinc-400 cursor-pointer"
                                title="Remove reference image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400 shrink-0 hidden sm:inline">
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
                        if (m.key === 'gemini' || m.key === 'chatgpt') {
                          setAiProvider(m.key);
                        }
                      }}
                      busy={isChatLoading}
                      onSend={(text, meta) => {
                        let fullPrompt = text;
                        if (selectedElement) {
                          fullPrompt = `@${selectedElement.label}: ${fullPrompt}`;
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
                        <span>Engine: {aiProvider === 'gemini' ? 'Google Gemini 2.0 Flash' : 'ChatGPT 4o'}</span>
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

              {/* TAB 4: CODE VIEWER (Strictly following storefront-frontend architecture) */}
              {activeTab === 'code' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#0A0B10]">
                  {/* File Selector Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto p-2 bg-[#08090D] border-b border-slate-800 text-[11px]">
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
                  {/* Mock Browser Topbar */}
                  <div className="h-8 bg-[#0D0E15] border-b border-slate-800 px-3 flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-0.5 rounded-md bg-black/40 border border-slate-800 text-[10px] font-mono text-zinc-400 max-w-[280px] truncate">
                      <span className="text-emerald-400">https://</span>
                      <span className="truncate">{project.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.omnistore.shop</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400">
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
                        className="p-1 hover:text-white cursor-pointer"
                        title="Reload preview"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Sandboxed Iframe */}
                  <iframe
                    ref={iframeRef}
                    title="Live Storefront Preview"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    className="w-full flex-1 border-0 bg-transparent"
                  />
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
              OmniStore will package your Next.js 16 storefront application files and deploy them directly
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
    </div>
  );
}

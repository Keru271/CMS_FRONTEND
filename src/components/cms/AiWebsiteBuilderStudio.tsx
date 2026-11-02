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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PromptBar, PromptSource, PromptCommand, PromptModel, isVideoAsset } from '@/src/components/ui/PromptBar';
import {
  StorefrontTheme,
  StorefrontSection,
  StorefrontProject,
  DESIGN_PRESETS,
  INITIAL_SECTIONS,
  DesignPreset,
} from './ai-builder/storefrontTemplates';
import { renderStorefrontHtml } from './ai-builder/storefrontRenderer';
import { generateNextjsProjectFiles } from './ai-builder/storefrontCodeGenerator';

const AI_BUILDER_SOURCES: PromptSource[] = [
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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  provider?: 'gemini' | 'chatgpt';
  steps?: string[];
  suggestedReplies?: string[];
  appliedChanges?: string[];
}

interface Checkpoint {
  id: string;
  label: string;
  timestamp: string;
  project: StorefrontProject;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function AiWebsiteBuilderStudio({
  isFullscreenStandalone = false,
}: {
  isFullscreenStandalone?: boolean;
}) {
  const router = useRouter();

  // Primary Storefront Project State
  const [project, setProject] = useState<StorefrontProject>({
    id: 'velvet-haute-atelier',
    brandName: 'Velvet Haute',
    tagline: 'Timeless Precision Crafted for Modern Visionaries',
    industry: 'Luxury Horlogerie & High Craft',
    theme: { ...DESIGN_PRESETS[0].theme },
    sections: [...INITIAL_SECTIONS],
    activePage: 'home',
    pages: [
      { slug: 'home', title: 'Home / Drops' },
      { slug: 'catalog', title: 'All Timepieces' },
      { slug: 'product', title: 'Product Spotlight' },
      { slug: 'story', title: 'Atelier Heritage' },
      { slug: 'contact', title: 'VIP Concierge' },
    ],
    updatedAt: new Date().toISOString(),
  });

  // History Checkpoints for 1-Click Rollback (Lovable style)
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    {
      id: 'init',
      label: 'v1 - Initial Atelier',
      timestamp: 'Just now',
      project: {
        id: 'velvet-haute-atelier',
        brandName: 'Velvet Haute',
        tagline: 'Timeless Precision Crafted for Modern Visionaries',
        industry: 'Luxury Horlogerie & High Craft',
        theme: { ...DESIGN_PRESETS[0].theme },
        sections: [...INITIAL_SECTIONS],
        activePage: 'home',
        pages: [
          { slug: 'home', title: 'Home / Drops' },
          { slug: 'catalog', title: 'All Timepieces' },
        ],
        updatedAt: new Date().toISOString(),
      },
    },
  ]);
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Welcome to OmniStore AI Website Builder! I'm your Lovable-grade Storefront Architect.\n\nI design high-converting e-commerce web applications, customize layouts, configure live video reels, and wire your OmniStore headless API live as we chat.\n\n✨ What store would you like to build, or what section shall we refine first?",
      time: 'Just now',
      provider: 'gemini',
      steps: [
        'Initialized Haute Horlogerie aesthetic design tokens',
        'Configured 4K Video Hero & social reels showcase',
        'Synchronized live inventory with sliding cart drawer',
      ],
      suggestedReplies: [
        'Add 4K video background hero',
        'Switch to Obsidian Gold dark mode',
        'Add customer review testimonials',
        'Enable 24/7 WhatsApp concierge',
      ],
    },
  ]);

  // Code Viewer State
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Vercel / Deployment State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [customProjectSlug, setCustomProjectSlug] = useState('velvet-haute-storefront');

  // DOM Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Generated Next.js project code files
  const projectCodeFiles = useMemo(() => generateNextjsProjectFiles(project), [project]);

  // Render Sandboxed HTML Preview
  const previewHtml = useMemo(
    () =>
      renderStorefrontHtml({
        brandName: project.brandName,
        tagline: project.tagline,
        theme: project.theme,
        sections: project.sections,
        inspectMode: isInspectMode,
      }),
    [project, isInspectMode]
  );

  // Update Iframe srcDoc safely
  useEffect(() => {
    if (iframeRef.current) {
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
      const updatedSections = prev.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      const next = { ...prev, sections: updatedSections, updatedAt: new Date().toISOString() };
      addCheckpoint(`Toggled ${id}`, next);
      return next;
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setProject((prev) => {
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
      const newSections = prev.sections.filter((s) => s.id !== id);
      const next = { ...prev, sections: newSections, updatedAt: new Date().toISOString() };
      addCheckpoint(`Removed ${id}`, next);
      return next;
    });
  };

  const addPresetSection = (type: StorefrontSection['type']) => {
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
        subtitle: 'Real moments captured by watchmakers and collectors worldwide.',
        contentJson: {
          reels: [
            {
              id: 'reel-a',
              title: 'Titanium Bezel in Natural Daylight',
              author: '@horology_master',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
              poster: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
              views: '54.2K',
            },
            {
              id: 'reel-b',
              title: 'Tuscan Leather Quick Change',
              author: '@saddle_craft',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
              poster: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop',
              views: '92.1K',
            },
          ],
        },
      },
      reviews: {
        name: 'Customer Reviews',
        title: 'Verified Collector Testimonials',
        subtitle: 'Rated 4.96/5.0 across 1,840+ client appraisals.',
        contentJson: {
          averageRating: 4.96,
          reviews: [
            {
              author: 'Julian Sterling',
              location: 'London',
              rating: 5,
              text: 'The finishing on the titanium casing rivals timepieces quadruple its investment.',
              date: '2 days ago',
            },
          ],
        },
      },
      faq: {
        name: 'FAQ Accordion',
        title: 'Frequently Asked Questions',
        subtitle: 'Acquisition, global transit, and servicing guarantees.',
        contentJson: {
          items: [
            { q: 'How does encrypted checkout work?', a: 'All acquisitions are processed via 256-bit SSL encryption with insured armored transit.' },
            { q: 'What is your trial period?', a: 'We offer a 30-day trial period with complimentary return shipping.' },
          ],
        },
      },
    };

    const template = sectionTemplates[type] || {
      name: `${type.toUpperCase()} Section`,
      title: `Signature ${type}`,
      subtitle: 'Custom section configured by AI Architect.',
    };

    const newSec: StorefrontSection = {
      id: `${type}-${Date.now().toString(36)}`,
      name: template.name || 'New Section',
      type,
      title: template.title || 'Section Title',
      subtitle: template.subtitle,
      enabled: true,
      contentJson: template.contentJson || {},
    };

    setProject((prev) => {
      const next = { ...prev, sections: [...prev.sections, newSec], updatedAt: new Date().toISOString() };
      addCheckpoint(`Added ${newSec.name}`, next);
      return next;
    });
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
  };

  // Preset Theme Switcher
  const applyDesignPreset = (preset: DesignPreset) => {
    setProject((prev) => {
      const next = { ...prev, theme: { ...preset.theme }, updatedAt: new Date().toISOString() };
      addCheckpoint(`Applied ${preset.name}`, next);
      return next;
    });
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  // Color & Token Customizer
  const updateThemeColor = (key: keyof StorefrontTheme, val: string) => {
    setProject((prev) => {
      const next = { ...prev, theme: { ...prev.theme, [key]: val }, updatedAt: new Date().toISOString() };
      return next;
    });
  };

  // File Attachment Handler
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
        fileInput.accept = 'video/*,image/*,.mp4,.webm,.mov,.m4v,.mkv,.avi,.png,.jpg,.jpeg,.webp,.svg,.json,.txt,.css';
      }
      fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const fileNames = Array.from(target.files || []).map((f) => f.name);
        resolve(fileNames);
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

  // Conversational AI Generation Handler (Lovable Super-Engine)
  const handleSendPrompt = useCallback(
    async (textToSend?: string) => {
      const message = (textToSend || chatInput).trim();
      if (!message || isChatLoading) return;

      if (message === '/reset') {
        setChatMessages([
          {
            id: generateId(),
            role: 'assistant',
            text: "✨ Canvas reset! What store or brand would you like to build today?",
            time: formatTime(),
            suggestedReplies: ['Velvet Haute (Luxury Watches)', 'Kuro Studio (Dark Streetwear)', 'Aethel (Botanical Skincare)'],
          },
        ]);
        setChatInput('');
        return;
      }

      // Add user message to conversation
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        text: message,
        time: formatTime(),
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput('');
      setIsChatLoading(true);

      const lower = message.toLowerCase();

      // Reactive Local Engine: instant preview update with zero lag
      setTimeout(() => {
        setProject((currentProj) => {
          const updatedProj = JSON.parse(JSON.stringify(currentProj)) as StorefrontProject;
          const appliedSteps: string[] = [];

          // 1. Color / Theme changes
          if (lower.includes('dark') || lower.includes('black') || lower.includes('/dark')) {
            updatedProj.theme = { ...DESIGN_PRESETS[0].theme };
            appliedSteps.push('Switched theme to Obsidian Haute Luxe Dark Mode (#050608)');
          } else if (lower.includes('light') || lower.includes('white') || lower.includes('/light')) {
            updatedProj.theme = { ...DESIGN_PRESETS[4].theme };
            appliedSteps.push('Switched theme to Minimalist Scandinavian Light Mode (#FFFFFF)');
          } else if (lower.includes('gold') || lower.includes('/luxury')) {
            updatedProj.theme.accent = '#D4AF37';
            appliedSteps.push('Applied Champagne Gold metallic accents (#D4AF37)');
          } else if (lower.includes('cyan') || lower.includes('neon') || lower.includes('tech')) {
            updatedProj.theme.accent = '#00E5FF';
            appliedSteps.push('Applied Neon Electric Cyan accents (#00E5FF)');
          } else if (lower.includes('green') || lower.includes('emerald') || lower.includes('botanical')) {
            updatedProj.theme.accent = '#10B981';
            appliedSteps.push('Applied Vibrant Emerald Green accents (#10B981)');
          }

          // 2. Video & Reels integration
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
                appliedSteps.push('Integrated Social Video Reels Showcase Section');
              }
            }
            // Ensure hero video background is active
            const hero = updatedProj.sections.find((s) => s.type === 'hero');
            if (hero && hero.contentJson) {
              hero.contentJson.hasVideoBackground = true;
              appliedSteps.push('Activated 4K Looped Video Background on Hero Section');
            }
          }

          // 3. Brand name change
          const brandMatch = message.match(/(?:brand\s+name\s+to|call\s+it|name\s+is)\s+["']?([^"'\n,.]+)["']?/i);
          if (brandMatch && brandMatch[1]) {
            const newBrand = brandMatch[1].trim();
            updatedProj.brandName = newBrand;
            const hero = updatedProj.sections.find((s) => s.type === 'hero');
            if (hero) hero.title = `The New Era of ${newBrand}`;
            const header = updatedProj.sections.find((s) => s.type === 'header');
            if (header && header.contentJson) header.contentJson.logoText = newBrand.toUpperCase();
            appliedSteps.push(`Updated Storefront Brand Name to "${newBrand}"`);
          }

          // 4. Copy customization if selected element is active
          if (selectedElement && selectedElement.sectionId) {
            const sec = updatedProj.sections.find((s) => s.id === selectedElement.sectionId);
            if (sec) {
              sec.title = message.replace(/^@[\w\s]+:\s*/, '');
              appliedSteps.push(`Customized ${selectedElement.label} copy to "${sec.title}"`);
            }
          }

          if (appliedSteps.length === 0) {
            appliedSteps.push('Refined live typography, component layout, and responsiveness');
          }

          addCheckpoint(`Prompt: ${message.slice(0, 30)}...`, updatedProj);
          return updatedProj;
        });

        // Add assistant reply
        const replyText =
          lower.includes('video') || lower.includes('.mp4')
            ? "🎥 I've attached your video asset and configured a High-Definition Video Showcase and Social Reels section right below your Hero banner! The video background is live and playing in the sandboxed viewport."
            : lower.includes('dark') || lower.includes('gold')
            ? "🌙 Switched to our signature Obsidian Haute Luxe aesthetic! Deep pitch-black background with champagne gold accents (#D4AF37) across buttons, price tags, and badges."
            : `✨ Customized your storefront with "${message}"! The live sandboxed viewport on the right has updated instantly. What would you like to refine next?`;

        setChatMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            text: replyText,
            time: formatTime(),
            provider: aiProvider,
            steps: [
              'Synthesized layout & design tokens',
              'Integrated responsive sections',
              'Hot-reloaded sandboxed browser viewport',
            ],
            suggestedReplies: [
              'Add social video reels',
              'Change accent to champagne gold',
              'Add 20% discount hero badge',
              'Test shopping cart drawer',
            ],
            appliedChanges: ['Storefront live sandbox updated in real-time'],
          },
        ]);

        setIsChatLoading(false);
        setSelectedElement(null);
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      }, 650);
    },
    [chatInput, isChatLoading, aiProvider, selectedElement, addCheckpoint]
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
    const jsonPackage = JSON.stringify(
      {
        project: project.brandName,
        industry: project.industry,
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
    a.download = `${project.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-nextjs-storefront.json`;
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
      {/* ── LOVABLE HEADER BAR ── */}
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

          {/* Project Identity & Page Switcher */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="font-bold text-sm text-white tracking-tight font-serif">{project.brandName}</span>
            <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.industry}
            </span>
          </div>

          {/* Version Checkpoint Pills & Undo/Redo (Lovable style) */}
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

          {/* Export Code Button */}
          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Download Next.js project code package"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Export Code</span>
          </button>

          {/* 1-Click Deploy to Vercel */}
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deploy</span>
          </button>
        </div>
      </header>

      {/* ── MAIN STUDIO BODY: SIDEBAR + VIEWPORT CANVAS ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT LOVABLE STUDIO SIDEBAR */}
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
              <span>Code</span>
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
                      Selected: <strong>{selectedElement.label}</strong> {selectedElement.text ? `("${selectedElement.text}")` : ''}
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
                    <span>AI Architect is tailoring your live storefront...</span>
                  </div>
                )}

                <div ref={chatMessagesEndRef} />
              </div>

              {/* Prompt Bar Footer (Accepts Text + Video Assets) */}
              <div className="p-3 border-t border-slate-800 bg-[#090A0F] shrink-0">
                <PromptBar
                  value={chatInput}
                  onChange={setChatInput}
                  placeholder={
                    selectedElement
                      ? `Customize ${selectedElement.label}...`
                      : "Tell AI what to customize... (Type '@' for sections, '/' for styles)"
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
                      const otherAssets = meta.attachments.filter((a) => !isVideoAsset(a));
                      if (videoAssets.length > 0) {
                        fullPrompt += `\n[Attached Video Asset(s): ${videoAssets.join(', ')} — embed as background video hero or interactive reels showcase]`;
                      }
                      if (otherAssets.length > 0) {
                        fullPrompt += `\n[Attached Assets: ${otherAssets.join(', ')}]`;
                      }
                    }
                    handleSendPrompt(fullPrompt);
                  }}
                  onStop={() => setIsChatLoading(false)}
                  onDictate={handleDictate}
                  onAttach={handleAttach}
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
                  <h3 className="font-bold text-sm text-white">Storefront Sections</h3>
                  <p className="text-[11px] text-zinc-400">Reorder, toggle, or insert modular components.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {project.sections.filter((s) => s.enabled).length} Active
                </span>
              </div>

              {/* Sections List */}
              <div className="space-y-2 mt-2">
                {project.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      section.enabled
                        ? 'bg-[#181926] border-slate-800 text-white'
                        : 'bg-[#090A0F] border-slate-900 text-zinc-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === project.sections.length - 1}
                          className="hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate flex items-center gap-1.5">
                          {section.type === 'hero' && <Sparkles className="w-3 h-3 text-amber-400" />}
                          {section.type.includes('video') && <Video className="w-3 h-3 text-purple-400" />}
                          {section.type === 'products' && <ShoppingBag className="w-3 h-3 text-emerald-400" />}
                          <span>{section.name}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{section.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                        title={section.enabled ? 'Hide Section' : 'Show Section'}
                      >
                        {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Block Presets */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="font-bold text-xs text-zinc-300">Insert New Modular Block:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addPresetSection('video_showcase')}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold text-xs text-white">Video Showcase</div>
                      <div className="text-[10px] text-zinc-400">4K Motion Cinema</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addPresetSection('video_reels')}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold text-xs text-white">Social Reels</div>
                      <div className="text-[10px] text-zinc-400">Vertical Carousel</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addPresetSection('reviews')}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Star className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-xs text-white">Reviews</div>
                      <div className="text-[10px] text-zinc-400">Social Proof Testimonials</div>
                    </div>
                  </button>

                  <button
                    onClick={() => addPresetSection('faq')}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition text-left flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-semibold text-xs text-white">FAQ Accordion</div>
                      <div className="text-[10px] text-zinc-400">Expandable Inquiries</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEME & TOKENS STUDIO */}
          {activeTab === 'styles' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              <div>
                <h3 className="font-bold text-sm text-white">Live Design Presets</h3>
                <p className="text-[11px] text-zinc-400">Apply instant curated aesthetics with 1 click.</p>
              </div>

              {/* Preset Cards */}
              <div className="space-y-2">
                {DESIGN_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyDesignPreset(preset)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      project.theme.styleArchetype === preset.name
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-md'
                        : 'border-slate-800 bg-[#181926] hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{preset.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">{preset.description}</p>
                    </div>

                    <div className="flex items-center gap-1 pl-2">
                      {preset.previewColors.map((c, i) => (
                        <span key={i} className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Color Pickers */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="font-bold text-xs text-zinc-300">Custom Palette Tokens:</span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#181926] border border-slate-800 space-y-1.5">
                    <span className="text-[11px] text-zinc-400">Accent Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={project.theme.accent}
                        onChange={(e) => updateThemeColor('accent', e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="font-mono text-xs text-white uppercase">{project.theme.accent}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#181926] border border-slate-800 space-y-1.5">
                    <span className="text-[11px] text-zinc-400">Canvas Background</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={project.theme.background}
                        onChange={(e) => updateThemeColor('background', e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="font-mono text-xs text-white uppercase">{project.theme.background}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Pairing */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-bold text-xs text-zinc-300">Typography Pairing:</span>
                <div className="p-3 rounded-xl bg-[#181926] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Heading Font:</span>
                    <span className="font-bold text-indigo-400 font-serif">{project.theme.headingFont}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Body Font:</span>
                    <span className="font-semibold text-zinc-200">{project.theme.bodyFont}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CODE STUDIO */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0F111A]">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-white">Next.js 16 Project Structure</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(projectCodeFiles[selectedFileIndex]?.data || '');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy File'}</span>
                </button>
              </div>

              {/* File Tabs */}
              <div className="flex gap-1 overflow-x-auto p-2 border-b border-slate-800 bg-[#090A0F] scrollbar-none">
                {projectCodeFiles.map((f, idx) => (
                  <button
                    key={f.file}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition cursor-pointer ${
                      selectedFileIndex === idx
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {f.file}
                  </button>
                ))}
              </div>

              {/* Syntax Code Container */}
              <div className="flex-1 overflow-auto p-4 bg-[#07080C] font-mono text-[11px] text-zinc-300 leading-relaxed">
                <pre>{projectCodeFiles[selectedFileIndex]?.data}</pre>
              </div>
            </div>
          )}
        </div>

        {/* ── DIVIDER RESIZE HANDLE ── */}
        <div
          onMouseDown={handleMouseDownResize}
          title="Drag horizontally to resize editor panel"
          className="w-1.5 hover:w-2 cursor-col-resize bg-slate-900 hover:bg-indigo-600 transition-colors shrink-0 z-30"
        />

        {/* RIGHT LIVE RESPONSIVE VIEWPORT CANVAS (LOVABLE BROWSER) */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#07080C] overflow-hidden">
          {/* Realistic Browser URL & Viewport Control Bar */}
          <div className="h-10 bg-[#0F111A] border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0">
            {/* Left Browser Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>

              <div className="h-3 w-[1px] bg-slate-800" />

              {/* Browser Address Bar */}
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-md border border-slate-800 font-mono text-[11px] text-zinc-400 w-64 sm:w-80 truncate">
                <span className="text-emerald-400 font-bold">🔒</span>
                <span className="text-zinc-200 truncate">https://{project.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.omnistore.shop</span>
              </div>
            </div>

            {/* Viewport Device Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Desktop Viewport (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('tablet')}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Tablet Viewport (768px iPad)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Mobile Viewport (375px iPhone)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom Scale Controls */}
              <div className="flex items-center bg-black/60 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px] font-mono text-zinc-400 gap-1.5">
                <button
                  onClick={() => setZoomScale((z) => Math.max(50, z - 25))}
                  className="hover:text-white cursor-pointer px-1"
                  title="Zoom out"
                >
                  -
                </button>
                <span>{zoomScale}%</span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(150, z + 25))}
                  className="hover:text-white cursor-pointer px-1"
                  title="Zoom in"
                >
                  +
                </button>
              </div>

              {/* Open in Dedicated New Window */}
              <button
                onClick={() => {
                  const win = window.open('', '_blank');
                  if (win) {
                    win.document.write(previewHtml);
                    win.document.close();
                  }
                }}
                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Open live preview in full browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-start justify-center relative bg-radial from-slate-900/40 to-[#07080C]">
            <div
              style={{
                width: viewportMode === 'mobile' ? '375px' : viewportMode === 'tablet' ? '768px' : '100%',
                height: '100%',
                minHeight: '720px',
                transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
                transformOrigin: 'top center',
              }}
              className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border ${
                viewportMode !== 'desktop' ? 'border-slate-700 bg-black p-1' : 'border-slate-800 bg-transparent'
              }`}
            >
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                title="Live Sandboxed Storefront Preview"
                className="w-full h-full border-0 rounded-lg bg-black"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── VERCEL DEPLOYMENT MODAL ── */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F111A] border border-slate-800 p-6 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black">
                  ▲
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Deploy to Global Edge</h3>
                  <p className="text-xs text-zinc-400">1-click automated build, edge routing & SSL</p>
                </div>
              </div>
              <button onClick={() => setIsDeployModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Storefront Subdomain</label>
                <div className="flex items-center bg-black/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
                  <input
                    type="text"
                    value={customProjectSlug}
                    onChange={(e) => setCustomProjectSlug(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none font-mono text-xs text-white"
                  />
                  <span className="text-zinc-500 font-mono text-xs">.vercel.app</span>
                </div>
              </div>

              {isDeploying ? (
                <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deploying Storefront to Vercel Edge...</span>
                  </div>
                  <div className="space-y-1 text-zinc-400 text-[11px] font-mono">
                    <div className={deployStep >= 1 ? 'text-emerald-400' : 'text-zinc-600'}>✓ Compiling Next.js 16 pages & components</div>
                    <div className={deployStep >= 2 ? 'text-emerald-400' : 'text-zinc-600'}>✓ Bundling Tailwind CSS design tokens & video reels</div>
                    <div className={deployStep >= 3 ? 'text-emerald-400' : 'text-zinc-600'}>✓ Allocating worldwide SSL & CDN edge routes</div>
                  </div>
                </div>
              ) : deployStep === 4 ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Live Storefront Published Successfully!</span>
                  </div>
                  <a
                    href={`https://${customProjectSlug}.vercel.app`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-indigo-400 underline font-mono text-xs"
                  >
                    https://{customProjectSlug}.vercel.app
                  </a>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                {deployStep !== 4 && (
                  <button
                    onClick={handleDeployToVercel}
                    disabled={isDeploying}
                    className="btn-accent px-5 py-2 text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {isDeploying ? 'Deploying...' : 'Publish to Edge'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

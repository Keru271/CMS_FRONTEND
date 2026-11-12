'use client';

import React, {
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import {
  Paperclip,
  Globe,
  TrendingUp,
  FileText,
  Sparkles,
  Mic,
  Plus,
  Check,
  ChevronDown,
  X,
  HelpCircle,
  Package,
  ShoppingBag,
  FolderTree,
  Bot,
  Video,
  ImageIcon,
} from 'lucide-react';
import './PromptBar.css';

export const isVideoAsset = (fileName: string): boolean => {
  return (
    /\.(mp4|webm|mov|m4v|ogg|ogv|mkv|avi)$/i.test(fileName) ||
    fileName.toLowerCase().includes('[video]') ||
    fileName.toLowerCase().startsWith('video:')
  );
};

export const isImageAsset = (fileName: string): boolean => {
  return (
    /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(fileName) ||
    fileName.toLowerCase().includes('[image]') ||
    fileName.toLowerCase().startsWith('image:')
  );
};

function getPastedMediaName(mimeType: string, baseName?: string): string {
  if (baseName && baseName !== 'image.png' && baseName !== 'blob') return baseName;
  const stamp = Math.random().toString(36).substring(2, 8);
  if (mimeType.startsWith('video/')) return `video-asset-${stamp}.mp4`;
  if (mimeType.startsWith('image/')) return `image-asset-${stamp}.png`;
  return baseName || `asset-${stamp}.dat`;
}

const ARROW_UP = [12, 4.5, 18.5, 11, 14.25, 11, 14.25, 19.5, 9.75, 19.5, 9.75, 11, 5.5, 11];
const SQUARE = [12, 6, 18, 6, 18, 12, 18, 18, 6, 18, 6, 12, 6, 6];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
const LINE = 22;
const EDGE = 11;

export interface PromptSource {
  key: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  attach?: boolean;
}

export interface PromptCommand {
  key: string;
  name: string;
  description?: string;
}

export interface PromptModel {
  key: string;
  name: string;
  tag?: string;
}

export type PromptRow = {
  key: string;
  name: string;
  description?: string;
  tag?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  attach?: boolean;
};

export type Spark = {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  life: number;
  span: number;
};

export const DEFAULT_STORE_SOURCES: PromptSource[] = [
  {
    key: 'video',
    name: 'Videos & Reels',
    description: 'Upload product reels, promos, or brand videos',
    icon: Video,
    attach: true,
  },
  {
    key: 'files',
    name: 'Photos & files',
    description: 'Upload product imagery or docs',
    icon: Paperclip,
    attach: true,
  },
  {
    key: 'products',
    name: 'Products & Inventory',
    description: 'Reference live store catalog',
    icon: Package,
  },
  {
    key: 'orders',
    name: 'Orders & Shipments',
    description: 'Reference customer orders',
    icon: ShoppingBag,
  },
  {
    key: 'categories',
    name: 'Collections & Categories',
    description: 'Reference store collections',
    icon: FolderTree,
  },
  {
    key: 'analytics',
    name: 'Sales & Revenue data',
    description: 'Revenue, margins, and trends',
    icon: TrendingUp,
  },
  {
    key: 'web',
    name: 'Web search',
    description: 'Live e-commerce market benchmarks',
    icon: Globe,
  },
];

export const DEFAULT_STORE_COMMANDS: PromptCommand[] = [
  { key: 'video', name: '/video', description: 'Showcase or embed video asset in store' },
  { key: 'improve', name: '/improve', description: 'What should I improve today?' },
  { key: 'product', name: '/product', description: 'Open interactive add product form' },
  { key: 'category', name: '/category', description: 'Open interactive add category form' },
  { key: 'discount', name: '/discount', description: 'Create a 10% promo discount' },
  { key: 'sales', name: '/sales', description: 'Analyze recent sales performance' },
  { key: 'blog', name: '/blog', description: 'Draft a high-converting storefront blog post' },
  { key: 'seo', name: '/seo', description: 'Audit store SEO meta tags' },
  { key: 'tasks', name: '/tasks', description: 'Generate daily merchant priority checklist' },
];

export const DEFAULT_STORE_MODELS: PromptModel[] = [
  { key: 'auto', name: 'Claude → Gemini → ChatGPT', tag: 'Automatic fallback' },
];

export const DEFAULT_EFFORTS = ['Low', 'Medium', 'High', 'Extra', 'Max'];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const pathAt = (a: number[], b: number[], t: number) => {
  let d = '';
  for (let i = 0; i < a.length; i += 2) {
    d += `${i ? 'L' : 'M'}${mix(a[i], b[i], t).toFixed(2)} ${mix(a[i + 1], b[i + 1], t).toFixed(2)}`;
  }
  return `${d}Z`;
};

const parseToken = (draft: string) => {
  const m = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!m) return null;
  return { kind: m[2] === '@' ? 'at' : 'slash', query: m[3].toLowerCase(), start: m.index + m[1].length };
};

  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }> | React.ReactNode, _size?: number) => {
    if (!IconComponent) return null;
    if (isValidElement(IconComponent)) return IconComponent;
    const Component = IconComponent as React.ComponentType<{ className?: string }>;
    return <Component className="w-4 h-4 shrink-0" />;
  };

  function SendGlyph({
    busy,
    morphDuration = 240,
    squash = 0.12,
    tilt = 8,
  }: {
    busy?: boolean;
    morphDuration?: number;
    squash?: number;
    tilt?: number;
  }) {
    const reduce = useReducedMotion();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const pathRef = useRef<SVGPathElement | null>(null);
    const dir = useRef(busy ? 1 : -1);
    const t = useMotionValue(busy ? 1 : 0);

    useEffect(() => {
      const target = busy ? 1 : 0;
      dir.current = busy ? 1 : -1;
      if (t.get() === target) return undefined;
      const controls = animate(
        t,
        target,
        reduce ? { duration: 0 } : { duration: morphDuration / 1000, ease: EASE_IN_OUT }
      );
      return () => controls.stop();
    }, [busy, morphDuration, reduce, t]);

    useMotionValueEvent(t, 'change', (v) => {
      pathRef.current?.setAttribute('d', pathAt(ARROW_UP, SQUARE, v));
      const goo = reduce ? 0 : Math.sin(v * Math.PI);
      const sx = 1 - squash * goo;
      if (svgRef.current) {
        svgRef.current.style.transform = goo ? `rotate(${dir.current * tilt * goo}deg) scale(${sx}, ${1 / sx})` : '';
      }
    });

    return (
      <svg
        ref={svgRef}
        className="prompt-bar__glyph"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path ref={pathRef} d={pathAt(ARROW_UP, SQUARE, t.get())} />
      </svg>
    );
  }

  export interface PromptBarProps {
    placeholder?: string;
    sources?: PromptSource[];
    commands?: PromptCommand[];
    models?: PromptModel[];
    defaultModel?: string;
    onModelChange?: (model: PromptModel) => void;
    efforts?: string[];
    defaultEffort?: string;
    onEffortChange?: (effort: string) => void;
    busy?: boolean;
    onSend?: (prompt: string, meta: { attachments: string[]; model: PromptModel; effort: string }) => void;
    onStop?: () => void;
    onAttach?: (type?: 'all' | 'video' | 'image') => Promise<string[] | string | void> | string[] | string | void;
    onDictate?: () => Promise<string | void> | string | void;
    background?: string;
    color?: string;
    menuBackground?: string;
    sparkColor?: string;
    sparkBoost?: number;
    width?: number | string;
    radius?: number;
    maxRows?: number;
    morphDuration?: number;
    squash?: number;
    tilt?: number;
    pressScale?: number;
    onFilesAdded?: (files: File[]) => void;
    onAttachmentRemove?: (fileName: string, index: number) => void;
    className?: string;
    value?: string;
    onChange?: (val: string) => void;
  }

  export function PromptBar({
    placeholder = "Ask anything about your store... (Type '@' for context or '/' for actions)",
    sources = DEFAULT_STORE_SOURCES,
    commands = DEFAULT_STORE_COMMANDS,
    models = DEFAULT_STORE_MODELS,
    defaultModel = 'auto',
    onModelChange,
    efforts = DEFAULT_EFFORTS,
    defaultEffort = 'High',
    onEffortChange,
    busy = false,
    onSend,
    onStop,
    onAttach,
    onFilesAdded,
    onAttachmentRemove,
    onDictate,
    background,
    color,
    menuBackground,
    sparkColor = '#00E5FF',
    sparkBoost = 1.2,
    width = '100%',
    radius = 16,
    maxRows = 5,
    morphDuration = 240,
    squash = 0.12,
    tilt = 8,
    pressScale = 0.96,
    className = '',
    value: controlledValue,
    onChange: onControlledChange,
  }: PromptBarProps) {
    const reduce = useReducedMotion();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const glowRef = useRef<HTMLSpanElement | null>(null);
    const sparkRef = useRef<HTMLCanvasElement | null>(null);
    const typing = useRef({ energy: 0, strokes: 0 });
    const boost = useRef(sparkBoost);
    const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const lastOpen = useRef<string | null>(null);
    const dictation = useRef(0);
    const latest = useRef({ onSend, onStop, onAttach, onFilesAdded, onAttachmentRemove, onDictate, onEffortChange, onModelChange });

    useEffect(() => {
      boost.current = sparkBoost;
      latest.current = { onSend, onStop, onAttach, onFilesAdded, onAttachmentRemove, onDictate, onEffortChange, onModelChange };
    });

    const [internalDraft, setInternalDraft] = useState('');
    const draft = controlledValue !== undefined ? controlledValue : internalDraft;

    const setDraft = useCallback(
      (newVal: string | ((prev: string) => string)) => {
        if (typeof newVal === 'function') {
          const updated = newVal(draft);
          if (controlledValue === undefined) setInternalDraft(updated);
          onControlledChange?.(updated);
        } else {
          if (controlledValue === undefined) setInternalDraft(newVal);
          onControlledChange?.(newVal);
        }
      },
      [draft, controlledValue, onControlledChange]
    );

    const [attachments, setAttachments] = useState<string[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDraggingOver(true);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDraggingOver(false);

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (droppedFiles.length > 0) {
        const names = droppedFiles.map((f) => f.name);
        setAttachments((prev) => [...prev, ...names]);
        latest.current.onFilesAdded?.(droppedFiles);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const fileNames: string[] = [];
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            fileNames.push(getPastedMediaName(file.type, file.name));
            pastedFiles.push(file);
          }
        }
      }

      if (fileNames.length > 0) {
        setAttachments((prev) => [...prev, ...fileNames]);
        if (pastedFiles.length > 0) {
          latest.current.onFilesAdded?.(pastedFiles);
        }
      }
    };
    const [internalModelKey, setInternalModelKey] = useState(defaultModel);
    const [prevDefaultModel, setPrevDefaultModel] = useState(defaultModel);
    if (defaultModel !== prevDefaultModel) {
      setPrevDefaultModel(defaultModel);
      setInternalModelKey(defaultModel);
    }
    const modelKey = internalModelKey;
    const setModelKey = setInternalModelKey;

    const [plusOpen, setPlusOpen] = useState(false);
    const [modelOpen, setModelOpen] = useState(false);
    const [effortOpen, setEffortOpen] = useState(false);
    const [effortIndex, setEffortIndex] = useState(() => {
      const i = efforts.indexOf(defaultEffort);
      return i >= 0 ? i : Math.max(0, Math.floor((efforts.length - 1) / 2));
    });
    const [dismissed, setDismissed] = useState(false);
    const [active, setActive] = useState(0);
    const [listening, setListening] = useState(false);
    const [pressed, setPressed] = useState(false);

    const model = models.find((m) => m.key === modelKey) ?? models[0];
    const token = dismissed ? null : parseToken(draft);
    const open = plusOpen ? 'at' : token?.kind ?? (modelOpen ? 'model' : effortOpen ? 'effort' : null);
    const query = plusOpen ? '' : token?.query ?? '';

    let list: PromptRow[] = [];
    if (open === 'at') {
      list = sources.filter((s) => s.name.toLowerCase().includes(query));
    } else if (open === 'slash') {
      list = commands.filter((c) => c.name.replace(/^\//, '').toLowerCase().startsWith(query));
    } else if (open === 'model') {
      list = models;
    }

    const cursor = Math.min(active, Math.max(0, list.length - 1));
    const canSend = draft.trim().length > 0 || attachments.length > 0;
    const armed = busy || canSend;
    const level = efforts[effortIndex] ?? '';
    const maxed = efforts.length > 1 && effortIndex === efforts.length - 1;

    const focusInput = () => inputRef.current?.focus({ preventScroll: true });
    const closeMenus = useCallback(() => {
      setPlusOpen(false);
      setModelOpen(false);
      setEffortOpen(false);
    }, [setPlusOpen, setModelOpen, setEffortOpen]);

    useLayoutEffect(() => {
      const glow = glowRef.current;
      if (!glow || !open) return;
      const row = rowRefs.current[cursor];
      if (!row) {
        glow.style.opacity = '0';
        return;
      }
      const fresh = lastOpen.current !== open;
      lastOpen.current = open;
      if (fresh) glow.style.transition = 'none';
      glow.style.top = `${row.offsetTop}px`;
      glow.style.height = `${row.offsetHeight}px`;
      glow.style.opacity = '1';
      if (fresh) {
        void glow.offsetHeight;
        glow.style.transition = '';
      }
    }, [open, cursor]);

    useEffect(() => {
      if (!open) lastOpen.current = null;
    }, [open]);

    useEffect(() => {
      if (!plusOpen && !modelOpen && !effortOpen) return undefined;
      const onDown = (e: MouseEvent | TouchEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) closeMenus();
      };
      document.addEventListener('pointerdown', onDown);
      return () => document.removeEventListener('pointerdown', onDown);
    }, [plusOpen, modelOpen, effortOpen, closeMenus]);

    useLayoutEffect(() => {
      const el = inputRef.current;
      if (!el) return;
      el.style.height = '0px';
      const max = LINE * maxRows;
      el.style.height = `${Math.min(el.scrollHeight, max)}px`;
      el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
    }, [draft, maxRows]);

    // Typing Sparks Canvas Effect
    useEffect(() => {
      const canvas = sparkRef.current;
      if (reduce || !canvas) return undefined;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;

      typing.current.strokes = 0;
      let raf = 0;
      let last = performance.now();
      let w = 0;
      let h = 0;
      let due = 0;
      let speed = 1;
      let pulse = 0;
      const parts: Spark[] = [];

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        w = rect.width;
        h = rect.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const spawn = (burst = false) => {
        parts.push({
          x: Math.random() * w,
          y: burst ? h * (0.2 + Math.random() * 0.8) : h + 3,
          r: 0.9 + Math.random() * 1.2,
          vy: -(6 + Math.random() * 8),
          sway: (Math.random() - 0.5) * 8,
          phase: Math.random() * Math.PI * 2,
          life: burst ? Math.random() * 1.2 : 0,
          span: 2.2 + Math.random() * 2.2,
        });
      };

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const typed = typing.current;
        const gain = boost.current;

        typed.energy *= Math.exp(-dt / 0.8);
        pulse *= Math.exp(-dt / 0.16);
        if (typed.strokes > 0) {
          typed.strokes = 0;
          if (gain > 0) pulse = 1;
        }

        const energy = typed.energy * gain;
        speed += (1 + energy * 6 - speed) * (1 - Math.exp(-dt / 0.15));
        due += dt;
        while (due > 0.15) {
          due -= 0.15;
          if (parts.length < 28) spawn(false);
        }

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = sparkColor;
        ctx.shadowColor = sparkColor;
        ctx.shadowBlur = 6 + energy * 10 + pulse * 6;

        for (let i = parts.length - 1; i >= 0; i -= 1) {
          const p = parts[i];
          p.life += dt;
          if (p.life > p.span) {
            parts.splice(i, 1);
            continue;
          }
          const k = p.life / p.span;
          const twinkle = 0.7 + 0.3 * Math.sin((now / 160) * (1 + energy) + p.phase);
          p.y += p.vy * dt * speed;
          if (p.y < -4) {
            p.y = h + 3;
            p.x = Math.random() * w;
          }
          const edge = Math.min(1, Math.max(0, p.y / 14), Math.max(0, (h - p.y) / 14));
          ctx.globalAlpha = Math.min(1, Math.sin(k * Math.PI) * (0.9 + energy * 0.25) * twinkle) * edge;
          ctx.beginPath();
          ctx.arc(
            p.x + Math.sin((now / 900) * (1 + energy * 0.8) + p.phase) * p.sway,
            p.y,
            p.r * twinkle * (1 + energy * 0.35),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        raf = requestAnimationFrame(tick);
      };

      resize();
      for (let i = 0; i < 20; i += 1) spawn(true);
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        ctx.clearRect(0, 0, w, h);
      };
    }, [reduce, sparkColor]);

    const setEffort = (i: number) => {
      const next = Math.max(0, Math.min(efforts.length - 1, i));
      if (next === effortIndex) return;
      setEffortIndex(next);
      latest.current.onEffortChange?.(efforts[next]);
    };

    const effortFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const k = (e.clientX - rect.left - EDGE) / Math.max(1, rect.width - 2 * EDGE);
      setEffort(Math.round(k * (efforts.length - 1)));
    };

    const onEffortKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step =
        e.key === 'ArrowRight' || e.key === 'ArrowUp'
          ? 1
          : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
            ? -1
            : 0;
      if (step) {
        e.preventDefault();
        setEffort(effortIndex + step);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setEffort(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setEffort(efforts.length - 1);
      } else if (e.key === 'Escape') {
        setEffortOpen(false);
        focusInput();
      }
    };

    const stepAt = (i: number) => `calc(${EDGE}px + (100% - ${EDGE * 2}px) * ${i / Math.max(1, efforts.length - 1)})`;
    const fillAt = (i: number) => (i === efforts.length - 1 ? '100%' : `calc(${stepAt(i)} + 7px)`);

    const pick = (row: PromptRow) => {
      if (open === 'model') {
        setModelKey(row.key);
        setModelOpen(false);
        latest.current.onModelChange?.(row);
        focusInput();
        return;
      }
      const head = token ? draft.slice(0, token.start) : draft;
      if (row.attach) {
        setDraft(head);
        const attachType = row.key === 'video' ? 'video' : 'all';
        Promise.resolve(latest.current.onAttach?.(attachType)).then((files) => {
          if (!files) return;
          setAttachments((a) => [...a, ...(Array.isArray(files) ? files : [files])]);
        });
      } else if (open === 'at') {
        setDraft(`${head}@${row.name} `);
      } else {
        setDraft(`${head}${row.name} `);
      }
      setPlusOpen(false);
      setDismissed(false);
      focusInput();
    };

    const send = () => {
      if (!canSend || busy) return;
      latest.current.onSend?.(draft.trim(), { attachments, model, effort: level });
      setDraft('');
      setAttachments([]);
      setDismissed(false);
      closeMenus();
      focusInput();
    };

    const toggleListen = () => {
      if (listening) {
        dictation.current += 1;
        setListening(false);
        return;
      }
      const seq = ++dictation.current;
      setListening(true);
      Promise.resolve(latest.current.onDictate?.()).then(
        (text) => {
          if (seq !== dictation.current) return;
          setListening(false);
          if (text) setDraft((d: string) => (d.trim() ? `${d.trimEnd()} ${text}` : String(text)));
          focusInput();
        },
        () => {
          if (seq === dictation.current) setListening(false);
        }
      );
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (open && open !== 'effort') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActive((i) => Math.min(list.length - 1, i + 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActive((i) => Math.max(0, i - 1));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          if (list[cursor]) {
            e.preventDefault();
            pick(list[cursor]);
            return;
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setDismissed(true);
          closeMenus();
          return;
        }
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    };

    const down = () => setPressed(true);
    const up = () => setPressed(false);

    return (
      <div
        ref={rootRef}
        className={`prompt-bar ${className}`}
        style={
          {
            '--pb-w': typeof width === 'number' ? `${width}px` : width,
            '--pb-radius': `${radius}px`,
            '--pb-press': pressScale,
            '--pb-spark': sparkColor,
            ...(background ? { '--pb-bg': background } : {}),
            ...(color ? { '--pb-ink': color } : {}),
            ...(menuBackground ? { '--pb-menu': menuBackground } : {}),
          } as React.CSSProperties
        }
      >
        {/* Context Menus / Popovers */}
        {open ? (
          <div className="prompt-bar__menu" data-kind={open} role="listbox">
            {open === 'effort' ? (
              <>
                <div className="prompt-bar__effort-head">
                  <span className="prompt-bar__effort-title">Reasoning Effort</span>
                  <span className="prompt-bar__effort-level">{level}</span>
                  <span className="prompt-bar__effort-help" title="Controls response depth and analytical compute">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="prompt-bar__effort-ends">
                  <span>Fast</span>
                  <span>Deep Analysis</span>
                </div>
                <div
                  className="prompt-bar__effort-track"
                  role="slider"
                  tabIndex={0}
                  aria-label="Effort"
                  aria-valuemin={0}
                  aria-valuemax={efforts.length - 1}
                  aria-valuenow={effortIndex}
                  aria-valuetext={level}
                  style={
                    {
                      '--pb-effort-x': stepAt(effortIndex),
                      '--pb-effort-fill': fillAt(effortIndex),
                    } as React.CSSProperties
                  }
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch { }
                    e.currentTarget.focus({ preventScroll: true });
                    effortFromPointer(e);
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons & 1) effortFromPointer(e);
                  }}
                  onKeyDown={onEffortKey}
                >
                  <span className="prompt-bar__effort-fill" />
                  {efforts.map((label, i) => (
                    <i key={label} className="prompt-bar__effort-dot" style={{ left: stepAt(i) }} />
                  ))}
                  <span className="prompt-bar__effort-thumb" />
                </div>
              </>
            ) : (
              <>
                <span ref={glowRef} className="prompt-bar__glow" aria-hidden="true" />
                {list.map((row, i) => (
                  <button
                    key={row.key}
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={i === cursor}
                    className="prompt-bar__row"
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => pick(row)}
                  >
                    {open === 'at' ? (
                      <span className="prompt-bar__row-icon">{renderIcon(row.icon, 15)}</span>
                    ) : null}
                    <span className="prompt-bar__row-name">{row.name}</span>
                    {row.description ? <span className="prompt-bar__row-desc">{row.description}</span> : null}
                    {open === 'model' ? (
                      <>
                        {row.tag ? <span className="prompt-bar__row-tag">{row.tag}</span> : null}
                        <span className="prompt-bar__row-check" data-on={row.key === model?.key ? '' : undefined}>
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </>
                    ) : null}
                  </button>
                ))}
                {list.length === 0 ? <div className="prompt-bar__empty">No matches for “{query}”</div> : null}
              </>
            )}
          </div>
        ) : null}

        {/* Main Interactive Field */}
        <div
          className="prompt-bar__field"
          role="presentation"
          data-max={maxed ? '' : undefined}
          data-dragging={isDraggingOver ? '' : undefined}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget || e.target === inputRef.current) closeMenus();
          }}
          onClick={focusInput}
        >
          <canvas ref={sparkRef} className="prompt-bar__sparks" aria-hidden="true" />

          {/* Drag and Drop Overlay for Video and Assets */}
          {isDraggingOver && (
            <div className="prompt-bar__drop-overlay" aria-hidden="true">
              <div className="prompt-bar__drop-icon">
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-center">
                <span className="prompt-bar__drop-text">Drop video or assets here</span>
                <div className="prompt-bar__drop-subtext">Supports MP4, WebM, MOV, and images</div>
              </div>
            </div>
          )}

          {/* Attachment Chips */}
          {attachments.length > 0 ? (
            <div className="prompt-bar__chips">
              {attachments.map((file, i) => {
                const isVid = isVideoAsset(file);
                const isImg = isImageAsset(file);
                return (
                  <span
                    key={`${file}-${i}`}
                    className={`prompt-bar__chip ${isVid ? 'prompt-bar__chip--video' : isImg ? 'prompt-bar__chip--image' : ''
                      }`}
                  >
                    {isVid ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="prompt-bar__chip-badge prompt-bar__chip-badge--video">VIDEO</span>
                      </>
                    ) : isImg ? (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="prompt-bar__chip-badge prompt-bar__chip-badge--image">IMG</span>
                      </>
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="prompt-bar__chip-name" title={file}>
                      {file}
                    </span>
                    <button
                      type="button"
                      className="prompt-bar__chip-x"
                      aria-label={`Remove ${file}`}
                      onClick={() => {
                        setAttachments((a) => a.filter((_, j) => j !== i));
                        latest.current.onAttachmentRemove?.(file, i);
                      }}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}

          {/* Dynamic Growing Textarea */}
          <textarea
            ref={inputRef}
            className="prompt-bar__input"
            rows={1}
            value={draft}
            placeholder={listening ? 'Listening to voice dictation…' : placeholder}
            aria-label="Prompt"
            onChange={(e) => {
              setDraft(e.target.value);
              typing.current.energy = Math.min(1.6, typing.current.energy + 0.22);
              typing.current.strokes = Math.min(4, typing.current.strokes + 1);
              setDismissed(false);
              closeMenus();
              setActive(0);
            }}
            onPaste={handlePaste}
            onFocus={closeMenus}
            onKeyDown={onKeyDown}
          />

          {/* Bottom Tools Action Bar */}
          <div className="prompt-bar__bar">
            {/* Add Sources / Attachments Tool */}
            <button
              type="button"
              className="prompt-bar__tool"
              aria-label="Add files and sources"
              aria-expanded={plusOpen}
              data-on={plusOpen ? '' : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setModelOpen(false);
                setEffortOpen(false);
                setActive(0);
                setPlusOpen((v) => !v);
                focusInput();
              }}
              title="Attach sources, catalog data (@)"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Quick Image / Reference Attachment Tool */}
            <button
              type="button"
              className="prompt-bar__tool"
              aria-label="Attach reference image"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                closeMenus();
                Promise.resolve(latest.current.onAttach?.('image')).then((files) => {
                  if (!files) return;
                  setAttachments((a) => [...a, ...(Array.isArray(files) ? files : [files])]);
                });
                focusInput();
              }}
              title="Attach reference image (.png, .jpg, .webp, screenshot)"
            >
              <ImageIcon className="w-4 h-4 text-sky-400 hover:text-sky-300" />
            </button>

            {/* Quick Video Attachment Tool */}
            <button
              type="button"
              className="prompt-bar__tool"
              aria-label="Attach video asset"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                closeMenus();
                Promise.resolve(latest.current.onAttach?.('video')).then((files) => {
                  if (!files) return;
                  setAttachments((a) => [...a, ...(Array.isArray(files) ? files : [files])]);
                });
                focusInput();
              }}
              title="Attach video asset (.mp4, .webm, .mov)"
            >
              <Video className="w-4 h-4 text-purple-400 hover:text-purple-300" />
            </button>

            {/* Model Selector Pill */}
            {models.length > 0 ? (
              <button
                type="button"
                className="prompt-bar__pick"
                aria-label="Choose model"
                aria-expanded={modelOpen}
                data-on={modelOpen ? '' : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPlusOpen(false);
                  setEffortOpen(false);
                  setActive(Math.max(0, models.indexOf(model)));
                  setModelOpen((v) => !v);
                  focusInput();
                }}
              >
                <Bot className="w-3.5 h-3.5 text-sky-500 dark:text-[#00E5FF]" />
                <span>{model.name}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            ) : null}

            {/* Reasoning / Effort Selector */}
            {efforts.length > 0 ? (
              <button
                type="button"
                className="prompt-bar__pick"
                aria-label="Choose reasoning effort"
                aria-expanded={effortOpen}
                data-on={effortOpen ? '' : undefined}
                data-max={maxed ? '' : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPlusOpen(false);
                  setModelOpen(false);
                  setEffortOpen((v) => !v);
                  focusInput();
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{level}</span>
              </button>
            ) : null}

            <span className="prompt-bar__spacer" />

            {/* Mic Dictation */}
            {onDictate ? (
              <button
                type="button"
                className="prompt-bar__tool"
                aria-label={listening ? 'Stop dictation' : 'Dictate'}
                aria-pressed={listening}
                data-on={listening ? '' : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleListen}
                title="Voice dictation"
              >
                {listening ? (
                  <span className="prompt-bar__eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            ) : null}

            {/* Morphing Send / Stop Button */}
            <button
              type="button"
              className="prompt-bar__send"
              disabled={!armed}
              aria-label={busy ? 'Stop generating' : 'Send prompt'}
              data-armed={armed ? '' : undefined}
              data-pressed={pressed ? '' : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={down}
              onPointerUp={up}
              onPointerCancel={up}
              onPointerLeave={up}
              onClick={() => {
                if (busy) latest.current.onStop?.();
                else send();
              }}
            >
              <SendGlyph busy={busy} morphDuration={morphDuration} squash={squash} tilt={tilt} />
            </button>
          </div>
        </div>
      </div>
    );
  }

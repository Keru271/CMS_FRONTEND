'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import {
  aiAssistantService,
  ChatMessage,
  ChatAction,
  StoreContextData,
} from '@/src/services/aiAssistantService';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  ArrowUpRight,
  Plus,
  Copy,
  Check,
  Package,
  ShoppingBag,
  TrendingUp,
  Zap,
  Volume2,
  VolumeX,
  Layers,
  BarChart3,
  Flame,
  ShieldCheck,
  Percent,
  User,
} from 'lucide-react';

let _inMemoryChatHistory: ChatMessage[] = [];

export const CMSChatbot: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { products, orders, categories, stats, merchantData, openAddProductModal } =
    useCMSContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [creditsInfo, setCreditsInfo] = useState<{ remaining: number; total: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      cmsService
        .getAiCredits()
        .then((data) => setCreditsInfo({ remaining: data.aiCredits, total: data.aiCreditsTotal }))
        .catch(() => {});
    }
  }, [isOpen]);

  // Initialize messages from in-memory history or default greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (_inMemoryChatHistory.length > 0) {
      return _inMemoryChatHistory;
    }
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        content: `👋 **Welcome to your AI Store Assistant!**\n\nI have live visibility into your catalog (**${products?.length || 0} items**) and orders (**${orders?.length || 0} orders**).\n\nI can autonomously analyze your store and execute actions with secure platform tools.\n\n### 💡 What would you like to do today?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        actions: [
          {
            id: 'a1',
            label: '✨ What should I improve today?',
            type: 'PREFILL_PROMPT',
            payload: 'What should I improve today?',
          },
          {
            id: 'a2',
            label: '🏖️ Create Summer Collection',
            type: 'PREFILL_PROMPT',
            payload: 'Create a summer collection with my top-selling products.',
          },
          {
            id: 'a3',
            label: '📉 Why did sales decrease?',
            type: 'PREFILL_PROMPT',
            payload: 'Why did my sales decrease this month?',
          },
          {
            id: 'a4',
            label: '🏆 Show Best-Selling Products',
            type: 'PREFILL_PROMPT',
            payload: 'Show me my best-selling products.',
          },
          {
            id: 'a5',
            label: '👟 10% Off Shoes Discount',
            type: 'PREFILL_PROMPT',
            payload: 'Create a 10% discount for products in Shoes.',
          },
        ],
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open modal with smooth animation
  const handleOpen = useCallback(() => {
    setIsRendered(true);
    // Allow DOM mount before applying active animation classes
    setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 20);
  }, []);

  // Close modal with smooth reverse animation
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsRendered(false);
      setIsOpen(false);
    }, 260); // match duration-250 transition
  }, []);

  // Sync open state triggers
  useEffect(() => {
    if (isOpen && !isRendered) {
      handleOpen();
    } else if (!isOpen && isRendered) {
      handleClose();
    }
  }, [isOpen, isRendered, handleOpen, handleClose]);

  // Save chat history to in-memory history
  useEffect(() => {
    if (messages.length > 0) {
      _inMemoryChatHistory = messages.slice(-30);
    }
  }, [messages]);

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isRendered) {
      scrollToBottom();
    }
  }, [messages, isRendered, isTyping]);

  // Keyboard shortcut (Ctrl+J or Cmd+J) and Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (isRendered) {
          handleClose();
        } else {
          setIsOpen(true);
        }
      } else if (e.key === 'Escape' && isRendered) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, handleClose]);

  // Listen for custom global events to open chatbot with pre-filled prompt
  useEffect(() => {
    const handleOpenCopilot = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };

    window.addEventListener('open-cms-copilot', handleOpenCopilot);
    return () => window.removeEventListener('open-cms-copilot', handleOpenCopilot);
  }, [products, orders, categories, stats, merchantData, pathname]);

  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch {
      // Ignore audio policy restrictions
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const storeContext: StoreContextData = {
      products,
      orders,
      categories,
      stats,
      merchantData,
      currentPath: pathname,
      userRole: merchantData?.merchant?.role || 'OWNER',
    };

    try {
      const response = await aiAssistantService.generateResponse(
        textToSend,
        storeContext,
        messages,
      );
      playChime();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content:
            '⚠️ Apologies, I encountered a temporary issue processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = async (action: ChatAction) => {
    if (action.type === 'NAVIGATE') {
      router.push(action.payload);
      handleClose();
    } else if (action.type === 'OPEN_PRODUCT_MODAL') {
      openAddProductModal();
      handleClose();
    } else if (action.type === 'COPY_TEXT') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload));
        setCopiedId(action.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } else if (action.type === 'PREFILL_PROMPT') {
      handleSendMessage(action.payload);
    } else if (action.type === 'EXECUTE_PROMOTION') {
      try {
        setIsTyping(true);
        const storeId = merchantData?.store?.id;
        const promoRes = await cmsService.createPromotion({
          ...action.payload,
          storeId,
        });

        playChime();
        setMessages((prev) => [
          ...prev,
          {
            id: `promo-success-${Date.now()}`,
            sender: 'assistant',
            content: `🎉 **Promotion Successfully Activated in Database!**\n\n${promoRes.message}\n\n- 🏷️ **Coupon Code:** \`${action.payload.code}\`\n- 📦 **Collection:** \`${action.payload.collectionName}\`\n- 🚀 **Storefront Announcement:** Active\n\nYour customers can now redeem this discount at checkout!`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            actions: [
              {
                id: 'view-discounts',
                label: '🎟️ View Discounts Hub',
                type: 'NAVIGATE',
                payload: '/discounts',
              },
              {
                id: 'view-collections',
                label: '📁 View Categories & Collections',
                type: 'NAVIGATE',
                payload: '/categories',
              },
            ],
          },
        ]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `promo-err-${Date.now()}`,
            sender: 'assistant',
            content: `❌ **Failed to activate promotion:** ${err?.response?.data?.message || err.message}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleClearChat = () => {
    const freshGreeting: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      content: `👋 Chat history cleared. How can I help you manage **${merchantData?.store?.storeName || 'your store'}**?`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      actions: [
        {
          id: 'c1',
          label: '📊 Store Overview',
          type: 'PREFILL_PROMPT',
          payload: 'Give me a store overview',
        },
        {
          id: 'c2',
          label: '⚠️ Low Stock Alert',
          type: 'PREFILL_PROMPT',
          payload: 'Which products are low on stock?',
        },
        {
          id: 'c3',
          label: '➕ New Product',
          type: 'OPEN_PRODUCT_MODAL',
          payload: '',
        },
      ],
    };
    setMessages([freshGreeting]);
    _inMemoryChatHistory = [freshGreeting];
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const contextualSuggestions = aiAssistantService.getContextualSuggestions(pathname);

  // Markdown renderer helper with Code Block and Table support
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const elements: React.ReactNode[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const rows = tableRows.slice(2); // skip header and separator row
        elements.push(
          <div
            key={`table-${key}`}
            className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs"
          >
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3.5 py-2.5">
                      {parseInlineFormatting(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/80 transition-colors">
                    {r.map((c, ci) => (
                      <td key={ci} className="px-3.5 py-2.5 text-slate-600">
                        {parseInlineFormatting(c.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        tableRows = [];
      }
      inTable = false;
    };

    const flushCodeBlock = (key: number) => {
      if (codeBlockLines.length > 0) {
        elements.push(
          <div
            key={`code-${key}`}
            className="my-3 p-3.5 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs border border-slate-800 shadow-inner overflow-x-auto leading-relaxed"
          >
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Platform Tool Execution Trace
            </div>
            <pre className="whitespace-pre-wrap font-mono text-cyan-300">{codeBlockLines.join('\n')}</pre>
          </div>,
        );
        codeBlockLines = [];
      }
      inCodeBlock = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Code blocks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(index);
        } else {
          if (inTable) flushTable(index);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cols = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="text-xs font-bold text-slate-900 mt-3 mb-1 uppercase tracking-wider font-sans flex items-center gap-1.5"
          >
            {parseInlineFormatting(trimmed.slice(4))}
          </h3>,
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-sm font-bold text-slate-900 mt-3.5 mb-1.5 font-sans">
            {parseInlineFormatting(trimmed.slice(3))}
          </h2>,
        );
      } else if (trimmed.startsWith('---')) {
        elements.push(<hr key={index} className="my-3 border-slate-200" />);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Bullet list
        elements.push(
          <div
            key={index}
            className="flex items-start gap-2 my-1 text-xs text-slate-800 pl-1 font-sans"
          >
            <span className="text-cyan-600 font-bold shrink-0 mt-0.5">•</span>
            <div className="flex-1 leading-relaxed">{parseInlineFormatting(trimmed.slice(2))}</div>
          </div>,
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          elements.push(
            <div
              key={index}
              className="flex items-start gap-2 my-1 text-xs text-slate-800 pl-1 font-sans"
            >
              <span className="text-xs font-bold text-slate-500 shrink-0">{numMatch[1]}.</span>
              <div className="flex-1 leading-relaxed">{parseInlineFormatting(numMatch[2])}</div>
            </div>,
          );
        }
      } else if (trimmed === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        // Normal paragraph
        elements.push(
          <p key={index} className="text-xs text-slate-800 leading-relaxed font-sans">
            {parseInlineFormatting(trimmed)}
          </p>,
        );
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }
    if (inCodeBlock) {
      flushCodeBlock(lines.length);
    }

    return elements;
  };

  // Helper for inline bold, italic, and backticks
  const parseInlineFormatting = (text: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-mono text-[11px] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-600">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Calculate quick dashboard stats
  const totalProductsCount = products?.length || 0;
  const totalOrdersCount = orders?.length || 0;
  const lowStockCount =
    products?.filter((p) => typeof p.inventory === 'number' && p.inventory <= 5).length || 0;

  return (
    <>
      {/* Floating Launcher Button in Bottom-Right Corner */}
      {!isRendered && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
          {/* Tooltip on hover */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>AI Store Assistant</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">⌘J</kbd>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-3.5 rounded-full bg-white text-slate-900 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-200 ring-4 ring-slate-100 hover:ring-slate-200 flex items-center justify-center cursor-pointer overflow-hidden group"
            aria-label="Open AI Store Assistant"
          >
            {/* Subtle glow effect */}
            <span className="absolute inset-0 rounded-full bg-cyan-400/15 animate-ping opacity-75" />
            <Bot className="w-6 h-6 relative z-10 text-slate-900 group-hover:text-cyan-600 transition-colors" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-white z-20" />
          </button>
        </div>
      )}

      {/* 90% Width and 90% Height Modal with Blurred Backdrop & Subtle Animations */}
      {isRendered && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-assistant-modal-title"
          onClick={(e) => {
            // Close modal when clicking the blurred backdrop
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 transition-all duration-250 ease-out ${
            isAnimating
              ? 'bg-slate-900/40 backdrop-blur-md opacity-100'
              : 'bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
          }`}
        >
          {/* Main Modal Box: 90% Width x 90% Height */}
          <div
            className={`relative w-[90vw] h-[90vh] max-w-[1600px] max-h-[1000px] bg-white border border-slate-200/90 shadow-2xl rounded-2xl md:rounded-3xl flex flex-col overflow-hidden transition-all duration-250 ease-out transform ${
              isAnimating
                ? 'scale-100 opacity-100 translate-y-0 shadow-2xl'
                : 'scale-95 opacity-0 translate-y-3 shadow-none'
            }`}
          >
            {/* Modal Header Bar */}
            <div className="px-5 py-3.5 bg-white text-slate-900 flex items-center justify-between gap-3 shrink-0 border-b border-slate-200/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-[#00E5FF] shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      id="ai-assistant-modal-title"
                      className="font-sans font-bold text-sm text-slate-900 truncate flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-600" /> AI Store Assistant
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-mono uppercase tracking-wider font-semibold">
                      Tools Active
                    </span>
                    {creditsInfo && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-500" />
                        <span>{creditsInfo.remaining}/{creditsInfo.total} AI Credits</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-sans truncate">
                    {merchantData?.store?.storeName || 'Merchant Store'} · Autonomous Tool Calling & Analytics
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title={soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
                  aria-label="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleClearChat}
                  className="p-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear Chat History"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Close Modal (Esc)"
                  aria-label="Close Assistant Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column Responsive Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar (Desktop / Tablet): Live Store Context & Fast Action Categories */}
              <div className="hidden lg:flex w-72 xl:w-80 flex-col bg-slate-50/70 border-r border-slate-200 p-4 xl:p-5 space-y-4 shrink-0 overflow-y-auto">
                {/* Live Store Stats Overview */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    <span>Live Store Context</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold lowercase text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> sync
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                        <Package className="w-3.5 h-3.5 text-cyan-600" /> Catalog
                      </div>
                      <div className="text-base font-bold text-slate-900">{totalProductsCount} items</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" /> Orders
                      </div>
                      <div className="text-base font-bold text-slate-900">{totalOrdersCount} placed</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Revenue
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" /> Low Stock
                      </div>
                      <div className="text-base font-bold text-slate-900">{lowStockCount} alerts</div>
                    </div>
                  </div>
                </div>

                {/* Capability Categories */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Quick Action Presets
                  </div>

                  <button
                    onClick={() => handleSendMessage('What should I improve today?')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 hover:text-slate-900 transition-all flex items-center gap-2.5 shadow-xs cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:bg-cyan-100">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">Store Audit & Growth</div>
                      <div className="text-[10px] text-slate-500 truncate">Daily insights & fixes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Create a summer collection with my top-selling products.')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 hover:text-slate-900 transition-all flex items-center gap-2.5 shadow-xs cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">Smart Collection</div>
                      <div className="text-[10px] text-slate-500 truncate">Auto-curate from sales data</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Create a 10% discount for products in Shoes.')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 hover:text-slate-900 transition-all flex items-center gap-2.5 shadow-xs cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                      <Percent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">Create 10% Promo</div>
                      <div className="text-[10px] text-slate-500 truncate">Apply discount code instantly</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Why did my sales decrease this month?')}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-800 hover:text-slate-900 transition-all flex items-center gap-2.5 shadow-xs cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">Sales & Conversion Analysis</div>
                      <div className="text-[10px] text-slate-500 truncate">Root cause & bottlenecks</div>
                    </div>
                  </button>
                </div>

                {/* Enabled Platform Tools Badge Strip */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Connected Tools
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'get_store',
                      'get_products',
                      'get_orders',
                      'get_sales_analytics',
                      'create_discount',
                      'create_collection',
                      'update_theme',
                    ].map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-600"
                      >
                        {tool}()
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Main Area: Chat Stream & Message Input */}
              <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Horizontal Quick Prompt Chips Strip */}
                <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/90 overflow-x-auto flex items-center gap-2 shrink-0 scrollbar-none">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-0.5">
                    <Sparkles className="w-3 h-3 text-cyan-600" /> Prompts:
                  </span>
                  {contextualSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-medium font-sans hover:border-slate-400 hover:bg-slate-100/80 hover:shadow-xs shrink-0 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}
                    >
                      <div className="flex items-end gap-2.5 max-w-[92%] sm:max-w-[85%]">
                        {msg.sender === 'assistant' && (
                          <div className="w-7 h-7 rounded-xl bg-slate-900 text-[#00E5FF] flex items-center justify-center shrink-0 mb-1 shadow-xs">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div
                          className={`p-4 sm:p-4.5 rounded-2xl shadow-xs relative ${
                            msg.sender === 'user'
                              ? 'bg-white border border-slate-300 text-slate-900 rounded-br-xs'
                              : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs'
                          }`}
                        >
                          {/* Message content */}
                          <div className="space-y-1 text-slate-900 font-sans">{renderFormattedContent(msg.content)}</div>

                          {/* Interactive Action Buttons */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex flex-wrap gap-2">
                              {msg.actions.map((act) => (
                                <button
                                  key={act.id}
                                  onClick={() => handleActionClick(act)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold font-sans hover:bg-slate-900 hover:text-[#00E5FF] hover:border-slate-900 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                                >
                                  {act.type === 'OPEN_PRODUCT_MODAL' && (
                                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                  {act.type === 'NAVIGATE' && <ArrowUpRight className="w-3.5 h-3.5" />}
                                  {act.type === 'COPY_TEXT' &&
                                    (copiedId === act.id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    ))}
                                  <span>{act.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {msg.sender === 'user' && (
                          <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mb-1 shadow-xs">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Metadata & Copy action */}
                      <div className="flex items-center gap-2.5 mt-1 px-1 text-[11px] text-slate-400 font-sans">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 hover:text-slate-900 transition-all cursor-pointer"
                          title="Copy message text"
                        >
                          {copiedId === msg.id ? (
                            <span className="text-emerald-600 flex items-center gap-0.5 font-medium">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Animated Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-end gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-[#00E5FF] flex items-center justify-center shrink-0 mb-1 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200/90 rounded-bl-xs flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Footer Bar */}
                <div className="p-4 sm:p-5 bg-white border-t border-slate-200/90 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything about your store... (e.g. 'What should I improve today?')"
                        disabled={isTyping}
                        className="w-full pl-4 pr-9 py-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50 shadow-xs"
                      />
                      {inputValue && (
                        <button
                          type="button"
                          onClick={() => setInputValue('')}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className="p-3 rounded-xl bg-slate-900 text-[#00E5FF] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1 font-sans font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> AI Assistant Active • Tool Calling Enabled
                    </span>
                    <span className="hidden sm:inline">Press Enter ↵ to send · Esc to close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

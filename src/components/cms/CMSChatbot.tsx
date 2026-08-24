'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
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
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronDown,
  ArrowUpRight,
  Plus,
  Copy,
  Check,
  Package,
  ShoppingBag,
  TrendingUp,
  Tag,
  Zap,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

const STORAGE_KEY = 'statamic_cms_chatbot_history';

export const CMSChatbot: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    products,
    orders,
    categories,
    stats,
    merchantData,
    openAddProductModal,
    isSuspended,
  } = useCMSContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize messages from localStorage or default greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        content: `👋 **Welcome to your Store Copilot!**\n\nI have live visibility into your catalog (**${products?.length || 0} items**) and orders (**${orders?.length || 0} orders**).\n\nHow can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { id: 'a1', label: '📊 Store Overview', type: 'PREFILL_PROMPT', payload: 'Give me a store overview' },
          { id: 'a2', label: '⚠️ Low Stock Items', type: 'PREFILL_PROMPT', payload: 'Which products are low on stock?' },
          { id: 'a3', label: '📦 Unfulfilled Orders', type: 'PREFILL_PROMPT', payload: 'Show unfulfilled orders' },
          { id: 'a4', label: '➕ New Product', type: 'OPEN_PRODUCT_MODAL', payload: '' },
        ],
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save chat history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
      } catch (e) {
        console.error('Failed to save chat history', e);
      }
    }
  }, [messages]);

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Keyboard shortcut (Ctrl+J or Cmd+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for custom global events to open chatbot with pre-filled prompt
  useEffect(() => {
    const handleOpenCopilot = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      const response = await aiAssistantService.generateResponse(textToSend, storeContext, messages);
      playChime();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          content: '⚠️ Apologies, I encountered a temporary issue processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'NAVIGATE') {
      router.push(action.payload);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    } else if (action.type === 'OPEN_PRODUCT_MODAL') {
      openAddProductModal();
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    } else if (action.type === 'COPY_TEXT') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(action.payload);
        setCopiedId(action.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } else if (action.type === 'PREFILL_PROMPT') {
      handleSendMessage(action.payload);
    }
  };

  const handleClearChat = () => {
    const freshGreeting: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      content: `👋 Chat history cleared. How can I help you manage **${merchantData?.store?.storeName || 'your store'}**?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { id: 'c1', label: '📊 Store Overview', type: 'PREFILL_PROMPT', payload: 'Give me a store overview' },
        { id: 'c2', label: '⚠️ Low Stock Alert', type: 'PREFILL_PROMPT', payload: 'Which products are low on stock?' },
        { id: 'c3', label: '➕ New Product', type: 'OPEN_PRODUCT_MODAL', payload: '' },
      ],
    };
    setMessages([freshGreeting]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const contextualSuggestions = aiAssistantService.getContextualSuggestions(pathname);

  // Markdown renderer helper
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const rows = tableRows.slice(2); // skip header and separator row
        elements.push(
          <div key={`table-${key}`} className="my-2.5 overflow-x-auto rounded-lg border border-[#cbd5e0] bg-[#ffffff]">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#fdf1ef] border-b border-[#cbd5e0] text-[#191a1b] font-bold">
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2">
                      {parseInlineFormatting(h.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbd5e0]/60">
                {rows.map((r, ri) => (
                  <tr key={ri} className="hover:bg-[#fdf1ef]/40 transition-colors">
                    {r.map((c, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-[#5e5a5a]">
                        {parseInlineFormatting(c.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
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
          <h4 key={index} className="text-xs font-bold text-[#191a1b] mt-3 mb-1 font-sans flex items-center gap-1.5">
            {parseInlineFormatting(trimmed.replace('### ', ''))}
          </h4>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={index} className="text-sm font-bold text-[#191a1b] mt-3 mb-1 font-sans">
            {parseInlineFormatting(trimmed.replace('## ', ''))}
          </h3>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Bullet list
        elements.push(
          <div key={index} className="flex items-start gap-1.5 my-1 text-xs text-[#191a1b] pl-1 font-sans">
            <span className="text-[#191a1b] font-bold shrink-0 mt-0.5">•</span>
            <div className="flex-1 leading-relaxed">
              {parseInlineFormatting(trimmed.slice(2))}
            </div>
          </div>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          elements.push(
            <div key={index} className="flex items-start gap-2 my-1 text-xs text-[#191a1b] pl-1 font-sans">
              <span className="text-xs font-bold text-[#5e5a5a] shrink-0">{numMatch[1]}.</span>
              <div className="flex-1 leading-relaxed">
                {parseInlineFormatting(numMatch[2])}
              </div>
            </div>
          );
        }
      } else if (trimmed === '') {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        // Normal paragraph
        elements.push(
          <p key={index} className="text-xs text-[#191a1b] leading-relaxed font-sans">
            {parseInlineFormatting(trimmed)}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  // Helper for inline bold, italic, and backticks
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Process code tags `...`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-[#191a1b]/10 text-[#191a1b] font-mono text-[11px] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#191a1b]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-[#5e5a5a]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
          {/* Tooltip on hover */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191a1b] text-[#ffffff] text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#d4ff4c]" />
            <span>Ask Store Copilot</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#ffffff]/20 text-[10px] font-mono">⌘J</kbd>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative p-3.5 rounded-full bg-[#191a1b] text-[#d4ff4c] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-[#cbc2ea]/40 hover:ring-[#cbc2ea]/70 flex items-center justify-center cursor-pointer overflow-hidden"
            aria-label="Open CMS AI Copilot"
          >
            {/* Ambient pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[#d4ff4c]/20 animate-ping opacity-75" />
            <Bot className="w-6 h-6 relative z-10" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#191a1b] z-20" />
          </button>
        </div>
      )}

      {/* Floating or Docked Chatbot Container */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#ffffff] border border-[#cbd5e0] shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10 rounded-2xl'
              : isMinimized
              ? 'bottom-6 right-6 w-80 sm:w-96 rounded-2xl h-14'
              : 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] md:w-[450px] h-[580px] max-h-[calc(100vh-80px)] rounded-2xl'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-[#191a1b] text-[#ffffff] flex items-center justify-between gap-2 shrink-0 border-b border-[#3f3f46]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full bg-[#3f3f46] flex items-center justify-center text-[#d4ff4c] shrink-0">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-[#191a1b]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-xs text-[#ffffff] truncate">Statamic Copilot</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#d4ff4c]/20 text-[#d4ff4c] text-[9px] font-mono uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-[#beb9b3] font-sans truncate">
                  {merchantData?.store?.storeName || 'Store Assistant'} · Live Context
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-[#beb9b3] hover:text-[#ffffff] hover:bg-[#3f3f46] transition-colors"
                title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-[#beb9b3] hover:text-[#ffffff] hover:bg-[#3f3f46] transition-colors"
                title="Clear Conversation"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  if (isExpanded) setIsExpanded(false);
                }}
                className="p-1.5 rounded-lg text-[#beb9b3] hover:text-[#ffffff] hover:bg-[#3f3f46] transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label="Minimize or Restore"
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  setIsMinimized(false);
                }}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-[#beb9b3] hover:text-[#ffffff] hover:bg-[#3f3f46] transition-colors"
                title={isExpanded ? 'Restore Size' : 'Maximize Window'}
                aria-label="Toggle Size"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#beb9b3] hover:text-[#ef4444] hover:bg-[#3f3f46] transition-colors"
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Contextual Suggestion Prompt Chips */}
              <div className="px-3 py-2 bg-[#fdf1ef] border-b border-[#cbd5e0] overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
                <span className="text-[10px] font-bold text-[#5e5a5a] uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
                  <Sparkles className="w-3 h-3 text-[#191a1b]" /> Suggestions:
                </span>
                {contextualSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug)}
                    className="px-2.5 py-1 rounded-full bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] text-[11px] font-sans hover:border-[#cbc2ea] hover:bg-[#ffffff] hover:shadow-xs shrink-0 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-[#ffffff]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[82%]">
                      {msg.sender === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-[#191a1b] text-[#d4ff4c] flex items-center justify-center shrink-0 mb-1 text-xs shadow-xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl shadow-xs relative ${
                          msg.sender === 'user'
                            ? 'bg-[#191a1b] text-[#ffffff] rounded-br-xs'
                            : 'bg-[#fdf1ef] border border-[#cbd5e0] text-[#191a1b] rounded-bl-xs'
                        }`}
                      >
                        {/* Message content */}
                        <div className="space-y-1">{renderFormattedContent(msg.content)}</div>

                        {/* Interactive Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-[#cbd5e0]/60 flex flex-wrap gap-1.5">
                            {msg.actions.map((act) => (
                              <button
                                key={act.id}
                                onClick={() => handleActionClick(act)}
                                className="px-2.5 py-1 rounded-lg bg-[#ffffff] border border-[#cbd5e0] text-[#191a1b] text-[11px] font-medium font-sans hover:border-[#191a1b] hover:bg-[#191a1b] hover:text-[#d4ff4c] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                              >
                                {act.type === 'OPEN_PRODUCT_MODAL' && <Plus className="w-3 h-3 text-[#10b981]" />}
                                {act.type === 'NAVIGATE' && <ArrowUpRight className="w-3 h-3" />}
                                {act.type === 'COPY_TEXT' && (
                                  copiedId === act.id ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />
                                )}
                                <span>{act.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Copy action */}
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#beb9b3] font-sans">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-[#191a1b] transition-all"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-[#10b981] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#191a1b] text-[#d4ff4c] flex items-center justify-center shrink-0 mb-1 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-[#fdf1ef] border border-[#cbd5e0] rounded-bl-xs flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#191a1b] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#191a1b] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#191a1b] animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer Bar */}
              <div className="p-3 bg-[#fdf1ef]/80 backdrop-blur-sm border-t border-[#cbd5e0] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask copilot or type an instruction..."
                      disabled={isTyping}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#ffffff] border border-[#cbd5e0] text-xs font-sans text-[#191a1b] placeholder:text-[#beb9b3] outline-none focus:border-[#cbc2ea] focus:ring-2 focus:ring-[#cbc2ea]/40 transition-all disabled:opacity-50"
                    />
                    {inputValue && (
                      <button
                        type="button"
                        onClick={() => setInputValue('')}
                        className="absolute right-2.5 top-2.5 text-[#beb9b3] hover:text-[#191a1b]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 rounded-xl bg-[#191a1b] text-[#d4ff4c] hover:bg-[#000000] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#5e5a5a] px-1 font-sans">
                  <span>Store Copilot v1.0 • Context Active</span>
                  <span className="hidden sm:inline">Press Enter ↵ to send</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

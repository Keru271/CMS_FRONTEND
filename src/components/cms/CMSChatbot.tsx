'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  PackagePlus,
  FolderPlus,
  Edit3,
  History,
} from 'lucide-react';
import { ChatInteractiveFormView } from './ChatInteractiveFormView';

const CHAT_STORAGE_KEY_PREFIX = 'cms_ai_chatbot_memory_';
const CHAT_DRAFT_KEY_PREFIX = 'cms_ai_chatbot_draft_';

const getDefaultGreeting = (productsCount = 0, ordersCount = 0, storeName = 'your store'): ChatMessage => ({
  id: 'welcome-1',
  sender: 'assistant',
  content: `👋 **Welcome to your AI Store Assistant!**\n\nI have live visibility into your catalog (**${productsCount} items**) and orders (**${ordersCount} orders**).\n\nI can help you add products, create marketing campaigns, analyze sales performance, and optimize ${storeName}.\n\n### 💡 What would you like to do today?`,
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  model: 'Default Text',
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
});

let _inMemoryChatHistory: ChatMessage[] = [];

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
    activeStore,
    currency,
    currencySymbol,
    fetchDashboardDetails,
  } = useCMSContext();

  const activeCurrency = (
    currency ||
    activeStore?.currency ||
    (merchantData?.store as any)?.currency ||
    'INR'
  ).toUpperCase();

  const activeCurrencySymbol =
    currencySymbol ||
    (activeCurrency === 'USD'
      ? '$'
      : activeCurrency === 'EUR'
      ? '€'
      : activeCurrency === 'GBP'
      ? '£'
      : activeCurrency === 'JPY'
      ? '¥'
      : activeCurrency === 'AUD'
      ? 'A$'
      : activeCurrency === 'CAD'
      ? 'CA$'
      : '₹');

  const storeContext: StoreContextData = useMemo(
    () => ({
      products: products || [],
      orders: orders || [],
      categories: categories || [],
      stats,
      merchantData,
      currentPath: pathname,
      userRole: merchantData?.merchant?.role || 'OWNER',
      currency: activeCurrency,
      currencySymbol: activeCurrencySymbol,
    }),
    [products, orders, categories, stats, merchantData, pathname, activeCurrency, activeCurrencySymbol],
  );

  const storeStorageId = activeStore?.id || merchantData?.store?.id || 'default_store';
  const chatStorageKey = `${CHAT_STORAGE_KEY_PREFIX}${storeStorageId}`;
  const draftStorageKey = `${CHAT_DRAFT_KEY_PREFIX}${storeStorageId}`;

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

  // Initialize messages from persistent storage, in-memory history, or default greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem('cms_ai_chatbot_memory_current') ||
          localStorage.getItem('cms_ai_chatbot_memory_default_store');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            _inMemoryChatHistory = parsed;
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load chat memory from localStorage:', e);
      }
    }
    if (_inMemoryChatHistory.length > 0) {
      return _inMemoryChatHistory;
    }
    return [getDefaultGreeting(products?.length || 0, orders?.length || 0, merchantData?.store?.storeName)];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open modal with smooth animation and auto-scroll to continue from last message
  const handleOpen = useCallback(() => {
    setIsRendered(true);
    setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        inputRef.current?.focus();
      }, 80);
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

  // Load store-specific memory when store ID changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          _inMemoryChatHistory = parsed;
          return;
        }
      }
      const current = localStorage.getItem('cms_ai_chatbot_memory_current');
      if (current && storeStorageId !== 'default_store') {
        const parsed = JSON.parse(current);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          _inMemoryChatHistory = parsed;
          localStorage.setItem(chatStorageKey, current);
        }
      }
    } catch (e) {
      console.warn('Error reading store chat memory:', e);
    }
  }, [chatStorageKey, storeStorageId]);

  // Persist chat memory to localStorage and in-memory cache
  useEffect(() => {
    if (messages.length > 0) {
      _inMemoryChatHistory = messages.slice(-50);
      if (typeof window !== 'undefined') {
        try {
          const serialized = JSON.stringify(messages.slice(-50));
          localStorage.setItem(chatStorageKey, serialized);
          localStorage.setItem('cms_ai_chatbot_memory_current', serialized);
        } catch (e) {
          console.warn('Failed to persist chat memory to localStorage:', e);
        }
      }
    }
  }, [messages, chatStorageKey]);

  // Restore draft prompt on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDraft =
          localStorage.getItem(draftStorageKey) ||
          localStorage.getItem('cms_ai_chatbot_draft_current');
        if (savedDraft && !inputValue) {
          setInputValue(savedDraft);
        }
      } catch {}
    }
  }, [draftStorageKey]);

  // Persist draft prompt as user types
  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (typeof window !== 'undefined') {
      try {
        if (text) {
          localStorage.setItem(draftStorageKey, text);
          localStorage.setItem('cms_ai_chatbot_draft_current', text);
        } else {
          localStorage.removeItem(draftStorageKey);
          localStorage.removeItem('cms_ai_chatbot_draft_current');
        }
      } catch {}
    }
  };

  // Auto-enrich any assistant messages that discuss or require interactive forms
  useEffect(() => {
    let hasChanges = false;
    const updated = messages.map((m, idx) => {
      if (m.sender === 'assistant' && !m.form) {
        const prevUserMsg = messages
          .slice(0, idx)
          .reverse()
          .find((item) => item.sender === 'user')?.content || '';
        const detected = aiAssistantService.detectInteractiveForm(
          prevUserMsg,
          storeContext,
          activeCurrencySymbol,
          m.content,
        );
        if (detected) {
          hasChanges = true;
          return {
            ...m,
            form: {
              ...detected,
              id: `form-${m.id}`,
            },
          };
        }
      }
      return m;
    });

    if (hasChanges) {
      setMessages(updated);
      _inMemoryChatHistory = updated.slice(-30);
    }
  }, [messages, storeContext, activeCurrencySymbol]);

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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(draftStorageKey);
        localStorage.removeItem('cms_ai_chatbot_draft_current');
      } catch {}
    }
    setIsTyping(true);

    try {
      const response = await aiAssistantService.generateResponse(
        textToSend,
        storeContext,
        messages,
      );
      playChime();

      let finalContent = response.content;
      if (activeCurrency !== 'USD') {
        finalContent = finalContent.replace(/\$(\s*\d+(?:,\d+)*(?:\.\d+)?)/g, `${activeCurrencySymbol}$1`);
      }

      const detectedForm =
        response.form ||
        aiAssistantService.detectInteractiveForm(
          textToSend,
          storeContext,
          activeCurrencySymbol,
          finalContent,
        );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: finalContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        actions: response.actions,
        form: detectedForm,
        model: response.model || 'Default Text',
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
          model: 'Default Text',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmitted = (
    messageId: string,
    resultMessage: string,
    submittedData: Record<string, any>,
  ) => {
    playChime();

    // Mark the form as submitted in messages state
    setMessages((prev) =>
      prev.map((m, idx) => {
        if (m.id === messageId) {
          const resolvedForm =
            m.form ||
            aiAssistantService.detectInteractiveForm(
              prev.slice(0, idx).reverse().find((item) => item.sender === 'user')?.content || '',
              storeContext,
              activeCurrencySymbol,
              m.content,
            );

          return {
            ...m,
            form: resolvedForm
              ? {
                  ...resolvedForm,
                  id: resolvedForm.id || `form-${m.id}`,
                  submitted: true,
                  submittedData,
                  resultMessage,
                }
              : {
                  id: `form-${messageId}`,
                  type: 'ADD_PRODUCT',
                  title: 'Store Item Saved',
                  subtitle: '',
                  fields: [],
                  initialValues: {},
                  submitButtonText: 'Saved',
                  submitted: true,
                  submittedData,
                  resultMessage,
                },
          };
        }
        return m;
      }),
    );

    // Append confirmation message to the chat stream with direct action links
    const confirmationMessage: ChatMessage = {
      id: `confirm-${Date.now()}`,
      sender: 'assistant',
      content: `🎉 **Successfully saved to store!**\n\n${resultMessage}\n\nYour changes are live in your catalog. What would you like to do next?`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      model: 'Default Text',
      actions: [
        {
          id: 'view_prods_conf',
          label: '📦 View Products Studio',
          type: 'NAVIGATE',
          payload: '/products',
        },
        {
          id: 'view_cats_conf',
          label: '📁 View Categories Studio',
          type: 'NAVIGATE',
          payload: '/categories',
        },
        {
          id: 'add_another_prod',
          label: '➕ Add Another Product',
          type: 'PREFILL_PROMPT',
          payload: 'Add product form',
        },
      ],
    };

    setMessages((prev) => [...prev, confirmationMessage]);
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
            content: `🎉 **Promotion Successfully Created & Live!**\n\n${promoRes.message}\n\n- 🏷️ **Coupon Code:** \`${action.payload.code}\`\n- 📦 **Collection:** \`${action.payload.collectionName}\`\n- 🚀 **Storefront Announcement:** Active\n\nYour customers can now redeem this discount at checkout!`,
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
    const freshGreeting = getDefaultGreeting(
      products?.length || 0,
      orders?.length || 0,
      merchantData?.store?.storeName,
    );
    setMessages([freshGreeting]);
    _inMemoryChatHistory = [freshGreeting];
    if (typeof window !== 'undefined') {
      try {
        const serialized = JSON.stringify([freshGreeting]);
        localStorage.setItem(chatStorageKey, serialized);
        localStorage.setItem('cms_ai_chatbot_memory_current', serialized);
        localStorage.removeItem(draftStorageKey);
        localStorage.removeItem('cms_ai_chatbot_draft_current');
      } catch {}
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

  // Helper to sanitize message content: removes robotic tool traces and debug blocks
  const cleanHumanMessage = (rawText: string): string => {
    if (!rawText) return '';
    const resolvedCurrency = (currency || activeStore?.currency || (merchantData?.store as any)?.currency || 'INR').toUpperCase();
    const resolvedSymbol =
      currencySymbol ||
      (resolvedCurrency === 'USD'
        ? '$'
        : resolvedCurrency === 'EUR'
        ? '€'
        : resolvedCurrency === 'GBP'
        ? '£'
        : resolvedCurrency === 'JPY'
        ? '¥'
        : resolvedCurrency === 'AUD'
        ? 'A$'
        : resolvedCurrency === 'CAD'
        ? 'CA$'
        : '₹');

    // Strip code blocks that contain tool execution traces
    let cleaned = rawText.replace(
      /```[\s\S]*?(?:\[(?:create_\w+|get_\w+|update_\w+|execute_tool|\w+)\]|platform tool execution trace|tool execution trace)[\s\S]*?```/gi,
      '',
    );
    // Strip standalone lines mentioning tool execution trace or [tool_name] -> ...
    cleaned = cleaned.replace(/^\s*(?:\[\w+\]|\d+\.\s*\[\w+\])\s*->.*$/gim, '');
    cleaned = cleaned.replace(/^.*platform tool execution trace.*$/gim, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // If store default currency is not USD, ensure any residual $ prices are converted to store default currency symbol
    if (resolvedCurrency !== 'USD') {
      cleaned = cleaned.replace(/\$(\s*\d+(?:,\d+)*(?:\.\d+)?)/g, `${resolvedSymbol}$1`);
    }

    return cleaned.trim();
  };

  // Markdown renderer helper with Code Block and Table support
  const renderFormattedContent = (content: string) => {
    const sanitized = cleanHumanMessage(content);
    const lines = sanitized.split('\n');
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
        // Discard any code block that contains internal tool execution traces
        const isToolTrace = codeBlockLines.some((l) =>
          /\[\w+\]\s*->|tool execution trace|\[create_|\[get_|\[update_/i.test(l),
        );
        if (!isToolTrace) {
          elements.push(
            <div
              key={`code-${key}`}
              className="my-3 p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 shadow-sm overflow-x-auto leading-relaxed"
            >
              <pre className="whitespace-pre-wrap font-mono text-cyan-300">{codeBlockLines.join('\n')}</pre>
            </div>,
          );
        }
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
          {/* Main Modal Box: Single-column chat layout */}
          <div
            className={`relative w-[92vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-[1100px] h-[90vh] max-h-[960px] bg-white border border-slate-200/90 shadow-2xl rounded-2xl md:rounded-3xl flex flex-col overflow-hidden transition-all duration-250 ease-out transform ${
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
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                    </span>
                    <span
                      className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-sans font-medium"
                      title="Continuous Memory: Prompts, context, and conversation history are persistently saved across page refreshes and sessions."
                    >
                      <History className="w-3 h-3 text-violet-500" />
                      <span>Memory Active</span>
                    </span>
                    {creditsInfo && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-500" />
                        <span>{creditsInfo.remaining}/{creditsInfo.total} AI Credits</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-sans truncate">
                    {merchantData?.store?.storeName || 'Merchant Store'} · AI E-Commerce Assistant
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

            {/* Modal Body: Full Width Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
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
                  {messages.map((msg, index) => {
                    const formToRender =
                      msg.form ||
                      (msg.sender === 'assistant'
                        ? aiAssistantService.detectInteractiveForm(
                            messages
                              .slice(0, index)
                              .reverse()
                              .find((m) => m.sender === 'user')?.content || '',
                            storeContext,
                            activeCurrencySymbol,
                            msg.content,
                          )
                        : undefined);

                    return (
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
                          {/* Testing model indicator badge */}
                          {msg.sender === 'assistant' && msg.model && (
                            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 text-[10px] text-slate-400 font-sans">
                              <span className="flex items-center gap-1 font-semibold text-slate-500 uppercase tracking-wider text-[9px]">
                                <Sparkles className="w-3 h-3 text-cyan-600" /> Response Source
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                                  msg.model.toLowerCase().includes('gemini')
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : msg.model.toLowerCase().includes('chatgpt') || msg.model.toLowerCase().includes('openai')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    msg.model.toLowerCase().includes('gemini')
                                      ? 'bg-blue-500 animate-pulse'
                                      : msg.model.toLowerCase().includes('chatgpt') || msg.model.toLowerCase().includes('openai')
                                      ? 'bg-emerald-500 animate-pulse'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                <span>{msg.model}</span>
                              </span>
                            </div>
                          )}

                          {/* Message content */}
                          <div className="space-y-1 text-slate-900 font-sans">{renderFormattedContent(msg.content)}</div>

                          {/* Interactive Form Card */}
                          {formToRender && (
                            <ChatInteractiveFormView
                              key={`form-${msg.id}`}
                              form={formToRender}
                              messageId={msg.id}
                              currencySymbol={activeCurrencySymbol}
                              categories={categories || []}
                              products={products || []}
                              fetchDashboardDetails={fetchDashboardDetails}
                              onFormSubmitted={handleFormSubmitted}
                            />
                          )}

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
                        {msg.sender === 'assistant' && msg.model && (
                          <span className="text-[10px] font-mono font-medium text-slate-400">
                            • {msg.model}
                          </span>
                        )}
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
                  );
                })}

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
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Ask anything about your store... (e.g. 'What should I improve today?')"
                        disabled={isTyping}
                        className="w-full pl-4 pr-9 py-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-sans text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50 shadow-xs"
                      />
                      {inputValue && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('')}
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
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-slate-500">Memory Active</span>
                      <span className="text-slate-300">•</span>
                      <span>Context preserved across sessions & refresh</span>
                    </span>
                    <span className="hidden sm:inline">Press Enter ↵ to send · Esc to close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

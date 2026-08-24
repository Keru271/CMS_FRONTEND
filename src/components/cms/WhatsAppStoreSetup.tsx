'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService, STORE_TEMPLATES } from '@/src/services/cmsService';
import { StoreSetupData, StoreTemplate, MerchantOnboardingData } from '@/src/types';
import {
  Send,
  Sparkles,
  Store,
  Palette,
  Check,
  CheckCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Smile,
  ShieldCheck,
  Sliders,
  PartyPopper,
  Mail,
  Phone,
  MapPin,
  Coins,
  Globe,
} from 'lucide-react';

interface WhatsAppStoreSetupProps {
  onSaved?: (data: StoreSetupData) => void;
  onSwitchToForm?: () => void;
}

interface ChatStepMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  type?:
    | 'text'
    | 'store-name-options'
    | 'category-options'
    | 'tagline-options'
    | 'email-options'
    | 'phone-options'
    | 'address-options'
    | 'theme-cards'
    | 'currency-options'
    | 'summary-card'
    | 'completion-card';
  data?: any;
}

// Category options for quick chips
const CATEGORY_CHIPS = [
  { id: 'tech', label: 'Tech & Electronics', icon: '⚡', taglineDefault: 'Next-generation tech for modern living.' },
  { id: 'fashion', label: 'Fashion & Apparel', icon: '👗', taglineDefault: 'Curated luxury fashion & modern aesthetics.' },
  { id: 'beauty', label: 'Beauty & Skincare', icon: '🌿', taglineDefault: 'Clean, radiant beauty formulated with love.' },
  { id: 'artisan', label: 'Artisan & Handcrafted', icon: '🎨', taglineDefault: 'Thoughtfully crafted goods by studio artisans.' },
  { id: 'streetwear', label: 'Urban Streetwear', icon: '🔥', taglineDefault: 'Bold culture, limited drops & raw style.' },
  { id: 'fitness', label: 'Fitness & Sports', icon: '🏋️', taglineDefault: 'High performance gear for athletes & dreamers.' },
  { id: 'home', label: 'Home & Living', icon: '🏡', taglineDefault: 'Elevated lifestyle goods designed for comfort.' },
];

// Currency options
const CURRENCY_CHIPS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee (UPI & Razorpay)' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar (Stripe & Global)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro (Stripe & SEPA)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($) - Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', label: 'AUD ($) - Australian Dollar' },
  { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ) - UAE Dirham' },
];

const STORAGE_KEY_MESSAGES = 'cms_whatsapp_setup_messages';
const STORAGE_KEY_STAGE = 'cms_whatsapp_setup_stage';
const STORAGE_KEY_FORM = 'cms_whatsapp_setup_form_draft';

export const WhatsAppStoreSetup: React.FC<WhatsAppStoreSetupProps> = ({ onSaved, onSwitchToForm }) => {
  const router = useRouter();
  const { merchantData, setMerchantData } = useCMSContext();

  // Helper to safely load draft state from localStorage
  const getStoredDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedForm = localStorage.getItem(STORAGE_KEY_FORM);
        if (savedForm) return JSON.parse(savedForm);
      } catch (e) {
        console.error('Failed to parse stored WhatsApp form draft', e);
      }
    }
    return null;
  };

  const storedDraft = getStoredDraft();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStage, setCurrentStage] = useState<
    | 'store-name'
    | 'category'
    | 'tagline'
    | 'business-email'
    | 'contact-phone'
    | 'address'
    | 'theme'
    | 'currency'
    | 'summary'
    | 'completed'
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedStage = localStorage.getItem(STORAGE_KEY_STAGE);
        if (savedStage) return savedStage as any;
      } catch (e) {}
    }
    return 'store-name';
  });

  // Setup Draft State
  const [storeName, setStoreName] = useState(
    storedDraft?.storeName ?? (merchantData?.store?.storeName || '')
  );
  const [category, setCategory] = useState(
    storedDraft?.category ?? (merchantData?.store?.category || 'Tech & Electronics')
  );
  const [tagline, setTagline] = useState(
    storedDraft?.tagline ?? (merchantData?.store?.tagline || 'Next-generation tech for modern living.')
  );
  const [contactEmail, setContactEmail] = useState(
    storedDraft?.contactEmail ?? (merchantData?.store?.supportEmail || merchantData?.merchant?.email || 'support@omnistore.com')
  );
  const [contactPhone, setContactPhone] = useState(
    storedDraft?.contactPhone ?? (merchantData?.store?.supportPhone || merchantData?.merchant?.mobileNumber || '+91 98765 43210')
  );
  const [address, setAddress] = useState(
    storedDraft?.address ?? '100 Innovation Way, Indiranagar, Bengaluru, Karnataka 560038, India'
  );
  const [selectedTheme, setSelectedTheme] = useState<StoreTemplate>(
    storedDraft?.selectedTheme ?? (merchantData?.selectedTemplate || STORE_TEMPLATES[0])
  );
  const [currency, setCurrency] = useState(
    storedDraft?.currency ?? (merchantData?.store?.currency || 'INR')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Synthesized Web Audio Sound Effects
  const playAudioCue = (type: 'sent' | 'received' | 'success') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'sent') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'received') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.2);
        });
      }
    } catch {
      // Audio not supported
    }
  };

  // Initial Welcome Message with localStorage restore
  const [messages, setMessages] = useState<ChatStepMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to load WhatsApp setup chat messages', e);
      }
    }
    return [
      {
        id: 'msg-welcome-1',
        sender: 'assistant',
        text: `👋 Hey there! Welcome to the **OmniStore WhatsApp Setup Concierge**.\n\nI'll guide you step-by-step to get your online storefront, business contact info, and theme fully configured in under 2 minutes! ⚡`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      },
      {
        id: 'msg-welcome-2',
        sender: 'assistant',
        text: `Let's kick things off with your brand identity: **What is the name of your store?** 🏷️\n\nType your store name below, or tap one of our suggested brand inspirations:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'store-name-options',
      },
    ];
  });

  // Persist messages to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save WhatsApp setup messages', e);
      }
    }
  }, [messages]);

  // Persist current stage to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_STAGE, currentStage);
      } catch (e) {
        console.error('Failed to save WhatsApp setup stage', e);
      }
    }
  }, [currentStage]);

  // Persist draft form data to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const draftObj = {
          storeName,
          category,
          tagline,
          contactEmail,
          contactPhone,
          address,
          selectedTheme,
          currency,
        };
        localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(draftObj));
      } catch (e) {
        console.error('Failed to save WhatsApp setup form draft', e);
      }
    }
  }, [storeName, category, tagline, contactEmail, contactPhone, address, selectedTheme, currency]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Handle User Input Submission
  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    // Add User Message
    const userMsg: ChatStepMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: getFormattedTime(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    playAudioCue('sent');
    setIsTyping(true);

    // Process State Machine
    setTimeout(() => {
      processNextStep(content);
    }, 700);
  };

  const processNextStep = (userInput: string) => {
    setIsTyping(false);
    playAudioCue('received');

    if (currentStage === 'store-name') {
      setStoreName(userInput);
      setCurrentStage('category');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Awesome! **"${userInput}"** has a great ring to it. 🌟`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `Next up: **What category of products will you be showcasing in ${userInput}?** Pick an option below:`,
          timestamp: getFormattedTime(),
          type: 'category-options',
        },
      ]);
    } else if (currentStage === 'category') {
      const matched = CATEGORY_CHIPS.find((c) => c.label.toLowerCase().includes(userInput.toLowerCase())) || {
        label: userInput,
        taglineDefault: `The official destination for ${userInput}.`,
      };
      setCategory(matched.label);
      setCurrentStage('tagline');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Perfect! High demand in the **${matched.label}** niche. 📈`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `Let's add a punchy **tagline or headline** for your storefront header. Tap one of these customized slogans or type your custom one:`,
          timestamp: getFormattedTime(),
          type: 'tagline-options',
          data: {
            suggestions: [
              matched.taglineDefault,
              `Premium ${matched.label} crafted for perfection.`,
              `Where quality meets modern style.`,
              `Elevate your world with ${storeName || 'us'}.`,
            ],
          },
        },
      ]);
    } else if (currentStage === 'tagline') {
      setTagline(userInput);
      setCurrentStage('business-email');

      const userEmail = merchantData?.merchant?.email || 'contact@store.com';
      const cleanStoreSlug = (storeName || 'store').toLowerCase().replace(/[^a-z0-9]/g, '');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `*"${userInput}"* — catchy and memorable! 🎯`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `Now let's configure your store communication: **What is your official business email address?** 📧\n\nThis will be displayed on order invoices and customer notifications. Tap a quick option or type your email:`,
          timestamp: getFormattedTime(),
          type: 'email-options',
          data: {
            suggestions: [
              userEmail,
              `support@${cleanStoreSlug}.com`,
              `hello@${cleanStoreSlug}.shop`,
              `orders@${cleanStoreSlug}.store`,
            ],
          },
        },
      ]);
    } else if (currentStage === 'business-email') {
      setContactEmail(userInput);
      setCurrentStage('contact-phone');

      const userPhone = merchantData?.merchant?.mobileNumber || '+91 98765 43210';

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Got it! Customer support email set to **${userInput}**. 📬`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `**What is your business contact number or WhatsApp support phone?** 📱\n\nCustomers can reach you here for order support and delivery inquiries:`,
          timestamp: getFormattedTime(),
          type: 'phone-options',
          data: {
            suggestions: [
              userPhone,
              '+91 80 4000 1234 (Bangalore HQ)',
              '+1 (800) 555-0199 (Toll Free)',
              '+44 20 7946 0912 (UK Support)',
            ],
          },
        },
      ]);
    } else if (currentStage === 'contact-phone') {
      setContactPhone(userInput);
      setCurrentStage('address');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Saved! Business contact number set to **${userInput}**. 📞`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `**What is your physical store, office, or fulfillment warehouse address?** 📍\n\nThis will be printed on shipping labels, return policies, and invoice receipts:`,
          timestamp: getFormattedTime(),
          type: 'address-options',
          data: {
            suggestions: [
              '100 Innovation Way, Indiranagar, Bengaluru, Karnataka 560038, India',
              '742 Evergreen Terrace, San Francisco, CA 94107, United States',
              '221B Baker Street, Marylebone, London NW1 6XE, United Kingdom',
              'Level 24, International Towers, Sydney NSW 2000, Australia',
            ],
          },
        },
      ]);
    } else if (currentStage === 'address') {
      setAddress(userInput);
      setCurrentStage('theme');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Address recorded! 🏢\n*"${userInput}"*`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `Now for the visual magic! 🎨 **Which storefront theme and design aesthetic matches your brand best?**\n\nBrowse through our designer templates below and tap **"Select This Theme"**:`,
          timestamp: getFormattedTime(),
          type: 'theme-cards',
        },
      ]);
    } else if (currentStage === 'theme') {
      // Handled via theme card select button
    } else if (currentStage === 'currency') {
      const curr = userInput.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'INR';
      setCurrency(curr);
      setCurrentStage('summary');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Got it! Primary currency configured to **${curr}**. 💵`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `🎉 Everything is assembled! Here is your complete **Store Configuration Passport** including your contact details and address. Tap **"Apply & Launch Store"** to publish your storefront:`,
          timestamp: getFormattedTime(),
          type: 'summary-card',
        },
      ]);
    } else if (currentStage === 'summary' || currentStage === 'completed') {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `Your store is active! You can review or tweak settings anytime or head over to your main dashboard.`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
      ]);
    }
  };

  // User selects a Category Chip
  const handleSelectCategory = (catLabel: string, defaultTagline: string) => {
    setCategory(catLabel);
    setTagline(defaultTagline);
    handleSendMessage(catLabel);
  };

  // User selects a Theme Card
  const handleSelectTheme = (template: StoreTemplate) => {
    setSelectedTheme(template);
    playAudioCue('sent');

    const userMsg: ChatStepMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `Selected Theme: ${template.name}`,
      timestamp: getFormattedTime(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      playAudioCue('received');
      setCurrentStage('currency');

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-1`,
          sender: 'assistant',
          text: `Stunning choice! The **${template.name}** layout looks incredible with ${template.accentColor} accents. 💅`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
        {
          id: `asst-${Date.now()}-2`,
          sender: 'assistant',
          text: `Almost there! **What primary currency should your store checkout and prices display in?**`,
          timestamp: getFormattedTime(),
          type: 'currency-options',
        },
      ]);
    }, 600);
  };

  // User selects Currency Chip
  const handleSelectCurrency = (currCode: string) => {
    handleSendMessage(currCode);
  };

  // Parse address parts
  const parseAddressComponents = (fullAddr: string) => {
    const parts = fullAddr.split(',').map((p) => p.trim());
    return {
      street: parts[0] || '100 Innovation Way',
      city: parts[1] || 'Bengaluru',
      state: parts[2] || 'Karnataka',
      country: parts[parts.length - 1] || 'India',
      zip: '560038',
    };
  };

  // Apply and Deploy Store
  const handleApplyAndLaunch = async () => {
    setIsSaving(true);
    playAudioCue('sent');

    try {
      const cleanSlug = (storeName || 'omnistore')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const addrParts = parseAddressComponents(address);

      const storePayload: StoreSetupData = {
        name: storeName || 'My Store',
        slug: cleanSlug,
        description: tagline || 'Official Store',
        currency: currency || 'INR',
        contactEmail: contactEmail || 'support@omnistore.com',
        contactPhone: contactPhone || '+91 98765 43210',
        addressStreet: addrParts.street,
        addressCity: addrParts.city,
        addressState: addrParts.state,
        addressZip: addrParts.zip,
        addressCountry: addrParts.country,
        customDomain: `${cleanSlug}.onlinestore.io`,
        domainStatus: 'ACTIVE',
        language: 'en-US',
        timezone: 'Asia/Kolkata',
        logo:
          selectedTheme.previewImage ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        favicon:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=64&q=80',
      };

      // 1. Update store setup on backend
      const updatedSetup = await cmsService.updateStoreSetup(storePayload);

      // 2. Publish & update theme
      await cmsService.publishTemplate(selectedTheme.slug || selectedTheme.id);
      await cmsService.updateStoreTheme({
        activeTemplateSlug: selectedTheme.slug || selectedTheme.id,
        themePrimaryColor: selectedTheme.accentColor,
        themeSecondaryColor: '#64748B',
        themeBackgroundColor: '#FFFFFF',
        themeTextColor: '#0F172A',
        themeAccentColor: selectedTheme.accentColor,
        themeHeadingFont: 'Inter',
        themeBodyFont: 'Inter',
        themeFontSize: 'md',
        themeBorderRadius: 'md',
        themeButtonStyle: 'solid',
        themeLayoutWidth: 'standard',
        headerStyle: 'left-aligned',
        headerSticky: true,
        headerAnnouncement: `🚀 Welcome to ${storeName || 'our store'}! Enjoy free shipping on your first order.`,
        headerShowSearch: true,
        headerShowCurrency: true,
        footerStyle: 'multi-column',
        footerCopyright: `© ${new Date().getFullYear()} ${storeName || 'OmniStore'}. All rights reserved.`,
        footerShowSocial: true,
        footerShowNewsletter: true,
        footerShowPaymentBadges: true,
      });

      // 3. Update global React context
      if (merchantData) {
        const updatedMerchantData: MerchantOnboardingData = {
          ...merchantData,
          store: {
            id: merchantData.store?.id || 'store-active',
            slug: cleanSlug,
            storeName: storeName || 'My Store',
            tagline,
            category,
            currency,
            status: 'ACTIVE',
            supportEmail: contactEmail,
            supportPhone: contactPhone,
          },
          selectedTemplate: selectedTheme,
        };
        setMerchantData(updatedMerchantData);
        cmsService.saveMerchantSession(updatedMerchantData);
      }

      if (onSaved) onSaved(storePayload);

      setCurrentStage('completed');
      playAudioCue('success');

      // Add success completion message
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-success-${Date.now()}`,
          sender: 'assistant',
          text: `🎉 **BOOM! Your store is live and operational!**\n\nYour brand identity, business contact channels, address, and designer theme have been deployed to production.`,
          timestamp: getFormattedTime(),
          type: 'completion-card',
        },
      ]);
    } catch (err) {
      console.error('Failed to deploy store settings:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ There was a small hiccup while saving your settings to the server, but your local session has been updated. You can tweak details in the Settings tab anytime.`,
          timestamp: getFormattedTime(),
          type: 'text',
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  // Restart Chat
  const handleResetChat = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_MESSAGES);
        localStorage.removeItem(STORAGE_KEY_STAGE);
        localStorage.removeItem(STORAGE_KEY_FORM);
      } catch (e) {
        console.error('Failed to clear WhatsApp setup storage', e);
      }
    }
    setCurrentStage('store-name');
    setMessages([
      {
        id: `msg-welcome-restart-1`,
        sender: 'assistant',
        text: `🔄 Chat reset! Let's configure your store from scratch.\n\n**What is the name of your store?**`,
        timestamp: getFormattedTime(),
        type: 'store-name-options',
      },
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#cbd5e0] bg-[#efeae2] flex flex-col h-[780px] font-sans relative">
      {/* ─── WHATSAPP TOP APP BAR ────────────────────────────────────── */}
      <div className="bg-[#075e54] text-white px-4 py-3 sm:px-6 flex items-center justify-between shadow-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-[#128c7e] border-2 border-white/40 flex items-center justify-center text-white shadow-inner font-serif font-bold text-lg">
              🏪
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25d366] border-2 border-[#075e54] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base sm:text-lg leading-tight tracking-wide text-white">
                Store Setup Concierge
              </h2>
              <span className="bg-[#25d366]/20 text-[#25d366] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-[#25d366]/40">
                Verified AI
              </span>
            </div>
            <p className="text-xs text-white/80 flex items-center gap-1.5 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse" />
              online • instant replies
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Setup */}
          <button
            onClick={handleResetChat}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Restart Setup Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Switch to Form Mode */}
          {onSwitchToForm && (
            <button
              onClick={onSwitchToForm}
              className="ml-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Advanced Form</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── WHATSAPP CHAT MESSAGES BODY ────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative"
        style={{
          backgroundColor: '#efeae2',
          backgroundImage: `radial-gradient(#d1c7b7 0.75px, transparent 0.75px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Security & Date Header Pill */}
        <div className="flex flex-col items-center justify-center gap-2 my-2">
          <span className="bg-[#ffffff]/85 text-[#5e5a5a] text-[11px] font-medium px-3 py-1 rounded-lg shadow-xs uppercase tracking-wider">
            TODAY
          </span>
          <div className="bg-[#ffeecd] border border-[#ffd580] text-[#7a5901] text-xs px-3.5 py-1.5 rounded-lg shadow-xs text-center max-w-md flex items-center justify-center gap-2 font-sans">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#b38600]" />
            <span>🔒 Messages are encrypted & store settings are saved automatically.</span>
          </div>
        </div>

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2 max-w-full`}
            >
              {/* Main Chat Bubble */}
              <div
                className={`relative px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm text-sm ${
                  isUser
                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-[#b2dfdb]/40'
                    : 'bg-[#ffffff] text-[#111b21] rounded-tl-none border border-[#e2e8f0]'
                }`}
              >
                {/* Message Text with Markdown formatting */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text.split('\n').map((paragraph, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {paragraph.split('**').map((chunk, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="font-semibold text-[#000000]">
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </p>
                  ))}
                </div>

                {/* Timestamp & Read Receipt */}
                <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-[#667781]">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>

              {/* ─── INTERACTIVE WIDGET: STORE NAME OPTIONS ─── */}
              {msg.type === 'store-name-options' && currentStage === 'store-name' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-md space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#128c7e]" />
                    Quick Brand Inspirations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Apex Luxe Studio', 'Nova Horizon Goods', 'Verdant Organic Lab', 'Urban Pulse Retail', 'Zenith Crafts'].map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSendMessage(name)}
                        className="px-3 py-1.5 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-xs font-medium text-[#111b21] transition-all border border-[#cbd5e0]/60 active:scale-95 cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: CATEGORY OPTIONS ─── */}
              {msg.type === 'category-options' && currentStage === 'category' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-4 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-lg space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider block">
                    Choose Your Core Industry:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORY_CHIPS.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.label, cat.taglineDefault)}
                        className="p-2.5 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-[#111b21] transition-all border border-[#cbd5e0]/60 text-left flex items-center gap-2 group active:scale-95 cursor-pointer"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="text-xs font-medium leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: TAGLINE OPTIONS ─── */}
              {msg.type === 'tagline-options' && currentStage === 'tagline' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-md space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider block">
                    Suggested Taglines (Tap to Select):
                  </span>
                  <div className="space-y-1.5">
                    {(msg.data?.suggestions || []).map((sugg: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sugg)}
                        className="w-full text-left px-3 py-2 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-xs font-medium text-[#111b21] transition-all border border-[#cbd5e0]/60 flex items-center justify-between group active:scale-98 cursor-pointer"
                      >
                        <span className="italic">"{sugg}"</span>
                        <span className="text-[10px] text-[#5e5a5a] group-hover:text-white">Select →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: EMAIL OPTIONS ─── */}
              {msg.type === 'email-options' && currentStage === 'business-email' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-md space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#128c7e]" />
                    Quick Email Suggestions:
                  </span>
                  <div className="space-y-1.5">
                    {(msg.data?.suggestions || []).map((emailOption: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(emailOption)}
                        className="w-full text-left px-3.5 py-2 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-xs font-medium text-[#111b21] transition-all border border-[#cbd5e0]/60 flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-mono">{emailOption}</span>
                        <span className="text-[10px] text-[#5e5a5a] group-hover:text-white font-sans">Use Email →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: PHONE OPTIONS ─── */}
              {msg.type === 'phone-options' && currentStage === 'contact-phone' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-md space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#128c7e]" />
                    Quick Contact Numbers:
                  </span>
                  <div className="space-y-1.5">
                    {(msg.data?.suggestions || []).map((phoneOption: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(phoneOption)}
                        className="w-full text-left px-3.5 py-2 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-xs font-medium text-[#111b21] transition-all border border-[#cbd5e0]/60 flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-mono">{phoneOption}</span>
                        <span className="text-[10px] text-[#5e5a5a] group-hover:text-white font-sans">Use Phone →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: ADDRESS OPTIONS ─── */}
              {msg.type === 'address-options' && currentStage === 'address' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-md space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#128c7e]" />
                    Suggested Location Templates:
                  </span>
                  <div className="space-y-1.5">
                    {(msg.data?.suggestions || []).map((addrOption: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(addrOption)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-xs font-medium text-[#111b21] transition-all border border-[#cbd5e0]/60 flex items-start justify-between group cursor-pointer gap-2"
                      >
                        <span className="leading-snug">{addrOption}</span>
                        <span className="text-[10px] text-[#5e5a5a] group-hover:text-white shrink-0 mt-0.5">Use →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: THEME CARDS ─── */}
              {msg.type === 'theme-cards' && currentStage === 'theme' && (
                <div className="w-full max-w-2xl space-y-3 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STORE_TEMPLATES.map((tmpl) => {
                      const isSelected = selectedTheme.id === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          className={`bg-[#ffffff] rounded-2xl overflow-hidden border transition-all shadow-sm flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#075e54] ring-2 ring-[#075e54]'
                              : 'border-[#cbd5e0] hover:border-gray-400'
                          }`}
                        >
                          <div className="h-32 w-full relative overflow-hidden bg-gray-100">
                            <img
                              src={tmpl.previewImage}
                              alt={tmpl.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#191a1b]/80 backdrop-blur-xs text-[#d4ff4c]">
                                {tmpl.badge}
                              </span>
                            </div>
                            <div
                              className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border border-white shadow-xs"
                              style={{ backgroundColor: tmpl.accentColor }}
                            />
                          </div>

                          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-serif font-bold text-sm text-[#191a1b]">{tmpl.name}</h4>
                                {isSelected && <Check className="w-4 h-4 text-[#075e54]" />}
                              </div>
                              <p className="text-[11px] text-[#5e5a5a] line-clamp-2 mt-0.5">{tmpl.description}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectTheme(tmpl)}
                              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#075e54] text-white shadow-xs'
                                  : 'bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-[#111b21]'
                              }`}
                            >
                              <Palette className="w-3.5 h-3.5" />
                              <span>{isSelected ? 'Theme Selected ✓' : 'Select This Theme'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: CURRENCY OPTIONS ─── */}
              {msg.type === 'currency-options' && currentStage === 'currency' && (
                <div className="bg-[#ffffff]/90 backdrop-blur-xs p-4 rounded-2xl border border-[#cbd5e0] shadow-xs max-w-md space-y-2 mt-1">
                  <span className="text-[11px] font-semibold text-[#5e5a5a] uppercase tracking-wider block">
                    Choose Primary Currency:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CURRENCY_CHIPS.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => handleSelectCurrency(curr.code)}
                        className="p-2.5 rounded-xl bg-[#f0f2f5] hover:bg-[#128c7e] hover:text-white text-[#111b21] transition-all border border-[#cbd5e0]/60 text-left flex items-center justify-between group active:scale-95 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-white text-[#075e54] font-bold text-xs flex items-center justify-center shadow-2xs font-mono">
                            {curr.symbol}
                          </span>
                          <span className="text-xs font-bold">{curr.code}</span>
                        </div>
                        <span className="text-[10px] text-[#5e5a5a] group-hover:text-white">Select →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: PASSPORT SUMMARY CARD ─── */}
              {msg.type === 'summary-card' && currentStage === 'summary' && (
                <div className="bg-[#ffffff] rounded-2xl border-2 border-[#075e54] p-5 shadow-lg max-w-md w-full space-y-4 mt-2">
                  <div className="flex items-center justify-between pb-3 border-b border-[#cbd5e0]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#075e54] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        🚀
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#191a1b]">Store Configuration Passport</h4>
                        <p className="text-[10px] text-[#5e5a5a]">Ready to publish live storefront</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d9fdd3] text-[#075e54] border border-[#b2dfdb]">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#f0f2f5]">
                      <span className="text-[#5e5a5a] font-medium">Store Brand:</span>
                      <strong className="text-[#191a1b] font-bold font-serif text-sm">{storeName || 'My Store'}</strong>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f0f2f5]">
                      <span className="text-[#5e5a5a] font-medium">Category:</span>
                      <span className="text-[#191a1b] font-medium">{category}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f0f2f5]">
                      <span className="text-[#5e5a5a] font-medium">Tagline:</span>
                      <span className="text-[#191a1b] italic truncate max-w-[220px]">"{tagline}"</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f0f2f5]">
                      <span className="text-[#5e5a5a] font-medium">Business Email:</span>
                      <span className="text-[#191a1b] font-mono font-medium truncate max-w-[200px]">{contactEmail}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f0f2f5]">
                      <span className="text-[#5e5a5a] font-medium">Contact Phone:</span>
                      <span className="text-[#191a1b] font-mono font-medium">{contactPhone}</span>
                    </div>

                    <div className="flex justify-between items-start py-1 border-b border-[#f0f2f5] gap-2">
                      <span className="text-[#5e5a5a] font-medium shrink-0">Store Address:</span>
                      <span className="text-[#191a1b] text-right font-medium text-[11px] line-clamp-2">{address}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f0f2f5]">
                      <span className="text-[#5e5a5a] font-medium">Selected Theme:</span>
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: selectedTheme.accentColor }}
                        />
                        <span>{selectedTheme.name}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#5e5a5a] font-medium">Store Currency:</span>
                      <span className="text-[#191a1b] font-bold font-mono">{currency}</span>
                    </div>
                  </div>

                  {/* 1-Click Launch Button */}
                  <button
                    onClick={handleApplyAndLaunch}
                    disabled={isSaving}
                    className="w-full py-3 bg-[#25d366] hover:bg-[#128c7e] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <PartyPopper className="w-4 h-4 text-white" />
                        <span>Apply Setup & Launch Store 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ─── INTERACTIVE WIDGET: COMPLETION CARD ─── */}
              {msg.type === 'completion-card' && (
                <div className="bg-[#ffffff] rounded-2xl border-2 border-[#25d366] p-5 shadow-lg max-w-md w-full space-y-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#d9fdd3] flex items-center justify-center text-2xl">
                      🎉
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#191a1b]">Store Setup Complete!</h4>
                      <p className="text-xs text-[#5e5a5a]">Your storefront is configured and ready for business.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#cbd5e0]/60">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-4 py-2.5 bg-[#075e54] hover:bg-[#128c7e] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Open Dashboard</span>
                    </button>

                    <button
                      onClick={() => router.push('/themes')}
                      className="px-4 py-2.5 bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#111b21] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#cbd5e0] cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#128c7e]" />
                      <span>Theme Studio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 bg-[#ffffff] text-[#111b21] px-4 py-3 rounded-2xl rounded-tl-none border border-[#e2e8f0] shadow-xs max-w-[140px]">
            <span className="text-xs text-[#5e5a5a] font-medium mr-1">Concierge</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#128c7e] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[#128c7e] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#128c7e] animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── EMOJI QUICK BAR (POPUP) ─────────────────────────────────── */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-[#f0f2f5] border-t border-[#cbd5e0] flex items-center gap-2 overflow-x-auto z-10">
          {['👋', '🚀', '🔥', '✨', '⚡', '👗', '🌿', '🎨', '💎', '🎉', '🌟', '🏪', '🛍️', '📧', '📱', '📍'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
                inputRef.current?.focus();
              }}
              className="text-lg p-1.5 hover:bg-white rounded-lg transition-transform active:scale-125 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* ─── WHATSAPP BOTTOM INPUT BAR ──────────────────────────────── */}
      <div className="bg-[#f0f2f5] px-3 py-2.5 sm:px-4 flex items-center gap-2 border-t border-[#cbd5e0] shrink-0 z-20">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-[#54656f] hover:text-[#111b21] transition-colors rounded-full hover:bg-white/80 cursor-pointer"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              currentStage === 'store-name'
                ? "Type your store name (e.g. 'Aura Luxe Studio')..."
                : currentStage === 'tagline'
                ? 'Type your store tagline...'
                : currentStage === 'business-email'
                ? 'Enter official business email (e.g. support@store.com)...'
                : currentStage === 'contact-phone'
                ? 'Enter contact phone (e.g. +91 98765 43210)...'
                : currentStage === 'address'
                ? 'Enter physical business address...'
                : currentStage === 'currency'
                ? 'Enter currency (INR, USD, EUR, GBP)...'
                : 'Type a message or select an option above...'
            }
            className="w-full bg-white text-[#111b21] placeholder-[#8696a0] text-sm px-4 py-2.5 rounded-full border border-white focus:outline-none focus:ring-2 focus:ring-[#128c7e]/50 shadow-2xs"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full bg-[#128c7e] hover:bg-[#075e54] text-white flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:hover:bg-[#128c7e] cursor-pointer"
          title="Send"
        >
          <Send className="w-4 h-4 ml-0.5 text-white" />
        </button>
      </div>
    </div>
  );
};

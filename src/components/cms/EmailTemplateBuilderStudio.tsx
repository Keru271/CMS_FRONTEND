'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Layout,
  Eye,
  Code,
  Send,
  Save,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Smartphone,
  Monitor,
  Sparkles,
  Settings2,
  CheckCircle2,
  RotateCcw,
  Tag,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  Type,
  ExternalLink,
  Percent,
  Truck,
  FileText,
  Share2,
  AlertCircle,
  X,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import {
  EmailTemplateData,
  EmailTemplateBlock,
  EmailBlockType,
  EmailDesignConfig,
  SendTestEmailResponse,
} from '@/src/types';

interface Props {
  initialTemplateId?: string;
  initialCategory?: string;
  onClose?: () => void;
}

const AVAILABLE_BLOCKS: {
  type: EmailBlockType;
  label: string;
  icon: any;
  description: string;
  defaultContent: Record<string, any>;
}[] = [
  {
    type: 'header',
    label: 'Header / Logo',
    icon: ImageIcon,
    description: 'Store logo, brand name and header spacing',
    defaultContent: {
      brandName: '{{store.name}}',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
      align: 'center',
      padding: '24px 24px 16px 24px',
    },
  },
  {
    type: 'hero',
    label: 'Hero Banner',
    icon: Layout,
    description: 'High-impact headline banner with optional image',
    defaultContent: {
      title: 'Special Announcement For You 🎉',
      subtitle: 'Discover exclusive offers and premium new arrivals crafted for you.',
      imageUrl: '',
      backgroundColor: '#191a1b',
      textColor: '#ffffff',
      align: 'center',
    },
  },
  {
    type: 'text',
    label: 'Rich Text',
    icon: Type,
    description: 'Personalized text message, greeting, or body copy',
    defaultContent: {
      text: '<p>Hi <strong>{{customer.name}}</strong>,</p><p>We are delighted to share our latest updates with you. Everything is packed and prepared with love.</p>',
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#191a1b',
      align: 'left',
      padding: '16px 24px',
    },
  },
  {
    type: 'button',
    label: 'CTA Button',
    icon: ExternalLink,
    description: 'Eye-catching clickable action button',
    defaultContent: {
      text: 'Shop the Collection Now →',
      url: '{{store.url}}/collections/all',
      backgroundColor: '#191a1b',
      textColor: '#00E5FF',
      borderRadius: 8,
      align: 'center',
      fullWidth: false,
      padding: '16px 24px',
    },
  },
  {
    type: 'products',
    label: 'Product Showcase',
    icon: ShoppingBag,
    description: 'Curated 2-column or 4-item product showcase',
    defaultContent: {
      title: 'Handpicked For You',
      items: [
        {
          name: 'Minimalist Linen Shirt',
          price: '₹1,899',
          originalPrice: '₹2,499',
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80',
          url: '{{store.url}}/products/linen-shirt',
          badge: 'BESTSELLER',
        },
        {
          name: 'Artisan Leather Wallet',
          price: '₹899',
          originalPrice: '₹1,299',
          imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
          url: '{{store.url}}/products/leather-wallet',
          badge: 'POPULAR',
        },
      ],
      padding: '20px 24px',
    },
  },
  {
    type: 'coupon',
    label: 'Discount Coupon',
    icon: Percent,
    description: 'Vibrant promotional voucher badge with copy code',
    defaultContent: {
      code: 'SAVE20',
      discountText: '20% OFF YOUR NEXT ORDER',
      expiryText: 'Use at checkout. Valid for 48 hours.',
      buttonText: 'Claim Discount Now',
      buttonUrl: '{{store.url}}/discount/SAVE20',
      padding: '20px 24px',
    },
  },
  {
    type: 'order-summary',
    label: 'Order Summary',
    icon: FileText,
    description: 'Clean transactional order receipt with live tags',
    defaultContent: {
      orderNumber: '{{order.number}}',
      total: '{{order.total}}',
      status: 'Paid & Processing',
      padding: '16px 24px',
    },
  },
  {
    type: 'tracking-card',
    label: 'Shipment Tracking',
    icon: Truck,
    description: 'Carrier, AWB and 1-click live parcel tracking link',
    defaultContent: {
      carrier: '{{tracking.carrier}}',
      awb: '{{tracking.number}}',
      trackingUrl: '{{tracking.url}}',
      estimatedDelivery: '{{tracking.estimated_delivery}}',
      padding: '16px 24px',
    },
  },
  {
    type: 'divider',
    label: 'Divider / Spacer',
    icon: Layers,
    description: 'Subtle separator line with configurable spacing',
    defaultContent: {
      color: '#cbd5e0',
      thickness: 1,
      style: 'solid',
      marginY: 16,
    },
  },
  {
    type: 'social',
    label: 'Social Links',
    icon: Share2,
    description: 'Footer social media follow links',
    defaultContent: {
      align: 'center',
      links: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
      },
      padding: '16px 24px',
    },
  },
  {
    type: 'footer',
    label: 'Store Footer',
    icon: Mail,
    description: 'Store address, copyright, and compliance unsubscribe link',
    defaultContent: {
      storeName: '{{store.name}}',
      address: '123 Commerce Avenue, Tech City, India',
      unsubscribeUrl: '{{store.url}}/unsubscribe',
      backgroundColor: '#121212',
      padding: '24px 24px 32px 24px',
    },
  },
];

const VARIABLE_PILLS = [
  { tag: '{{customer.name}}', label: 'Customer Name', category: 'Customer' },
  { tag: '{{customer.email}}', label: 'Customer Email', category: 'Customer' },
  { tag: '{{order.number}}', label: 'Order Number', category: 'Order' },
  { tag: '{{order.total}}', label: 'Order Total', category: 'Order' },
  { tag: '{{tracking.number}}', label: 'AWB Number', category: 'Shipping' },
  { tag: '{{tracking.carrier}}', label: 'Carrier Name', category: 'Shipping' },
  { tag: '{{tracking.url}}', label: 'Tracking Link', category: 'Shipping' },
  { tag: '{{discount.code}}', label: 'Discount Code', category: 'Marketing' },
  { tag: '{{store.name}}', label: 'Store Name', category: 'Store' },
  { tag: '{{store.url}}', label: 'Store URL', category: 'Store' },
];

const TYPOGRAPHY_PRESETS = [
  {
    label: 'Statamic Editorial (Lexend)',
    value:
      "'Lexend', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    group: 'Modern Sans',
  },
  {
    label: 'Inter Clean UI (Inter)',
    value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    group: 'Modern Sans',
  },
  {
    label: 'Plus Jakarta Sans',
    value: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    group: 'Modern Sans',
  },
  {
    label: 'Outfit Geometric',
    value: "'Outfit', ui-sans-serif, system-ui, sans-serif",
    group: 'Modern Sans',
  },
  {
    label: 'DM Sans Minimalist',
    value: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
    group: 'Modern Sans',
  },
  {
    label: 'Roboto Standard (Google)',
    value: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    group: 'Modern Sans',
  },
  {
    label: 'Playfair Display (Luxury Serif)',
    value: "'Playfair Display', Georgia, 'Times New Roman', serif",
    group: 'Editorial Serif',
  },
  {
    label: 'Lora Literary (Editorial Serif)',
    value: "'Lora', Georgia, 'Times New Roman', serif",
    group: 'Editorial Serif',
  },
  {
    label: 'Merriweather Warm Serif',
    value: "'Merriweather', Georgia, serif",
    group: 'Editorial Serif',
  },
  {
    label: 'Georgia Classic Serif',
    value: "Georgia, 'Times New Roman', serif",
    group: 'Editorial Serif',
  },
  {
    label: 'Space Grotesk (Tech Modern)',
    value: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    group: 'Display & Modern',
  },
  {
    label: 'Monospace (Code-Saver)',
    value: "'code-saver', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    group: 'Monospace',
  },
];

export const EmailTemplateBuilderStudio: React.FC<Props> = ({
  initialTemplateId,
  initialCategory,
  onClose,
}) => {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateData | null>(null);
  const [sampleVariables, setSampleVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Studio Views: 'builder' | 'split' | 'code'
  const [viewMode, setViewMode] = useState<'builder' | 'split' | 'code'>('split');
  // Preview Mode: 'desktop' | 'mobile'
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  // Active Tab in Sidebar: 'blocks' | 'design' | 'variables'
  const [sidebarTab, setSidebarTab] = useState<'blocks' | 'design' | 'variables'>('blocks');

  // Selected Block for Editing
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Template Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'MARKETING' | 'NOTIFICATION' | 'CUSTOM'>('MARKETING');
  const [trigger, setTrigger] = useState<string | null>('ORDER_CONFIRMATION');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [blocks, setBlocks] = useState<EmailTemplateBlock[]>([]);
  const [designConfig, setDesignConfig] = useState<EmailDesignConfig>({
    backgroundColor: '#121212',
    canvasBackgroundColor: '#ffffff',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    primaryColor: '#191a1b',
    textColor: '#191a1b',
    borderRadius: 8,
    maxWidth: 600,
  });

  // Compiled HTML Cache & Dynamic Height
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const [htmlLoading, setHtmlLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(750);

  const updateIframeHeight = () => {
    try {
      if (iframeRef.current) {
        const doc =
          iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc && (doc.body || doc.documentElement)) {
          const bodyH = doc.body ? doc.body.scrollHeight : 0;
          const docH = doc.documentElement ? doc.documentElement.scrollHeight : 0;
          const maxH = Math.max(bodyH, docH, 550);
          setIframeHeight(maxH + 60);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const renderedSrcDoc = useMemo(() => {
    if (!compiledHtml) return '';
    const bottomSpacingStyle = `
      <style>
        html {
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          padding-bottom: 56px !important;
          height: auto !important;
          overflow-y: visible !important;
        }
      </style>
    `;
    if (compiledHtml.includes('</head>')) {
      return compiledHtml.replace('</head>', `${bottomSpacingStyle}</head>`);
    }
    return `${bottomSpacingStyle}${compiledHtml}`;
  }, [compiledHtml]);

  // Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('alex.johnson@example.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<SendTestEmailResponse | null>(null);

  // Toast / Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  // Fetch Templates on Mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getEmailTemplates();
      setTemplates(res.templates);
      setSampleVariables(res.sampleVariables || {});

      if (res.templates.length > 0) {
        let match = res.templates[0];
        if (initialTemplateId) {
          match = res.templates.find((t) => t.id === initialTemplateId) || res.templates[0];
        } else if (initialCategory) {
          match =
            res.templates.find((t) => t.category.toUpperCase() === initialCategory.toUpperCase()) ||
            res.templates[0];
        }
        selectTemplate(match);
      }
    } catch (err: any) {
      showNotification('error', 'Failed to load email templates.');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (t: EmailTemplateData) => {
    setSelectedTemplate(t);
    setName(t.name);
    setCategory(t.category as any);
    setTrigger(t.trigger || null);
    setSubject(t.subject);
    setPreviewText(t.previewText || '');

    const parsedBlocks: EmailTemplateBlock[] = Array.isArray(t.blocks)
      ? t.blocks
      : JSON.parse(t.blocksJson || '[]');
    setBlocks(parsedBlocks);

    const parsedConfig: EmailDesignConfig =
      t.designConfig || JSON.parse(t.designConfigJson || '{}');
    setDesignConfig({
      backgroundColor: parsedConfig.backgroundColor || '#121212',
      canvasBackgroundColor: parsedConfig.canvasBackgroundColor || '#ffffff',
      fontFamily:
        parsedConfig.fontFamily ||
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      primaryColor: parsedConfig.primaryColor || '#191a1b',
      textColor: parsedConfig.textColor || '#191a1b',
      borderRadius: parsedConfig.borderRadius !== undefined ? parsedConfig.borderRadius : 8,
      maxWidth: parsedConfig.maxWidth || 600,
    });

    if (parsedBlocks.length > 0) {
      setSelectedBlockId(parsedBlocks[0].id);
    } else {
      setSelectedBlockId(null);
    }
  };

  // Live HTML re-render debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompiledHtml();
    }, 250);
    return () => clearTimeout(timer);
  }, [blocks, designConfig, subject, previewText]);

  useEffect(() => {
    const t1 = setTimeout(updateIframeHeight, 150);
    const t2 = setTimeout(updateIframeHeight, 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [compiledHtml, previewViewport, blocks, designConfig]);

  const fetchCompiledHtml = async () => {
    setHtmlLoading(true);
    try {
      const res = await cmsService.renderEmailBlocks({
        blocks,
        designConfig,
        variables: sampleVariables,
        previewText,
        subject,
      });
      setCompiledHtml(res.html);
    } catch (err) {
      console.error('Compile error:', err);
    } finally {
      setHtmlLoading(false);
    }
  };

  // Block Manipulation Functions
  const addBlock = (type: EmailBlockType) => {
    const blockDef = AVAILABLE_BLOCKS.find((b) => b.type === type);
    if (!blockDef) return;

    const newBlock: EmailTemplateBlock = {
      id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      content: JSON.parse(JSON.stringify(blockDef.defaultContent)),
      styles: {},
    };

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const removeBlock = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      const remaining = blocks.filter((b) => b.id !== id);
      setSelectedBlockId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const duplicateBlock = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;

    const target = blocks[index];
    const clone: EmailTemplateBlock = {
      id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: target.type,
      content: JSON.parse(JSON.stringify(target.content)),
      styles: JSON.parse(JSON.stringify(target.styles || {})),
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, clone);
    setBlocks(newBlocks);
    setSelectedBlockId(clone.id);
  };

  const moveBlock = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    setBlocks(newBlocks);
  };

  const updateSelectedBlockContent = (field: string, value: any) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBlockId) return b;
        return {
          ...b,
          content: {
            ...b.content,
            [field]: value,
          },
        };
      }),
    );
  };

  const updateProductItem = (itemIndex: number, field: string, value: any) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBlockId) return b;
        const currentItems = [...(b.content.items || [])];
        if (!currentItems[itemIndex]) return b;
        currentItems[itemIndex] = {
          ...currentItems[itemIndex],
          [field]: value,
        };
        return {
          ...b,
          content: {
            ...b.content,
            items: currentItems,
          },
        };
      }),
    );
  };

  const updateSocialLink = (network: string, url: string) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBlockId) return b;
        return {
          ...b,
          content: {
            ...b.content,
            links: {
              ...(b.content.links || {}),
              [network]: url,
            },
          },
        };
      }),
    );
  };

  // Save Template to Backend
  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      showNotification('error', 'Please enter a template name.');
      return;
    }
    if (!subject.trim()) {
      showNotification('error', 'Please enter an email subject line.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        category,
        trigger: trigger || null,
        subject,
        previewText,
        blocksJson: JSON.stringify(blocks),
        designConfigJson: JSON.stringify(designConfig),
        isActive: true,
      };

      if (selectedTemplate?.id) {
        const res = await cmsService.updateEmailTemplate(selectedTemplate.id, payload);
        showNotification('success', `Template "${name}" saved successfully!`);
        setTemplates((prev) =>
          prev.map((t) => (t.id === selectedTemplate.id ? { ...t, ...res.template } : t)),
        );
      } else {
        const res = await cmsService.createEmailTemplate(payload);
        showNotification('success', `New template "${name}" created!`);
        setTemplates((prev) => [res.template, ...prev]);
        setSelectedTemplate(res.template);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      showNotification('error', 'Please enter a valid recipient email.');
      return;
    }

    setSendingTest(true);
    try {
      if (selectedTemplate?.id) {
        const res = await cmsService.sendTestEmail(selectedTemplate.id, {
          recipientEmail: testRecipient,
          sampleData: sampleVariables,
        });
        setTestResult(res);
        showNotification('success', `Test email dispatched to ${testRecipient}!`);
      } else {
        showNotification('error', 'Please save the template first before sending test emails.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to dispatch test email.');
    } finally {
      setSendingTest(false);
    }
  };

  // Create Blank Template
  const handleNewTemplate = () => {
    const blank: EmailTemplateData = {
      id: '',
      name: 'Untitled Custom Template',
      slug: `custom-${Date.now()}`,
      category: 'MARKETING',
      trigger: 'PROMOTIONAL',
      subject: 'Exciting News from {{store.name}} ✨',
      previewText: 'Open for exclusive deals and updates.',
      blocksJson: '[]',
      designConfigJson: '{}',
      isActive: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedTemplate(blank);
    setName(blank.name);
    setCategory('MARKETING');
    setTrigger('PROMOTIONAL');
    setSubject(blank.subject);
    setPreviewText(blank.previewText || '');
    setBlocks([
      {
        id: `b_hdr_${Date.now()}`,
        type: 'header',
        content: { brandName: '{{store.name}}', align: 'center', padding: '24px 24px 16px 24px' },
      },
      {
        id: `b_hero_${Date.now()}`,
        type: 'hero',
        content: {
          title: 'New Drop Just Landed 🚀',
          subtitle: 'Explore fresh styles curated for your everyday aesthetic.',
          backgroundColor: '#191a1b',
          textColor: '#ffffff',
          align: 'center',
        },
      },
      {
        id: `b_btn_${Date.now()}`,
        type: 'button',
        content: {
          text: 'Discover Now →',
          url: '{{store.url}}',
          backgroundColor: '#191a1b',
          textColor: '#00E5FF',
          align: 'center',
        },
      },
      {
        id: `b_ftr_${Date.now()}`,
        type: 'footer',
        content: { storeName: '{{store.name}}', unsubscribeUrl: '{{store.url}}/unsubscribe' },
      },
    ]);
  };

  // Reset to Presets
  const handleResetPresets = async () => {
    if (
      confirm(
        'Reset all templates back to standard official presets? Custom changes to defaults will be refreshed.',
      )
    ) {
      setLoading(true);
      try {
        const res = await cmsService.resetEmailPresets();
        setTemplates(res.templates);
        if (res.templates.length > 0) {
          selectTemplate(res.templates[0]);
        }
        showNotification('success', 'Presets restored successfully!');
      } catch (err) {
        showNotification('error', 'Failed to reset presets.');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-8">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Loading Email Template Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold transition-all transform animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
              : 'bg-rose-50 text-rose-900 border-rose-300 shadow-rose-500/10'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ─── STUDIO TOP BAR ────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 shrink-0 gap-3 z-20 shadow-2xs">
        {/* Left: Close Button, Logo & Template Name */}
        <div className="flex items-center gap-3">
          {/* Prominent Close Modal Button */}
          <button
            onClick={handleClose}
            title="Close Email Template Builder"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
          >
            <X className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* S-Mark Brand Icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-sans font-black text-sm shrink-0 shadow-md shadow-indigo-500/20">
            S
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Name..."
                className="bg-transparent text-sm sm:text-base font-extrabold text-slate-900 hover:bg-slate-50 focus:bg-white px-2 py-0.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-all w-48 sm:w-64"
              />
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  category === 'MARKETING'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : category === 'NOTIFICATION'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {category}
              </span>
              {trigger && (
                <span className="hidden xl:inline-flex text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  ⚡ {trigger}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 px-2 font-medium">
              <span>{templates.length} templates</span>
              <span>&bull;</span>
              <button
                onClick={handleNewTemplate}
                className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
              >
                <Plus className="w-3 h-3" /> New Template
              </button>
            </div>
          </div>
        </div>

        {/* Center: Template Quick Switcher */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500">Switch:</span>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const match = templates.find((t) => t.id === e.target.value);
              if (match) selectTemplate(match);
            }}
            className="bg-white text-xs font-bold text-slate-900 rounded-lg px-2.5 py-1 border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.isDefault ? '⭐ ' : ''}
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Viewport Switcher, View Modes & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setPreviewViewport('desktop')}
              title="Desktop Preview (Max Width)"
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                previewViewport === 'desktop'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewViewport('mobile')}
              title="Mobile Preview (375px)"
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                previewViewport === 'mobile'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Modes */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'builder'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3 h-3" />
              <span className="hidden sm:inline">Builder</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'code'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3 h-3" />
              <span className="hidden sm:inline">HTML</span>
            </button>
          </div>

          {/* Test Email Button */}
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Send Test</span>
          </button>

          {/* Filled Primary Save CTA */}
          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </header>

      {/* ─── EMAIL META DETAILS BAR ────────────────────────────────────────── */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs shrink-0 shadow-2xs">
        <div className="flex-1 min-w-[220px] flex items-center gap-2">
          <span className="font-extrabold text-slate-600 shrink-0">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Your order #{{order.number}} is confirmed! 🚀"
            className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 font-medium px-3 py-1.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-xs transition shadow-2xs"
          />
        </div>

        <div className="flex-1 min-w-[180px] flex items-center gap-2">
          <span className="font-extrabold text-slate-600 shrink-0">Preheader:</span>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Inbox preview snippet..."
            className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 font-medium px-3 py-1.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-xs transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-slate-600">Type:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="bg-slate-50 hover:bg-white focus:bg-white text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            <option value="MARKETING">Marketing Campaign</option>
            <option value="NOTIFICATION">Transactional Notification</option>
            <option value="CUSTOM">Custom Layout</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-slate-600">Trigger:</span>
          <select
            value={trigger || ''}
            onChange={(e) => setTrigger(e.target.value || null)}
            className="bg-slate-50 hover:bg-white focus:bg-white text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            <option value="">None (Broadcast)</option>
            <option value="ORDER_CONFIRMATION">Order Confirmation</option>
            <option value="ORDER_SHIPPED">Order Shipped</option>
            <option value="WELCOME">Welcome Series</option>
            <option value="ABANDONED_CART">Abandoned Cart Recovery</option>
            <option value="REVIEW_REQUEST">Review Request</option>
            <option value="PROMOTIONAL">Flash Sale / Promo</option>
            <option value="PASSWORD_RESET">Password Reset</option>
          </select>
        </div>
      </div>

      {/* ─── MAIN WORKSPACE (LEFT: PALETTE / CENTER: PREVIEW / RIGHT: INSPECTOR) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: BLOCK PALETTE & SETTINGS (w-72 lg:w-80) ────────────────── */}
        <aside className="w-72 lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-2xs">
          {/* Sidebar Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5">
            <button
              onClick={() => setSidebarTab('blocks')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'blocks'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Blocks ({blocks.length})
            </button>
            <button
              onClick={() => setSidebarTab('design')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'design'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Theme
            </button>
            <button
              onClick={() => setSidebarTab('variables')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'variables'
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Variables
            </button>
          </div>

          {/* Sidebar Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
            {/* ── TAB 1: BLOCKS & CANVAS TREE ── */}
            {sidebarTab === 'blocks' && (
              <>
                {/* Add Block Palette */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    Insert Block
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_BLOCKS.map((b) => {
                      const Icon = b.icon;
                      return (
                        <button
                          key={b.type}
                          onClick={() => addBlock(b.type)}
                          className="flex items-start gap-2 p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group shadow-2xs cursor-pointer"
                        >
                          <div className="p-1.5 bg-white group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-lg border border-slate-200 group-hover:border-indigo-600 shadow-2xs transition-all shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                              {b.label}
                            </div>
                            <div className="text-[9px] text-slate-500 leading-tight truncate">
                              {b.type}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Blocks Layer Tree */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Email Structure ({blocks.length})
                    </h4>
                    {blocks.length > 0 && (
                      <button
                        onClick={() => setBlocks([])}
                        className="text-[10px] text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-bold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {blocks.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-xs">
                      <Mail className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      Click any block above to assemble your email.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {blocks.map((block, index) => {
                        const blockDef = AVAILABLE_BLOCKS.find((b) => b.type === block.type);
                        const Icon = blockDef?.icon || Layout;
                        const isSelected = selectedBlockId === block.id;

                        return (
                          <div
                            key={block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-mono text-slate-400 font-bold w-3.5">
                                {index + 1}
                              </span>
                              <div
                                className={`p-1.5 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate text-xs font-semibold">{blockDef?.label || block.type}</span>
                            </div>

                            {/* Block Controls */}
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={(e) => moveBlock(index, 'up', e)}
                                disabled={index === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => moveBlock(index, 'down', e)}
                                disabled={index === blocks.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => duplicateBlock(block.id, e)}
                                title="Duplicate"
                                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => removeBlock(block.id, e)}
                                title="Delete Block"
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TAB 2: DESIGN CONFIGURATION ── */}
            {sidebarTab === 'design' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                    Canvas Theme
                  </h4>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1">
                    Backdrop Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.backgroundColor || '#f1f5f9'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, backgroundColor: e.target.value })
                      }
                      className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.backgroundColor || '#f1f5f9'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, backgroundColor: e.target.value })
                      }
                      className="flex-1 bg-slate-50 hover:bg-white focus:bg-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-900 font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1">
                    Card Container Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.canvasBackgroundColor || '#ffffff'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, canvasBackgroundColor: e.target.value })
                      }
                      className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.canvasBackgroundColor || '#ffffff'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, canvasBackgroundColor: e.target.value })
                      }
                      className="flex-1 bg-slate-50 hover:bg-white focus:bg-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-900 font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1">
                    Primary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.primaryColor || '#4f46e5'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, primaryColor: e.target.value })
                      }
                      className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.primaryColor || '#4f46e5'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, primaryColor: e.target.value })
                      }
                      className="flex-1 bg-slate-50 hover:bg-white focus:bg-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-900 font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1">
                    Default Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.textColor || '#0f172a'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, textColor: e.target.value })
                      }
                      className="w-8 h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.textColor || '#0f172a'}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, textColor: e.target.value })
                      }
                      className="flex-1 bg-slate-50 hover:bg-white focus:bg-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-900 font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1">
                    Corner Radius ({designConfig.borderRadius || 8}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="2"
                    value={designConfig.borderRadius !== undefined ? designConfig.borderRadius : 8}
                    onChange={(e) =>
                      setDesignConfig({ ...designConfig, borderRadius: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 font-extrabold block mb-1">
                    Typography System (Font Family)
                  </label>
                  <select
                    value={designConfig.fontFamily || ''}
                    onChange={(e) =>
                      setDesignConfig({ ...designConfig, fontFamily: e.target.value })
                    }
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                  >
                    <optgroup label="Modern Sans-Serif">
                      {TYPOGRAPHY_PRESETS.filter((f) => f.group === 'Modern Sans').map((f) => (
                        <option key={f.label} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Editorial Serif">
                      {TYPOGRAPHY_PRESETS.filter((f) => f.group === 'Editorial Serif').map((f) => (
                        <option key={f.label} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Display & Tech">
                      {TYPOGRAPHY_PRESETS.filter((f) => f.group !== 'Modern Sans' && f.group !== 'Editorial Serif').map((f) => (
                        <option key={f.label} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <button
                    onClick={handleResetPresets}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                    Restore Default Presets
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 3: DYNAMIC VARIABLES ── */}
            {sidebarTab === 'variables' && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Dynamic Variables
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Click any tag to copy it. Paste into any text field or button URL.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {VARIABLE_PILLS.map((p) => (
                    <button
                      key={p.tag}
                      onClick={() => {
                        navigator.clipboard.writeText(p.tag);
                        showNotification('success', `Copied ${p.tag} to clipboard!`);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 text-left transition-all group cursor-pointer shadow-2xs"
                    >
                      <div>
                        <div className="font-mono text-[11px] text-slate-900 font-bold group-hover:text-indigo-900">
                          {p.tag}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.label}</div>
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {p.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── CENTER: LIVE DUAL PREVIEW OR HTML CODE (flex-1) ───────────────── */}
        <main className="flex-1 bg-slate-100/90 [radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] flex flex-col overflow-hidden min-w-0">
          {viewMode === 'code' ? (
            /* HTML Code View */
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 bg-white px-4 py-2.5 rounded-xl shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Compiled Email HTML (Ready to export into any ESP)</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(compiledHtml);
                    showNotification('success', 'Email HTML copied to clipboard!');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy HTML
                </button>
              </div>
              <textarea
                readOnly
                value={compiledHtml}
                className="flex-1 w-full bg-white font-mono text-xs text-slate-900 p-4 rounded-xl border border-slate-200 focus:outline-none custom-scrollbar select-all shadow-2xs leading-relaxed"
              />
            </div>
          ) : (
            /* Live Iframe Sandbox Preview (Center Max-Width Canvas) */
            <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 overflow-y-auto scrollbar-thin">
              {/* Preview Container Frame (Dynamic Max-Width or Mobile) */}
              <div
                style={{
                  width: previewViewport === 'desktop' ? '100%' : '385px',
                  maxWidth: previewViewport === 'desktop' ? '100%' : '385px',
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow:
                    'rgba(15, 23, 42, 0.08) 0px 0px 0px 1px, rgba(15, 23, 42, 0.12) 0px 20px 40px -12px',
                }}
                className="w-full my-2 mb-20 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl shrink-0 overflow-hidden"
              >
                {/* Simulated Email Client Browser Header */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-[11px] font-bold text-slate-800">
                      {previewViewport === 'desktop'
                        ? 'Desktop Preview (Full Width)'
                        : 'Mobile Preview (375px)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {htmlLoading ? (
                      <span className="text-[10px] text-indigo-600 animate-pulse font-bold">
                        Updating...
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        Live Sandbox
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated Inbox Subject line */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-200 text-xs">
                  <div className="font-extrabold text-slate-900 truncate">
                    Subject: {subject || 'No subject specified'}
                  </div>
                  {previewText && (
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                      Preheader: {previewText}
                    </div>
                  )}
                </div>

                {/* Sandboxed Iframe with dynamic height and bottom padding */}
                <div className="bg-slate-100 flex justify-center p-3 pb-8">
                  <iframe
                    ref={iframeRef}
                    onLoad={updateIframeHeight}
                    title="Live Email Preview"
                    srcDoc={renderedSrcDoc}
                    className="w-full border-0 rounded-xl shadow-2xs transition-all"
                    style={{
                      height: `${iframeHeight}px`,
                      minHeight: '650px',
                      backgroundColor: designConfig.backgroundColor || '#f1f5f9',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ─── RIGHT: ACTIVE BLOCK INSPECTOR (w-80 lg:w-[340px]) ─────────────── */}
        <aside className="w-80 lg:w-[340px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Block Inspector
            </h3>
            {selectedBlock && (
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {selectedBlock.type}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {!selectedBlock ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">
                Select any block from the left structure or click a section to edit its properties.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Block Inspector */}
                {selectedBlock.type === 'header' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Brand Name / Title
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.brandName || ''}
                        onChange={(e) => updateSelectedBlockContent('brandName', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Logo Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.logoUrl || ''}
                        onChange={(e) => updateSelectedBlockContent('logoUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Brand Font)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || '20px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="16px">16px - Subtle</option>
                          <option value="18px">18px - Medium</option>
                          <option value="20px">20px - Standard</option>
                          <option value="24px">24px - Large</option>
                          <option value="28px">28px - Headline</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Weight
                        </label>
                        <select
                          value={selectedBlock.content.fontWeight || '800'}
                          onChange={(e) => updateSelectedBlockContent('fontWeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="500">Medium (500)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Alignment
                      </label>
                      <select
                        value={selectedBlock.content.align || 'center'}
                        onChange={(e) => updateSelectedBlockContent('align', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Hero Block Inspector */}
                {selectedBlock.type === 'hero' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Hero Headline
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ''}
                        onChange={(e) => updateSelectedBlockContent('title', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Headline Typography (Font)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Headline Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || selectedBlock.content.titleFontSize || '26px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="20px">20px - Small</option>
                          <option value="24px">24px - Medium</option>
                          <option value="26px">26px - Standard</option>
                          <option value="32px">32px - Large</option>
                          <option value="38px">38px - Impact Display</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Headline Weight
                        </label>
                        <select
                          value={selectedBlock.content.fontWeight || '800'}
                          onChange={(e) => updateSelectedBlockContent('fontWeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="300">Light (300)</option>
                          <option value="400">Regular (400)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Subheadline / Description
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.content.subtitle || ''}
                        onChange={(e) => updateSelectedBlockContent('subtitle', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Background Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.imageUrl || ''}
                        onChange={(e) => updateSelectedBlockContent('imageUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          BG Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.backgroundColor || '#1e293b'}
                          onChange={(e) =>
                            updateSelectedBlockContent('backgroundColor', e.target.value)
                          }
                          className="w-full h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.textColor || '#ffffff'}
                          onChange={(e) => updateSelectedBlockContent('textColor', e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Text Block Inspector */}
                {selectedBlock.type === 'text' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Body Content (HTML & Variables Supported)
                      </label>
                      <textarea
                        rows={6}
                        value={selectedBlock.content.text || ''}
                        onChange={(e) => updateSelectedBlockContent('text', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white font-mono text-xs text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Font Family)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || '15px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="12px">12px - Tiny</option>
                          <option value="13px">13px - Small</option>
                          <option value="14px">14px - Compact</option>
                          <option value="15px">15px - Standard</option>
                          <option value="16px">16px - Medium</option>
                          <option value="18px">18px - Large</option>
                          <option value="20px">20px - Lead</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Weight
                        </label>
                        <select
                          value={selectedBlock.content.fontWeight || '400'}
                          onChange={(e) => updateSelectedBlockContent('fontWeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="300">Light (300)</option>
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Line Height
                        </label>
                        <select
                          value={selectedBlock.content.lineHeight || '1.6'}
                          onChange={(e) => updateSelectedBlockContent('lineHeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="1.3">1.3 - Compact</option>
                          <option value="1.4">1.4 - Normal</option>
                          <option value="1.6">1.6 - Balanced</option>
                          <option value="1.8">1.8 - Relaxed</option>
                          <option value="2.0">2.0 - Spacious</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Align
                        </label>
                        <select
                          value={selectedBlock.content.align || 'left'}
                          onChange={(e) => updateSelectedBlockContent('align', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Button Block Inspector */}
                {selectedBlock.type === 'button' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.text || ''}
                        onChange={(e) => updateSelectedBlockContent('text', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Destination URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.url || ''}
                        onChange={(e) => updateSelectedBlockContent('url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Button Font)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || '15px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="13px">13px - Compact</option>
                          <option value="15px">15px - Standard</option>
                          <option value="17px">17px - Large</option>
                          <option value="19px">19px - Extra Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Weight
                        </label>
                        <select
                          value={selectedBlock.content.fontWeight || '600'}
                          onChange={(e) => updateSelectedBlockContent('fontWeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Button Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.backgroundColor || '#0f172a'}
                          onChange={(e) =>
                            updateSelectedBlockContent('backgroundColor', e.target.value)
                          }
                          className="w-full h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.textColor || '#ffffff'}
                          onChange={(e) => updateSelectedBlockContent('textColor', e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Product Showcase Inspector */}
                {selectedBlock.type === 'products' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ''}
                        onChange={(e) => updateSelectedBlockContent('title', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Font Family)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Headline Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || selectedBlock.content.titleFontSize || '18px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="16px">16px - Subtle</option>
                          <option value="18px">18px - Standard</option>
                          <option value="20px">20px - Large</option>
                          <option value="24px">24px - Headline</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Headline Weight
                        </label>
                        <select
                          value={selectedBlock.content.fontWeight || '700'}
                          onChange={(e) => updateSelectedBlockContent('fontWeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="500">Medium (500)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-xs text-slate-700 font-extrabold block">
                        Showcase Items ({(selectedBlock.content.items || []).length})
                      </label>
                      {(selectedBlock.content.items || []).map((item: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs shadow-2xs"
                        >
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span>Item #{i + 1}</span>
                            <span className="text-[10px] bg-white font-extrabold text-indigo-700 px-2 py-0.5 rounded-md border border-slate-200">
                              {item.badge || 'CARD'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-600 font-bold block mb-0.5">Product Title</span>
                            <input
                              type="text"
                              value={item.name || ''}
                              onChange={(e) => updateProductItem(i, 'name', e.target.value)}
                              className="w-full bg-white text-xs text-slate-900 p-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none font-medium"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-600 font-bold block mb-0.5">Price</span>
                              <input
                                type="text"
                                value={item.price || ''}
                                onChange={(e) => updateProductItem(i, 'price', e.target.value)}
                                className="w-full bg-white text-xs text-slate-900 p-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none font-medium"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-600 font-bold block mb-0.5">Original</span>
                              <input
                                type="text"
                                value={item.originalPrice || ''}
                                onChange={(e) => updateProductItem(i, 'originalPrice', e.target.value)}
                                className="w-full bg-white text-xs text-slate-900 p-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-600 font-bold block mb-0.5">Image URL</span>
                            <input
                              type="text"
                              value={item.imageUrl || ''}
                              onChange={(e) => updateProductItem(i, 'imageUrl', e.target.value)}
                              className="w-full bg-white text-xs text-slate-900 p-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none font-medium"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Coupon Block Inspector */}
                {selectedBlock.type === 'coupon' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.code || ''}
                        onChange={(e) => updateSelectedBlockContent('code', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white font-mono text-xs text-slate-900 font-black p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Discount Headline
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.discountText || ''}
                        onChange={(e) => updateSelectedBlockContent('discountText', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Font Family)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Headline Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || '22px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="18px">18px - Compact</option>
                          <option value="22px">22px - Standard</option>
                          <option value="26px">26px - Large</option>
                          <option value="30px">30px - Extra Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Headline Weight
                        </label>
                        <select
                          value={selectedBlock.content.fontWeight || '800'}
                          onChange={(e) => updateSelectedBlockContent('fontWeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Expiry Terms
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.expiryText || ''}
                        onChange={(e) => updateSelectedBlockContent('expiryText', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Button CTA Text
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.buttonText || ''}
                        onChange={(e) => updateSelectedBlockContent('buttonText', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {/* Order Summary Inspector */}
                {selectedBlock.type === 'order-summary' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Font Family)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Order Number Tag
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.orderNumber || ''}
                        onChange={(e) => updateSelectedBlockContent('orderNumber', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-mono font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Order Total Tag / Amount
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.total || ''}
                        onChange={(e) => updateSelectedBlockContent('total', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Order Status Badge
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.status || ''}
                        onChange={(e) => updateSelectedBlockContent('status', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {/* Tracking Card Inspector */}
                {selectedBlock.type === 'tracking-card' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Font Family)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Carrier Name
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.carrier || ''}
                        onChange={(e) => updateSelectedBlockContent('carrier', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        AWB Tracking Number
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.awb || ''}
                        onChange={(e) => updateSelectedBlockContent('awb', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-mono font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Tracking URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.trackingUrl || ''}
                        onChange={(e) => updateSelectedBlockContent('trackingUrl', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {/* Divider Block Inspector */}
                {selectedBlock.type === 'divider' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Divider Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.color || '#cbd5e1'}
                          onChange={(e) => updateSelectedBlockContent('color', e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Thickness ({selectedBlock.content.thickness || 1}px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={selectedBlock.content.thickness || 1}
                          onChange={(e) => updateSelectedBlockContent('thickness', Number(e.target.value))}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Divider Style
                      </label>
                      <select
                        value={selectedBlock.content.style || 'solid'}
                        onChange={(e) => updateSelectedBlockContent('style', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="solid">Solid Line</option>
                        <option value="dashed">Dashed Line</option>
                        <option value="dotted">Dotted Line</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Social Links Inspector */}
                {selectedBlock.type === 'social' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.links?.instagram || ''}
                        onChange={(e) => updateSocialLink('instagram', e.target.value)}
                        placeholder="https://instagram.com/yourstore"
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Facebook Page URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.links?.facebook || ''}
                        onChange={(e) => updateSocialLink('facebook', e.target.value)}
                        placeholder="https://facebook.com/yourstore"
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Twitter / X URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.links?.twitter || ''}
                        onChange={(e) => updateSocialLink('twitter', e.target.value)}
                        placeholder="https://x.com/yourstore"
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Alignment
                      </label>
                      <select
                        value={selectedBlock.content.align || 'center'}
                        onChange={(e) => updateSelectedBlockContent('align', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Footer Inspector */}
                {selectedBlock.type === 'footer' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.storeName || ''}
                        onChange={(e) => updateSelectedBlockContent('storeName', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Postal Address
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.address || ''}
                        onChange={(e) => updateSelectedBlockContent('address', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Typography (Font Family)
                      </label>
                      <select
                        value={selectedBlock.content.fontFamily || ''}
                        onChange={(e) => updateSelectedBlockContent('fontFamily', e.target.value)}
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                      >
                        <option value="">Default (Inherit Theme)</option>
                        {TYPOGRAPHY_PRESETS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Font Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || '12px'}
                          onChange={(e) => updateSelectedBlockContent('fontSize', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="11px">11px - Micro</option>
                          <option value="12px">12px - Standard</option>
                          <option value="13px">13px - Medium</option>
                          <option value="14px">14px - Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-extrabold block mb-1">
                          Line Height
                        </label>
                        <select
                          value={selectedBlock.content.lineHeight || '1.6'}
                          onChange={(e) => updateSelectedBlockContent('lineHeight', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-bold p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                        >
                          <option value="1.4">1.4 - Compact</option>
                          <option value="1.6">1.6 - Standard</option>
                          <option value="1.8">1.8 - Relaxed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-extrabold block mb-1">
                        Unsubscribe URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.unsubscribeUrl || ''}
                        onChange={(e) =>
                          updateSelectedBlockContent('unsubscribeUrl', e.target.value)
                        }
                        className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-medium p-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {/* Common Delete Action */}
                <div className="pt-3 border-t border-slate-200">
                  <button
                    onClick={() => removeBlock(selectedBlock.id)}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete This Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── TEST EMAIL MODAL ─────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-2xs">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Send Simulated Test Email</h3>
              </div>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Verify how this template renders in inbox environments with sample dynamic customer,
              order & tracking tags.
            </p>

            <div>
              <label className="text-xs text-slate-700 font-extrabold block mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="merchant@example.com"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition shadow-2xs font-medium"
              />
            </div>

            {testResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Test Email Simulated!
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Dispatched at {new Date(testResult.dispatchedAt).toLocaleTimeString()} to{' '}
                  <strong className="text-emerald-950">{testResult.recipientEmail}</strong>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingTest ? 'Sending...' : 'Send Test Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateBuilderStudio;

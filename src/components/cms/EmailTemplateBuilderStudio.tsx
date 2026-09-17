"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Bell,
  Layers,
  Image as ImageIcon,
  Type,
  ExternalLink,
  Percent,
  Truck,
  FileText,
  Share2,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import { cmsService } from "@/src/services/cmsService";
import {
  EmailTemplateData,
  EmailTemplateBlock,
  EmailBlockType,
  EmailDesignConfig,
  SendTestEmailResponse,
} from "@/src/types";

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
    type: "header",
    label: "Header / Logo",
    icon: ImageIcon,
    description: "Store logo, brand name and header spacing",
    defaultContent: {
      brandName: "{{store.name}}",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
      align: "center",
      padding: "24px 24px 16px 24px",
    },
  },
  {
    type: "hero",
    label: "Hero Banner",
    icon: Layout,
    description: "High-impact headline banner with optional image",
    defaultContent: {
      title: "Special Announcement For You 🎉",
      subtitle: "Discover exclusive offers and premium new arrivals crafted for you.",
      imageUrl: "",
      backgroundColor: "#4f46e5",
      textColor: "#ffffff",
      align: "center",
    },
  },
  {
    type: "text",
    label: "Rich Text",
    icon: Type,
    description: "Personalized text message, greeting, or body copy",
    defaultContent: {
      text: "<p>Hi <strong>{{customer.name}}</strong>,</p><p>We are delighted to share our latest updates with you. Everything is packed and prepared with love.</p>",
      fontSize: "15px",
      lineHeight: "1.6",
      color: "#334155",
      align: "left",
      padding: "16px 24px",
    },
  },
  {
    type: "button",
    label: "CTA Button",
    icon: ExternalLink,
    description: "Eye-catching clickable action button",
    defaultContent: {
      text: "Shop the Collection Now →",
      url: "{{store.url}}/collections/all",
      backgroundColor: "#4f46e5",
      textColor: "#ffffff",
      borderRadius: 8,
      align: "center",
      fullWidth: false,
      padding: "16px 24px",
    },
  },
  {
    type: "products",
    label: "Product Showcase",
    icon: ShoppingBag,
    description: "Curated 2-column or 4-item product showcase",
    defaultContent: {
      title: "Handpicked For You",
      items: [
        {
          name: "Minimalist Linen Shirt",
          price: "₹1,899",
          originalPrice: "₹2,499",
          imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80",
          url: "{{store.url}}/products/linen-shirt",
          badge: "BESTSELLER",
        },
        {
          name: "Artisan Leather Wallet",
          price: "₹899",
          originalPrice: "₹1,299",
          imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
          url: "{{store.url}}/products/leather-wallet",
          badge: "POPULAR",
        },
      ],
      padding: "20px 24px",
    },
  },
  {
    type: "coupon",
    label: "Discount Coupon",
    icon: Percent,
    description: "Vibrant promotional voucher badge with copy code",
    defaultContent: {
      code: "SAVE20",
      discountText: "20% OFF YOUR NEXT ORDER",
      expiryText: "Use at checkout. Valid for 48 hours.",
      buttonText: "Claim Discount Now",
      buttonUrl: "{{store.url}}/discount/SAVE20",
      padding: "20px 24px",
    },
  },
  {
    type: "order-summary",
    label: "Order Summary",
    icon: FileText,
    description: "Clean transactional order receipt with live tags",
    defaultContent: {
      orderNumber: "{{order.number}}",
      total: "{{order.total}}",
      status: "Paid & Processing",
      padding: "16px 24px",
    },
  },
  {
    type: "tracking-card",
    label: "Shipment Tracking",
    icon: Truck,
    description: "Carrier, AWB and 1-click live parcel tracking link",
    defaultContent: {
      carrier: "{{tracking.carrier}}",
      awb: "{{tracking.number}}",
      trackingUrl: "{{tracking.url}}",
      estimatedDelivery: "{{tracking.estimated_delivery}}",
      padding: "16px 24px",
    },
  },
  {
    type: "divider",
    label: "Divider / Spacer",
    icon: Layers,
    description: "Subtle separator line with configurable spacing",
    defaultContent: {
      color: "#e2e8f0",
      thickness: 1,
      style: "solid",
      marginY: 16,
    },
  },
  {
    type: "social",
    label: "Social Links",
    icon: Share2,
    description: "Footer social media follow links",
    defaultContent: {
      align: "center",
      links: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
      },
      padding: "16px 24px",
    },
  },
  {
    type: "footer",
    label: "Store Footer",
    icon: Mail,
    description: "Store address, copyright, and compliance unsubscribe link",
    defaultContent: {
      storeName: "{{store.name}}",
      address: "123 Commerce Avenue, Tech City, India",
      unsubscribeUrl: "{{store.url}}/unsubscribe",
      backgroundColor: "#f8fafc",
      padding: "24px 24px 32px 24px",
    },
  },
];

const VARIABLE_PILLS = [
  { tag: "{{customer.name}}", label: "Customer Name", category: "Customer" },
  { tag: "{{customer.email}}", label: "Customer Email", category: "Customer" },
  { tag: "{{order.number}}", label: "Order Number", category: "Order" },
  { tag: "{{order.total}}", label: "Order Total", category: "Order" },
  { tag: "{{tracking.number}}", label: "AWB Number", category: "Shipping" },
  { tag: "{{tracking.carrier}}", label: "Carrier Name", category: "Shipping" },
  { tag: "{{tracking.url}}", label: "Tracking Link", category: "Shipping" },
  { tag: "{{discount.code}}", label: "Discount Code", category: "Marketing" },
  { tag: "{{store.name}}", label: "Store Name", category: "Store" },
  { tag: "{{store.url}}", label: "Store URL", category: "Store" },
];

export const EmailTemplateBuilderStudio: React.FC<Props> = ({
  initialTemplateId,
  initialCategory,
  onClose,
}) => {
  const [templates, setTemplates] = useState<EmailTemplateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateData | null>(null);
  const [sampleVariables, setSampleVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Studio Views: 'builder' | 'split' | 'code'
  const [viewMode, setViewMode] = useState<"builder" | "split" | "code">("split");
  // Preview Mode: 'desktop' | 'mobile'
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  // Active Tab in Sidebar: 'blocks' | 'design' | 'variables'
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "design" | "variables">("blocks");

  // Selected Block for Editing
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Template Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"MARKETING" | "NOTIFICATION" | "CUSTOM">("MARKETING");
  const [trigger, setTrigger] = useState<string | null>("ORDER_CONFIRMATION");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [blocks, setBlocks] = useState<EmailTemplateBlock[]>([]);
  const [designConfig, setDesignConfig] = useState<EmailDesignConfig>({
    backgroundColor: "#f4f6f8",
    canvasBackgroundColor: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    primaryColor: "#6366f1",
    textColor: "#334155",
    borderRadius: 12,
    maxWidth: 600,
  });

  // Compiled HTML Cache
  const [compiledHtml, setCompiledHtml] = useState<string>("");
  const [htmlLoading, setHtmlLoading] = useState(false);

  // Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState("alex.johnson@example.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<SendTestEmailResponse | null>(null);

  // Toast / Notification
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(
    null
  );

  const showNotification = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
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
            res.templates.find(
              (t) => t.category.toUpperCase() === initialCategory.toUpperCase()
            ) || res.templates[0];
        }
        selectTemplate(match);
      }
    } catch (err: any) {
      showNotification("error", "Failed to load email templates.");
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
    setPreviewText(t.previewText || "");

    const parsedBlocks: EmailTemplateBlock[] = Array.isArray(t.blocks)
      ? t.blocks
      : JSON.parse(t.blocksJson || "[]");
    setBlocks(parsedBlocks);

    const parsedConfig: EmailDesignConfig = t.designConfig || JSON.parse(t.designConfigJson || "{}");
    setDesignConfig({
      backgroundColor: parsedConfig.backgroundColor || "#f4f6f8",
      canvasBackgroundColor: parsedConfig.canvasBackgroundColor || "#ffffff",
      fontFamily:
        parsedConfig.fontFamily ||
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      primaryColor: parsedConfig.primaryColor || "#6366f1",
      textColor: parsedConfig.textColor || "#334155",
      borderRadius: parsedConfig.borderRadius !== undefined ? parsedConfig.borderRadius : 12,
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
      console.error("Compile error:", err);
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

  const moveBlock = (index: number, direction: "up" | "down", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
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
      })
    );
  };

  // Save Template to Backend
  const handleSaveTemplate = async () => {
    if (!name.trim()) {
      showNotification("error", "Please enter a template name.");
      return;
    }
    if (!subject.trim()) {
      showNotification("error", "Please enter an email subject line.");
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
        showNotification("success", `Template "${name}" saved successfully!`);
        setTemplates((prev) =>
          prev.map((t) => (t.id === selectedTemplate.id ? { ...t, ...res.template } : t))
        );
      } else {
        const res = await cmsService.createEmailTemplate(payload);
        showNotification("success", `New template "${name}" created!`);
        setTemplates((prev) => [res.template, ...prev]);
        setSelectedTemplate(res.template);
      }
    } catch (err: any) {
      showNotification("error", err.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      showNotification("error", "Please enter a valid recipient email.");
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
        showNotification("success", `Test email dispatched to ${testRecipient}!`);
      } else {
        showNotification("error", "Please save the template first before sending test emails.");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Failed to dispatch test email.");
    } finally {
      setSendingTest(false);
    }
  };

  // Create Blank Template
  const handleNewTemplate = () => {
    const blank: EmailTemplateData = {
      id: "",
      name: "Untitled Custom Template",
      slug: `custom-${Date.now()}`,
      category: "MARKETING",
      trigger: "PROMOTIONAL",
      subject: "Exciting News from {{store.name}} ✨",
      previewText: "Open for exclusive deals and updates.",
      blocksJson: "[]",
      designConfigJson: "{}",
      isActive: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedTemplate(blank);
    setName(blank.name);
    setCategory("MARKETING");
    setTrigger("PROMOTIONAL");
    setSubject(blank.subject);
    setPreviewText(blank.previewText || "");
    setBlocks([
      {
        id: `b_hdr_${Date.now()}`,
        type: "header",
        content: { brandName: "{{store.name}}", align: "center", padding: "24px 24px 16px 24px" },
      },
      {
        id: `b_hero_${Date.now()}`,
        type: "hero",
        content: {
          title: "New Drop Just Landed 🚀",
          subtitle: "Explore fresh styles curated for your everyday aesthetic.",
          backgroundColor: "#4f46e5",
          textColor: "#ffffff",
          align: "center",
        },
      },
      {
        id: `b_btn_${Date.now()}`,
        type: "button",
        content: {
          text: "Discover Now →",
          url: "{{store.url}}",
          backgroundColor: "#4f46e5",
          textColor: "#ffffff",
          align: "center",
        },
      },
      {
        id: `b_ftr_${Date.now()}`,
        type: "footer",
        content: { storeName: "{{store.name}}", unsubscribeUrl: "{{store.url}}/unsubscribe" },
      },
    ]);
  };

  // Reset to Presets
  const handleResetPresets = async () => {
    if (confirm("Reset all templates back to standard official presets? Custom changes to defaults will be refreshed.")) {
      setLoading(true);
      try {
        const res = await cmsService.resetEmailPresets();
        setTemplates(res.templates);
        if (res.templates.length > 0) {
          selectTemplate(res.templates[0]);
        }
        showNotification("success", "Presets restored successfully!");
      } catch (err) {
        showNotification("error", "Failed to reset presets.");
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
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-900 text-white p-8">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading Visual Email Template Studio...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[820px] bg-slate-950 text-slate-100 font-sans select-none overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : "bg-rose-950 border-rose-700 text-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ─── STUDIO TOP BAR ────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0 gap-4">
        {/* Left: Template Info & Preset Switcher */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md text-white">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Name..."
                className="bg-transparent text-lg font-bold text-white hover:bg-slate-800/60 focus:bg-slate-800/90 px-2 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-all w-64 md:w-80"
              />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  category === "MARKETING"
                    ? "bg-purple-950/80 text-purple-300 border-purple-800"
                    : category === "NOTIFICATION"
                    ? "bg-blue-950/80 text-blue-300 border-blue-800"
                    : "bg-amber-950/80 text-amber-300 border-amber-800"
                }`}
              >
                {category}
              </span>
              {trigger && (
                <span className="hidden lg:inline-flex text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  ⚡ {trigger}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 px-2">
              <span>{templates.length} templates available</span>
              <span>&bull;</span>
              <button
                onClick={handleNewTemplate}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> New Template
              </button>
            </div>
          </div>
        </div>

        {/* Center: Template Quick Switcher */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60">
          <span className="text-xs font-semibold text-slate-400 px-2">Template:</span>
          <select
            value={selectedTemplate?.id || ""}
            onChange={(e) => {
              const match = templates.find((t) => t.id === e.target.value);
              if (match) selectTemplate(match);
            }}
            className="bg-slate-900 text-xs text-slate-200 rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.isDefault ? "⭐ " : ""}
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Right: View Mode, Viewport & Main Actions */}
        <div className="flex items-center gap-3">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setPreviewViewport("desktop")}
              title="Desktop Preview (600px)"
              className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                previewViewport === "desktop"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewViewport("mobile")}
              title="Mobile Preview (375px)"
              className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                previewViewport === "mobile"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* View Modes */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode("builder")}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "builder"
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Builder
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "split"
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Split Live
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "code"
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              HTML
            </button>
          </div>

          {/* Test Email */}
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 hover:border-indigo-500 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Send Test
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </header>

      {/* ─── EMAIL META DETAILS BAR ────────────────────────────────────────── */}
      <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex-1 min-w-[240px] flex items-center gap-2">
          <span className="font-semibold text-slate-400 shrink-0">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Your order #{{order.number}} is on the way! 🚀"
            className="w-full bg-slate-950/80 text-slate-100 px-3 py-1 rounded border border-slate-700/80 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="font-semibold text-slate-400 shrink-0">Preheader:</span>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Hidden preview snippet shown in inbox..."
            className="w-full bg-slate-950/80 text-slate-100 px-3 py-1 rounded border border-slate-700/80 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-slate-400">Type:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="bg-slate-950/80 text-slate-200 px-2.5 py-1 rounded border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="MARKETING">Marketing Campaign</option>
            <option value="NOTIFICATION">Transactional Notification</option>
            <option value="CUSTOM">Custom Layout</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-slate-400">Trigger:</span>
          <select
            value={trigger || ""}
            onChange={(e) => setTrigger(e.target.value || null)}
            className="bg-slate-950/80 text-slate-200 px-2.5 py-1 rounded border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
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

      {/* ─── MAIN WORKSPACE ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT SIDEBAR: BLOCK PALETTE & SETTINGS (340px) ──────────────── */}
        <aside className="w-80 md:w-[360px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Sidebar Tab Selector */}
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
            <button
              onClick={() => setSidebarTab("blocks")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === "blocks"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Blocks ({blocks.length})
            </button>
            <button
              onClick={() => setSidebarTab("design")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === "design"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Design Theme
            </button>
            <button
              onClick={() => setSidebarTab("variables")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === "variables"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Variables
            </button>
          </div>

          {/* Sidebar Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* ── TAB 1: BLOCKS & CANVAS TREE ── */}
            {sidebarTab === "blocks" && (
              <>
                {/* Add Block Palette */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    Insert Block
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_BLOCKS.map((b) => {
                      const Icon = b.icon;
                      return (
                        <button
                          key={b.type}
                          onClick={() => addBlock(b.type)}
                          className="flex items-start gap-2.5 p-2.5 bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/60 rounded-xl text-left transition-all group"
                        >
                          <div className="p-1.5 bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white rounded-lg transition-all shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                              {b.label}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Email Structure ({blocks.length})
                    </h4>
                    {blocks.length > 0 && (
                      <button
                        onClick={() => setBlocks([])}
                        className="text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {blocks.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-500 text-xs">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                      No blocks added yet. Click any block above to start assembling your email.
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
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md"
                                : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-[10px] font-mono text-slate-500 w-4">
                                {index + 1}
                              </span>
                              <div
                                className={`p-1 rounded ${
                                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold truncate">
                                {blockDef?.label || block.type}
                              </span>
                            </div>

                            {/* Block Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => moveBlock(index, "up", e)}
                                disabled={index === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => moveBlock(index, "down", e)}
                                disabled={index === blocks.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => duplicateBlock(block.id, e)}
                                title="Duplicate"
                                className="p-1 text-slate-400 hover:text-indigo-300"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => removeBlock(block.id, e)}
                                title="Delete Block"
                                className="p-1 text-slate-400 hover:text-rose-400"
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
            {sidebarTab === "design" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
                    Global Canvas Theme
                  </h4>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Backdrop Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.backgroundColor || "#f4f6f8"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, backgroundColor: e.target.value })
                      }
                      className="w-9 h-9 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.backgroundColor || "#f4f6f8"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, backgroundColor: e.target.value })
                      }
                      className="flex-1 bg-slate-950 text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Card Container Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.canvasBackgroundColor || "#ffffff"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, canvasBackgroundColor: e.target.value })
                      }
                      className="w-9 h-9 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.canvasBackgroundColor || "#ffffff"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, canvasBackgroundColor: e.target.value })
                      }
                      className="flex-1 bg-slate-950 text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Primary Brand Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.primaryColor || "#6366f1"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, primaryColor: e.target.value })
                      }
                      className="w-9 h-9 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.primaryColor || "#6366f1"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, primaryColor: e.target.value })
                      }
                      className="flex-1 bg-slate-950 text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Default Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.textColor || "#334155"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, textColor: e.target.value })
                      }
                      className="w-9 h-9 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={designConfig.textColor || "#334155"}
                      onChange={(e) =>
                        setDesignConfig({ ...designConfig, textColor: e.target.value })
                      }
                      className="flex-1 bg-slate-950 text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Card Corner Radius ({designConfig.borderRadius || 12}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="28"
                    step="2"
                    value={designConfig.borderRadius !== undefined ? designConfig.borderRadius : 12}
                    onChange={(e) =>
                      setDesignConfig({ ...designConfig, borderRadius: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Typography System
                  </label>
                  <select
                    value={designConfig.fontFamily || ""}
                    onChange={(e) =>
                      setDesignConfig({ ...designConfig, fontFamily: e.target.value })
                    }
                    className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded border border-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
                      Modern System Sans (Apple / Google)
                    </option>
                    <option value="'Inter', -apple-system, sans-serif">Inter Clean</option>
                    <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">
                      Helvetica Classic
                    </option>
                    <option value="Georgia, serif">Georgia Editorial Serif</option>
                    <option value="'Courier New', Courier, monospace">Monospace Tech</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleResetPresets}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Default Official Presets
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 3: DYNAMIC VARIABLES ── */}
            {sidebarTab === "variables" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    Dynamic Variables
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click any tag to copy it to clipboard. Paste into any text field or button URL.
                  </p>
                </div>

                <div className="space-y-2">
                  {VARIABLE_PILLS.map((p) => (
                    <button
                      key={p.tag}
                      onClick={() => {
                        navigator.clipboard.writeText(p.tag);
                        showNotification("success", `Copied ${p.tag} to clipboard!`);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500 text-left transition-all group"
                    >
                      <div>
                        <div className="font-mono text-xs text-indigo-300 font-bold group-hover:text-indigo-200">
                          {p.tag}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.label}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {p.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── CENTER: ACTIVE BLOCK INSPECTOR (340px) ───────────────────────── */}
        <div className="w-80 md:w-[360px] bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Block Inspector
            </h3>
            {selectedBlock && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {selectedBlock.type}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!selectedBlock ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Select any block from the left structure or email canvas to edit its properties.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Block Inspector */}
                {selectedBlock.type === "header" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Brand Name / Title
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.brandName || ""}
                        onChange={(e) => updateSelectedBlockContent("brandName", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Logo Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.logoUrl || ""}
                        onChange={(e) => updateSelectedBlockContent("logoUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Alignment
                      </label>
                      <select
                        value={selectedBlock.content.align || "center"}
                        onChange={(e) => updateSelectedBlockContent("align", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded border border-slate-700"
                      >
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Hero Block Inspector */}
                {selectedBlock.type === "hero" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Hero Headline
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ""}
                        onChange={(e) => updateSelectedBlockContent("title", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Subheadline / Description
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.content.subtitle || ""}
                        onChange={(e) => updateSelectedBlockContent("subtitle", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Background Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.imageUrl || ""}
                        onChange={(e) => updateSelectedBlockContent("imageUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">
                          BG Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.backgroundColor || "#4f46e5"}
                          onChange={(e) =>
                            updateSelectedBlockContent("backgroundColor", e.target.value)
                          }
                          className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.textColor || "#ffffff"}
                          onChange={(e) =>
                            updateSelectedBlockContent("textColor", e.target.value)
                          }
                          className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Text Block Inspector */}
                {selectedBlock.type === "text" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Body Content (HTML & Variables Supported)
                      </label>
                      <textarea
                        rows={6}
                        value={selectedBlock.content.text || ""}
                        onChange={(e) => updateSelectedBlockContent("text", e.target.value)}
                        className="w-full bg-slate-950 font-mono text-xs text-slate-100 p-2.5 rounded border border-slate-700 focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">
                          Font Size
                        </label>
                        <select
                          value={selectedBlock.content.fontSize || "15px"}
                          onChange={(e) => updateSelectedBlockContent("fontSize", e.target.value)}
                          className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded border border-slate-700"
                        >
                          <option value="13px">13px - Small</option>
                          <option value="15px">15px - Standard</option>
                          <option value="17px">17px - Large</option>
                          <option value="19px">19px - Lead</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">
                          Align
                        </label>
                        <select
                          value={selectedBlock.content.align || "left"}
                          onChange={(e) => updateSelectedBlockContent("align", e.target.value)}
                          className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded border border-slate-700"
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
                {selectedBlock.type === "button" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.text || ""}
                        onChange={(e) => updateSelectedBlockContent("text", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Destination URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.url || ""}
                        onChange={(e) => updateSelectedBlockContent("url", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">
                          Button Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.backgroundColor || "#4f46e5"}
                          onChange={(e) =>
                            updateSelectedBlockContent("backgroundColor", e.target.value)
                          }
                          className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content.textColor || "#ffffff"}
                          onChange={(e) =>
                            updateSelectedBlockContent("textColor", e.target.value)
                          }
                          className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Coupon Block Inspector */}
                {selectedBlock.type === "coupon" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.code || ""}
                        onChange={(e) => updateSelectedBlockContent("code", e.target.value)}
                        className="w-full bg-slate-950 font-mono text-xs text-indigo-300 font-bold p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Discount Headline
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.discountText || ""}
                        onChange={(e) =>
                          updateSelectedBlockContent("discountText", e.target.value)
                        }
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Expiry Terms
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.expiryText || ""}
                        onChange={(e) =>
                          updateSelectedBlockContent("expiryText", e.target.value)
                        }
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Button CTA Text
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.buttonText || ""}
                        onChange={(e) =>
                          updateSelectedBlockContent("buttonText", e.target.value)
                        }
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                  </>
                )}

                {/* Tracking Card Inspector */}
                {selectedBlock.type === "tracking-card" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Carrier Name
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.carrier || ""}
                        onChange={(e) => updateSelectedBlockContent("carrier", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        AWB Tracking Number
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.awb || ""}
                        onChange={(e) => updateSelectedBlockContent("awb", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Tracking URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.trackingUrl || ""}
                        onChange={(e) => updateSelectedBlockContent("trackingUrl", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                  </>
                )}

                {/* Footer Inspector */}
                {selectedBlock.type === "footer" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.storeName || ""}
                        onChange={(e) => updateSelectedBlockContent("storeName", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Postal Address
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.address || ""}
                        onChange={(e) => updateSelectedBlockContent("address", e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Unsubscribe URL
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.content.unsubscribeUrl || ""}
                        onChange={(e) =>
                          updateSelectedBlockContent("unsubscribeUrl", e.target.value)
                        }
                        className="w-full bg-slate-950 text-xs text-slate-100 p-2 rounded border border-slate-700"
                      />
                    </div>
                  </>
                )}

                {/* Common Delete Action */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => removeBlock(selectedBlock.id)}
                    className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete This Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT / MAIN PANE: LIVE DUAL PREVIEW OR HTML CODE ────────────── */}
        <main className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
          {viewMode === "code" ? (
            /* HTML Code View */
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Compiled Email HTML (Ready to copy into any ESP)</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(compiledHtml);
                    showNotification("success", "Email HTML copied to clipboard!");
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy HTML
                </button>
              </div>
              <textarea
                readOnly
                value={compiledHtml}
                className="flex-1 w-full bg-slate-900 font-mono text-xs text-emerald-300 p-4 rounded-xl border border-slate-800 focus:outline-none custom-scrollbar select-all"
              />
            </div>
          ) : (
            /* Live Iframe Sandbox Preview */
            <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto custom-scrollbar bg-slate-950/90">
              {/* Preview Container Container */}
              <div
                style={{
                  width: previewViewport === "desktop" ? "640px" : "390px",
                  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="my-auto flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
              >
                {/* Simulated Email Client Browser Header */}
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] font-semibold text-slate-400">
                      {previewViewport === "desktop" ? "Desktop Preview (600px)" : "Mobile Preview (375px)"}
                    </span>
                  </div>
                  {htmlLoading && (
                    <span className="text-[10px] text-indigo-400 animate-pulse font-medium">
                      Re-rendering...
                    </span>
                  )}
                </div>

                {/* Simulated Inbox Subject line */}
                <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 text-xs">
                  <div className="font-bold text-slate-200 truncate">
                    Subject: {subject || "No subject specified"}
                  </div>
                  {previewText && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      Preheader: {previewText}
                    </div>
                  )}
                </div>

                {/* Sandboxed Iframe */}
                <div className="bg-slate-100 flex justify-center p-2 min-h-[540px]">
                  <iframe
                    title="Live Email Preview"
                    srcDoc={compiledHtml}
                    className="w-full min-h-[580px] border-0 rounded-lg"
                    style={{ backgroundColor: designConfig.backgroundColor || "#f4f6f8" }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── TEST EMAIL MODAL ──────────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Send Simulated Test Email</h3>
              </div>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Test how this template looks with substituted dynamic variables (customer name, sample
              order details, tracking credentials).
            </p>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="merchant@example.com"
                className="w-full bg-slate-950 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {testResult && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Test Email Simulated!
                </div>
                <div className="text-[11px] text-emerald-300/80">
                  Dispatched at {new Date(testResult.dispatchedAt).toLocaleTimeString()} to{" "}
                  <strong>{testResult.recipientEmail}</strong>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingTest ? "Sending..." : "Send Test Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateBuilderStudio;

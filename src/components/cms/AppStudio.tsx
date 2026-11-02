'use client';
import { PageAiSpecularButton } from '@/src/components/cms/PageAiSpecularButton';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  AppWindow,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Settings,
  Trash2,
  RefreshCw,
  Zap,
  Mail,
  MessageSquare,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  X,
  HelpCircle,
  Activity,
  Loader2,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { CMSMarketplaceApp, CMSInstalledApp, CMSAppActivityLog } from '@/src/types';

const FALLBACK_APPS: CMSMarketplaceApp[] = [
  {
    id: 'mailgun-default',
    slug: 'mailgun',
    name: 'Mailgun Transactional Email',
    category: 'EMAIL',
    description: 'High-volume deliverability email API for automated order confirmations, password resets, and marketing campaigns.',
    developer: 'Mailgun by Sinch',
    icon: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=128&auto=format&fit=crop&q=80',
    badge: 'Popular',
    websiteUrl: 'https://www.mailgun.com',
    docsUrl: 'https://documentation.mailgun.com',
    configFields: [
      { key: 'apiKey', label: 'Mailgun API Key', type: 'password', placeholder: 'key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Private API Key found under Mailgun API security settings', required: true },
      { key: 'domain', label: 'Sending Domain', type: 'text', placeholder: 'mg.yourstore.com', description: 'Verified sending domain configured in Mailgun DNS', required: true },
      { key: 'region', label: 'API Region', type: 'select', options: [{ label: 'US (United States)', value: 'US' }, { label: 'EU (Europe)', value: 'EU' }], defaultValue: 'US', required: true },
      { key: 'fromEmail', label: 'From Email Address', type: 'text', placeholder: 'orders@yourstore.com', description: 'The email address shown in the customer inbox From header', required: true },
      { key: 'fromName', label: 'Sender Display Name', type: 'text', placeholder: 'OmniStore Support', required: false },
    ],
    supportedEvents: ['ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PASSWORD_RESET', 'ABANDONED_CART'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'wati-default',
    slug: 'wati',
    name: 'Wati WhatsApp Business API',
    category: 'WHATSAPP',
    description: 'Direct multi-agent WhatsApp customer notifications, order confirmations, dispatch tracking, and 2-way live chat synced with your Wati inbox.',
    developer: 'Wati.io (Official)',
    icon: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=128&auto=format&fit=crop&q=80',
    badge: 'Popular',
    websiteUrl: 'https://www.wati.io',
    docsUrl: 'https://docs.wati.io/reference/introduction',
    configFields: [
      { key: 'endpointUrl', label: 'Wati API Endpoint URL', type: 'text', placeholder: 'https://live-server-XXXX.wati.io', description: 'Your unique Wati API Gateway endpoint shown in Wati Dashboard > API Docs', required: true },
      { key: 'apiAccessToken', label: 'Wati Access Token (Bearer)', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Bearer token generated in Wati API settings', required: true },
      { key: 'whatsappNumber', label: 'Sender WhatsApp Number', type: 'text', placeholder: '+15551234567 or +919876543210', description: 'Registered WhatsApp Business phone number associated with Wati', required: true },
      { key: 'defaultLanguage', label: 'Default Template Language', type: 'select', options: [{ label: 'English (en)', value: 'en' }, { label: 'English US (en_US)', value: 'en_US' }, { label: 'Spanish (es)', value: 'es' }, { label: 'Hindi (hi)', value: 'hi' }], defaultValue: 'en' },
    ],
    supportedEvents: ['ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ABANDONED_CART', 'PASSWORD_RESET'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'mailbox-default',
    slug: 'mailbox',
    name: 'Custom Mailbox (SMTP / IMAP)',
    category: 'EMAIL',
    description: 'Connect any corporate or private business mailbox (Google Workspace, Zoho Mail, Outlook 365, or private cPanel server) via standard SMTP.',
    developer: 'OmniStore Official',
    icon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=128&auto=format&fit=crop&q=80',
    badge: 'Standard',
    websiteUrl: 'https://omnistore.io/docs/mailbox',
    docsUrl: 'https://omnistore.io/docs/mailbox',
    configFields: [
      { key: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com or mail.yourdomain.com', required: true },
      { key: 'smtpPort', label: 'SMTP Port', type: 'number', placeholder: '587', defaultValue: 587, required: true },
      { key: 'smtpSecure', label: 'Use SSL/TLS', type: 'boolean', description: 'Enable for port 465 (SSL), leave unchecked for port 587 (STARTTLS)', defaultValue: false },
      { key: 'smtpUser', label: 'SMTP Username / Login', type: 'text', placeholder: 'support@yourdomain.com', required: true },
      { key: 'smtpPassword', label: 'SMTP Password / App Password', type: 'password', placeholder: '••••••••••••••••', required: true },
      { key: 'fromEmail', label: 'From Email Address', type: 'text', placeholder: 'support@yourdomain.com', required: true },
      { key: 'fromName', label: 'Sender Display Name', type: 'text', placeholder: 'Your Store Team', required: false },
    ],
    supportedEvents: ['ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PASSWORD_RESET', 'ABANDONED_CART'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'meta-whatsapp-default',
    slug: 'meta-whatsapp',
    name: 'Meta WhatsApp Cloud API',
    category: 'WHATSAPP',
    description: 'Direct enterprise connectivity with Meta WhatsApp Cloud Platform with zero third-party broker markups.',
    developer: 'Meta Platforms',
    icon: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=128&auto=format&fit=crop&q=80',
    badge: 'Official',
    websiteUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference',
    configFields: [
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '109283746501928', required: true },
      { key: 'accessToken', label: 'System User Permanent Access Token', type: 'password', placeholder: 'EAAG...', required: true },
      { key: 'wabaId', label: 'WhatsApp Business Account ID', type: 'text', placeholder: '201928374650192', required: false },
    ],
    supportedEvents: ['ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'ORDER_DELIVERED'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'shiprocket-default',
    slug: 'shiprocket',
    name: 'Shiprocket Logistics & Tracking',
    category: 'SHIPPING',
    description: 'Automated order shipment manifests, live courier tracking, NDR management, and COD remittances across 25+ couriers.',
    developer: 'Shiprocket',
    icon: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&auto=format&fit=crop&q=80',
    badge: 'Logistics',
    websiteUrl: 'https://www.shiprocket.in',
    docsUrl: 'https://apidocs.shiprocket.in',
    configFields: [
      { key: 'email', label: 'Shiprocket Account Email', type: 'text', placeholder: 'logistics@yourstore.com', required: true },
      { key: 'password', label: 'Shiprocket Account Password', type: 'password', placeholder: '••••••••••••••••', required: true },
      { key: 'channelId', label: 'Custom Channel ID (Optional)', type: 'text', placeholder: 'e.g. 54321', required: false },
    ],
    supportedEvents: ['ORDER_CONFIRMATION', 'ORDER_SHIPPED'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'twilio-sms-default',
    slug: 'twilio-sms',
    name: 'Twilio SMS & OTP Gateway',
    category: 'SMS',
    description: 'Send high-priority order dispatch OTPs, delivery alerts, and cart recovery SMS across 180+ countries.',
    developer: 'Twilio Inc.',
    icon: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
    badge: 'Popular',
    websiteUrl: 'https://www.twilio.com',
    docsUrl: 'https://www.twilio.com/docs/sms',
    configFields: [
      { key: 'accountSid', label: 'Twilio Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: '••••••••••••••••••••••••••••••••', required: true },
      { key: 'fromPhoneNumber', label: 'Twilio Phone Number / Sender ID', type: 'text', placeholder: '+15551234567', required: true },
    ],
    supportedEvents: ['ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'PASSWORD_RESET'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'razorpay-default',
    slug: 'razorpay',
    name: 'Razorpay Payment Gateway',
    category: 'PAYMENT',
    description: 'Accept domestic Indian payments with UPI (Google Pay, PhonePe, Paytm) at 0% MDR, 58+ banks NetBanking, cards, and instant settlements.',
    developer: 'Razorpay Software',
    icon: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&auto=format&fit=crop&q=80',
    badge: 'Popular',
    websiteUrl: 'https://razorpay.com',
    docsUrl: 'https://razorpay.com/docs/api',
    configFields: [
      { key: 'keyId', label: 'Razorpay Key ID', type: 'text', placeholder: 'rzp_test_... or rzp_live_...', description: 'Key ID generated in Razorpay Dashboard > Settings > API Keys', required: true },
      { key: 'keySecret', label: 'Razorpay Key Secret', type: 'password', placeholder: '••••••••••••••••', description: 'Private API secret matching your Key ID', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: '••••••••••••••••', description: 'Secret used to verify incoming webhook signatures', required: false },
      { key: 'autoCapture', label: 'Auto-Capture Payments', type: 'boolean', defaultValue: true, description: 'Automatically capture authorized payments immediately upon order completion' },
      { key: 'testMode', label: 'Sandbox / Test Mode', type: 'boolean', defaultValue: true, description: 'Enable Razorpay test mode to simulate transactions without charging real money' },
    ],
    supportedEvents: ['PAYMENT_AUTHORIZED', 'PAYMENT_CAPTURED', 'PAYMENT_FAILED', 'REFUND_PROCESSED'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
  {
    id: 'paypal-default',
    slug: 'paypal',
    name: 'PayPal Global Checkout & BNPL',
    category: 'PAYMENT',
    description: 'Accept international payments from 200+ countries and 25+ currencies via PayPal Wallet, Pay in 4 (BNPL), and global debit/credit cards.',
    developer: 'PayPal Inc.',
    icon: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
    badge: 'Global',
    websiteUrl: 'https://www.paypal.com',
    docsUrl: 'https://developer.paypal.com/docs/api',
    configFields: [
      { key: 'clientId', label: 'PayPal Client ID', type: 'text', placeholder: 'AY... or sandbox client ID', description: 'OAuth Client ID found under PayPal Developer Dashboard > Apps & Credentials', required: true },
      { key: 'clientSecret', label: 'PayPal Client Secret', type: 'password', placeholder: '••••••••••••••••', description: 'Private client secret for OAuth token generation', required: true },
      { key: 'webhookId', label: 'PayPal Webhook ID', type: 'text', placeholder: 'e.g. 4JH72648JH3928172', description: 'Webhook ID registered in PayPal Developer Dashboard for event subscriptions', required: false },
      { key: 'mode', label: 'Environment Mode', type: 'select', options: [{ label: 'Sandbox (Testing)', value: 'sandbox' }, { label: 'Live (Production)', value: 'live' }], defaultValue: 'sandbox', description: 'Switch between PayPal Sandbox for testing and Live for real revenue collection', required: true },
    ],
    supportedEvents: ['CHECKOUT_ORDER_APPROVED', 'PAYMENT_CAPTURE_COMPLETED', 'PAYMENT_CAPTURE_REFUNDED'],
    isInstalled: false,
    installationStatus: 'NOT_INSTALLED',
  },
];

export const AppStudio: React.FC = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category')?.toUpperCase();
  const initialTab = (searchParams?.get('tab') as 'marketplace' | 'installed' | 'logs') || 'marketplace';

  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed' | 'logs'>(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [marketplaceApps, setMarketplaceApps] = useState<CMSMarketplaceApp[]>(FALLBACK_APPS);
  const [installedApps, setInstalledApps] = useState<CMSInstalledApp[]>([]);
  const [activityLogs, setActivityLogs] = useState<CMSAppActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected App for Configure / Install Modal
  const [selectedApp, setSelectedApp] = useState<CMSMarketplaceApp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [appStatus, setAppStatus] = useState<'ACTIVE' | 'CONFIGURED' | 'DISABLED'>('ACTIVE');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Testing connection state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; simulated?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [marketData, installedData, logsData] = await Promise.all([
        cmsService.getMarketplaceApps(),
        cmsService.getInstalledApps(),
        cmsService.getAppLogs(),
      ]);
      if (marketData && marketData.length > 0) {
        setMarketplaceApps(marketData);
      }
      if (installedData) {
        setInstalledApps(installedData);
      }
      if (logsData) {
        setActivityLogs(logsData);
      }
    } catch (err) {
      console.error('Error loading app marketplace data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      setIsRefreshing(true);
      try {
        const [marketData, installedData, logsData] = await Promise.all([
          cmsService.getMarketplaceApps(),
          cmsService.getInstalledApps(),
          cmsService.getAppLogs(),
        ]);
        if (ignore) return;
        if (marketData && marketData.length > 0) {
          setMarketplaceApps(marketData);
        }
        if (installedData) {
          setInstalledApps(installedData);
        }
        if (logsData) {
          setActivityLogs(logsData);
        }
      } catch (err) {
        console.error('Error loading app marketplace data:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered Marketplace Apps
  const filteredApps = useMemo(() => {
    return marketplaceApps.filter((app) => {
      const matchesCategory =
        categoryFilter === 'ALL' || app.category.toUpperCase() === categoryFilter.toUpperCase();
      const matchesSearch =
        !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [marketplaceApps, categoryFilter, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    const totalApps = marketplaceApps.length;
    const installedCount = installedApps.length;
    const activeDrivers = installedApps.filter((i) => i.status === 'ACTIVE').length;
    const totalDispatches = activityLogs.length;
    return { totalApps, installedCount, activeDrivers, totalDispatches };
  }, [marketplaceApps, installedApps, activityLogs]);

  // Open Configure Modal
  const handleOpenConfigure = (app: CMSMarketplaceApp) => {
    setSelectedApp(app);
    setTestResult(null);

    // Find installation if already installed
    const existing = installedApps.find((i) => i.slug === app.slug);
    if (existing) {
      const initialForm: Record<string, unknown> = {};
      app.configFields?.forEach((f) => {
        initialForm[f.key] = existing.credentialsSanitized[f.key] || existing.settings?.[f.key] || f.defaultValue || '';
      });
      setFormData(initialForm);
      setIsPrimary(existing.isPrimary);
      setAppStatus(existing.status === 'DISABLED' ? 'DISABLED' : 'ACTIVE');
    } else {
      const defaultForm: Record<string, unknown> = {};
      app.configFields?.forEach((f) => {
        defaultForm[f.key] = f.defaultValue || '';
      });
      setFormData(defaultForm);
      setIsPrimary(false);
      setAppStatus('ACTIVE');
    }

    setIsModalOpen(true);
  };

  // Quick install from card
  const handleQuickInstall = async (app: CMSMarketplaceApp) => {
    setIsSaving(true);
    try {
      await cmsService.installApp(app.slug);
      await loadData(true);
      handleOpenConfigure(app);
      setActionSuccessMsg(`Installed ${app.name}! Configure your credentials below.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Install failed';
      alert(`Install failed: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    if (!selectedApp) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await cmsService.testAppConnection(selectedApp.slug, formData);
      setTestResult(res);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setTestResult({
        success: false,
        message: apiErr.response?.data?.message || apiErr.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Configuration: First verify credentials, then store if valid
  const handleSaveConfig = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    setTestResult(null);

    // If app is being configured or activated, test credentials first before storing
    if (appStatus !== 'DISABLED') {
      setIsVerifying(true);
      let verifyRes: { success: boolean; message: string; simulated?: boolean } | null = null;
      try {
        verifyRes = await cmsService.testAppConnection(selectedApp.slug, formData);
      } catch (testErr: unknown) {
        const apiErr = testErr as { response?: { data?: { message?: string } }; message?: string };
        verifyRes = {
          success: false,
          message: apiErr.response?.data?.message || apiErr.message || 'Connection test failed',
        };
      }

      setTestResult(verifyRes);
      setIsVerifying(false);

      // If credentials verification failed, STOP! DO NOT STORE!
      if (!verifyRes || !verifyRes.success) {
        setIsSaving(false);
        return;
      }
    }

    // Step 2: Verification passed (or app disabled) -> Now store it
    try {
      const configRes = await cmsService.configureApp(selectedApp.slug, {
        credentials: formData,
        isPrimary,
        status: appStatus,
      });

      await loadData(true);
      setIsModalOpen(false);
      setActionSuccessMsg(
        configRes?.message || `${selectedApp.name} credentials verified and deployed successfully!`
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = apiErr.response?.data?.message || apiErr.message || 'Failed to save configuration';
      setTestResult({
        success: false,
        message: errorMsg,
      });
    } finally {
      setIsSaving(false);
      setIsVerifying(false);
    }
  };

  // Uninstall App
  const handleUninstall = async () => {
    if (!selectedApp) return;
    if (
      !confirm(
        `Are you sure you want to uninstall ${selectedApp.name}? Outgoing messages will revert to default system fallback.`
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await cmsService.uninstallApp(selectedApp.slug);
      await loadData(true);
      setIsModalOpen(false);
      setActionSuccessMsg(`${selectedApp.name} uninstalled.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Uninstall failed';
      alert(`Uninstall failed: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toUpperCase()) {
      case 'EMAIL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WHATSAPP':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SMS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SHIPPING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PAYMENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'SHIPPING':
        return <Truck className="w-3.5 h-3.5" />;
      case 'PAYMENT':
        return <CreditCard className="w-3.5 h-3.5" />;
      default:
        return <Zap className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Banner */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-between animate-fadeIn transition-all">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="opacity-80 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <AppWindow className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Apps & Integrations</h1>
              <p className="text-sm text-slate-500">
                Connect external providers like Mailgun, Mailbox, and Wati for custom email & WhatsApp delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PageAiSpecularButton size="md" />
          <button
            onClick={() => loadData()}
            disabled={isRefreshing}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Catalog Apps</div>
            <div className="text-xl font-bold text-slate-900">{stats.totalApps}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Installed Apps</div>
            <div className="text-xl font-bold text-emerald-600">{stats.installedCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Active Drivers</div>
            <div className="text-xl font-bold text-violet-600">{stats.activeDrivers}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Event Dispatches</div>
            <div className="text-xl font-bold text-blue-600">{stats.totalDispatches}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'marketplace'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          App Marketplace
          <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full font-bold">
            {marketplaceApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('installed')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'installed'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Installed Apps
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full font-bold">
            {installedApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Delivery & Audit Logs
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full font-bold">
            {activityLogs.length}
          </span>
        </button>
      </div>

      {/* ─── TAB 1: MARKETPLACE ────────────────────────────────────────────── */}
      {activeTab === 'marketplace' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', 'PAYMENT', 'EMAIL', 'WHATSAPP', 'SHIPPING', 'SMS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Mailgun, Wati, Mailbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Apps Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading marketplace apps...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <AppWindow className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-medium">No apps found matching your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApps.map((app) => {
                const installed = installedApps.find((i) => i.slug === app.slug);

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Icon, Developer, Category */}
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3">
                          <Image
                            src={app.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128'}
                            alt={app.name}
                            width={48}
                            height={48}
                            unoptimized
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                              {app.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">{app.developer}</p>
                          </div>
                        </div>

                        {app.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-700 tracking-wider">
                            {app.badge}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                        {app.description}
                      </p>

                      {/* Category & Triggers */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getCategoryBadgeColor(
                            app.category
                          )}`}
                        >
                          {getCategoryIcon(app.category)}
                          {app.category}
                        </span>

                        {installed && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              installed.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            {installed.isPrimary ? 'Primary Driver' : installed.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {app.websiteUrl && (
                          <a
                            href={app.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Official Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {app.docsUrl && (
                          <a
                            href={app.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="API Documentation"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {installed ? (
                        <button
                          onClick={() => handleOpenConfigure(app)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Configure
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickInstall(app)}
                          disabled={isSaving}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Install App
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: INSTALLED APPS ─────────────────────────────────────────── */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          {installedApps.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
              <AppWindow className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No Apps Installed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Explore the marketplace and install integrations like Mailgun for email or Wati for WhatsApp.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installedApps.map((inst) => {
                const app = marketplaceApps.find((a) => a.slug === inst.slug);
                return (
                  <div
                    key={inst.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={inst.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128'}
                          alt={inst.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{inst.name}</h3>
                            {inst.isPrimary && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                                Primary Driver
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-semibold rounded-md border ${getCategoryBadgeColor(
                              inst.category
                            )}`}
                          >
                            {getCategoryIcon(inst.category)}
                            {inst.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
                            inst.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : inst.status === 'CONFIGURED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              inst.status === 'ACTIVE'
                                ? 'bg-emerald-500 animate-pulse'
                                : inst.status === 'CONFIGURED'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {inst.status}
                        </span>
                      </div>
                    </div>

                    {/* Status & Last Tested Info */}
                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Connection Status:</span>
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            inst.lastTestStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {inst.lastTestStatus === 'SUCCESS' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Connected
                            </>
                          ) : inst.lastTestStatus === 'FAILED' ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Connection Alert
                            </>
                          ) : (
                            'Not Tested Recently'
                          )}
                        </span>
                      </div>

                      {inst.lastTestedAt && (
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Last Healthcheck:</span>
                          <span>{new Date(inst.lastTestedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          if (app) handleOpenConfigure(app);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Manage & Credentials
                      </button>

                      <button
                        onClick={async () => {
                          setIsTesting(true);
                          try {
                            const res = await cmsService.testAppConnection(inst.slug);
                            alert(res.message);
                            await loadData(true);
                          } catch (err: unknown) {
                            const errorMsg = (err as Error)?.message || 'Test failed';
                            alert(`Test failed: ${errorMsg}`);
                          } finally {
                            setIsTesting(false);
                          }
                        }}
                        disabled={isTesting}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1.5 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Ping Test
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: AUDIT & DELIVERY LOGS ──────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dispatched Event Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Log of transactional emails and WhatsApp notifications routed via your installed apps.
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {activityLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No message dispatches logged yet. When an order event triggers or connection test runs, logs appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Provider / App</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Trigger / Event</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        {log.appIcon && (
                          <Image src={log.appIcon} alt="" width={20} height={20} unoptimized className="w-5 h-5 rounded object-cover" />
                        )}
                        {log.appName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadgeColor(
                            log.channel
                          )}`}
                        >
                          {getCategoryIcon(log.channel)}
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.eventTrigger}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{log.recipient}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.status === 'SIMULATED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── APP CONFIGURATION & INSTALL MODAL ────────────────────────────── */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Image
                  src={selectedApp.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128'}
                  alt={selectedApp.name}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedApp.name}</h3>
                  <p className="text-xs text-slate-500">Developer: {selectedApp.developer}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* App Overview Note */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed text-indigo-900">
                  Credentials are encrypted with AES-256 and only accessed when routing order triggers or test pings.
                </div>
              </div>

              {/* Status Switcher & Primary Driver Toggle */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Provider State</label>
                  <select
                    value={appStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setAppStatus(e.target.value as 'ACTIVE' | 'CONFIGURED' | 'DISABLED')
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">Active (Live Traffic)</option>
                    <option value="CONFIGURED">Configured (Standby)</option>
                    <option value="DISABLED">Disabled (Paused)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Primary Driver</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-slate-700">
                      Set as primary {selectedApp.category} driver
                    </span>
                  </label>
                </div>
              </div>

              {/* Dynamic Config Fields Form */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Provider Credentials
                </h4>

                {selectedApp.configFields?.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-800">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.description && (
                        <span className="text-[10px] text-slate-400">{field.description}</span>
                      )}
                    </div>

                    {field.type === 'select' ? (
                      <select
                        value={(formData[field.key] as string | number | undefined) ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, [field.key]: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={Boolean(formData[field.key])}
                          onChange={(e) =>
                            setFormData({ ...formData, [field.key]: e.target.checked })
                          }
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-600">{field.description || 'Enable'}</span>
                      </label>
                    ) : (
                      <div className="relative">
                        <input
                          type={
                            field.type === 'password' && !showPassword[field.key]
                              ? 'password'
                              : field.type === 'number'
                              ? 'number'
                              : 'text'
                          }
                          placeholder={field.placeholder || ''}
                          value={(formData[field.key] as string | number | undefined) ?? ''}
                          onChange={(e) =>
                            setFormData({ ...formData, [field.key]: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                        />

                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                [field.key]: !showPassword[field.key],
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword[field.key] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Diagnostic Test Connection Response Callout */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs">
                      {testResult.success ? 'Handshake Successful' : 'Connection Failed'}
                    </div>
                    <div className="text-[11px] mt-0.5">{testResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                {installedApps.some((i) => i.slug === selectedApp.slug) && (
                  <button
                    onClick={handleUninstall}
                    disabled={isSaving}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Uninstall
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || isSaving}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-500 ${isTesting ? 'animate-bounce' : ''}`} />
                  {isTesting ? 'Pinging Provider...' : 'Test Connection'}
                </button>

                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving || isTesting}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Zap className="w-3.5 h-3.5 animate-bounce text-amber-300" />
                      Verifying Credentials...
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    'Save & Deploy'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppStudio;

'use client';

import React, { useState, useEffect } from 'react';
import { cmsService } from '@/src/services/cmsService';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Smartphone,
  KeyRound,
  HelpCircle,
  Check,
  Lock,
  Globe,
  Crown,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  Zap,
  Bot,
  Truck,
  ShoppingBag,
} from 'lucide-react';

interface VendorWhatsAppSettingsProps {
  storeId?: string;
  onSaved?: () => void;
}

interface WhatsAppSettingsState {
  whatsappPhoneNumberId: string;
  whatsappAccessToken: string;
  whatsappBusinessAccountId: string;
  whatsappSupportNumber: string;
  whatsappEnabled: boolean;
  hasCustomToken: boolean;
  maskedAccessToken: string;
  isConfigured: boolean;
}

export const VendorWhatsAppSettings: React.FC<VendorWhatsAppSettingsProps> = ({
  storeId,
  onSaved,
}) => {
  const [settings, setSettings] = useState<WhatsAppSettingsState>({
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappBusinessAccountId: '',
    whatsappSupportNumber: '',
    whatsappEnabled: false,
    hasCustomToken: false,
    maskedAccessToken: '',
    isConfigured: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Test WhatsApp message state
  const [testRecipient, setTestRecipient] = useState('+91 98765 43210');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    simulated?: boolean;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadSettings();
  }, [storeId]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getStoreWhatsAppSettings(storeId);
      setSettings({
        whatsappPhoneNumberId: data.whatsappPhoneNumberId || '',
        whatsappAccessToken: data.maskedAccessToken || '',
        whatsappBusinessAccountId: data.whatsappBusinessAccountId || '',
        whatsappSupportNumber: data.whatsappSupportNumber || '',
        whatsappEnabled: !!data.whatsappEnabled,
        hasCustomToken: !!data.hasCustomToken,
        maskedAccessToken: data.maskedAccessToken || '',
        isConfigured: !!data.isConfigured,
      });
    } catch (err: any) {
      console.warn('Failed to load WhatsApp settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTestResult(null);

    try {
      const res = await cmsService.updateStoreWhatsAppSettings({
        storeId,
        whatsappPhoneNumberId: settings.whatsappPhoneNumberId.trim(),
        whatsappAccessToken: settings.whatsappAccessToken.includes('••••')
          ? undefined
          : settings.whatsappAccessToken.trim(),
        whatsappBusinessAccountId: settings.whatsappBusinessAccountId.trim(),
        whatsappSupportNumber: settings.whatsappSupportNumber.trim(),
        whatsappEnabled: settings.whatsappEnabled,
      });

      showToast(res.message || 'WhatsApp credentials saved successfully!');
      await loadSettings();
      if (onSaved) onSaved();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save WhatsApp settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testRecipient) {
      showToast('Please enter a recipient phone number', 'error');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await cmsService.sendTestWhatsAppMessage({
        storeId,
        recipientPhone: testRecipient,
      });

      setTestResult({
        success: res.success,
        message: res.message,
        simulated: res.simulated,
      });
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to dispatch test WhatsApp message',
      });
      showToast(err?.message || 'Test broadcast failed', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
        <span className="text-sm">Loading Meta WhatsApp Cloud API credentials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                Official Meta Cloud API
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  settings.whatsappEnabled && settings.isConfigured
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {settings.whatsappEnabled && settings.isConfigured ? 'Active & Verified' : 'Standby'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Meta WhatsApp Business Cloud API Gateway
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Deliver 98% open-rate transactional order alerts, shipping tracking notifications, and live customer concierge chat through Meta&apos;s direct WhatsApp Cloud infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-400 transition shadow-sm">
              <input
                type="checkbox"
                checked={settings.whatsappEnabled}
                onChange={(e) => setSettings({ ...settings, whatsappEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">
                Enable WhatsApp Alerts
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Feature Capabilities Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Order Receipts</div>
            <div className="text-[10px] text-slate-400">Instant PDF &amp; status</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Tracking URLs</div>
            <div className="text-[10px] text-slate-400">Live courier pings</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Cart Recovery</div>
            <div className="text-[10px] text-slate-400">Auto discount codes</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Storefront Chat</div>
            <div className="text-[10px] text-slate-400">1-Click customer chat</div>
          </div>
        </div>
      </div>

      {/* Main Settings Form & Live Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials Form (2 Columns) */}
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>Meta Developer API Credentials</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Encrypted &amp; securely stored
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Number ID */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Phone Number ID <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Found in Meta API Setup</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 104829104928104"
                  value={settings.whatsappPhoneNumberId}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* WABA ID */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>WhatsApp Business Account ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 192840192840192"
                  value={settings.whatsappBusinessAccountId}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappBusinessAccountId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Permanent Access Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Meta System User Permanent Access Token <span className="text-rose-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showToken ? 'Hide Token' : 'Show Token'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="EAAG... (Paste permanent token from Meta Business Manager)"
                  value={settings.whatsappAccessToken}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappAccessToken: e.target.value })
                  }
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Generated with <code className="text-emerald-600 bg-emerald-50 px-1 rounded">whatsapp_business_messaging</code> and <code className="text-emerald-600 bg-emerald-50 px-1 rounded">whatsapp_business_management</code> permissions.
              </p>
            </div>

            {/* Storefront Floating Support Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                <span>Storefront Customer Support Phone Number</span>
                <span className="text-[10px] text-slate-400 font-normal">Used for 1-Click WhatsApp Support Widget</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210 (Include country code)"
                value={settings.whatsappSupportNumber}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappSupportNumber: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero message fees on first 1,000 service conversations/month</span>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save WhatsApp Config</span>
              </button>
            </div>
          </form>

          {/* Interactive Step-by-Step Meta Developer Guide */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    How to get your free Meta WhatsApp Cloud API credentials
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Takes under 3 minutes with any Meta / Facebook account
                  </p>
                </div>
              </div>
              {showGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showGuide && (
              <div className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Open Meta for Developers</span>
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>developers.facebook.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click &ldquo;Create App&rdquo; → Select &ldquo;Other&rdquo; → Select App Type &ldquo;Business&rdquo; → Name your app (e.g. <em>OmniStore Notifications</em>).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>2. Add WhatsApp &amp; Copy Phone Number ID</span>
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>API Setup</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    In your App Dashboard, click &ldquo;Set up&rdquo; on WhatsApp. Open &ldquo;API Setup&rdquo; in the sidebar and copy your numeric <strong>Phone Number ID</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>3. Create Permanent System User Token</span>
                    <a
                      href="https://business.facebook.com/settings/system-users"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Meta Business Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Go to Business Settings → Users → System Users → Add an Admin system user → Click &ldquo;Generate new token&rdquo; → Select your app &amp; check <code className="text-emerald-600 bg-emerald-50 px-1 rounded">whatsapp_business_messaging</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Test Broadcast & Preview Box (1 Column) */}
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">
                Send Live Test WhatsApp Broadcast
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Verify your Meta Cloud API connection by sending an immediate test broadcast to any phone number.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Recipient Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestMessage}
                disabled={isSendingTest || !testRecipient}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send WhatsApp Test Message</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>{testResult.success ? 'Message Dispatched' : 'Dispatch Failed'}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {testResult.message}
                </p>
                {testResult.simulated && (
                  <div className="text-[10px] text-amber-600 font-mono pt-1">
                    💡 Simulated in dev mode. Set live credentials to deliver to actual phone.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* WhatsApp Smartphone UI Preview Mockup */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Customer Device Preview</span>
            </span>

            {/* Chat Bubble Simulation */}
            <div className="p-3.5 rounded-2xl bg-[#e9fbe5] border border-[#c5f0b8] text-slate-800 text-xs space-y-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                <span>🎉 Order Confirmed!</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                Hi John, your order <strong>#84920</strong> (₹1,499) is confirmed at OmniStore.
              </p>
              <div className="p-2 rounded-xl bg-white border border-emerald-100 text-[10px] font-mono text-emerald-700 truncate">
                📦 Track package: https://omni.link/track/84920
              </div>
              <div className="text-[9px] text-slate-400 text-right">
                10:42 AM • Delivered ✓✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

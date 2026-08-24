'use client';

import React, { useState, useEffect } from 'react';
import { NotificationConfigData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Save,
  Sparkles,
  Zap,
  Sliders,
  Radio,
  Check,
  Globe,
  Truck,
  ShoppingBag,
  Gift,
  KeyRound,
  Eye,
} from 'lucide-react';

export const NotificationStudio: React.FC = () => {
  const [configs, setConfigs] = useState<NotificationConfigData[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<string>('ORDER_CONFIRMATION');
  const [activeChannelTab, setActiveChannelTab] = useState<'WHATSAPP' | 'EMAIL' | 'SMS' | 'PUSH'>('WHATSAPP');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Test Dispatch Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('+91 98765 43210');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getNotificationConfigs();
      setConfigs(data);
    } catch (err) {
      console.error('Failed to load notification configs:', err);
      showToast('Failed to load notification settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isSmsPlatformEnabled = configs.some((c) => c.smsEnabled);
  const currentConfig = configs.find((c) => c.trigger === selectedTrigger) || configs[0];

  // Auto fallback from SMS tab if SMS is disabled
  useEffect(() => {
    if (!isSmsPlatformEnabled && activeChannelTab === 'SMS') {
      setActiveChannelTab('WHATSAPP');
    }
  }, [isSmsPlatformEnabled, activeChannelTab]);

  const handleToggleChannel = (channelKey: 'whatsAppEnabled' | 'emailEnabled' | 'smsEnabled' | 'pushEnabled') => {
    if (!currentConfig) return;
    if (channelKey === 'smsEnabled' && !isSmsPlatformEnabled && !currentConfig.smsEnabled) {
      showToast('SMS Gateway is disabled by Master Platform Administration', 'error');
      return;
    }
    const updated = {
      ...currentConfig,
      [channelKey]: !currentConfig[channelKey],
    };
    setConfigs((prev) => prev.map((c) => (c.trigger === currentConfig.trigger ? updated : c)));
  };

  const handleTemplateChange = (field: keyof NotificationConfigData, value: string) => {
    if (!currentConfig) return;
    const updated = {
      ...currentConfig,
      [field]: value,
    };
    setConfigs((prev) => prev.map((c) => (c.trigger === currentConfig.trigger ? updated : c)));
  };

  const handleSaveConfig = async () => {
    if (!currentConfig) return;
    setIsSaving(true);
    try {
      await cmsService.updateNotificationConfig(currentConfig.trigger, currentConfig);
      showToast(`Notification settings saved for "${currentConfig.title}"!`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save notifications', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConfig || !testRecipient) return;
    setIsSendingTest(true);
    try {
      const res = await cmsService.dispatchTestNotification({
        trigger: currentConfig.trigger,
        channel: activeChannelTab,
        recipient: testRecipient,
      });
      showToast(res.message || `Test notification dispatched via ${activeChannelTab}!`);
      setIsTestModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch test notification', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Render simulated preview text replacing template tags
  const getRenderedPreview = (template: string) => {
    if (!template) return '';
    return template
      .replace(/{{customer_name}}/g, 'Ananya Sharma')
      .replace(/{{store_name}}/g, 'OmniStore India')
      .replace(/{{order_number}}/g, 'ORD-98421')
      .replace(/{{total_amount}}/g, '₹4,999')
      .replace(/{{carrier}}/g, 'BlueDart Express')
      .replace(/{{tracking_number}}/g, 'BD-982103-IN')
      .replace(/{{tracking_url}}/g, 'https://track.omnistore.shop/BD-982103-IN')
      .replace(/{{order_items}}/g, '• 1x AeroPulse Wireless Headphones\n• 1x Velvet Atelier Bag')
      .replace(/{{recovery_url}}/g, 'https://omnistore.shop/checkout/recover?token=rec_98214')
      .replace(/{{otp_code}}/g, '849201')
      .replace(/{{refund_amount}}/g, '₹1,499')
      .replace(/{{cancellation_reason}}/g, 'Customer requested item swap');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="font-bold text-sm">Loading Notification Channels & Workflows...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300'
              : 'bg-rose-950/90 border-rose-600 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" />
            <span>Automated Customer Notifications Studio</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure automated WhatsApp, SMS, and Email alert workflows for order confirmations, shipping updates, and abandoned cart recoveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadConfigs}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveConfig}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Notification Workflows'}</span>
          </button>
        </div>
      </div>

      {/* CHANNELS HERO STATUS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md">
            💬
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 dark:text-emerald-300 block">
              WhatsApp Business API
            </span>
            <span className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm">
              Live & Connected (98.4% Open Rate)
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-800 dark:text-blue-300 block">
              Transactional Email Engine
            </span>
            <span className="font-extrabold text-blue-900 dark:text-blue-200 text-sm">
              SendGrid / Amazon SES Active
            </span>
          </div>
        </div>

        {isSmsPlatformEnabled ? (
          <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-800 dark:text-purple-300 block">
                SMS Gateway (India / Global)
              </span>
              <span className="font-extrabold text-purple-900 dark:text-purple-200 text-sm">
                Gupshup & Twilio Fallback
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4 opacity-75">
            <div className="w-12 h-12 rounded-2xl bg-slate-400 dark:bg-slate-700 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                SMS Gateway
              </span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1 mt-0.5">
                <span>●</span> Disabled by Platform Admin
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TRIGGER WORKFLOW SELECTOR & CONFIGURATION STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Triggers List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs uppercase font-black tracking-wider text-slate-400">
            Automated Alert Triggers ({configs.length})
          </h3>

          <div className="space-y-2">
            {configs.map((conf) => {
              const isSelected = selectedTrigger === conf.trigger;
              return (
                <div
                  key={conf.trigger}
                  onClick={() => setSelectedTrigger(conf.trigger)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 bg-white dark:bg-card shadow-md scale-101'
                      : 'border-slate-200/80 dark:border-border bg-white dark:bg-card hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-foreground">
                      {conf.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {conf.whatsAppEnabled && <span title="WhatsApp Active">💬</span>}
                      {conf.emailEnabled && <span title="Email Active">✉️</span>}
                      {conf.smsEnabled && isSmsPlatformEnabled && <span title="SMS Active">📱</span>}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 block mt-1">
                    {conf.trigger}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Template Editor & Live Device Simulator */}
        {currentConfig && (
          <div className="lg:col-span-8 space-y-6">
            {/* Active Trigger Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
              {/* Trigger Title & Channel Toggles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-foreground">
                    {currentConfig.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Triggered automatically upon event dispatch. Toggle channels to activate.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Send Live Test Alert</span>
                </button>
              </div>

              {/* Multi-Channel Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => handleToggleChannel('whatsAppEnabled')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    currentConfig.whatsAppEnabled
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </span>
                  <span className={`text-[10px] font-black ${currentConfig.whatsAppEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {currentConfig.whatsAppEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>

                <div
                  onClick={() => handleToggleChannel('emailEnabled')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    currentConfig.emailEnabled
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>✉️</span>
                    <span>Email</span>
                  </span>
                  <span className={`text-[10px] font-black ${currentConfig.emailEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                    {currentConfig.emailEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>

                {isSmsPlatformEnabled ? (
                  <div
                    onClick={() => handleToggleChannel('smsEnabled')}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                      currentConfig.smsEnabled
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>📱</span>
                      <span>SMS</span>
                    </span>
                    <span className={`text-[10px] font-black ${currentConfig.smsEnabled ? 'text-purple-600' : 'text-slate-400'}`}>
                      {currentConfig.smsEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => handleToggleChannel('smsEnabled')}
                    title="SMS channel disabled by Master Platform Admin"
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-50 cursor-not-allowed flex items-center justify-between transition"
                  >
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <span>📱</span>
                      <span>SMS</span>
                    </span>
                    <span className="text-[9px] font-black text-rose-500">
                      DISABLED
                    </span>
                  </div>
                )}

                <div
                  onClick={() => handleToggleChannel('pushEnabled')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    currentConfig.pushEnabled
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>🔔</span>
                    <span>Push</span>
                  </span>
                  <span className={`text-[10px] font-black ${currentConfig.pushEnabled ? 'text-amber-600' : 'text-slate-400'}`}>
                    {currentConfig.pushEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Template Editor Tabs */}
              <div className="space-y-4">
                <div className="flex border-b border-slate-100 dark:border-border gap-4">
                  {(['WHATSAPP', 'EMAIL', ...(isSmsPlatformEnabled ? ['SMS' as const] : [])]).map((chan) => {
                    const isChanEnabled =
                      chan === 'WHATSAPP'
                        ? !!currentConfig.whatsAppEnabled
                        : chan === 'EMAIL'
                        ? !!currentConfig.emailEnabled
                        : !!currentConfig.smsEnabled && isSmsPlatformEnabled;

                    return (
                      <button
                        key={chan}
                        type="button"
                        onClick={() => setActiveChannelTab(chan as any)}
                        className={`pb-2.5 text-xs font-black transition border-b-2 flex items-center gap-1.5 ${
                          activeChannelTab === chan
                            ? isChanEnabled
                              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                              : 'border-rose-500 text-rose-500 dark:text-rose-400'
                            : isChanEnabled
                            ? 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            : 'border-transparent text-slate-300 dark:text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <span>
                          {chan === 'WHATSAPP' && '💬 WhatsApp Template'}
                          {chan === 'EMAIL' && '✉️ Email Template'}
                          {chan === 'SMS' && '📱 SMS Template'}
                        </span>
                        {!isChanEnabled && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                            OFF
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Disabled Channel Notice Banner */}
                {((activeChannelTab === 'WHATSAPP' && !currentConfig.whatsAppEnabled) ||
                  (activeChannelTab === 'EMAIL' && !currentConfig.emailEnabled) ||
                  (activeChannelTab === 'SMS' && (!currentConfig.smsEnabled || !isSmsPlatformEnabled))) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      <strong>{activeChannelTab} Channel is Disabled:</strong> This channel is unselected for{' '}
                      <em>{currentConfig.title}</em>. Toggle the switch above to enable automated dispatch.
                    </span>
                  </div>
                )}

                {/* WHATSAPP EDITOR */}
                {activeChannelTab === 'WHATSAPP' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      WhatsApp Message Template Body:
                    </label>
                    <textarea
                      rows={5}
                      value={currentConfig.whatsAppTemplate || ''}
                      onChange={(e) => handleTemplateChange('whatsAppTemplate', e.target.value)}
                      disabled={!currentConfig.whatsAppEnabled}
                      className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {/* EMAIL EDITOR */}
                {activeChannelTab === 'EMAIL' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Subject Line:
                      </label>
                      <input
                        type="text"
                        value={currentConfig.subjectTemplate || ''}
                        onChange={(e) => handleTemplateChange('subjectTemplate', e.target.value)}
                        disabled={!currentConfig.emailEnabled}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Body:
                      </label>
                      <textarea
                        rows={6}
                        value={currentConfig.emailBodyTemplate || ''}
                        onChange={(e) => handleTemplateChange('emailBodyTemplate', e.target.value)}
                        disabled={!currentConfig.emailEnabled}
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-mono text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* SMS EDITOR */}
                {activeChannelTab === 'SMS' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      SMS 160-Character Text:
                    </label>
                    <textarea
                      rows={4}
                      value={currentConfig.smsBodyTemplate || ''}
                      onChange={(e) => handleTemplateChange('smsBodyTemplate', e.target.value)}
                      disabled={!currentConfig.smsEnabled || !isSmsPlatformEnabled}
                      className="w-full p-4 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-mono text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {/* Merge Tags Helper */}
                <div className="p-3.5 bg-slate-50 dark:bg-accent/40 rounded-2xl border text-xs space-y-1.5">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    Available Dynamic Merge Tags:
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <code className="bg-white dark:bg-card px-2 py-0.5 rounded border text-indigo-600">{'{{customer_name}}'}</code>
                    <code className="bg-white dark:bg-card px-2 py-0.5 rounded border text-indigo-600">{'{{store_name}}'}</code>
                    <code className="bg-white dark:bg-card px-2 py-0.5 rounded border text-indigo-600">{'{{order_number}}'}</code>
                    <code className="bg-white dark:bg-card px-2 py-0.5 rounded border text-indigo-600">{'{{total_amount}}'}</code>
                    <code className="bg-white dark:bg-card px-2 py-0.5 rounded border text-indigo-600">{'{{tracking_url}}'}</code>
                    <code className="bg-white dark:bg-card px-2 py-0.5 rounded border text-indigo-600">{'{{recovery_url}}'}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE DEVICE SIMULATOR */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Customer Device Preview ({activeChannelTab})</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Simulated Rendering
                </span>
              </div>

              {((activeChannelTab === 'WHATSAPP' && !currentConfig.whatsAppEnabled) ||
                (activeChannelTab === 'EMAIL' && !currentConfig.emailEnabled) ||
                (activeChannelTab === 'SMS' && (!currentConfig.smsEnabled || !isSmsPlatformEnabled))) ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 max-w-md mx-auto">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{activeChannelTab} Channel is Disabled</h4>
                  <p className="text-xs text-slate-500">
                    This channel is unselected for this trigger event. Switch it ON above to activate live previews.
                  </p>
                </div>
              ) : (
                <>
                  {activeChannelTab === 'WHATSAPP' && (
                    <div className="bg-[#0b141a] p-4 sm:p-5 rounded-2xl border border-emerald-900/30 space-y-2 max-w-md mx-auto">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/10">
                        <span className="font-bold text-emerald-400">OmniStore Verified Business ✓</span>
                        <span>12:45 PM</span>
                      </div>
                      <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tl-none text-xs font-sans whitespace-pre-line shadow-md leading-relaxed">
                        {getRenderedPreview(currentConfig.whatsAppTemplate || '')}
                      </div>
                    </div>
                  )}

                  {activeChannelTab === 'EMAIL' && (
                    <div className="bg-white text-slate-900 p-5 rounded-2xl space-y-3 max-w-md mx-auto text-xs shadow-md">
                      <div className="border-b pb-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Subject:</span>
                        <strong className="text-sm font-black">{getRenderedPreview(currentConfig.subjectTemplate || '')}</strong>
                      </div>
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                        {getRenderedPreview(currentConfig.emailBodyTemplate || '')}
                      </div>
                    </div>
                  )}

                  {activeChannelTab === 'SMS' && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 max-w-md mx-auto">
                      <span className="text-[10px] text-slate-400 block font-bold">SMS Message</span>
                      <div className="p-3.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs">
                        {getRenderedPreview(currentConfig.smsBodyTemplate || '')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SEND TEST MODAL */}
      {isTestModalOpen && currentConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-foreground">
                  Send Test {activeChannelTab} Alert
                </h3>
                <p className="text-xs text-slate-400">
                  Trigger: {currentConfig.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Phone Number or Email *
                </label>
                <input
                  type="text"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                  placeholder="+91 98765 43210 or email@domain.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Sending...' : 'Dispatch Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

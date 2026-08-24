'use client';

import React, { useState, useEffect } from 'react';
import { ApiKeyData, WebhookData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { PlanLockOverlay } from '@/src/components/cms/PlanLockOverlay';
import {
  Code2,
  Key,
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const DeveloperStudio: React.FC = () => {
  const { isStarter, isEnterprise, canUseDeveloperApi, canUseWebhooks } = usePlanAccess();
  const [activeTab, setActiveTab] = useState<'API_KEYS' | 'WEBHOOKS'>('API_KEYS');
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New API Key Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:products', 'read:orders']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyData | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // New Webhook Modal
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['order.created', 'order.paid']);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // Test Dispatch Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testWebhook, setTestWebhook] = useState<WebhookData | null>(null);
  const [testEvent, setTestEvent] = useState('order.created');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Upgrade Modal State
  const [upgradeModalConfig, setUpgradeModalConfig] = useState<{
    isOpen: boolean;
    requiredPlan: 'GROWTH' | 'ENTERPRISE';
    title: string;
    desc: string;
    perks: string[];
  }>({
    isOpen: false,
    requiredPlan: 'GROWTH',
    title: '',
    desc: '',
    perks: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [keys, hooks] = await Promise.all([
        cmsService.getApiKeys(),
        cmsService.getWebhooks(),
      ]);
      setApiKeys(keys);
      setWebhooks(hooks);
    } catch (err) {
      console.error('Failed to load developer settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyNameInput) return;
    setIsCreatingKey(true);
    try {
      const created = await cmsService.createApiKey({
        name: keyNameInput,
        scopes: selectedScopes,
      });
      setNewlyCreatedKey(created);
      await loadData();
      showToast('API Key generated successfully!');
      setKeyNameInput('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create API Key', 'error');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? External apps using it will immediately lose access.')) return;
    try {
      await cmsService.deleteApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      showToast('API Key revoked.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke API Key', 'error');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrlInput) return;
    setIsCreatingWebhook(true);
    try {
      await cmsService.createWebhook({
        url: webhookUrlInput,
        events: selectedEvents,
      });
      await loadData();
      setIsWebhookModalOpen(false);
      setWebhookUrlInput('');
      showToast('Webhook registered successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create Webhook', 'error');
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to remove this webhook endpoint?')) return;
    try {
      await cmsService.deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      showToast('Webhook deleted.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete Webhook', 'error');
    }
  };

  const handleRunTestDispatch = async () => {
    if (!testWebhook) return;
    setIsTesting(true);
    try {
      const res = await cmsService.testWebhookDispatch({
        webhookId: testWebhook.id,
        event: testEvent,
      });
      setTestResult(res);
      showToast('Test event dispatched successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch test webhook', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const AVAILABLE_SCOPES = [
    { id: 'read:products', label: 'Read Products & Inventory' },
    { id: 'write:products', label: 'Create & Edit Products' },
    { id: 'read:orders', label: 'Read Orders & Shipping' },
    { id: 'write:orders', label: 'Update Fulfillment & Status' },
    { id: 'read:customers', label: 'Read Customer Profiles' },
    { id: 'read:inventory', label: 'Inventory Read & Stock Levels' },
    { id: 'write:inventory', label: 'Adjust Real-Time Stock' },
  ];

  const AVAILABLE_EVENTS = [
    { id: 'order.created', label: 'order.created', desc: 'When a customer places a new order' },
    { id: 'order.paid', label: 'order.paid', desc: 'When payment is verified and captured' },
    { id: 'order.shipped', label: 'order.shipped', desc: 'When tracking number is assigned' },
    { id: 'inventory.low', label: 'inventory.low', desc: 'When product stock drops below threshold' },
    { id: 'cart.abandoned', label: 'cart.abandoned', desc: 'When an active cart is abandoned' },
    { id: 'customer.registered', label: 'customer.registered', desc: 'When a new customer signs up' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-3">
            <Code2 className="w-8 h-8 text-indigo-600" />
            <span>Developer Studio & Webhooks</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage scoped REST API keys, real-time webhook subscriptions, and external ERP / automation integrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-border gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('API_KEYS')}
          className={`pb-3 text-sm font-extrabold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'API_KEYS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>REST API Keys ({apiKeys.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('WEBHOOKS')}
          className={`pb-3 text-sm font-extrabold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'WEBHOOKS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>Webhook Subscriptions ({webhooks.length})</span>
        </button>
      </div>

      {/* ── TAB 1: REST API KEYS ────────────────────────────────────────── */}
      {activeTab === 'API_KEYS' && (
        <div className="space-y-6">
          {!canUseDeveloperApi && (
            <PlanLockOverlay
              inline
              requiredPlan="ENTERPRISE"
              featureTitle="REST API Keys & Granular Scopes"
              featureDescription="Generating secure REST API keys to programmatically query products, orders, and update stock requires Scale Enterprise tier."
            />
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              API Keys authenticate external services to query products, update orders, and sync catalog data.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!canUseDeveloperApi) {
                  setUpgradeModalConfig({
                    isOpen: true,
                    requiredPlan: 'ENTERPRISE',
                    title: 'REST API Keys & Scopes',
                    desc: 'Generate secure API keys to integrate custom ERPs, warehouse bots, mobile apps, and catalog syncing services. Requires Scale Enterprise tier.',
                    perks: [
                      'Unlimited REST API Keys',
                      'Granular Scopes (read/write products, orders, inventory)',
                      'Zero Platform Transaction Surcharges',
                      'Unlimited Products & Digital Catalog Capacity',
                      'Dedicated 24/7 VIP SLA & Account Manager',
                    ],
                  });
                  return;
                }
                setNewlyCreatedKey(null);
                setIsKeyModalOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New API Key</span>
            </button>
          </div>

          {/* Keys Table */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-border">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-foreground">{k.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                        {k.keyMasked}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {k.scopes.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Created on {k.createdAt.split('T')[0]} • Last used: {k.lastUsedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(k.fullKey || k.keyMasked, 'API Key')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                      title="Copy Key"
                    >
                      {copiedText === (k.fullKey || k.keyMasked) ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteApiKey(k.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 text-xs font-bold transition"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: WEBHOOK SUBSCRIPTIONS ────────────────────────────────── */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          {isStarter && (
            <PlanLockOverlay
              inline
              requiredPlan="GROWTH"
              featureTitle="Real-Time Webhook Subscriptions"
              featureDescription="Subscribing to automated order, payment, and inventory event webhooks requires Growth Pro or Enterprise tier."
            />
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Webhooks send real-time HTTPS POST payloads whenever key events occur in your store.
            </p>
            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  setUpgradeModalConfig({
                    isOpen: true,
                    requiredPlan: 'GROWTH',
                    title: 'Real-Time Webhooks Engine',
                    desc: 'Subscribe to automatic event triggers (order.created, order.paid, inventory.low) with instant webhook notifications. Requires Growth Pro or Scale Enterprise tier.',
                    perks: [
                      'Real-Time HTTPS Webhook Subscriptions',
                      'Test Event Dispatch Simulator with Latency Benchmarks',
                      'Up to 1,000 Products Listing Capacity',
                      'Custom Apex Domains & SSL Included',
                      '0.5% Low Platform Transaction Fee',
                    ],
                  });
                  return;
                }
                setIsWebhookModalOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Webhook Endpoint</span>
            </button>
          </div>

          {/* Webhooks Grid */}
          <div className="grid grid-cols-1 gap-4">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-foreground break-all">{wh.url}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Secret: {wh.secret}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTestWebhook(wh);
                        setTestResult(null);
                        setIsTestModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Test Dispatch</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 text-xs transition"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-border">
                  <span className="text-[11px] font-bold text-slate-400">Events:</span>
                  {wh.events.map((ev) => (
                    <span key={ev} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-accent text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                      {ev}
                    </span>
                  ))}
                  <span className="ml-auto text-[11px] font-bold text-emerald-600">
                    {wh.successRate} Delivery Success ({wh.totalDispatches} Dispatched)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="text-base font-black text-slate-900 dark:text-foreground">Generate New API Key</h3>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            {newlyCreatedKey ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">
                    ✨ API Key Created Successfully!
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Make sure to copy your key now. You will not be able to see it again!
                  </p>
                  <div className="p-3 bg-white dark:bg-card rounded-xl border border-emerald-300 font-mono break-all flex items-center justify-between gap-2">
                    <span className="font-bold">{newlyCreatedKey.fullKey}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(newlyCreatedKey.fullKey!, 'Secret Key')}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Key Name / App Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERP Inventory Sync / Mobile App"
                    value={keyNameInput}
                    onChange={(e) => setKeyNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Scoped Permissions:</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {AVAILABLE_SCOPES.map((sc) => {
                      const isChecked = selectedScopes.includes(sc.id);
                      return (
                        <label
                          key={sc.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 dark:border-border cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedScopes((prev) =>
                                isChecked ? prev.filter((s) => s !== sc.id) : [...prev, sc.id]
                              );
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{sc.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-accent font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingKey}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md"
                  >
                    {isCreatingKey ? 'Generating...' : 'Create API Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE WEBHOOK MODAL */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <h3 className="text-base font-black text-slate-900 dark:text-foreground">Register Webhook Endpoint</h3>
              <button
                type="button"
                onClick={() => setIsWebhookModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payload URL (HTTPS) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/orders"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Subscribe to Events:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {AVAILABLE_EVENTS.map((ev) => {
                    const isChecked = selectedEvents.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl border border-slate-100 dark:border-border cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedEvents((prev) =>
                              isChecked ? prev.filter((e) => e !== ev.id) : [...prev, ev.id]
                            );
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        />
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-foreground block">{ev.label}</span>
                          <span className="text-[10px] text-slate-400">{ev.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-accent font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWebhook}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md"
                >
                  {isCreatingWebhook ? 'Saving...' : 'Add Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEST DISPATCH MODAL */}
      {isTestModalOpen && testWebhook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-foreground">Test Webhook Dispatch</h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{testWebhook.url}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Event to Dispatch:</label>
                <select
                  value={testEvent}
                  onChange={(e) => setTestEvent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                >
                  {testWebhook.events.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={isTesting}
                onClick={handleRunTestDispatch}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Sending Payload...' : 'Dispatch Test Event'}</span>
              </button>

              {testResult && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>HTTP {testResult.httpStatus} OK ({testResult.latencyMs}ms)</span>
                    </span>
                    <span className="text-slate-400 font-mono">{testResult.event}</span>
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[10px] overflow-x-auto max-h-48">
                    <pre>{JSON.stringify(testResult.dispatchedPayload, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal Dialog */}
      {upgradeModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setUpgradeModalConfig({ ...upgradeModalConfig, isOpen: false })}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-accent text-slate-500 hover:text-slate-900 transition"
            >
              ✕
            </button>
            <PlanLockOverlay
              requiredPlan={upgradeModalConfig.requiredPlan}
              featureTitle={upgradeModalConfig.title}
              featureDescription={upgradeModalConfig.desc}
              perks={upgradeModalConfig.perks}
            />
          </div>
        </div>
      )}
    </div>
  );
};

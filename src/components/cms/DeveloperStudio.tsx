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
  BookOpen,
  Activity,
  Lock,
  Globe,
  ShoppingCart,
  User,
  Search,
  Package,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'API' | 'API_KEYS' | 'WEBHOOKS' | 'LOGS' | 'DOCS';

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  apiKey: string;
  timestamp: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STOREFRONT_SCOPES = [
  { id: 'store.read',       label: 'Store Info',       desc: 'Read public store metadata, currency, social links', icon: Globe },
  { id: 'products.read',    label: 'Products',          desc: 'Browse products, search, filter, and pagination', icon: Package },
  { id: 'collections.read', label: 'Collections',       desc: 'List and query collections and their products', icon: Layers },
  { id: 'categories.read',  label: 'Categories',        desc: 'List and query store categories', icon: Layers },
  { id: 'search.read',      label: 'Search',            desc: 'Full-text search across products, collections, categories', icon: Search },
  { id: 'cart.read',        label: 'Cart Read',         desc: 'Retrieve cart state and item details', icon: ShoppingCart },
  { id: 'cart.write',       label: 'Cart Write',        desc: 'Create carts, add, update, and remove items', icon: ShoppingCart },
  { id: 'checkout.write',   label: 'Checkout',          desc: 'Initiate checkout sessions — payment handled by gateway', icon: Zap },
  { id: 'customer.read',    label: 'Customer Read',     desc: 'Authenticated customer can read their own profile', icon: User },
  { id: 'customer.write',   label: 'Customer Write',    desc: 'Register, login, update own customer profile', icon: User },
  { id: 'content.read',     label: 'Content',           desc: 'Read pages, blog posts, and navigation menus', icon: BookOpen },
];

const STOREFRONT_EVENTS = [
  { id: 'checkout.completed', label: 'checkout.completed', desc: 'Customer completes checkout and payment is captured', group: 'Order' },
  { id: 'payment.completed',  label: 'payment.completed',  desc: 'Payment verified and captured by payment gateway', group: 'Order' },
  { id: 'order.confirmed',    label: 'order.confirmed',    desc: 'Order confirmed and accepted by the merchant', group: 'Order' },
  { id: 'order.fulfilled',    label: 'order.fulfilled',    desc: 'All items in the order have been packed', group: 'Order' },
  { id: 'order.shipped',      label: 'order.shipped',      desc: 'Tracking number assigned; order dispatched', group: 'Order' },
  { id: 'order.delivered',    label: 'order.delivered',    desc: 'Order delivered to the customer', group: 'Order' },
  { id: 'order.cancelled',    label: 'order.cancelled',    desc: 'Order cancelled before or after fulfillment', group: 'Order' },
  { id: 'product.updated',    label: 'product.updated',    desc: 'Product details or pricing changed — sync your cache', group: 'Catalog' },
  { id: 'inventory.updated',  label: 'inventory.updated',  desc: 'Stock level changed — sync inventory counts', group: 'Catalog' },
  { id: 'collection.updated', label: 'collection.updated', desc: 'Collection updated — refresh your listings', group: 'Catalog' },
];

const API_DOCS = [
  {
    group: 'Store',
    color: 'text-blue-600 bg-blue-50',
    endpoints: [
      { method: 'GET', path: '/api/v1/store', desc: 'Public store metadata: name, currency, logo, social links, announcement banner.' },
    ],
  },
  {
    group: 'Products',
    color: 'text-emerald-600 bg-emerald-50',
    endpoints: [
      { method: 'GET', path: '/api/v1/products', desc: 'List products. Query: search, q, category, collection, brand, minPrice, maxPrice, availability, sort, page, limit.' },
      { method: 'GET', path: '/api/v1/products/:id', desc: 'Get product by id or urlSlug.' },
    ],
  },
  {
    group: 'Collections',
    color: 'text-violet-600 bg-violet-50',
    endpoints: [
      { method: 'GET', path: '/api/v1/collections', desc: 'List all collections.' },
      { method: 'GET', path: '/api/v1/collections/:id', desc: 'Get collection by id or slug.' },
      { method: 'GET', path: '/api/v1/collections/:id/products', desc: 'Get products in a collection. Supports sort, page, limit.' },
    ],
  },
  {
    group: 'Categories',
    color: 'text-amber-600 bg-amber-50',
    endpoints: [
      { method: 'GET', path: '/api/v1/categories', desc: 'List all store categories.' },
      { method: 'GET', path: '/api/v1/categories/:id', desc: 'Get category by id or slug.' },
    ],
  },
  {
    group: 'Search',
    color: 'text-sky-600 bg-sky-50',
    endpoints: [
      { method: 'GET', path: '/api/v1/search?q=shirt', desc: 'Full-text search. Returns: { products, collections, categories }.' },
    ],
  },
  {
    group: 'Cart',
    color: 'text-orange-600 bg-orange-50',
    endpoints: [
      { method: 'POST',   path: '/api/v1/cart', desc: 'Create a new empty cart. Returns cart_id.' },
      { method: 'GET',    path: '/api/v1/cart/:id', desc: 'Retrieve cart state with real-time stock validation.' },
      { method: 'POST',   path: '/api/v1/cart/:id/items', desc: 'Add item. Body: { product_id, variant_id?, quantity?, options? }' },
      { method: 'PATCH',  path: '/api/v1/cart/:id/items/:itemId', desc: 'Update item quantity. Body: { quantity }. Set 0 to remove.' },
      { method: 'DELETE', path: '/api/v1/cart/:id/items/:itemId', desc: 'Remove item from cart.' },
    ],
  },
  {
    group: 'Checkout',
    color: 'text-rose-600 bg-rose-50',
    endpoints: [
      { method: 'POST', path: '/api/v1/checkout', desc: 'Initiate checkout. Returns pricing summary + payment gateway configs (no credentials exposed). Body: { cart_id, customer, shipping_address, coupon_code? }' },
      { method: 'GET',  path: '/api/v1/checkout/:id', desc: 'Get checkout session status and next-step guide.' },
    ],
  },
  {
    group: 'Customers',
    color: 'text-teal-600 bg-teal-50',
    endpoints: [
      { method: 'POST',  path: '/api/v1/customers', desc: 'Register new customer. Body: { name, email, password, phone? }. Returns customer_token.' },
      { method: 'POST',  path: '/api/v1/customers/login', desc: 'Authenticate customer. Returns customer_token.' },
      { method: 'GET',   path: '/api/v1/customers/me', desc: 'Get authenticated customer profile. Requires: Authorization: Bearer <customer_token>.' },
      { method: 'PATCH', path: '/api/v1/customers/me', desc: 'Update own name, phone, or default_address. Requires customer_token.' },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  POST:   'bg-blue-100 text-blue-700 border border-blue-200',
  PATCH:  'bg-amber-100 text-amber-700 border border-amber-200',
  DELETE: 'bg-rose-100 text-rose-700 border border-rose-200',
  PUT:    'bg-violet-100 text-violet-700 border border-violet-200',
};

const STATUS_COLORS: Record<number, string> = {
  200: 'text-emerald-600 bg-emerald-50',
  201: 'text-blue-600 bg-blue-50',
  400: 'text-amber-600 bg-amber-50',
  401: 'text-orange-600 bg-orange-50',
  404: 'text-rose-600 bg-rose-50',
  500: 'text-red-700 bg-red-50',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const DeveloperStudio: React.FC = () => {
  const { isStarter, isEnterprise, canUseDeveloperApi, canUseWebhooks } = usePlanAccess();
  const [activeTab, setActiveTab] = useState<TabId>('API');
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  // New API Key Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['store.read', 'products.read', 'collections.read', 'search.read', 'cart.read', 'cart.write', 'checkout.write']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyData | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // New Webhook Modal
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['checkout.completed', 'order.confirmed', 'order.shipped']);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // Test Dispatch Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testWebhook, setTestWebhook] = useState<WebhookData | null>(null);
  const [testEvent, setTestEvent] = useState('checkout.completed');
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
      const [keys, hooks, logs] = await Promise.all([
        cmsService.getApiKeys(),
        cmsService.getWebhooks(),
        cmsService.getApiLogs().catch(() => []),
      ]);
      setApiKeys(keys);
      setWebhooks(hooks);
      setApiLogs(logs);
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
      const created = await cmsService.createApiKey({ name: keyNameInput, scopes: selectedScopes });
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
    if (!confirm('Revoke this API key? All apps using it will immediately lose access.')) return;
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
      await cmsService.createWebhook({ url: webhookUrlInput, events: selectedEvents });
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
    if (!confirm('Remove this webhook endpoint?')) return;
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
      const res = await cmsService.testWebhookDispatch({ webhookId: testWebhook.id, event: testEvent });
      setTestResult(res);
      showToast('Test event dispatched!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to dispatch', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_API_URL || 'http://localhost:5002';

  const CURL_EXAMPLE = `curl -X GET "${BASE_URL}/api/v1/products?limit=10" \\
  -H "X-Storefront-Key: pk_live_YOUR_KEY" \\
  -H "Content-Type: application/json"`;

  const JS_EXAMPLE = `// Fetch products using your Storefront API Key
const response = await fetch('${BASE_URL}/api/v1/products', {
  headers: {
    'X-Storefront-Key': 'pk_live_YOUR_KEY',
  },
});
const { data, pagination } = await response.json();`;

  const CART_FLOW = `// 1. Create cart
const { data: cart } = await fetch('/api/v1/cart', { method: 'POST', ... }).then(r => r.json());

// 2. Add item
await fetch(\`/api/v1/cart/\${cart.cart_id}/items\`, {
  method: 'POST',
  body: JSON.stringify({ product_id: 'prod_xxx', quantity: 2 })
});

// 3. Checkout
const { data: checkout } = await fetch('/api/v1/checkout', {
  method: 'POST',
  body: JSON.stringify({
    cart_id: cart.cart_id,
    customer: { email: 'user@example.com' },
    shipping_address: { city: 'Chennai', postal_code: '600001' }
  })
}).then(r => r.json());`;

  // ─── Tabs ──────────────────────────────────────────────────────────────────

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'API',      label: 'API Overview', icon: Terminal },
    { id: 'API_KEYS', label: 'API Keys',     icon: Key },
    { id: 'WEBHOOKS', label: 'Webhooks',     icon: Webhook },
    { id: 'LOGS',     label: 'API Logs',     icon: Activity },
    { id: 'DOCS',     label: 'Documentation', icon: BookOpen },
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
            <span>Developer API</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build custom storefronts and integrations on top of your store using the public{' '}
            <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs font-mono">/api/v1</code> REST API.
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-border gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap mr-4 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: API Overview ─────────────────────────────────────────────────── */}
      {activeTab === 'API' && (
        <div className="space-y-8">
          {/* Base URL Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono uppercase tracking-widest">
              <Globe className="w-4 h-4" /> Base URL
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 font-mono text-lg">
              <span className="text-slate-400">{BASE_URL}</span>
              <span className="text-indigo-300 font-bold">/api/v1</span>
              <button
                onClick={() => copyToClipboard(`${BASE_URL}/api/v1`, 'Base URL')}
                className="ml-auto text-slate-400 hover:text-white transition"
              >
                {copiedText === `${BASE_URL}/api/v1` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-indigo-300 font-mono uppercase mb-1">Public Endpoints</div>
                <div className="text-sm text-white font-medium">
                  <code className="text-indigo-200">X-Storefront-Key: pk_live_xxx</code>
                </div>
                <div className="text-xs text-slate-400 mt-1">Required on every request</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-teal-300 font-mono uppercase mb-1">Customer Endpoints</div>
                <div className="text-sm text-white font-medium">
                  <code className="text-teal-200">Authorization: Bearer &lt;customer_token&gt;</code>
                </div>
                <div className="text-xs text-slate-400 mt-1">For /customers/me endpoints</div>
              </div>
            </div>
          </div>

          {/* Architecture */}
          <div className="rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent/30 p-6">
            <h3 className="font-bold text-slate-900 dark:text-foreground text-base mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Architecture — Two Separate APIs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400 mb-2">CMS API (Admin)</div>
                <div className="space-y-1 text-xs font-mono text-emerald-300">
                  <div>POST /api/products ← manage</div>
                  <div>GET  /api/orders   ← manage</div>
                  <div>GET  /api/customers← manage</div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-amber-400 text-xs">
                  <Lock className="w-3 h-3" /> Merchant JWT only
                </div>
              </div>
              <div className="bg-indigo-900 text-white rounded-xl p-4">
                <div className="text-xs font-mono text-indigo-300 mb-2">Developer API (Storefront)</div>
                <div className="space-y-1 text-xs font-mono text-sky-300">
                  <div>GET  /api/v1/products ← browse</div>
                  <div>POST /api/v1/cart     ← purchase</div>
                  <div>POST /api/v1/checkout ← pay</div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-indigo-300 text-xs">
                  <ShieldCheck className="w-3 h-3" /> Storefront Key
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-foreground text-base flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-500" />
              Quick Start
            </h3>
            <div className="space-y-3">
              {[
                { label: 'cURL — Fetch Products', code: CURL_EXAMPLE },
                { label: 'JavaScript / TypeScript', code: JS_EXAMPLE },
                { label: 'Complete Cart → Checkout Flow', code: CART_FLOW },
              ].map((ex) => (
                <div key={ex.label} className="rounded-xl border border-slate-200 dark:border-border overflow-hidden">
                  <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
                    <span className="text-xs text-slate-400 font-mono">{ex.label}</span>
                    <button
                      onClick={() => copyToClipboard(ex.code, ex.label)}
                      className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
                    >
                      {copiedText === ex.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedText === ex.code ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-emerald-300 text-xs font-mono p-4 overflow-x-auto leading-relaxed">
                    {ex.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Flow Diagram */}
          <div className="rounded-2xl border border-slate-200 dark:border-border p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-foreground text-base">Complete Purchase Flow</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                'GET /products',
                'GET /collections',
                'POST /cart',
                'POST /cart/:id/items',
                'POST /checkout',
                'Payment Gateway',
                'checkout.completed webhook',
              ].map((step, i) => (
                <React.Fragment key={step}>
                  <span className={`px-3 py-1.5 rounded-full font-mono font-bold ${i === 5 ? 'bg-amber-100 text-amber-700' : i === 6 ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {step}
                  </span>
                  {i < 6 && <ArrowRight className="w-3 h-3 text-slate-400" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: API Keys ─────────────────────────────────────────────────────── */}
      {activeTab === 'API_KEYS' && (
        <div className="space-y-6">
          {!canUseDeveloperApi ? (
            <PlanLockOverlay
              requiredPlan="API"
              featureTitle="Storefront API Keys"
              featureDescription="Developer API is a dedicated add-on (1,000/mo). Activate it to generate public API keys and access /api/v1 without altering your current store plan."
            />
          ) : (
            <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">
                  Use <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs">pk_live_</code> keys for all <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs">/api/v1</code> requests.
                </p>
              </div>
              <button
                onClick={() => { setIsKeyModalOpen(true); setNewlyCreatedKey(null); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> New API Key
              </button>
            </div>

            {/* Newly created key reveal */}
            {newlyCreatedKey && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-900 mb-1">Key generated — copy it now, it won't be shown again.</p>
                    <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-700 overflow-x-auto">
                      <span className="truncate">{newlyCreatedKey.fullKey}</span>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedKey.fullKey ?? '', 'API Key')}
                        className="ml-auto shrink-0 text-emerald-700 hover:text-emerald-900"
                      >
                        {copiedText === newlyCreatedKey.fullKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keys List */}
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Key className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-foreground text-sm">{key.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-slate-500 font-mono">
                            {visibleKey === key.id ? key.fullKey : key.keyMasked}
                          </code>
                          <button onClick={() => setVisibleKey(visibleKey === key.id ? null : key.id)} className="text-slate-400 hover:text-slate-600 transition">
                            {visibleKey === key.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => copyToClipboard(key.fullKey ?? '', 'API Key')} className="text-slate-400 hover:text-slate-600 transition">
                            {copiedText === key.fullKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteApiKey(key.id)} className="text-slate-400 hover:text-rose-600 transition shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {key.scopes.map((scope) => (
                      <span key={scope} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono border border-indigo-100">
                        {scope}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                    <span>Last used: {key.lastUsedAt}</span>
                    <span>Created: {new Date(key.createdAt ?? Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-400">
                  <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No API keys yet. Generate one to get started.</p>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Webhooks ─────────────────────────────────────────────────────── */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          {!canUseWebhooks ? (
            <PlanLockOverlay
              requiredPlan="API"
              featureTitle="Webhooks"
              featureDescription="Subscribe to real-time storefront events like checkout.completed. Requires the API Tier add-on (1,000/mo) without changing your base store plan."
            />
          ) : (
            <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Your endpoint receives a POST with a signed payload and a <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs">X-Webhook-Secret</code> header.
              </p>
              <button
                onClick={() => setIsWebhookModalOpen(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Endpoint
              </button>
            </div>

            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                        <Webhook className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-slate-700 dark:text-foreground font-bold truncate">{wh.url}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {wh.totalDispatches} dispatches · {wh.successRate} success
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setTestWebhook(wh); setTestResult(null); setIsTestModalOpen(true); }}
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <Send className="w-3.5 h-3.5" /> Test
                      </button>
                      <button onClick={() => handleDeleteWebhook(wh.id)} className="text-slate-400 hover:text-rose-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {wh.events.map((ev) => (
                      <span key={ev} className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold font-mono border border-violet-100">
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${wh.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {wh.status}
                    </span>
                    <span>Created: {new Date(wh.createdAt ?? Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {webhooks.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-400">
                  <Webhook className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No webhook endpoints registered yet.</p>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: API Logs ─────────────────────────────────────────────────────── */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Recent API requests to your <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs">/api/v1</code> endpoints.</p>
            <button onClick={loadData} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-border overflow-hidden">
            <div className="bg-slate-50 dark:bg-accent px-4 py-3 grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <div className="col-span-1">Method</div>
              <div className="col-span-4">Endpoint</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Latency</div>
              <div className="col-span-2">API Key</div>
              <div className="col-span-1">Time</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-border">
              {apiLogs.map((log) => (
                <div key={log.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-center text-xs hover:bg-slate-50 dark:hover:bg-accent/50 transition">
                  <div className="col-span-1">
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${METHOD_COLORS[log.method] || 'bg-slate-100 text-slate-600'}`}>
                      {log.method}
                    </span>
                  </div>
                  <div className="col-span-4 font-mono text-slate-700 dark:text-foreground truncate" title={log.endpoint}>
                    {log.endpoint}
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${STATUS_COLORS[log.statusCode] || 'text-slate-600 bg-slate-100'}`}>
                      {log.statusCode}
                    </span>
                  </div>
                  <div className="col-span-2 text-slate-500 font-mono">{log.latencyMs}ms</div>
                  <div className="col-span-2 font-mono text-slate-400 truncate text-[10px]">{log.apiKey}</div>
                  <div className="col-span-1 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {apiLogs.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No API requests logged yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Documentation ────────────────────────────────────────────────── */}
      {activeTab === 'DOCS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
            <div>
              <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Interactive Developer API Documentation & Sandbox</span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300/80 mt-0.5">
                Complete guide with query/body parameters, 200/201 success payloads, 400/401/404 failure responses, and code snippets.
              </p>
            </div>
            <a
              href="/docs"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm"
            >
              <span>Open Full Docs (/docs)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-sm text-slate-500">
            Complete endpoint reference for the Developer API. All endpoints require the <code className="text-indigo-600 bg-indigo-50 px-1 rounded text-xs">X-Storefront-Key</code> header.
          </p>

          {API_DOCS.map((group) => (
            <div key={group.group} className="rounded-2xl border border-slate-200 dark:border-border overflow-hidden">
              <button
                onClick={() => setExpandedDoc(expandedDoc === group.group ? null : group.group)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-accent/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${group.color}`}>{group.group}</span>
                  <span className="text-xs text-slate-400">{group.endpoints.length} endpoint{group.endpoints.length > 1 ? 's' : ''}</span>
                </div>
                {expandedDoc === group.group ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {expandedDoc === group.group && (
                <div className="border-t border-slate-100 dark:border-border divide-y divide-slate-100 dark:divide-border">
                  {group.endpoints.map((ep) => (
                    <div key={ep.path} className="px-5 py-4 bg-slate-50 dark:bg-accent/30">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${METHOD_COLORS[ep.method] || ''}`}>
                          {ep.method}
                        </span>
                        <code className="font-mono text-sm text-slate-800 dark:text-foreground font-medium">{ep.path}</code>
                        <button
                          onClick={() => copyToClipboard(`${BASE_URL}${ep.path}`, ep.path)}
                          className="ml-auto text-slate-400 hover:text-slate-600 transition"
                        >
                          {copiedText === `${BASE_URL}${ep.path}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{ep.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Scopes Reference */}
          <div className="rounded-2xl border border-slate-200 dark:border-border overflow-hidden">
            <button
              onClick={() => setExpandedDoc(expandedDoc === 'SCOPES' ? null : 'SCOPES')}
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-card hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-indigo-600 bg-indigo-50">Scopes Reference</span>
                <span className="text-xs text-slate-400">{STOREFRONT_SCOPES.length} scopes</span>
              </div>
              {expandedDoc === 'SCOPES' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedDoc === 'SCOPES' && (
              <div className="border-t border-slate-100 dark:border-border divide-y divide-slate-100">
                {STOREFRONT_SCOPES.map((scope) => (
                  <div key={scope.id} className="px-5 py-3 bg-slate-50 dark:bg-accent/30 flex items-start gap-3">
                    <code className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded shrink-0">{scope.id}</code>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-foreground">{scope.label}</div>
                      <div className="text-xs text-slate-500">{scope.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Events Reference */}
          <div className="rounded-2xl border border-slate-200 dark:border-border overflow-hidden">
            <button
              onClick={() => setExpandedDoc(expandedDoc === 'EVENTS' ? null : 'EVENTS')}
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-card hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-violet-600 bg-violet-50">Webhook Events</span>
                <span className="text-xs text-slate-400">{STOREFRONT_EVENTS.length} events</span>
              </div>
              {expandedDoc === 'EVENTS' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>
            {expandedDoc === 'EVENTS' && (
              <div className="border-t border-slate-100 dark:border-border divide-y divide-slate-100">
                {STOREFRONT_EVENTS.map((ev) => (
                  <div key={ev.id} className="px-5 py-3 bg-slate-50 dark:bg-accent/30 flex items-start gap-3">
                    <code className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded shrink-0">{ev.label}</code>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{ev.group}</div>
                      <div className="text-xs text-slate-500">{ev.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Create API Key ──────────────────────────────────────────────── */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateApiKey}>
              <div className="p-6 border-b border-slate-100 dark:border-border flex items-center justify-between">
                <h2 className="font-black text-xl text-slate-900 dark:text-foreground flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" /> New Storefront API Key
                </h2>
                <button type="button" onClick={() => setIsKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1.5">Key Name</label>
                  <input
                    required
                    value={keyNameInput}
                    onChange={(e) => setKeyNameInput(e.target.value)}
                    placeholder="e.g. React Native Mobile App"
                    className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-2">Storefront Scopes</label>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                    {STOREFRONT_SCOPES.map((scope) => {
                      const Icon = scope.icon;
                      const checked = selectedScopes.includes(scope.id);
                      return (
                        <label key={scope.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${checked ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-border hover:bg-slate-50'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleScope(scope.id)}
                            className="mt-0.5"
                          />
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${checked ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-foreground font-mono">{scope.id}</div>
                            <div className="text-xs text-slate-500">{scope.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-border flex gap-3 justify-end">
                <button type="button" onClick={() => setIsKeyModalOpen(false)} className="px-4 py-2.5 text-sm text-slate-600 rounded-xl hover:bg-slate-100 transition font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={isCreatingKey || !keyNameInput || selectedScopes.length === 0}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
                >
                  {isCreatingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Create Webhook ──────────────────────────────────────────────── */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateWebhook}>
              <div className="p-6 border-b border-slate-100 dark:border-border flex items-center justify-between">
                <h2 className="font-black text-xl text-slate-900 dark:text-foreground flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-violet-600" /> Register Webhook Endpoint
                </h2>
                <button type="button" onClick={() => setIsWebhookModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1.5">Endpoint URL</label>
                  <input
                    required
                    type="url"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    placeholder="https://your-app.com/webhooks/shoppify"
                    className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-2">Subscribe to Events</label>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {['Order', 'Catalog'].map((grp) => (
                      <div key={grp}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 pt-2 pb-1">{grp} Events</div>
                        {STOREFRONT_EVENTS.filter((e) => e.group === grp).map((ev) => {
                          const checked = selectedEvents.includes(ev.id);
                          return (
                            <label key={ev.id} className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition ${checked ? 'border-violet-300 bg-violet-50 dark:bg-violet-900/20' : 'border-transparent hover:bg-slate-50'}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleEvent(ev.id)} className="mt-0.5" />
                              <div>
                                <div className="text-xs font-bold font-mono text-slate-800 dark:text-foreground">{ev.label}</div>
                                <div className="text-xs text-slate-500">{ev.desc}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-border flex gap-3 justify-end">
                <button type="button" onClick={() => setIsWebhookModalOpen(false)} className="px-4 py-2.5 text-sm text-slate-600 rounded-xl hover:bg-slate-100 transition font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={isCreatingWebhook || !webhookUrlInput || selectedEvents.length === 0}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
                >
                  {isCreatingWebhook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Test Webhook Dispatch ────────────────────────────────────────── */}
      {isTestModalOpen && testWebhook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-border flex items-center justify-between">
              <h2 className="font-black text-xl text-slate-900 dark:text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" /> Test Webhook Dispatch
              </h2>
              <button type="button" onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1.5">Target URL</label>
                <div className="font-mono text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">{testWebhook.url}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1.5">Event</label>
                <select
                  value={testEvent}
                  onChange={(e) => setTestEvent(e.target.value)}
                  className="w-full border border-slate-200 dark:border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-background"
                >
                  {STOREFRONT_EVENTS.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.label} — {ev.desc}</option>
                  ))}
                </select>
              </div>
              {testResult && (
                <div className={`rounded-xl p-4 border ${testResult.httpStatus === 200 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.httpStatus === 200 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span className="text-xs font-bold">HTTP {testResult.httpStatus} · {testResult.latencyMs}ms</span>
                  </div>
                  <pre className="text-xs text-slate-700 overflow-x-auto bg-white rounded-lg p-3 max-h-48 border border-slate-200">
                    {JSON.stringify(testResult.dispatchedPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-border flex gap-3 justify-end">
              <button type="button" onClick={() => setIsTestModalOpen(false)} className="px-4 py-2.5 text-sm text-slate-600 rounded-xl hover:bg-slate-100 transition font-bold">Close</button>
              <button
                onClick={handleRunTestDispatch}
                disabled={isTesting}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Dispatch Test Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

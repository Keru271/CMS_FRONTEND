'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  Upload,
  LinkIcon,
  Unlink,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Code2,
  Send,
  Eye,
  Info,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WhatsAppTemplate {
  id: string;
  storeId?: string | null;
  metaTemplateId?: string | null;
  name: string;
  displayName?: string | null;
  language: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED';
  componentsJson?: string | null;
  triggerMapping?: string | null;
  rejectionReason?: string | null;
  qualityScore?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  parameters: { varKey: string; type?: string }[];
}

const TRIGGER_OPTIONS = [
  { value: 'ORDER_CONFIRMATION', label: '📦 Order Confirmation' },
  { value: 'ORDER_SHIPPED', label: '🚚 Order Shipped' },
  { value: 'ORDER_DELIVERED', label: '🎁 Order Delivered' },
  { value: 'ORDER_CANCELLED', label: '❌ Order Cancelled' },
  { value: 'REFUND', label: '💸 Refund Issued' },
  { value: 'CUSTOMER_REGISTRATION', label: '👋 Customer Registration' },
  { value: 'PASSWORD_RESET', label: '🔐 Password Reset' },
  { value: 'ABANDONED_CART', label: '🛒 Abandoned Cart' },
  { value: 'BROADCAST', label: '📢 Manual Broadcast' },
];

const VARIABLE_SUGGESTIONS = [
  'customer_name', 'store_name', 'order_number', 'total_amount',
  'tracking_url', 'tracking_number', 'carrier', 'refund_amount',
  'otp_code', 'cart_recovery_url', 'cancellation_reason',
];

const CATEGORY_COLORS: Record<string, string> = {
  UTILITY: 'bg-blue-50 text-blue-700 border-blue-200',
  MARKETING: 'bg-purple-50 text-purple-700 border-purple-200',
  AUTHENTICATION: 'bg-amber-50 text-amber-700 border-amber-200',
};

interface WhatsAppTemplateManagerProps {
  storeId?: string;
  apiBase?: string;
}

// Auth header helper — matches the axios interceptor pattern
function getAuthHeaders(storeId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  if (storeId) headers['x-store-id'] = storeId;
  return headers;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    APPROVED: { icon: <CheckCircle2 size={12} />, cls: 'bg-green-50 text-green-700 border-green-200', label: 'Approved' },
    PENDING: { icon: <Clock size={12} />, cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
    REJECTED: { icon: <XCircle size={12} />, cls: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
    PAUSED: { icon: <AlertTriangle size={12} />, cls: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Paused' },
  };
  const s = map[status] || map['PENDING'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Variable Mapping Editor ──────────────────────────────────────────────────

function VariableMappingEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [parseError, setParseError] = useState('');

  useEffect(() => {
    if (!value) { setComponents([]); return; }
    try {
      setComponents(JSON.parse(value));
      setParseError('');
    } catch {
      setParseError('Invalid JSON');
    }
  }, [value]);

  const update = (updated: TemplateComponent[]) => {
    setComponents(updated);
    onChange(JSON.stringify(updated, null, 2));
  };

  const addComponent = () => {
    update([...components, { type: 'body', parameters: [] }]);
  };

  const addParam = (ci: number) => {
    const c = [...components];
    c[ci].parameters.push({ varKey: '' });
    update(c);
  };

  const removeParam = (ci: number, pi: number) => {
    const c = [...components];
    c[ci].parameters.splice(pi, 1);
    update(c);
  };

  const removeComponent = (ci: number) => {
    const c = [...components];
    c.splice(ci, 1);
    update(c);
  };

  return (
    <div className="space-y-3">
      {parseError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {parseError}
        </div>
      )}

      {components.map((comp, ci) => (
        <div key={ci} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <select
                value={comp.type}
                onChange={(e) => {
                  const c = [...components];
                  c[ci].type = e.target.value as any;
                  update(c);
                }}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                {['header', 'body', 'footer', 'button'].map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">{comp.parameters.length} variable(s)</span>
            </div>
            <button
              onClick={() => removeComponent(ci)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {comp.parameters.map((param, pi) => (
              <div key={pi} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6 text-right">{'{{' + (pi + 1) + '}}'}</span>
                <input
                  list={`vars-${ci}-${pi}`}
                  value={param.varKey}
                  onChange={(e) => {
                    const c = [...components];
                    c[ci].parameters[pi].varKey = e.target.value;
                    update(c);
                  }}
                  placeholder="variable_name"
                  className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 bg-white font-mono"
                />
                <datalist id={`vars-${ci}-${pi}`}>
                  {VARIABLE_SUGGESTIONS.map((v) => <option key={v} value={v} />)}
                </datalist>
                <button
                  onClick={() => removeParam(ci, pi)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => addParam(ci)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={12} /> Add variable
          </button>
        </div>
      ))}

      <button
        onClick={addComponent}
        className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
      >
        <Plus size={12} /> Add component section
      </button>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onRefresh,
  onDelete,
  onSetTrigger,
  onUnsetTrigger,
  apiBase,
  storeId,
}: {
  template: WhatsAppTemplate;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onSetTrigger: (id: string, trigger: string) => void;
  onUnsetTrigger: (id: string) => void;
  apiBase: string;
  storeId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingComponents, setEditingComponents] = useState(template.componentsJson || '');
  const [savingComponents, setSavingComponents] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(template.triggerMapping || '');

  const saveComponents = async () => {
    setSavingComponents(true);
    try {
      const res = await fetch(`${apiBase}/whatsapp/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(storeId ? { 'x-store-id': storeId } : {}) },
        body: JSON.stringify({ componentsJson: editingComponents }),
      });
      if (res.ok) onRefresh();
    } finally {
      setSavingComponents(false);
    }
  };

  const categoryTag = CATEGORY_COLORS[template.category] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm truncate font-mono">
              {template.name}
            </span>
            <StatusBadge status={template.status} />
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${categoryTag}`}>
              {template.category}
            </span>
            <span className="text-xs text-gray-400">{template.language}</span>
          </div>
          {template.displayName && template.displayName !== template.name && (
            <p className="text-xs text-gray-500 mt-0.5">{template.displayName}</p>
          )}
          {template.triggerMapping && (
            <div className="flex items-center gap-1 mt-1">
              <Zap size={11} className="text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Bound to: {TRIGGER_OPTIONS.find(t => t.value === template.triggerMapping)?.label || template.triggerMapping}
              </span>
            </div>
          )}
          {template.rejectionReason && (
            <p className="text-xs text-red-500 mt-1">
              <AlertTriangle size={11} className="inline mr-1" />
              {template.rejectionReason}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {template.status === 'APPROVED' && (
            template.triggerMapping ? (
              <button
                onClick={() => onUnsetTrigger(template.id)}
                title="Unlink from trigger"
                className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Unlink size={15} />
              </button>
            ) : null
          )}
          <button
            onClick={() => onDelete(template.id)}
            title="Delete template"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
          {/* Trigger mapping */}
          {template.status === 'APPROVED' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <Zap size={12} className="inline mr-1 text-yellow-500" />
                Map to Automation Trigger
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedTrigger}
                  onChange={(e) => setSelectedTrigger(e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">— Select trigger —</option>
                  {TRIGGER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => selectedTrigger && onSetTrigger(template.id, selectedTrigger)}
                  disabled={!selectedTrigger}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <LinkIcon size={14} /> Bind
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When bound, WhatsApp alerts for this event will use this approved Meta template instead of free-text messages.
              </p>
            </div>
          )}

          {/* Variable mapping */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Code2 size={12} className="inline mr-1 text-blue-500" />
              Variable Mapping
              <span className="ml-1 text-gray-400 font-normal">(maps {'{{'+'1'+'}}'} positions to named variables)</span>
            </label>
            <VariableMappingEditor
              value={editingComponents}
              onChange={setEditingComponents}
            />
            {editingComponents !== (template.componentsJson || '') && (
              <button
                onClick={saveComponents}
                disabled={savingComponents}
                className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {savingComponents ? 'Saving…' : 'Save Mapping'}
              </button>
            )}
          </div>

          {/* Meta info */}
          {template.metaTemplateId && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={11} />
              Meta ID: <code className="font-mono">{template.metaTemplateId}</code>
              {template.qualityScore && (
                <span className={`ml-2 px-1.5 rounded font-medium ${
                  template.qualityScore === 'GREEN' ? 'text-green-700 bg-green-50' :
                  template.qualityScore === 'RED' ? 'text-red-700 bg-red-50' :
                  'text-yellow-700 bg-yellow-50'
                }`}>
                  Quality: {template.qualityScore}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Submit Template Form ─────────────────────────────────────────────────────

function SubmitTemplateForm({
  onSubmitted,
  onCancel,
  apiBase,
  storeId,
}: {
  onSubmitted: () => void;
  onCancel: () => void;
  apiBase: string;
  storeId?: string;
}) {
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    category: 'UTILITY' as 'UTILITY' | 'MARKETING' | 'AUTHENTICATION',
    language: 'en_US',
    headerText: '',
    bodyText: '',
    footerText: '',
    triggerMapping: '',
    componentsJson: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.name || !form.bodyText) {
      setError('Template name and body text are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/whatsapp/templates/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storeId ? { 'x-store-id': storeId } : {}),
        },
        body: JSON.stringify({
          ...form,
          storeId,
          componentsJson: form.componentsJson || undefined,
          triggerMapping: form.triggerMapping || undefined,
          headerText: form.headerText || undefined,
          footerText: form.footerText || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      onSubmitted();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const bodyPlaceholders = (form.bodyText.match(/\{\{(\d+)\}\}/g) || []).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Upload size={16} className="text-blue-600" />
        Submit New Template to Meta for Approval
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Template Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            placeholder="order_confirmation_v1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
          />
          <p className="text-xs text-gray-400 mt-0.5">Lowercase, underscores only</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Display Name</label>
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="Order Confirmation"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="UTILITY">UTILITY — Transactional (orders, alerts)</option>
            <option value="MARKETING">MARKETING — Promotions, offers</option>
            <option value="AUTHENTICATION">AUTHENTICATION — OTP, verification</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="en_US">English (US)</option>
            <option value="en_GB">English (UK)</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
            <option value="gu">Gujarati</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Header Text (optional)</label>
        <input
          value={form.headerText}
          onChange={(e) => setForm({ ...form, headerText: e.target.value })}
          placeholder="Your order is confirmed! (supports 1 variable: {{1}})"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Body Text * <span className="text-gray-400 font-normal">— use {`{{1}}`} {`{{2}}`}… for variables</span>
        </label>
        <textarea
          rows={4}
          value={form.bodyText}
          onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
          placeholder={`Hi {{1}}, your order #{{2}} for {{3}} has been confirmed at {{4}}!\n\nTrack your package here: {{5}}`}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-none"
        />
        {bodyPlaceholders > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            {bodyPlaceholders} variable(s) detected — you'll map them to named keys below
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Footer Text (optional)</label>
        <input
          value={form.footerText}
          onChange={(e) => setForm({ ...form, footerText: e.target.value })}
          placeholder="Reply STOP to unsubscribe"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          <Code2 size={12} className="inline mr-1 text-blue-500" />
          Variable Mapping (maps positional {`{{1}}`} to named keys)
        </label>
        <VariableMappingEditor
          value={form.componentsJson}
          onChange={(v) => setForm({ ...form, componentsJson: v })}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Auto-bind to Trigger (after approval)
        </label>
        <select
          value={form.triggerMapping}
          onChange={(e) => setForm({ ...form, triggerMapping: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">— No trigger binding —</option>
          {TRIGGER_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          After submission, Meta reviews templates within <strong>1–24 hours</strong>.
          UTILITY templates (transactional) are approved faster than MARKETING ones.
          Once approved, sync to update the status and start using the template.
        </span>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <><RefreshCw size={14} className="animate-spin" /> Submitting…</>
          ) : (
            <><Send size={14} /> Submit to Meta</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WhatsAppTemplateManager({
  storeId,
  apiBase = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications`,
}: WhatsAppTemplateManagerProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (storeId) params.set('storeId', storeId);
      if (statusFilter) params.set('status', statusFilter);
      if (triggerFilter) params.set('triggerMapping', triggerFilter);
      const res = await fetch(`${apiBase}/whatsapp/templates?${params}`, {
        headers: getAuthHeaders(storeId),
      });
      if (res.ok) setTemplates(await res.json());
    } finally {
      setLoading(false);
    }
  }, [apiBase, storeId, statusFilter, triggerFilter]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const syncTemplates = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${apiBase}/whatsapp/templates/sync`, {
        method: 'POST',
        headers: getAuthHeaders(storeId),
        body: JSON.stringify({ storeId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Templates synced from Meta WABA');
        fetchTemplates();
      } else {
        showToast(data.message || 'Sync failed', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Remove this template from CMS? (It will not be deleted from Meta)')) return;
    const res = await fetch(`${apiBase}/whatsapp/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(storeId),
    });
    if (res.ok) {
      showToast('Template removed');
      fetchTemplates();
    } else {
      showToast('Failed to delete template', 'error');
    }
  };

  const setTrigger = async (id: string, trigger: string) => {
    const res = await fetch(`${apiBase}/whatsapp/templates/${id}/set-trigger`, {
      method: 'POST',
      headers: getAuthHeaders(storeId),
      body: JSON.stringify({ trigger }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Trigger bound');
      fetchTemplates();
    } else {
      showToast(data.message || 'Failed to bind trigger', 'error');
    }
  };

  const unsetTrigger = async (id: string) => {
    if (!confirm('Unlink this template from its trigger?')) return;
    const res = await fetch(`${apiBase}/whatsapp/templates/${id}/unset-trigger`, {
      method: 'DELETE',
      headers: getAuthHeaders(storeId),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || 'Trigger unlinked');
      fetchTemplates();
    } else {
      showToast(data.message || 'Failed to unlink', 'error');
    }
  };

  const approved = templates.filter((t) => t.status === 'APPROVED');
  const pending = templates.filter((t) => t.status === 'PENDING');
  const rejected = templates.filter((t) => t.status === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-green-600" />
            WhatsApp Message Templates
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage Meta-approved templates for outbound order alerts & notifications
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={syncTemplates}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync from Meta'}
          </button>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={14} /> New Template
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Approved', count: approved.length, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Pending Review', count: pending.length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Rejected', count: rejected.length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-3 ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Why templates matter:</strong> Meta requires pre-approved templates for outbound messages
          (order alerts, shipping updates). Free-text messages only work if the customer messaged you first
          within 24 hours. Bind approved templates to triggers to send compliant outbound notifications.
        </div>
      </div>

      {/* Submit form */}
      {showSubmitForm && (
        <SubmitTemplateForm
          apiBase={apiBase}
          storeId={storeId}
          onSubmitted={() => { setShowSubmitForm(false); fetchTemplates(); showToast('Template submitted to Meta for review!'); }}
          onCancel={() => setShowSubmitForm(false)}
        />
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
        >
          <option value="">All statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAUSED">Paused</option>
        </select>
        <select
          value={triggerFilter}
          onChange={(e) => setTriggerFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
        >
          <option value="">All triggers</option>
          {TRIGGER_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Template list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No templates yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Sync from Meta WABA or submit a new template for approval
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={syncTemplates} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <RefreshCw size={14} /> Sync from Meta
            </button>
            <button onClick={() => setShowSubmitForm(true)} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
              <Plus size={14} /> Submit new template
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onRefresh={fetchTemplates}
              onDelete={deleteTemplate}
              onSetTrigger={setTrigger}
              onUnsetTrigger={unsetTrigger}
              apiBase={apiBase}
              storeId={storeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

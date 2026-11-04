'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Grid,
  List as ListIcon,
  Tag,
  Zap,
  ExternalLink,
  Smartphone,
  Monitor,
  X,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { cmsService } from '@/src/services/cmsService';
import { EmailTemplateData, SendTestEmailResponse } from '@/src/types';
import { SwipeToast } from '@/src/components/ui/SwipeToast';

export const EmailTemplatesManager: React.FC = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplateData[]>([]);
  const [sampleVariables, setSampleVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'NOTIFICATION' | 'MARKETING' | 'CUSTOM'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateData | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Test Email Modal
  const [testModalTemplate, setTestModalTemplate] = useState<EmailTemplateData | null>(null);
  const [testRecipient, setTestRecipient] = useState('merchant@example.com');
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

  const loadTemplates = async () => {
    setRefreshing(true);
    try {
      const res = await cmsService.getEmailTemplates();
      setTemplates(res.templates || []);
      setSampleVariables(res.sampleVariables || {});
    } catch (err: any) {
      showNotification('error', 'Failed to load email templates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = templates.length;
    const transactional = templates.filter((t) => t.category === 'NOTIFICATION').length;
    const marketing = templates.filter((t) => t.category === 'MARKETING').length;
    const custom = templates.filter((t) => !t.isDefault || t.category === 'CUSTOM').length;
    return { total, transactional, marketing, custom };
  }, [templates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'CUSTOM') {
          if (t.isDefault && t.category !== 'CUSTOM') return false;
        } else if (t.category.toUpperCase() !== selectedCategory) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchTrigger = t.trigger ? t.trigger.toLowerCase().includes(q) : false;
        const matchCategory = t.category.toLowerCase().includes(q);
        return matchName || matchSubject || matchTrigger || matchCategory;
      }

      return true;
    });
  }, [templates, selectedCategory, searchQuery]);

  // Open Preview Modal
  const handleOpenPreview = async (template: EmailTemplateData) => {
    setPreviewTemplate(template);
    setPreviewLoading(true);
    try {
      const blocks = Array.isArray(template.blocks)
        ? template.blocks
        : JSON.parse(template.blocksJson || '[]');
      const designConfig = template.designConfig || JSON.parse(template.designConfigJson || '{}');

      const res = await cmsService.renderEmailBlocks({
        blocks,
        designConfig,
        variables: sampleVariables,
        previewText: template.previewText || '',
        subject: template.subject,
      });
      setPreviewHtml(res.html);
    } catch (err) {
      setPreviewHtml(template.htmlContent || '<p>Preview unavailable</p>');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Open Test Modal
  const handleOpenTestModal = (template: EmailTemplateData) => {
    setTestModalTemplate(template);
    setTestResult(null);
  };

  // Dispatch Test Email
  const handleSendTestEmail = async () => {
    if (!testModalTemplate || !testRecipient || !testRecipient.includes('@')) {
      showNotification('error', 'Please enter a valid recipient email.');
      return;
    }

    setSendingTest(true);
    try {
      const blocks = Array.isArray(testModalTemplate.blocks)
        ? testModalTemplate.blocks
        : JSON.parse(testModalTemplate.blocksJson || '[]');
      const designConfig =
        testModalTemplate.designConfig || JSON.parse(testModalTemplate.designConfigJson || '{}');

      const res = await cmsService.sendTestEmail(testModalTemplate.id, {
        recipientEmail: testRecipient,
        sampleData: sampleVariables,
        subject: testModalTemplate.subject,
        previewText: testModalTemplate.previewText || '',
        blocks,
        designConfig,
        storeId: cmsService.getActiveStoreId() || undefined,
      });

      setTestResult(res);
      showNotification('success', `Test email dispatched to ${testRecipient}!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to dispatch test email.');
    } finally {
      setSendingTest(false);
    }
  };

  // Duplicate Template
  const handleDuplicate = async (template: EmailTemplateData) => {
    try {
      const blocks = Array.isArray(template.blocks)
        ? template.blocks
        : JSON.parse(template.blocksJson || '[]');
      const designConfig =
        template.designConfig || JSON.parse(template.designConfigJson || '{}');

      const payload = {
        name: `${template.name} (Copy)`,
        category: template.category as any,
        trigger: template.trigger || null,
        subject: template.subject,
        previewText: template.previewText || '',
        blocksJson: JSON.stringify(blocks),
        designConfigJson: JSON.stringify(designConfig),
        isActive: true,
        storeId: cmsService.getActiveStoreId() || undefined,
      };

      const res = await cmsService.createEmailTemplate(payload);
      showNotification('success', `Duplicated as "${payload.name}"!`);
      setTemplates((prev) => [res.template, ...prev]);
      router.push(`/email-templates/builder?id=${res.template.id}`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to duplicate template.');
    }
  };

  // Delete Custom Template
  const handleDelete = async (template: EmailTemplateData) => {
    if (template.isDefault) {
      showNotification('error', 'Default official presets cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) return;

    try {
      await cmsService.deleteEmailTemplate(template.id);
      showNotification('success', `Template "${template.name}" deleted.`);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete template.');
    }
  };

  // Reset to Official Presets
  const handleResetPresets = async () => {
    if (
      confirm(
        'Reset all templates back to standard official presets? Custom changes to defaults will be refreshed.',
      )
    ) {
      setLoading(true);
      try {
        const activeStoreId = cmsService.getActiveStoreId() || undefined;
        const res = await cmsService.resetEmailPresets(activeStoreId);
        setTemplates(res.templates || []);
        showNotification('success', 'Presets restored successfully!');
      } catch (err) {
        showNotification('error', 'Failed to restore default presets.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <SwipeToast
          open={!!notification}
          type={notification.type}
          title={notification.type === 'success' ? 'Success' : 'Error'}
          description={notification.msg}
          onClose={() => setNotification(null)}
          duration={4000}
        />
      )}

      {/* ─── HEADER SECTION ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Email Templates
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Visual Studio
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Design, customize, and trigger automated transactional notifications and broadcast campaigns.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadTemplates}
            disabled={refreshing}
            title="Refresh templates"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={handleResetPresets}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Restore Defaults</span>
          </button>

          <Link
            href="/email-templates/builder?mode=new&ai=true"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Generate with AI</span>
          </Link>

          <Link
            href="/email-templates/builder?mode=new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Template
          </Link>
        </div>
      </div>

      {/* ─── METRICS STATS BAR ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Total Templates
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              Transactional
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.transactional}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-purple-600">
              Marketing & Sales
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.marketing}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
              Custom / Modified
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.custom}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── FILTERS & SEARCH CONTROL BAR ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: 'ALL', label: 'All Templates', count: stats.total },
            { id: 'NOTIFICATION', label: 'Transactional', count: stats.transactional },
            { id: 'MARKETING', label: 'Marketing', count: stats.marketing },
            { id: 'CUSTOM', label: 'Custom', count: stats.custom },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, subject, trigger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── TEMPLATES CATALOG CONTENT ─────────────────────────────────── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 tracking-wide">
            Loading email templates catalog...
          </span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">No email templates found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery
                ? `No templates match "${searchQuery}". Try clearing search or changing filters.`
                : 'Get started by creating your first custom template or restore official presets.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={handleResetPresets}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Restore Presets
            </button>
            <Link
              href="/email-templates/builder?mode=new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              Create New Template
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* ─── GRID VIEW ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const parsedBlocks = Array.isArray(template.blocks)
              ? template.blocks
              : JSON.parse(template.blocksJson || '[]');

            return (
              <div
                key={template.id}
                className="group relative bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
              >
                {/* Card Top Banner / Preview Placeholder */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        template.category === 'MARKETING'
                          ? 'bg-purple-100 text-purple-700'
                          : template.category === 'NOTIFICATION'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {template.category}
                    </span>

                    {template.isDefault ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        ⭐ Official
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Custom
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {parsedBlocks.length} blocks
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2">
                      <strong className="text-slate-400">Subject:</strong> {template.subject}
                    </p>
                    {template.previewText && (
                      <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                        Snippet: {template.previewText}
                      </p>
                    )}
                  </div>

                  {/* Trigger Chip & Status */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {template.trigger ? (
                      <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 truncate">
                        ⚡ {template.trigger}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 italic">
                        Manual Broadcast
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPreview(template)}
                        title="Live HTML Preview"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenTestModal(template)}
                        title="Send Test Email"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(template)}
                        title="Duplicate Template"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!template.isDefault && (
                        <button
                          onClick={() => handleDelete(template)}
                          title="Delete Custom Template"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Card Action Bar */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/email-templates/builder?id=${template.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Template
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── TABLE VIEW ────────────────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Template Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Trigger Event</th>
                  <th className="py-3 px-4">Subject Line</th>
                  <th className="py-3 px-4 text-center">Blocks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTemplates.map((template) => {
                  const parsedBlocks = Array.isArray(template.blocks)
                    ? template.blocks
                    : JSON.parse(template.blocksJson || '[]');

                  return (
                    <tr
                      key={template.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {template.name}
                          </span>
                          {template.isDefault && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Official
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            template.category === 'MARKETING'
                              ? 'bg-purple-100 text-purple-700'
                              : template.category === 'NOTIFICATION'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {template.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {template.trigger ? (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            ⚡ {template.trigger}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 font-medium">
                        {template.subject}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                        {parsedBlocks.length}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPreview(template)}
                            title="Preview"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenTestModal(template)}
                            title="Send Test Email"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/email-templates/builder?id=${template.id}`}
                            className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </Link>

                          {!template.isDefault && (
                            <button
                              onClick={() => handleDelete(template)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── LIVE PREVIEW MODAL ────────────────────────────────────────── */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  {previewTemplate.name} — Live HTML Preview
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-md">
                  Subject: {previewTemplate.subject}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport Switcher */}
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl">
                  <button
                    onClick={() => setPreviewViewport('desktop')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewViewport('mobile')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  href={`/email-templates/builder?id=${previewTemplate.id}`}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3 h-3" />
                  Open in Studio
                </Link>

                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Iframe Preview Body */}
            <div className="flex-1 bg-slate-100 p-4 flex justify-center overflow-y-auto">
              {previewLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <iframe
                  title="Template Preview"
                  srcDoc={previewHtml}
                  className="w-full bg-white rounded-xl shadow-md border border-slate-200 transition-all min-h-[500px]"
                  style={{
                    maxWidth: previewViewport === 'mobile' ? '375px' : '650px',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK TEST EMAIL MODAL ───────────────────────────────────── */}
      {testModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-2xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Send Test Email</h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                    {testModalTemplate.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModalTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                <div className="font-bold flex items-center justify-between text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {testResult.delivered
                      ? 'Test Email Delivered Live!'
                      : testResult.simulated
                      ? 'Test Email Simulated (Sandbox Mode)'
                      : 'Test Email Dispatched!'}
                  </span>
                  {testResult.provider && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {testResult.provider}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {testResult.message || `Dispatched to ${testResult.recipientEmail}`}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setTestModalTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
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

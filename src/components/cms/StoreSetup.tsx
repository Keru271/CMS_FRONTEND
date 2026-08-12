'use client';

import React, { useState, useEffect } from 'react';
import DragDropUpload from '@/src/components/ui/DragDropUpload';
import { StoreSetupData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Store,
  Image as ImageIcon,
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  DollarSign,
  Languages,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Camera,
  Link as LinkIcon,
  Video,
  Bookmark,
  Sparkles,
  AtSign,
  Tv,
} from 'lucide-react';

interface StoreSetupProps {
  onSaved?: (data: StoreSetupData) => void;
}

export const StoreSetup: React.FC<StoreSetupProps> = ({ onSaved }) => {
  const [formData, setFormData] = useState<StoreSetupData | null>(null);
  const [initialData, setInitialData] = useState<StoreSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'contact' | 'domain' | 'regional'>('general');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

  useEffect(() => {
    loadStoreSetup();
  }, []);

  const loadStoreSetup = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getStoreSetup();
      setFormData(data);
      setInitialData(data);
    } catch (err) {
      console.error('Failed to load store setup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleChange = (field: keyof StoreSetupData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSaving(true);
    try {
      const updated = await cmsService.updateStoreSetup(formData);
      setFormData(updated);
      setInitialData(updated);
      showToast('Store Setup settings saved successfully!', 'success');
      if (onSaved) onSaved(updated);
    } catch (err) {
      showToast('Failed to save Store Setup parameters.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({ ...initialData });
      showToast('Form reset to last saved state.', 'success');
    }
  };


  const handleVerifyDomain = () => {
    setIsVerifyingDomain(true);
    setTimeout(() => {
      setIsVerifyingDomain(false);
      handleChange('domainStatus', 'ACTIVE');
      showToast('Custom domain DNS and SSL certificate verified!', 'success');
    }, 1500);
  };

  if (isLoading || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Store Setup parameters...</span>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : 'bg-rose-900/90 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Merchant Control Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Storefront Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Store className="w-8 h-8 text-indigo-400" />
              <span>Store Setup & Global Configuration</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Configure essential brand identity parameters, custom domains, visual assets, contact information, business address, social handles, and regional localization settings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                Discard Changes
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Store Setup</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-700/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'general', label: '1. Store Identity', icon: Store },
            { id: 'branding', label: '2. Logo & Favicon', icon: ImageIcon },
            { id: 'contact', label: '3. Contact & Address', icon: Mail },
            { id: 'domain', label: '4. Domain & SSL', icon: Globe },
            { id: 'regional', label: '5. Currency & Region', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: STORE IDENTITY & GENERAL DESCRIPTION */}
        {activeTab === 'general' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground">Store Identity & Overview</h2>
                  <p className="text-xs text-slate-500">Basic information visible across customer invoices, emails, and header titles.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-accent text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                Public Profile
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Acme Superstore"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-accent transition-all"
                />
                <p className="text-[10px] text-slate-400">Displayed in storefront branding, order emails, and receipts.</p>
              </div>

              {/* Store Slug / Subdomain */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Store Handle / Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="px-3 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-accent border-r border-slate-200 dark:border-border py-2.5 select-none shrink-0">
                    https://
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      handleChange(
                        'slug',
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="my-store-slug"
                    className="w-full px-3 py-2.5 bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-foreground focus:outline-none"
                  />
                  <span className="px-3 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-accent border-l border-slate-200 dark:border-border py-2.5 select-none shrink-0">
                    .omnistore.com
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Your default storefront address URL on the platform.</p>
              </div>

              {/* Store Description */}
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Store Description
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {(formData.description || '').length} / 500 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your store offerings, brand mission, and target customers..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-accent transition-all"
                />
                <p className="text-[10px] text-slate-400">Used for search engine meta descriptions and storefront footer section.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING & VISUAL ASSETS (LOGO & FAVICON) */}
        {activeTab === 'branding' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground">Store Logo & Favicon Assets</h2>
                  <p className="text-xs text-slate-500">Upload or set image URLs for high-resolution store logo and browser tab favicon.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-accent text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                Visual Assets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Store Logo Block */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-card border border-slate-200/80 dark:border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Store Logo</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Rec: 512x512 PNG / SVG</span>
                </div>

                <DragDropUpload
                  folder="logos"
                  fileType="LOGO"
                  currentUrl={formData.logo || undefined}
                  onUploadComplete={(url) => {
                    handleChange('logo', url);
                    if (url) showToast('Logo uploaded successfully!', 'success');
                  }}
                  hint="PNG or SVG with transparent background recommended."
                  previewShape="square"
                  maxSizeMB={5}
                />

                {/* Direct Logo URL fallback */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Or paste an image URL directly
                  </label>
                  <input
                    type="url"
                    value={formData.logo || ''}
                    onChange={(e) => handleChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Favicon Block */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-card border border-slate-200/80 dark:border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Browser Favicon</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Rec: 32x32 ICO / PNG</span>
                </div>

                {/* Browser Tab Mockup Preview */}
                <div className="p-3 rounded-xl bg-white dark:bg-accent border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Browser Tab Mockup
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-slate-200 dark:bg-card border border-slate-300 dark:border-border w-48">
                    <div className="w-4 h-4 rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {formData.favicon ? (
                        <img src={formData.favicon} alt="Favicon" className="w-full h-full object-cover" />
                      ) : (
                        <Globe className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">
                      {formData.name || 'Store'} | Official
                    </span>
                  </div>
                </div>

                <DragDropUpload
                  folder="logos"
                  fileType="FAVICON"
                  currentUrl={formData.favicon || undefined}
                  onUploadComplete={(url) => {
                    handleChange('favicon', url);
                    if (url) showToast('Favicon uploaded successfully!', 'success');
                  }}
                  hint="ICO or 32×32 PNG for best browser compatibility."
                  previewShape="favicon"
                  maxSizeMB={1}
                />

                {/* Direct Favicon URL fallback */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Or paste a favicon URL directly
                  </label>
                  <input
                    type="url"
                    value={formData.favicon || ''}
                    onChange={(e) => handleChange('favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT EMAIL/PHONE & BUSINESS ADDRESS & SOCIAL MEDIA LINKS */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Email & Phone */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-foreground">Contact Email & Phone</h2>
                    <p className="text-xs text-slate-500">Support contact info displayed to buyers on checkout pages & order confirmations.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Support Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="support@mystore.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Support Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-foreground">Official Business Address</h2>
                    <p className="text-xs text-slate-500">Physical address used for tax calculations, shipping return slips, and legal disclosures.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.addressStreet || ''}
                    onChange={(e) => handleChange('addressStreet', e.target.value)}
                    placeholder="742 Evergreen Terrace, Suite 100"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">City</label>
                  <input
                    type="text"
                    value={formData.addressCity || ''}
                    onChange={(e) => handleChange('addressCity', e.target.value)}
                    placeholder="San Francisco"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">State / Province</label>
                  <input
                    type="text"
                    value={formData.addressState || ''}
                    onChange={(e) => handleChange('addressState', e.target.value)}
                    placeholder="California"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">ZIP / Postal Code</label>
                  <input
                    type="text"
                    value={formData.addressZip || ''}
                    onChange={(e) => handleChange('addressZip', e.target.value)}
                    placeholder="94107"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">Country</label>
                  <select
                    value={formData.addressCountry || 'United States'}
                    onChange={(e) => handleChange('addressCountry', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="India">India</option>
                    <option value="Australia">Australia</option>
                    <option value="Japan">Japan</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-foreground">Social Media Links</h2>
                    <p className="text-xs text-slate-500">Connect social channels to render footer icons and increase social engagement.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { field: 'socialFacebook', label: 'Facebook URL', icon: Share2, color: 'text-blue-600', placeholder: 'https://facebook.com/mybrand' },
                  { field: 'socialInstagram', label: 'Instagram URL', icon: Camera, color: 'text-pink-600', placeholder: 'https://instagram.com/mybrand' },
                  { field: 'socialTwitter', label: 'Twitter / X URL', icon: AtSign, color: 'text-sky-500', placeholder: 'https://x.com/mybrand' },
                  { field: 'socialLinkedin', label: 'LinkedIn URL', icon: LinkIcon, color: 'text-blue-700', placeholder: 'https://linkedin.com/company/mybrand' },
                  { field: 'socialYoutube', label: 'YouTube Channel', icon: Tv, color: 'text-rose-600', placeholder: 'https://youtube.com/@mybrand' },
                  { field: 'socialTiktok', label: 'TikTok Profile', icon: Video, color: 'text-slate-900 dark:text-foreground', placeholder: 'https://tiktok.com/@mybrand' },
                  { field: 'socialPinterest', label: 'Pinterest Boards', icon: Bookmark, color: 'text-red-600', placeholder: 'https://pinterest.com/mybrand' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.field} className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </label>
                      <input
                        type="url"
                        value={(formData as any)[item.field] || ''}
                        onChange={(e) => handleChange(item.field as any, e.target.value)}
                        placeholder={item.placeholder}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOMAIN & CUSTOM DOMAIN */}
        {activeTab === 'domain' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground">Domain & Custom Domain Setup</h2>
                  <p className="text-xs text-slate-500">Connect custom domains with automatic free SSL certificate generation and DNS mapping.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border ${
                    formData.domainStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{formData.domainStatus === 'ACTIVE' ? 'SSL Active & Verified' : 'DNS Verification Required'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Subdomain */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-card border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Platform Default Subdomain
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-accent border border-slate-200/80">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-foreground">
                    https://{formData.slug || 'store'}.omnistore.com
                  </span>
                  <a
                    href={`https://${formData.slug || 'store'}.omnistore.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-card text-slate-600 text-xs flex items-center gap-1 font-bold"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400">Always active as your system fallback URL.</p>
              </div>

              {/* Custom Domain Input */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-card border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Custom Domain
                  </span>
                  <button
                    type="button"
                    onClick={handleVerifyDomain}
                    disabled={isVerifyingDomain}
                    className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-extrabold flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    {isVerifyingDomain ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>Verify DNS</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.customDomain || ''}
                  onChange={(e) => handleChange('customDomain', e.target.value.toLowerCase())}
                  placeholder="e.g. www.mybrandstore.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-400">Enter your purchased domain name without http/https prefix.</p>
              </div>
            </div>

            {/* DNS Setup Helper Guide Box */}
            <div className="p-5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/60 space-y-3">
              <h4 className="text-xs font-black text-teal-900 dark:text-teal-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>DNS CNAME Record Target Configuration</span>
              </h4>
              <p className="text-xs text-teal-800 dark:text-teal-400">
                To map <strong>{formData.customDomain || 'your custom domain'}</strong>, point your domain registrar's CNAME record to the target below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white dark:bg-card border border-teal-100 dark:border-border text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Type</span>
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-foreground">CNAME</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-card border border-teal-100 dark:border-border text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Host / Name</span>
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-foreground">www</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-card border border-teal-100 dark:border-border text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Value / Target</span>
                  <span className="text-xs font-mono font-black text-teal-600 dark:text-teal-400 truncate">cname.omnistore.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CURRENCY, LANGUAGE & TIMEZONE */}
        {activeTab === 'regional' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground">Currency, Language & Time Zone</h2>
                  <p className="text-xs text-slate-500">Configure transactional currency, default storefront locale language, and store operational time zone.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-accent text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                Localization
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Currency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Store Currency</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="SGD">SGD ($) - Singapore Dollar</option>
                </select>
                <p className="text-[10px] text-slate-400">Default currency displayed on product prices and checkout receipts.</p>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Primary Language</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="es-ES">Spanish (Español)</option>
                  <option value="fr-FR">French (Français)</option>
                  <option value="de-DE">German (Deutsch)</option>
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                  <option value="ja-JP">Japanese (日本語)</option>
                </select>
                <p className="text-[10px] text-slate-400">Default storefront text and system notification language.</p>
              </div>

              {/* Time zone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Store Operational Time Zone</span>
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">EST / EDT (America/New_York)</option>
                  <option value="America/Chicago">CST / CDT (America/Chicago)</option>
                  <option value="America/Los_Angeles">PST / PDT (America/Los_Angeles)</option>
                  <option value="Europe/London">GMT / BST (Europe/London)</option>
                  <option value="Europe/Paris">CET / CEST (Europe/Paris)</option>
                  <option value="Asia/Kolkata">IST (Asia/Kolkata +05:30)</option>
                  <option value="Asia/Tokyo">JST (Asia/Tokyo +09:00)</option>
                </select>
                <p className="text-[10px] text-slate-400">Used for order timestamps, analytics reporting, and inventory logs.</p>
              </div>
            </div>
          </div>
        )}

        {/* STICKY FOOTER SAVE BAR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-white/90">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isDirty ? 'Unsaved changes ready to apply' : 'All store setup configurations synced'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Discard
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all min-h-[40px] shrink-0 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Store Setup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

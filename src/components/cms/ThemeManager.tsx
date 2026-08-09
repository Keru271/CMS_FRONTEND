'use client';

import React, { useState, useEffect } from 'react';
import { StoreTemplate, ThemeConfigData } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import {
  Palette,
  Layout,
  Type,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Eye,
  Check,
  Save,
  RefreshCw,
  Sliders,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  X,
  CreditCard,
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  Mail,
  Share2,
} from 'lucide-react';

const PRESET_PALETTES = [
  { name: 'Royal Indigo', primary: '#4F46E5', secondary: '#64748B', background: '#FFFFFF', text: '#0F172A', accent: '#EC4899' },
  { name: 'Midnight Cyber', primary: '#3B82F6', secondary: '#94A3B8', background: '#0F172A', text: '#F8FAFC', accent: '#8B5CF6' },
  { name: 'Emerald Botanical', primary: '#059669', secondary: '#64748B', background: '#F0FDF4', text: '#064E3B', accent: '#F59E0B' },
  { name: 'Sunset Coral', primary: '#F97316', secondary: '#64748B', background: '#FFF7ED', text: '#431407', accent: '#EC4899' },
  { name: 'Luxury Noir', primary: '#18181B', secondary: '#71717A', background: '#FAFAFA', text: '#09090B', accent: '#D97706' },
];

export const ThemeManager: React.FC = () => {
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfigData | null>(null);
  const [initialConfig, setInitialConfig] = useState<ThemeConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'templates' | 'colors' | 'typography' | 'layout' | 'headerFooter'>('templates');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tmplList, themeData] = await Promise.all([
        cmsService.getStoreTemplates(),
        cmsService.getStoreTheme(),
      ]);
      setTemplates(tmplList);
      setThemeConfig(themeData);
      setInitialConfig(themeData);
    } catch (err) {
      console.error('Failed to load theme data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfigChange = (field: keyof ThemeConfigData, value: any) => {
    if (!themeConfig) return;
    setThemeConfig({ ...themeConfig, [field]: value });
  };

  const handleSaveTheme = async () => {
    if (!themeConfig) return;
    setIsSaving(true);
    try {
      const updated = await cmsService.updateStoreTheme(themeConfig);
      setThemeConfig(updated);
      setInitialConfig(updated);
      showToast('Theme configuration saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save theme settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishTemplate = async (slug: string) => {
    setPublishingSlug(slug);
    try {
      await cmsService.publishTemplate(slug);
      handleConfigChange('activeTemplateSlug', slug);
      showToast(`Template "${slug}" published as active store theme!`, 'success');
    } catch (err) {
      showToast('Failed to publish template.', 'error');
    } finally {
      setPublishingSlug(null);
    }
  };

  const handleApplyPreset = (palette: (typeof PRESET_PALETTES)[0]) => {
    if (!themeConfig) return;
    setThemeConfig({
      ...themeConfig,
      themePrimaryColor: palette.primary,
      themeSecondaryColor: palette.secondary,
      themeBackgroundColor: palette.background,
      themeTextColor: palette.text,
      themeAccentColor: palette.accent,
    });
    showToast(`Applied "${palette.name}" color scheme preset!`, 'success');
  };

  if (isLoading || !themeConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 animate-pulse">Loading Theme & Template Studio...</span>
      </div>
    );
  }

  const isDirty = JSON.stringify(themeConfig) !== JSON.stringify(initialConfig);
  const activeTemplate = templates.find((t) => t.slug === themeConfig.activeTemplateSlug || t.id === themeConfig.activeTemplateSlug) || templates[0];

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
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-500/30">
                Multi-Template Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Theme: {activeTemplate?.name || 'Nova Tech'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Palette className="w-8 h-8 text-indigo-400" />
              <span>Theme Studio & Template Publisher</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Switch layout templates, test responsive device viewports, and customize color schemes, typography, border radius, button styles, header layouts, and footer modules in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDirty && initialConfig && (
              <button
                type="button"
                onClick={() => setThemeConfig({ ...initialConfig })}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Theme Config</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Studio Tab Navigation */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-700/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'templates', label: '1. Select & Publish Template', icon: Layout },
            { id: 'colors', label: '2. Color Scheme', icon: Palette },
            { id: 'typography', label: '3. Typography & Fonts', icon: Type },
            { id: 'layout', label: '4. Layout, Radius & Buttons', icon: SlidersHorizontal },
            { id: 'headerFooter', label: '5. Header & Footer Config', icon: Sliders },
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

      {/* SECTION 1: TEMPLATE ARCHITECTURE & SELECTION */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                <Layout className="w-5 h-5 text-indigo-600" />
                <span>Available Multi-Tenant Storefront Templates</span>
              </h2>
              <p className="text-xs text-slate-500">Choose a high-converting theme layout tailored for your store industry niche.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
              {templates.length} Templates Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tmpl) => {
              const isPublished = themeConfig.activeTemplateSlug === tmpl.slug || themeConfig.activeTemplateSlug === tmpl.id;
              const isPublishing = publishingSlug === tmpl.slug || publishingSlug === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white dark:bg-card ${
                    isPublished
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 shadow-xl'
                      : 'border-slate-200/80 dark:border-border hover:border-indigo-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Template Card Image Banner */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-accent group">
                      <img
                        src={tmpl.previewImage}
                        alt={tmpl.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {isPublished ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active Theme</span>
                          </span>
                        ) : tmpl.badge ? (
                          <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                            {tmpl.badge}
                          </span>
                        ) : null}
                      </div>

                      <div
                        className="absolute bottom-3 left-3 w-4 h-4 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: tmpl.accentColor }}
                        title={`Default Accent: ${tmpl.accentColor}`}
                      />
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-foreground">{tmpl.name}</h3>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{tmpl.tagline}</p>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{tmpl.description}</p>

                      {/* Feature Bullets */}
                      {tmpl.features && tmpl.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tmpl.features.slice(0, 3).map((feat, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-accent text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0 flex items-center gap-2 border-t border-slate-100 dark:border-border mt-3">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-accent text-slate-800 dark:text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Preview</span>
                    </button>

                    {isPublished ? (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200 cursor-default"
                      >
                        <Check className="w-4 h-4" />
                        <span>Published</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublishTemplate(tmpl.slug || tmpl.id)}
                        disabled={isPublishing}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isPublishing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Publish Theme</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN THEME CUSTOMIZER STUDIO: SPLIT PANE CONTROLS + LIVE STORE CANVAS */}
      {activeTab !== 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANE: CUSTOMIZER CONTROLS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* COLOR SCHEME TAB */}
            {activeTab === 'colors' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
                <div className="border-b border-slate-100 dark:border-border pb-3">
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    <span>Store Color Palette</span>
                  </h2>
                  <p className="text-xs text-slate-500">Customize main branding, text contrast, and background colors.</p>
                </div>

                {/* Preset Palettes Quick Action */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Curated Preset Palettes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_PALETTES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="p-2.5 rounded-2xl border border-slate-200 dark:border-border hover:border-indigo-400 bg-slate-50/50 dark:bg-card text-left space-y-1.5 transition-all group"
                      >
                        <span className="text-[11px] font-extrabold text-slate-800 dark:text-foreground block truncate">
                          {preset.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: preset.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: preset.secondary }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-2xs" style={{ backgroundColor: preset.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-border">
                  {[
                    { field: 'themePrimaryColor', label: 'Primary Brand Color', desc: 'Used for main buttons, headers, & icons' },
                    { field: 'themeSecondaryColor', label: 'Secondary Color', desc: 'Used for subheadings, borders & badges' },
                    { field: 'themeBackgroundColor', label: 'Background Color', desc: 'Main canvas background fill' },
                    { field: 'themeTextColor', label: 'Primary Text Color', desc: 'Body text and heading font color' },
                    { field: 'themeAccentColor', label: 'Accent / Highlight', desc: 'Callouts, sale tags, and indicators' },
                  ].map((item) => (
                    <div key={item.field} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-card border border-slate-200/80">
                      <div className="space-y-0.5">
                        <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                          {item.label}
                        </label>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(themeConfig as any)[item.field] || '#3B82F6'}
                          onChange={(e) => handleConfigChange(item.field as any, e.target.value)}
                          className="w-8 h-8 rounded-xl cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={(themeConfig as any)[item.field] || '#3B82F6'}
                          onChange={(e) => handleConfigChange(item.field as any, e.target.value)}
                          className="w-20 px-2 py-1 text-center font-mono text-xs font-bold border border-slate-200 rounded-xl bg-white dark:bg-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TYPOGRAPHY TAB */}
            {activeTab === 'typography' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
                <div className="border-b border-slate-100 dark:border-border pb-3">
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Type className="w-5 h-5 text-indigo-600" />
                    <span>Storefront Typography</span>
                  </h2>
                  <p className="text-xs text-slate-500">Configure heading font pairings and base text scaling.</p>
                </div>

                <div className="space-y-5">
                  {/* Heading Font */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Heading Font Family
                    </label>
                    <select
                      value={themeConfig.themeHeadingFont}
                      onChange={(e) => handleConfigChange('themeHeadingFont', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Inter">Inter (Clean Modern Sans)</option>
                      <option value="Outfit">Outfit (Tech Bold Display)</option>
                      <option value="Playfair Display">Playfair Display (Serif Luxury)</option>
                      <option value="Space Grotesk">Space Grotesk (Trendy Geometric)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Editorial Sans)</option>
                    </select>
                  </div>

                  {/* Body Font */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Body & Paragraph Font
                    </label>
                    <select
                      value={themeConfig.themeBodyFont}
                      onChange={(e) => handleConfigChange('themeBodyFont', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Inter">Inter (High Legibility)</option>
                      <option value="Roboto">Roboto (Classic Standard)</option>
                      <option value="Open Sans">Open Sans (Neutral Reading)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                      <option value="Lora">Lora (Elegant Editorial Serif)</option>
                    </select>
                  </div>

                  {/* Font Sizes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Base Font Scaling
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'sm', label: 'Small (13px)' },
                        { id: 'md', label: 'Default (15px)' },
                        { id: 'lg', label: 'Large (17px)' },
                        { id: 'xl', label: 'X-Large (19px)' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleConfigChange('themeFontSize', sz.id)}
                          className={`p-2.5 rounded-2xl border text-center text-xs font-extrabold transition-all ${
                            themeConfig.themeFontSize === sz.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-slate-50 dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200/80 hover:bg-slate-100'
                          }`}
                        >
                          {sz.id.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAYOUT, RADIUS & BUTTONS TAB */}
            {activeTab === 'layout' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-6">
                <div className="border-b border-slate-100 dark:border-border pb-3">
                  <h2 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                    <span>Layout Width, Radius & Buttons</span>
                  </h2>
                  <p className="text-xs text-slate-500">Configure global border radius, button styling, and layout container width.</p>
                </div>

                <div className="space-y-5">
                  {/* Border Radius */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Component Border Radius
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'Sharp (0px)' },
                        { id: 'sm', label: 'Compact (6px)' },
                        { id: 'md', label: 'Rounded (12px)' },
                        { id: 'full', label: 'Pill (24px)' },
                      ].map((rad) => (
                        <button
                          key={rad.id}
                          type="button"
                          onClick={() => handleConfigChange('themeBorderRadius', rad.id)}
                          className={`p-2.5 rounded-2xl border text-center text-[11px] font-bold transition-all ${
                            themeConfig.themeBorderRadius === rad.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-slate-50 dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200/80'
                          }`}
                        >
                          {rad.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Styles */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Primary Button Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'solid', label: 'Solid Filled' },
                        { id: 'outline', label: 'Outline Bordered' },
                        { id: 'soft', label: 'Soft Glass' },
                        { id: 'gradient', label: 'Gradient Glow' },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => handleConfigChange('themeButtonStyle', btn.id)}
                          className={`p-2.5 rounded-2xl border text-center text-xs font-extrabold transition-all ${
                            themeConfig.themeButtonStyle === btn.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 dark:bg-card text-slate-700 dark:text-slate-300 border-slate-200/80'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layout Width */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Max Container Width
                    </label>
                    <select
                      value={themeConfig.themeLayoutWidth}
                      onChange={(e) => handleConfigChange('themeLayoutWidth', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="boxed">Boxed (1200px)</option>
                      <option value="standard">Standard (1400px)</option>
                      <option value="wide">Wide (1600px)</option>
                      <option value="full">Full Width (100%)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* HEADER & FOOTER CONFIG TAB */}
            {activeTab === 'headerFooter' && (
              <div className="space-y-6">
                {/* Header Options */}
                <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Header Navigation Configuration</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Header Layout Style</label>
                      <select
                        value={themeConfig.headerStyle}
                        onChange={(e) => handleConfigChange('headerStyle', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                      >
                        <option value="left-aligned">Left Aligned Brand Logo</option>
                        <option value="centered">Centered Logo with Split Menu</option>
                        <option value="minimal">Minimal Inline Navigation</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Announcement Bar Text</label>
                      <input
                        type="text"
                        value={themeConfig.headerAnnouncement}
                        onChange={(e) => handleConfigChange('headerAnnouncement', e.target.value)}
                        placeholder="e.g. Free Shipping on orders over $50"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">Sticky Header on Scroll</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerSticky}
                        onChange={(e) => handleConfigChange('headerSticky', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Search Bar</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerShowSearch}
                        onChange={(e) => handleConfigChange('headerShowSearch', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Currency Selector</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerShowCurrency}
                        onChange={(e) => handleConfigChange('headerShowCurrency', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Options */}
                <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Footer Section Configuration</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Footer Layout Style</label>
                      <select
                        value={themeConfig.footerStyle}
                        onChange={(e) => handleConfigChange('footerStyle', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                      >
                        <option value="multi-column">Multi-Column Mega Footer</option>
                        <option value="minimal">Minimal 2-Column Footer</option>
                        <option value="centered">Centered Clean Footer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Copyright Text</label>
                      <input
                        type="text"
                        value={themeConfig.footerCopyright}
                        onChange={(e) => handleConfigChange('footerCopyright', e.target.value)}
                        placeholder="© 2026 Store Name. All rights reserved."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">Show Social Media Links</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.footerShowSocial}
                        onChange={(e) => handleConfigChange('footerShowSocial', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Newsletter Box</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.footerShowNewsletter}
                        onChange={(e) => handleConfigChange('footerShowNewsletter', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Show Payment Method Badges</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.footerShowPaymentBadges}
                        onChange={(e) => handleConfigChange('footerShowPaymentBadges', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANE: REAL-TIME INTERACTIVE STOREFRONT CANVAS PREVIEW (7 cols) */}
          <div className="lg:col-span-7 sticky top-6 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Live Interactive Storefront Preview</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                Real-Time Render
              </span>
            </div>

            {/* Mock Storefront Interactive Frame */}
            <div
              className="rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden transition-all duration-300 min-h-[560px] flex flex-col justify-between"
              style={{
                backgroundColor: themeConfig.themeBackgroundColor,
                color: themeConfig.themeTextColor,
                fontFamily: themeConfig.themeBodyFont,
              }}
            >
              {/* Header Mockup */}
              <div className="border-b border-slate-200/60 shadow-xs">
                {/* Announcement Bar */}
                {themeConfig.headerAnnouncement && (
                  <div
                    className="py-1.5 px-4 text-center text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: themeConfig.themePrimaryColor }}
                  >
                    {themeConfig.headerAnnouncement}
                  </div>
                )}

                {/* Navbar */}
                <div
                  className={`p-4 flex items-center justify-between gap-4 ${
                    themeConfig.headerStyle === 'centered' ? 'flex-col sm:flex-row' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-black text-lg tracking-tight"
                      style={{
                        color: themeConfig.themePrimaryColor,
                        fontFamily: themeConfig.themeHeadingFont,
                      }}
                    >
                      OmniStore
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {activeTemplate?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span>Products</span>
                    <span>Collections</span>
                    <span>About Us</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {themeConfig.headerShowSearch && <Search className="w-4 h-4 text-slate-400" />}
                    {themeConfig.headerShowCurrency && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
                        USD ($)
                      </span>
                    )}
                    <div
                      className="p-2 rounded-xl text-white flex items-center gap-1 text-[11px] font-bold shadow-xs"
                      style={{
                        backgroundColor: themeConfig.themePrimaryColor,
                        borderRadius:
                          themeConfig.themeBorderRadius === 'none'
                            ? '0px'
                            : themeConfig.themeBorderRadius === 'full'
                              ? '9999px'
                              : '12px',
                      }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Cart (2)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Hero Mockup */}
              <div className="p-8 space-y-6 flex-1">
                <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-4 shadow-lg relative overflow-hidden">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block shadow-xs"
                    style={{ backgroundColor: themeConfig.themeAccentColor, color: '#FFFFFF' }}
                  >
                    Featured Collection
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ fontFamily: themeConfig.themeHeadingFont }}
                  >
                    Elevate Your Digital Experience
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md">
                    Designed with {themeConfig.themeHeadingFont} headings and customizable {themeConfig.themeButtonStyle} CTA buttons.
                  </p>
                  <button
                    type="button"
                    className="px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: themeConfig.themePrimaryColor,
                      borderRadius:
                        themeConfig.themeBorderRadius === 'none'
                          ? '0px'
                          : themeConfig.themeBorderRadius === 'full'
                            ? '9999px'
                            : '12px',
                    }}
                  >
                    <span>Shop Collection Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sample Grid Products */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'AeroPulse Headphones', price: '$199.99', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
                    { name: 'Lumix Smart Watch', price: '$149.50', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3 rounded-2xl border border-slate-200/80 bg-white/80 space-y-2">
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-100">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                        <span className="text-xs font-black" style={{ color: themeConfig.themePrimaryColor }}>{p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Mockup */}
              <div className="border-t border-slate-200/80 p-6 bg-slate-900 text-slate-300 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <span className="font-bold text-white" style={{ fontFamily: themeConfig.themeHeadingFont }}>
                    OmniStore Flagship
                  </span>
                  {themeConfig.footerShowSocial && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Share2 className="w-4 h-4" />
                      <Mail className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-800 pt-3">
                  <span>{themeConfig.footerCopyright}</span>
                  {themeConfig.footerShowPaymentBadges && (
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>VISA • MASTERCARD • AMEX</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN RESPONSIVE PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in">
          {/* Modal Header Controls */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-600 font-black text-xs">
                Previewing Template
              </span>
              <h3 className="font-black text-base">{previewTemplate.name}</h3>
            </div>

            {/* Responsive Viewport Switchers */}
            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop (1400px)' },
                { id: 'tablet', icon: TabletIcon, label: 'Tablet (768px)' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile (375px)' },
              ].map((vp) => {
                const Icon = vp.icon;
                return (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => setPreviewViewport(vp.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      previewViewport === vp.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{vp.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handlePublishTemplate(previewTemplate.slug || previewTemplate.id);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Publish This Template</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewport Frame Container */}
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-950">
            <div
              className={`bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-800 ${
                previewViewport === 'desktop'
                  ? 'w-full max-w-6xl min-h-[700px]'
                  : previewViewport === 'tablet'
                    ? 'w-[768px] min-h-[600px]'
                    : 'w-[375px] min-h-[550px]'
              }`}
            >
              {/* Full Mock Store Page Renders Here */}
              <div className="p-6 space-y-6">
                <div className="h-64 rounded-2xl overflow-hidden relative">
                  <img src={previewTemplate.previewImage} alt={previewTemplate.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black uppercase w-fit mb-2">
                      {previewTemplate.tagline}
                    </span>
                    <h1 className="text-2xl font-black">{previewTemplate.name}</h1>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-slate-800">Included Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {previewTemplate.features?.map((feat, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

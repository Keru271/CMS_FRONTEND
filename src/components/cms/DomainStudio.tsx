'use client';

import React, { useState, useEffect } from 'react';
import { CustomDomainData, DomainListResponse } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { usePlanAccess } from '@/src/hooks/usePlanAccess';
import { PlanLockOverlay } from '@/src/components/cms/PlanLockOverlay';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  Trash2,
  Check,
  Lock,
  Radio,
  ArrowRight,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const DomainStudio: React.FC = () => {
  const { isStarter, canUseCustomDomain } = usePlanAccess();
  const [data, setData] = useState<DomainListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedDnsDomainId, setExpandedDnsDomainId] = useState<string | null>(null);

  // Add Domain Modal
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainAutoRedirect, setNewDomainAutoRedirect] = useState(true);
  const [newDomainIsPrimary, setNewDomainIsPrimary] = useState(false);
  const [newDomainTheme, setNewDomainTheme] = useState('default');
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  // Deploy Theme Modal
  const [deployingDomain, setDeployingDomain] = useState<CustomDomainData | null>(null);
  const [selectedThemeSlug, setSelectedThemeSlug] = useState('default');
  const [selectedEdgeRegion, setSelectedEdgeRegion] = useState<
    'BOM_MUMBAI' | 'SIN_SINGAPORE' | 'IAD_US_EAST' | 'FRA_FRANKFURT'
  >('BOM_MUMBAI');
  const [purgeCacheOption, setPurgeCacheOption] = useState(true);
  const [isDeployingTheme, setIsDeployingTheme] = useState(false);

  // DNS Diagnostics Modal
  const [diagnosticsModalData, setDiagnosticsModalData] = useState<{
    domain: string;
    diagnostics: any;
  } | null>(null);
  const [isVerifyingDns, setIsVerifyingDns] = useState<string | null>(null);

  const availableThemes = [
    { slug: 'default', name: 'Modern Luxury Dark', badge: 'Active Theme', description: 'High-contrast dark mode with glassmorphic cards and gold accents.' },
    { slug: 'minimal', name: 'Minimalist Clean', badge: 'High Conversion', description: 'Ultra-fast monochrome aesthetic with generous whitespace.' },
    { slug: 'retro', name: 'Retro Artisan Warm', badge: 'Handcrafted', description: 'Earthy cream & terracotta tones for boutique lifestyle stores.' },
    { slug: 'nova-tech', name: 'Nova Tech Futuristic', badge: 'Electronics', description: 'Sleek neon cyber theme optimized for electronics & gadgets.' },
  ];

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setIsLoading(true);
    try {
      const res = await cmsService.getDomains();
      setData(res);
      if (res.domains && res.domains.length > 0 && !expandedDnsDomainId) {
        setExpandedDnsDomainId(res.domains[0].id);
      }
    } catch (err) {
      console.error('Failed to load domain configuration:', err);
      showToast('Failed to load custom domains and DNS settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Submit Add Domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    setIsAddingDomain(true);
    try {
      const res = await cmsService.addDomain({
        domain: newDomainInput.trim(),
        autoRedirectWww: newDomainAutoRedirect,
        isPrimary: newDomainIsPrimary,
        deployedThemeSlug: newDomainTheme,
      });

      showToast(res.message || 'Custom domain registered successfully!');
      setIsAddDomainModalOpen(false);
      setNewDomainInput('');
      await loadDomains();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add custom domain', 'error');
    } finally {
      setIsAddingDomain(false);
    }
  };

  // Run DNS Verification Check
  const handleVerifyDns = async (domain: CustomDomainData) => {
    setIsVerifyingDns(domain.id);
    try {
      const res = await cmsService.verifyDomainDns(domain.id);
      setDiagnosticsModalData({
        domain: domain.domain,
        diagnostics: res.diagnostics,
      });
      showToast(res.message || 'DNS verification completed successfully!');
      await loadDomains();
    } catch (err: any) {
      showToast(err?.message || 'DNS verification failed', 'error');
    } finally {
      setIsVerifyingDns(null);
    }
  };

  // Open Deploy Theme Modal
  const handleOpenDeployModal = (domain: CustomDomainData) => {
    setDeployingDomain(domain);
    setSelectedThemeSlug(domain.themeDeployment?.deployedThemeSlug || 'default');
    setSelectedEdgeRegion((domain.themeDeployment?.edgeCdnRegion as any) || 'BOM_MUMBAI');
  };

  // Submit Theme Deployment to Domain
  const handleDeployTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployingDomain) return;

    const themeObj = availableThemes.find((t) => t.slug === selectedThemeSlug) || availableThemes[0];
    setIsDeployingTheme(true);

    try {
      const res = await cmsService.deployThemeToDomain({
        domainId: deployingDomain.id,
        themeSlug: themeObj.slug,
        themeName: themeObj.name,
        edgeCdnRegion: selectedEdgeRegion,
        purgeCache: purgeCacheOption,
      });

      showToast(res.message || `Theme "${themeObj.name}" deployed to ${deployingDomain.domain}!`);
      setDeployingDomain(null);
      await loadDomains();
    } catch (err: any) {
      showToast(err?.message || 'Failed to deploy theme to domain', 'error');
    } finally {
      setIsDeployingTheme(false);
    }
  };

  // Set Primary Domain
  const handleSetPrimary = async (domainId: string) => {
    try {
      const res = await cmsService.setPrimaryDomain(domainId);
      showToast(res.message || 'Primary domain updated!');
      await loadDomains();
    } catch (err: any) {
      showToast(err?.message || 'Failed to set primary domain', 'error');
    }
  };

  // Delete Domain
  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    if (!confirm(`Are you sure you want to remove the domain "${domainName}"? Origin edge routing will be purged.`)) {
      return;
    }

    try {
      const res = await cmsService.deleteDomain(domainId);
      showToast(res.message || 'Domain removed successfully');
      await loadDomains();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete domain', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
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
            <Globe className="w-8 h-8 text-indigo-600" />
            <span>Origin DNS & Custom Domain Studio</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure apex and subdomain origin DNS records, provision automatic SSL certificates, and deploy your active store theme to edge CDN origins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDomains}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Refresh domains"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (isStarter) {
                setIsUpgradeModalOpen(true);
                return;
              }
              setIsAddDomainModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Connect Custom Domain</span>
          </button>
        </div>
      </div>

      {/* PLAN RESTRICTION LOCK BANNER */}
      {isStarter && (
        <PlanLockOverlay
          inline
          requiredPlan="GROWTH"
          featureTitle="Custom Domain Connection & Edge CDN"
          featureDescription="Connecting apex domains (e.g. yourbrand.com), subdomains, and automated SSL certs requires Growth Pro or Enterprise tier."
        />
      )}

      {/* GLOBAL EDGE ORIGIN INFRASTRUCTURE HERO BANNER */}
      {data && (
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Global Anycast Origin Edge: ACTIVE</span>
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Let's Encrypt TLS: Auto-Renew</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black">
                Origin DNS Configuration & Theme Routing Engine
              </h2>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                When you point your domain’s <code className="text-amber-300 font-mono">A</code> and <code className="text-amber-300 font-mono">CNAME</code> records to our Anycast origin cluster, all visitor requests are routed with edge-cached theme assets, SSR components, and instant SSL provisioning.
              </p>
            </div>

            {/* Edge PoPs Latency Summary */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 w-full lg:w-72 shrink-0 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edge CDN PoPs</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-black">5 Nodes Live</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {data.originConfig.globalCdnNodes.slice(0, 3).map((node) => (
                  <div key={node.code} className="flex justify-between text-[11px] text-slate-200">
                    <span>{node.city} ({node.code})</span>
                    <span className="font-mono text-emerald-400">{node.latencyMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED DOMAINS LIST */}
      <div className="space-y-6">
        <h3 className="text-base font-black text-slate-900 dark:text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Connected Custom Domains ({data?.domains.length || 0})</span>
        </h3>

        {isLoading ? (
          <div className="py-20 text-center space-y-3 bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Loading custom domain and DNS records...</p>
          </div>
        ) : data?.domains.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border">
            <Globe className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-black text-sm text-slate-900 dark:text-foreground">No Custom Domains Connected</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Connect your own domain (e.g. yourstore.com) to establish brand authority and deploy your selected store theme.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {data?.domains.map((dom) => {
              const isExpanded = expandedDnsDomainId === dom.id;

              return (
                <div
                  key={dom.id}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    dom.isPrimary
                      ? 'border-indigo-500 bg-white dark:bg-card shadow-lg'
                      : 'border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm'
                  }`}
                >
                  {/* Domain Card Header */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Domain Name + Badges */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-foreground flex items-center gap-2">
                            <span>{dom.domain}</span>
                            <a
                              href={`https://${dom.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-indigo-600"
                              title="Open domain in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </h4>

                          {dom.isPrimary && (
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider shadow-sm">
                              Primary Store Domain
                            </span>
                          )}

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>SSL {dom.sslStatus}</span>
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>DNS {dom.dnsStatus}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          {dom.autoRedirectWww
                            ? `Auto-redirects www.${dom.domain} to apex domain • HTTPS Strict Transport Security (HSTS) Active.`
                            : 'Direct host mapping active without www redirect.'}
                        </p>
                      </div>

                      {/* Right Actions: DNS Verify & Theme Deployment */}
                      <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
                        <button
                          type="button"
                          disabled={isVerifyingDns === dom.id}
                          onClick={() => handleVerifyDns(dom)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingDns === dom.id ? 'animate-spin' : ''}`} />
                          <span>{isVerifyingDns === dom.id ? 'Checking DNS...' : 'Verify DNS'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeployModal(dom)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md transition active:scale-95 flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Deploy Theme</span>
                        </button>

                        {!dom.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(dom.id)}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-border hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                          >
                            Set Primary
                          </button>
                        )}

                        {data.domains.length > 1 && !dom.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDomain(dom.id, dom.domain)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                            title="Delete domain"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DEPLOYED THEME INFO BOX */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/30 border border-slate-200/60 dark:border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center text-lg shrink-0">
                          🎨
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                            Deployed Storefront Theme
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-foreground text-sm">
                            {dom.themeDeployment?.deployedThemeName || 'Modern Luxury Dark'} ({dom.themeDeployment?.deployedThemeSlug || 'default'})
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Edge PoP</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {dom.themeDeployment?.edgeCdnRegion || 'BOM_MUMBAI'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Edge Cache TTL</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {dom.themeDeployment?.edgeCacheTtl || 3600}s
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                          <span className="text-emerald-600 font-black flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{dom.themeDeployment?.edgeDeploymentStatus || 'DEPLOYED'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand / Collapse DNS Records Toggle */}
                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setExpandedDnsDomainId(isExpanded ? null : dom.id)}
                        className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Origin DNS Records' : 'View Origin DNS Configuration Records'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <span className="text-[11px] text-slate-400">
                        Last verified: {new Date(dom.lastCheckedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* ORIGIN DNS RECORDS TABLE DRAWER */}
                  {isExpanded && (
                    <div className="bg-slate-50/70 dark:bg-accent/20 border-t border-slate-200/80 dark:border-border p-6 sm:p-7 space-y-4 animate-in fade-in">
                      <div className="space-y-1">
                        <h5 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Origin DNS Configuration Required for {dom.domain}
                        </h5>
                        <p className="text-xs text-slate-500">
                          Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains) and add the following records:
                        </p>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-border text-slate-400 font-black uppercase text-[10px] bg-slate-50 dark:bg-accent/40">
                              <th className="py-3 px-4">Record Type</th>
                              <th className="py-3 px-4">Host / Name</th>
                              <th className="py-3 px-4">Required Value / Target</th>
                              <th className="py-3 px-4">TTL</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Copy</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-border">
                            {dom.dnsRecords.map((rec, rIdx) => {
                              const copyKey = `${dom.id}-${rec.type}-${rIdx}`;
                              return (
                                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-accent/20">
                                  <td className="py-3.5 px-4 font-black">
                                    <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                                      {rec.type}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-foreground">
                                    {rec.name}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-accent px-2 py-1 rounded-md text-[11px] select-all">
                                      {rec.value}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">{rec.description}</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-500 font-mono">{rec.ttl}s</td>
                                  <td className="py-3.5 px-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                      ✓ {rec.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(rec.value, copyKey)}
                                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-accent hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                                      title="Copy record value"
                                    >
                                      {copiedKey === copyKey ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONNECT CUSTOM DOMAIN MODAL */}
      {isAddDomainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-border space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-foreground">
                  Connect a Custom Domain
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your root domain or subdomain to route to your store theme.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDomainModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Domain Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourstore.com or shop.brand.in"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Do not include http:// or https://
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deploy Initial Storefront Theme
                </label>
                <select
                  value={newDomainTheme}
                  onChange={(e) => setNewDomainTheme(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                >
                  {availableThemes.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} ({t.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDomainAutoRedirect}
                    onChange={(e) => setNewDomainAutoRedirect(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Automatically redirect www prefix to apex domain
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDomainIsPrimary}
                    onChange={(e) => setNewDomainIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Set this as the Primary Store Domain
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddDomainModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingDomain}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{isAddingDomain ? 'Connecting...' : 'Connect Domain'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPLOY THEME TO DOMAIN MODAL */}
      {deployingDomain && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-border space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-foreground">
                  Deploy Theme to {deployingDomain.domain}
                </h3>
                <p className="text-xs text-slate-400">
                  Select which storefront theme and edge CDN region to serve on this domain.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeployingDomain(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeployTheme} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Storefront Theme to Deploy:
                </label>
                <div className="space-y-2">
                  {availableThemes.map((theme) => (
                    <div
                      key={theme.slug}
                      onClick={() => setSelectedThemeSlug(theme.slug)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        selectedThemeSlug === theme.slug
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-border hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-black text-slate-900 dark:text-foreground">
                        <div className="flex items-center gap-2">
                          <Radio className={`w-4 h-4 ${selectedThemeSlug === theme.slug ? 'text-indigo-600' : 'text-slate-300'}`} />
                          <span>{theme.name}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                          {theme.badge}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1 pl-6 text-[11px]">{theme.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Origin Edge Region
                </label>
                <select
                  value={selectedEdgeRegion}
                  onChange={(e) => setSelectedEdgeRegion(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-accent font-bold"
                >
                  <option value="BOM_MUMBAI">Mumbai, India (BOM) — 8ms latency</option>
                  <option value="SIN_SINGAPORE">Singapore (SIN) — 24ms latency</option>
                  <option value="FRA_FRANKFURT">Frankfurt, EU (FRA) — 42ms latency</option>
                  <option value="IAD_US_EAST">Virginia, US (IAD) — 65ms latency</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Deploying will generate fresh edge bundles and invalidate the global CDN cache within 300ms.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeployingDomain(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-accent font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeployingTheme}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isDeployingTheme ? 'Deploying Theme...' : 'Deploy Theme to Edge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DNS VERIFICATION DIAGNOSTICS MODAL */}
      {diagnosticsModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-border space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-foreground">
                    DNS Diagnostics for {diagnosticsModalData.domain}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    All Origin Records & SSL Fully Propagated
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDiagnosticsModalData(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-accent flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Resolvers Status */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Global Resolvers Check:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {diagnosticsModalData.diagnostics?.resolvers?.map((res: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-accent/40 rounded-xl border text-center">
                    <span className="text-[10px] text-slate-400 block font-bold truncate">{res.name}</span>
                    <span className="text-emerald-600 font-black text-[11px]">✓ {res.status}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{res.latency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SSL Certificate Card */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900 text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Universal TLS Certificate</span>
                </span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
                  TLS 1.3 / HTTP/2 Active
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Issued by {diagnosticsModalData.diagnostics?.sslCertificate?.provider}. Auto-renews automatically every 90 days.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDiagnosticsModalData(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-xs shadow-md"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal for Custom Domains */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-accent text-slate-500 hover:text-slate-900 transition"
            >
              ✕
            </button>
            <PlanLockOverlay
              requiredPlan="GROWTH"
              featureTitle="Custom Domain & SSL Provisioning"
              featureDescription="Connecting apex domains (e.g. yourbrand.com), automated Let's Encrypt SSL certificates, and edge CDN deployments requires Growth Pro or Scale Enterprise tier."
              perks={[
                'Custom Apex Domains & Subdomains',
                'Automated Let’s Encrypt TLS 1.3 / HTTP/2 SSL',
                'Edge CDN Anycast Origin Routing',
                'Up to 1,000 Product Listings Capacity',
                '0.5% Low Platform Transaction Fee',
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

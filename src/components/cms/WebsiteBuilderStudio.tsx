'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Sparkles,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  RefreshCw,
  Plus,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  ArrowLeft,
  GitBranch,
  Server,
  Code2,
  ChevronRight,
  Eye,
  Search,
  Filter,
  Check,
  Zap,
  ShieldCheck,
  Crown,
  FileCode,
  Sliders,
  History,
  AlertCircle,
  X,
  RotateCcw,
  Bot,
  Send,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  EyeOff,
  LayoutGrid,
  Palette,
  Settings2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import {
  websiteService,
  WebsiteTheme,
  StoreWebsite,
  WebsitePage,
  AiEditProposal,
  WebsiteEditLog,
  SectionBlock,
  SectionDefinition,
} from '@/src/services/websiteService';
import { DnsManagerModal } from './DnsManagerModal';
import { AddPageWizardModal } from './AddPageWizardModal';
import { PageSeoModal } from './PageSeoModal';
import { RobotsSitemapModal } from './RobotsSitemapModal';
import { DedicatedBackendModal } from './DedicatedBackendModal';
import { MiordrTemplatePickerModal } from './MiordrTemplatePickerModal';

export function WebsiteBuilderStudio() {
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<StoreWebsite | null>(null);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isPlanGated, setIsPlanGated] = useState(false);
  const [themes, setThemes] = useState<WebsiteTheme[]>([]);

  // Theme Gallery state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<WebsiteTheme | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStepMessage, setDeployStepMessage] = useState('');

  // Builder Studio view state
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTarget, setPreviewTarget] = useState<'local' | 'live'>('local');
  const [activePageSlug, setActivePageSlug] = useState('/');
  const [isDeployTriggering, setIsDeployTriggering] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showDnsModal, setShowDnsModal] = useState(false);

  // Phase 5: Multi-Page Wizard, SEO & Robots Modal State
  const [showPageWizard, setShowPageWizard] = useState(false);
  const [selectedPageForSeo, setSelectedPageForSeo] = useState<WebsitePage | null>(null);
  const [showRobotsModal, setShowRobotsModal] = useState(false);

  // Phase 6: Dedicated Backend Infrastructure Modal State
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [showTemplatePickerModal, setShowTemplatePickerModal] = useState(false);

  // Studio Right Panel Tabs: 'sections' (Phase 3) | 'ai' (Phase 2) | 'history'
  const [activeRightTab, setActiveRightTab] = useState<'sections' | 'ai' | 'history'>('sections');

  // Phase 3: Visual Section State
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [sectionLibrary, setSectionLibrary] = useState<SectionDefinition[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isSavingSections, setIsSavingSections] = useState(false);
  const [saveSectionsMsg, setSaveSectionsMsg] = useState('');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [sectionCategoryFilter, setSectionCategoryFilter] = useState('all');
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');

  // Phase 2: AI Editor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [activeProposal, setActiveProposal] = useState<AiEditProposal | null>(null);
  const [isApplyingProposal, setIsApplyingProposal] = useState(false);
  const [proposalSuccessMsg, setProposalSuccessMsg] = useState('');
  const [historyList, setHistoryList] = useState<WebsiteEditLog[]>([]);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load website & theme catalog & section library
  const loadData = async () => {
    try {
      setLoading(true);
      const [res, themeCatalog, library] = await Promise.all([
        websiteService.getStoreWebsite().catch((err) => {
          if (err.response?.status === 403 || err.response?.data?.code === 'PLAN_GATED') {
            setIsPlanGated(true);
          }
          return null;
        }),
        websiteService.getThemes().catch(() => []),
        websiteService.getSectionLibrary().catch(() => []),
      ]);

      if (res) {
        setWebsite(res.website);
        setStoreInfo(res.store);
        setIsPlanGated(res.isPlanGated);
        if (res.website?.editHistory) {
          setHistoryList(res.website.editHistory);
        }
      }
      setThemes(themeCatalog);
      setSectionLibrary(library);
    } catch (err) {
      console.error('Failed to load website builder state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch sections whenever activePageSlug or website changes
  const loadSections = async (slug: string) => {
    if (!website) return;
    try {
      setIsLoadingSections(true);
      const res = await websiteService.getSections(slug);
      setSections(res.sections || []);
      if (res.sections && res.sections.length > 0) {
        setSelectedSectionId(res.sections[0].id);
      } else {
        setSelectedSectionId(null);
      }
    } catch (err) {
      console.error('Failed to load page sections:', err);
    } finally {
      setIsLoadingSections(false);
    }
  };

  useEffect(() => {
    if (website) {
      loadSections(activePageSlug);
    }
  }, [activePageSlug, website?.id]);

  // Listen to postMessage from preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SELECT_SECTION' || event.data?.type === 'SECTION_CLICKED') {
        const targetId = event.data.sectionId;
        if (targetId) {
          setSelectedSectionId(targetId);
          setActiveRightTab('sections');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle template selection and site provisioning
  const handleProvisionWebsite = async (theme: WebsiteTheme) => {
    try {
      setSelectedTheme(theme);
      setIsDeploying(true);

      setDeployStepMessage(`Forking ${theme.source === 'miordr' ? 'Miordr template' : 'theme'} from ${theme.repoFullName}...`);
      await new Promise((r) => setTimeout(r, 900));

      setDeployStepMessage('Configuring Netlify deployment and injecting environment variables...');
      await new Promise((r) => setTimeout(r, 900));

      setDeployStepMessage('Setting up store routes and DNS aliases...');
      const createdWebsite = await websiteService.createStoreWebsite(theme.slug);

      setDeployStepMessage('Storefront successfully provisioned on Netlify!');
      await new Promise((r) => setTimeout(r, 700));

      setWebsite(createdWebsite.website);
      setIsDeploying(false);
      loadSections('/');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create website');
      setIsDeploying(false);
    }
  };

  // Trigger manual build redeployment on Netlify
  const handleTriggerDeploy = async () => {
    try {
      setIsDeployTriggering(true);
      const res = await websiteService.triggerDeploy();
      if (res.success && website) {
        setWebsite({
          ...website,
          lastDeployStatus: 'building',
          lastDeployAt: new Date().toISOString(),
        });
        setTimeout(() => {
          setWebsite((prev) => (prev ? { ...prev, lastDeployStatus: 'success' } : null));
          setIsDeployTriggering(false);
          setIframeKey((k) => k + 1);
        }, 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Deploy trigger failed');
      setIsDeployTriggering(false);
    }
  };

  // Add custom page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle || !newPageSlug) return;
    try {
      setIsCreatingPage(true);
      const created = await websiteService.createPage({
        title: newPageTitle,
        slug: newPageSlug,
        pageType: 'custom',
      });
      if (website) {
        setWebsite({
          ...website,
          pages: [...website.pages, created],
        });
      }
      setShowAddPageModal(false);
      setNewPageTitle('');
      setNewPageSlug('');
      setActivePageSlug(created.slug);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create page');
    } finally {
      setIsCreatingPage(false);
    }
  };

  // Multi-page handlers
  const handlePageCreated = (page: WebsitePage) => {
    if (website) {
      setWebsite({
        ...website,
        pages: [...website.pages, page],
      });
    }
    setActivePageSlug(page.slug);
    loadSections(page.slug);
    setIframeKey((k) => k + 1);
  };

  const handlePageUpdated = (updated: WebsitePage) => {
    if (website) {
      setWebsite({
        ...website,
        pages: website.pages.map((p) => (p.id === updated.id ? updated : p)),
      });
    }
    if (activePageSlug === updated.slug) {
      setIframeKey((k) => k + 1);
    }
  };

  const handlePageDeleted = (pageId: string) => {
    if (website) {
      setWebsite({
        ...website,
        pages: website.pages.filter((p) => p.id !== pageId),
      });
    }
    setActivePageSlug('/');
    loadSections('/');
    setIframeKey((k) => k + 1);
  };

  const handlePageDuplicated = (newPage: WebsitePage) => {
    if (website) {
      setWebsite({
        ...website,
        pages: [...website.pages, newPage],
      });
    }
    setActivePageSlug(newPage.slug);
    loadSections(newPage.slug);
    setIframeKey((k) => k + 1);
  };

  const handleReorderPages = async (index: number, direction: 'up' | 'down') => {
    if (!website) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= website.pages.length) return;

    const reordered = [...website.pages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setWebsite({ ...website, pages: reordered });

    const orders = reordered.map((p, idx) => ({ id: p.id, sortOrder: idx }));
    await websiteService.reorderPages(orders).catch((err) => {
      console.error('Failed to save page order:', err);
    });
  };

  // Section Actions
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSections(updated);
  };

  const handleToggleVisibility = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleDuplicateSection = (section: SectionBlock, index: number) => {
    const clone: SectionBlock = {
      ...JSON.parse(JSON.stringify(section)),
      id: `${section.type}-${Date.now().toString(36)}`,
      name: `${section.name} (Copy)`,
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, clone);
    setSections(updated);
    setSelectedSectionId(clone.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!confirm('Are you sure you want to remove this section?')) return;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  const handleUpdateSectionProp = (sectionId: string, propKey: string, value: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          props: {
            ...s.props,
            [propKey]: value,
          },
        };
      })
    );
  };

  const handleUpdateSectionName = (sectionId: string, name: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, name } : s))
    );
  };

  const handleAddSectionFromLibrary = (def: SectionDefinition) => {
    const newSection: SectionBlock = {
      id: `${def.type}-${Date.now().toString(36)}`,
      type: def.type,
      name: def.name,
      isVisible: true,
      props: JSON.parse(JSON.stringify(def.defaultProps)),
    };
    setSections((prev) => [...prev, newSection]);
    setSelectedSectionId(newSection.id);
    setShowAddSectionModal(false);
  };

  const handleSaveSections = async () => {
    try {
      setIsSavingSections(true);
      setSaveSectionsMsg('');
      const result = await websiteService.saveSections(activePageSlug, sections);
      if (result.success) {
        setSaveSectionsMsg(`Saved ${result.sectionCount} sections! Generated TSX committed to GitHub.`);
        if (website) {
          setWebsite({
            ...website,
            lastDeployStatus: 'building',
            lastDeployAt: new Date().toISOString(),
          });
        }
        setTimeout(() => {
          setWebsite((prev) => (prev ? { ...prev, lastDeployStatus: 'success' } : null));
          setSaveSectionsMsg('');
          setIframeKey((k) => k + 1);
        }, 3500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save sections');
    } finally {
      setIsSavingSections(false);
    }
  };

  // AI Proposal Handlers
  const handleGenerateAiProposal = async (promptToUse?: string) => {
    const text = promptToUse || aiPrompt;
    if (!text.trim()) return;
    try {
      setIsGeneratingProposal(true);
      setProposalSuccessMsg('');
      const proposal = await websiteService.generateAiEdit(text, activePageSlug);
      setActiveProposal(proposal);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to generate AI proposal');
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleApplyProposal = async () => {
    if (!activeProposal) return;
    try {
      setIsApplyingProposal(true);
      const result = await websiteService.applyAiEdit(activeProposal);
      if (result.success) {
        setProposalSuccessMsg(`Applied commit ${result.commitSha} to ${activeProposal.targetFile}! Netlify deploy triggered.`);
        if (website) {
          setWebsite({
            ...website,
            aiEditsUsed: website.aiEditsUsed + 1,
            lastDeployStatus: 'building',
            lastDeployAt: new Date().toISOString(),
          });
        }
        setHistoryList((prev) => [result.editLog, ...prev]);
        setActiveProposal(null);
        setAiPrompt('');
        setTimeout(() => {
          setWebsite((prev) => (prev ? { ...prev, lastDeployStatus: 'success' } : null));
          setProposalSuccessMsg('');
          setIframeKey((k) => k + 1);
        }, 3500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to apply AI edit');
    } finally {
      setIsApplyingProposal(false);
    }
  };

  const handleRevertEdit = async (editLogId: string) => {
    try {
      setRevertingId(editLogId);
      const res = await websiteService.revertAiEdit(editLogId);
      if (res.success) {
        alert(res.message);
        const updatedHistory = await websiteService.getAiHistory();
        setHistoryList(updatedHistory);
        if (website) {
          setWebsite({
            ...website,
            lastDeployStatus: 'building',
          });
          setTimeout(() => {
            setWebsite((prev) => (prev ? { ...prev, lastDeployStatus: 'success' } : null));
            setIframeKey((k) => k + 1);
          }, 3000);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revert edit');
    } finally {
      setRevertingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 bg-slate-50 font-sans">
        <RefreshCw className="w-8 h-8 text-slate-800 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Website Builder Studio...</p>
      </div>
    );
  }

  // 1. Plan Gated State (Free Tier)
  if (isPlanGated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-800">
            <Lock className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 rounded-full border border-slate-200">
            Available on Paid Plans
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Unlock the OmniStore Website Builder
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto mt-4 text-base leading-relaxed">
            Create, customize, and deploy isolated Next.js storefronts on Netlify with full Git ownership, section-based visual editing, AI page updates, and custom DNS management.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left max-w-2xl mx-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Code2 className="w-5 h-5 text-slate-800 mb-2" />
              <h4 className="text-slate-900 font-bold text-sm">Real Code Ownership</h4>
              <p className="text-xs text-slate-500 mt-1">Forked to your private GitHub repo, not an iframe lock-in.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Layers className="w-5 h-5 text-slate-800 mb-2" />
              <h4 className="text-slate-900 font-bold text-sm">Visual Section Editor</h4>
              <p className="text-xs text-slate-500 mt-1">Drag, reorder, and visually customize sections with instant TSX generation.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="text-slate-900 font-bold text-sm">Gemini AI Editor</h4>
              <p className="text-xs text-slate-500 mt-1">Edit sections, redesign layouts, and add pages in natural language.</p>
            </div>
          </div>
          <a
            href="/billing"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            Upgrade to Starter Plan <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // 2. Theme Selection / Creation Flow (No website created yet)
  if (!website) {
    const miordrTemplates = themes.filter((t) => t.source === 'miordr');
    const baseThemes = themes.filter((t) => t.source === 'base');

    const filteredMiordr = miordrTemplates.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.categories.includes(selectedCategory.toLowerCase());
      const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    const filteredBase = baseThemes.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.categories.includes(selectedCategory.toLowerCase());
      const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    return (
      <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
        {/* Navigation back to dashboard */}
        <div className="flex items-center justify-between">
          <a
            href="/dashboard"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.opener) {
                e.preventDefault();
                window.close();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </a>
        </div>

        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Next.js Storefront Generator
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose a Starting Point for Your Store
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Select a template. We fork a real Next.js repository into your store's private workspace, deploy it on Netlify, and give you 100% full editability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Hosting:</span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Netlify Auto-Deploy
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {['all', 'fashion', 'electronics', 'beauty', 'grocery', 'b2b', 'furniture', 'pets'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
            />
          </div>
        </div>

        {/* Deployment Modal Progress */}
        {isDeploying && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-slate-800 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Provisioning Storefront</h3>
                <p className="text-xs text-slate-600 font-semibold mt-1 animate-pulse">
                  {deployStepMessage}
                </p>
              </div>
              <div className="space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <Check className="w-4 h-4" /> <span>GitHub Repo initialized under omnistore-org</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <Check className="w-4 h-4" /> <span>Netlify CI/CD connected with Next.js presets</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> <span>Finalizing build & DNS aliases...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1: MIORDR TEMPLATES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Miordr Business Templates
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
                Curated Vertical Solutions
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {filteredMiordr.length} available
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Niche-ready storefronts engineered with bespoke pages (lookbooks, size guides, spec sheets, bulk orders) and vertical-tuned content. 100% editable.
          </p>

          {filteredMiordr.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <p className="text-xs text-slate-500">
                No Miordr business templates available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMiordr.map((theme) => (
                <div
                  key={theme.slug}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-400 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={theme.previewImage}
                      alt={theme.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {theme.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900/80 text-white shadow-md">
                        {theme.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
                        {theme.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                        {theme.repoFullName}
                      </span>
                      <button
                        onClick={() => handleProvisionWebsite(theme)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        Use This Theme <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: BASE NEXT.JS THEMES */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Base Store Themes
              </h2>
            </div>
            <span className="text-xs text-slate-500">{filteredBase.length} available</span>
          </div>

          {filteredBase.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <p className="text-xs text-slate-500">No base store themes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBase.map((theme) => (
                <div
                  key={theme.slug}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-400 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={theme.previewImage}
                      alt={theme.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {theme.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900/80 text-white backdrop-blur-sm">
                        {theme.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
                        {theme.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                        {theme.repoFullName}
                      </span>
                      <button
                        onClick={() => handleProvisionWebsite(theme)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        Use This Theme <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Website Builder Studio View (Active Website provisioned)
  const localBaseUrl = 'http://localhost:3002';
  const liveBaseUrl = website.netlifyDeployUrl || `https://${website.subdomain}`;
  const previewIframeUrl = previewTarget === 'local'
    ? `${localBaseUrl}${activePageSlug === '/' ? '' : activePageSlug}`
    : `${liveBaseUrl}${activePageSlug === '/' ? '' : activePageSlug}`;

  const getQuickSeeds = () => {
    if (website.themeSlug === 'miordr-bridal-collection') {
      return [
        'Add bridal trousseau consultation appointment CTA',
        'Add royal embroidery craftsmanship section',
        'Convert collection grid to masonry lookbook layout',
      ];
    }
    if (website.themeSlug === 'miordr-luxury-skincare') {
      return [
        'Add clean ingredients certifications section',
        'Add morning vs night skincare ritual toggle',
        'Highlight dermatologist-tested badges on hero',
      ];
    }
    if (website.themeSlug === 'miordr-d2c-electronics') {
      return [
        'Add audio spec comparison sheet table',
        'Highlight IPX7 water resistance and 40h battery badges',
        'Add interactive noise cancellation feature tabs',
      ];
    }
    return [
      'Change hero background to full-width video with dark overlay',
      'Make product catalog 4 columns on desktop',
      'Add customer testimonials carousel with 5-star ratings',
      'Change primary CTA button style to gold with hover effect',
    ];
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedSectionDef = sectionLibrary.find((d) => d.type === selectedSection?.type);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* TOP STATUS BAR */}
      <div className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.opener) {
                e.preventDefault();
                window.close();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer mr-1"
            title="Return to Dashboard / Close Tab"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </a>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                website.lastDeployStatus === 'success'
                  ? 'bg-emerald-500 shadow-xs'
                  : 'bg-amber-500 animate-ping'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700">
              {website.lastDeployStatus === 'success' ? 'Live on Netlify' : 'Deploying...'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Miordr Template & Base Version Picker Button */}
          <button
            onClick={() => setShowTemplatePickerModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors group cursor-pointer"
            title="Browse Miordr Business Templates & Platform Updates"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-900" />
            <span className="font-semibold capitalize">{website.themeSlug}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 border border-slate-300 text-slate-800">
              Miordr
            </span>
          </button>

          {/* Subdomain & Custom domain interactive button */}
          <button
            onClick={() => setShowDnsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-mono transition-colors group cursor-pointer"
            title="Manage Domain & DNS Records"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-900" />
            <span>{website.customDomain || website.subdomain}</span>
            {website.customDomain ? (
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                  website.domainStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {website.domainStatus === 'active' ? 'SSL ✅' : 'DNS ⏳'}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[9px]">
                + Connect Domain
              </span>
            )}
          </button>

          {/* Backend Tier Button */}
          <button
            onClick={() => setShowBackendModal(true)}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border hidden lg:inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            title="Inspect Storefront Backend & 99.99% Dedicated SLA"
          >
            <Server className="w-3 h-3 text-slate-500" />
            <span>{website.backendTier === 'dedicated' ? '⚡ Dedicated Backend (99.99%)' : 'Shared API'}</span>
          </button>
        </div>

        {/* Center: Viewport Toggles + Preview Target */}
        <div className="flex items-center gap-2">
          {/* Viewport Toggles */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewportMode === 'desktop' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Desktop view"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewportMode === 'tablet' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tablet view (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Mobile view (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Source Toggle: Local :3002 vs Live Netlify */}
          <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setPreviewTarget('local')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                previewTarget === 'local'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Preview local template (http://localhost:3002)"
            >
              Local (:3002)
            </button>
            <button
              type="button"
              onClick={() => setPreviewTarget('live')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                previewTarget === 'live'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Preview live Netlify site"
            >
              Live Netlify
            </button>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs border border-slate-200 transition-colors cursor-pointer"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTriggerDeploy}
            disabled={isDeployTriggering}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDeployTriggering ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Redeploy</span>
          </button>

          <a
            href={previewTarget === 'local' ? `http://localhost:3002${activePageSlug === '/' ? '' : activePageSlug}` : (website.netlifyDeployUrl || `https://${website.subdomain}`)}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span>{previewTarget === 'local' ? 'Open Storefront' : 'View Live'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* WORKSPACE MAIN BODY: LEFT DRAWER + CANVAS + RIGHT DRAWER */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: PAGE TREE & GIT DETAILS */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pages ({website.pages.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowRobotsModal(true)}
                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors cursor-pointer"
                title="SEO & Robots.txt / Sitemap"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowPageWizard(true)}
                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors cursor-pointer"
                title="Add Page (Wizard)"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {website.pages.map((p, index) => {
              const isActive = activePageSlug === p.slug;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActivePageSlug(p.slug);
                    setActiveProposal(null);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors group cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        p.isPublished ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={p.isPublished ? 'Published' : 'Draft'}
                    />
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{p.title}</span>
                  </div>

                  {/* Actions: Reorder & SEO Settings */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100"
                  >
                    <button
                      onClick={() => handleReorderPages(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded disabled:opacity-0 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleReorderPages(index, 'down')}
                      disabled={index === website.pages.length - 1}
                      className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded disabled:opacity-0 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSelectedPageForSeo(p)}
                      className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded transition-colors cursor-pointer"
                      title="Page Settings & SEO"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Repo & Template Info Card */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> Repository:
              </span>
              <span className="text-slate-800 font-bold uppercase">{website.themeSource}</span>
            </div>
            <a
              href={website.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-slate-600 font-mono hover:underline truncate block"
            >
              {website.repoFullName}
            </a>
          </div>
        </div>

        {/* CENTER PREVIEW CANVAS */}
        <div className="flex-1 bg-slate-100/70 flex items-center justify-center p-4 overflow-hidden relative">
          <div
            className={`h-full bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 border border-slate-200 ${
              viewportMode === 'desktop'
                ? 'w-full'
                : viewportMode === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={previewIframeUrl}
              title="Storefront Live Preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>

        {/* RIGHT PANEL: VISUAL SECTIONS + GEMINI AI + AUDIT LOG */}
        <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          {/* Right Header Tabs */}
          <div className="h-12 px-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveRightTab('sections')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeRightTab === 'sections'
                    ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-700" />
                <span>Sections ({sections.length})</span>
              </button>
              <button
                onClick={() => setActiveRightTab('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeRightTab === 'ai'
                    ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gemini AI</span>
              </button>
              <button
                onClick={() => setActiveRightTab('history')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  activeRightTab === 'history'
                    ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-700" />
                <span>History</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SECTION-BASED VISUAL EDITOR */}
          {activeRightTab === 'sections' && (
            <div className="flex-1 flex flex-col overflow-hidden text-xs">
              {/* Section Header Controls */}
              <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Page Layout
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Route: {activePageSlug}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSectionModal(true)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                    <span>Add Section</span>
                  </button>
                  <button
                    onClick={handleSaveSections}
                    disabled={isSavingSections}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingSections ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Save & Deploy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Save Success Banner */}
              {saveSectionsMsg && (
                <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium">{saveSectionsMsg}</span>
                </div>
              )}

              {/* Body: Section List & Property Inspector */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
                {isLoadingSections ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-slate-800" />
                    <p className="font-medium">Loading page sections...</p>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-3 p-4 border border-dashed border-slate-200 rounded-2xl bg-white shadow-2xs">
                    <Layers className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="font-semibold text-slate-700">No sections on this page yet</p>
                    <button
                      onClick={() => setShowAddSectionModal(true)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add First Section
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sections.map((section, index) => {
                      const isSelected = selectedSectionId === section.id;
                      return (
                        <div
                          key={section.id}
                          className={`rounded-2xl border transition-all ${
                            isSelected
                              ? 'bg-slate-50/50 border-2 border-slate-900 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Section Card Row */}
                          <div
                            onClick={() => setSelectedSectionId(isSelected ? null : section.id)}
                            className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                                {index + 1}
                              </span>
                              <div className="truncate">
                                <span className={`font-bold block truncate text-xs ${section.isVisible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                                  {section.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {section.type}
                                </span>
                              </div>
                            </div>

                            {/* Actions toolbar */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 shrink-0"
                            >
                              <button
                                onClick={() => handleMoveSection(index, 'up')}
                                disabled={index === 0}
                                title="Move up"
                                className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveSection(index, 'down')}
                                disabled={index === sections.length - 1}
                                title="Move down"
                                className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleVisibility(section.id)}
                                title={section.isVisible ? 'Hide Section' : 'Show Section'}
                                className={`p-1 rounded cursor-pointer ${section.isVisible ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-amber-700 bg-amber-50'}`}
                              >
                                {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDuplicateSection(section, index)}
                                title="Duplicate section"
                                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                title="Delete section"
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                              <button
                                onClick={() => setSelectedSectionId(isSelected ? null : section.id)}
                                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                              >
                                {isSelected ? <ChevronUp className="w-4 h-4 text-slate-800" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Section Property Inspector Accordion */}
                          {isSelected && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl space-y-3">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                  <Settings2 className="w-3.5 h-3.5" /> Customize Section Props
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {section.id}
                                </span>
                              </div>

                              {/* Section Title Editor */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Display Label
                                </label>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(e) => handleUpdateSectionName(section.id, e.target.value)}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:outline-none shadow-2xs"
                                />
                              </div>

                              {/* Dynamic Fields from Schema */}
                              {selectedSectionDef?.schema ? (
                                Object.entries(selectedSectionDef.schema).map(([propKey, schemaDef]) => {
                                  const val = section.props?.[propKey] ?? schemaDef.default ?? '';

                                  if (schemaDef.type === 'select') {
                                    return (
                                      <div key={propKey}>
                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                          {schemaDef.label}
                                        </label>
                                        <select
                                          value={val}
                                          onChange={(e) => handleUpdateSectionProp(section.id, propKey, e.target.value)}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none capitalize shadow-2xs"
                                        >
                                          {schemaDef.options?.map((opt) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    );
                                  }

                                  if (schemaDef.type === 'textarea') {
                                    return (
                                      <div key={propKey}>
                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                          {schemaDef.label}
                                        </label>
                                        <textarea
                                          rows={3}
                                          value={val}
                                          onChange={(e) => handleUpdateSectionProp(section.id, propKey, e.target.value)}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none resize-none shadow-2xs"
                                        />
                                      </div>
                                    );
                                  }

                                  if (schemaDef.type === 'boolean') {
                                    return (
                                      <div key={propKey} className="flex items-center justify-between pt-1">
                                        <label className="text-[11px] font-semibold text-slate-700">
                                          {schemaDef.label}
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSectionProp(section.id, propKey, !val)}
                                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            val ? 'bg-slate-900' : 'bg-slate-300'
                                          }`}
                                        >
                                          <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                              val ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                          />
                                        </button>
                                      </div>
                                    );
                                  }

                                  if (schemaDef.type === 'number') {
                                    return (
                                      <div key={propKey}>
                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                          {schemaDef.label}
                                        </label>
                                        <input
                                          type="number"
                                          value={val}
                                          onChange={(e) => handleUpdateSectionProp(section.id, propKey, Number(e.target.value))}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                                        />
                                      </div>
                                    );
                                  }

                                  if (schemaDef.type === 'media') {
                                    return (
                                      <div key={propKey} className="space-y-1.5">
                                        <label className="block text-[11px] font-semibold text-slate-700">
                                          {schemaDef.label}
                                        </label>
                                        <input
                                          type="text"
                                          value={val}
                                          placeholder="https://..."
                                          onChange={(e) => handleUpdateSectionProp(section.id, propKey, e.target.value)}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono shadow-2xs"
                                        />
                                        {val && typeof val === 'string' && val.startsWith('http') && (
                                          <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-200 bg-white mt-1">
                                            <img src={val} alt="Preview" className="w-full h-full object-cover" />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  // Default 'text'
                                  return (
                                    <div key={propKey}>
                                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                        {schemaDef.label}
                                      </label>
                                      <input
                                        type="text"
                                        value={val}
                                        onChange={(e) => handleUpdateSectionProp(section.id, propKey, e.target.value)}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                                      />
                                    </div>
                                  );
                                })
                              ) : (
                                Object.entries(section.props || {}).map(([key, val]) => (
                                  <div key={key}>
                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    <input
                                      type="text"
                                      value={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                      onChange={(e) => handleUpdateSectionProp(section.id, key, e.target.value)}
                                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none shadow-2xs"
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI AI ASSISTANT */}
          {activeRightTab === 'ai' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/30">
              {/* Context & Quota Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Targeting Component</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono border border-slate-200">
                    {activePageSlug === '/' ? 'HomePage.tsx' : `${activePageSlug.replace('/', '')}Page.tsx`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">Monthly AI Edits Used:</span>
                  <span className="text-slate-900 font-bold">{website.aiEditsUsed} edits</span>
                </div>
                {website.themeSource === 'miordr' && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Niche vocabulary & patterns active for {website.themeSlug}</span>
                  </div>
                )}
              </div>

              {/* Prompt Input Box */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-slate-700" /> What would you like to change?
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. 'Make the hero background video full-width and change CTA button to gold'"
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleGenerateAiProposal();
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Press Ctrl+Enter to submit</span>
                  <button
                    onClick={() => handleGenerateAiProposal()}
                    disabled={isGeneratingProposal || !aiPrompt.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingProposal ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Diff...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Generate Diff</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Prompt Seeds */}
              {!activeProposal && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Suggestions
                  </span>
                  <div className="space-y-1.5">
                    {getQuickSeeds().map((seed, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAiPrompt(seed);
                          handleGenerateAiProposal(seed);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] border border-slate-200 transition-colors flex items-center justify-between group shadow-2xs cursor-pointer"
                      >
                        <span className="truncate">{seed}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {proposalSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{proposalSuccessMsg}</span>
                </div>
              )}

              {/* Active AI Proposal Inspection Card */}
              {activeProposal && (
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> {activeProposal.aiModel}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      {Math.round(activeProposal.confidence * 100)}% Confidence
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{activeProposal.description}</h4>
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                      Target: {activeProposal.targetFile}
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Proposed Changes:
                    </span>
                    {activeProposal.diffSummary.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveProposal(null)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleApplyProposal}
                      disabled={isApplyingProposal}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isApplyingProposal ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Committing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Deploy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT AUDIT LOG & UNDO */}
          {activeRightTab === 'history' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/30">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Git Commit Audit Trail
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {website.repoFullName}
                </span>
              </div>

              {historyList && historyList.length > 0 ? (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs leading-snug">
                        {item.description}
                      </span>
                      {item.commitSha && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] shrink-0 border border-slate-200">
                          {item.commitSha.slice(0, 7)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="capitalize">{item.source} {item.aiModel ? `(${item.aiModel})` : ''}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleRevertEdit(item.id)}
                        disabled={revertingId === item.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer border border-slate-200"
                      >
                        <RotateCcw className={`w-3 h-3 ${revertingId === item.id ? 'animate-spin' : ''}`} />
                        <span>Revert (Undo)</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <History className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-700">No custom edits committed yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD SECTION LIBRARY MODAL */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl text-xs font-sans text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-base">Section Library</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">
                  {sectionLibrary.length} Available Blocks
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter categories & search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {['all', 'hero', 'products', 'content', 'social_proof', 'promotions', 'forms'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSectionCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                      sectionCategoryFilter === cat
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search sections..."
                  value={sectionSearchQuery}
                  onChange={(e) => setSectionSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                />
              </div>
            </div>

            {/* Section Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
              {sectionLibrary
                .filter((def) => {
                  const matchCat = sectionCategoryFilter === 'all' || def.category === sectionCategoryFilter;
                  const matchSearch =
                    !sectionSearchQuery ||
                    def.name.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                    def.description.toLowerCase().includes(sectionSearchQuery.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map((def) => (
                  <div
                    key={def.type}
                    className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col justify-between space-y-3 group transition-all shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-xs">
                          {def.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 uppercase font-mono">
                          {def.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {def.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddSectionFromLibrary(def)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Page</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: DNS & CUSTOM DOMAIN MANAGEMENT MODAL */}
      <DnsManagerModal
        isOpen={showDnsModal}
        onClose={() => setShowDnsModal(false)}
        onDomainUpdated={(newDomain) => {
          if (website) {
            setWebsite({
              ...website,
              customDomain: newDomain || undefined,
              domainStatus: newDomain ? 'pending_ns' : 'none',
              sslStatus: newDomain ? 'pending' : 'none',
            });
          }
        }}
      />

      {/* PHASE 5: MULTI-PAGE CREATION WIZARD MODAL */}
      <AddPageWizardModal
        isOpen={showPageWizard}
        onClose={() => setShowPageWizard(false)}
        onPageCreated={handlePageCreated}
        sectionLibrary={sectionLibrary}
      />

      {/* PHASE 5: PAGE SEO & SETTINGS MODAL */}
      <PageSeoModal
        isOpen={!!selectedPageForSeo}
        onClose={() => setSelectedPageForSeo(null)}
        page={selectedPageForSeo}
        storeDomain={website.customDomain || website.subdomain}
        onPageUpdated={handlePageUpdated}
        onPageDeleted={handlePageDeleted}
        onPageDuplicated={handlePageDuplicated}
      />

      {/* PHASE 5: ROBOTS.TXT & SITEMAP XML MANAGER MODAL */}
      <RobotsSitemapModal
        isOpen={showRobotsModal}
        onClose={() => setShowRobotsModal(false)}
        domainUrl={website.customDomain || website.subdomain}
      />

      {/* PHASE 6: DEDICATED BACKEND INFRASTRUCTURE MODAL */}
      <DedicatedBackendModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
        onTierChanged={(newTier) => {
          if (website) {
            setWebsite({
              ...website,
              backendTier: newTier,
            });
          }
        }}
      />

      {/* BASE TEMPLATE & MIORDR TEMPLATES PICKER MODAL */}
      <MiordrTemplatePickerModal
        isOpen={showTemplatePickerModal}
        onClose={() => setShowTemplatePickerModal(false)}
        currentThemeSlug={website.themeSlug}
        onTemplateApplied={() => {
          loadData();
          setIframeKey((k) => k + 1);
        }}
      />
    </div>
  );
}

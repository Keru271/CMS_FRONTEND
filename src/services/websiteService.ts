import apiClient from '@/src/lib/axios';

export interface SectionBlock {
  id: string;
  type: string;
  name: string;
  isVisible: boolean;
  props: Record<string, any>;
}

export interface SectionDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  defaultProps: Record<string, any>;
  schema: Record<string, { type: string; label: string; options?: string[]; default?: any }>;
}

export interface WebsiteTheme {
  id: string;
  slug: string;
  name: string;
  description: string;
  previewImage: string;
  demoUrl: string;
  repoFullName: string;
  categories: string[];
  isPremium: boolean;
  isPublished: boolean;
  source: 'base' | 'miordr';
  niche?: string;
  nicheContext?: string;
  pageCount: number;
  sectionCount: number;
  badge?: string;
}

export interface WebsitePage {
  id: string;
  websiteId: string;
  slug: string;
  title: string;
  pageType: string;
  isSystem: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDesc?: string;
  ogImage?: string;
  sortOrder: number;
}

export interface CreatePageWizardInput {
  title: string;
  slug: string;
  pageType?: string;
  templateMode: 'blank' | 'library' | 'ai';
  aiPrompt?: string;
  selectedSectionTypes?: string[];
  seoTitle?: string;
  seoDesc?: string;
  ogImage?: string;
}

export interface UpdatePageSeoInput {
  title?: string;
  slug?: string;
  seoTitle?: string;
  seoDesc?: string;
  ogImage?: string;
  isPublished?: boolean;
}

export interface StoreDnsRecord {
  id: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  isManaged: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DnsInfoResponse {
  subdomain: string;
  customDomain: string | null;
  domainStatus: 'none' | 'pending_ns' | 'active' | 'error';
  sslStatus: 'none' | 'pending' | 'active';
  expectedNameservers: string[];
  records: StoreDnsRecord[];
  lastDeployUrl?: string;
}

export interface DnsRecordInput {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface DnsVerifyResponse {
  verified: boolean;
  domain: string;
  expectedNameservers: string[];
  currentNameservers: string[];
  message: string;
  domainStatus: string;
  sslStatus: string;
}

export interface DedicatedBackendDetails {
  storePlan: string;
  isEligible: boolean;
  backendTier: 'shared' | 'dedicated';
  instanceId: string | null;
  instanceStatus: 'HEALTHY' | 'PROVISIONING' | 'MAINTENANCE' | 'OFFLINE';
  backendUrl: string;
  databaseHost: string;
  region: string;
  resources: {
    cpu: string;
    memory: string;
    maxRps: number;
    autoscaling: string;
  };
  sla: string;
  healthMetrics: {
    uptime: string;
    avgLatency: string;
    p99Latency: string;
    activeConnections: number;
    lastHealthCheck: string;
    status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  };
}

export interface MigrationStep {
  step: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  durationMs: number;
}

export interface MigrationResult {
  success: boolean;
  steps: MigrationStep[];
  completedAt: string;
}

export interface HealthProbeResult {
  timestamp: string;
  instanceId: string | null;
  backendUrl: string;
  httpStatus: number;
  latencyMs: number;
  cpuLoad: string;
  memoryUsed: string;
  healthy: boolean;
  region: string;
  status: string;
}

export interface WebsiteEditLog {
  id: string;
  source: string;
  file: string;
  description: string;
  commitSha?: string;
  aiModel?: string;
  createdAt: string;
}

export interface StoreWebsite {
  id: string;
  storeId: string;
  themeSlug: string;
  themeSource: string;
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  netlifyId?: string;
  netlifyName?: string;
  netlifyDeployUrl?: string;
  customDomain?: string;
  domainStatus: string;
  sslStatus: string;
  subdomain: string;
  lastDeployAt?: string;
  lastDeployStatus: string;
  lastDeployId?: string;
  backendTier: string;
  backendInstanceId?: string;
  backendUrl: string;
  aiEditsUsed: number;
  pages: WebsitePage[];
  dnsRecords: StoreDnsRecord[];
  editHistory: WebsiteEditLog[];
}

export interface AiEditProposal {
  proposalId: string;
  action: 'edit_file' | 'create_file';
  targetFile: string;
  description: string;
  diffSummary: string[];
  modifiedCode: string;
  confidence: number;
  aiModel: string;
  userPrompt: string;
}

export interface StoreWebsiteResponse {
  success: boolean;
  website: StoreWebsite | null;
  store: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    customDomain?: string;
  };
  isPlanGated: boolean;
  plan: string;
}

export const websiteService = {
  /**
   * List all themes (Miordr templates & base themes) with optional filtering
   */
  async getThemes(params?: { category?: string; source?: string; search?: string }): Promise<WebsiteTheme[]> {
    try {
      const response = await apiClient.get<{ success: boolean; themes: WebsiteTheme[] }>('/website/themes', {
        params,
      });
      return response.data?.themes || [];
    } catch (err) {
      console.error('Failed to fetch website themes:', err);
      return [];
    }
  },

  /**
   * Get website status, deployment details, and pages for the active store
   */
  async getStoreWebsite(): Promise<StoreWebsiteResponse> {
    const response = await apiClient.get<StoreWebsiteResponse>('/website');
    return response.data;
  },

  /**
   * Provision and deploy a new website from chosen theme / Miordr template
   */
  async createStoreWebsite(themeSlug: string): Promise<StoreWebsiteResponse> {
    const response = await apiClient.post<{ success: boolean; website: StoreWebsiteResponse }>('/website/create', {
      themeSlug,
    });
    return response.data.website;
  },

  /**
   * Trigger a fresh build & deployment on Netlify
   */
  async triggerDeploy(): Promise<{ success: boolean; lastDeployStatus: string; lastDeployId: string; isSimulated: boolean }> {
    const response = await apiClient.post('/website/deploy');
    return response.data;
  },

  /**
   * Add a custom page to the store's site
   */
  async createPage(data: { slug: string; title: string; pageType?: string; seoTitle?: string; seoDesc?: string }): Promise<WebsitePage> {
    const response = await apiClient.post<{ success: boolean; page: WebsitePage }>('/website/pages', data);
    return response.data.page;
  },

  /**
   * Generate an AI code modification proposal for user review (Gemini Flash / Pro)
   */
  async generateAiEdit(prompt: string, pageSlug: string): Promise<AiEditProposal> {
    const response = await apiClient.post<{ success: boolean; proposal: AiEditProposal }>('/website/ai/prompt', {
      prompt,
      pageSlug,
    });
    return response.data.proposal;
  },

  /**
   * Commit and apply an approved AI proposal to GitHub & trigger Netlify preview build
   */
  async applyAiEdit(proposal: AiEditProposal): Promise<{ success: boolean; commitSha: string; editLog: WebsiteEditLog }> {
    const response = await apiClient.post<{ success: boolean; commitSha: string; editLog: WebsiteEditLog }>('/website/ai/apply', proposal);
    return response.data;
  },

  /**
   * Fetch recent website edit activity and commit audit log
   */
  async getAiHistory(): Promise<WebsiteEditLog[]> {
    const response = await apiClient.get<{ success: boolean; history: WebsiteEditLog[] }>('/website/ai/history');
    return response.data.history || [];
  },

  /**
   * Undo/revert a specific edit log commit
   */
  async revertAiEdit(editLogId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/website/ai/revert', {
      editLogId,
    });
    return response.data;
  },

  /**
   * Fetch active sections configured for a page
   */
  async getSections(pageSlug: string): Promise<{ page: any; sections: SectionBlock[] }> {
    const response = await apiClient.get<{ success: boolean; page: any; sections: SectionBlock[] }>('/website/sections', {
      params: { pageSlug },
    });
    return { page: response.data.page, sections: response.data.sections || [] };
  },

  /**
   * Save visually customized sections, generate TSX, commit to GitHub, and trigger Netlify deploy
   */
  async saveSections(pageSlug: string, sections: SectionBlock[]): Promise<any> {
    const response = await apiClient.put('/website/sections', {
      pageSlug,
      sections,
    });
    return response.data;
  },

  /**
   * Fetch catalog of pre-built available sections that can be inserted
   */
  async getSectionLibrary(): Promise<SectionDefinition[]> {
    const response = await apiClient.get<{ success: boolean; library: SectionDefinition[] }>('/website/sections/library');
    return response.data.library || [];
  },

  /**
   * Phase 4: Fetch DNS configuration, custom domain, and DNS records
   */
  async getDnsInfo(): Promise<DnsInfoResponse> {
    const response = await apiClient.get<{ success: boolean } & DnsInfoResponse>('/website/dns');
    return response.data;
  },

  /**
   * Phase 4: Connect custom domain to store website
   */
  async connectCustomDomain(domain: string): Promise<DnsInfoResponse> {
    const response = await apiClient.post<{ success: boolean } & DnsInfoResponse>('/website/dns/custom-domain', { domain });
    return response.data;
  },

  /**
   * Phase 4: Trigger live nameserver & SSL propagation check
   */
  async verifyDomainDns(simulateSuccess = false): Promise<DnsVerifyResponse> {
    const response = await apiClient.post<{ success: boolean } & DnsVerifyResponse>('/website/dns/verify', { simulateSuccess });
    return response.data;
  },

  /**
   * Phase 4: Remove custom domain and restore default subdomain
   */
  async removeCustomDomain(): Promise<DnsInfoResponse> {
    const response = await apiClient.delete<{ success: boolean } & DnsInfoResponse>('/website/dns/custom-domain');
    return response.data;
  },

  /**
   * Phase 4: Add custom DNS record
   */
  async addDnsRecord(record: DnsRecordInput): Promise<StoreDnsRecord> {
    const response = await apiClient.post<{ success: boolean; record: StoreDnsRecord }>('/website/dns/records', record);
    return response.data.record;
  },

  /**
   * Phase 4: Update custom DNS record
   */
  async updateDnsRecord(recordId: string, data: Partial<DnsRecordInput>): Promise<StoreDnsRecord> {
    const response = await apiClient.put<{ success: boolean; record: StoreDnsRecord }>(`/website/dns/records/${recordId}`, data);
    return response.data.record;
  },

  /**
   * Phase 4: Delete custom DNS record
   */
  async deleteDnsRecord(recordId: string): Promise<{ success: boolean; id: string }> {
    const response = await apiClient.delete<{ success: boolean; id: string }>(`/website/dns/records/${recordId}`);
    return response.data;
  },

  /**
   * Phase 4: 1-Click Email DNS preset (Google Workspace, Microsoft 365, Zoho, iCloud)
   */
  async applyEmailPreset(provider: 'google_workspace' | 'microsoft_365' | 'zoho' | 'icloud'): Promise<DnsInfoResponse> {
    const response = await apiClient.post<{ success: boolean } & DnsInfoResponse>('/website/dns/presets', { provider });
    return response.data;
  },

  /**
   * Phase 5: Create a new page with the multi-option wizard (blank, section library, or AI)
   */
  async createPageWithWizard(input: CreatePageWizardInput): Promise<WebsitePage> {
    const response = await apiClient.post<{ success: boolean; page: WebsitePage }>('/website/pages/wizard', input);
    return response.data.page;
  },

  /**
   * Phase 5: Update page title, slug, SEO tags, and publish status
   */
  async updatePageSeo(pageId: string, input: UpdatePageSeoInput): Promise<WebsitePage> {
    const response = await apiClient.put<{ success: boolean; page: WebsitePage }>(`/website/pages/${pageId}/seo`, input);
    return response.data.page;
  },

  /**
   * Phase 5: Reorder navigation pages
   */
  async reorderPages(orders: { id: string; sortOrder: number }[]): Promise<WebsitePage[]> {
    const response = await apiClient.put<{ success: boolean; pages: WebsitePage[] }>('/website/pages/reorder', { orders });
    return response.data.pages;
  },

  /**
   * Phase 5: Duplicate an existing page
   */
  async duplicatePage(pageId: string): Promise<WebsitePage> {
    const response = await apiClient.post<{ success: boolean; page: WebsitePage }>(`/website/pages/${pageId}/duplicate`);
    return response.data.page;
  },

  /**
   * Phase 5: Delete custom page
   */
  async deletePage(pageId: string): Promise<{ success: boolean; id: string }> {
    const response = await apiClient.delete<{ success: boolean; id: string }>(`/website/pages/${pageId}`);
    return response.data;
  },

  /**
   * Phase 5: Fetch store robots.txt configuration
   */
  async getRobotsTxt(): Promise<{ robotsTxt: string; defaultRobotsTxt: string }> {
    const response = await apiClient.get<{ success: boolean; robotsTxt: string; defaultRobotsTxt: string }>('/website/robots.txt');
    return response.data;
  },

  /**
   * Phase 5: Update store robots.txt rules
   */
  async updateRobotsTxt(content: string): Promise<{ success: boolean; robotsTxt: string }> {
    const response = await apiClient.put<{ success: boolean; robotsTxt: string }>('/website/robots.txt', { content });
    return response.data;
  },

  /**
   * Phase 6: Get dedicated backend infrastructure details, specs, and health metrics
   */
  async getDedicatedBackendDetails(): Promise<DedicatedBackendDetails> {
    const response = await apiClient.get<{ success: boolean } & DedicatedBackendDetails>('/website/backend/details');
    return response.data;
  },

  /**
   * Phase 6: Provision dedicated container instance (VIP / Enterprise)
   */
  async provisionDedicatedInstance(): Promise<DedicatedBackendDetails> {
    const response = await apiClient.post<{ success: boolean } & DedicatedBackendDetails>('/website/backend/provision');
    return response.data;
  },

  /**
   * Phase 6: Run zero-downtime data migration to isolated database container
   */
  async runZeroDowntimeMigration(): Promise<MigrationResult> {
    const response = await apiClient.post<MigrationResult>('/website/backend/migrate');
    return response.data;
  },

  /**
   * Phase 6: Trigger real-time latency & healthcheck probe
   */
  async triggerHealthProbe(): Promise<HealthProbeResult> {
    const response = await apiClient.post<{ success: boolean; probe: HealthProbeResult }>('/website/backend/health-probe');
    return response.data.probe;
  },

  /**
   * Phase 6: Revert store to shared API infrastructure pool
   */
  async revertToSharedBackend(): Promise<DedicatedBackendDetails> {
    const response = await apiClient.post<{ success: boolean } & DedicatedBackendDetails>('/website/backend/revert-shared');
    return response.data;
  },

  /**
   * Base Template & Miordr Overlay (ADR-01..05): List curated business templates
   */
  async listMiordrTemplates(): Promise<WebsiteTheme[]> {
    const response = await apiClient.get<{ success: boolean; templates: WebsiteTheme[] }>('/website/miordr-templates');
    return response.data.templates;
  },

  /**
   * Apply or switch to a Miordr template (preserves custom sections by default)
   */
  async applyMiordrTemplate(templateSlug: string, resetSections: boolean = false): Promise<{ success: boolean; message: string; sectionsPreserved: boolean }> {
    const response = await apiClient.post<{ success: boolean; message: string; sectionsPreserved: boolean }>('/website/apply-template', {
      templateSlug,
      resetSections,
    });
    return response.data;
  },

  /**
   * Check platform patch status for the store's base template
   */
  async getPlatformPatchStatus(): Promise<{
    currentVersion: string;
    latestVersion: string;
    isUpdateAvailable: boolean;
    severity: 'standard' | 'high' | 'critical';
    changelog: string[];
  }> {
    const response = await apiClient.get<{
      success: boolean;
      patch: {
        currentVersion: string;
        latestVersion: string;
        isUpdateAvailable: boolean;
        severity: 'standard' | 'high' | 'critical';
        changelog: string[];
      };
    }>('/website/patch-status');
    return response.data.patch;
  },

  /**
   * Apply an upstream platform patch to sacred layer
   */
  async applyPlatformPatch(targetVersion: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/website/apply-patch', { targetVersion });
    return response.data;
  },

  /**
   * Load sample demo products & collections for the active template
   */
  async loadDemoData(templateSlug: string): Promise<{ success: boolean; createdCount: number; message: string }> {
    const response = await apiClient.post<{ success: boolean; createdCount: number; message: string }>('/website/demo-data', { templateSlug });
    return response.data;
  },

  /**
   * Remove all demo products
   */
  async removeDemoData(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    const response = await apiClient.delete<{ success: boolean; deletedCount: number; message: string }>('/website/demo-data');
    return response.data;
  },
};

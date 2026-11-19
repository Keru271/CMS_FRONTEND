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
  sortOrder: number;
}

export interface StoreDnsRecord {
  id: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  isManaged: boolean;
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
};

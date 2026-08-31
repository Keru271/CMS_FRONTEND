// ─── Tier Permissions & Quota Engine ─────────────────────────────────────────

export type SubscriptionPlanTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'AGENCY' | 'API';

export interface TierConfig {
  id: SubscriptionPlanTier;
  name: string;
  badge: string;
  maxProducts: number;
  maxStaff: number;
  customDomains: boolean;
  developerApi: boolean;
  loyalty: boolean;
  marketingAutomations: boolean;
  reviewModeration: boolean;
  advancedAnalytics: boolean;
  exportAnalytics: boolean;
  transactionFeePercent: number;
}

export const TIER_CONFIGS: Record<SubscriptionPlanTier, TierConfig> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter Tier',
    badge: 'Free Forever',
    maxProducts: 50,
    maxStaff: 2,
    customDomains: false,
    developerApi: false,
    loyalty: false,
    marketingAutomations: false,
    reviewModeration: false,
    advancedAnalytics: false,
    exportAnalytics: false,
    transactionFeePercent: 2.0,
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Growth Pro',
    badge: 'Most Popular',
    maxProducts: 1000,
    maxStaff: 10,
    customDomains: true,
    developerApi: false,
    loyalty: true,
    marketingAutomations: true,
    reviewModeration: true,
    advancedAnalytics: true,
    exportAnalytics: false,
    transactionFeePercent: 0.5,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Scale Enterprise',
    badge: 'Zero Platform Fee',
    maxProducts: 999999,
    maxStaff: 999,
    customDomains: true,
    developerApi: false,
    loyalty: true,
    marketingAutomations: true,
    reviewModeration: true,
    advancedAnalytics: true,
    exportAnalytics: true,
    transactionFeePercent: 0.0,
  },
  AGENCY: {
    id: 'AGENCY',
    name: 'VIP Agency & Enterprise Plus',
    badge: 'Dedicated Cloud & SLA',
    maxProducts: 999999,
    maxStaff: 999,
    customDomains: true,
    developerApi: false,
    loyalty: true,
    marketingAutomations: true,
    reviewModeration: true,
    advancedAnalytics: true,
    exportAnalytics: true,
    transactionFeePercent: 0.0,
  },
  API: {
    id: 'API',
    name: 'API Tier',
    badge: 'Developer Exclusive • 1,000/mo',
    maxProducts: 999999,
    maxStaff: 999,
    customDomains: true,
    developerApi: true,
    loyalty: true,
    marketingAutomations: true,
    reviewModeration: true,
    advancedAnalytics: true,
    exportAnalytics: true,
    transactionFeePercent: 0.0,
  },
};

export function normalizeTier(plan?: string | null): SubscriptionPlanTier {
  if (!plan) return 'STARTER';
  const upper = plan.toUpperCase();
  if (upper === 'API') return 'API';
  if (upper === 'AGENCY' || upper.includes('VIP') || upper.includes('PLUS')) return 'AGENCY';
  if (upper === 'ENTERPRISE' || upper.includes('SCALE')) return 'ENTERPRISE';
  if (upper === 'GROWTH' || upper.includes('PRO')) return 'GROWTH';
  return 'STARTER';
}

export function getTierConfig(plan?: string | null): TierConfig {
  const normalized = normalizeTier(plan);
  return TIER_CONFIGS[normalized] || TIER_CONFIGS.STARTER;
}

export function canUseCustomDomains(plan?: string | null): boolean {
  return getTierConfig(plan).customDomains;
}

export function canUseDeveloperApi(plan?: string | null): boolean {
  return normalizeTier(plan) === 'API';
}

export function canUseLoyalty(plan?: string | null): boolean {
  return getTierConfig(plan).loyalty;
}

export function canUseMarketingAutomations(plan?: string | null): boolean {
  return getTierConfig(plan).marketingAutomations;
}

export function canUseReviewModeration(plan?: string | null): boolean {
  return getTierConfig(plan).reviewModeration;
}

export function canExportAnalytics(plan?: string | null): boolean {
  return getTierConfig(plan).exportAnalytics;
}

export function getMaxProducts(plan?: string | null): number {
  return getTierConfig(plan).maxProducts;
}

export function getMaxStaff(plan?: string | null): number {
  return getTierConfig(plan).maxStaff;
}

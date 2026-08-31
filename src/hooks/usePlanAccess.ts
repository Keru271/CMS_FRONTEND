'use client';

import { useState, useEffect } from 'react';
import { cmsService } from '@/src/services/cmsService';
import { StoreSubscriptionData } from '@/src/types';

export interface PlanAccess {
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'AGENCY' | 'API';
  planName: string;
  isStarter: boolean;
  isGrowth: boolean;
  isEnterprise: boolean;
  isAgency: boolean;
  isApi: boolean;
  hasApiTier: boolean;
  canUseCustomDomain: boolean;
  canUseDeveloperApi: boolean;
  canUseWebhooks: boolean;
  canUseLoyalty: boolean;
  canUseAdvancedAnalytics: boolean;
  maxProducts: number;
  maxStaff: number;
  isLoading: boolean;
}

export function usePlanAccess(): PlanAccess {
  const [subscription, setSubscription] = useState<StoreSubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSub() {
      try {
        const data = await cmsService.getStoreSubscription();
        setSubscription(data);
      } catch (err) {
        console.warn('Plan access check notice, default to STARTER:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSub();
  }, []);

  const rawPlan = (subscription?.plan || 'STARTER').toUpperCase();
  const plan = (rawPlan === 'API'
    ? 'API'
    : rawPlan === 'AGENCY' || rawPlan.includes('VIP')
    ? 'AGENCY'
    : rawPlan === 'ENTERPRISE' || rawPlan.includes('SCALE')
    ? 'ENTERPRISE'
    : rawPlan === 'GROWTH' || rawPlan.includes('PRO')
    ? 'GROWTH'
    : 'STARTER') as 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'AGENCY' | 'API';

  const isStarter = plan === 'STARTER';
  const isGrowth = plan === 'GROWTH';
  const isEnterprise = plan === 'ENTERPRISE';
  const isAgency = plan === 'AGENCY';
  const isApi = plan === 'API';

  // API Tier is an independent add-on for the API purpose only.
  // Can be active while store remains on STARTER/Basic or GROWTH.
  const hasApiTier =
    subscription?.apiPlanActive === true ||
    subscription?.apiPlanStatus === 'ACTIVE' ||
    subscription?.apiTier?.active === true ||
    isApi;

  return {
    plan,
    planName:
      plan === 'API'
        ? 'API Tier (Developer)'
        : plan === 'AGENCY'
        ? 'VIP Agency & Enterprise Plus'
        : plan === 'ENTERPRISE'
        ? 'Scale Enterprise'
        : plan === 'GROWTH'
        ? 'Growth Pro'
        : 'Starter Tier',
    isStarter,
    isGrowth,
    isEnterprise,
    isAgency,
    isApi,
    hasApiTier,
    canUseCustomDomain: isGrowth || isEnterprise || isAgency || isApi,
    canUseDeveloperApi: hasApiTier,
    canUseWebhooks: hasApiTier,
    canUseLoyalty: isGrowth || isEnterprise || isAgency || isApi,
    canUseAdvancedAnalytics: isGrowth || isEnterprise || isAgency || isApi,
    maxProducts: isAgency || isEnterprise || isApi ? 999999 : isGrowth ? 1000 : 50,
    maxStaff: isAgency || isEnterprise || isApi ? 999 : isGrowth ? 10 : 2,
    isLoading,
  };
}

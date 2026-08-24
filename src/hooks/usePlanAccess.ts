'use client';

import { useState, useEffect } from 'react';
import { cmsService } from '@/src/services/cmsService';
import { StoreSubscriptionData } from '@/src/types';

export interface PlanAccess {
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  planName: string;
  isStarter: boolean;
  isGrowth: boolean;
  isEnterprise: boolean;
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

  const plan = (subscription?.plan || 'STARTER').toUpperCase() as 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  const isStarter = plan === 'STARTER';
  const isGrowth = plan === 'GROWTH';
  const isEnterprise = plan === 'ENTERPRISE';

  return {
    plan,
    planName: plan === 'ENTERPRISE' ? 'Scale Enterprise' : plan === 'GROWTH' ? 'Growth Pro' : 'Starter Free Tier',
    isStarter,
    isGrowth,
    isEnterprise,
    canUseCustomDomain: isGrowth || isEnterprise,
    canUseDeveloperApi: isEnterprise,
    canUseWebhooks: isGrowth || isEnterprise,
    canUseLoyalty: isGrowth || isEnterprise,
    canUseAdvancedAnalytics: isGrowth || isEnterprise,
    maxProducts: isEnterprise ? 999999 : isGrowth ? 1000 : 10,
    maxStaff: isEnterprise ? 999 : isGrowth ? 10 : 2,
    isLoading,
  };
}

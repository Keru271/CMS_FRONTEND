'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantOnboardingWizard } from '@/src/components/onboarding/MerchantOnboardingWizard';
import { cmsService, STORE_TEMPLATES } from '@/src/services/cmsService';
import { MerchantUser, MerchantOnboardingData } from '@/src/types';

export default function MerchantDetailsPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantUser | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const backendUser = await cmsService.getCurrentUser();
        const nameParts = (backendUser.name || 'Merchant Owner').split(' ');
        const firstName = nameParts[0] || 'Merchant';
        const lastName = nameParts.slice(1).join(' ') || 'Owner';

        const user: MerchantUser = {
          firstName,
          lastName,
          mobileNumber: '+1 555-0199',
          email: backendUser.email,
        };

        setMerchant(user);

        // If user already has stores created in backend DB, save session and go to dashboard
        if (backendUser.stores && backendUser.stores.length > 0) {
          const store = backendUser.stores[0];
          cmsService.saveMerchantSession({
            merchant: user,
            store: {
              storeName: store.name,
              tagline: 'Official Store',
              category: 'Tech & Electronics',
              currency: store.currency || 'USD',
              supportEmail: user.email,
              supportPhone: user.mobileNumber,
            },
            selectedTemplate: STORE_TEMPLATES[0],
          });
          router.push('/');
        }
      } catch {
        const session = cmsService.getMerchantSession();
        if (session && session.merchant) {
          setMerchant(session.merchant);
        } else {
          setMerchant({
            firstName: 'Merchant',
            lastName: 'Owner',
            mobileNumber: '+1 555-0199',
            email: 'merchant@store.com',
          });
        }
      }
    };

    loadProfile();
  }, [router]);

  const handleComplete = (data: MerchantOnboardingData) => {
    cmsService.saveMerchantSession(data);
    router.push('/');
  };

  const handleLogout = () => {
    cmsService.clearMerchantSession();
    router.push('/login');
  };

  if (!merchant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MerchantOnboardingWizard
      merchant={merchant}
      onComplete={handleComplete}
      onLogout={handleLogout}
    />
  );
}

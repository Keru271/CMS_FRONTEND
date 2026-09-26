'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';
import { cmsService } from '@/src/services/cmsService';
import { MerchantUser } from '@/src/types';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  useEffect(() => {
    if (emailParam) {
      setUnverifiedEmail(emailParam);
    }
  }, [emailParam]);

  const handleVerificationSuccess = async (merchant: MerchantUser) => {
    const activeEmail = unverifiedEmail || merchant.email;
    const storeId = merchant.storeId || cmsService.getActiveStoreId() || undefined;

    if (storeId) {
      cmsService.setActiveStoreId(storeId);
    }

    // auth_token is stored by verifyMerchantEmail in cmsService
    // Save merchant session in-memory
    cmsService.saveMerchantSession({
      merchant: { ...merchant, email: activeEmail, storeId },
      store: storeId
        ? {
            id: storeId,
            slug: activeEmail.split('@')[0],
            storeName: `${merchant.firstName || 'My'}'s Store`,
            tagline: 'My online store',
            category: 'General',
            currency: 'INR',
            status: 'ACTIVE',
          }
        : undefined,
    });

    // After verification → go to onboarding wizard
    router.push('/onboarding');
  };

  if (!unverifiedEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MerchantAuthModal
      initialMode="verify"
      emailForVerification={unverifiedEmail}
      onSuccess={handleVerificationSuccess}
    />
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

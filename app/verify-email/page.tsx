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
    const pendingEmail = sessionStorage.getItem('cms_pending_verification_email');
    if (emailParam) {
      setUnverifiedEmail(emailParam);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_pending_verification_email', emailParam);
      }
    } else if (pendingEmail) {
      setUnverifiedEmail(pendingEmail);
    }
  }, [emailParam]);

  const handleVerificationSuccess = async (merchant: MerchantUser) => {
    const activeEmail = unverifiedEmail || merchant.email;
    const storeId =
      merchant.storeId ||
      (typeof window !== 'undefined' ? localStorage.getItem('selected_store_id') : null) ||
      undefined;

    // auth_token is stored by verifyMerchantEmail in cmsService
    // Save merchant session
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

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cms_pending_verification_email');
      sessionStorage.setItem('just_registered', 'true');
      sessionStorage.setItem('open_whatsapp_setup_once', 'true');
      if (storeId) {
        localStorage.setItem('selected_store_id', storeId);
        localStorage.setItem('current_store_id', storeId);
      }
    }

    // After verification → go to store setup (WhatsApp flow)
    router.push('/store-setup?first_time=true');
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

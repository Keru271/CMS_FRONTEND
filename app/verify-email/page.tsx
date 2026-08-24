'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';
import { cmsService, STORE_TEMPLATES } from '@/src/services/cmsService';
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
    } else {
      setUnverifiedEmail('adhithya@gmail.com');
    }
  }, [emailParam]);

  const handleVerificationSuccess = (merchant: MerchantUser) => {
    const activeEmail = unverifiedEmail || merchant.email;
    // Save user session state
    cmsService.saveMerchantSession({
      merchant: { ...merchant, email: activeEmail },
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('just_registered', 'true');
      sessionStorage.removeItem('cms_pending_verification_email');
    }
    router.push('/login?registered=true');
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

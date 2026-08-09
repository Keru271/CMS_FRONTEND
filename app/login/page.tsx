'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';
import { cmsService } from '@/src/services/cmsService';
import { MerchantUser } from '@/src/types';

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = (user: MerchantUser, mode: 'register' | 'login' | 'verify') => {
    if (mode === 'verify') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_pending_verification_email', user.email);
      }
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    const existingSession = cmsService.getMerchantSession();

    if (mode === 'login' && existingSession && existingSession.store) {
      const updatedSession = { ...existingSession, merchant: user };
      cmsService.saveMerchantSession(updatedSession);
      router.push('/');
    } else {
      router.push('/merchant-details');
    }
  };

  return <MerchantAuthModal onSuccess={handleAuthSuccess} initialMode="signin" />;
}
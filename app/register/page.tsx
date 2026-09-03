'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';
import { MerchantUser } from '@/src/types';

export default function RegisterPage() {
  const router = useRouter();

  const handleAuthSuccess = (user: MerchantUser, mode?: 'register' | 'login' | 'verify') => {
    // After successful registration, always go to email verification step
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cms_pending_verification_email', user.email);
    }
    router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
  };

  return <MerchantAuthModal onSuccess={handleAuthSuccess} initialMode="signup" />;
}

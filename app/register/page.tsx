'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';
import { MerchantUser } from '@/src/types';

export default function RegisterPage() {
  const router = useRouter();

  const handleAuthSuccess = (
    user: MerchantUser,
    mode: 'register' | 'login' | 'verify' = 'register',
  ) => {
    if (mode === 'verify') {
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    if (mode === 'register') {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  return <MerchantAuthModal onSuccess={handleAuthSuccess} initialMode="signup" />;
}

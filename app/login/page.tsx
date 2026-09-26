'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';
import { cmsService } from '@/src/services/cmsService';
import { MerchantUser } from '@/src/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisteredParam = searchParams.get('registered') === 'true';

  const handleAuthSuccess = (user: MerchantUser, mode: 'register' | 'login' | 'verify') => {
    if (mode === 'verify') {
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    const existingSession = cmsService.getMerchantSession();
    const updatedSession = {
      ...(existingSession || {}),
      merchant: user,
    };
    cmsService.saveMerchantSession(updatedSession as any);

    if (isRegisteredParam && !user.onboardingCompleted) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  return <MerchantAuthModal onSuccess={handleAuthSuccess} initialMode="signin" />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fdf1ef] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_pending_verification_email', user.email);
      }
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    const existingSession = cmsService.getMerchantSession();
    const updatedSession = {
      ...(existingSession || {}),
      merchant: user,
    };
    cmsService.saveMerchantSession(updatedSession as any);

    const userKey = (user.email || 'user').toLowerCase().trim();
    const alreadyOpened =
      typeof window !== 'undefined' &&
      (localStorage.getItem(`whatsapp_setup_opened_${userKey}`) === 'true' ||
        localStorage.getItem(`whatsapp_setup_completed_${userKey}`) === 'true' ||
        localStorage.getItem('whatsapp_setup_completed') === 'true');

    const isJustRegistered =
      !alreadyOpened &&
      (isRegisteredParam || (typeof window !== 'undefined' && sessionStorage.getItem('just_registered') === 'true'));

    if (isJustRegistered) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('just_registered');
        sessionStorage.setItem('open_whatsapp_setup_once', 'true');
        // Mark that WhatsApp setup chat has been opened for this user so it NEVER opens again!
        localStorage.setItem(`whatsapp_setup_opened_${userKey}`, 'true');
        localStorage.setItem('whatsapp_setup_opened', 'true');
      }
      // Route newly registered merchants straight into the WhatsApp Store Setup Webchat (first time only)
      router.push('/store-setup?first_time=true');
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('just_registered');
        sessionStorage.removeItem('open_whatsapp_setup_once');
      }
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
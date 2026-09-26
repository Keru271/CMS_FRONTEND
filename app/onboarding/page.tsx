'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { CMSProvider } from '@/src/context/CMSContext';
import { OnboardingWizard } from '@/src/components/onboarding/OnboardingWizard';
import { cmsService } from '@/src/services/cmsService';

function OnboardingGuard() {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkDbOnboardingStatus() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
          router.replace('/login');
          return;
        }

        // Fetch user from Database to verify if onboarding process was already completed
        const dbUser = await cmsService.getCurrentUser();
        
        if (dbUser && dbUser.onboardingCompleted === true) {
          router.replace('/dashboard');
          return;
        }

        if (isMounted) {
          setCanAccess(true);
        }
      } catch (err) {
        console.error('Failed to check onboarding status from DB:', err);
        if (isMounted) {
          setCanAccess(true);
        }
      }
    }

    checkDbOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (canAccess === null) {
    return (
      <div className="min-h-screen bg-[#fdf1ef] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
            Checking Setup Status from Database...
          </span>
        </div>
      </div>
    );
  }

  return <OnboardingWizard />;
}

export default function OnboardingPage() {
  return (
    <CMSProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#fdf1ef] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
                Initializing Store Setup Wizard...
              </span>
            </div>
          </div>
        }
      >
        <OnboardingGuard />
      </Suspense>
    </CMSProvider>
  );
}

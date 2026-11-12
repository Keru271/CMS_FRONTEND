'use client';

import React, { Suspense } from 'react';
import { ForgotPasswordFlow } from '@/src/components/auth/ForgotPasswordFlow';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-[#121212]">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-slate-900 dark:border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Loading password recovery...</p>
          </div>
        </div>
      }
    >
      <ForgotPasswordFlow />
    </Suspense>
  );
}

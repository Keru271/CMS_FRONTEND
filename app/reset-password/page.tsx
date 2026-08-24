'use client';

import React, { Suspense } from 'react';
import { ForgotPasswordFlow } from '@/src/components/auth/ForgotPasswordFlow';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-sage-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-sage-muted font-bold">Loading reset password...</p>
          </div>
        </div>
      }
    >
      <ForgotPasswordFlow />
    </Suspense>
  );
}

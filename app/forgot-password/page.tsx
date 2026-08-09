'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MerchantAuthModal } from '@/src/components/auth/MerchantAuthModal';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/login');
  };

  return <MerchantAuthModal onSuccess={handleAuthSuccess} initialMode="forgot" />;
}

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [authStatus, setAuthStatus] = useState<{
    loaded: boolean;
    hasToken: boolean;
  }>({
    loaded: false,
    hasToken: false,
  });

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname?.startsWith(`${route}?`)
    );

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const hasToken = !!token;

    setAuthStatus({ loaded: true, hasToken });

    if (hasToken && isPublic) {
      router.replace('/');
    } else if (!hasToken && !isPublic) {
      router.replace('/login');
    }
  }, [pathname, router]);

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}?`)
  );

  // Before client-side useEffect runs:
  if (!authStatus.loaded) {
    if (isPublic) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-sage-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-sage-muted animate-pulse">
          Verifying Authentication...
        </span>
      </div>
    );
  }

  // 1. Authenticated user visiting public auth routes (/login, /register, /verify-email)
  if (isPublic && authStatus.hasToken) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-sage-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-sage-muted">
          Already logged in. Redirecting to Dashboard...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated user visiting public auth routes -> Render Auth page
  if (isPublic && !authStatus.hasToken) {
    return <>{children}</>;
  }

  // 3. Unauthenticated user visiting protected routes -> Redirecting to Login
  if (!isPublic && !authStatus.hasToken) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-sage-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-sage-muted animate-pulse">
          Redirecting to Login...
        </span>
      </div>
    );
  }

  // 4. Authenticated user visiting protected routes -> Render children
  return <>{children}</>;
};

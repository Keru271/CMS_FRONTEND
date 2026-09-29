'use client';

import React from 'react';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { ThemeProvider } from '@/src/context/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}

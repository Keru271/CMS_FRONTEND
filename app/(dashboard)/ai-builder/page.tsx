'use client';

import React from 'react';
import { AiWebsiteBuilderStudio } from '@/src/components/cms/AiWebsiteBuilderStudio';

export default function AiWebsiteBuilderPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#121212] p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto">
        <AiWebsiteBuilderStudio isFullscreenStandalone={false} />
      </div>
    </div>
  );
}

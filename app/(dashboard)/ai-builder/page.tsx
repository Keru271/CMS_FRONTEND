'use client';

import React from 'react';
import { AiWebsiteBuilderStudio } from '@/src/components/cms/AiWebsiteBuilderStudio';

export default function AiWebsiteBuilderPage() {
  return (
    <div className="w-full h-full min-h-screen overflow-hidden">
      <AiWebsiteBuilderStudio isFullscreenStandalone={true} />
    </div>
  );
}

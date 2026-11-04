'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmailTemplateBuilderStudio } from '@/src/components/cms/EmailTemplateBuilderStudio';

function EmailTemplateBuilderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || searchParams.get('templateId') || undefined;
  const category = searchParams.get('category') || undefined;
  const isNew = searchParams.get('mode') === 'new';
  const isAi = searchParams.get('ai') === 'true' || searchParams.get('ai') === '1';

  return (
    <EmailTemplateBuilderStudio
      initialTemplateId={isNew ? '' : id}
      initialCategory={category}
      initialAiOpen={isAi}
    />
  );
}

export default function EmailTemplateBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#121212]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
              Loading Email Template Studio...
            </span>
          </div>
        </div>
      }
    >
      <EmailTemplateBuilderContent />
    </Suspense>
  );
}

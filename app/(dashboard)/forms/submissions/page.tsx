'use client';

import React from 'react';
import { FormSubmissionsStudio } from '@/src/components/cms/FormSubmissionsStudio';
import { useRouter } from 'next/navigation';

export default function AllSubmissionsPage() {
  const router = useRouter();
  return <FormSubmissionsStudio onBackToForms={() => router.push('/forms')} />;
}

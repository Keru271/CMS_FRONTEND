'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormBuilderStudio } from '@/src/components/cms/FormBuilderStudio';

export default function FormBuilderEditPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  return <FormBuilderStudio formId={formId} onBack={() => router.push('/forms')} />;
}

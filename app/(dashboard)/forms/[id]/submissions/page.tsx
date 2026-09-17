'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormSubmissionsStudio } from '@/src/components/cms/FormSubmissionsStudio';

export default function FormSpecificSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  return (
    <FormSubmissionsStudio
      initialFormId={formId}
      onBackToForms={() => router.push(`/forms/${formId}`)}
    />
  );
}

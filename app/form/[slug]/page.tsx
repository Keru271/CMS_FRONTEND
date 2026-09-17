'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CMSForm } from '@/src/types';
import { cmsService } from '@/src/services/cmsService';
import { PublicFormRenderer } from '@/src/components/cms/PublicFormRenderer';
import { Loader2, FileQuestion, Store } from 'lucide-react';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [form, setForm] = useState<CMSForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchForm = async () => {
      setLoading(true);
      try {
        const data = await cmsService.getForm(slug);
        if (!data) {
          setError('Form not found or has been closed.');
        } else {
          setForm(data);
        }
      } catch (err: any) {
        setError('Failed to load form. Please check the URL.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Form Unavailable</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          {error || 'The requested form does not exist or is no longer accepting responses.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <PublicFormRenderer form={form} />
        <div className="text-center text-xs text-slate-400">
          Powered by OmniStore Forms Platform
        </div>
      </div>
    </div>
  );
}

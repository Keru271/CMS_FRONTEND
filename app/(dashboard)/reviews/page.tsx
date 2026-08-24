import React from 'react';
import { Metadata } from 'next';
import { ReviewStudio } from '@/src/components/cms/ReviewStudio';

export const metadata: Metadata = {
  title: 'Product Reviews & Customer Feedback | Store Studio',
  description: 'Manage, moderate, edit, and reply to customer product reviews and ratings across your store.',
};

export default function ReviewsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <ReviewStudio />
    </div>
  );
}

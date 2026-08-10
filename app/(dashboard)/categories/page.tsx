'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { CategoryManager } from '@/src/components/cms/CategoryManager';

export default function CategoriesPage() {
  const { categories, handleCreateCategory } = useCMSContext();

  return (
    <CategoryManager
      categories={categories}
      onCreateCategory={handleCreateCategory}
    />
  );
}

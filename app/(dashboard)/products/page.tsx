'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { ProductStudio } from '@/src/components/cms/ProductStudio';
import { ProductTable } from '@/src/components/cms/ProductTable';

export default function ProductsPage() {
  const {
    products,
    categories,
    openAddProductModal,
    openEditProductModal,
    handleDeleteProduct,
  } = useCMSContext();

  const categoryNames = categories.map((c) => c.name);

  return (
    <div className="space-y-6">
      <ProductStudio />
      <ProductTable
        products={products}
        categories={categoryNames}
        onAddProduct={openAddProductModal}
        onEditProduct={openEditProductModal}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}

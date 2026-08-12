'use client';

import React, { useEffect, useState } from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { cmsService } from '@/src/services/cmsService';
import { ProductStudio } from '@/src/components/cms/ProductStudio';
import { ProductTable } from '@/src/components/cms/ProductTable';

export default function ProductsPage() {
  const {
    products,
    setProducts,
    categories,
    setCategories,
    openAddProductModal,
    openEditProductModal,
  } = useCMSContext();
  const [loading, setLoading] = useState(true);

  const loadProductsData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        cmsService.getProducts(),
        cmsService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductsData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product from the CMS catalog?')) {
      await cmsService.deleteProduct(id);
      await loadProductsData();
    }
  };

  const categoryNames = categories.map((c) => c.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
            Loading Catalog Products...
          </span>
        </div>
      </div>
    );
  }

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

'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { Sidebar } from '@/src/components/cms/Sidebar';
import { AdminHeader } from '@/src/components/cms/AdminHeader';
import { ProductFormModal } from '@/src/components/cms/ProductFormModal';
import { cmsService } from '@/src/services/cmsService';
import { ProductFormData } from '@/src/types';

export const CMSDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    merchantData,
    products,
    setProducts,
    categories,
    orders,
    isLoading,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    setEditingProduct,
    openAddProductModal,
    handleLogout,
  } = useCMSContext();

  const categoryNames = categories.map((c) => c.name);

  const handleCreateOrUpdateProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      await cmsService.updateProduct(editingProduct.id, formData);
    } else {
      await cmsService.createProduct(formData);
    }
    const updatedProducts = await cmsService.getProducts();
    setProducts(updatedProducts);
  };

  return (
    <div className="min-h-screen flex bg-[#fdf1ef] text-[#191a1b] font-sans selection:bg-[#191a1b] selection:text-[#d4ff4c]">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        productsCount={products.length}
        ordersCount={orders.length}
        merchantData={merchantData}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <AdminHeader
          merchantData={merchantData}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onAddProduct={openAddProductModal}
        />

        {/* Dynamic Section Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
                  Loading CMS Studio...
                </span>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Product Form Modal (Shared across views) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdateProduct}
        initialProduct={editingProduct}
        categories={categoryNames}
      />
    </div>
  );
};

'use client';

import React from 'react';
import { useCMSContext } from '@/src/context/CMSContext';
import { Sidebar } from '@/src/components/cms/Sidebar';
import { AdminHeader } from '@/src/components/cms/AdminHeader';
import { ProductFormModal } from '@/src/components/cms/ProductFormModal';

export const CMSDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    merchantData,
    products,
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
    handleCreateOrUpdateProduct,
    handleLogout,
  } = useCMSContext();

  const categoryNames = categories.map((c) => c.name);

  return (
    <div className="min-h-screen flex bg-[#eef0f3] dark:bg-background text-slate-800 dark:text-foreground selection:bg-slate-900 selection:text-white">
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
        <main className="flex-1 p-3 sm:p-5 md:p-6 w-full space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-28">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-extrabold text-slate-500 animate-pulse">
                  Loading CMS View...
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

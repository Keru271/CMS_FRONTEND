'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { Sidebar } from '@/src/components/cms/Sidebar';
import { AdminHeader } from '@/src/components/cms/AdminHeader';
import { ProductFormModal } from '@/src/components/cms/ProductFormModal';
import { StoreSuspendedModal } from '@/src/components/cms/StoreSuspendedModal';
import { CreateStoreModal } from '@/src/components/cms/CreateStoreModal';
import { CMSChatbot } from '@/src/components/cms/CMSChatbot';
import { cmsService } from '@/src/services/cmsService';
import { ProductFormData } from '@/src/types';
import { Lock, ShieldAlert, ArrowLeft, Home, Package } from 'lucide-react';

export const CMSDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    merchantData,
    products,
    setProducts,
    categories,
    orders,
    isLoading,
    isSuspended,
    storeStatus,
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

  // Determine active user role and permissions
  const userRole = (
    merchantData?.merchant?.role ||
    (typeof window !== 'undefined' ? localStorage.getItem('user_role') : null) ||
    'OWNER'
  ).toUpperCase();

  const userPermissions =
    merchantData?.merchant?.permissions ||
    (typeof window !== 'undefined' && localStorage.getItem('user_permissions')
      ? JSON.parse(localStorage.getItem('user_permissions') || '{}')
      : null);

  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MERCHANT';

  // Check if current path is authorized
  const checkRouteAuthorization = (path: string): boolean => {
    // True Owner & Store Admin have universal access
    if (isOwnerOrAdmin) return true;

    // Pages open to any authenticated team member:
    if (path === '/dashboard' || path === '/' || path.startsWith('/docs') || path.startsWith('/settings')) {
      return true;
    }

    // High-privilege owner/admin only routes:
    if (
      path.startsWith('/team') ||
      path.startsWith('/billing') ||
      path.startsWith('/domains') ||
      path.startsWith('/developer')
    ) {
      return false;
    }

    // Role-specific shortcut allowances:
    if (userRole === 'STOCK_CHECKER') {
      return path.startsWith('/products') || path.startsWith('/categories');
    }

    if (userRole === 'FULFILLMENT') {
      return path.startsWith('/orders') || path.startsWith('/shipping');
    }

    if (userRole === 'SUPPORT') {
      return path.startsWith('/customers') || path.startsWith('/orders') || path.startsWith('/reviews');
    }

    if (userRole === 'EDITOR') {
      return (
        path.startsWith('/themes') ||
        path.startsWith('/pages') ||
        path.startsWith('/blog') ||
        path.startsWith('/navigation') ||
        path.startsWith('/seo')
      );
    }

    if (userRole === 'MANAGER') {
      return (
        path.startsWith('/products') ||
        path.startsWith('/categories') ||
        path.startsWith('/orders') ||
        path.startsWith('/customers') ||
        path.startsWith('/reviews') ||
        path.startsWith('/discounts') ||
        path.startsWith('/shipping') ||
        path.startsWith('/marketing') ||
        path.startsWith('/seo') ||
        path.startsWith('/blog')
      );
    }

    // Granular permission checks:
    if (userPermissions) {
      if (path.startsWith('/products')) return !!userPermissions.canManageProducts;
      if (path.startsWith('/categories')) return !!userPermissions.canManageProducts || !!userPermissions.canManageInventory;
      if (path.startsWith('/orders')) return !!userPermissions.canManageOrders;
      if (path.startsWith('/customers')) return !!userPermissions.canManageCustomers;
      if (path.startsWith('/reviews')) return !!userPermissions.canManageCustomers || !!userPermissions.canManageProducts;
      if (
        path.startsWith('/themes') ||
        path.startsWith('/pages') ||
        path.startsWith('/blog') ||
        path.startsWith('/navigation')
      ) {
        return !!userPermissions.canManageThemes;
      }
      if (path.startsWith('/seo')) return !!userPermissions.canManageThemes || !!userPermissions.canManageSettings;
      if (path.startsWith('/shipping')) return !!userPermissions.canManageLogistics;
      if (path.startsWith('/discounts') || path.startsWith('/marketing')) {
        return !!userPermissions.canManageAnalytics || !!userPermissions.canManageProducts;
      }
      if (path.startsWith('/store-setup')) return !!userPermissions.canManageSettings;
      if (path.startsWith('/tax') || path.startsWith('/payments') || path.startsWith('/payment')) return !!userPermissions.canManagePayments;
      if (path.startsWith('/loyalty')) return !!userPermissions.canManageCustomers;
    }

    return false;
  };

  const isAuthorized = checkRouteAuthorization(pathname);

  // Determine fallback redirect target for this role
  const getDefaultAllowedPath = () => {
    if (userRole === 'STOCK_CHECKER') return '/products';
    if (userRole === 'FULFILLMENT') return '/orders';
    if (userRole === 'SUPPORT') return '/customers';
    if (userRole === 'EDITOR') return '/themes';
    return '/dashboard';
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
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-4 sm:space-y-6 pb-safe">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#191a1b] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-[#5e5a5a] tracking-wide animate-pulse">
                  Loading CMS Studio...
                </span>
              </div>
            </div>
          ) : isSuspended ? (
            /* STORE SUSPENDED CONTENT BARRIER */
            <div className="min-h-[500px] flex items-center justify-center p-6">
              <div className="max-w-lg w-full p-8 rounded-3xl bg-rose-950/20 border-2 border-rose-600/50 shadow-2xl text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Store Operations Blocked
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This store is currently suspended by Master Administration. Review the suspension notice modal.
                </p>
              </div>
            </div>
          ) : !isAuthorized ? (
            /* ACCESS RESTRICTED SCREEN FOR UNAUTHORIZED ROLES */
            <div className="min-h-[500px] flex items-center justify-center p-6">
              <div className="max-w-lg w-full p-8 rounded-3xl bg-white dark:bg-card border border-rose-200 dark:border-rose-900/50 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-600/20">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    Access Restricted
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-foreground">
                    Section Not Permitted
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Your assigned staff role (<strong className="text-rose-600">{userRole.replace('_', ' ')}</strong>) does not have authorization to access <strong>{pathname}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-accent/40 border border-slate-200 dark:border-border text-xs text-slate-500 space-y-1 text-left">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">Need access to this module?</span>
                  <p className="text-[11px]">
                    Please request a permission upgrade or role adjustment from your primary Store Administrator.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(getDefaultAllowedPath())}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Authorized Workspace</span>
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Store Suspended Full Blocking Modal */}
      {isSuspended && <StoreSuspendedModal />}

      {/* Product Form Modal (Shared across views) */}
      <ProductFormModal
        isOpen={isProductModalOpen && !isSuspended}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdateProduct}
        initialProduct={editingProduct}
        categories={categoryNames}
      />

      {/* Floating AI Store Copilot Chatbot */}
      {!isSuspended && <CMSChatbot />}

      {/* Multi-Store Portfolio Creation Modal */}
      <CreateStoreModal />
    </div>
  );
};

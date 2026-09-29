'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCMSContext } from '@/src/context/CMSContext';
import { Sidebar } from '@/src/components/cms/Sidebar';
import { AdminHeader } from '@/src/components/cms/AdminHeader';
import { ProductFormModal } from '@/src/components/cms/ProductFormModal';
import { StoreSuspendedModal } from '@/src/components/cms/StoreSuspendedModal';
import { CreateStoreModal } from '@/src/components/cms/CreateStoreModal';
import { CMSChatbot } from '@/src/components/cms/CMSChatbot';
import { SpotlightSearchModal } from '@/src/components/cms/SpotlightSearchModal';
import { cmsService } from '@/src/services/cmsService';
import { ProductFormData } from '@/src/types';
import {
  Lock,
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Menu,
} from 'lucide-react';

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

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Global Keyboard shortcut listener for Apple Spotlight (Ctrl+F / Cmd+F or Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F' || e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleCreateOrUpdateProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      await cmsService.updateProduct(editingProduct.id, formData);
    } else {
      await cmsService.createProduct(formData);
    }
    const updatedProducts = await cmsService.getProducts();
    setProducts(updatedProducts);
  };

  const userRole = (merchantData?.merchant?.role || 'OWNER').toUpperCase();
  const userPermissions = merchantData?.merchant?.permissions || null;
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MERCHANT';

  const checkRouteAuthorization = (path: string): boolean => {
    if (isOwnerOrAdmin) return true;

    if (
      path === '/dashboard' ||
      path === '/' ||
      path.startsWith('/docs') ||
      path.startsWith('/settings')
    ) {
      return true;
    }

    if (
      path.startsWith('/team') ||
      path.startsWith('/billing') ||
      path.startsWith('/domains') ||
      path.startsWith('/developer')
    ) {
      return false;
    }

    if (userRole === 'STOCK_CHECKER') {
      return path.startsWith('/products') || path.startsWith('/3d') || path.startsWith('/categories');
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
        path.startsWith('/3d') ||
        path.startsWith('/pages') ||
        path.startsWith('/forms') ||
        path.startsWith('/blog') ||
        path.startsWith('/navigation') ||
        path.startsWith('/seo')
      );
    }

    if (userRole === 'MANAGER') {
      return (
        path.startsWith('/products') ||
        path.startsWith('/3d') ||
        path.startsWith('/categories') ||
        path.startsWith('/orders') ||
        path.startsWith('/customers') ||
        path.startsWith('/reviews') ||
        path.startsWith('/discounts') ||
        path.startsWith('/shipping') ||
        path.startsWith('/marketing') ||
        path.startsWith('/seo') ||
        path.startsWith('/forms') ||
        path.startsWith('/blog')
      );
    }

    if (userPermissions) {
      if (path.startsWith('/products')) return !!userPermissions.canManageProducts;
      if (path.startsWith('/3d')) return userPermissions.canManage3DModels !== false;
      if (path.startsWith('/categories'))
        return !!userPermissions.canManageProducts || !!userPermissions.canManageInventory;
      if (path.startsWith('/orders')) return !!userPermissions.canManageOrders;
      if (path.startsWith('/customers')) return !!userPermissions.canManageCustomers;
      if (path.startsWith('/reviews'))
        return !!userPermissions.canManageCustomers || !!userPermissions.canManageProducts;
      if (
        path.startsWith('/themes') ||
        path.startsWith('/pages') ||
        path.startsWith('/forms') ||
        path.startsWith('/blog') ||
        path.startsWith('/navigation')
      ) {
        return !!userPermissions.canManageThemes;
      }
      if (path.startsWith('/seo'))
        return !!userPermissions.canManageThemes || !!userPermissions.canManageSettings;
      if (path.startsWith('/shipping')) return !!userPermissions.canManageLogistics;
      if (path.startsWith('/discounts') || path.startsWith('/marketing'))
        return !!userPermissions.canManageAnalytics || !!userPermissions.canManageProducts;
      if (path.startsWith('/store-setup')) return !!userPermissions.canManageSettings;
      if (path.startsWith('/tax') || path.startsWith('/payments') || path === '/payment')
        return !!userPermissions.canManagePayments;
      if (path.startsWith('/loyalty')) return !!userPermissions.canManageCustomers;
    }

    return false;
  };

  const isAuthorized = checkRouteAuthorization(pathname);
  const isFullScreenRoute = pathname === '/email-templates' || pathname.startsWith('/email-templates');

  const getDefaultAllowedPath = () => {
    if (userRole === 'STOCK_CHECKER') return '/products';
    if (userRole === 'FULFILLMENT') return '/orders';
    if (userRole === 'SUPPORT') return '/customers';
    if (userRole === 'EDITOR') return '/themes';
    return '/dashboard';
  };

  if (isFullScreenRoute) {
    if (isLoading) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#121212]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-sky-600 dark:border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500 dark:text-[#98989D] tracking-wide animate-pulse">
              Loading Workspace...
            </span>
          </div>
        </div>
      );
    }
    if (isSuspended) {
      return <StoreSuspendedModal />;
    }
    if (!isAuthorized) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#121212] p-6">
          <div className="max-w-lg w-full p-8 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2C2C2E] shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-[#3A1C1C] text-rose-600 dark:text-[#FF453A] flex items-center justify-center mx-auto border border-rose-200 dark:border-[#FF453A]/30">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-[#3A1C1C] text-rose-700 dark:text-[#FF453A] text-[10px] font-bold uppercase tracking-wider">
                Access Restricted
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Not Permitted</h2>
              <p className="text-xs text-slate-500 dark:text-[#98989D] leading-relaxed max-w-sm mx-auto">
                Your assigned staff role ({userRole}) does not have permission to access this section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(getDefaultAllowedPath())}
              className="w-full py-3 rounded-xl bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Authorized Workspace</span>
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white font-sans">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <AdminHeader
          merchantData={merchantData}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onAddProduct={openAddProductModal}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
        />

        {/* Dynamic Section Page Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0 overflow-x-hidden">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-sky-600 dark:border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500 dark:text-[#98989D] animate-pulse">
                Synchronizing live data...
              </span>
            </div>
          ) : isSuspended ? (
            <StoreSuspendedModal />
          ) : !isAuthorized ? (
            <div className="p-8 max-w-lg mx-auto bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200 dark:border-[#2C2C2E] text-center space-y-4 shadow-xl mt-12">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-[#3A1C1C] text-rose-600 dark:text-[#FF453A] flex items-center justify-center mx-auto border border-rose-200 dark:border-[#FF453A]/30">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Access Unauthorized</h3>
              <p className="text-xs text-slate-500 dark:text-[#98989D]">
                Your account ({userRole}) does not have sufficient clearance to view this module.
              </p>
              <button
                type="button"
                onClick={() => router.push(getDefaultAllowedPath())}
                className="px-4 py-2 bg-sky-600 dark:bg-[#00E5FF] text-white dark:text-[#121212] rounded-xl text-xs font-bold cursor-pointer transition-all hover:opacity-90"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation Dock (For Mobile Phones) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#2C2C2E] px-3 py-2 z-30 flex items-center justify-around pb-safe shadow-lg">
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer transition-colors ${
            pathname === '/dashboard' || pathname === '/'
              ? 'text-sky-600 dark:text-[#00E5FF] font-bold'
              : 'text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => router.push('/products')}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer transition-colors ${
            pathname.startsWith('/products')
              ? 'text-sky-600 dark:text-[#00E5FF] font-bold'
              : 'text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-medium">Products</span>
        </button>

        <button
          onClick={() => router.push('/orders')}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer transition-colors ${
            pathname.startsWith('/orders')
              ? 'text-sky-600 dark:text-[#00E5FF] font-bold'
              : 'text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </button>

        <button
          onClick={() => router.push('/customers')}
          className={`flex flex-col items-center gap-1 p-1 text-xs cursor-pointer transition-colors ${
            pathname.startsWith('/customers')
              ? 'text-sky-600 dark:text-[#00E5FF] font-bold'
              : 'text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Customers</span>
        </button>

        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-xs cursor-pointer text-slate-500 dark:text-[#98989D] hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      {/* Modals & Chatbot */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateOrUpdateProduct}
        categories={categories.map((c) => c.name)}
        initialProduct={editingProduct || undefined}
      />
      <CreateStoreModal />
      <CMSChatbot />
      <SpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, CMSView } from '@/src/components/cms/Sidebar';
import { AdminHeader } from '@/src/components/cms/AdminHeader';
import { DashboardOverview } from '@/src/components/cms/DashboardOverview';
import { ProductTable } from '@/src/components/cms/ProductTable';
import { ProductFormModal } from '@/src/components/cms/ProductFormModal';
import { OrderTable } from '@/src/components/cms/OrderTable';
import { CategoryManager } from '@/src/components/cms/CategoryManager';
import { StoreSetup } from '@/src/components/cms/StoreSetup';
import { ThemeManager } from '@/src/components/cms/ThemeManager';
import { PageManager } from '@/src/components/cms/PageManager';
import { ProductStudio } from '@/src/components/cms/ProductStudio';
import { NavigationManager } from '@/src/components/cms/NavigationManager';
import { OrderStudio } from '@/src/components/cms/OrderStudio';
import { CustomerStudio } from '@/src/components/cms/CustomerStudio';
import { DiscountStudio } from '@/src/components/cms/DiscountStudio';
import { ShippingStudio } from '@/src/components/cms/ShippingStudio';
import { TaxStudio } from '@/src/components/cms/TaxStudio';
import { MarketingStudio } from '@/src/components/cms/MarketingStudio';
import { cmsService, STORE_TEMPLATES } from '@/src/services/cmsService';
import {
  CMSProduct,
  CMSCategory,
  CMSOrder,
  DashboardStats,
  ProductFormData,
  CategoryFormData,
  OrderStatus,
  MerchantOnboardingData,
} from '@/src/types';
import { Button } from '@heroui/react';
import { Store, RotateCcw } from 'lucide-react';

export default function CMSAdminDashboard() {
  const router = useRouter();

  // Navigation & Mobile Drawer States
  const [currentView, setCurrentView] = useState<CMSView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Session & CMS Catalog Data States
  const [merchantData, setMerchantData] = useState<MerchantOnboardingData | null>(null);
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Product Formik Editor
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CMSProduct | null>(null);

  // Check saved merchant session on mount; fetch user profile or redirect
  useEffect(() => {
    const initPage = async () => {
      const session = cmsService.getMerchantSession();
      if (session && session.merchant && session.store) {
        setMerchantData(session);
        fetchCMSData();
        return;
      }

      // If token exists in localStorage but session object isn't set, fetch profile from backend
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const backendUser = await cmsService.getCurrentUser();
        const nameParts = (backendUser.name || 'Merchant Owner').split(' ');
        const firstName = nameParts[0] || 'Merchant';
        const lastName = nameParts.slice(1).join(' ') || 'Owner';

        const user = {
          firstName,
          lastName,
          mobileNumber: '+1 555-0199',
          email: backendUser.email,
        };

        if (backendUser.stores && backendUser.stores.length > 0) {
          const store = backendUser.stores[0];
          const newSession = {
            merchant: user,
            store: {
              storeName: store.name,
              tagline: 'Official Store',
              category: 'Tech & Electronics',
              currency: store.currency || 'USD',
              supportEmail: user.email,
              supportPhone: user.mobileNumber,
            },
            selectedTemplate: STORE_TEMPLATES[0],
          };
          cmsService.saveMerchantSession(newSession);
          setMerchantData(newSession);
          fetchCMSData();
        } else {
          // Authenticated but no store created yet -> go to merchant onboarding, NOT /login
          router.push('/merchant-details');
        }
      } catch (err) {
        cmsService.clearMerchantSession();
        router.push('/login');
      }
    };

    initPage();
  }, [router]);

  // Load All CMS Data
  const fetchCMSData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, ordersData, statsData] = await Promise.all([
        cmsService.getProducts(),
        cmsService.getCategories(),
        cmsService.getOrders(),
        cmsService.getDashboardStats(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    cmsService.clearMerchantSession();
    setMerchantData(null);
    router.push('/login');
  };

  // Product CRUD Actions
  const handleCreateOrUpdateProduct = async (formData: ProductFormData) => {
    if (editingProduct) {
      await cmsService.updateProduct(editingProduct.id, formData);
    } else {
      await cmsService.createProduct(formData);
    }
    await fetchCMSData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product from the CMS catalog?')) {
      await cmsService.deleteProduct(id);
      await fetchCMSData();
    }
  };

  const handleCreateCategory = async (categoryData: CategoryFormData) => {
    await cmsService.createCategory(categoryData);
    await fetchCMSData();
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    await cmsService.updateOrderStatus(id, status);
    await fetchCMSData();
  };

  const categoryNames = categories.map((c) => c.name);
  const lowStockProducts = products.filter((p) => p.stockQuantity < 10 && p.status === 'active');

  return (
    <div className="min-h-screen flex bg-[#eef0f3] dark:bg-background text-slate-800 dark:text-foreground selection:bg-slate-900 selection:text-white">
      {/* Sidebar with Mobile Drawer */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        productsCount={products.length}
        ordersCount={orders.length}
        merchantData={merchantData}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main CMS View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header with Mobile Menu Trigger */}
        <AdminHeader
          merchantData={merchantData}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onAddProduct={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
        />

        {/* View Container */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 w-full space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-28">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-extrabold text-slate-500 animate-pulse">
                  Loading Dashboard...
                </span>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'marketing' && <MarketingStudio />}

              {currentView === 'tax' && <TaxStudio />}

              {currentView === 'shipping' && <ShippingStudio />}

              {currentView === 'discounts' && <DiscountStudio />}

              {currentView === 'customers' && <CustomerStudio />}

              {currentView === 'orders' && <OrderStudio />}

              {currentView === 'navigation' && <NavigationManager />}

              {currentView === 'products' && <ProductStudio />}

              {currentView === 'pages' && <PageManager />}

              {currentView === 'themes' && <ThemeManager />}

              {currentView === 'store-setup' && (
                <StoreSetup
                  onSaved={(updated) => {
                    if (merchantData) {
                      setMerchantData({
                        ...merchantData,
                        store: {
                          ...merchantData.store,
                          storeName: updated.name,
                          currency: updated.currency,
                        },
                      });
                    }
                  }}
                />
              )}

              {currentView === 'dashboard' && stats && (
                <DashboardOverview
                  stats={stats}
                  recentOrders={orders.slice(0, 5)}
                  lowStockProducts={lowStockProducts}
                  onNavigateProducts={() => setCurrentView('products')}
                  onNavigateOrders={() => setCurrentView('orders')}
                />
              )}

              {currentView === 'products' && (
                <ProductTable
                  products={products}
                  categories={categoryNames}
                  onAddProduct={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  onEditProduct={(product) => {
                    setEditingProduct(product);
                    setIsProductModalOpen(true);
                  }}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {currentView === 'categories' && (
                <CategoryManager
                  categories={categories}
                  onCreateCategory={handleCreateCategory}
                />
              )}

              {currentView === 'orders' && (
                <OrderTable
                  orders={orders}
                  onStatusChange={handleUpdateOrderStatus}
                />
              )}

              {currentView === 'customers' && (
                <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md text-center space-y-3">
                  <span className="px-3 py-1 rounded-full bg-sage-accent text-sage-primary font-black text-xs border border-sage-border">
                    CRM Database
                  </span>
                  <h3 className="font-extrabold text-xl text-sage-text">Customer Profiles & History</h3>
                  <p className="text-xs text-sage-muted max-w-md mx-auto">
                    Manage buyer profiles, transaction logs, and customer communications for {merchantData?.store?.storeName}.
                  </p>
                </div>
              )}

              {currentView === 'settings' && (
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-sage-border shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-black text-lg text-sage-text flex items-center gap-2">
                          <Store className="w-5 h-5 text-sage-primary" />
                          <span>Active Store Identity & Theme Settings</span>
                        </h3>
                        <p className="text-xs text-sage-muted">
                          Configured brand identity, chosen storefront design specifications, and merchant contact parameters.
                        </p>
                      </div>

                      <Button
                        onClick={() => router.push('/merchant-details')}
                        className="px-5 py-2.5 bg-sage-primary hover:bg-sage-hover text-white text-xs font-extrabold rounded-2xl shadow-sm flex items-center gap-2 min-h-[44px] shrink-0 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Re-run Onboarding Setup Studio</span>
                      </Button>
                    </div>

                    {merchantData && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-sage-border">
                        <div className="p-4 rounded-2xl bg-sage-accent/30 border border-sage-border space-y-1">
                          <span className="text-[10px] text-sage-muted uppercase font-bold block">
                            Store Brand
                          </span>
                          <p className="text-sm font-black text-sage-text">{merchantData.store.storeName}</p>
                          <p className="text-xs text-sage-muted italic">"{merchantData.store.tagline}"</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-sage-accent/30 border border-sage-border space-y-1">
                          <span className="text-[10px] text-sage-muted uppercase font-bold block">
                            Selected Storefront Theme
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shadow-xs"
                              style={{ backgroundColor: merchantData.selectedTemplate.accentColor }}
                            />
                            <p className="text-sm font-black text-sage-text">
                              {merchantData.selectedTemplate.name}
                            </p>
                          </div>
                          <p className="text-xs text-sage-muted">{merchantData.selectedTemplate.tagline}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-sage-accent/30 border border-sage-border space-y-1">
                          <span className="text-[10px] text-sage-muted uppercase font-bold block">
                            Merchant Profile
                          </span>
                          <p className="text-sm font-black text-sage-text">
                            {merchantData.merchant.firstName} {merchantData.merchant.lastName}
                          </p>
                          <p className="text-xs text-sage-muted">
                            {merchantData.merchant.email} • {merchantData.merchant.mobileNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Formik Product Create / Edit Modal */}
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
}
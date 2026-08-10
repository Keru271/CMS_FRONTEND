'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface CMSContextType {
  merchantData: MerchantOnboardingData | null;
  setMerchantData: React.Dispatch<React.SetStateAction<MerchantOnboardingData | null>>;
  products: CMSProduct[];
  categories: CMSCategory[];
  orders: CMSOrder[];
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchCMSData: () => Promise<void>;
  
  // Product Modal State
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: CMSProduct | null;
  setEditingProduct: (product: CMSProduct | null) => void;
  openAddProductModal: () => void;
  openEditProductModal: (product: CMSProduct) => void;
  
  // Actions
  handleCreateOrUpdateProduct: (formData: ProductFormData) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleCreateCategory: (categoryData: CategoryFormData) => Promise<void>;
  handleUpdateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  handleLogout: () => void;
  
  // Sidebar State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [merchantData, setMerchantData] = useState<MerchantOnboardingData | null>(null);
  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CMSProduct | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const initCMS = async () => {
      const session = cmsService.getMerchantSession();
      if (session && session.merchant && session.store) {
        setMerchantData(session);
        await fetchCMSData();
        return;
      }

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
          await fetchCMSData();
        } else {
          router.push('/merchant-details');
        }
      } catch (err) {
        cmsService.clearMerchantSession();
        router.push('/login');
      }
    };

    initCMS();
  }, [router]);

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

  const handleLogout = () => {
    cmsService.clearMerchantSession();
    setMerchantData(null);
    router.push('/login');
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: CMSProduct) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

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

  return (
    <CMSContext.Provider
      value={{
        merchantData,
        setMerchantData,
        products,
        categories,
        orders,
        stats,
        isLoading,
        fetchCMSData,
        isProductModalOpen,
        setIsProductModalOpen,
        editingProduct,
        setEditingProduct,
        openAddProductModal,
        openEditProductModal,
        handleCreateOrUpdateProduct,
        handleDeleteProduct,
        handleCreateCategory,
        handleUpdateOrderStatus,
        handleLogout,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMSContext = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
};

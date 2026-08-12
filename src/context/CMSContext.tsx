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
  setProducts: React.Dispatch<React.SetStateAction<CMSProduct[]>>;
  categories: CMSCategory[];
  setCategories: React.Dispatch<React.SetStateAction<CMSCategory[]>>;
  orders: CMSOrder[];
  setOrders: React.Dispatch<React.SetStateAction<CMSOrder[]>>;
  stats: DashboardStats | null;
  setStats: React.Dispatch<React.SetStateAction<DashboardStats | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchDashboardDetails: () => Promise<void>;
  
  // Product Modal State
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: CMSProduct | null;
  setEditingProduct: (product: CMSProduct | null) => void;
  openAddProductModal: () => void;
  openEditProductModal: (product: CMSProduct) => void;
  
  // Actions
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
        setIsLoading(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        router.push('/login');
        setIsLoading(false);
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
        } else {
          router.push('/merchant-details');
        }
      } catch (err) {
        cmsService.clearMerchantSession();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initCMS();
  }, [router]);

  // Fetch Dashboard Details via single endpoint /api/analytics/dashboard-details
  const fetchDashboardDetails = async () => {
    setIsLoading(true);
    try {
      const details = await cmsService.getDashboardDetails();
      setStats(details.stats);
      setProducts(details.products);
      setCategories(details.categories);
      setOrders(details.orders);
    } catch (err) {
      console.error('Failed to load dashboard details:', err);
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

  return (
    <CMSContext.Provider
      value={{
        merchantData,
        setMerchantData,
        products,
        setProducts,
        categories,
        setCategories,
        orders,
        setOrders,
        stats,
        setStats,
        isLoading,
        setIsLoading,
        fetchDashboardDetails,
        isProductModalOpen,
        setIsProductModalOpen,
        editingProduct,
        setEditingProduct,
        openAddProductModal,
        openEditProductModal,
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

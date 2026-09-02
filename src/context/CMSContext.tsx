'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cmsService, STORE_TEMPLATES } from '@/src/services/cmsService';
import {
  CMSProduct,
  CMSCategory,
  CMSOrder,
  DashboardStats,
  MerchantOnboardingData,
  CMSStore,
  CreateStorePayload,
} from '@/src/types';

interface CMSContextType {
  merchantData: MerchantOnboardingData | null;
  setMerchantData: React.Dispatch<React.SetStateAction<MerchantOnboardingData | null>>;
  
  // Multi-Store Portfolio Management
  stores: CMSStore[];
  activeStore: CMSStore | null;
  switchActiveStore: (storeId: string) => Promise<void>;
  createNewStore: (storeData: CreateStorePayload) => Promise<CMSStore>;
  refreshStores: () => Promise<CMSStore[]>;
  isCreateStoreModalOpen: boolean;
  setIsCreateStoreModalOpen: (open: boolean) => void;

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
  
  // Store Suspension State
  isSuspended: boolean;
  storeStatus: string;
  isCheckingStatus: boolean;
  refreshStoreStatus: () => Promise<void>;

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
  const [stores, setStores] = useState<CMSStore[]>([]);
  const [activeStore, setActiveStore] = useState<CMSStore | null>(null);
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState<boolean>(false);

  const [products, setProducts] = useState<CMSProduct[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [orders, setOrders] = useState<CMSOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store Suspension State
  const [storeStatus, setStoreStatus] = useState<string>('ACTIVE');
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CMSProduct | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch Dashboard Details via /api/analytics/dashboard-details scoped to active store
  const fetchDashboardDetails = useCallback(async () => {
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
  }, []);

  const syncUserAndStoreStatus = useCallback(async () => {
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
        role: backendUser.role,
      };

      // Collect all stores owned or accessible by merchant
      const ownedStores = backendUser.stores || [];
      const memberStores = (backendUser.storeMemberships || [])
        .map((m) => m.store)
        .filter((s): s is CMSStore => Boolean(s));

      const storeMap = new Map<string, CMSStore>();
      [...ownedStores, ...memberStores].forEach((st) => {
        if (st && st.id) storeMap.set(st.id, st);
      });
      const allStores = Array.from(storeMap.values());
      setStores(allStores);

      // Determine active store from localStorage, or default to first store
      const storedStoreId = typeof window !== 'undefined' ? localStorage.getItem('selected_store_id') : null;
      let currentActiveStore = allStores.find((s) => s.id === storedStoreId) || allStores[0] || null;

      if (currentActiveStore) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('selected_store_id', currentActiveStore.id);
        }
        setActiveStore(currentActiveStore);
        const currentStatus = (currentActiveStore.status || 'ACTIVE').toUpperCase();
        setStoreStatus(currentStatus);
        setIsSuspended(currentStatus === 'SUSPENDED');

        // Determine the user's role and permissions for currentActiveStore
        const isOwner = ownedStores.some((s) => s.id === currentActiveStore.id);
        const activeMembership = (backendUser.storeMemberships || []).find(
          (m) => m.storeId === currentActiveStore.id || m.store?.id === currentActiveStore.id
        ) || (backendUser.storeMemberships && backendUser.storeMemberships[0]);

        let effectiveRole = isOwner
          ? 'OWNER'
          : activeMembership
          ? (activeMembership.role || 'STAFF').toUpperCase()
          : (backendUser.role || 'STAFF').toUpperCase();

        let effectiveTitle = isOwner
          ? 'Store Owner'
          : activeMembership?.customRoleTitle || backendUser.customRoleTitle || effectiveRole;

        let effectivePermissions = isOwner || effectiveRole === 'ADMIN'
          ? {
              canManageProducts: true,
              canManageInventory: true,
              canManageOrders: true,
              canManageCustomers: true,
              canManageThemes: true,
              canManageSettings: true,
              canManagePayments: true,
              canManageLogistics: true,
              canManageAnalytics: true,
            }
          : activeMembership
          ? {
              canManageProducts: !!activeMembership.canManageProducts,
              canManageInventory: !!activeMembership.canManageInventory,
              canManageOrders: !!activeMembership.canManageOrders,
              canManageCustomers: !!activeMembership.canManageCustomers,
              canManageThemes: !!activeMembership.canManageThemes,
              canManageSettings: !!activeMembership.canManageSettings,
              canManagePayments: !!activeMembership.canManagePayments,
              canManageLogistics: !!activeMembership.canManageLogistics,
              canManageAnalytics: !!activeMembership.canManageAnalytics,
            }
          : {
              canManageProducts: !!(backendUser as any).permissionsProducts,
              canManageInventory: !!(backendUser as any).permissionsProducts,
              canManageOrders: !!(backendUser as any).permissionsOrders,
              canManageCustomers: !!(backendUser as any).permissionsCustomers,
              canManageThemes: !!(backendUser as any).permissionsThemes,
              canManageSettings: !!(backendUser as any).permissionsSettings,
              canManagePayments: !!(backendUser as any).permissionsPayments,
              canManageLogistics: false,
              canManageAnalytics: !!(backendUser as any).permissionsAnalytics,
            };

        if (typeof window !== 'undefined') {
          localStorage.setItem('user_role', effectiveRole);
          localStorage.setItem('user_permissions', JSON.stringify(effectivePermissions));
        }

        const session = cmsService.getMerchantSession();
        const updatedSession: MerchantOnboardingData = {
          merchant: {
            ...user,
            role: effectiveRole,
            customRoleTitle: effectiveTitle,
            permissions: effectivePermissions,
          },
          store: {
            id: currentActiveStore.id,
            slug: currentActiveStore.slug,
            storeName: currentActiveStore.name,
            tagline: session?.store?.tagline || currentActiveStore.description || 'Official Store',
            category: session?.store?.category || 'Tech & Electronics',
            currency: currentActiveStore.currency || 'USD',
            status: currentStatus,
            supportEmail: user.email,
            supportPhone: user.mobileNumber,
          },
          selectedTemplate: session?.selectedTemplate || STORE_TEMPLATES[0],
        };

        cmsService.saveMerchantSession(updatedSession);
        setMerchantData(updatedSession);
        return updatedSession;
      } else {
        // No store created yet. Keep store as null in state and session until user creates a store.
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selected_store_id');
          localStorage.removeItem('current_store_id');
        }
        setActiveStore(null);
        setStores([]);

        const session = cmsService.getMerchantSession();
        const updatedSession: MerchantOnboardingData = {
          merchant: {
            ...user,
            ...(session?.merchant || {}),
            role: backendUser.role,
          },
          store: null,
          selectedTemplate: session?.selectedTemplate || STORE_TEMPLATES[0],
        };
        cmsService.saveMerchantSession(updatedSession);
        setMerchantData(updatedSession);
        return updatedSession;
      }
    } catch (err) {
      console.warn('Failed to sync store status (stale token or reset DB):', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('selected_store_id');
      }
      cmsService.clearMerchantSession();
      router.push('/login');
    }
  }, [router]);

  // 1-Click Store Switcher
  const switchActiveStore = async (storeId: string) => {
    const targetStore = stores.find((s) => s.id === storeId);
    if (!targetStore) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_store_id', targetStore.id);
    }
    setActiveStore(targetStore);
    const currentStatus = (targetStore.status || 'ACTIVE').toUpperCase();
    setStoreStatus(currentStatus);
    setIsSuspended(currentStatus === 'SUSPENDED');

    if (merchantData) {
      const updatedSession: MerchantOnboardingData = {
        ...merchantData,
        store: {
          ...merchantData.store,
          id: targetStore.id,
          slug: targetStore.slug,
          storeName: targetStore.name,
          currency: targetStore.currency || 'USD',
          status: currentStatus,
        },
      };
      cmsService.saveMerchantSession(updatedSession);
      setMerchantData(updatedSession);
    }

    // Refresh all store-scoped resources
    await fetchDashboardDetails();
  };

  // Create New Store for Merchant Portfolio
  const createNewStore = async (storePayload: CreateStorePayload): Promise<CMSStore> => {
    setIsLoading(true);
    try {
      const newStore = await cmsService.createStore(storePayload);
      const updatedStores = [newStore, ...stores.filter((s) => s.id !== newStore.id)];
      setStores(updatedStores);
      await switchActiveStore(newStore.id);
      setIsCreateStoreModalOpen(false);
      return newStore;
    } catch (err) {
      console.error('Failed to create store:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStores = async (): Promise<CMSStore[]> => {
    try {
      const fetchedStores = await cmsService.getMerchantStores();
      if (fetchedStores && fetchedStores.length > 0) {
        setStores(fetchedStores);
      }
      return fetchedStores;
    } catch {
      return stores;
    }
  };

  const refreshStoreStatus = async () => {
    setIsCheckingStatus(true);
    try {
      await syncUserAndStoreStatus();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    const initCMS = async () => {
      // First populate from local session if available to avoid flash
      const session = cmsService.getMerchantSession();
      if (session && session.merchant && session.store) {
        setMerchantData(session);
        const localStatus = (session.store.status || 'ACTIVE').toUpperCase();
        setStoreStatus(localStatus);
        setIsSuspended(localStatus === 'SUSPENDED');
      }

      // Then verify fresh live status and store list from backend
      await syncUserAndStoreStatus();
      await fetchDashboardDetails();
      setIsLoading(false);
    };

    initCMS();
  }, [syncUserAndStoreStatus, fetchDashboardDetails]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selected_store_id');
      localStorage.removeItem('current_store_id');
      localStorage.removeItem('active_store_id');
    }
    cmsService.clearMerchantSession();
    setMerchantData(null);
    setActiveStore(null);
    setStores([]);
    setStoreStatus('ACTIVE');
    setIsSuspended(false);
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
        stores,
        activeStore,
        switchActiveStore,
        createNewStore,
        refreshStores,
        isCreateStoreModalOpen,
        setIsCreateStoreModalOpen,
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
        isSuspended,
        storeStatus,
        isCheckingStatus,
        refreshStoreStatus,
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

export const useCMS = useCMSContext;

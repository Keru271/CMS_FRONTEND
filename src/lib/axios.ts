import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Local storage helpers to avoid circular dependency with cmsService
function getActiveStoreId(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('active_store_id') || null;
    } catch {
      return null;
    }
  }
  return null;
}

function clearMerchantSession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_store_id');
      localStorage.removeItem('merchant_session');
      sessionStorage.clear();
    } catch {}
  }
}

// Clean and resolve base API URL, ensuring /api suffix without trailing slashes
function resolveApiBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_CMS_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api';

  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token and active Store ID to EVERY outgoing API call
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Automatically resolve active store ID
      const resolvedStoreId = getActiveStoreId();

      // Placeholder IDs that should never be sent to the backend
      const INVALID_STORE_IDS = new Set([
        'default-store-id',
        'store-active',
        'store-placeholder',
        'null',
        'undefined',
      ]);
      const isValidStoreId = resolvedStoreId && !INVALID_STORE_IDS.has(resolvedStoreId);

      if (isValidStoreId) {
        if (config.headers) {
          config.headers['x-store-id'] = resolvedStoreId;
          config.headers['store-id'] = resolvedStoreId;
          config.headers['x-tenant-id'] = resolvedStoreId;
        }

        if (!config.params) {
          config.params = {};
        }
        if (!config.params.storeId) {
          config.params.storeId = resolvedStoreId;
        }
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      if (error.response.status === 401) {
        console.warn(
          'Unauthorized (401) response received. Clearing auth token and redirecting to login...',
        );
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Avoid redirect loops on public auth routes and onboarding pages
          if (
            !currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            !currentPath.includes('/verify-email') &&
            !currentPath.includes('/forgot-password') &&
            !currentPath.includes('/reset-password') &&
            !currentPath.includes('/onboarding') &&
            !currentPath.includes('/store-setup') &&
            !currentPath.includes('/setup')
          ) {
            clearMerchantSession();
            window.location.href = '/login';
          }
        }
      } else if (error.response.status === 404) {
        // If /users/me returns 404, the stored JWT belongs to a deleted/reset user account
        if (error.config?.url?.includes('/users/me') && typeof window !== 'undefined') {
          console.warn('User profile deleted or reset in database. Clearing stale auth token...');
          clearMerchantSession();
          const currentPath = window.location.pathname;
          if (
            !currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            !currentPath.includes('/verify-email')
          ) {
            window.location.href = '/login';
          }
        } else {
          console.warn('Requested resource not found.');
        }
      } else if (error.response.status >= 500) {
        console.error('Server side error occurred.');
      }
    } else if (error.request) {
      // Network error / no response received
      console.warn('Network error: Server did not respond.');
    } else {
      console.error('Axios Request Error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;

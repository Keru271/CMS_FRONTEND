import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token and active Store ID to EVERY outgoing API call
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Automatically resolve active store ID from all storage keys & session objects
      const resolvedStoreId =
        localStorage.getItem('current_store_id') ||
        localStorage.getItem('active_store_id') ||
        localStorage.getItem('storeId') ||
        localStorage.getItem('activeStoreId') ||
        localStorage.getItem('selected_store_id') ||
        (() => {
          try {
            const sessionStr =
              localStorage.getItem('merchant_cms_session') ||
              localStorage.getItem('auth_user') ||
              localStorage.getItem('user_session');
            if (sessionStr) {
              const session = JSON.parse(sessionStr);
              return (
                session?.store?.id ||
                session?.storeId ||
                session?.activeStoreId ||
                session?.user?.storeId ||
                session?.currentStore?.id ||
                null
              );
            }
          } catch {}
          return null;
        })();

      const finalStoreId = resolvedStoreId || 'default-store-id';

      if (config.headers) {
        config.headers['x-store-id'] = finalStoreId;
        config.headers['store-id'] = finalStoreId;
        config.headers['x-tenant-id'] = finalStoreId;
      }

      // Also append storeId query param for full compatibility if not already present
      if (!config.params) {
        config.params = {};
      }
      if (!config.params.storeId && finalStoreId !== 'default-store-id') {
        config.params.storeId = finalStoreId;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
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
        console.warn('Unauthorized (401) response received. Clearing auth token and redirecting to login...');
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Avoid redirect loops on public auth routes
          if (
            !currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            !currentPath.includes('/verify-email') &&
            !currentPath.includes('/forgot-password') &&
            !currentPath.includes('/reset-password')
          ) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('merchant_cms_session');
            sessionStorage.removeItem('cms_pending_verification_email');
            sessionStorage.removeItem('cms_latest_verification_token');
            window.location.href = '/login';
          }
        }
      } else if (error.response.status === 404) {
        // If /users/me returns 404, the stored JWT belongs to a deleted/reset user account
        if (error.config?.url?.includes('/users/me') && typeof window !== 'undefined') {
          console.warn('User profile deleted or reset in database. Clearing stale auth token...');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('selected_store_id');
          localStorage.removeItem('merchant_cms_session');
          sessionStorage.removeItem('cms_pending_verification_email');
          sessionStorage.removeItem('cms_latest_verification_token');
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
  }
);

export default apiClient;

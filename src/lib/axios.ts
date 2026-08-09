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

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
          // Avoid redirect loops on auth routes
          if (
            !currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            !currentPath.includes('/verify-email')
          ) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('merchant_cms_session');
            sessionStorage.removeItem('cms_pending_verification_email');
            sessionStorage.removeItem('cms_latest_verification_token');
            window.location.href = '/login';
          }
        }
      } else if (error.response.status === 404) {
        console.warn('Requested resource not found.');
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

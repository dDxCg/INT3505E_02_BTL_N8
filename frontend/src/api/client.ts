import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// ============================================
// CONFIGURATION
// ============================================

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  enableLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
  environment: import.meta.env.VITE_ENV || 'development',
};

// ============================================
// AXIOS INSTANCE
// ============================================

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (API_CONFIG.enableLogging) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    if (API_CONFIG.enableLogging) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (API_CONFIG.enableLogging) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Enhanced error handling
    const errorMessage = handleApiError(error);

    // Log errors in development
    if (API_CONFIG.enableLogging) {
      console.error('❌ API Error:', {
        message: errorMessage,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Show toast notification for errors (you can customize this)
    if (API_CONFIG.environment !== 'test') {
      // Don't show toasts in test environment
      showErrorToast(error);
    }

    return Promise.reject(error);
  }
);

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

interface ApiErrorResponse {
  detail?: string | { msg: string }[];
  message?: string;
  error?: string;
}

function handleApiError(error: AxiosError<ApiErrorResponse>): string {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return extractErrorMessage(data) || 'Bad Request - Invalid data';
      case 401:
        // Handle unauthorized - clear token and redirect
        localStorage.removeItem('auth_token');
        return 'Unauthorized - Please login again';
      case 403:
        return 'Forbidden - You do not have permission';
      case 404:
        return 'Not Found - Resource does not exist';
      case 422:
        // FastAPI validation errors
        return extractValidationErrors(data) || 'Validation Error';
      case 500:
        return 'Server Error - Please try again later';
      case 503:
        return 'Service Unavailable - Server is down';
      default:
        return extractErrorMessage(data) || `Error ${status}: ${error.message}`;
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network Error - Cannot connect to server';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
}

function extractErrorMessage(data: ApiErrorResponse | undefined): string | null {
  if (!data) return null;

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail.map(err => err.msg).join(', ');
  }

  if (data.message) {
    return data.message;
  }

  if (data.error) {
    return data.error;
  }

  return null;
}

function extractValidationErrors(data: ApiErrorResponse | undefined): string | null {
  if (!data?.detail || !Array.isArray(data.detail)) {
    return null;
  }

  const errors = data.detail.map((err: any) => {
    const field = err.loc ? err.loc.join('.') : 'unknown';
    return `${field}: ${err.msg}`;
  });

  return errors.join('; ');
}

function showErrorToast(error: AxiosError<ApiErrorResponse>) {
  const message = handleApiError(error);
  const status = error.response?.status;

  // Don't show toast for 401 errors (will redirect to login)
  if (status === 401) {
    return;
  }

  // Show error toast (you can customize styling)
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Set auth token for subsequent requests
 */
export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

/**
 * Clear auth token
 */
export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get API configuration
 */
export function getApiConfig() {
  return { ...API_CONFIG };
}

export default apiClient;

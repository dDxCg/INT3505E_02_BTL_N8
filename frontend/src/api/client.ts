// frontend/src/api/client.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('auth_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error?.response?.config || error?.config;

    const method = cfg?.method?.toUpperCase?.() || cfg?.method || 'UNKNOWN';
    const url = cfg?.baseURL ? `${cfg.baseURL}${cfg.url || ''}` : cfg?.url || 'UNKNOWN_URL';
    const status = error?.response?.status;

    if (error?.response) {
      const data = error.response.data;

      // cố gắng rút "detail" kiểu FastAPI ra cho dễ đọc
      const detail =
        data && typeof data === 'object'
          ? (data.detail ?? data.message ?? data.error ?? data)
          : data;

      console.error('[API ERROR]', {
        method,
        url,
        status,
        detail,
        data, // giữ nguyên object để mở ra xem full
      });
    } else if (error?.request) {
      console.error('[NETWORK ERROR]', { method, url, message: error.message, request: error.request });
    } else {
      console.error('[UNKNOWN ERROR]', { method, url, message: error?.message });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

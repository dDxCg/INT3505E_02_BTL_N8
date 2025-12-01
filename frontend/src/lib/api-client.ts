// src/lib/api-client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// URL này phải khớp với port backend của bạn
// Backend chạy tại http://127.0.0.1:8000 (Swagger UI: http://127.0.0.1:8000/docs)
const BASE_URL = 'http://127.0.0.1:8000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Interceptor: Log request để debug (giống như bạn yêu cầu)
apiClient.interceptors.request.use(
  (config) => {
    console.info(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý response & lỗi
apiClient.interceptors.response.use(
  (response) => response.data, // Trả về data trực tiếp, bỏ qua wrapper axios
  (error: AxiosError) => {
    if (error.response) {
      // Lỗi từ server (4xx, 5xx)
      console.error('[API Error]', error.response.status, error.response.data);
      const responseData = error.response.data as { detail?: string; message?: string } | string;
      const errorMessage = 
        (typeof responseData === 'object' && responseData?.detail) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' ? responseData : undefined) ||
        `Server error: ${error.response.status}`;
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Lỗi không nhận được phản hồi (Network error)
      console.error('[API Network Error]', error.message);
      // Kiểm tra nếu là network error (không kết nối được)
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return Promise.reject(new Error('Network Error: Không thể kết nối đến server. Vui lòng kiểm tra xem backend có đang chạy không.'));
      }
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timeout: Server không phản hồi kịp thời.'));
      }
      return Promise.reject(new Error(`Network Error: ${error.message}`));
    } else {
      // Lỗi khác
      console.error('[API Error]', error.message);
      return Promise.reject(error);
    }
  }
);

export default apiClient;
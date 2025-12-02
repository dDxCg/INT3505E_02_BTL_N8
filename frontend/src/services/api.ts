/**
 * API Services - Khớp 100% với Backend FastAPI Endpoints
 * Base URL: http://localhost:8000/api/v1
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  // Table
  TableRead,
  TableFilter,
  // Dish
  DishRead,
  DishFilter,
  // Order
  OrderCreate,
  OrderRead,
  OrderUpdate,
  OrderFilter,
  // OrderItem
  OrderItemCreate,
  OrderItemBase,
  OrderItemUpdate,
  OrderItemRead,
  OrderItemFilter,
  // OrderStatus
  OrderStatusRead,
  // OrderItemStatus
  OrderItemStatusRead,
} from '../types/schema';

// ============================================
// AXIOS INSTANCE SETUP
// ============================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    } else if (error.request) {
      console.error('API Network Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// RESOURCE APIs
// ============================================

/**
 * GET /resources/dishes/
 * Lấy danh sách món ăn
 */
export const getDishes = async (filters?: DishFilter): Promise<DishRead[]> => {
  const response = await apiClient.get<DishRead[]>('/resources/dishes/', {
    params: filters,
  });
  return response.data;
};

/**
 * GET /tables
 * Lấy danh sách bàn
 */
export const getTables = async (filters?: TableFilter): Promise<TableRead[]> => {
  const response = await apiClient.get<TableRead[]>('/tables', {
    params: filters,
  });
  return response.data;
};

/**
 * GET /tables/{table_id}
 * Lấy chi tiết một bàn
 */
export const getTableById = async (tableId: number): Promise<TableRead> => {
  const response = await apiClient.get<TableRead>(`/tables/${tableId}`);
  return response.data;
};

// ============================================
// GUEST BOOKING APIs
// ============================================

/**
 * POST /orders
 * Tạo order mới cho bàn
 * Backend mặc định status_id = 1 (pending) nếu không truyền
 */
export const createOrder = async (data: OrderCreate): Promise<OrderRead> => {
  const response = await apiClient.post<OrderRead>('/orders', data);
  return response.data;
};

/**
 * POST /orders/items/
 * Thêm món vào order
 * IMPORTANT: Phải truyền status_id (thường là 1 = pending)
 */
export const addOrderItem = async (data: OrderItemCreate): Promise<OrderItemBase> => {
  const response = await apiClient.post<OrderItemBase>('/orders/items/', data);
  return response.data;
};

// ============================================
// STAFF MANAGEMENT APIs
// ============================================

/**
 * GET /orders
 * Lấy tất cả orders (có thể filter theo status_id)
 */
export const getOrders = async (filters?: OrderFilter): Promise<OrderRead[]> => {
  const response = await apiClient.get<OrderRead[]>('/orders', {
    params: filters,
  });
  return response.data;
};

/**
 * GET /orders?table_id={table_id}&status_id={status_id}
 * Lấy orders theo bàn (dùng cho Staff xem order đang active)
 * Thường filter: status_id=1 (pending) để lấy order đang chờ
 */
export const getOrderByTable = async (
  tableId: number,
  statusId?: number
): Promise<OrderRead[]> => {
  const filters: OrderFilter = {
    table_id: tableId,
    status_id: statusId,
  };
  const response = await apiClient.get<OrderRead[]>('/orders', {
    params: filters,
  });
  return response.data;
};

/**
 * GET /orders/{order_id}
 * Lấy chi tiết một order
 */
export const getOrderById = async (orderId: number): Promise<OrderRead> => {
  const response = await apiClient.get<OrderRead>(`/orders/${orderId}`);
  return response.data;
};

/**
 * GET /orders/items/?order_id={order_id}
 * Lấy danh sách món trong order
 * Returns OrderItemRead[] với populated dish và status
 */
export const getOrderItems = async (orderId: number): Promise<OrderItemRead[]> => {
  const filters: OrderItemFilter = {
    order_id: orderId,
  };
  const response = await apiClient.get<OrderItemRead[]>('/orders/items/', {
    params: filters,
  });
  return response.data;
};

/**
 * PUT /orders/items/{id}
 * Cập nhật trạng thái món (Lên món / Mark as Served)
 * Example: updateItemStatus(itemId, { status_id: 2 }) // 2 = served
 */
export const updateItemStatus = async (
  itemId: number,
  data: OrderItemUpdate
): Promise<OrderItemBase> => {
  const response = await apiClient.put<OrderItemBase>(
    `/orders/items/${itemId}`,
    data
  );
  return response.data;
};

/**
 * DELETE /orders/items/{id}
 * Hủy món / Xóa món khỏi order
 */
export const deleteOrderItem = async (itemId: number): Promise<OrderItemBase> => {
  const response = await apiClient.delete<OrderItemBase>(`/orders/items/${itemId}`);
  return response.data;
};

/**
 * PUT /orders/{id}
 * Cập nhật order (Thanh toán / Đóng bàn)
 * Example: updateOrder(orderId, { status_id: 3 }) // 3 = completed
 */
export const updateOrder = async (
  orderId: number,
  data: OrderUpdate
): Promise<OrderRead> => {
  const response = await apiClient.put<OrderRead>(`/orders/${orderId}`, data);
  return response.data;
};

/**
 * GET /orders/{order_id}/total
 * Tính tổng tiền của order
 */
export const getOrderTotal = async (orderId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/orders/${orderId}/total`);
  return response.data;
};

// ============================================
// STATUS APIs (Helper)
// ============================================

/**
 * GET /order/statuses
 * Lấy danh sách trạng thái order
 */
export const getOrderStatuses = async (): Promise<OrderStatusRead[]> => {
  const response = await apiClient.get<OrderStatusRead[]>('/order/statuses');
  return response.data;
};

/**
 * GET /orders/items/statuses
 * Lấy danh sách trạng thái order item
 */
export const getOrderItemStatuses = async (): Promise<OrderItemStatusRead[]> => {
  const response = await apiClient.get<OrderItemStatusRead[]>(
    '/orders/items/statuses'
  );
  return response.data;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default apiClient;

import apiClient from './client';
import type {
  Table,
  Dish,
  Order,
  OrderRead,
  OrderItem,
  OrderItemRead,
  OrderCreate,
  OrderUpdate,
  OrderItemCreate,
  OrderItemUpdate,
  OrderFilter,
  OrderItemFilter,
  DishFilter,
  Payment,
  PaymentCreate,
  Feedback,
  FeedbackCreate,
  OrderStatus,
  OrderItemStatus,
} from '../types';

// ============================================
// Tables API
// ============================================
export const tablesApi = {
  getAll: () => apiClient.get<Table[]>('/tables'),
  getById: (id: number) => apiClient.get<Table>(`/tables/${id}`),
};

// ============================================
// Dishes API
// ============================================
export const dishesApi = {
  getAll: (filters?: DishFilter) =>
    apiClient.get<Dish[]>('/resources/dishes/', { params: filters }),
  getById: (id: number) => apiClient.get<Dish>(`/resources/dishes/${id}`),
};

// ============================================
// Orders API
// ============================================
export const ordersApi = {
  create: (data: OrderCreate) => apiClient.post<OrderRead>('/orders', data),
  getAll: (filters?: OrderFilter) =>
    apiClient.get<OrderRead[]>('/orders', { params: filters }),
  getById: (id: number) => apiClient.get<OrderRead>(`/orders/${id}`),
  update: (id: number, data: OrderUpdate) =>
    apiClient.put<OrderRead>(`/orders/${id}`, data),
  delete: (id: number) => apiClient.delete<OrderRead>(`/orders/${id}`),
  getTotal: (id: number) => apiClient.get<number>(`/orders/${id}/total`),

  /**
   * Get active order for a table
   * An active order is one that is NOT paid (status_id 5) or cancelled (status_id 6)
   * Typically status_id 1-4 (Pending, Cooking, Served, Completed)
   */
  getActiveOrder: async (tableId: number): Promise<OrderRead | null> => {
    try {
      const response = await apiClient.get<OrderRead[]>('/orders', {
        params: { table_id: tableId },
      });
      const orders = response.data;

      // Find an active order (status_id between 1-4, not paid/cancelled)
      const activeOrder = orders.find(
        (order) => order.status_id && order.status_id >= 1 && order.status_id <= 4
      );

      return activeOrder || null;
    } catch (error) {
      console.error('Error fetching active order:', error);
      return null;
    }
  },
};

// ============================================
// Order Items API
// ============================================
export const orderItemsApi = {
  /**
   * Add item to an existing order
   * POST /orders/items/
   * Payload: { order_id, dish_id, quantity, status_id }
   */
  create: (data: OrderItemCreate) =>
    apiClient.post<OrderItem>('/orders/items/', data),

  /**
   * Alias for create - more semantic when adding items to existing orders
   */
  addToOrder: (data: OrderItemCreate) =>
    apiClient.post<OrderItem>('/orders/items/', data),

  getAll: (filters?: OrderItemFilter) =>
    apiClient.get<OrderItemRead[]>('/orders/items/', { params: filters }),
  getById: (id: number) => apiClient.get<OrderItemRead>(`/orders/items/${id}`),
  update: (id: number, data: OrderItemUpdate) =>
    apiClient.put<OrderItem>(`/orders/items/${id}`, data),
  delete: (id: number) => apiClient.delete<OrderItem>(`/orders/items/${id}`),
};

// ============================================
// Order Statuses API
// ============================================
export const orderStatusesApi = {
  getAll: () => apiClient.get<OrderStatus[]>('/order/statuses'),
  getById: (id: number) => apiClient.get<OrderStatus>(`/order/statuses/${id}`),
};

// ============================================
// Order Item Statuses API
// ============================================
export const orderItemStatusesApi = {
  getAll: () => apiClient.get<OrderItemStatus[]>('/orders/items/statuses'),
  getById: (id: number) =>
    apiClient.get<OrderItemStatus>(`/orders/items/statuses/${id}`),
};

// ============================================
// Payments API
// ============================================
export const paymentsApi = {
  create: (data: PaymentCreate) => apiClient.post<Payment>('/payments', data),
  getAll: (filters?: { booking_id?: number; status_id?: number }) =>
    apiClient.get<Payment[]>('/payments', { params: filters }),
  getById: (id: number) => apiClient.get<Payment>(`/payments/${id}`),
};

// ============================================
// Feedbacks API
// ============================================
export const feedbacksApi = {
  create: (data: FeedbackCreate) =>
    apiClient.post<Feedback>('/feedbacks/', data),
  getAll: (filters?: { order_id?: number }) =>
    apiClient.get<Feedback[]>('/feedbacks/', { params: filters }),
};

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
   * Fetches ALL orders for the table and filters client-side
   * An active order is one that is in PENDING (1) or COOKING (2) status
   * Status 3 (COMPLETED), 4 (PAID), 5 (CANCELLED) are NOT active
   *
   * Returns the LATEST active order (highest ID) if multiple exist
   */
  getActiveOrder: async (tableId: number): Promise<OrderRead | null> => {
    try {
      // Fetch ALL orders for this table without status filtering
      const response = await apiClient.get<OrderRead[]>('/orders', {
        params: { table_id: tableId },
      });
      const orders = response.data;

      if (!orders || orders.length === 0) {
        return null;
      }

      // Filter for active orders only (PENDING: 1, COOKING: 2)
      // Exclude COMPLETED (3), PAID (4), CANCELLED (5)
      const activeOrders = orders.filter(
        (order) => order.status_id && order.status_id >= 1 && order.status_id <= 2
      );

      if (activeOrders.length === 0) {
        return null;
      }

      // Return the latest active order (highest ID, most recent)
      const latestActiveOrder = activeOrders.reduce((latest, current) => {
        return current.id > latest.id ? current : latest;
      });

      return latestActiveOrder;
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

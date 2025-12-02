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
};

// ============================================
// Order Items API
// ============================================
export const orderItemsApi = {
  create: (data: OrderItemCreate) =>
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

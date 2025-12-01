import apiClient from '@/lib/api-client';
import type { Order, OrderCreate, OrderUpdate, OrderItem, OrderItemCreate } from '@/types/schema';

export const OrderService = {
  // --- Orders ---
  getAll: async (filters?: { table_id?: number; status_id?: number }) => {
    // Backend nhận query params: ?table_id=1&status_id=2
    return apiClient.get<Order[]>('/orders', { params: filters });
  },

  getById: async (id: number) => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  create: async (data: OrderCreate) => {
    return apiClient.post<OrderCreate, Order>('/orders', data);
  },

  update: async (id: number, data: OrderUpdate) => {
    return apiClient.put<OrderUpdate, Order>(`/orders/${id}`, data);
  },

  delete: async (id: number) => {
    return apiClient.delete<Order>(`/orders/${id}`);
  },

  getTotal: async (id: number) => {
    return apiClient.get<number>(`/orders/${id}/total`);
  },

  // --- Order Items ---
  getItems: async (orderId: number) => {
    return apiClient.get<OrderItem[]>('/orders/items', { 
      params: { order_id: orderId } 
    });
  },

  addItem: async (data: OrderItemCreate) => {
    return apiClient.post<OrderItemCreate, OrderItem>('/orders/items/', data);
  },
  
  deleteItem: async (itemId: number) => {
    return apiClient.delete<OrderItem>(`/orders/items/${itemId}`);
  }
};
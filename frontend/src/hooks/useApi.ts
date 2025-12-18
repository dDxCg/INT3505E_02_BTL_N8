import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  tablesApi,
  dishesApi,
  tagsApi,
  ordersApi,
  orderItemsApi,
  orderStatusesApi,
  orderItemStatusesApi,
  paymentsApi,
  feedbacksApi,
} from '../api/services';
import type {
  OrderCreate,
  OrderUpdate,
  OrderItemCreate,
  OrderItemUpdate,
  PaymentCreate,
  FeedbackCreate,
  OrderFilter,
  OrderItemFilter,
  DishFilter,
  OrderRead,
  OrderItemRead,
} from '../types';

// ============================================
// Tables Hooks
// ============================================
export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await tablesApi.getAll();
      return response.data;
    },
  });
};

export const useTable = (id: number) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: async () => {
      const response = await tablesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// ============================================
// Dishes Hooks
// ============================================
export const useDishes = (filters?: DishFilter) => {
  return useQuery({
    queryKey: ['dishes', filters],
    queryFn: async () => {
      const response = await dishesApi.getAll(filters);
      return response.data;
    },
  });
};

export const useDish = (id: number) => {
  return useQuery({
    queryKey: ['dishes', id],
    queryFn: async () => {
      const response = await dishesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// ============================================
// Tags Hooks
// ============================================
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await tagsApi.getAll();
      return response.data;
    },
  });
};

export const useTag = (id: number) => {
  return useQuery({
    queryKey: ['tags', id],
    queryFn: async () => {
      const response = await tagsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// ============================================
// Orders Hooks
// ============================================
export const useOrders = (
  filters?: OrderFilter,
  options?: Omit<UseQueryOptions<OrderRead[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const response = await ordersApi.getAll(filters);
      return response.data;
    },
    ...options,
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await ordersApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useOrderTotal = (id: number) => {
  return useQuery({
    queryKey: ['orders', id, 'total'],
    queryFn: async () => {
      const response = await ordersApi.getTotal(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreate) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderUpdate }) =>
      ordersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

// ============================================
// Order Items Hooks
// ============================================
export const useOrderItems = (
  filters?: OrderItemFilter,
  options?: Omit<UseQueryOptions<OrderItemRead[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['orderItems', filters],
    queryFn: async () => {
      const response = await orderItemsApi.getAll(filters);
      return response.data;
    },
    ...options,
  });
};

export const useOrderItem = (id: number) => {
  return useQuery({
    queryKey: ['orderItems', id],
    queryFn: async () => {
      const response = await orderItemsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderItemCreate) => orderItemsApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidate all order items queries to ensure the new item appears
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
      // Invalidate the specific order to update its total/status
      queryClient.invalidateQueries({
        queryKey: ['orders', variables.order_id],
      });
      // Invalidate all orders to ensure any listing pages are updated
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderItemUpdate }) =>
      orderItemsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
      queryClient.invalidateQueries({ queryKey: ['orderItems', variables.id] });
    },
  });
};

export const useDeleteOrderItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// ============================================
// Order Statuses Hooks
// ============================================
export const useOrderStatuses = () => {
  return useQuery({
    queryKey: ['orderStatuses'],
    queryFn: async () => {
      const response = await orderStatusesApi.getAll();
      return response.data;
    },
  });
};

// ============================================
// Order Item Statuses Hooks
// ============================================
export const useOrderItemStatuses = () => {
  return useQuery({
    queryKey: ['orderItemStatuses'],
    queryFn: async () => {
      const response = await orderItemStatusesApi.getAll();
      return response.data;
    },
  });
};

// ============================================
// Payments Hooks
// ============================================
export const usePayments = (filters?: { booking_id?: number; status_id?: number }) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const response = await paymentsApi.getAll(filters);
      return response.data;
    },
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentCreate) => paymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

// ============================================
// Feedbacks Hooks
// ============================================
export const useFeedbacks = (filters?: { order_id?: number }) => {
  return useQuery({
    queryKey: ['feedbacks', filters],
    queryFn: async () => {
      const response = await feedbacksApi.getAll(filters);
      return response.data;
    },
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeedbackCreate) => feedbacksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });
};

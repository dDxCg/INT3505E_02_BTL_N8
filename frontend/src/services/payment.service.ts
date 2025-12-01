import apiClient from '@/lib/api-client';
import type { Payment, PaymentCreate, PaymentRefund } from '@/types/schema';

export const PaymentService = {
  getAll: async (bookingId?: number) => {
    return apiClient.get<Payment[]>('/payments', {
      params: { booking_id: bookingId }
    });
  },

  create: async (data: PaymentCreate) => {
    return apiClient.post<PaymentCreate, Payment>('/payments', data);
  },

  refund: async (paymentId: number, amount?: number) => {
    return apiClient.post<PaymentRefund, Payment>(`/payments/${paymentId}/refund`, { amount });
  }
};
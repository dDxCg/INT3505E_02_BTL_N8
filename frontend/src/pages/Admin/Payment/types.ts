export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  method_id: number;
  provider_id: number;
  status_id: number;
  paid_at: string | null;
  qr_url: string | null;
  provider_transaction_id: string | null;
}

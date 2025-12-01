// src/types/schema.d.ts

// --- COMMON ---
export interface BaseFilter {
    [key: string]: string | number | boolean | null | undefined;
  }
  
  // --- ORDERS ---
  export interface Order {
    id: number;
    table_id: number;
    status_id: number;
    guest_id: number | null;
  }
  
  export interface OrderCreate {
    table_id: number;
    guest_id?: number | null;
    status_id?: number; // Default = 1 (pending)
  }
  
  export interface OrderUpdate {
    status_id?: number;
    guest_id?: number;
  }
  
  // --- ORDER ITEMS ---
  export interface OrderItem {
    id: number;
    order_id: number;
    dish_id: number;
    status_id: number;
    quantity: number;
    // Relations (nếu backend trả về nested object)
    dish?: Dish;
    status?: { id: number; status: string };
  }
  
  export interface OrderItemCreate {
    order_id: number;
    dish_id: number;
    quantity: number;
    status_id: number;
  }
  
  // --- PAYMENTS ---
  export interface Payment {
    id: number;
    booking_id: number;
    amount: number;
    currency: string;
    method_id: number;
    provider_id: number;
    status_id: number;
    paid_at: string | null;
    qr_url?: string;
  }
  
  export interface PaymentCreate {
    booking_id: number;
    currency: string;
    amount: number;
    method_id: number;
    provider_id: number;
  }

  export interface PaymentRefund {
    amount?: number;
  }
  
  // --- RESOURCES (Dishes, Tables...) ---
  export interface Dish {
    id: number;
    name: string;
    price: number;
    description: string | null;
  }
  
  export interface Table {
    id: number;
    number: number;
    seats: number;
  }

  export interface Ingredient {
    id: number;
    name: string;
    unit_id: number;
    quantity: number;
    threshold: number;
  }
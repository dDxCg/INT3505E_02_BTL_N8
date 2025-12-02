// ============================================
// Core Types from Backend Models
// ============================================

// Table
export interface Table {
  id: number;
  number: number;
  seats: number;
}

// Dish
export interface Dish {
  id: number;
  name: string;
  price: string; // Numeric in backend, string for precision
  description?: string;
}

// Order Status
export interface OrderStatus {
  id: number;
  status: string;
}

// Order
export interface Order {
  id: number;
  table_id: number;
  status_id: number;
  guest_id?: number;
}

// OrderItem Status
export interface OrderItemStatus {
  id: number;
  status: string;
}

// OrderItem
export interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number;
  quantity: number;
  status_id: number;
}

// Guest
export interface Guest {
  id: number;
  name: string;
  cointact_info?: string;
}

// Payment Method
export interface PaymentMethod {
  id: number;
  name: string;
}

// Payment Provider
export interface PaymentProvider {
  id: number;
  name: string;
}

// Payment Status
export interface PaymentStatus {
  id: number;
  status: string;
}

// Payment
export interface Payment {
  id: number;
  booking_id: number;
  currency: string;
  amount: string;
  method_id: number;
  provider_id: number;
  provider_transaction_id: string;
  paid_at: string;
  status_id: number;
}

// Feedback
export interface Feedback {
  id: number;
  order_id?: number;
  comment: string;
  rating?: number;
  created_at: string;
}

// ============================================
// Extended/Populated Types (with relations)
// ============================================

export interface OrderItemRead extends OrderItem {
  dish: Dish;
  status: OrderItemStatus;
}

export interface OrderRead extends Order {
  table?: Table;
  status?: OrderStatus;
  guest?: Guest;
  items?: OrderItemRead[];
}

export interface TableWithOrder extends Table {
  orders?: Order[];
}

// ============================================
// Create/Update Schemas
// ============================================

export interface TableCreate {
  number: number;
  seats: number;
}

export interface TableUpdate {
  number?: number;
  seats?: number;
}

export interface DishCreate {
  name: string;
  price: string;
  description?: string;
}

export interface DishUpdate {
  name?: string;
  price?: string;
  description?: string;
}

export interface OrderCreate {
  table_id: number;
  status_id?: number;
  guest_id?: number;
}

export interface OrderUpdate {
  status_id?: number;
  guest_id?: number;
}

export interface OrderItemCreate {
  order_id: number;
  dish_id: number;
  quantity: number;
  status_id?: number;
}

export interface OrderItemUpdate {
  quantity?: number;
  status_id?: number;
}

export interface PaymentCreate {
  booking_id: number;
  currency: string;
  amount: string;
  method_id: number;
  provider_id: number;
  provider_transaction_id: string;
  status_id: number;
}

export interface FeedbackCreate {
  order_id?: number;
  comment: string;
  rating?: number;
}

// ============================================
// Filter Types
// ============================================

export interface TableFilter {
  number?: number;
  seats?: number;
}

export interface DishFilter {
  name?: string;
  min_price?: string;
  max_price?: string;
}

export interface OrderFilter {
  table_id?: number;
  status_id?: number;
  guest_id?: number;
}

export interface OrderItemFilter {
  order_id?: number;
  dish_id?: number;
  status_id?: number;
}

// ============================================
// Client-side Types (Zustand Cart)
// ============================================

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// ============================================
// UI Helper Types
// ============================================

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface TableWithStatus extends Table {
  status: TableStatus;
  currentOrder?: OrderRead;
}

// For Staff Dashboard
export interface TableDashboardItem extends TableWithStatus {
  totalAmount?: number;
  itemCount?: number;
}

/**
 * TypeScript Interfaces khớp 100% với Backend Pydantic Schemas
 * Dựa trên backend-specs.txt
 */

// ============================================
// TABLE SCHEMAS
// ============================================

export interface TableCreate {
  number: number;
  seats: number;
}

export interface TableUpdate {
  number?: number;
  seats?: number;
}

export interface TableFilter {
  number?: number;
  seats?: number;
}

export interface TableRead {
  id: number;
  number: number;
  seats: number;
}

// ============================================
// DISH SCHEMAS
// ============================================

export interface DishCreate {
  name: string;
  price: number; // Backend uses Decimal, Frontend uses number
  description?: string | null;
}

export interface DishUpdate {
  name?: string | null;
  price?: number | null;
  description?: string | null;
}

export interface DishFilter {
  name?: string | null;
  price?: number | null;
  description?: string | null;
}

export interface DishRead {
  id: number;
  name: string;
  price: number; // Backend Decimal -> Frontend number
  description?: string | null;
}

// ============================================
// ORDER STATUS SCHEMAS
// ============================================

export interface OrderStatusCreate {
  status: string;
}

export interface OrderStatusUpdate {
  status?: string | null;
}

export interface OrderStatusFilter {
  status?: string | null;
}

export interface OrderStatusRead {
  id: number;
  status: string;
}

// ============================================
// ORDER SCHEMAS
// ============================================

export interface OrderCreate {
  table_id: number;
  guest_id?: number | null;
  status_id?: number | null; // Default = 1 (pending) on backend
}

export interface OrderUpdate {
  status_id?: number | null;
  guest_id?: number | null;
}

export interface OrderFilter {
  table_id?: number | null;
  status_id?: number | null;
  guest_id?: number | null;
}

export interface OrderRead {
  id: number;
  table_id: number;
  status_id: number;
  guest_id?: number | null;
}

// ============================================
// ORDER ITEM STATUS SCHEMAS
// ============================================

export interface OrderItemStatusCreate {
  status: string;
}

export interface OrderItemStatusUpdate {
  status?: string | null;
}

export interface OrderItemStatusFilter {
  status?: string | null;
}

export interface OrderItemStatusRead {
  id: number;
  status: string;
}

// ============================================
// ORDER ITEM SCHEMAS
// ============================================

export interface OrderItemBase {
  id: number;
  order_id: number;
  dish_id: number;
  status_id: number; // IMPORTANT: status_id field present
  quantity: number;
}

export interface OrderItemCreate {
  order_id: number;
  dish_id: number;
  quantity: number; // Must be > 0
  status_id: number; // REQUIRED
}

export interface OrderItemUpdate {
  order_id?: number | null;
  dish_id?: number | null;
  quantity?: number | null; // Must be > 0 if provided
  status_id?: number | null;
}

export interface OrderItemFilter {
  order_id?: number | null;
  dish_id?: number | null;
  quantity?: number | null;
  status_id?: number | null;
}

export interface OrderItemRead extends OrderItemBase {
  dish: DishRead;
  status: OrderItemStatusRead;
}

// ============================================
// FEEDBACK SCHEMAS
// ============================================

export interface FeedbackCreate {
  order_id: number;
  comment: string;
  rating: number; // 1-5
}

export interface FeedbackUpdate {
  order_id?: number | null;
  comment?: string | null;
  rating?: number | null; // 1-5
}

export interface FeedbackFilter {
  order_id?: number | null;
  comment?: string | null;
  rating?: number | null;
}

export interface FeedbackRead {
  id: number;
  order_id?: number | null;
  comment: string;
  rating?: number | null;
  created_at: string; // ISO datetime string
}

// ============================================
// GUEST SCHEMA (from models)
// ============================================

export interface GuestRead {
  id: number;
  name: string;
  cointact_info?: string | null; // Note: typo in backend "cointact"
}

// ============================================
// EXTENDED TYPES FOR FRONTEND USE
// ============================================

export interface OrderWithItems extends OrderRead {
  items?: OrderItemRead[];
}

export interface TableWithStatus extends TableRead {
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: OrderWithItems;
}

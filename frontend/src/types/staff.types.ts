// Staff Types - Migrated from reference constants

export interface PopularDish {
  id: number;
  image: string;
  name: string;
  numberOfOrders: number;
}

export interface Table {
  id: number;
  name: string;
  status: "Booked" | "Available";
  initial?: string;
  seats: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  bgColor: string;
  icon: string;
  items: MenuItem[];
}

export interface MetricData {
  title: string;
  value: string;
  percentage: string;
  color: string;
  isIncrease?: boolean;
}

export interface ItemData {
  title: string;
  value: string;
  percentage?: string;
  color: string;
  isIncrease?: boolean;
}

export interface Order {
  id: string;
  customer: string;
  status: "Ready" | "In Progress";
  dateTime: string;
  items: number;
  tableNo: number;
  total: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  guests: number;
}

export interface CartItem {
  id: number;
  dish_id?: number; // Original dish ID from API for order creation
  name: string;
  pricePerQuantity: number;
  quantity: number;
  price: number;
}

export interface CustomerState {
  orderId: string;
  customerName: string;
  customerPhone: string;
  guests: number;
  table: {
    tableId: number;
    tableNo: string;
  } | null;
}

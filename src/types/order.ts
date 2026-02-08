import { Food } from "./food";
import { Table } from "./table";

export type OrderStatus = "open" | "closed";

export interface OrderItem {
  id: number;
  food_id: number;
  food: Food;
  quantity: number;
  price_at_time: number;
  subtotal: number;
}

export interface Cashier {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  table_id: number;
  table: Table;
  user_id: number;
  cashier: Cashier;
  order_items: OrderItem[];
  total_price: number;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderPayload {
  table_id: number;
  items?: {
    food_id: number;
    quantity: number;
  }[];
}

export interface AddItemsPayload {
  items: {
    food_id: number;
    quantity: number;
  }[];
}

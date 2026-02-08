import { Order } from "./order";

export type TableStatus = "available" | "occupied" | "reserved" | "inactive";

export interface Table {
  id: number;
  table_name: string;
  status: TableStatus;
  capacity: number;
  orders?: Order[];
  created_at?: string;
  updated_at?: string;
}

export interface TableStats {
  available: number;
  occupied: number;
  reserved: number;
  inactive: number;
  total: number;
}

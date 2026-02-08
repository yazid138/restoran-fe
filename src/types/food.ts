export type FoodCategory = "appetizer" | "main_course" | "dessert" | "beverage";

export interface Food {
  id: number;
  name: string;
  category: FoodCategory;
  price: number;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFoodPayload {
  name: string;
  category: FoodCategory;
  price: number;
  image?: string;
}

export interface UpdateFoodPayload {
  name?: string;
  category?: FoodCategory;
  price?: number;
  image?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  expiration_date: string | null;
  container_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Container {
  id: number;
  name: string;
  foods: FoodItem[];
  created_at?: string;
  updated_at?: string;
}

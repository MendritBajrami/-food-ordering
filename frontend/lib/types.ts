export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  ingredients?: string[];
  created_at: string;
}

export interface CartItem {
  /** Unique line key: product id + removed ingredients combination */
  key: string;
  product: Product;
  quantity: number;
  removedIngredients?: string[];
}

export interface User {
  id: number;
  name: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price_at_purchase: number;
  removed_ingredients?: string[];
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  delivery_type: 'delivery' | 'pickup';
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'rejected';
  rejection_reason?: string;

  total_price: number;
  items: OrderItem[];
  created_at: string;
}

export interface CreateOrderData {
  customer_name: string;
  phone: string;
  address?: string;
  delivery_type: 'delivery' | 'pickup';
  items: { product_id: number; quantity: number; removed_ingredients?: string[] }[];
}

export type Category = 'all' | 'burgers' | 'fries' | 'drinks' | 'combos' | 'desserts';
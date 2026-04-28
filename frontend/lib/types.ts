export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
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
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  delivery_type: 'delivery' | 'pickup';
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  total_price: number;
  items: OrderItem[];
  created_at: string;
}

export interface CreateOrderData {
  customer_name: string;
  phone: string;
  address?: string;
  delivery_type: 'delivery' | 'pickup';
  items: { product_id: number; quantity: number }[];
}

export type Category = 'all' | 'burgers' | 'fries' | 'drinks' | 'combos' | 'desserts';
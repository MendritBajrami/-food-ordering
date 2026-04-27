import { Order, Product, User, CreateOrderData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export const api = {
  auth: {
    register: (data: { name: string; phone: string; password: string; address?: string }) =>
      apiRequest<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { phone: string; password: string }) =>
      apiRequest<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: (token: string) =>
      apiRequest<{ user: User }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  },
  products: {
    getAll: (category?: string) =>
      apiRequest<{ products: Product[] }>(`/products${category ? `?category=${category}` : ''}`),
    getById: (id: number) =>
      apiRequest<{ product: Product }>(`/products/${id}`),
    create: (data: Partial<Product>, token: string) =>
      apiRequest<{ product: Product }>('/products', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
    update: (id: number, data: Partial<Product>, token: string) =>
      apiRequest<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
  },
  orders: {
    create: (data: CreateOrderData) =>
      apiRequest<{ order: Order }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (token: string) =>
      apiRequest<{ orders: Order[] }>('/orders', { headers: { Authorization: `Bearer ${token}` } }),
    getById: (id: number, token: string) =>
      apiRequest<{ order: Order }>(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
    updateStatus: (id: number, status: string, token: string) =>
      apiRequest<{ order: Order }>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { Authorization: `Bearer ${token}` } }),
    getStats: (token: string) =>
      apiRequest<{ stats: { total_orders: number; total_revenue: number } }>('/orders/stats', { headers: { Authorization: `Bearer ${token}` } }),
  },
};

export default api;
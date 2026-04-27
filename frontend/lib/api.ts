import { Order, Product, User, CreateOrderData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('food-ordering-auth') : null;
  let token = null;
  if (stored) {
    try {
      token = JSON.parse(stored).token;
    } catch (e) {}
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response (${response.status}). The backend might be down or misconfigured.`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (data: { name: string; phone: string; password: string; address?: string }) =>
      apiRequest<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { phone: string; password: string }) =>
      apiRequest<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () =>
      apiRequest<{ user: User }>('/auth/me'),
  },
  products: {
    getAll: (category?: string) =>
      apiRequest<{ products: Product[] }>(`/products${category ? `?category=${category}` : ''}`),
    getById: (id: number) =>
      apiRequest<{ product: Product }>(`/products/${id}`),
    create: (data: Partial<Product>) =>
      apiRequest<{ product: Product }>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Product>) =>
      apiRequest<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  orders: {
    create: (data: CreateOrderData) =>
      apiRequest<{ order: Order }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () =>
      apiRequest<{ orders: Order[] }>('/orders'),
    getMyOrders: () =>
      apiRequest<{ orders: Order[] }>('/orders/my'),
    getById: (id: number) =>
      apiRequest<{ order: Order }>(`/orders/${id}`),
    updateStatus: (id: number, status: string) =>
      apiRequest<{ order: Order }>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getStats: () =>
      apiRequest<{ stats: { total_orders: number; total_revenue: number } }>('/orders/stats'),
  },
};

export default api;
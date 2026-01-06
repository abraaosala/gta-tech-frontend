export type Role = 'ADMIN' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // Only for mock logic
}

export interface Customer {
  id: string;
  name: string;
  nif?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  imei?: string;
}

export interface Meta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  sellerId: string;
  sellerName: string;
  customerId?: string;
  customerName?: string; // Optional, returned from backend if expanded
  customerNif?: string;
  total: number;
  paymentMethod?: string;
  date: string;
  items: CartItem[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
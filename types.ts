export type Role = 'ADMIN' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // Only for mock logic
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  sellerId: string;
  sellerName: string;
  total: number;
  paymentMethod?: string;
  date: string;
  items: CartItem[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
import { User, Product, Sale } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS } from '../constants';

const DELAY_MS = 600;

const getStorage = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const delay = () => new Promise((resolve) => setTimeout(resolve, DELAY_MS));

export const MockApi = {
  login: async (email: string, password: string): Promise<User> => {
    await delay();
    const users = getStorage<User[]>('gta_users', INITIAL_USERS);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciais inválidas');
    const { password: _, ...userWithoutPass } = user;
    return userWithoutPass;
  },

  getUsers: async (): Promise<User[]> => {
    await delay();
    return getStorage<User[]>('gta_users', INITIAL_USERS);
  },

  saveUser: async (user: User): Promise<User> => {
    await delay();
    const users = getStorage<User[]>('gta_users', INITIAL_USERS);
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push({ ...user, id: Math.random().toString(36).substr(2, 9) });
    }
    setStorage('gta_users', users);
    return user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await delay();
    const users = getStorage<User[]>('gta_users', INITIAL_USERS);
    setStorage('gta_users', users.filter((u) => u.id !== id));
  },

  getProducts: async (): Promise<Product[]> => {
    await delay();
    return getStorage<Product[]>('gta_products', INITIAL_PRODUCTS);
  },

  saveProduct: async (product: Product): Promise<Product> => {
    await delay();
    const products = getStorage<Product[]>('gta_products', INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push({ ...product, id: Math.random().toString(36).substr(2, 9) });
    }
    setStorage('gta_products', products);
    return product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay();
    const products = getStorage<Product[]>('gta_products', INITIAL_PRODUCTS);
    setStorage('gta_products', products.filter((p) => p.id !== id));
  },

  getSales: async (): Promise<Sale[]> => {
    await delay();
    return getStorage<Sale[]>('gta_sales', []);
  },

  createSale: async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
    await delay();
    const sales = getStorage<Sale[]>('gta_sales', []);
    const newSale: Sale = {
      ...sale,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    sales.push(newSale);
    setStorage('gta_sales', sales);

    // Update stock
    const products = getStorage<Product[]>('gta_products', INITIAL_PRODUCTS);
    newSale.items.forEach((item) => {
      const prodIndex = products.findIndex((p) => p.id === item.id);
      if (prodIndex >= 0) {
        products[prodIndex].stock -= item.quantity;
      }
    });
    setStorage('gta_products', products);

    return newSale;
  },
};

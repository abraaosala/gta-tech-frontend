import { Product, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Administrador Principal',
    email: 'admin@gtatech.com',
    role: 'ADMIN',
    password: '123',
  },
  {
    id: '2',
    name: 'João Vendedor',
    email: 'vendedor@gtatech.com',
    role: 'SELLER',
    password: '123',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '101',
    name: 'Smartphone X Pro',
    description: 'Última geração, 256GB',
    price: 3500.00,
    stock: 15,
    category: 'Eletrônicos',
    imageUrl: 'https://picsum.photos/200/200?random=1',
  },
  {
    id: '102',
    name: 'Notebook Gamer GTA',
    description: 'i7 12th Gen, RTX 3060',
    price: 7800.00,
    stock: 5,
    category: 'Computadores',
    imageUrl: 'https://picsum.photos/200/200?random=2',
  },
  {
    id: '103',
    name: 'Fone Bluetooth NoiseCancel',
    description: 'Isolamento acústico ativo',
    price: 450.00,
    stock: 30,
    category: 'Acessórios',
    imageUrl: 'https://picsum.photos/200/200?random=3',
  },
  {
    id: '104',
    name: 'Monitor 4K 27"',
    description: 'IPS, 144Hz',
    price: 2200.00,
    stock: 8,
    category: 'Periféricos',
    imageUrl: 'https://picsum.photos/200/200?random=4',
  },
  {
    id: '105',
    name: 'Teclado Mecânico RGB',
    description: 'Switch Blue',
    price: 350.00,
    stock: 20,
    category: 'Periféricos',
    imageUrl: 'https://picsum.photos/200/200?random=5',
  },
];

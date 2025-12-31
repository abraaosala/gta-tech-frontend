import { api } from './api';
import { Sale } from '../types';

export const saleService = {
    async getSales(): Promise<Sale[]> {
        const response = await api.get('/sales');
        return response.data;
    },

    async createSale(saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> {
        const response = await api.post('/sales', saleData);
        return response.data;
    }
};

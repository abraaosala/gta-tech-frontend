import { api } from './api';
import { Customer } from '../types';

export const customerService = {
    async searchCustomers(query: string = ''): Promise<Customer[]> {
        const response = await api.get(`/customers?q=${query}`);
        return response.data;
    },

    async createCustomer(customer: Partial<Customer>): Promise<Customer> {
        const response = await api.post('/customers', customer);
        return response.data;
    },

    async getCustomers(): Promise<Customer[]> {
        const response = await api.get('/customers');
        return response.data;
    }
};

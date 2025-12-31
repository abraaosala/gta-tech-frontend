import { api } from './api';

export interface Category {
    id: string;
    name: string;
}

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        const response = await api.get('/categories');
        return response.data.data || response.data;
    }
};

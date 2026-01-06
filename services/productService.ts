import { api } from './api';
import { Product } from '../types';

// Transform backend product to frontend format
const transformFromBackend = (backendProduct: any): Product => {
    return {
        id: backendProduct.id,
        name: backendProduct.name,
        description: backendProduct.description || '',
        price: backendProduct.price_in_cents / 100,
        stock: backendProduct.stock,
        category: backendProduct.category?.name || backendProduct.category || '',
        imageUrl: backendProduct.image_url,
        imei: backendProduct.imei
    };
};

// Transform frontend product to backend format
const transformToBackend = (product: Product, isNew: boolean = false): any => {
    const data: any = {
        name: product.name,
        description: product.description,
        price_in_cents: Math.round(product.price * 100),
        stock: product.stock,
        category_id: product.category,
        image_url: product.imageUrl,
        imei: product.imei
    };

    // Only include ID for updates, not for new products
    if (!isNew && product.id) {
        data.id = product.id;
    }

    return data;
};

export const productService = {
    async getProducts(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Product>> {
        const response = await api.get(`/products?page=${page}&per_page=${perPage}`);

        // Handle both paginated and non-paginated responses for backward compatibility if needed
        const rawData = response.data;

        if (rawData.data && Array.isArray(rawData.data) && rawData.meta) {
            return {
                data: rawData.data.map(transformFromBackend),
                meta: rawData.meta
            };
        } else {
            // Fallback for simple array response
            const arrayData = Array.isArray(rawData.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);
            return {
                data: arrayData.map(transformFromBackend),
                meta: { page: 1, per_page: arrayData.length, total: arrayData.length, last_page: 1 }
            }
        }
    },

    async saveProduct(product: Product): Promise<Product> {
        const isNew = !product.id;
        const backendData = transformToBackend(product, isNew);

        if (!isNew) {
            const response = await api.put(`/products/${product.id}`, backendData);
            return transformFromBackend(response.data.data || response.data);
        } else {
            const response = await api.post('/products', backendData);
            return transformFromBackend(response.data.data || response.data);
        }
    },

    async deleteProduct(id: string): Promise<void> {
        await api.delete(`/products/${id}`);
    }
};

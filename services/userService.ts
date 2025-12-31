import { api } from './api';
import { User } from '../types';

export const userService = {
    async getUsers(): Promise<User[]> {
        const response = await api.get('/users');
        // Backend returns { success: true, data: [...] }
        return response.data.data || response.data;
    },

    async saveUser(user: User): Promise<User> {
        // Don't send ID for new users
        const userData = { ...user };
        const isNew = !user.id;

        if (isNew) {
            delete userData.id;
        }

        if (user.id) {
            const response = await api.put(`/users/${user.id}`, userData);
            return response.data.data || response.data;
        } else {
            const response = await api.post('/users', userData);
            return response.data.data || response.data;
        }
    },

    async deleteUser(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    }
};

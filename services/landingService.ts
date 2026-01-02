import { api } from './api';

export interface LandingSetting {
    key: string;
    value: string;
    label: string;
    type: string;
}

export interface LandingContact {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: string;
}

export const landingService = {
    getSettings: async () => {
        const response = await api.get<LandingSetting[]>('/admin/landing/settings');
        return response.data;
    },

    updateSetting: async (key: string, value: string) => {
        const response = await api.post('/admin/landing/settings', { key, value });
        return response.data;
    },

    getContacts: async () => {
        const response = await api.get<LandingContact[]>('/admin/landing/contacts');
        return response.data;
    },

    deleteContact: async (id: string) => {
        const response = await api.delete(`/admin/landing/contacts/${id}`);
        return response.data;
    }
};

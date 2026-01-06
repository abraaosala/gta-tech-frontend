import { api } from './api';

export interface SiteSettings {
    [key: string]: string;
}

export const settingsService = {
    async getPublicSettings(): Promise<SiteSettings> {
        const response = await api.get('/public/settings');
        // The controller returns { success: true, data: { key: value } }
        return response.data;
    }
};

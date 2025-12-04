import api from '@/lib/axios';
import type { User } from '@/types';

interface LoginResponse {
    user: User;
    access_token: string;
}

export const authService = {
    async login(credentials: any): Promise<LoginResponse> {
        const response = await api.post('/login', credentials);
        return response.data;
    },

    async register(data: any): Promise<LoginResponse> {
        const response = await api.post('/register', data);
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/logout');
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get('/user');
        return response.data;
    }
};

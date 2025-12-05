import api from '@/lib/axios';
import type { User } from '@/types';

export const userService = {
    async getUser(identifier: string | number): Promise<User> {
        const response = await api.get(`/users/${identifier}`);
        return response.data;
    },

    async followUser(id: number, type: 'follow' | 'shadow' = 'shadow'): Promise<void> {
        await api.post(`/users/${id}/follow`, { type });
    },

    async unfollowUser(id: number): Promise<void> {
        await api.post(`/users/${id}/unfollow`);
    },

    async getSuggestedUsers(): Promise<User[]> {
        const response = await api.get('/users/suggested');
        return response.data;
    },

    async searchUsers(query: string): Promise<User[]> {
        const response = await api.get(`/users/search?q=${query}`);
        return response.data;
    },

    async updateProfile(data: FormData): Promise<User> {
        const response = await api.post('/user/profile', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.user;
    }
};

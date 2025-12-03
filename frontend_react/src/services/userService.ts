import api from '@/lib/axios';
import type { User } from '@/types';

export const userService = {
    async getUser(id: number): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    async followUser(id: number): Promise<void> {
        await api.post(`/users/${id}/follow`);
    },

    async unfollowUser(id: number): Promise<void> {
        await api.post(`/users/${id}/unfollow`);
    },

    async getSuggestedUsers(): Promise<User[]> {
        const response = await api.get('/users/suggested');
        return response.data;
    }
};

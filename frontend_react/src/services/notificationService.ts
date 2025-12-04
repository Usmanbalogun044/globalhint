import api from '@/lib/axios';
import type { Notification } from '@/types/notification';

export const notificationService = {
    async getNotifications(page = 1): Promise<{ data: Notification[], next_page_url: string | null }> {
        const response = await api.get(`/notifications?page=${page}`);
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get('/notifications/unread-count');
        return response.data.count;
    },

    async markAsRead(id: string): Promise<void> {
        await api.post(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.post('/notifications/read-all');
    },
};

import api from '@/lib/axios';
import type { User } from '@/types';

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio';
    media_url?: string;
    read_at?: string;
    created_at: string;
    sender?: User;
    receiver?: User;
}

export const messageService = {
    async getMessages(userId: number): Promise<Message[]> {
        const response = await api.get(`/messages/${userId}`);
        return response.data;
    },

    async getConversations(): Promise<User[]> {
        const response = await api.get('/messages/conversations');
        return response.data;
    },

    async sendMessage(receiverId: number, content: string, type: 'text' | 'image' | 'video' | 'audio' = 'text', media?: File): Promise<Message> {
        const formData = new FormData();
        formData.append('receiver_id', receiverId.toString());
        if (content) formData.append('content', content);
        formData.append('type', type);
        if (media) {
            formData.append('media', media);
        }

        const response = await api.post(`/messages/${receiverId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async markAsRead(messageId: number): Promise<void> {
        await api.post(`/messages/${messageId}/read`);
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get('/messages/unread-count');
        return response.data.count;
    },

    async markConversationAsRead(senderId: number): Promise<void> {
        await api.post(`/messages/${senderId}/read-conversation`);
    }
};

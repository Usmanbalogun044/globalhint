import api from '@/lib/axios';
import type { Post } from '@/types';

export const postService = {
    async getPosts(country?: string): Promise<Post[]> {
        const url = country ? `/posts?country=${country}` : '/posts';
        const response = await api.get(url);
        // Handle Laravel pagination response
        return response.data.data || response.data;
    },

    async getUserPosts(userId: number): Promise<Post[]> {
        const response = await api.get(`/posts?user_id=${userId}`);
        return response.data.data || response.data;
    },

    async getTrendingCountries(): Promise<{ country: string, count: number }[]> {
        const response = await api.get('/countries/trending'); // Assuming route is set up or use PostController method route
        return response.data;
    },

    async createPost(content: string, type: 'text' | 'image' | 'video' = 'text', mediaUrl?: string): Promise<Post> {
        const response = await api.post('/posts', {
            content,
            type,
            media_url: mediaUrl
        });
        return response.data;
    },

    async votePost(postId: number, type: 'up' | 'down'): Promise<any> {
        const response = await api.post(`/posts/${postId}/vote`, { type });
        return response.data;
    }
};

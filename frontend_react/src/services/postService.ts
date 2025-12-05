import api from '@/lib/axios';
import type { Post } from '@/types';

export const postService = {
    async getPosts(country?: string, category?: string): Promise<Post[]> {
        const params = new URLSearchParams();
        if (country) params.append('country', country);
        if (category && category !== 'All') params.append('category', category);
        
        const response = await api.get(`/posts?${params.toString()}`);
        return response.data.data || response.data;
    },

    async getUserPosts(userId: number): Promise<Post[]> {
        const response = await api.get(`/posts?user_id=${userId}`);
        return response.data.data || response.data;
    },

    async getTrendingCountries(): Promise<{ country: string; count: number }[]> {
        const response = await api.get('/countries/trending');
        return response.data;
    },

    async getCategories(): Promise<{ id: number; name: string; slug: string }[]> {
        const response = await api.get('/categories');
        return response.data;
    },

    async createPost(
        content: string,
        type: 'text' | 'image' | 'video' | 'audio' | 'music' = 'text',
        media?: File,
        categories: string[] = []
    ): Promise<Post> {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('type', type);
        
        // Append categories as array
        categories.forEach(cat => formData.append('categories[]', cat));
        
        if (media) {
            formData.append('media', media);
        }
        const response = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async votePost(postId: number, type: 'up' | 'down'): Promise<any> {
        const response = await api.post(`/posts/${postId}/vote`, { type });
        return response.data;
    },
};

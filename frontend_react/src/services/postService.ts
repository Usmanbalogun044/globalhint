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

    async createPost(content: string, type: 'text' | 'image' | 'video' | 'audio' | 'music' = 'text', media?: File, category: string = 'General'): Promise<Post> {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('type', type);
        formData.append('category', category);
        if (media) {
            formData.append('media', media);
        }

        const response = await api.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async votePost(postId: number, type: 'up' | 'down'): Promise<any> {
        const response = await api.post(`/posts/${postId}/vote`, { type });
        return response.data;
    }
};

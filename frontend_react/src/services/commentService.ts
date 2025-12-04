import api from '@/lib/axios';

export interface Comment {
    id: number;
    user_id: number;
    post_id: number;
    parent_id: number | null;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
    };
    replies?: Comment[];
}

export const commentService = {
    async getComments(postId: number): Promise<Comment[]> {
        const response = await api.get(`/posts/${postId}/comments`);
        return response.data;
    },

    async createComment(postId: number, content: string, parentId?: number): Promise<Comment> {
        const response = await api.post(`/posts/${postId}/comments`, {
            content,
            parent_id: parentId,
        });
        return response.data;
    },

    async deleteComment(commentId: number): Promise<void> {
        await api.delete(`/comments/${commentId}`);
    },
};

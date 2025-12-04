export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    cover_url?: string;
    bio?: string;
    location?: string;
    country?: string;
    website?: string;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
    created_at: string;
    last_message?: {
        content: string;
        type: string;
        created_at: string;
        sender_id: number;
    };
}

export interface Post {
    id: number;
    user_id: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'live' | 'audio' | 'music';
    media_url?: string;
    category?: string;
    category_id?: number;
    votes_count: number;
    comments_count?: number;
    created_at: string;
    user: User;
    media_metadata?: any;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkAuth: () => boolean;
}

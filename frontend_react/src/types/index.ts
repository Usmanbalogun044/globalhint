export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    cover_url?: string;
    bio?: string;
    location?: string;
    website?: string;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
    created_at: string;
}

export interface Post {
    id: number;
    user_id: number;
    content: string;
    type: 'text' | 'image' | 'video' | 'live';
    media_url?: string;
    category_id?: number;
    votes_count: number;
    created_at: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkAuth: () => boolean;
}

export interface Profile {
    id: number;
    user_id: number;
    display_name?: string;
    birth_date?: string;
    gender?: string;
    pronouns?: string;
    website_url?: string;
    banner_url?: string;
    profile_theme?: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    facebook_url?: string;
    github_url?: string;
    dribbble_url?: string;
    behance_url?: string;
    snapchat_url?: string;
    discord_url?: string;
    telegram_url?: string;
    whatsapp_number?: string;
    is_verified: boolean;
    verified_at?: string;
    verification_type?: string;
    is_business_account: boolean;
    is_private: boolean;
    visibility: string;
    safety_score: number;
    badges?: string[];
    role_tags?: string[];
    interests?: string[];
    topics_followed?: string[];
    language_preference: string;
    profile_view_count: number;
    profile_engagement_score: number;
    last_seen_at?: string;
    is_premium: boolean;
    premium_since?: string;
    payout_enabled: boolean;
    allow_messages_from: string;
    allow_mentions_from: string;
    block_suggestions: boolean;
    muted_words?: string[];
    email_public: boolean;
    phone_public: boolean;
    business_email?: string;
    business_category?: string;
}

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
    profile?: Profile;
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

    categories?: string[];
    category?: string; // Deprecated
    category_id?: number; // Deprecated
    votes_count: number;
    comments_count?: number;
    created_at: string;
    user: User;
    media_metadata?: any;
    is_shadowing?: boolean;
    has_voted?: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkAuth: () => boolean;
}

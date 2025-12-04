export type NotificationType = 'comment' | 'vote' | 'shadow' | 'message';

export interface Notification {
    id: string;
    user_id: number;
    type: NotificationType;
    data: {
        sender_id: number;
        sender_name: string;
        post_id?: string;
        comment_id?: string;
        vote_type?: string;
        shadow_type?: string;
        preview?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

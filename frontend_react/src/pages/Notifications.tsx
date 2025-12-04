import React, { useEffect } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Heart, MessageSquare, UserPlus, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationList: React.FC = () => {
    const { notifications, fetchNotifications, markAllAsRead, isLoading } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'vote': return <Heart size={14} fill="currentColor" />;
            case 'comment': return <MessageSquare size={14} fill="currentColor" />;
            case 'shadow': return <UserPlus size={14} />;
            default: return <Bell size={14} />;
        }
    };

    const getMessage = (n: any) => {
        if (!n || !n.data) return <span>New Notification</span>;
        
        // Handle case where data might be a string (double JSON encoding edge case)
        let data = n.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                return <span>New Notification</span>;
            }
        }

        const { sender_name, type, preview, vote_type, shadow_type } = data;
        
        switch (type) {
            case 'vote': return <span><b>{sender_name}</b> {vote_type === 'up' ? 'upvoted' : 'downvoted'} your post.</span>;
            case 'comment': return <span><b>{sender_name}</b> commented: "{preview}"</span>;
            case 'shadow': return <span><b>{sender_name}</b> started {shadow_type === 'shadow' ? 'shadowing' : 'following'} you.</span>;
            default: return <span>Notification from <b>{sender_name}</b></span>;
        }
    };

    console.log('[NotificationList] Rendering notifications:', notifications);

    const handleNotificationClick = async (n: any) => {
        if (!n.read_at) {
            await useNotificationStore.getState().markAsRead(n.id);
        }

        let data = n.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) {}
        }

        if (data.post_id) {
            // Navigate to post (assuming we have a post detail page or feed anchor)
            // For now, let's just go to the profile of the sender or the post context
            // window.location.href = `/post/${data.post_id}`; 
        }
        
        if (data.sender_username) {
            window.location.href = `/profile/${data.sender_username}`;
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white p-4">
            <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold">Notifications</h2>
                <button 
                    onClick={() => markAllAsRead()}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                    Mark all as read
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
                    <p>Loading updates...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Bell size={48} className="mb-4 opacity-20" />
                    <p className="text-lg">No notifications yet</p>
                    <p className="text-sm opacity-60">When you get likes, comments, or shadows, they'll show up here.</p>
                </div>
            ) : (
                <div className="space-y-3 max-w-3xl mx-auto">
                    {notifications.map((n) => {
                        let data = n.data;
                        if (typeof data === 'string') {
                            try { data = JSON.parse(data); } catch (e) {}
                        }
                        const { sender_name, sender_avatar, type } = data;

                        return (
                            <div 
                                key={n.id} 
                                onClick={() => handleNotificationClick(n)}
                                className={`group p-4 rounded-2xl flex items-center space-x-4 transition-all duration-200 border border-white/5 cursor-pointer ${
                                    n.read_at 
                                        ? 'bg-white/5 hover:bg-white/10' 
                                        : 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                                }`}
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-800">
                                        {sender_avatar ? (
                                            <img src={sender_avatar} alt={sender_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                                {sender_name ? sender_name[0].toUpperCase() : '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-gray-900 border-2 border-gray-900 ${
                                        type === 'vote' ? 'text-pink-500' :
                                        type === 'comment' ? 'text-blue-500' :
                                        type === 'shadow' ? 'text-green-500' : 'text-gray-400'
                                    }`}>
                                        {getIcon(type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 leading-relaxed">
                                        {getMessage(n)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Unread Indicator */}
                                {!n.read_at && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

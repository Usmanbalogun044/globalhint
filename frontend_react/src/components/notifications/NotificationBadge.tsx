import React from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';

export const NotificationBadge: React.FC = () => {
    const { unreadCount } = useNotificationStore();

    if (unreadCount === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    );
};

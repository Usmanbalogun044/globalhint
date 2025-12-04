import React, { useEffect } from 'react';
import { X, Heart, MessageSquare, UserPlus, Bell } from 'lucide-react';

export interface ToastProps {
    message: string;
    type?: 'info' | 'success' | 'error';
    sender?: {
        name: string;
        username?: string;
        avatar?: string;
    };
    actionType?: 'vote' | 'comment' | 'shadow' | 'message';
    onClose: () => void;
    onClick?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', sender, actionType, onClose, onClick }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (actionType) {
            case 'vote': return <Heart size={12} className="text-pink-500" fill="currentColor" />;
            case 'comment': return <MessageSquare size={12} className="text-blue-500" fill="currentColor" />;
            case 'shadow': return <UserPlus size={12} className="text-green-500" />;
            case 'message': return <MessageSquare size={12} className="text-indigo-500" />;
            default: return <Bell size={12} className="text-gray-400" />;
        }
    };

    return (
        <div 
            onClick={onClick}
            className="fixed top-4 right-4 z-[60] bg-gray-900/90 backdrop-blur-md border border-white/10 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-right cursor-pointer hover:bg-gray-800/90 transition-all max-w-sm w-full"
        >
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                    {sender?.avatar ? (
                        <img src={sender.avatar} alt={sender.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                            {sender?.name ? sender.name[0].toUpperCase() : 'S'}
                        </div>
                    )}
                </div>
                {actionType && (
                    <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 border border-gray-800">
                        {getIcon()}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{sender?.name || 'System'}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{message}</p>
            </div>

            {/* Close Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={16} className="text-gray-400" />
            </button>
        </div>
    );
};

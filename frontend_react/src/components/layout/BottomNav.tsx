import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Home, Search, Bell, User, LogIn, MessageSquare } from 'lucide-react';

interface BottomNavProps {
    onOpenLogin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenLogin }) => {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link to="/" className={`p-2 rounded-full transition-colors ${isActive('/') ? 'text-white' : 'text-gray-500'}`}>
                    <Home size={28} strokeWidth={isActive('/') ? 3 : 2} />
                </Link>

                <Link to="/discover" className={`p-2 rounded-full transition-colors ${isActive('/discover') ? 'text-white' : 'text-gray-500'}`}>
                    <Search size={28} strokeWidth={isActive('/discover') ? 3 : 2} />
                </Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/notifications" className={`p-2 rounded-full transition-colors ${isActive('/notifications') ? 'text-white' : 'text-gray-500'}`}>
                            <Bell size={28} strokeWidth={isActive('/notifications') ? 3 : 2} />
                        </Link>
                        <Link to="/messages" className={`p-2 rounded-full transition-colors ${isActive('/messages') ? 'text-white' : 'text-gray-500'}`}>
                            <MessageSquare size={28} strokeWidth={isActive('/messages') ? 3 : 2} />
                        </Link>
                        <Link to={`/profile/${user?.username}`} className={`p-2 rounded-full transition-colors ${isActive(`/profile/${user?.username}`) ? 'text-white' : 'text-gray-500'}`}>
                            <User size={28} strokeWidth={isActive(`/profile/${user?.username}`) ? 3 : 2} />
                        </Link>
                    </>
                ) : (
                    <button onClick={onOpenLogin} className="p-2 rounded-full text-gray-500 hover:text-white transition-colors">
                        <LogIn size={28} />
                    </button>
                )}
            </div>
        </div>
    );
};

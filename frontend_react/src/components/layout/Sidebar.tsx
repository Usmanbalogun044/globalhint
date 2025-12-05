import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { Home, Search, User, Bell, LogOut, LogIn, PenSquare, MessageSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { messageService } from '@/services/messageService';
import { echo } from '@/lib/echo';

interface SidebarProps {
    onOpenLogin: () => void;
    onOpenRegister: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenLogin, onOpenRegister }) => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { openCreatePost } = useUIStore();
    const location = useLocation();
    const [unreadMessages, setUnreadMessages] = useState(0);

    const isActive = (path: string) => location.pathname === path;

    const handleNewHintClick = () => {
        if (isAuthenticated) {
            openCreatePost();
        } else {
            onOpenLogin();
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            // Fetch initial count
            messageService.getUnreadCount().then(setUnreadMessages).catch(console.error);

            // Listen for new messages
            const channel = echo.private(`chat.${user.id}`);
            channel.listen('MessageSent', () => {
                setUnreadMessages(prev => prev + 1);
            });

            return () => {
                channel.stopListening('MessageSent');
            };
        }
    }, [isAuthenticated, user]);

    // Reset unread count when visiting messages page
    useEffect(() => {
        if (location.pathname === '/messages') {
            // Ideally we'd only decrement for the specific conversation opened, 
            // but for now we can re-fetch or rely on the chat window to mark as read.
            // Let's just re-fetch to be safe, or wait for the chat window to update it.
            // Actually, simply visiting /messages doesn't read them all. 
            // Opening a specific conversation does. 
            // So we'll leave this logic to the ChatWindow component to mark as read,
            // and maybe we should expose a way to update this count from there?
            // For now, let's re-fetch when location changes to /messages just in case.
             messageService.getUnreadCount().then(setUnreadMessages).catch(console.error);
        }
    }, [location.pathname]);

    return (
        <aside className="hidden md:flex flex-col w-20 lg:w-72 sticky top-0 h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl z-40">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <Link to="/" className="flex items-center space-x-3 mb-8 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#D4AF37] to-[#806921] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">🌍</span>
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EDDF99] to-[#D4AF37] hidden lg:block">
                        Globalhint
                    </span>
                </Link>

                <nav className="space-y-2">
                    <Link to="/" className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive('/') ? 'bg-[#D4AF37]/10 text-[#DBBF33]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Home size={24} />
                        <span className="font-medium text-lg hidden lg:block">Home</span>
                    </Link>

                    <Link to="/discover" className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive('/discover') ? 'bg-[#D4AF37]/10 text-[#DBBF33]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Search size={24} />
                        <span className="font-medium text-lg hidden lg:block">Discover</span>
                    </Link>

                    <Link to="/explore" className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive('/explore') ? 'bg-[#D4AF37]/10 text-[#DBBF33]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Globe size={24} />
                        <span className="font-medium text-lg hidden lg:block">Explore</span>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/notifications" className="flex items-center space-x-4 p-3 rounded-xl text-gray-400 hover:text-white font-medium transition-all hover:bg-white/5 hover:scale-[1.02] relative">
                                <div className="relative">
                                    <Bell size={24} />
                                    <NotificationBadge />
                                </div>
                                <span className="font-medium text-lg hidden lg:block">Notifications</span>
                            </Link>
                            <Link to="/messages" className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive('/messages') ? 'bg-[#D4AF37]/10 text-[#DBBF33]' : 'text-gray-400 hover:bg-white/5 hover:text-white'} relative`}>
                                <div className="relative">
                                    <MessageSquare size={24} />
                                    {unreadMessages > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-black">
                                            {unreadMessages > 99 ? '99+' : unreadMessages}
                                        </span>
                                    )}
                                </div>
                                <span className="font-medium text-lg hidden lg:block">ChatHint</span>
                            </Link>
                            <Link to={`/profile/${user?.username}`} className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive(`/profile/${user?.username}`) ? 'bg-[#D4AF37]/10 text-[#DBBF33]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                <User size={24} />
                                <span className="font-medium text-lg hidden lg:block">Profile</span>
                            </Link>
                            <button onClick={logout} className="flex items-center space-x-4 p-3 rounded-xl text-red-400 hover:text-red-300 font-medium transition-all hover:bg-red-500/10 w-full text-left mt-4">
                                <LogOut size={24} />
                                <span className="font-medium text-lg hidden lg:block">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onOpenLogin} className="flex items-center space-x-4 p-3 rounded-xl text-[#DBBF33] hover:text-[#E4CF66] font-medium transition-all hover:bg-[#D4AF37]/10 w-full text-left">
                                <LogIn size={24} />
                                <span className="font-medium text-lg hidden lg:block">Login</span>
                            </button>
                            <button onClick={onOpenRegister} className="flex items-center space-x-4 p-3 rounded-xl text-[#DBBF33] hover:text-[#E4CF66] font-medium transition-all hover:bg-[#D4AF37]/10 w-full text-left">
                                <PenSquare size={24} />
                                <span className="font-medium text-lg hidden lg:block">Sign Up</span>
                            </button>
                        </>
                    )}
                </nav>

                <div className="mt-8">
                    <Button 
                        onClick={handleNewHintClick}
                        className="w-full h-14 text-lg font-bold rounded-full shadow-xl shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 transition-all hover:scale-105 bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-black"
                    >
                        <span className="lg:hidden">+</span>
                        <span className="hidden lg:block">New Hint</span>
                    </Button>
                </div>
            </div>

            {isAuthenticated && user && (
                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806921] flex items-center justify-center text-black font-bold">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} /> : user.name[0]}
                        </div>
                        <div className="hidden lg:block">
                            <div className="font-bold text-white text-sm">{user.name}</div>
                            <div className="text-gray-500 text-xs">@{user.username}</div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

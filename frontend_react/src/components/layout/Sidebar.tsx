import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Home, Search, User, Bell, LogOut, LogIn, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
    onOpenLogin: () => void;
    onOpenRegister: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenLogin, onOpenRegister }) => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="hidden md:flex flex-col w-20 lg:w-72 sticky top-0 h-screen border-r border-white/10 bg-black/20 backdrop-blur-xl z-40">
            <div className="p-6 flex-1 overflow-y-auto">
                <Link to="/" className="flex items-center space-x-3 mb-8 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">🌍</span>
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden lg:block">
                        Globalhint
                    </span>
                </Link>

                <nav className="space-y-2">
                    <Link to="/" className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive('/') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Home size={24} />
                        <span className="font-medium text-lg hidden lg:block">Home</span>
                    </Link>

                    <Link to="/discover" className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive('/discover') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Search size={24} />
                        <span className="font-medium text-lg hidden lg:block">Discover</span>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/notifications" className="flex items-center space-x-4 p-3 rounded-xl text-gray-400 hover:text-white font-medium transition-all hover:bg-white/5 hover:scale-[1.02]">
                                <Bell size={24} />
                                <span className="font-medium text-lg hidden lg:block">Notifications</span>
                            </Link>
                            <Link to={`/profile/${user?.id}`} className={`flex items-center space-x-4 p-3 rounded-xl transition-all hover:scale-[1.02] ${isActive(`/profile/${user?.id}`) ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
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
                            <button onClick={onOpenLogin} className="flex items-center space-x-4 p-3 rounded-xl text-indigo-400 hover:text-indigo-300 font-medium transition-all hover:bg-indigo-500/10 w-full text-left">
                                <LogIn size={24} />
                                <span className="font-medium text-lg hidden lg:block">Login</span>
                            </button>
                            <button onClick={onOpenRegister} className="flex items-center space-x-4 p-3 rounded-xl text-indigo-400 hover:text-indigo-300 font-medium transition-all hover:bg-indigo-500/10 w-full text-left">
                                <PenSquare size={24} />
                                <span className="font-medium text-lg hidden lg:block">Sign Up</span>
                            </button>
                        </>
                    )}
                </nav>

                <div className="mt-8">
                    <Button className="w-full h-14 text-lg font-bold rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-105">
                        <span className="lg:hidden">+</span>
                        <span className="hidden lg:block">New Post</span>
                    </Button>
                </div>
            </div>

            {isAuthenticated && user && (
                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
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

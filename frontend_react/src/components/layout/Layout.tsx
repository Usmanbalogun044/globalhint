import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { RightPanel } from './RightPanel';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useUIStore } from '@/store/useUIStore';

import { VideoCallModal } from '@/components/chat/VideoCallModal';
import { Chat } from '@/components/chat/Chat';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { echo } from '@/lib/echo';
import { useEffect, useState } from 'react';
import { Toast } from '@/components/ui/Toast';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { X, Video } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const {
        isLoginOpen, closeLogin, openLogin,
        isRegisterOpen, closeRegister, openRegister,
        switchToRegister, switchToLogin,
        activeChatUser, closeChat,
        incomingCall, setIncomingCall, activeCall, setActiveCall
    } = useUIStore();
    const { user } = useAuthStore();
    const [toast, setToast] = useState<{ 
        message: string; 
        type: 'info' | 'success' | 'error';
        sender?: { name: string; username?: string; avatar?: string };
        actionType?: 'vote' | 'comment' | 'shadow' | 'message';
    } | null>(null);

    const { addNotification, fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        if (user) {
            fetchUnreadCount();

            // Listen for persistent notifications (Comment, Vote, Shadow)
            // Channel: App.Models.User.{id}
            const notificationChannel = echo.private(`App.Models.User.${user.id}`);
            notificationChannel.listen('.notification.created', (e: { notification: any }) => {
                console.log('[Layout] Notification received:', e);
                addNotification(e.notification);
                fetchUnreadCount(); // Refresh count explicitly
                
                // Show Toast
                const { sender_name, sender_username, sender_avatar, type, preview } = e.notification.data;
                let message = `New notification`;
                if (type === 'comment') message = `commented: "${preview}"`;
                if (type === 'vote') message = `voted on your post`;
                if (type === 'shadow') message = `started shadowing you`;
                
                setToast({ 
                    message, 
                    type: 'info',
                    sender: { name: sender_name, username: sender_username, avatar: sender_avatar },
                    actionType: type
                });
            });

            // Listen for Messages (Ephemeral Toast)
            // Channel: chat.{id}
            const chatChannel = echo.private(`chat.${user.id}`);
            chatChannel.listen('.message.sent', (e: { message: any }) => {
                // Only show toast if chat is NOT open for this user
                if (activeChatUser?.id !== e.message.sender_id) {
                    console.log('[Layout] New message received (Toast):', e);
                    setToast({ 
                        message: e.message.content || 'Sent a media file', 
                        type: 'info',
                        sender: { 
                            name: e.message.sender.name, 
                            username: e.message.sender.username, 
                            avatar: e.message.sender.avatar 
                        },
                        actionType: 'message'
                    });
                }
            });

            // Listen for Video Calls
            const callChannel = echo.private(`call.${user.id}`);
            callChannel.listen('CallInitiated', (e: { caller: any, offer: any }) => {
                 if (!activeCall) {
                     setIncomingCall({ caller: e.caller, offer: e.offer });
                 }
            });

            return () => {
                echo.leave(`App.Models.User.${user.id}`);
                echo.leave(`chat.${user.id}`);
                echo.leave(`call.${user.id}`);
            };
        }
    }, [user, activeCall, activeChatUser, fetchUnreadCount, addNotification]);

    // Listen for custom "show-toast" events (e.g. from CreatePostModal)
    useEffect(() => {
        const handleShowToast = (e: CustomEvent) => {
            setToast(e.detail);
        };
        window.addEventListener('show-toast', handleShowToast as EventListener);
        return () => window.removeEventListener('show-toast', handleShowToast as EventListener);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30">
            <div className="flex justify-center max-w-[1920px] mx-auto">
                <Sidebar onOpenLogin={openLogin} onOpenRegister={openRegister} />

                <main className="flex-1 min-h-screen border-r border-white/10 max-w-2xl w-full pb-20 md:pb-0">
                    {children}
                </main>

                <RightPanel />
            </div>

            <BottomNav onOpenLogin={openLogin} />

            <LoginModal
                isOpen={isLoginOpen}
                onClose={closeLogin}
                onSwitchToRegister={switchToRegister}
            />
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={closeRegister}
                onSwitchToLogin={switchToLogin}
            />

            {/* Chat Widget */}
            {activeChatUser && (
                <Chat recipient={activeChatUser} onClose={closeChat} />
            )}

            {/* Video Call Modal */}
            <VideoCallModal />
            
            {/* Incoming Call Notification */}
            {incomingCall && !activeCall && (
                <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-white/20 p-4 rounded-lg shadow-xl flex items-center space-x-4 animate-in slide-in-from-right">
                    {/* ... existing call notification content ... */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            {incomingCall.caller.avatar ? <img src={incomingCall.caller.avatar} className="w-full h-full rounded-full object-cover" /> : incomingCall.caller.name[0]}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{incomingCall.caller.name}</h3>
                        <p className="text-sm text-gray-400">Incoming Video Call...</p>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setIncomingCall(null)} 
                            className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/30"
                        >
                            <X size={20} />
                        </button>
                        <button 
                            onClick={() => setActiveCall({ user: incomingCall.caller, isCaller: false })} 
                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                        >
                            <Video size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Global Toast Container */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type}
                    sender={toast.sender}
                    actionType={toast.actionType}
                    onClose={() => setToast(null)}
                    onClick={() => {
                        setToast(null);
                        if (toast.sender?.username) {
                            window.location.href = `/profile/${toast.sender.username}`;
                        }
                    }}
                />
            )}

            <CreatePostModal />

        </div>
    );
};

import React, { useEffect, useState } from 'react';
// import { useAuthStore } from '@/store/useAuthStore';
import { messageService } from '@/services/messageService';
import type { User } from '@/types';
import { Chat } from '@/components/chat/Chat';
import { Search } from 'lucide-react';

export const Messages: React.FC = () => {
    // const { user } = useAuthStore();
    const [conversations, setConversations] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await messageService.getConversations();
                setConversations(data);
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-screen">
            {/* Conversation List (Hidden on mobile if chat is open) */}
            <div className={`w-full md:w-1/3 border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/10">
                    <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search messages"
                            className="w-full bg-white/5 border-none rounded-full pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No messages yet. Start a conversation!</div>
                    ) : (
                        conversations.map((convoUser) => (
                            <div
                                key={convoUser.id}
                                onClick={() => setSelectedUser(convoUser)}
                                className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition ${selectedUser?.id === convoUser.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {convoUser.avatar ? <img src={convoUser.avatar} className="w-full h-full rounded-full object-cover" /> : convoUser.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-white truncate">{convoUser.name}</h3>
                                        {convoUser.last_message && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(convoUser.last_message.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">
                                        {convoUser.last_message?.content || 'Start a conversation'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`w-full md:w-2/3 bg-black/40 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex fixed inset-0 z-50 md:static md:z-auto bg-black'}`}>
                {selectedUser ? (
                    <div className="flex-1 flex flex-col h-full relative">
                        {/* Mobile Header to go back */}
                        <div className="md:hidden p-4 border-b border-white/10 flex items-center space-x-3 bg-black/60 backdrop-blur-xl">
                            <button onClick={() => setSelectedUser(null)} className="text-white p-2 -ml-2">
                                <span className="text-xl">←</span>
                            </button>
                            <div className="font-bold text-white">{selectedUser.name}</div>
                        </div>
                        
                        <Chat 
                            recipient={selectedUser} 
                            onClose={() => setSelectedUser(null)} 
                            className="flex-1 flex flex-col w-full h-full bg-transparent border-none shadow-none"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                            <span className="text-4xl">💬</span>
                        </div>
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

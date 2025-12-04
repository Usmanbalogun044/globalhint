import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { messageService } from '@/services/messageService';
import type { Message } from '@/services/messageService';
import { echo } from '@/lib/echo';
import { Button } from '@/components/ui/button';
import { Send, X, Video } from 'lucide-react';
import type { User } from '@/types';

interface ChatProps {
    recipient: User;
    onClose: () => void;
    className?: string;
}

export const Chat: React.FC<ChatProps> = ({ recipient, onClose, className }) => {
    const { user } = useAuthStore();
    const { setActiveCall } = useUIStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (recipient.id) {
                const data = await messageService.getMessages(recipient.id);
                setMessages(data);
                scrollToBottom();
            }
        };

        fetchMessages();

        // Listen for new messages
        if (user) {
             const channel = echo.private(`chat.${user.id}`);
             
             channel.listen('.message.sent', (e: { message: Message }) => {
                 if (e.message.sender_id === recipient.id) {
                     setMessages((prev) => {
                         // Prevent duplicates
                         if (prev.some(m => m.id === e.message.id)) {
                             return prev;
                         }
                         return [...prev, e.message];
                     });
                     scrollToBottom();
                 }
             });

             return () => {
                 echo.leave(`chat.${user.id}`);
             };
        }
    }, [recipient.id, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        
        // Optimistic update
        const tempId = Date.now();
        const optimisticMessage: Message = {
            id: tempId,
            sender_id: user!.id,
            receiver_id: recipient.id,
            content: newMessage,
            type: 'text',
            created_at: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage('');
        scrollToBottom();

        try {
            const sentMessage = await messageService.sendMessage(recipient.id, optimisticMessage.content);
            // Replace optimistic message with real one if needed, or just let it be since ID will update on refresh
            setMessages((prev) => prev.map(m => m.id === tempId ? sentMessage : m));
        } catch (error) {
            console.error("Failed to send message", error);
            // Remove optimistic message on error
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        }
    };

    return (
        <div className={className || "fixed bottom-0 right-4 w-80 bg-gray-900 border border-white/10 rounded-t-lg shadow-xl flex flex-col h-96 z-50"}>
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-gray-800 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {recipient.avatar ? <img src={recipient.avatar} className="w-full h-full rounded-full object-cover" /> : recipient.name[0]}
                    </div>
                    <span className="font-bold text-white text-sm">{recipient.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setActiveCall({ user: recipient, isCaller: true })}
                        className="text-gray-400 hover:text-indigo-400 transition"
                        title="Start Video Call"
                    >
                        <Video size={18} />
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_id === user?.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-gray-800">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700 border-none rounded-full px-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                    />
                    <Button onClick={handleSend} size="icon" className="h-8 w-8 rounded-full bg-indigo-500 hover:bg-indigo-600">
                        <Send size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

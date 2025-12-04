import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Globe } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { postService } from '@/services/postService';
import { Button } from '@/components/ui/button';

interface CreatePostModalProps {
    onPostCreated?: (post: any) => void; // Optional callback if needed
}

export const CreatePostModal: React.FC<CreatePostModalProps> = () => {
    const { isCreatePostOpen, closeCreatePost } = useUIStore();
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'music' | 'text'>('text');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        'General', 'News', 'Jobs', 'Opportunities/Business', 'Products', 
        'Travels', 'Education/Training', 'Faith', 'Fun', 'Investments'
    ];

    if (!isCreatePostOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMedia(file);
            setMediaPreview(URL.createObjectURL(file));
            
            if (file.type.startsWith('image/')) setMediaType('image');
            else if (file.type.startsWith('video/')) setMediaType('video');
            else if (file.type.startsWith('audio/')) setMediaType('audio');
        }
    };

    const removeMedia = () => {
        setMedia(null);
        setMediaPreview(null);
        setMediaType('text');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!content.trim() && !media) return;

        // Background Upload Pattern:
        // 1. Close Modal Immediately
        closeCreatePost();
        
        // 2. Show "Posting..." Toast (We need a way to trigger global toast from here, 
        //    but since we are inside Layout, we might need to dispatch an event or use a store.
        //    For now, let's assume the Layout listens to a global event or we just fire and forget)
        
        // Ideally, we should have a useToastStore or similar. 
        // Since we don't have that refactored yet, we will use a custom event or just console log for now
        // and let the Layout handle the "success" toast via the real-time event that comes back.
        // BUT the user wants a "loading" notification.
        
        // Let's implement a simple "Optimistic UI" or "Background Task" approach.
        // We will dispatch a custom event that Layout listens to for "Toast"
        
        window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { message: 'Posting your hint...', type: 'info' } 
        }));

        try {
            await postService.createPost(content, mediaType, media || undefined, category);
            
            // Success Toast
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'Hint posted successfully!', type: 'success' } 
            }));
            
            // Cleanup
            setContent('');
            setCategory('General');
            removeMedia();
            
        } catch (error) {
            console.error('Failed to post:', error);
             // Error Toast
             window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'Failed to post hint. Please try again.', type: 'error' } 
            }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <h2 className="text-xl font-bold text-white">Create New Hint</h2>
                    <button onClick={closeCreatePost} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user?.name?.[0]}
                        </div>
                        <div>
                            <div className="font-bold text-white">{user?.name}</div>
                            <div className="text-sm text-gray-400 flex items-center space-x-1">
                                <Globe size={12} />
                                <span>Public</span>
                            </div>
                        </div>
                    </div>

                    {/* Text Input */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening in your world?"
                        className="w-full bg-transparent text-xl text-white placeholder-gray-500 resize-none focus:outline-none min-h-[100px]"
                    />

                    {/* Media Preview */}
                    {mediaPreview && (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 group">
                            <button 
                                onClick={removeMedia}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                            {mediaType === 'image' && (
                                <img src={mediaPreview} alt="Preview" className="w-full max-h-[250px] md:max-h-[400px] object-contain bg-black/40" />
                            )}
                            {mediaType === 'video' && (
                                <video src={mediaPreview} controls className="w-full max-h-[250px] md:max-h-[400px]" />
                            )}
                            {mediaType === 'audio' && (
                                <div className="p-8 flex items-center justify-center bg-gray-900">
                                    <audio src={mediaPreview} controls className="w-full" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        category === cat 
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-green-400 hover:bg-green-400/10 rounded-full transition-colors">
                            <ImageIcon size={24} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors">
                            <Video size={24} />
                        </button>
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*,video/*,audio/*"
                            onChange={handleFileSelect}
                        />
                    </div>

                    <Button 
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !media)}
                        className="rounded-full px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Post Hint
                    </Button>
                </div>
            </div>
        </div>
    );
};

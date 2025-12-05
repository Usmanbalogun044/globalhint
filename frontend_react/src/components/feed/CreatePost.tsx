import React, { useState, useRef } from 'react';
import { Image, Film, Mic, Music, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { postService } from '@/services/postService';
import type { Post } from '@/types';

interface CreatePostProps {
    onPostCreated?: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [media, setMedia] = useState<File | null>(null);
    const [mediaType, setMediaType] = useState<'text' | 'image' | 'video' | 'audio' | 'music'>('text');
    const [category, setCategory] = useState('General');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories = [
        'General', 'News', 'Jobs', 'Opportunities/Business', 'Products', 
        'Travels', 'Education/Training', 'Faith', 'Fun', 'Investments'
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'music') => {
        if (e.target.files && e.target.files[0]) {
            setMedia(e.target.files[0]);
            setMediaType(type);
        }
    };

    const triggerFileInput = (type: 'image' | 'video' | 'audio' | 'music') => {
        setMediaType(type);
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
            fileInputRef.current.click();
        }
    };

    const handlePost = async () => {
        if (!content.trim() && !media) return;
        setLoading(true);
        try {
            const newPost = await postService.createPost(content, mediaType, media || undefined, [category]);
            setContent('');
            setMedia(null);
            setMediaType('text');
            setCategory('General');
            if (onPostCreated) {
                onPostCreated(newPost);
            }
        } catch (error) {
            console.error("Failed to create hint:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-b border-white/10 p-4">
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806921] flex items-center justify-center text-black font-bold">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user?.name?.[0] || '?'}
                    </div>
                </div>
                <div className="flex-1">
                    <textarea
                        placeholder="What is happening?!"
                        className="w-full bg-transparent text-xl text-white placeholder-gray-500 border-none focus:ring-0 resize-none min-h-[50px] p-2"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {media && (
                        <div className="mt-2 relative">
                            <div className="text-sm text-[#DBBF33] bg-[#D4AF37]/10 px-3 py-1 rounded-full inline-flex items-center">
                                {mediaType === 'image' && <Image size={14} className="mr-1" />}
                                {mediaType === 'video' && <Film size={14} className="mr-1" />}
                                {mediaType === 'audio' && <Mic size={14} className="mr-1" />}
                                {mediaType === 'music' && <Music size={14} className="mr-1" />}
                                {media.name}
                                <button onClick={() => setMedia(null)} className="ml-2 text-red-400 hover:text-red-300">×</button>
                            </div>
                        </div>
                    )}

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => handleFileSelect(e, mediaType as any)} 
                    />

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="flex space-x-1 items-center">
                            <Button onClick={() => triggerFileInput('image')} variant="ghost" size="icon" className="text-[#DBBF33] hover:bg-[#D4AF37]/10 rounded-full w-9 h-9">
                                <Image size={20} />
                            </Button>
                            <Button onClick={() => triggerFileInput('video')} variant="ghost" size="icon" className="text-[#DBBF33] hover:bg-[#D4AF37]/10 rounded-full w-9 h-9">
                                <Film size={20} />
                            </Button>
                            <Button onClick={() => triggerFileInput('audio')} variant="ghost" size="icon" className="text-[#DBBF33] hover:bg-[#D4AF37]/10 rounded-full w-9 h-9">
                                <Mic size={20} />
                            </Button>
                            <Button onClick={() => window.location.href = '/live'} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-full w-9 h-9 animate-pulse">
                                <Radio size={20} />
                            </Button>
                            
                            {/* Category Selector */}
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-black/20 text-[#DBBF33] text-sm rounded-full border border-white/10 px-2 py-1 ml-2 focus:outline-none focus:border-[#D4AF37]"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={handlePost}
                            disabled={(!content.trim() && !media) || loading}
                            className="rounded-full px-5 font-bold bg-[#D4AF37] hover:bg-[#AA8C2C] text-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Hinting...' : 'Hint'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

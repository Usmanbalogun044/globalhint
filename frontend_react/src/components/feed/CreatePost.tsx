import React, { useState } from 'react';
import { Image, Film, Smile, Calendar, MapPin } from 'lucide-react';
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

    const handlePost = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const newPost = await postService.createPost(content);
            setContent('');
            if (onPostCreated) {
                onPostCreated(newPost);
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-b border-white/10 p-4">
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
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

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="text-indigo-400 hover:bg-indigo-500/10 rounded-full w-9 h-9">
                                <Image size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-indigo-400 hover:bg-indigo-500/10 rounded-full w-9 h-9">
                                <Film size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-indigo-400 hover:bg-indigo-500/10 rounded-full w-9 h-9">
                                <Smile size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-indigo-400 hover:bg-indigo-500/10 rounded-full w-9 h-9">
                                <Calendar size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-indigo-400 hover:bg-indigo-500/10 rounded-full w-9 h-9">
                                <MapPin size={20} />
                            </Button>
                        </div>
                        <Button
                            onClick={handlePost}
                            disabled={!content.trim() || loading}
                            className="rounded-full px-5 font-bold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

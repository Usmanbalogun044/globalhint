import React from 'react';
import { Heart, MessageCircle, Repeat, Share, BarChart2, MoreHorizontal } from 'lucide-react';
import type { Post } from '@/types';
import { Button } from '@/components/ui/button';

interface PostItemProps {
    post: Post;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
    return (
        <div className="border-b border-white/10 p-4 hover:bg-white/[0.02] transition cursor-pointer">
            <div className="flex space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 overflow-hidden">
                        {post.user.avatar ? (
                            <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {post.user.name[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm">
                            <span className="font-bold text-white hover:underline">{post.user.name}</span>
                            <span className="text-gray-500">@{post.user.username}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500 hover:underline">2h</span>
                        </div>
                        <button className="text-gray-500 hover:text-indigo-400 transition rounded-full p-1 hover:bg-indigo-500/10">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <p className="text-white text-[15px] mt-1 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </p>

                    {post.media_url && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                            {post.type === 'image' ? (
                                <img src={post.media_url} alt="Post media" className="w-full max-h-[500px] object-cover" />
                            ) : (
                                <video src={post.media_url} controls className="w-full" />
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-3 max-w-md text-gray-500">
                        <Button variant="ghost" size="sm" className="group hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full px-2 h-8 space-x-1">
                            <MessageCircle size={18} className="group-hover:scale-110 transition" />
                            <span className="text-xs">24</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="group hover:text-green-400 hover:bg-green-500/10 rounded-full px-2 h-8 space-x-1">
                            <Repeat size={18} className="group-hover:scale-110 transition" />
                            <span className="text-xs">12</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="group hover:text-pink-500 hover:bg-pink-500/10 rounded-full px-2 h-8 space-x-1">
                            <Heart size={18} className="group-hover:scale-110 transition" />
                            <span className="text-xs">{post.votes_count}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="group hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full px-2 h-8 space-x-1">
                            <BarChart2 size={18} className="group-hover:scale-110 transition" />
                            <span className="text-xs">1.2k</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="group hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full px-2 h-8">
                            <Share size={18} className="group-hover:scale-110 transition" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

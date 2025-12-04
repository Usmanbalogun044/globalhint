import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat, Share, BarChart2, MoreHorizontal, MapPin } from 'lucide-react';
import type { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
    post: Post;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
    const [showComments, setShowComments] = useState(false);

    return (
        <>
            <div className="border-b border-white/10 p-4 hover:bg-white/[0.02] transition">
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
                            <div className="flex items-center space-x-1 text-sm flex-wrap">
                                <span className="font-bold text-white hover:underline">{post.user.name}</span>
                                <span className="text-gray-500">@{post.user.username}</span>
                                {post.user.country && (
                                    <>
                                        <span className="text-gray-500">·</span>
                                        <span className="text-gray-500 flex items-center space-x-1">
                                            <MapPin size={12} />
                                            <span>{post.user.country}</span>
                                        </span>
                                    </>
                                )}
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 hover:underline">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                                {post.category && (
                                    <>
                                        <span className="text-gray-500">·</span>
                                        <span className="text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10">
                                            {post.category}
                                        </span>
                                    </>
                                )}
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
                                {post.type === 'image' && (
                                    <img src={post.media_url} alt="Post media" className="w-full max-h-[500px] object-cover" />
                                )}
                                {post.type === 'video' && (
                                    <video src={post.media_url} controls className="w-full max-h-[500px] bg-black" />
                                )}
                                {(post.type === 'audio' || post.type === 'music') && (
                                    <div className="p-4 bg-white/5 flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                        <audio src={post.media_url} controls className="w-full" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between mt-3 max-w-md text-gray-500">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="group hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full px-2 h-8 space-x-1"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">{post.comments_count || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-green-400 hover:bg-green-500/10 rounded-full px-2 h-8 space-x-1">
                                <Repeat size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">0</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-pink-500 hover:bg-pink-500/10 rounded-full px-2 h-8 space-x-1">
                                <Heart size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">{post.votes_count || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full px-2 h-8 space-x-1">
                                <BarChart2 size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">0</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full px-2 h-8">
                                <Share size={18} className="group-hover:scale-110 transition" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <CommentSection postId={post.id} isOpen={showComments} onClose={() => setShowComments(false)} />
        </>
    );
};

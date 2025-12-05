import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat, Share, BarChart2, MoreHorizontal, MapPin, UserPlus, UserMinus } from 'lucide-react';
import type { Post } from '@/types';
import { postService } from '@/services/postService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
    post: Post;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
    const { user: currentUser } = useAuthStore();
    const [showComments, setShowComments] = useState(false);
    const [votesCount, setVotesCount] = useState(post.votes_count || 0);
    const [hasVoted, setHasVoted] = useState(post.has_voted || false);
    const [isShadowed, setIsShadowed] = useState(post.is_shadowing || false);

    const handleVote = async () => {
        try {
            await postService.votePost(post.id, 'up'); // Assuming 'up' for simple like/heart
            if (hasVoted) {
                setVotesCount(prev => prev - 1);
                setHasVoted(false);
            } else {
                setVotesCount(prev => prev + 1);
                setHasVoted(true);
            }
        } catch (error) {
            console.error("Failed to vote", error);
        }
    };

    const handleShadow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (isShadowed) {
                await userService.unfollowUser(post.user.id);
                setIsShadowed(false);
            } else {
                await userService.followUser(post.user.id);
                setIsShadowed(true);
            }
        } catch (error) {
            console.error("Failed to toggle shadow", error);
        }
    };

    const isOwnPost = currentUser?.id === post.user.id;

    return (
        <>
            <div className="border-b border-white/10 p-4 hover:bg-white/[0.02] transition">
                <div className="flex space-x-3">
                    {/* Avatar */}
                    <Link to={`/profile/${post.user.username}`} className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 overflow-hidden">
                            {post.user.avatar ? (
                                <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                    {post.user.name[0]}
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-sm flex-wrap">
                                <Link to={`/profile/${post.user.username}`} className="font-bold text-white hover:underline">
                                    {post.user.name}
                                </Link>
                                <Link to={`/profile/${post.user.username}`} className="text-gray-500 hover:text-gray-400">
                                    @{post.user.username}
                                </Link>
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
                                {(post.categories && post.categories.length > 0) ? (
                                    <>
                                        <span className="text-gray-500">·</span>
                                        <div className="flex space-x-1">
                                            {post.categories.map(cat => (
                                                <span key={cat} className="text-[#DBBF33] text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : post.category ? (
                                    <>
                                        <span className="text-gray-500">·</span>
                                        <span className="text-[#DBBF33] text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                                            {post.category}
                                        </span>
                                    </>
                                ) : null}
                            </div>
                            <div className="flex items-center space-x-2">
                                {!isOwnPost && (
                                    <button 
                                        onClick={handleShadow}
                                        className={`px-2 py-1 rounded-full flex items-center space-x-1 transition ${isShadowed ? 'text-gray-500 hover:bg-gray-500/10' : 'text-[#DBBF33] hover:bg-[#D4AF37]/10'}`}
                                        title={isShadowed ? "Unshadow User" : "Shadow User"}
                                    >
                                        {isShadowed ? <UserMinus size={14} /> : <UserPlus size={14} />}
                                        <span className="text-xs font-bold">{isShadowed ? 'Unshadow' : 'Shadow'}</span>
                                    </button>
                                )}
                                <button className="text-gray-500 hover:text-[#DBBF33] transition rounded-full p-1 hover:bg-[#D4AF37]/10">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
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
                                        <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                className="group hover:text-[#DBBF33] hover:bg-[#D4AF37]/10 rounded-full px-2 h-8 space-x-1"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">{post.comments_count || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-green-400 hover:bg-green-500/10 rounded-full px-2 h-8 space-x-1">
                                <Repeat size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">0</span>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`group hover:text-pink-500 hover:bg-pink-500/10 rounded-full px-2 h-8 space-x-1 ${hasVoted ? 'text-pink-500' : ''}`}
                                onClick={handleVote}
                            >
                                <Heart size={18} className={`group-hover:scale-110 transition ${hasVoted ? 'fill-current' : ''}`} />
                                <span className="text-xs">{votesCount}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-[#DBBF33] hover:bg-[#D4AF37]/10 rounded-full px-2 h-8 space-x-1">
                                <BarChart2 size={18} className="group-hover:scale-110 transition" />
                                <span className="text-xs">0</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="group hover:text-[#DBBF33] hover:bg-[#D4AF37]/10 rounded-full px-2 h-8">
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

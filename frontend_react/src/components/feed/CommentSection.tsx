import React, { useState, useEffect } from 'react';
import { commentService, type Comment } from '@/services/commentService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2 } from 'lucide-react';
import { echo } from '@/lib/echo';

interface CommentSectionProps {
    postId: number;
    isOpen: boolean;
    onClose: () => void;
}

const CommentItem: React.FC<{ comment: Comment; postId: number; onReply: (commentId: number) => void }> = ({ comment, postId, onReply }) => {
    const { user } = useAuthStore();
    const [showReplies, setShowReplies] = useState(false);

    const handleDelete = async () => {
        if (confirm('Delete this comment?')) {
            try {
                await commentService.deleteComment(comment.id);
                window.location.reload(); // Simple refresh for now
            } catch (error) {
                console.error('Failed to delete comment', error);
            }
        }
    };

    return (
        <div className="py-3">
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {comment.user.avatar ? (
                            <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                        ) : (
                            comment.user.name[0]
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{comment.user.name}</span>
                        <span className="text-gray-500 text-xs">@{comment.user.username}</span>
                        <span className="text-gray-500 text-xs">·</span>
                        <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-white text-sm mt-1">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <button
                            onClick={() => onReply(comment.id)}
                            className="text-gray-500 hover:text-indigo-400 text-xs flex items-center space-x-1"
                        >
                            <MessageCircle size={14} />
                            <span>Reply</span>
                        </button>
                        {user?.id === comment.user_id && (
                            <button
                                onClick={handleDelete}
                                className="text-gray-500 hover:text-red-400 text-xs flex items-center space-x-1"
                            >
                                <Trash2 size={14} />
                                <span>Delete</span>
                            </button>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-indigo-400 text-xs"
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </button>
                        )}
                    </div>
                    {showReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-white/10 space-y-2">
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply.id} comment={reply} postId={postId} onReply={onReply} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, isOpen, onClose }) => {
    const { user, isAuthenticated } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadComments();
            
            // Listen for real-time comments
            const channel = echo.channel(`post.${postId}`);
            channel.listen('.CommentCreated', (e: { comment: Comment }) => {
                setComments((prev) => {
                    // Check if comment is a reply
                    if (e.comment.parent_id) {
                        return prev.map((c) => {
                            if (c.id === e.comment.parent_id) {
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), e.comment],
                                };
                            }
                            return c;
                        });
                    }
                    // Top-level comment
                    return [e.comment, ...prev];
                });
            });

            return () => {
                echo.leave(`post.${postId}`);
            };
        }
    }, [isOpen, postId]);

    const loadComments = async () => {
        try {
            const data = await commentService.getComments(postId);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        setLoading(true);
        try {
            const comment = await commentService.createComment(postId, newComment, replyingTo || undefined);
            
            // Optimistically add to UI
            if (replyingTo) {
                setComments((prev) =>
                    prev.map((c) => {
                        if (c.id === replyingTo) {
                            return {
                                ...c,
                                replies: [...(c.replies || []), comment],
                            };
                        }
                        return c;
                    })
                );
            } else {
                setComments((prev) => [comment, ...prev]);
            }

            setNewComment('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (commentId: number) => {
        setReplyingTo(commentId);
    };

    if (!isOpen) return null;

    return (
        <div className="border-t border-white/10 bg-black/20">
            <div className="p-4 max-h-[500px] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Comments</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>

                {/* New Comment Form */}
                {isAuthenticated && (
                    <form onSubmit={handleSubmit} className="mb-4">
                        {replyingTo && (
                            <div className="mb-2 text-xs text-indigo-400 flex items-center justify-between">
                                <span>Replying to comment...</span>
                                <button type="button" onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white">
                                    Cancel
                                </button>
                            </div>
                        )}
                        <div className="flex space-x-2">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name[0]
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                />
                                <div className="flex justify-end mt-2">
                                    <Button type="submit" disabled={loading || !newComment.trim()} size="sm">
                                        {loading ? 'Posting...' : 'Comment'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* Comments List */}
                <div className="space-y-1 divide-y divide-white/5">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm">No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} postId={postId} onReply={handleReply} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

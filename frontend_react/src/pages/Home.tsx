import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostItem } from '@/components/feed/PostItem';
import { postService } from '@/services/postService';
import type { Post } from '@/types';

import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/button';

export const Home: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const { openLogin, openRegister } = useUIStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Check for country filter in URL
                const params = new URLSearchParams(window.location.search);
                const country = params.get('country');

                const data = await postService.getPosts(country || undefined);
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handlePostCreated = (newPost: Post) => {
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <h1 className="text-xl font-bold text-white">Home</h1>
            </div>

            {/* Create Post or Login Prompt */}
            {isAuthenticated ? (
                <CreatePost onPostCreated={handlePostCreated} />
            ) : (
                <div className="p-8 border-b border-white/10 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Globalhint</h2>
                    <p className="text-gray-400 mb-6">Join the conversation and connect with the world.</p>
                    <div className="flex justify-center space-x-4">
                        <Button onClick={openLogin} className="rounded-full font-bold px-8 bg-indigo-500 hover:bg-indigo-600 text-white">
                            Log in
                        </Button>
                        <Button onClick={openRegister} variant="outline" className="rounded-full font-bold px-8 border-white/20 text-white hover:bg-white/10">
                            Sign up
                        </Button>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div className="divide-y divide-white/10">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading posts...</div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <PostItem key={post.id} post={post} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">No posts yet. Be the first to post!</div>
                )}
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostItem } from '@/components/feed/PostItem';
import { postService } from '@/services/postService';
import type { Post } from '@/types';

import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/button';
import { echo } from '@/lib/echo';

export const Home: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const { openLogin, openRegister } = useUIStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);

    const location = useLocation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await postService.getCategories();
                setCategories(['All', ...cats.map(c => c.name)]);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Check for country filter in URL
                const params = new URLSearchParams(location.search);
                const country = params.get('country');
                
                // Fetch posts with filters
                const data = await postService.getPosts(country || undefined, activeCategory); 
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch hints:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();

        // Real-time updates
        const channel = echo.channel('posts');
        channel.listen('PostCreated', (e: { post: Post }) => {
            setPosts((prevPosts) => {
                // If filtering by category, only add if post has that category
                if (activeCategory !== 'All') {
                    const postCategories = e.post.categories || [];
                    if (!postCategories.includes(activeCategory)) return prevPosts;
                }
                return [e.post, ...prevPosts];
            });
        });

        return () => {
            echo.leave('posts');
        };
    }, [activeCategory, location.search]);

    const handlePostCreated = (newPost: Post) => {
        setPosts((prev) => {
            if (activeCategory !== 'All') {
                 const postCategories = newPost.categories || [];
                 if (!postCategories.includes(activeCategory)) return prev;
            }
            if (prev.find(p => p.id === newPost.id)) return prev;
            return [newPost, ...prev];
        });
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold text-white">Home</h1>
                </div>
                
                {/* Category Filter Bar */}
                <div className="flex overflow-x-auto px-4 pb-2 space-x-2 no-scrollbar custom-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                                activeCategory === cat 
                                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Hint or Login Prompt */}
            {isAuthenticated ? (
                <CreatePost onPostCreated={handlePostCreated} />
            ) : (
                <div className="p-8 border-b border-white/10 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Globalhint</h2>
                    <p className="text-gray-400 mb-6">Join the conversation and connect with the world.</p>
                    <div className="flex justify-center space-x-4">
                        <Button onClick={openLogin} className="rounded-full font-bold px-8 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black shadow-lg shadow-[#D4AF37]/20">
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
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex space-x-4">
                                <div className="rounded-full bg-white/10 h-10 w-10"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-white/10 rounded"></div>
                                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <PostItem key={post.id} post={post} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">No hints yet. Be the first to hint!</div>
                )}
            </div>
        </div>
    );
};

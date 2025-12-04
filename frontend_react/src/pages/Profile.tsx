import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { PostItem } from '@/components/feed/PostItem';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { useUIStore } from '@/store/useUIStore';
import type { Post, User } from '@/types';

export const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuthStore();
    const { openChat } = useUIStore();
    const [activeTab, setActiveTab] = useState('posts');
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        const fetchData = async () => {
            if (!username) return;
            setLoading(true);
            try {
                const userData = await userService.getUser(username);
                setProfileUser(userData);
                
                const userPosts = await postService.getUserPosts(userData.id);
                setPosts(userPosts);
                // Check if following (mock logic for now, or add is_following to User type)
                // setIsFollowing(userData.is_following); 
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const handleFollowToggle = async () => {
        if (!profileUser) return;
        try {
            if (isFollowing) {
                await userService.unfollowUser(profileUser.id);
                setIsFollowing(false);
            } else {
                await userService.followUser(profileUser.id, 'shadow');
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profileUser) return <div className="p-8 text-center text-gray-500">User not found</div>;

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => window.history.back()}>
                    ←
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-white leading-tight">{profileUser.name}</h1>
                    <p className="text-xs text-gray-500">{posts.length} hints</p>
                </div>
            </div>

            {/* Cover Image */}
            <div className="h-48 bg-gray-800 relative">
                {profileUser.cover_url && (
                    <img src={profileUser.cover_url} alt="Cover" className="w-full h-full object-cover" />
                )}
            </div>

            {/* Profile Info */}
            <div className="px-4 relative">
                <div className="flex justify-between items-start">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4">
                        <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-700 overflow-hidden">
                            {profileUser.avatar ? (
                                <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                                    {profileUser.name[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 flex space-x-2">
                        {isOwnProfile ? (
                            <Button variant="outline" className="rounded-full font-bold border-white/20 text-white hover:bg-white/10">
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => openChat(profileUser)}
                                    variant="outline"
                                    className="rounded-full font-bold border-white/20 text-white hover:bg-white/10"
                                >
                                    Message
                                </Button>
                                <Button
                                    onClick={handleFollowToggle}
                                    className={`rounded-full font-bold ${isFollowing ? 'bg-transparent border border-white/20 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10' : 'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {isFollowing ? 'Unshadow' : 'Shadow'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">{profileUser.name}</h2>
                    <p className="text-gray-500">@{profileUser.username}</p>

                    {profileUser.bio && (
                        <p className="mt-3 text-white leading-relaxed">{profileUser.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-gray-500 text-sm">
                        {profileUser.location && (
                            <div className="flex items-center space-x-1">
                                <MapPin size={16} />
                                <span>{profileUser.location}</span>
                            </div>
                        )}
                        {profileUser.website && (
                            <div className="flex items-center space-x-1">
                                <LinkIcon size={16} />
                                <a href={profileUser.website} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                                    {profileUser.website.replace('https://', '')}
                                </a>
                            </div>
                        )}
                        <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>Joined {new Date(profileUser.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-3 text-sm">
                        <div className="hover:underline cursor-pointer">
                            <span className="font-bold text-white">{profileUser.following_count || 0}</span> <span className="text-gray-500">Following</span>
                        </div>
                        <div className="hover:underline cursor-pointer">
                            <span className="font-bold text-white">{profileUser.followers_count || 0}</span> <span className="text-gray-500">Followers</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    {['Hints', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`flex-1 py-4 text-sm font-bold transition relative hover:bg-white/5 ${activeTab === tab.toLowerCase() ? 'text-white' : 'text-gray-500'
                                }`}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full mx-auto w-12" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-white/10">
                {activeTab === 'posts' ? (
                    posts.length > 0 ? (
                        posts.map((post) => (
                            <PostItem key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">No posts yet.</div>
                    )
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Nothing to see here yet.
                    </div>
                )}
            </div>
        </div>
    );
};

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

import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { Twitter, Instagram, Linkedin, Facebook, Github, Youtube, Globe, MessageSquare } from 'lucide-react';

export const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuthStore();
    const { openChat } = useUIStore();
    const [activeTab, setActiveTab] = useState('posts');
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
    }, [username, isEditProfileOpen]); // Refetch when edit modal closes

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
            <div className="h-48 bg-gray-800 relative group">
                {profileUser.profile?.banner_url || profileUser.cover_url ? (
                    <img src={profileUser.profile?.banner_url || profileUser.cover_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900" />
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
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-black bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C]">
                                    {profileUser.name[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 flex space-x-2">
                        {isOwnProfile ? (
                            <Button 
                                variant="outline" 
                                className="rounded-full font-bold border-white/20 text-white hover:bg-white/10"
                                onClick={() => setIsEditProfileOpen(true)}
                            >
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
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold text-white">{profileUser.name}</h2>
                        {profileUser.profile?.is_verified && (
                            <span className="text-[#D4AF37]" title="Verified">
                                <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-5 h-5 fill-current"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>
                            </span>
                        )}
                        {profileUser.profile?.pronouns && (
                            <span className="text-gray-500 text-sm bg-white/10 px-2 py-0.5 rounded-full">{profileUser.profile.pronouns}</span>
                        )}
                    </div>
                    <p className="text-gray-500">@{profileUser.username}</p>

                    {profileUser.bio && (
                        <p className="mt-3 text-white leading-relaxed whitespace-pre-wrap">{profileUser.bio}</p>
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
                                <a href={profileUser.website} target="_blank" rel="noreferrer" className="text-[#DBBF33] hover:underline">
                                    {profileUser.website.replace('https://', '').replace('http://', '')}
                                </a>
                            </div>
                        )}
                        {profileUser.profile?.birth_date && (
                            <div className="flex items-center space-x-1">
                                <span className="text-lg">🎂</span>
                                <span>Born {new Date(profileUser.profile.birth_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>Joined {new Date(profileUser.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {/* Social Links */}
                    {profileUser.profile && (
                        <div className="flex flex-wrap gap-3 mt-4">
                            {profileUser.profile.twitter_url && <a href={profileUser.profile.twitter_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition"><Twitter size={20} /></a>}
                            {profileUser.profile.instagram_url && <a href={profileUser.profile.instagram_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E1306C] transition"><Instagram size={20} /></a>}
                            {profileUser.profile.linkedin_url && <a href={profileUser.profile.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0077B5] transition"><Linkedin size={20} /></a>}
                            {profileUser.profile.facebook_url && <a href={profileUser.profile.facebook_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition"><Facebook size={20} /></a>}
                            {profileUser.profile.youtube_url && <a href={profileUser.profile.youtube_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#FF0000] transition"><Youtube size={20} /></a>}
                            {profileUser.profile.github_url && <a href={profileUser.profile.github_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition"><Github size={20} /></a>}
                            {profileUser.profile.discord_url && <a href={profileUser.profile.discord_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#5865F2] transition"><MessageSquare size={20} /></a>}
                            {profileUser.profile.tiktok_url && <a href={profileUser.profile.tiktok_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#ff0050] transition"><Globe size={20} /></a>}
                        </div>
                    )}

                    <div className="flex space-x-4 mt-4 text-sm">
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
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37] rounded-full mx-auto w-12" />
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
            {/* Edit Profile Modal */}
            <EditProfileModal 
                isOpen={isEditProfileOpen} 
                onClose={() => setIsEditProfileOpen(false)} 
            />
        </div>
    );
};

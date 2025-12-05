import React, { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { postService } from '@/services/postService';
import { userService } from '@/services/userService';
import type { User } from '@/types';

export const RightPanel: React.FC = () => {
    const [trendingCountries, setTrendingCountries] = useState<{ country: string, count: number }[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await postService.getTrendingCountries();
                setTrendingCountries(data);
            } catch (error) {
                console.error("Failed to fetch trending countries", error);
            }
        };

        const fetchSuggested = async () => {
            try {
                const data = await userService.getSuggestedUsers();
                setSuggestedUsers(data);
            } catch (error) {
                console.error("Failed to fetch suggested users", error);
            }
        };

        fetchTrending();
        fetchSuggested();
    }, []);

    useEffect(() => {
        const handleSearch = async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const results = await userService.searchUsers(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timeoutId = setTimeout(handleSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleCountryClick = (country: string) => {
        navigate(`/?country=${country}`);
    };

    const handleFollow = async (userId: number) => {
        try {
            await userService.followUser(userId, 'shadow');
            setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to follow user", error);
        }
    };

    return (
        <aside className="hidden lg:block w-80 sticky top-0 h-screen border-l border-white/10 bg-black/20 backdrop-blur-xl p-6 z-40 overflow-y-auto custom-scrollbar">
            <div className="relative mb-8">
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                    placeholder="Search Globalhint"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-transparent focus:bg-black/50 transition-all rounded-full text-white"
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute top-14 left-0 right-0 bg-[#0f0f12] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {searchResults.map(user => (
                            <div 
                                key={user.id}
                                onClick={() => {
                                    navigate(`/profile/${user.username}`);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-xs">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{user.name}</div>
                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
                <h3 className="font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C]">
                    Country Hint
                </h3>
                <div className="space-y-4">
                    {trendingCountries.length === 0 ? (
                        <p className="text-gray-500 text-sm">No trending data yet</p>
                    ) : (
                        trendingCountries.slice(0, 5).map((item, i) => (
                            <div
                                key={i}
                                onClick={() => handleCountryClick(item.country)}
                                className="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition flex justify-between items-center group"
                            >
                                <div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                                        <MapPin size={12} />
                                        <span>Trending</span>
                                    </div>
                                    <div className="font-bold text-white group-hover:text-[#DBBF33] transition">{item.country}</div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{item.count} posts</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
                <h3 className="font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C]">
                    Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['News', 'Jobs', 'Business', 'Products', 'Travels', 'Education', 'Faith', 'Fun', 'Investments'].map((cat) => (
                        <span key={cat} className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded-full cursor-pointer transition">
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <h3 className="font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C]">
                    Who to shadow
                </h3>
                <div className="space-y-4">
                    {suggestedUsers.length === 0 ? (
                        <p className="text-gray-500 text-sm">No suggestions yet</p>
                    ) : (
                        suggestedUsers.slice(0, 3).map((user) => (
                            <div key={user.id} className="flex items-center justify-between group cursor-pointer">
                                <div 
                                    className="flex items-center space-x-3 flex-1"
                                    onClick={() => navigate(`/profile/${user.username}`)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#806921] flex items-center justify-center text-black font-bold overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name[0]
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white group-hover:text-[#DBBF33] transition">{user.name}</div>
                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                    </div>
                                </div>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="h-8 text-xs"
                                    onClick={() => handleFollow(user.id)}
                                >
                                    Shadow
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
};

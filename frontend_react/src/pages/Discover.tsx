import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

interface SearchResult {
    users: any[];
    posts: any[];
}

const Discover: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'top' | 'accounts' | 'tags'>('top');

    // Debounced Search
    const search = useCallback(
        debounce(async (q: string) => {
            if (!q.trim()) {
                setResults({ users: [], posts: [] });
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { default: api } = await import('@/lib/axios');
                const response = await api.get(`/search?q=${encodeURIComponent(q)}`);
                setResults(response.data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        search(query);
    }, [query, search]);

    return (
        <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
            {/* Search Header */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="relative max-w-2xl mx-auto">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-[#262626] text-white pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] placeholder-gray-500"
                        autoFocus
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                {query && (
                    <div className="flex justify-center gap-8 mt-4 text-sm font-medium border-b border-white/10">
                        <button 
                            onClick={() => setActiveTab('top')}
                            className={`pb-3 px-2 ${activeTab === 'top' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Top
                        </button>
                        <button 
                            onClick={() => setActiveTab('accounts')}
                            className={`pb-3 px-2 ${activeTab === 'accounts' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Accounts
                        </button>
                        <button 
                            onClick={() => setActiveTab('tags')}
                            className={`pb-3 px-2 ${activeTab === 'tags' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Tags
                        </button>
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto p-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                    </div>
                ) : !query ? (
                    /* Initial State / Discover Grid (Mock for now, can be random posts) */
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {/* Placeholder for "Explore Grid" when no search */}
                        <div className="col-span-3 text-center py-20 text-gray-500">
                            <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Search for users, posts, or keywords</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Users Section */}
                        {(activeTab === 'top' || activeTab === 'accounts') && results.users.length > 0 && (
                            <div className="space-y-4">
                                {activeTab === 'top' && <h3 className="text-lg font-bold">Accounts</h3>}
                                {results.users.map(user => (
                                    <Link to={`/profile/${user.username}`} key={user.id} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-xl transition">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                                    {user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.username}</p>
                                            <p className="text-gray-400 text-sm">{user.name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Posts Grid */}
                        {(activeTab === 'top' || activeTab === 'tags') && results.posts.length > 0 && (
                            <div>
                                {activeTab === 'top' && <h3 className="text-lg font-bold mb-4 mt-6">Posts</h3>}
                                <div className="grid grid-cols-3 gap-1">
                                    {results.posts.map(post => (
                                        <div key={post.id} className="aspect-square bg-gray-900 relative group overflow-hidden cursor-pointer">
                                            {post.media_url ? (
                                                post.media_type === 'video' ? (
                                                    <video src={post.media_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={post.media_url} alt="Post" className="w-full h-full object-cover" />
                                                )
                                            ) : (
                                                <div className="w-full h-full p-4 flex items-center justify-center text-center text-xs text-gray-400 bg-[#1a1a1a]">
                                                    {post.content.substring(0, 50)}...
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 text-white font-bold">
                                                <span>❤️ {post.votes_count}</span>
                                                <span>💬 {post.comments_count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {results.users.length === 0 && results.posts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>No results found for "{query}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;

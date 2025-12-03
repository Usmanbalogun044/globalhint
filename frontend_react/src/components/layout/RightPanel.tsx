import React, { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const RightPanel: React.FC = () => {
    const [trendingCountries, setTrendingCountries] = useState<{ country: string, count: number }[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // In a real app, you'd fetch this from the backend
                // const data = await postService.getTrendingCountries();
                // setTrendingCountries(data);

                // Mock data for now until backend route is fully verified
                setTrendingCountries([
                    { country: 'USA', count: 1250 },
                    { country: 'Japan', count: 980 },
                    { country: 'Brazil', count: 850 },
                    { country: 'India', count: 720 },
                    { country: 'UK', count: 640 },
                ]);
            } catch (error) {
                console.error("Failed to fetch trending countries", error);
            }
        };
        fetchTrending();
    }, []);

    const handleCountryClick = (country: string) => {
        // Navigate to home with country filter (implementation depends on routing strategy)
        // For now, let's assume we pass it as a query param to home or a specific page
        navigate(`/?country=${country}`);
        window.location.reload(); // Force reload to trigger useEffect in Home (simple fix)
    };

    return (
        <aside className="hidden xl:block w-80 sticky top-0 h-screen border-l border-white/10 bg-black/20 backdrop-blur-xl p-6 z-40">
            <div className="relative mb-8">
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                    placeholder="Search Globalhint"
                    className="pl-10 h-12 bg-white/5 border-transparent focus:bg-black/50 transition-all rounded-full text-white"
                />
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6">
                <h3 className="font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                    Trending Countries
                </h3>
                <div className="space-y-4">
                    {trendingCountries.map((item, i) => (
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
                                <div className="font-bold text-white group-hover:text-indigo-400 transition">{item.country}</div>
                            </div>
                            <div className="text-xs text-gray-500 font-mono">{item.count} posts</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <h3 className="font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                    Who to follow
                </h3>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                                <div>
                                    <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition">User Name</div>
                                    <div className="text-xs text-gray-500">@username</div>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" className="h-8 text-xs">Follow</Button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

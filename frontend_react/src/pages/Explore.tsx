import React, { useState, useEffect } from 'react';
import WorldMap from '../components/map/WorldMap';
import { Cloud, Newspaper, Globe, ChevronRight } from 'lucide-react';

const Explore: React.FC = () => {
    const [news, setNews] = useState<any[]>([]);
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { default: api } = await import('@/lib/axios');
                
                // Get Location
                let lat = 40.7128; // Default NYC
                let lon = -74.0060;

                if (navigator.geolocation) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                        });
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;
                    } catch (e) {
                        console.warn("Geolocation failed or denied, using default.");
                    }
                }

                // Fetch Weather
                const weatherRes = await api.get(`/global/weather?lat=${lat}&lon=${lon}`);
                setWeather(weatherRes.data);

                // Fetch News
                const newsRes = await api.get('/global/news');
                // Format News Data
                const formattedNews = newsRes.data.map((article: any) => ({
                    title: article.title,
                    source: article.source.name,
                    time: new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    url: article.url
                }));
                setNews(formattedNews);

            } catch (error) {
                console.error("Failed to fetch global data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="h-[calc(100vh-80px)] w-full flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
            {/* Main Map Area */}
            <div className="flex-1 h-full relative rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/20 bg-black/40 backdrop-blur-sm">
                <div className="absolute top-6 left-6 z-10">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-[#D4AF37]" size={32} />
                        Global Vision
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 ml-11">Live real-time updates from around the world</p>
                </div>
                
                <WorldMap />

                {/* Live Stats Overlay */}
                <div className="absolute bottom-6 left-6 z-10 flex gap-4">
                    <div className="bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-4 min-w-[140px]">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Users</p>
                        <p className="text-2xl font-bold text-white">12,453</p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-500 text-xs">+142 now</span>
                        </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl p-4 min-w-[140px]">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Live Posts</p>
                        <p className="text-2xl font-bold text-white">842</p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                            <span className="text-[#D4AF37] text-xs">Trending</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="w-full lg:w-80 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Weather Widget */}
                <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Cloud size={80} className="text-[#D4AF37]" />
                    </div>
                    
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Cloud size={14} className="text-[#D4AF37]" /> Live Weather
                    </h3>
                    
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-8 bg-gray-800 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-5xl font-bold text-white">{weather?.temp}°</span>
                                <span className="text-xl text-gray-400 mb-2">C</span>
                            </div>
                            <p className="text-[#D4AF37] font-medium text-lg">{weather?.condition}</p>
                            <p className="text-gray-500 text-sm mt-1">{weather?.location}</p>
                        </div>
                    )}
                </div>

                {/* News Widget */}
                <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-2xl p-5 shadow-lg flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Newspaper size={14} className="text-[#D4AF37]" /> Global Headlines
                        </h3>
                        <button className="text-[#D4AF37] hover:text-[#E4CF66] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                                </div>
                            ))
                        ) : (
                            news.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => window.open(item.url, '_blank')}
                                    className="group cursor-pointer border-b border-white/5 pb-3 last:border-0 last:pb-0"
                                >
                                    <h4 className="text-gray-200 text-sm font-medium leading-snug group-hover:text-[#D4AF37] transition-colors">
                                        {item.title}
                                    </h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[#D4AF37] text-xs">{item.source}</span>
                                        <span className="text-gray-600 text-xs">{item.time}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;

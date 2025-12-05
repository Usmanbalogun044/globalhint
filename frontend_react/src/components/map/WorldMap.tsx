import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { echo } from '@/lib/echo';

// Note: You need to get a Mapbox Access Token from https://account.mapbox.com/
// and add it to your .env file as VITE_MAPBOX_ACCESS_TOKEN
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZG9sbGFyaHVudGVyIiwiYSI6ImNtaXQ2ODBvbTA3ZW0zcHNjOXdiY2lkY3MifQ.ZI9JMSwvBWO5JP8eX6Tt5g'; 

mapboxgl.accessToken = MAPBOX_TOKEN;

interface UserLocation {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    latitude: number;
    longitude: number;
}

const WorldMap: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<{ [key: number]: mapboxgl.Marker }>({});
    const [users, setUsers] = useState<UserLocation[]>([]);
    const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [0, 20],
            zoom: 1.5,
            projection: { name: 'globe' } as any
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.current.on('style.load', () => {
            map.current?.setFog({
                range: [0.5, 10],
                color: '#000000',
                "horizon-blend": 0.05,
                "high-color": '#1a1a1a',
                "space-color": '#000000',
                "star-intensity": 0.6
            } as any);
        });

        // Initial Mock Data (Replace with API call later)
        const initialUsers = [
            { id: 1, name: 'User 1', username: 'user1', avatar: null, latitude: 40.7128, longitude: -74.0060 }, // NYC
            { id: 2, name: 'User 2', username: 'user2', avatar: null, latitude: 51.5074, longitude: -0.1278 }, // London
            { id: 3, name: 'User 3', username: 'user3', avatar: null, latitude: 35.6762, longitude: 139.6503 }, // Tokyo
            { id: 4, name: 'User 4', username: 'user4', avatar: null, latitude: -33.8688, longitude: 151.2093 }, // Sydney
            { id: 5, name: 'User 5', username: 'user5', avatar: null, latitude: 6.5244, longitude: 3.3792 }, // Lagos
        ];
        setUsers(initialUsers);

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Calculate Distance (Haversine Formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1);
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    // Handle Location Sharing
    const toggleLocationSharing = () => {
        if (isSharing) {
            setIsSharing(false);
            setMyLocation(null);
            // Ideally call API to stop sharing
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setMyLocation({ lat: latitude, lng: longitude });
                        setIsSharing(true);

                        // Update Map Center (Optional, maybe just once)
                        // map.current?.flyTo({ center: [longitude, latitude], zoom: 4 });

                        // Send to Backend
                        import('@/lib/axios').then(({ default: api }) => {
                            api.post('/global/location', {
                                latitude,
                                longitude,
                                is_location_public: true
                            }).catch(console.error);
                        });
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        alert("Unable to retrieve your location.");
                    }
                );
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }
    };

    // Handle Markers
    useEffect(() => {
        if (!map.current) return;

        users.forEach(user => {
            // Calculate distance if myLocation is available
            const distance = myLocation 
                ? calculateDistance(myLocation.lat, myLocation.lng, user.latitude, user.longitude) 
                : null;

            const popupContent = `
                <div class="bg-black/90 border border-[#D4AF37]/50 rounded-xl p-3 shadow-2xl min-w-[150px]">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full border border-[#D4AF37] overflow-hidden">
                            ${user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover" />` : 
                            `<div class="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center text-black font-bold">${user.name[0]}</div>`}
                        </div>
                        <div>
                            <p class="text-[#D4AF37] font-bold text-sm">${user.name}</p>
                            <p class="text-gray-400 text-xs">@${user.username}</p>
                            ${distance ? `<p class="text-[#D4AF37] text-xs mt-1 font-mono">📍 ${distance} km away</p>` : ''}
                        </div>
                    </div>
                </div>
            `;

            if (markers.current[user.id]) {
                // Update existing marker position
                markers.current[user.id].setLngLat([user.longitude, user.latitude]);
                // Update popup content
                markers.current[user.id].getPopup()?.setHTML(popupContent);
            } else {
                const el = document.createElement('div');
                el.className = 'marker';
                el.innerHTML = `
                    <div class="group relative cursor-pointer">
                        <div class="w-8 h-8 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-black shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-transform transform group-hover:scale-125">
                            ${user.avatar ? `<img src="${user.avatar}" alt="${user.username}" class="w-full h-full object-cover" />` : 
                            `<div class="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center text-black font-bold text-xs">${user.name[0]}</div>`}
                        </div>
                        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_5px_#D4AF37]"></div>
                    </div>
                `;

                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'custom-popup' }).setHTML(popupContent);

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([user.longitude, user.latitude])
                    .setPopup(popup)
                    .addTo(map.current!);

                markers.current[user.id] = marker;
            }
        });
    }, [users, myLocation]); // Re-run when users or myLocation changes

    // Real-time Updates
    useEffect(() => {
        const channel = echo.channel('global-map');
        
        channel.listen('UserLocationUpdated', (e: any) => {
            setUsers(prevUsers => {
                const index = prevUsers.findIndex(u => u.id === e.id);
                if (index !== -1) {
                    const newUsers = [...prevUsers];
                    newUsers[index] = { ...newUsers[index], ...e };
                    return newUsers;
                } else {
                    return [...prevUsers, e];
                }
            });
        });

        return () => {
            echo.leave('global-map');
        };
    }, []);

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative">
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

            {/* Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
                <button 
                    onClick={toggleLocationSharing}
                    className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${isSharing ? 'bg-[#D4AF37] text-black animate-pulse' : 'bg-black/60 text-[#D4AF37] border border-[#D4AF37]/50'}`}
                    title={isSharing ? "Stop Sharing Location" : "Share My Location"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </button>
            </div>
        </div>
    );
};

export default WorldMap;

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Radio, Mic, MicOff, Video, VideoOff, MessageSquare, Heart, Share2 } from 'lucide-react';

export const LiveStream: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLive, setIsLive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [viewers, setViewers] = useState(0);
    const [likes, setLikes] = useState(0);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLive) {
            interval = setInterval(() => {
                setViewers(prev => prev + Math.floor(Math.random() * 5));
                setLikes(prev => prev + Math.floor(Math.random() * 10));
            }, 2000);
        } else {
            setViewers(0);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    const toggleLive = () => {
        setIsLive(!isLive);
    };

    return (
        <div className="w-full h-[calc(100vh-80px)] bg-black relative flex flex-col">
            {/* Video Feed */}
            <div className="flex-1 relative overflow-hidden bg-gray-900">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <VideoOff size={64} />
                    </div>
                )}

                {/* Overlay UI */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                    {isLive ? (
                        <div className="bg-red-600 text-white px-3 py-1 rounded-md font-bold text-sm animate-pulse">
                            LIVE
                        </div>
                    ) : (
                        <div className="bg-gray-600 text-white px-3 py-1 rounded-md font-bold text-sm">
                            OFFLINE
                        </div>
                    )}
                    <div className="bg-black/50 text-white px-3 py-1 rounded-md font-bold text-sm flex items-center">
                        <Radio size={14} className="mr-1" /> {viewers}
                    </div>
                </div>

                {/* Chat Overlay (Mock) */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                    <div className="space-y-2 mb-4">
                        <div className="text-white text-sm"><span className="font-bold text-indigo-400">User1</span> Hello!</div>
                        <div className="text-white text-sm"><span className="font-bold text-pink-400">User2</span> Cool stream!</div>
                        <div className="text-white text-sm"><span className="font-bold text-green-400">User3</span> 🔥🔥🔥</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="h-20 bg-gray-900 border-t border-white/10 flex items-center justify-between px-6">
                <div className="flex space-x-4">
                    <Button 
                        onClick={() => setIsMuted(!isMuted)} 
                        variant="ghost" 
                        size="icon" 
                        className={`rounded-full ${isMuted ? 'text-red-500 bg-red-500/10' : 'text-white hover:bg-white/10'}`}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button 
                        onClick={() => setIsVideoOff(!isVideoOff)} 
                        variant="ghost" 
                        size="icon" 
                        className={`rounded-full ${isVideoOff ? 'text-red-500 bg-red-500/10' : 'text-white hover:bg-white/10'}`}
                    >
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                </div>

                <Button 
                    onClick={toggleLive} 
                    className={`rounded-full px-8 font-bold ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                >
                    {isLive ? 'End Stream' : 'Go Live'}
                </Button>

                <div className="flex space-x-4">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                        <MessageSquare />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full relative">
                        <Heart />
                        {likes > 0 && (
                            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] px-1 rounded-full">
                                {likes}
                            </span>
                        )}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                        <Share2 />
                    </Button>
                </div>
            </div>
        </div>
    );
};

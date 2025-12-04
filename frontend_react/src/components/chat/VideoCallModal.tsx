import React, { useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { videoCallService } from '@/services/videoCallService';
import { echo } from '@/lib/echo';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};

export const VideoCallModal: React.FC = () => {
    const { activeCall, endCall, incomingCall, setIncomingCall } = useUIStore();
    const { user } = useAuthStore();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    // Remote stream state removed as it was unused (ref used directly)
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                peerConnection.current = new RTCPeerConnection(configuration);

                stream.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, stream);
                });

                peerConnection.current.ontrack = (event) => {
                    // setRemoteStream(event.streams[0]); 
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate && activeCall) {
                        videoCallService.sendIceCandidate(activeCall.user.id, event.candidate);
                    }
                };

                if (activeCall?.isCaller) {
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);
                    await videoCallService.initiate(activeCall.user.id, offer);
                } else if (incomingCall) {
                     // Answer logic handled in a separate effect or triggered by user acceptance
                }

            } catch (error) {
                console.error("Error accessing media devices:", error);
                endCall();
            }
        };

        if (activeCall) {
            startCall();
        }

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
            peerConnection.current?.close();
        };
    }, [activeCall]);

    // Handle incoming answer (for caller)
    useEffect(() => {
        if (!activeCall?.isCaller || !user) return;

        const channel = echo.private(`call.${user.id}`);
        channel.listen('CallAccepted', async (e: { answer: RTCSessionDescriptionInit }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(e.answer));
            }
        });

        channel.listen('IceCandidateSent', async (e: { candidate: RTCIceCandidateInit }) => {
             if (peerConnection.current) {
                 await peerConnection.current.addIceCandidate(new RTCIceCandidate(e.candidate));
             }
        });

        return () => {
            echo.leave(`call.${user.id}`);
        };
    }, [activeCall, user]);

    // Handle incoming offer (for receiver)
    useEffect(() => {
        const handleReceiverSetup = async () => {
            if (activeCall && !activeCall.isCaller && incomingCall && peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                await videoCallService.accept(activeCall.user.id, answer);
                // Clear incoming call as it's now active
                setIncomingCall(null); 
            }
        };

        if (activeCall && !activeCall.isCaller && peerConnection.current) {
            handleReceiverSetup();
        }
    }, [activeCall, incomingCall]);


    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!activeCall) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
                {/* Remote Video */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                />
                
                {/* Local Video */}
                <div className="absolute top-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <Button 
                        onClick={toggleMute} 
                        variant="secondary" 
                        size="icon" 
                        className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </Button>
                    
                    <Button 
                        onClick={endCall} 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
                    >
                        <PhoneOff size={28} />
                    </Button>

                    <Button 
                        onClick={toggleVideo} 
                        variant="secondary" 
                        size="icon" 
                        className={`rounded-full w-12 h-12 ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </Button>
                </div>

                <div className="absolute top-4 left-4 text-white">
                    <h2 className="text-xl font-bold shadow-black drop-shadow-md">{activeCall.user.name}</h2>
                    <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm">
                        {activeCall?.isCaller ? 'Outgoing Call' : 'Incoming Call'}
                    </div>
                </div>
            </div>
        </div>
    );
};

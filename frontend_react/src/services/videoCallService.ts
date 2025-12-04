import api from '@/lib/axios';

export const videoCallService = {
    async initiate(receiverId: number, offer: RTCSessionDescriptionInit): Promise<void> {
        await api.post('/video-call/initiate', { receiverId, offer });
    },

    async accept(callerId: number, answer: RTCSessionDescriptionInit): Promise<void> {
        await api.post('/video-call/accept', { callerId, answer });
    },

    async sendIceCandidate(toUserId: number, candidate: RTCIceCandidate): Promise<void> {
        await api.post('/video-call/ice-candidate', { to_user_id: toUserId, candidate });
    }
};

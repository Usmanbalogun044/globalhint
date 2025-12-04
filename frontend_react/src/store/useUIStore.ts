import { create } from 'zustand';
import type { User } from '@/types';

interface UIState {
    isLoginOpen: boolean;
    isRegisterOpen: boolean;
    openLogin: () => void;
    closeLogin: () => void;
    openRegister: () => void;
    closeRegister: () => void;
    switchToRegister: () => void;
    switchToLogin: () => void;
    
    activeChatUser: User | null;
    openChat: (user: User) => void;
    closeChat: () => void;

    isCreatePostOpen: boolean;
    openCreatePost: () => void;
    closeCreatePost: () => void;

    incomingCall: { caller: User, offer: RTCSessionDescriptionInit } | null;
    setIncomingCall: (call: { caller: User, offer: RTCSessionDescriptionInit } | null) => void;
    activeCall: { user: User, isCaller: boolean } | null;
    setActiveCall: (call: { user: User, isCaller: boolean } | null) => void;
    endCall: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isLoginOpen: false,
    isRegisterOpen: false,

    openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false }),
    closeLogin: () => set({ isLoginOpen: false }),

    openRegister: () => set({ isRegisterOpen: true, isLoginOpen: false }),
    closeRegister: () => set({ isRegisterOpen: false }),

    switchToRegister: () => set({ isLoginOpen: false, isRegisterOpen: true }),
    switchToLogin: () => set({ isRegisterOpen: false, isLoginOpen: true }),

    activeChatUser: null,
    openChat: (user) => set({ activeChatUser: user }),
    closeChat: () => set({ activeChatUser: null }),

    isCreatePostOpen: false,
    openCreatePost: () => set({ isCreatePostOpen: true }),
    closeCreatePost: () => set({ isCreatePostOpen: false }),

    incomingCall: null,
    setIncomingCall: (call) => set({ incomingCall: call }),
    activeCall: null,
    setActiveCall: (call) => set({ activeCall: call }),
    endCall: () => set({ activeCall: null, incomingCall: null }),
}));

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
    
    isForgotPasswordOpen: boolean;
    openForgotPassword: () => void;
    closeForgotPassword: () => void;
    switchToForgotPassword: () => void;

    verificationEmail: string;
    setVerificationEmail: (email: string) => void;

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
    isForgotPasswordOpen: false,
    verificationEmail: '',

    openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false, isForgotPasswordOpen: false }),
    closeLogin: () => set({ isLoginOpen: false }),

    openRegister: () => set({ isRegisterOpen: true, isLoginOpen: false, isForgotPasswordOpen: false }),
    closeRegister: () => set({ isRegisterOpen: false, verificationEmail: '' }),

    openForgotPassword: () => set({ isForgotPasswordOpen: true, isLoginOpen: false, isRegisterOpen: false }),
    closeForgotPassword: () => set({ isForgotPasswordOpen: false }),

    switchToRegister: () => set({ isLoginOpen: false, isRegisterOpen: true, isForgotPasswordOpen: false }),
    switchToLogin: () => set({ isRegisterOpen: false, isLoginOpen: true, isForgotPasswordOpen: false }),
    switchToForgotPassword: () => set({ isLoginOpen: false, isForgotPasswordOpen: true, isRegisterOpen: false }),

    setVerificationEmail: (email) => set({ verificationEmail: email }),

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

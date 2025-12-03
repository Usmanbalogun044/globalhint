import { create } from 'zustand';
import type { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (user: User, token: string) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
    },

    logout: async () => {
        try {
            // Optional: Call logout API if needed, but usually we just clear local state
            // await authService.logout(); 
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        if (!token) {
            get().logout();
            return false;
        }
        return true;
    }
}));

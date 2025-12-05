import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
    onSwitchToForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const { setVerificationEmail } = useUIStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            login(response.data.user, response.data.access_token);
            onClose();
            window.location.reload(); 
        } catch (err: any) {
            if (err.response?.status === 403 && err.response?.data?.requires_verification) {
                setVerificationEmail(err.response.data.email);
                onSwitchToRegister(); // This will now open RegisterModal at Step 2
                return;
            }
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0f0f12] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition z-10">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to continue to Globalhint</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                            />
                        </div>
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button 
                                    type="button"
                                    onClick={onSwitchToForgotPassword}
                                    className="text-sm text-gray-400 hover:text-[#DBBF33] transition"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <button onClick={onSwitchToRegister} className="text-[#DBBF33] hover:text-[#E4CF66] font-medium transition">
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

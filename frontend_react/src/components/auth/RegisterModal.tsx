import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        country: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/register', formData);
            login(response.data.user, response.data.access_token);
            onClose();
            window.location.reload();
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError(err.response?.data?.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0f0f12] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-gray-400">Join the community today</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-12 bg-white/5 border-white/10 text-white"
                        />
                        <Input
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="h-12 bg-white/5 border-white/10 text-white"
                        />
                        <Input
                            name="email"
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-12 bg-white/5 border-white/10 text-white"
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="h-12 bg-white/5 border-white/10 text-white"
                        />
                        <Input
                            name="password_confirmation"
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            className="h-12 bg-white/5 border-white/10 text-white"
                        />
                        <Input
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={handleChange}
                            className="h-12 bg-white/5 border-white/10 text-white"
                        />

                        <Button type="submit" className="w-full h-12 text-lg font-semibold mt-4" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <button onClick={onSwitchToLogin} className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

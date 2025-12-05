import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Globe } from 'lucide-react';
import { countries } from '@/lib/countries';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        country: '',
        otp: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const { verificationEmail } = useUIStore();

    React.useEffect(() => {
        if (isOpen && verificationEmail) {
            setFormData(prev => ({ ...prev, email: verificationEmail }));
            setStep(2);
        } else if (isOpen) {
            setStep(1);
            setFormData(prev => ({ ...prev, email: '', otp: '' }));
        }
    }, [isOpen, verificationEmail]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email: formData.email, type: 'register' });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email: formData.email, otp: formData.otp });
            
            if (response.data.access_token) {
                // User exists and is now verified, log them in
                login(response.data.user, response.data.access_token);
                onClose();
                window.location.reload();
                return;
            }

            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
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

    const renderStep1 = () => (
        <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <Input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black" disabled={loading}>
                {loading ? 'Sending Code...' : 'Continue'}
            </Button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">We sent a 6-digit code to <span className="text-white">{formData.email}</span></p>
            </div>
            <div className="flex justify-center">
                <Input
                    name="otp"
                    type="text"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    className="h-14 w-40 text-center text-2xl tracking-widest bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-sm text-gray-500 hover:text-[#DBBF33] mt-2"
            >
                Change Email
            </button>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <Input
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
            </div>
            <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500 font-bold">@</span>
                <Input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="h-12 pl-8 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
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
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <Input
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    className="h-12 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            <div className="relative">
                <Globe className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="h-12 w-full pl-10 bg-white/5 border border-white/10 rounded-md text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    required
                >
                    <option value="" disabled className="bg-gray-900">Select Country</option>
                    {countries.map((country) => (
                        <option key={country} value={country} className="bg-gray-900 text-white">
                            {country}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black" disabled={loading}>
                {loading ? 'Creating Account...' : 'Finish Registration'}
            </Button>
        </form>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0f0f12] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition z-10">
                    <X size={24} />
                </button>

                {step > 1 && (
                    <button onClick={() => setStep(step - 1 as any)} className="absolute left-4 top-4 text-gray-400 hover:text-white transition z-10">
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {step === 1 ? 'Create Account' : step === 2 ? 'Verify Email' : 'Complete Profile'}
                        </h2>
                        <p className="text-gray-400">
                            {step === 1 ? 'Join the community today' : step === 2 ? 'Enter the code sent to your email' : 'Tell us a bit about yourself'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <button onClick={onSwitchToLogin} className="text-[#DBBF33] hover:text-[#E4CF66] font-medium transition">
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

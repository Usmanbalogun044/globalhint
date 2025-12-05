import React, { useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email, type: 'reset' });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                password,
                password_confirmation: passwordConfirmation
            });
            setSuccess('Password reset successfully! You can now login.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to reset password');
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
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">Enter the code sent to <span className="text-white">{email}</span></p>
            </div>
            
            <div className="flex justify-center mb-4">
                <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="h-14 w-40 text-center text-2xl tracking-widest bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
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

            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
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

            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-[#D4AF37] hover:bg-[#AA8C2C] text-black" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
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
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h2>
                        <p className="text-gray-400">
                            {step === 1 ? 'Enter your email to receive a code' : 'Create a new password'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-xl mb-6 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Remember your password?{' '}
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

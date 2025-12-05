import React, { useState, useEffect } from 'react';
import { X, Upload, Globe, Twitter, Instagram, Linkedin, Facebook, Github, Youtube, MessageSquare, Shield, Briefcase, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/userService';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, login } = useAuthStore();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        location: '',
        website: '',
        birth_date: '',
        gender: '',
        pronouns: '',
        
        // Socials
        linkedin_url: '',
        instagram_url: '',
        twitter_url: '',
        youtube_url: '',
        tiktok_url: '',
        facebook_url: '',
        github_url: '',
        dribbble_url: '',
        behance_url: '',
        snapchat_url: '',
        discord_url: '',
        telegram_url: '',
        whatsapp_number: '',

        // Professional
        business_email: '',
        business_category: '',
        is_business_account: false,

        // Privacy
        is_private: false,
        allow_messages_from: 'everyone',
        email_public: false,
        phone_public: false,
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                display_name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                birth_date: user.profile?.birth_date || '',
                gender: user.profile?.gender || '',
                pronouns: user.profile?.pronouns || '',
                
                linkedin_url: user.profile?.linkedin_url || '',
                instagram_url: user.profile?.instagram_url || '',
                twitter_url: user.profile?.twitter_url || '',
                youtube_url: user.profile?.youtube_url || '',
                tiktok_url: user.profile?.tiktok_url || '',
                facebook_url: user.profile?.facebook_url || '',
                github_url: user.profile?.github_url || '',
                dribbble_url: user.profile?.dribbble_url || '',
                behance_url: user.profile?.behance_url || '',
                snapchat_url: user.profile?.snapchat_url || '',
                discord_url: user.profile?.discord_url || '',
                telegram_url: user.profile?.telegram_url || '',
                whatsapp_number: user.profile?.whatsapp_number || '',

                business_email: user.profile?.business_email || '',
                business_category: user.profile?.business_category || '',
                is_business_account: user.profile?.is_business_account || false,

                is_private: user.profile?.is_private || false,
                allow_messages_from: user.profile?.allow_messages_from || 'everyone',
                email_public: user.profile?.email_public || false,
                phone_public: user.profile?.phone_public || false,
            });
            setAvatarPreview(user.avatar || null);
            setBannerPreview(user.profile?.banner_url || user.cover_url || null);
        }
    }, [user, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(preview);
            } else {
                setBannerFile(file);
                setBannerPreview(preview);
            }
        }
    };

    const ensureUrl = (url: string) => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                // Skip null or undefined
                if (value === null || value === undefined) return;
                
                // Skip empty strings
                if (typeof value === 'string' && value.trim() === '') return;

                let finalValue = value;

                // Normalize URLs
                if (key.includes('_url') || key === 'website') {
                    if (typeof value === 'string' && value.trim() !== '') {
                        finalValue = ensureUrl(value.trim());
                    }
                }

                // Handle boolean values specifically for FormData
                if (typeof finalValue === 'boolean') {
                    data.append(key, finalValue ? '1' : '0');
                } else {
                    data.append(key, String(finalValue));
                }
            });

            if (avatarFile) data.append('avatar', avatarFile);
            if (bannerFile) data.append('banner', bannerFile);

            const updatedUser = await userService.updateProfile(data);
            
            // Update auth store
            if (user && updatedUser) {
                const token = localStorage.getItem('token');
                if (token) {
                    login(updatedUser, token);
                }
            }
            
            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: 'Profile updated successfully', type: 'success' } 
            }));
            onClose();
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            const validationErrors = error.response?.data?.errors;
            
            let displayMessage = errorMessage;
            if (validationErrors) {
                // Get the first validation error
                const firstError = Object.values(validationErrors)[0] as string[];
                if (firstError && firstError.length > 0) {
                    displayMessage = firstError[0];
                }
            }

            window.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { message: displayMessage, type: 'error' } 
            }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: UserIcon },
        { id: 'socials', label: 'Socials', icon: Globe },
        { id: 'professional', label: 'Professional', icon: Briefcase },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f0f12] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 border-r border-white/10 bg-black/20 p-4 space-y-2 hidden md:block overflow-y-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold' 
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <tab.icon size={20} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile Tabs (Horizontal) */}
                    <div className="md:hidden flex overflow-x-auto border-b border-white/10 p-2 space-x-2 bg-black/20">
                         {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-[#D4AF37] text-black font-bold' 
                                        : 'text-gray-400 bg-white/5'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-br from-black to-[#1a1a20]">
                        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
                            
                            {/* Media Uploads (Always visible or in General?) Let's put in General for now or separate */}
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Banner Upload */}
                                    <div className="relative h-48 rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                                        {bannerPreview ? (
                                            <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                No Banner
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full flex items-center space-x-2 backdrop-blur-md border border-white/20 transition">
                                                <Upload size={18} />
                                                <span>Change Banner</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Avatar Upload */}
                                    <div className="relative -mt-16 ml-6 w-32 h-32 rounded-full border-4 border-[#0f0f12] bg-black overflow-hidden group">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white/10">
                                                <UserIcon size={40} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition">
                                                <Upload size={18} />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Display Name</label>
                                            <Input 
                                                value={formData.display_name} 
                                                onChange={e => setFormData({...formData, display_name: e.target.value})}
                                                className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Pronouns</label>
                                            <Input 
                                                value={formData.pronouns} 
                                                onChange={e => setFormData({...formData, pronouns: e.target.value})}
                                                placeholder="he/him, she/her"
                                                className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-400">Bio</label>
                                            <textarea 
                                                value={formData.bio} 
                                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                                className="w-full h-24 rounded-xl bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition resize-none"
                                                placeholder="Tell the world about yourself..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Location</label>
                                            <Input 
                                                value={formData.location} 
                                                onChange={e => setFormData({...formData, location: e.target.value})}
                                                className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Website</label>
                                            <Input 
                                                value={formData.website} 
                                                onChange={e => setFormData({...formData, website: e.target.value})}
                                                className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Birth Date</label>
                                            <Input 
                                                type="date"
                                                value={formData.birth_date} 
                                                onChange={e => setFormData({...formData, birth_date: e.target.value})}
                                                className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'socials' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'twitter_url', label: 'Twitter / X', icon: Twitter },
                                            { key: 'instagram_url', label: 'Instagram', icon: Instagram },
                                            { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin },
                                            { key: 'facebook_url', label: 'Facebook', icon: Facebook },
                                            { key: 'youtube_url', label: 'YouTube', icon: Youtube },
                                            { key: 'github_url', label: 'GitHub', icon: Github },
                                            { key: 'tiktok_url', label: 'TikTok', icon: Globe }, // Lucide doesn't have TikTok yet
                                            { key: 'discord_url', label: 'Discord', icon: MessageSquare },
                                        ].map((social) => (
                                            <div key={social.key} className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 flex items-center space-x-2">
                                                    <social.icon size={14} />
                                                    <span>{social.label}</span>
                                                </label>
                                                <Input 
                                                    // @ts-ignore
                                                    value={formData[social.key]} 
                                                    // @ts-ignore
                                                    onChange={e => setFormData({...formData, [social.key]: e.target.value})}
                                                    placeholder={`https://${social.label.toLowerCase().replace(' ', '')}.com/...`}
                                                    className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'professional' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-[#DBBF33]">Professional Account</h4>
                                                <p className="text-sm text-gray-400">Enable features for creators and businesses</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.is_business_account}
                                                    onChange={e => setFormData({...formData, is_business_account: e.target.checked})}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Business Email</label>
                                        <Input 
                                            value={formData.business_email} 
                                            onChange={e => setFormData({...formData, business_email: e.target.value})}
                                            className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Category</label>
                                        <Input 
                                            value={formData.business_category} 
                                            onChange={e => setFormData({...formData, business_category: e.target.value})}
                                            placeholder="e.g. Creator, Artist, Entrepreneur"
                                            className="bg-white/5 border-white/10 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white">Private Account</h4>
                                                <p className="text-sm text-gray-400">Only followers can see your posts</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.is_private}
                                                    onChange={e => setFormData({...formData, is_private: e.target.checked})}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white">Show Email Publicly</h4>
                                                <p className="text-sm text-gray-400">Display email on your profile</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.email_public}
                                                    onChange={e => setFormData({...formData, email_public: e.target.checked})}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Allow Messages From</label>
                                            <select 
                                                value={formData.allow_messages_from}
                                                onChange={e => setFormData({...formData, allow_messages_from: e.target.value})}
                                                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white px-3 focus:outline-none focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                                            >
                                                <option value="everyone">Everyone</option>
                                                <option value="followers">Followers Only</option>
                                                <option value="none">No One</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5 text-white">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="bg-[#D4AF37] hover:bg-[#AA8C2C] text-black px-8 font-bold"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { RightPanel } from './RightPanel';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useUIStore } from '@/store/useUIStore';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const {
        isLoginOpen, closeLogin, openLogin,
        isRegisterOpen, closeRegister, openRegister,
        switchToRegister, switchToLogin
    } = useUIStore();

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30">
            <div className="flex justify-center max-w-[1920px] mx-auto">
                <Sidebar onOpenLogin={openLogin} onOpenRegister={openRegister} />

                <main className="flex-1 min-h-screen border-r border-white/10 max-w-2xl w-full pb-20 md:pb-0">
                    {children}
                </main>

                <RightPanel />
            </div>

            <BottomNav onOpenLogin={openLogin} />

            <LoginModal
                isOpen={isLoginOpen}
                onClose={closeLogin}
                onSwitchToRegister={switchToRegister}
            />
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={closeRegister}
                onSwitchToLogin={switchToLogin}
            />
        </div>
    );
};

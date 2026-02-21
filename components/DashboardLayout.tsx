'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu,
    X,
    LogOut,
    Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    menuItems: MenuItem[];
    title: string;
    roleLabel: string;
}

export default function DashboardLayout({ children, menuItems, title, roleLabel }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserEmail(user.email || '');
        };
        getUser();
    }, []);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        await supabase.auth.signOut();
        router.push('/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:z-30
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo / Title */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                                <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#F8BC16]/10 text-[#F8BC16] text-xs font-semibold rounded-full">
                                    {roleLabel}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'bg-[#F8BC16] text-white shadow-md shadow-[#F8BC16]/20'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User + Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="px-4 py-2 mb-2">
                            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-72">
                {/* Topbar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="hidden lg:block" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F8BC16] flex items-center justify-center text-white font-bold text-sm">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

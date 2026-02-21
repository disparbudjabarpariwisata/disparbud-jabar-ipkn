'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    Image,
    Search,
    Settings,
    Loader2,
    BarChart3,
    Shield,
} from 'lucide-react';

const ADMIN_EMAIL = 'disparbudjabarpariwisata2026@gmail.com';

const adminMenuItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Role Types', href: '/dashboard/admin/role-types', icon: <Shield size={18} /> },
    { label: 'Hero Slider', href: '/dashboard/admin/hero-slider', icon: <Image size={18} /> },
    { label: 'SEO General', href: '/dashboard/admin/seo', icon: <Search size={18} /> },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={18} /> },
];

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
        };
        check();
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 text-white">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
                    <p className="text-white/70">Smiling West Java — Management Panel</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Role Types', href: '/dashboard/admin/role-types', icon: <Shield size={24} />, color: 'bg-rose-50 text-rose-600' },
                        { label: 'Hero Slider', href: '/dashboard/admin/hero-slider', icon: <Image size={24} />, color: 'bg-purple-50 text-purple-600' },
                        { label: 'SEO General', href: '/dashboard/admin/seo', icon: <Search size={24} />, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={24} />, color: 'bg-amber-50 text-amber-600' },
                    ].map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <p className="font-bold text-gray-900">{item.label}</p>
                        </a>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

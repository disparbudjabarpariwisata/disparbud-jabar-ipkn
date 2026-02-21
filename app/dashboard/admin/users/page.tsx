'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import {
    Users as UsersIcon,
    Image,
    Search,
    Settings,
    Loader2,
    BarChart3,
} from 'lucide-react';

const ADMIN_EMAIL = 'disparbudjabarpariwisata2026@gmail.com';

const adminMenuItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <UsersIcon size={18} /> },
    { label: 'Hero Slider', href: '/dashboard/admin/hero-slider', icon: <Image size={18} /> },
    { label: 'SEO General', href: '/dashboard/admin/seo', icon: <Search size={18} /> },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={18} /> },
];

interface User {
    id: string;
    email: string;
    role: string;
    created_at: string;
    last_sign_in_at: string | null;
    provider: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
            fetchUsers();
        };
        check();
    }, [router]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
        setIsLoading(false);
    };

    const filteredUsers = users.filter((u) =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by email or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all text-sm w-full md:w-72"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-[#F8BC16]" size={32} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-600">#</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Provider</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Registered</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Last Login</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map((user, idx) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-gray-500">{idx + 1}</td>
                                            <td className="p-4">
                                                <span className="font-medium text-gray-900">{user.email}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-2.5 py-1 bg-[#F8BC16]/10 text-[#F8BC16] text-xs font-semibold rounded-full">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 capitalize">{user.provider}</td>
                                            <td className="p-4 text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                {user.last_sign_in_at
                                                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    No users found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400">Total users: {filteredUsers.length}</p>
            </div>
        </DashboardLayout>
    );
}

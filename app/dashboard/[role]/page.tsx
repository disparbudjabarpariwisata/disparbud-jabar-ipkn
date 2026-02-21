'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import {
    Home,
    Settings,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
    'perangkat-daerah': 'Perangkat Daerah Provinsi Jawa Barat',
    'instansi-pemerintah': 'Instansi Pemerintah Terkait',
    'instansi-swasta': 'Instansi Swasta Terkait',
    'komunitas': 'Komunitas / Asosiasi',
    'pelaku-usaha': 'Pelaku Usaha Pariwisata',
    'pemda-kota-kabupaten': 'Pemerintah Daerah Kota/Kabupaten',
    'pemerintah-pusat': 'Pemerintah Pusat Indonesia',
    'lembaga-internasional': 'Lembaga Internasional',
};

export default function RoleDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const role = params.role as string;
    const roleLabel = ROLE_LABELS[role] || role;

    const [userEmail, setUserEmail] = useState('');
    const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');

    // Settings state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUserEmail(user.email || '');
            setNewEmail(user.email || '');
        };
        getUser();
    }, [router]);

    const handleUpdateEmail = async () => {
        setIsUpdating(true);
        setSettingsMsg(null);
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) {
            setSettingsMsg({ type: 'error', text: error.message });
        } else {
            setSettingsMsg({ type: 'success', text: 'A confirmation email has been sent to your new email address.' });
        }
        setIsUpdating(false);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setSettingsMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        setIsUpdating(true);
        setSettingsMsg(null);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setSettingsMsg({ type: 'error', text: error.message });
        } else {
            setSettingsMsg({ type: 'success', text: 'Password updated successfully.' });
            setNewPassword('');
        }
        setIsUpdating(false);
    };

    const menuItems = [
        { label: 'Dashboard', href: `/dashboard/${role}`, icon: <Home size={18} /> },
        { label: 'Settings', href: `/dashboard/${role}?tab=settings`, icon: <Settings size={18} /> },
    ];

    // Handle tab via URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('tab') === 'settings') setActiveTab('settings');
            else setActiveTab('home');
        }
    }, [params]);

    return (
        <DashboardLayout menuItems={menuItems} title="Smiling West Java" roleLabel={roleLabel}>
            {activeTab === 'home' ? (
                <div className="space-y-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back! 👋</h1>
                        <p className="text-white/70 text-lg">{roleLabel}</p>
                        <p className="text-white/50 text-sm mt-2">{userEmail}</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Account Status</p>
                            <p className="text-2xl font-bold text-green-600">Active</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Role</p>
                            <p className="text-lg font-bold text-gray-900 truncate">{roleLabel}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Last Login</p>
                            <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('en-US')}</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">Dashboard Overview</h3>
                        <p className="text-gray-500">
                            Your dashboard is being set up. Tourism data features and analytics will be available soon.
                            Use the Settings menu to update your email or password.
                        </p>
                    </div>
                </div>
            ) : (
                /* Settings Tab */
                <div className="max-w-2xl space-y-8">
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

                    {/* Feedback */}
                    {settingsMsg && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${settingsMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>
                            {settingsMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span>{settingsMsg.text}</span>
                        </div>
                    )}

                    {/* Update Email */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail size={18} className="text-[#F8BC16]" />
                            Update Email
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="New email address"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                            />
                            <button
                                onClick={handleUpdateEmail}
                                disabled={isUpdating || newEmail === userEmail}
                                className="px-6 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold text-sm hover:bg-[#F2B10C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                                Update Email
                            </button>
                        </div>
                    </div>

                    {/* Update Password */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock size={18} className="text-[#F8BC16]" />
                            Update Password
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password (min 6 characters)"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F8BC16]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button
                                onClick={handleUpdatePassword}
                                disabled={isUpdating || !newPassword}
                                className="px-6 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold text-sm hover:bg-[#F2B10C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Loader2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

export default function AdminSettingsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
            setUserEmail(user.email || '');
            setNewEmail(user.email || '');
        };
        check();
    }, [router]);

    const handleUpdateEmail = async () => {
        setIsUpdating(true);
        setMsg(null);
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: 'Confirmation email sent to your new address.' });
        }
        setIsUpdating(false);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        setIsUpdating(true);
        setMsg(null);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: 'Password updated successfully.' });
            setNewPassword('');
        }
        setIsUpdating(false);
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>

                {msg && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                        {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{msg.text}</span>
                    </div>
                )}

                {/* Current Info */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Current Account</h3>
                    <p className="text-gray-500 text-sm">{userEmail}</p>
                </div>

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
                            placeholder="New email"
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
        </DashboardLayout>
    );
}

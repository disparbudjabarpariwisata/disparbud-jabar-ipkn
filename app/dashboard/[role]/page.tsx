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
    Building2,
    Search,
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

interface Institution {
    id: string;
    category: string;
    name: string;
}

export default function RoleDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const role = params.role as string;
    const roleLabel = ROLE_LABELS[role] || role;

    const [user, setUser] = useState<any>(null);
    const [userEmail, setUserEmail] = useState('');
    const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');

    // Settings state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Institution Modal state
    const [showInstitutionModal, setShowInstitutionModal] = useState(false);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSavingInstitution, setIsSavingInstitution] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
            setUserEmail(user.email || '');
            setNewEmail(user.email || '');

            // Check if Perangkat Daerah user needs to select institution
            if (role === 'perangkat-daerah' && !user.user_metadata?.institution) {
                setShowInstitutionModal(true);
                fetchInstitutions();
            }
        };
        getUser();
    }, [router, role]);

    const fetchInstitutions = async () => {
        setIsLoadingInstitutions(true);
        const { data } = await supabase
            .from('institution_names')
            .select('id, category, name')
            .eq('active', true)
            .order('sort_order', { ascending: true });

        if (data) setInstitutions(data);
        setIsLoadingInstitutions(false);
    };

    const handleSaveInstitution = async () => {
        if (!selectedInstitution) return;
        setIsSavingInstitution(true);

        const { error } = await supabase.auth.updateUser({
            data: { institution: selectedInstitution }
        });

        if (!error) {
            setShowInstitutionModal(false);
            setUser((prev: any) => ({
                ...prev,
                user_metadata: { ...prev?.user_metadata, institution: selectedInstitution }
            }));
        }
        setIsSavingInstitution(false);
    };

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

    const filteredInstitutions = institutions.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout menuItems={menuItems} title="Smiling West Java" roleLabel={roleLabel}>
            {/* Institution Selection Modal */}
            {showInstitutionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 pb-4 border-b border-gray-100 shrink-0">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Building2 size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pilih Nama Instansi</h3>
                            <p className="text-gray-500 text-sm">
                                Anda login sebagai Perangkat Daerah Provinsi Jawa Barat. Tolong lengkapi nama instansi Anda untuk melanjutkan.
                            </p>
                        </div>

                        <div className="p-6 pt-4 flex-1 overflow-hidden flex flex-col gap-4">
                            <div className="relative shrink-0">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari instansi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                                {isLoadingInstitutions ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-[#F8BC16]" size={32} />
                                    </div>
                                ) : filteredInstitutions.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        Instansi tidak ditemukan.
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredInstitutions.map((inst) => (
                                            <button
                                                key={inst.id}
                                                onClick={() => setSelectedInstitution(inst.name)}
                                                className={`w-full text-left p-3 rounded-lg text-sm transition-all ${selectedInstitution === inst.name
                                                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                                                    : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                                                    }`}
                                            >
                                                <span className="block">{inst.name}</span>
                                                <span className={`text-xs mt-0.5 block ${selectedInstitution === inst.name ? 'text-blue-500' : 'text-gray-400'}`}>
                                                    {inst.category}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            <button
                                onClick={handleSaveInstitution}
                                disabled={!selectedInstitution || isSavingInstitution}
                                className="w-full py-3.5 rounded-xl bg-[#F8BC16] text-white font-bold text-lg hover:bg-[#F2B10C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isSavingInstitution && <Loader2 size={20} className="animate-spin" />}
                                Simpan & Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'home' ? (
                <div className="space-y-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back! 👋</h1>
                            <p className="text-white/70 text-lg">{roleLabel}</p>
                            {user?.user_metadata?.institution && (
                                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/20">
                                    <Building2 size={16} className="text-blue-200" />
                                    {user.user_metadata.institution}
                                </div>
                            )}
                            <p className="text-white/50 text-sm mt-3">{userEmail}</p>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Account Status</p>
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 size={20} />
                                <p className="text-2xl font-bold">Active</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Role</p>
                            <p className="text-lg font-bold text-gray-900 truncate" title={roleLabel}>{roleLabel}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Last Login</p>
                            <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">Dashboard Overview</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Your dashboard is being set up. Tourism data features and analytics will be available soon.
                            Use the Settings menu to update your account details.
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

                    {/* Sub account info display */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">Current Role Info</h3>
                        <p className="text-gray-700 font-medium">{roleLabel}</p>
                        {user?.user_metadata?.institution && (
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                <Building2 size={14} className="text-blue-500" />
                                {user.user_metadata.institution}
                            </p>
                        )}
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

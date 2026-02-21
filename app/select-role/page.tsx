'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
    Building2,
    Landmark,
    Briefcase,
    Users,
    Store,
    MapPin,
    Crown,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import { supabase } from '@/lib/supabaseClient';

const ROLES = [
    {
        value: 'Perangkat Daerah Provinsi Jawa Barat',
        label: 'Perangkat Daerah Provinsi Jawa Barat',
        description: 'OPD di lingkungan Pemerintah Provinsi Jawa Barat',
        icon: Building2,
        color: 'bg-blue-50 text-blue-600 border-blue-200',
        activeColor: 'bg-blue-100 border-blue-500 ring-2 ring-blue-200',
    },
    {
        value: 'Instansi Pemerintah Terkait',
        label: 'Instansi Pemerintah Terkait',
        description: 'Kementerian, lembaga, atau instansi pemerintah terkait pariwisata',
        icon: Landmark,
        color: 'bg-purple-50 text-purple-600 border-purple-200',
        activeColor: 'bg-purple-100 border-purple-500 ring-2 ring-purple-200',
    },
    {
        value: 'Instansi Swasta Terkait',
        label: 'Instansi Swasta Terkait',
        description: 'Perusahaan atau organisasi swasta di bidang pariwisata',
        icon: Briefcase,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        activeColor: 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200',
    },
    {
        value: 'Komunitas/Asosiasi',
        label: 'Komunitas / Asosiasi',
        description: 'Komunitas, asosiasi, atau organisasi masyarakat',
        icon: Users,
        color: 'bg-amber-50 text-amber-600 border-amber-200',
        activeColor: 'bg-amber-100 border-amber-500 ring-2 ring-amber-200',
    },
    {
        value: 'Pelaku Usaha Pariwisata',
        label: 'Pelaku Usaha Pariwisata',
        description: 'Hotel, restoran, agen perjalanan, dan usaha pariwisata lainnya',
        icon: Store,
        color: 'bg-rose-50 text-rose-600 border-rose-200',
        activeColor: 'bg-rose-100 border-rose-500 ring-2 ring-rose-200',
    },
    {
        value: 'Pemerintah Daerah Kota/Kabupaten Jawa Barat',
        label: 'Pemerintah Daerah Kota/Kabupaten',
        description: 'Pemerintah daerah kota atau kabupaten di Jawa Barat',
        icon: MapPin,
        color: 'bg-teal-50 text-teal-600 border-teal-200',
        activeColor: 'bg-teal-100 border-teal-500 ring-2 ring-teal-200',
    },
    {
        value: 'Pemerintah Pusat',
        label: 'Pemerintah Pusat',
        description: 'Kementerian atau lembaga di tingkat pusat/nasional',
        icon: Crown,
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        activeColor: 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-200',
    },
];

export default function SelectRolePage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            // If user already has a role, redirect to dashboard
            if (user.user_metadata?.role) {
                router.push('/dashboard');
                return;
            }
            setUser(user);
        };
        checkUser();
    }, [router]);

    const handleSubmit = async () => {
        if (!selectedRole || !user) return;

        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { role: selectedRole },
            });

            if (error) {
                setError(error.message);
            } else {
                router.push('/dashboard');
            }
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#F8BC16]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#F8BC16] selection:text-white">
            <AuthHeader />

            <main className="flex min-h-screen items-center justify-center p-4 pt-28 pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                >
                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-green-50 rounded-2xl">
                                    <CheckCircle2 size={36} className="text-green-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Registration Successful!</h1>
                            <p className="text-gray-500">
                                Please select your role to continue to the dashboard.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Role Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                            {ROLES.map((role) => {
                                const Icon = role.icon;
                                const isSelected = selectedRole === role.value;
                                return (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setSelectedRole(role.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                ? role.activeColor
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? '' : role.color}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {role.label}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                                    {role.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedRole || isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${selectedRole && !isLoading
                                    ? 'bg-[#F8BC16] text-white hover:bg-[#F2B10C] hover:shadow-orange-100 cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Continue to Dashboard'
                            )}
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

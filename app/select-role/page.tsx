'use client';

import { useState, useEffect, useMemo } from 'react';
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
    Globe,
    Shield,
    GraduationCap,
    Heart,
    Star,
    Zap,
    Award,
    Target,
    BookOpen,
    Camera,
    Coffee,
    Compass,
    Flag,
    Loader2,
    AlertCircle,
    CheckCircle2,
    type LucideIcon,
} from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import { supabase } from '@/lib/supabaseClient';

// Map icon name strings to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
    Building2, Landmark, Briefcase, Users, Store,
    MapPin, Crown, Globe, Shield, GraduationCap,
    Heart, Star, Zap, Award, Target,
    BookOpen, Camera, Coffee, Compass, Flag,
};

// Map color name to tailwind classes
const COLOR_MAP: Record<string, { normal: string; active: string }> = {
    blue: { normal: 'bg-blue-50 text-blue-600 border-blue-200', active: 'bg-blue-100 border-blue-500 ring-2 ring-blue-200' },
    purple: { normal: 'bg-purple-50 text-purple-600 border-purple-200', active: 'bg-purple-100 border-purple-500 ring-2 ring-purple-200' },
    emerald: { normal: 'bg-emerald-50 text-emerald-600 border-emerald-200', active: 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200' },
    amber: { normal: 'bg-amber-50 text-amber-600 border-amber-200', active: 'bg-amber-100 border-amber-500 ring-2 ring-amber-200' },
    rose: { normal: 'bg-rose-50 text-rose-600 border-rose-200', active: 'bg-rose-100 border-rose-500 ring-2 ring-rose-200' },
    teal: { normal: 'bg-teal-50 text-teal-600 border-teal-200', active: 'bg-teal-100 border-teal-500 ring-2 ring-teal-200' },
    indigo: { normal: 'bg-indigo-50 text-indigo-600 border-indigo-200', active: 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-200' },
    cyan: { normal: 'bg-cyan-50 text-cyan-600 border-cyan-200', active: 'bg-cyan-100 border-cyan-500 ring-2 ring-cyan-200' },
    red: { normal: 'bg-red-50 text-red-600 border-red-200', active: 'bg-red-100 border-red-500 ring-2 ring-red-200' },
    orange: { normal: 'bg-orange-50 text-orange-600 border-orange-200', active: 'bg-orange-100 border-orange-500 ring-2 ring-orange-200' },
    green: { normal: 'bg-green-50 text-green-600 border-green-200', active: 'bg-green-100 border-green-500 ring-2 ring-green-200' },
    pink: { normal: 'bg-pink-50 text-pink-600 border-pink-200', active: 'bg-pink-100 border-pink-500 ring-2 ring-pink-200' },
    violet: { normal: 'bg-violet-50 text-violet-600 border-violet-200', active: 'bg-violet-100 border-violet-500 ring-2 ring-violet-200' },
    sky: { normal: 'bg-sky-50 text-sky-600 border-sky-200', active: 'bg-sky-100 border-sky-500 ring-2 ring-sky-200' },
    lime: { normal: 'bg-lime-50 text-lime-600 border-lime-200', active: 'bg-lime-100 border-lime-500 ring-2 ring-lime-200' },
};

interface RoleType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    sort_order: number;
}

export default function SelectRolePage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string; user_metadata?: Record<string, string> } | null>(null);
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);

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

    // Fetch roles from database
    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoadingRoles(true);
            const { data, error } = await supabase
                .from('role_types')
                .select('id, name, description, icon, color, sort_order')
                .eq('active', true)
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Failed to fetch roles:', error);
            } else {
                setRoles(data || []);
            }
            setIsLoadingRoles(false);
        };
        fetchRoles();
    }, []);

    const handleSubmit = async () => {
        if (!selectedRole || !user) return;

        setIsLoading(true);
        setError(null);

        try {
            // Update user metadata with selected role
            const { error: updateError } = await supabase.auth.updateUser({
                data: { role: selectedRole },
            });

            if (updateError) {
                setError(updateError.message);
                setIsLoading(false);
                return;
            }

            // Insert into registered_users table
            const authProvider = user.user_metadata?.auth_provider || 'email';
            await supabase.from('registered_users').insert({
                user_id: user.id,
                email: (user as { id: string; email?: string }).email || '',
                role: selectedRole,
                auth_provider: authProvider,
            });

            router.push('/dashboard');
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const resolvedRoles = useMemo(() => {
        return roles.map((role) => ({
            ...role,
            IconComponent: ICON_MAP[role.icon] || Users,
            colorClasses: COLOR_MAP[role.color] || COLOR_MAP.blue,
        }));
    }, [roles]);

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
                        {isLoadingRoles ? (
                            <div className="flex justify-center py-12">
                                <Loader2 size={28} className="animate-spin text-[#F8BC16]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                {resolvedRoles.map((role) => {
                                    const Icon = role.IconComponent;
                                    const isSelected = selectedRole === role.name;
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setSelectedRole(role.name)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                ? role.colorClasses.active
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? '' : role.colorClasses.normal}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {role.name}
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
                        )}

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

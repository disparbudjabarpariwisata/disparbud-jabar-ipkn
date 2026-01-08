'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
    UserCircle,
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ArrowLeft,
    AlertCircle,
    Loader2
} from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('Nasional');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message); // e.g. Invalid login credentials
            } else {
                // Login Success
                console.log('Login success:', data);
                // Redirect to dashboard (which handles role routing)
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Terjadi kesalahan tidak terduga.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#F8BC16] selection:text-white">
            <AuthHeader />

            <main className="flex min-h-screen items-center justify-center p-4 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                >
                    <div className="p-8 md:p-10">
                        {/* Title */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold mb-2">Selamat Datang</h1>
                            <p className="text-gray-500">Silakan login untuk mengakses dashboard data.</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Role Select (For UI continuity) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                    <UserCircle size={18} className="text-[#F8BC16]" />
                                    Anda Login Sebagai
                                </label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Nasional">Nasional</option>
                                        <option value="Provinsi">Provinsi</option>
                                        <option value="Kota/Kabupaten">Kota/Kabupaten</option>
                                        <option value="Mitra Pariwisata">Mitra Pariwisata</option>
                                        <option value="Akademisi">Akademisi</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                    <Mail size={18} className="text-[#F8BC16]" />
                                    Email Terdaftar
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@instansi.go.id"
                                    required
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                    <Lock size={18} className="text-[#F8BC16]" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F8BC16] transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <Link href="/forgot-password" className="text-xs font-medium text-gray-500 hover:text-[#F8BC16] transition-colors">
                                        Lupa Password?
                                    </Link>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 space-y-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-[#F8BC16] text-white rounded-xl font-bold text-lg hover:bg-[#F2B10C] hover:shadow-lg hover:shadow-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={20} />
                                            Login Sekarang
                                        </>
                                    )}
                                </button>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-100"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">Atau</span>
                                    <div className="flex-grow border-t border-gray-100"></div>
                                </div>

                                <Link href="/register" className="block w-full">
                                    <button type="button" className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-[#F8BC16] hover:text-[#F8BC16] transition-all">
                                        Daftar Akun Baru
                                    </button>
                                </Link>
                            </div>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-8 text-center">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors">
                                <ArrowLeft size={16} />
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
                setError(error.message);
            } else {
                console.log('Login success:', data);
                router.push('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
                setIsGoogleLoading(false);
            }
        } catch {
            setError('Failed to sign in with Google.');
            setIsGoogleLoading(false);
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
                            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-gray-500">Sign in to access the data dashboard.</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Google SSO Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                        >
                            {isGoogleLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            {isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}
                        </button>

                        <div className="relative flex py-2 items-center mb-6">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">Or sign in with email</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Role Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                    <UserCircle size={18} className="text-[#F8BC16]" />
                                    Login As
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
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@email.com"
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
                                        Forgot Password?
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
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={20} />
                                            Sign In
                                        </>
                                    )}
                                </button>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-100"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">Or</span>
                                    <div className="flex-grow border-t border-gray-100"></div>
                                </div>

                                <Link href="/register" className="block w-full">
                                    <button type="button" className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-[#F8BC16] hover:text-[#F8BC16] transition-all">
                                        Create New Account
                                    </button>
                                </Link>
                            </div>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-8 text-center">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors">
                                <ArrowLeft size={16} />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

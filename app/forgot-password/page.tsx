'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Mail,
    ArrowLeft,
    AlertCircle,
    Loader2,
    CheckCircle2,
    KeyRound
} from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch {
            setError('An unexpected error occurred.');
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
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-yellow-50 rounded-2xl">
                                <KeyRound size={40} className="text-[#F8BC16]" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
                            <p className="text-gray-500">
                                Enter your registered email and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {success ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-green-50 text-green-700 rounded-xl flex flex-col items-center gap-3 text-center border border-green-200">
                                    <CheckCircle2 size={40} className="text-green-500" />
                                    <p className="font-semibold text-lg">Email Sent!</p>
                                    <p className="text-sm text-green-600">
                                        We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
                                    </p>
                                </div>

                                <Link href="/login" className="block w-full">
                                    <button type="button" className="w-full py-3.5 bg-[#F8BC16] text-white rounded-xl font-bold text-lg hover:bg-[#F2B10C] transition-all">
                                        Back to Login
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            /* Form */
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                        <Mail size={18} className="text-[#F8BC16]" />
                                        Registered Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@email.com"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-[#F8BC16] text-white rounded-xl font-bold text-lg hover:bg-[#F2B10C] hover:shadow-lg hover:shadow-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Footer Links */}
                        <div className="mt-8 text-center space-y-3">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

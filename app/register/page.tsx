'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Shield,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Privacy Policy State
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasAcceptedPrivacy) return;

        setError(null);
        setSuccessMessage(null);

        // Validation
        if (password !== confirmPassword) {
            setError("Password and Confirm Password do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        privacyAccepted: true,
                    },
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccessMessage("Registration successful! Please check your email to verify your account.");
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setHasAcceptedPrivacy(false);
            }
        } catch (err) {
            setError('An error occurred during registration.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
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
            setError('Failed to sign up with Google.');
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#F8BC16] selection:text-white">
            <AuthHeader />
            <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
                onAccept={() => setHasAcceptedPrivacy(!hasAcceptedPrivacy)}
                hasAccepted={hasAcceptedPrivacy}
            />

            <main className="flex min-h-screen items-center justify-center p-4 pt-28 pb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                >
                    <div className="p-8 md:p-10">
                        {/* Title */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                            <p className="text-gray-500">Join to access West Java tourism data.</p>
                        </div>

                        {/* Feedback Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm border border-green-200">
                                <CheckCircle2 size={18} />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Google SSO Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
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
                            {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
                        </button>

                        <div className="relative flex py-2 items-center mb-6">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">Or register with email</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegister} className="space-y-5">
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
                                    disabled={isLoading}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="grid md:grid-cols-2 gap-4">
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
                                            disabled={isLoading}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400 pr-10 disabled:bg-gray-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F8BC16] transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                        <Lock size={18} className="text-[#F8BC16]" />
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            disabled={isLoading}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400 pr-10 disabled:bg-gray-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F8BC16] transition-colors p-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Policy Trigger */}
                            <div className="pt-2">
                                <div
                                    onClick={() => !isLoading && setIsPrivacyModalOpen(true)}
                                    className={`w-full p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-between group ${hasAcceptedPrivacy
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 hover:border-[#F8BC16] hover:bg-yellow-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${hasAcceptedPrivacy ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 group-hover:text-[#F8BC16]'}`}>
                                            {hasAcceptedPrivacy ? <CheckCircle2 size={24} /> : <Shield size={24} />}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-bold ${hasAcceptedPrivacy ? 'text-green-700' : 'text-gray-700'}`}>
                                                {hasAcceptedPrivacy ? 'Privacy Policy Accepted' : 'Read Privacy Policy'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {hasAcceptedPrivacy ? 'You are ready to register' : 'Required to read & accept'}
                                            </p>
                                        </div>
                                    </div>
                                    {!hasAcceptedPrivacy && (
                                        <span className="text-xs font-bold text-[#F8BC16] bg-yellow-100 px-3 py-1 rounded-full group-hover:bg-[#F8BC16] group-hover:text-white transition-colors">
                                            READ
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!hasAcceptedPrivacy || isLoading}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${hasAcceptedPrivacy && !isLoading
                                    ? 'bg-[#F8BC16] text-white hover:bg-[#F2B10C] hover:shadow-orange-100 translate-y-0 cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    'Register'
                                )}
                            </button>

                            {/* Back to Home */}
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <p className="text-sm text-gray-500">
                                Already have an account? <Link href="/login" className="font-bold text-[#F8BC16] hover:underline">Sign in here</Link>
                            </p>
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

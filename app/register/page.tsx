'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    User,
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
    const [role, setRole] = useState('Nasional');

    // Privacy Policy State
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasAcceptedPrivacy) return;

        setError(null);
        setSuccessMessage(null);

        // Validation
        if (password !== confirmPassword) {
            setError("Password dan Konfirmasi Password tidak sama.");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: role, // Save selected role in user metadata
                        privacyAccepted: true, // Log privacy agreement
                    },
                },
            });

            if (error) {
                setError(error.message);
            } else {
                // Success
                setSuccessMessage("Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.");
                // Optional: Clear form
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setHasAcceptedPrivacy(false);
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mendaftar.');
            console.error(err);
        } finally {
            setIsLoading(false);
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
                            <h1 className="text-3xl font-bold mb-2">Buat Akun Baru</h1>
                            <p className="text-gray-500">Bergabunglah untuk akses data pariwisata Jawa Barat.</p>
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

                        {/* Form */}
                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Role Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                    <User size={18} className="text-[#F8BC16]" />
                                    Pilih Profil Anda
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
                                    Daftarkan Email Aktif
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
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
                                        Ulangi Password
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
                                                {hasAcceptedPrivacy ? 'Kebijakan Privasi Disetujui' : 'Baca Kebijakan Privasi'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {hasAcceptedPrivacy ? 'Anda siap mendaftar' : 'Wajib dibaca & disetujui'}
                                            </p>
                                        </div>
                                    </div>
                                    {!hasAcceptedPrivacy && (
                                        <span className="text-xs font-bold text-[#F8BC16] bg-yellow-100 px-3 py-1 rounded-full group-hover:bg-[#F8BC16] group-hover:text-white transition-colors">
                                            BACA
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
                                        Mendaftar...
                                    </>
                                ) : (
                                    'Registration'
                                )}
                            </button>

                            {/* Back to Home */}
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <p className="text-sm text-gray-500">
                                Sudah punya akun? <Link href="/login" className="font-bold text-[#F8BC16] hover:underline">Login disini</Link>
                            </p>
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

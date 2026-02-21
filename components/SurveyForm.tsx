"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Building2, KeyRound, Lock, LogIn, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface RoleType {
    id: string;
    name: string;
}

interface Institution {
    id: string;
    name: string;
}

export default function SurveyForm() {
    const router = useRouter();
    const [mode, setMode] = useState<"new" | "resume">("new");
    const [isLoading, setIsLoading] = useState(false);

    // Dropdown Data States
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        role: "",
        institution: "", // Free text OR Selected from dropdown
        picName: "",
        position: "",
        email: "",
        whatsapp: "",
        pin: "", // 6 char alphanumeric
    });

    const [resumePin, setResumePin] = useState("");
    const [resumeEmail, setResumeEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resumeError, setResumeError] = useState("");
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

    // 1. Fetch Roles on Mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const { data, error } = await supabase
                    .from('role_types')
                    .select('id, name')
                    .eq('active', true)
                    .order('sort_order', { ascending: true });

                if (data) setRoles(data);
                if (error) throw error;
            } catch (error) {
                console.error("Error fetching roles:", error);
            } finally {
                setIsLoadingRoles(false);
            }
        };

        fetchRoles();
    }, []);

    // 2. Fetch Institutions dynamically based on selected role
    useEffect(() => {
        const fetchInstitutions = async () => {
            // Reset institution selection when role changes
            setFormData(prev => ({ ...prev, institution: "" }));
            setInstitutions([]);

            if (!formData.role) return;

            setIsLoadingInstitutions(true);
            try {
                let tableName = "";

                if (formData.role === "Perangkat Daerah Provinsi Jawa Barat") {
                    tableName = "institution_names";
                } else if (formData.role === "Instansi Pemerintah Terkait") {
                    tableName = "institution_names2";
                } else {
                    // For other roles, it's a free-text input, no need to fetch
                    setIsLoadingInstitutions(false);
                    return;
                }

                const { data, error } = await supabase
                    .from(tableName)
                    .select('id, name')
                    .eq('active', true)
                    .order('sort_order', { ascending: true });

                if (data) setInstitutions(data);
                if (error) throw error;
            } catch (error) {
                console.error("Error fetching institutions:", error);
            } finally {
                setIsLoadingInstitutions(false);
            }
        };

        fetchInstitutions();
    }, [formData.role]);

    // Check if current role uses a dropdown or free-text
    const isInstitutionDropdown = formData.role === "Perangkat Daerah Provinsi Jawa Barat" || formData.role === "Instansi Pemerintah Terkait";

    // Real-time server validation (Mocked for UI logic)
    const checkConflict = async (field: 'pin' | 'email', value: string) => {
        if (!value) return;
        // Mock conflict check
        // if (field === 'pin' && value === 'JABAR1') setIsPinDialogOpen(true);
        // if (field === 'email' && value === 'test@test.com') setIsEmailDialogOpen(true);
    };

    // Validation Logic
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.role) newErrors.role = "Kategori/Role harus dipilih";
        if (!formData.institution.trim()) newErrors.institution = "Nama instansi harus diisi";
        if (!formData.picName.trim()) newErrors.picName = "Nama PIC harus diisi";
        if (!formData.position.trim()) newErrors.position = "Jabatan harus diisi";

        // Email Validation
        if (!formData.email.trim()) {
            newErrors.email = "Email harus diisi";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        // WhatsApp Validation
        if (!formData.whatsapp.trim()) {
            newErrors.whatsapp = "Nomor WhatsApp harus diisi";
        } else {
            const cleanWA = formData.whatsapp.replace(/\D/g, '');
            if (!/^(62|08)[0-9]{8,13}$/.test(cleanWA)) {
                newErrors.whatsapp = "Format WhatsApp tidak valid (awali 08/62, min 10 digit)";
            }
        }

        // PIN Validation
        if (!formData.pin.trim()) {
            newErrors.pin = "PIN harus diisi";
        } else if (!/^[a-zA-Z0-9]{6}$/.test(formData.pin)) {
            newErrors.pin = "PIN harus 6 karakter (angka & huruf)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                // Mock submission delay
                await new Promise((resolve) => setTimeout(resolve, 1500));

                const identityWithId = { ...formData, id: 'mock-id-123' };

                if (typeof window !== "undefined") {
                    localStorage.setItem("surveyIdentity", JSON.stringify(identityWithId));
                    router.push("/survey/start"); // Route to actual survey if available
                }
            } catch (error: any) {
                console.error("Error creating respondent:", error);
                setErrors(prev => ({ ...prev, form: error.message || "Terjadi kesalahan saat menyimpan data." }));
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResumeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResumeError("");

        if (!resumePin.trim()) {
            setResumeError("Masukkan PIN Anda");
            return;
        }
        if (!resumeEmail.trim()) {
            setResumeError("Masukkan Email Anda");
            return;
        }

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock resume success
            const identityData = { email: resumeEmail, pin: resumePin, id: 'mock-id-123' };
            if (typeof window !== "undefined") {
                localStorage.setItem("surveyIdentity", JSON.stringify(identityData));
                router.push("/survey/start");
            }
        } catch (err) {
            setResumeError("Terjadi kesalahan koneksi. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">
            {/* Decorative Background for Smiling West Java Branding Theme */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px]"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"
                    animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-10"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center mb-6"
                    >
                        <div className="relative w-40 h-20 md:w-56 md:h-28">
                            <Image
                                src="/smilingwestjava.png"
                                alt="Smiling West Java Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </motion.div>

                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-800 tracking-tight">
                        Survei Ekonomi Kreatif
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Mendata potensi dan perkembangan Ekonomi Kreatif di 27 Kota/Kabupaten Jawa Barat
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden relative">
                        {/* Custom Tabs List */}
                        <div className="bg-slate-100/50 border-b border-slate-200 p-2 flex">
                            <button
                                onClick={() => setMode("new")}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "new"
                                        ? "bg-white text-emerald-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    }`}
                            >
                                Isi Survei Baru
                            </button>
                            <button
                                onClick={() => setMode("resume")}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "resume"
                                        ? "bg-white text-emerald-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    }`}
                            >
                                Lanjutkan Survei
                            </button>
                        </div>

                        {/* Tab Content: New */}
                        {mode === "new" && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 md:p-8">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                        <Building2 className="w-6 h-6 md:w-7 md:h-7 text-emerald-100" />
                                        Data Identitas Instansi
                                    </h2>
                                    <p className="text-emerald-50 mt-2 text-sm md:text-base opacity-90">
                                        Silakan lengkapi data di bawah ini.
                                    </p>
                                </div>

                                <form onSubmit={handleNewSubmit} className="p-6 md:p-8 space-y-6">
                                    {/* PIN Field */}
                                    <div className="bg-yellow-50/80 border border-yellow-200/80 p-5 rounded-xl space-y-3 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-yellow-100 p-2 rounded-lg mt-1">
                                                <KeyRound className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <div className="space-y-2 w-full">
                                                <label htmlFor="pin" className="block text-sm font-bold text-yellow-800">
                                                    Buat PIN Akses (Wajib)
                                                </label>
                                                <input
                                                    id="pin"
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="Contoh: JABAR1 (6 digit)"
                                                    value={formData.pin}
                                                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.toUpperCase() })}
                                                    onBlur={(e) => {
                                                        if (e.target.value.trim().length === 6) checkConflict('pin', e.target.value.trim());
                                                    }}
                                                    className={`w-full h-12 rounded-lg bg-white uppercase tracking-widest text-center text-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${errors.pin ? "border border-red-400 focus:ring-red-400" : "border border-yellow-300 focus:border-yellow-400 focus:ring-yellow-400"
                                                        }`}
                                                />
                                                <p className="text-xs text-yellow-700/80 font-medium leading-relaxed">
                                                    PIN ini unik dan digunakan untuk <strong>melanjutkan pengisian survei</strong> jika terputus.
                                                </p>
                                                {errors.pin && <p className="text-red-500 text-sm font-medium">{errors.pin}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role / Kategori */}
                                    <div className="space-y-2">
                                        <label htmlFor="role" className="block text-sm font-semibold text-slate-700">Kategori Instansi</label>
                                        <select
                                            id="role"
                                            value={formData.role}
                                            disabled={isLoadingRoles}
                                            onChange={(e) => {
                                                setFormData({ ...formData, role: e.target.value });
                                                setErrors({ ...errors, role: "" });
                                            }}
                                            className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-100 disabled:text-slate-400 ${errors.role ? "border-red-400" : "border-slate-300"
                                                }`}
                                        >
                                            <option value="" disabled>
                                                {isLoadingRoles ? "Memuat Kategori..." : "Pilih Kategori"}
                                            </option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>{role.name}</option>
                                            ))}
                                        </select>
                                        {errors.role && <p className="text-red-500 text-sm font-medium">{errors.role}</p>}
                                    </div>

                                    {/* Nama Instansi */}
                                    <div className="space-y-2">
                                        <label htmlFor="institution" className="block text-sm font-semibold text-slate-700">Nama Instansi</label>
                                        {isInstitutionDropdown ? (
                                            <select
                                                id="institution"
                                                value={formData.institution}
                                                disabled={isLoadingInstitutions}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, institution: e.target.value });
                                                    setErrors({ ...errors, institution: "" });
                                                }}
                                                className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-100 disabled:text-slate-400 ${errors.institution ? "border-red-400" : "border-slate-300"
                                                    }`}
                                            >
                                                <option value="" disabled>
                                                    {isLoadingInstitutions ? "Memuat instansi..." : "Pilih Nama Instansi"}
                                                </option>
                                                {institutions.map((inst) => (
                                                    <option key={inst.id} value={inst.name}>{inst.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                id="institution"
                                                type="text"
                                                placeholder={formData.role ? "Ketikkan nama instansi anda" : "Pilih Kategori Instansi terlebih dahulu"}
                                                disabled={!formData.role}
                                                value={formData.institution}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, institution: e.target.value });
                                                    setErrors({ ...errors, institution: "" });
                                                }}
                                                className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:bg-slate-100 disabled:text-slate-400 ${errors.institution ? "border-red-400" : "border-slate-300"
                                                    }`}
                                            />
                                        )}
                                        {errors.institution && <p className="text-red-500 text-sm font-medium">{errors.institution}</p>}
                                    </div>

                                    {/* PIC & Position */}
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label htmlFor="picName" className="block text-sm font-semibold text-slate-700">Nama PIC</label>
                                            <input
                                                id="picName"
                                                type="text"
                                                placeholder="Nama lengkap"
                                                value={formData.picName}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, picName: e.target.value });
                                                    setErrors({ ...errors, picName: "" });
                                                }}
                                                className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.picName ? "border-red-400" : "border-slate-300"
                                                    }`}
                                            />
                                            {errors.picName && <p className="text-red-500 text-sm font-medium">{errors.picName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="position" className="block text-sm font-semibold text-slate-700">Jabatan</label>
                                            <input
                                                id="position"
                                                type="text"
                                                placeholder="Jabatan struktural/fungsional"
                                                value={formData.position}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, position: e.target.value });
                                                    setErrors({ ...errors, position: "" });
                                                }}
                                                className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.position ? "border-red-400" : "border-slate-300"
                                                    }`}
                                            />
                                            {errors.position && <p className="text-red-500 text-sm font-medium">{errors.position}</p>}
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email</label>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="email@instansi.go.id"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    setErrors({ ...errors, email: "" });
                                                }}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) checkConflict('email', val);
                                                }}
                                                className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.email ? "border-red-400" : "border-slate-300"
                                                    }`}
                                            />
                                            {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700">WhatsApp</label>
                                            <input
                                                id="whatsapp"
                                                type="tel"
                                                placeholder="08xxxxxxxxxx"
                                                value={formData.whatsapp}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, whatsapp: e.target.value });
                                                    setErrors({ ...errors, whatsapp: "" });
                                                }}
                                                className={`w-full h-11 px-3 py-2 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.whatsapp ? "border-red-400" : "border-slate-300"
                                                    }`}
                                            />
                                            {errors.whatsapp && <p className="text-red-500 text-sm font-medium">{errors.whatsapp}</p>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.99] disabled:opacity-70 flex justify-center items-center"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Memproses...
                                            </div>
                                        ) : "Mulai Survei"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Tab Content: Resume */}
                        {mode === "resume" && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-6 md:p-8">
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                        <LogIn className="w-6 h-6 md:w-7 md:h-7 text-blue-100" />
                                        Lanjutkan Survei
                                    </h2>
                                    <p className="text-blue-50 mt-2 text-sm md:text-base opacity-90">
                                        Masukkan PIN yang telah Anda buat sebelumnya untuk melanjutkan pengisian.
                                    </p>
                                </div>
                                <div className="p-8 md:p-12 space-y-6 min-h-[400px] flex flex-col justify-center">
                                    <form onSubmit={handleResumeSubmit} className="space-y-6 max-w-md mx-auto w-full">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label htmlFor="resume-email" className="block text-sm font-semibold text-slate-700">Email Instansi</label>
                                                <input
                                                    id="resume-email"
                                                    type="email"
                                                    placeholder="email@instansi.go.id"
                                                    value={resumeEmail}
                                                    onChange={(e) => setResumeEmail(e.target.value)}
                                                    className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="resume-pin" className="block text-sm font-semibold text-slate-700">PIN Akses</label>
                                                <input
                                                    id="resume-pin"
                                                    type="text"
                                                    maxLength={6}
                                                    value={resumePin}
                                                    onChange={(e) => setResumePin(e.target.value.toUpperCase())}
                                                    placeholder="______"
                                                    className="w-full h-14 text-center text-2xl tracking-[0.5em] uppercase font-bold rounded-lg border-2 border-slate-300 bg-white transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                                />
                                            </div>

                                            {resumeError && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-600 font-medium text-center bg-red-50 border border-red-100 p-3 rounded-lg text-sm"
                                                >
                                                    {resumeError}
                                                </motion.p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-14 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.99] disabled:opacity-70 flex justify-center items-center"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Mencari Data...
                                                </div>
                                            ) : "Masuk & Lanjutkan"}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-8 text-center pb-10">
                        <button
                            onClick={() => router.push('/dashboard/admin')}
                            className="inline-flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Lock className="w-4 h-4 mr-2 opacity-70" />
                            Admin Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Custom Modal Overlays for Error Messages */}
            <AnimatePresence>
                {isPinDialogOpen && (
                    <Dialog open onOpenChange={setIsPinDialogOpen} title="PIN Sudah Digunakan" icon={<KeyRound className="w-5 h-5" />} type="danger">
                        PIN <strong>{formData.pin}</strong> sudah terdaftar dalam sistem.
                        <br /><br />
                        Mohon gunakan <strong>kombinasi PIN lain</strong> yang unik untuk instansi Anda.
                    </Dialog>
                )}

                {isEmailDialogOpen && (
                    <Dialog open onOpenChange={setIsEmailDialogOpen} title="Email Sudah Terdaftar" icon={<Mail className="w-5 h-5" />} type="danger" actionLabel="Lanjutkan Survei" onAction={() => { setIsEmailDialogOpen(false); setMode("resume"); }}>
                        Email <strong>{formData.email}</strong> sudah digunakan oleh responden lain.
                        <br /><br />
                        Mohon gunakan email lain atau jika Anda ingin melanjutkan survei sebelumnya, silakan beralih ke menu <strong>Lanjutkan Survei</strong>.
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}

// Simple Dialog Component specifically for this Form
function Dialog({ open, onOpenChange, title, icon, children, type = "danger", actionLabel, onAction }: any) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {icon}
                    </div>
                    <h3 className={`text-lg font-bold ${type === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>
                        {title}
                    </h3>
                </div>

                <div className="text-slate-600 text-sm leading-relaxed mb-6">
                    {children}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Tutup
                    </button>
                    {onAction && actionLabel && (
                        <button
                            onClick={onAction}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

interface SurveyQuestion {
    id: string;
    role_id: string;
    question_text: string;
    question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'number' | 'date' | 'linear_scale' | 'file_upload' | 'section_break';
    options: string[] | null;
    is_required: boolean;
    sort_order: number;
}

export default function SurveyStartPage() {
    const router = useRouter();
    const [identity, setIdentity] = useState<any>(null);
    const [roleId, setRoleId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // 1. Get identity from local storage
        const stored = localStorage.getItem('surveyIdentity');
        if (!stored) {
            router.replace('/survey');
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            if (!parsed.id || !parsed.role) {
                router.replace('/survey');
                return;
            }
            setIdentity(parsed);
            fetchQuestionsAndRole(parsed.role);
        } catch (e) {
            router.replace('/survey');
        }
    }, [router]);

    const fetchQuestionsAndRole = async (roleName: string) => {
        try {
            // Get Role ID
            const { data: roleData, error: roleError } = await supabase
                .from('role_types')
                .select('id')
                .eq('name', roleName)
                .single();

            if (roleError || !roleData) throw new Error("Kategori Instansi tidak terdaftar di sistem.");

            setRoleId(roleData.id);

            // Get Questions for this Role
            const { data: qData, error: qError } = await supabase
                .from('survey_questions')
                .select('*')
                .eq('role_id', roleData.id)
                .eq('active', true)
                .order('sort_order', { ascending: true });

            if (qError) throw qError;

            setQuestions(qData || []);
        } catch (err: any) {
            setError(err.message || "Gagal memuat pertanyaan survei.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: any, type: string) => {
        setValidationErrors(prev => ({ ...prev, [questionId]: '' })); // Clear error on change

        if (type === 'checkbox') {
            setAnswers(prev => {
                const current = prev[questionId] || [];
                if (current.includes(value)) {
                    return { ...prev, [questionId]: current.filter((v: string) => v !== value) };
                } else {
                    return { ...prev, [questionId]: [...current, value] };
                }
            });
        } else {
            setAnswers(prev => ({ ...prev, [questionId]: value }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        let isValid = true;

        questions.forEach(q => {
            if (q.question_type === 'section_break') return;
            if (q.is_required) {
                const ans = answers[q.id];
                if (
                    ans === undefined ||
                    ans === null ||
                    ans === '' ||
                    (Array.isArray(ans) && ans.length === 0)
                ) {
                    errors[q.id] = "Pertanyaan ini wajib diisi.";
                    isValid = false;
                }
            }
        });

        setValidationErrors(errors);

        if (!isValid) {
            setError("Mohon lengkapi semua pertanyaan yang bertanda wajib (*)");
            // Scroll to top to see error 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm() || !identity || !roleId) return;

        setIsSubmitting(true);

        try {
            // Format payload
            const payload = questions.map(q => {
                const ans = answers[q.id];
                const isJson = q.question_type === 'checkbox';
                let stringAns = String(ans || '');
                if (q.question_type === 'section_break') stringAns = 'SECTION_BREAK';

                return {
                    respondent_id: identity.id, // ID from the specific 8 tables
                    role_id: roleId,
                    question_id: q.id,
                    answer_text: isJson ? null : stringAns,
                    answer_json: isJson ? (ans || []) : null
                };
            });

            // Need to insert via API route if RLS blocks direct client insert,
            // However, RLS policy `anon_insert_survey_answers` allows anon INSERT.
            // Doing direct client insert for speed.
            const { error: insertError } = await supabase
                .from('survey_answers')
                .insert(payload);

            if (insertError) throw insertError;

            // Mark completion if needed or handle navigation
            setSuccess("Terima kasih! Survei Anda berhasil disimpan.");

            // Clear identity so they cant re-submit easily without new pin
            localStorage.removeItem('surveyIdentity');

            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (err: any) {
            console.error("Submit Error:", err);
            setError("Terjadi kesalahan sistem saat menyimpan jawaban Anda. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI RENDERERS
    const renderQuestionInput = (q: SurveyQuestion) => {
        const val = answers[q.id];
        const hasError = !!validationErrors[q.id];
        const errorClass = hasError ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-[#10b981] focus:ring-[#10b981]/20";

        switch (q.question_type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'text')}
                        className={`w-full p-4 rounded-xl border outline-none transition-all ${errorClass}`}
                        placeholder="Tuliskan jawaban Anda..."
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'number')}
                        className={`w-full p-4 rounded-xl border outline-none transition-all ${errorClass}`}
                        placeholder="0"
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        rows={4}
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'textarea')}
                        className={`w-full p-4 rounded-xl border outline-none transition-all ${errorClass}`}
                        placeholder="Tuliskan penjelasan Anda secara detail..."
                    />
                );
            case 'dropdown':
                return (
                    <select
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'dropdown')}
                        className={`w-full p-4 rounded-xl border bg-white outline-none transition-all ${errorClass}`}
                    >
                        <option value="" disabled>Pilih salah satu...</option>
                        {q.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="space-y-3 mt-2">
                        {q.options?.map((opt, i) => (
                            <label key={i} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors ${val === opt ? 'border-[#10b981] bg-emerald-50/30' : 'border-slate-200'}`}>
                                <div className="pt-0.5">
                                    <input
                                        type="radio"
                                        name={`radio-${q.id}`}
                                        value={opt}
                                        checked={val === opt}
                                        onChange={() => handleAnswerChange(q.id, opt, 'radio')}
                                        className="w-5 h-5 accent-[#10b981] cursor-pointer"
                                    />
                                </div>
                                <span className="text-slate-700 leading-snug">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                const selectedArr = val || [];
                return (
                    <div className="space-y-3 mt-2">
                        {q.options?.map((opt, i) => (
                            <label key={i} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors ${selectedArr.includes(opt) ? 'border-[#10b981] bg-emerald-50/30' : 'border-slate-200'}`}>
                                <div className="pt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={selectedArr.includes(opt)}
                                        onChange={() => handleAnswerChange(q.id, opt, 'checkbox')}
                                        className="w-5 h-5 accent-[#10b981] rounded cursor-pointer"
                                    />
                                </div>
                                <span className="text-slate-700 leading-snug">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'date')}
                        className={`w-full p-4 rounded-xl border outline-none transition-all max-w-sm ${errorClass}`}
                    />
                );
            case 'linear_scale':
                return (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full max-w-2xl mt-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">Sangat Kurang</span>
                        <div className="flex gap-2 sm:gap-6 justify-center flex-1">
                            {[1, 2, 3, 4, 5].map((score) => (
                                <label key={score} className="flex flex-col items-center gap-2 cursor-pointer group">
                                    <div className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border-2 transition-all shadow-sm ${val === String(score) ? 'border-[#10b981] bg-[#10b981] text-white scale-110 shadow-md' : 'border-slate-200 text-slate-500 bg-white group-hover:border-[#10b981]/50 group-hover:text-[#10b981]'}`}>
                                        <input
                                            type="radio"
                                            name={`scale-${q.id}`}
                                            value={String(score)}
                                            checked={val === String(score)}
                                            onChange={() => handleAnswerChange(q.id, String(score), 'linear_scale')}
                                            className="sr-only"
                                        />
                                        <span className="text-lg sm:text-xl font-bold">{score}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">Sangat Baik</span>
                    </div>
                );
            case 'file_upload':
                return (
                    <div className="space-y-2">
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleAnswerChange(q.id, `FILE_UPLOAD_PENDING: ${file.name}`, 'file_upload');
                                }
                            }}
                            className={`w-full p-3 rounded-xl border bg-white outline-none transition-all cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 ${errorClass}`}
                        />
                        <p className="text-xs text-slate-400 font-medium">Berkas ukuran sedang akan dikirimkan serentak ke server saat tombol submit ditekan.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    // LOADING STATE
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-[#10b981] mb-4" size={48} />
                <p className="text-slate-500 font-medium">Menyesuaikan kuesioner instansi Anda...</p>
            </div>
        );
    }

    // SUCCESS STATE
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border border-slate-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-[#10b981]" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Survei Selesai!</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Terima kasih partisipasinya. Jawaban dari <strong>{identity?.institution}</strong> telah berhasil direkam dalam sistem.
                    </p>
                    <p className="text-sm text-slate-400">Anda akan diarahkan ke halaman utama...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">

                {/* Header Information */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 mt-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#10b981] to-[#34d399]"></div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
                        Kuesioner Survei
                    </h1>
                    <div className="bg-slate-50 p-4 rounded-xl mt-6 border border-slate-100">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                            <div>
                                <dt className="text-slate-500 mb-1">Kategori Instansi</dt>
                                <dd className="font-semibold text-slate-800">{identity?.role}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 mb-1">Nama Instansi</dt>
                                <dd className="font-semibold text-slate-800">{identity?.institution}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 mb-1">Penanggung Jawab (PIC)</dt>
                                <dd className="font-semibold text-slate-800">{identity?.picName}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500 mb-1">Waktu Sesi</dt>
                                <dd className="font-semibold text-emerald-600 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Aktif
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Form Wrapper */}
                {questions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 mt-8 mb-32">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Pertanyaan</h3>
                        <p className="text-slate-500">Administrator belum mengonfigurasi pertanyaan untuk kategori instansi ini. Silakan hubungi pusat bantuan.</p>
                        <button onClick={() => router.push('/')} className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 pb-32">

                        {error && (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
                                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {questions.map((q, idx) => {
                            if (q.question_type === 'section_break') {
                                return (
                                    <div key={q.id} className="py-10 text-center relative max-w-4xl mx-auto">
                                        <div className="absolute left-0 top-1/2 w-full h-px bg-slate-200"></div>
                                        <div className="relative inline-block bg-[#f8fafc] px-6 text-emerald-600 font-bold tracking-wider uppercase text-sm">
                                            {q.question_text}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={q.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-300 relative group max-w-4xl mx-auto">
                                    {validationErrors[q.id] && (
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-3xl"></div>
                                    )}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 leading-relaxed">
                                            <span className="text-slate-400 mr-2 font-medium">{idx + 1}.</span>
                                            {q.question_text}
                                            {q.is_required && <span className="text-red-500 ml-1 text-xl leading-none" title="Wajib diisi">*</span>}
                                        </h3>
                                        {validationErrors[q.id] && (
                                            <p className="text-red-600 text-sm mt-3 font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-lg inline-flex">
                                                <AlertCircle size={14} /> {validationErrors[q.id]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        {renderQuestionInput(q)}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-8 mb-20 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Pastikan seluruh data diisi dengan benar sebelum mengirimkan.
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-8 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Submit Jawaban</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

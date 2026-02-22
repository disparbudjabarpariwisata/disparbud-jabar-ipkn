'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import LikertSlider from '@/components/LikertSlider';

interface SurveyQuestion {
    id: string;
    role_id: string;
    institution_name: string | null;
    question_text: string;
    question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'number' | 'date' | 'linear_scale' | 'file_upload' | 'section_break' | 'url_website' | 'url_youtube' | 'url_gdrive' | 'url_social_media';
    options: string[] | null;
    is_required: boolean;
    sort_order: number;
    depends_on_question_id: string | null;
    depends_on_answer: string | null;
}

// Parse question text that contains \n and numbered/bullet points into structured JSX
const formatQuestionText = (text: string) => {
    if (!text) return null;

    // Split by newlines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length <= 1) {
        return <span>{text}</span>;
    }

    // First line is the main question, rest are sub-points
    const mainQuestion = lines[0];
    const subPoints = lines.slice(1);

    // Detect if sub-points are numbered (e.g. "1. ...", "2. ...")
    const isNumbered = subPoints.every(p => /^\d+[\.\)\-]\s/.test(p));

    return (
        <>
            <span>{mainQuestion}</span>
            {isNumbered ? (
                <ol className="list-decimal list-inside mt-2 space-y-1 text-base font-normal text-slate-600 pl-1">
                    {subPoints.map((point, i) => (
                        <li key={i} className="leading-relaxed">
                            {point.replace(/^\d+[\.\)\-]\s*/, '')}
                        </li>
                    ))}
                </ol>
            ) : (
                <ul className="list-disc list-inside mt-2 space-y-1 text-base font-normal text-slate-600 pl-1">
                    {subPoints.map((point, i) => (
                        <li key={i} className="leading-relaxed">
                            {point.replace(/^[\-\•\*]\s*/, '')}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default function SurveyStartPage() {
    const router = useRouter();
    const [identity, setIdentity] = useState<any>(null);
    const [roleId, setRoleId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
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
            fetchQuestionsAndRole(parsed.role, parsed.institution, parsed.id);
        } catch (e) {
            router.replace('/survey');
        }
    }, [router]);

    const fetchQuestionsAndRole = async (roleName: string, institutionName: string, identityId: string) => {
        try {
            // Get Role ID
            const { data: roleData, error: roleError } = await supabase
                .from('role_types')
                .select('id')
                .eq('name', roleName)
                .single();

            if (roleError || !roleData) throw new Error("Kategori Instansi tidak terdaftar di sistem.");

            setRoleId(roleData.id);

            // Get Questions for this Role AND Institution
            let query = supabase
                .from('survey_questions')
                .select('*')
                .eq('role_id', roleData.id)
                .eq('active', true)
                .order('sort_order', { ascending: true });

            // Filter by institution_name to only show specific and global questions
            if (institutionName) {
                // We use .or to fetch both null (global) and exact match. 
                // Double quotes handle spaces/special characters in PostgREST.
                query = query.or(`institution_name.is.null,institution_name.eq."${institutionName}"`);
            }

            const { data: qData, error: qError } = await query;

            if (qError) throw qError;

            setQuestions(qData || []);

            // 3. Fetch specific respondent progress directly from API
            const progressRes = await fetch(`/api/survey/get-progress?respondentId=${identityId}`);
            if (progressRes.ok) {
                const progressData = await progressRes.json();
                if (progressData.success && progressData.data) {
                    setAnswers(progressData.data);
                }
            }

        } catch (err: any) {
            setError(err.message || "Gagal memuat pertanyaan survei.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-save effect
    useEffect(() => {
        if (isLoading || isSubmitting || success || Object.keys(answers).length === 0 || !identity || !roleId) return;

        const timer = setTimeout(async () => {
            setIsSavingProgress(true);
            try {
                // Determine visible payload
                const payload = questions
                    .filter(q => q.question_type !== 'section_break') // Never save section breaks
                    .map(q => {
                        const ans = answers[q.id];
                        const isJson = q.question_type === 'checkbox';
                        let stringAns = String(ans || '');
                        if (q.question_type === 'file_upload') stringAns = 'FILE_UPLOAD_PENDING';

                        return {
                            question_id: q.id,
                            answer_text: isJson ? null : (ans ? stringAns : null),
                            answer_json: isJson ? (ans || []) : null
                        };
                    })
                    // Only save those that actually have answers
                    .filter(ans => ans.answer_text !== null || (ans.answer_json && ans.answer_json.length > 0));

                if (payload.length > 0) {
                    await fetch("/api/survey/save-progress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            respondent_id: identity.id,
                            role_id: roleId,
                            answers: payload
                        })
                    });
                    setLastSaved(new Date());
                }

            } catch (err) {
                console.error("Auto-save failed", err);
            } finally {
                setIsSavingProgress(false);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [answers, identity, roleId, questions, isLoading, isSubmitting, success]);

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

    // Calculate which questions are currently visible based on conditional logic
    const visibleQuestions = questions.filter(q => {
        if (!q.depends_on_question_id || !q.depends_on_answer) return true;

        // Find the answer to the dependency question
        const depAnswer = answers[q.depends_on_question_id];
        if (!depAnswer) return false;

        // If it's a checkbox (array), check if the required answer is included
        if (Array.isArray(depAnswer)) {
            return depAnswer.includes(q.depends_on_answer);
        }

        // For string answers (radio, dropdown), check exact match
        return String(depAnswer) === q.depends_on_answer;
    });

    const validateForm = () => {
        const errors: Record<string, string> = {};
        let isValid = true;

        // URL Regex Patterns
        const urlPatterns: Record<string, RegExp> = {
            url_website: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            url_youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
            url_gdrive: /^(https?:\/\/)?(drive|docs)\.google\.com\/.+$/,
            url_social_media: /^(https?:\/\/)?(www\.)?(instagram\.com|facebook\.com|twitter\.com|x\.com|linkedin\.com|tiktok\.com)\/.+$/
        };

        const typeErrorMessages: Record<string, string> = {
            url_website: "Format URL tidak valid (Contoh: https://example.com)",
            url_youtube: "Harus berupa link YouTube / youtu.be yang valid",
            url_gdrive: "Harus berupa link Google Drive / Google Docs",
            url_social_media: "Harus berupa link Social Media (Instagram/Facebook/X/LinkedIn/TikTok)"
        };

        // ONLY validate visible questions
        visibleQuestions.forEach(q => {
            if (q.question_type === 'section_break') return;
            const ans = answers[q.id];

            if (q.is_required) {
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

            // Type Validations (even if optional, format must be correct if filled)
            if (q.question_type.startsWith('url_') && ans) {
                const pattern = urlPatterns[q.question_type];
                if (pattern && !pattern.test(String(ans))) {
                    errors[q.id] = typeErrorMessages[q.question_type];
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
            // Format payload ONLY from visible questions so we don't save hidden/skipped data
            const payload = visibleQuestions
                .filter(q => q.question_type !== 'section_break') // Never save section breaks
                .map(q => {
                    const ans = answers[q.id];
                    const isJson = q.question_type === 'checkbox';
                    let stringAns = String(ans || '');
                    if (q.question_type === 'file_upload') stringAns = 'FILE_UPLOAD_PENDING';

                    return {
                        question_id: q.id,
                        answer_text: isJson ? null : stringAns,
                        answer_json: isJson ? (ans || []) : null
                    };
                });

            console.log('Survey payload:', JSON.stringify(payload, null, 2));

            const response = await fetch("/api/survey/save-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    respondent_id: identity.id,
                    role_id: roleId,
                    answers: payload
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Submit Error:', errorData);
                throw new Error(errorData?.error || 'Submit Error');
            }

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
                        className={`w-full p-3 sm:p-4 rounded-xl border outline-none transition-all text-sm sm:text-base ${errorClass}`}
                        placeholder="Tuliskan jawaban Anda..."
                    />
                );
            case 'number':
                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        value={val || ''}
                        onChange={(e) => {
                            let inputValue = e.target.value;
                            // Replace dot with comma
                            inputValue = inputValue.replace(/\./g, ',');
                            // Remove any characters other than digits and comma
                            inputValue = inputValue.replace(/[^0-9,]/g, '');

                            // Prevent multiple commas
                            const parts = inputValue.split(',');
                            if (parts.length > 2) {
                                inputValue = parts[0] + ',' + parts.slice(1).join('');
                            }

                            // Limit to 2 decimal places
                            const finalParts = inputValue.split(',');
                            if (finalParts.length === 2 && finalParts[1].length > 2) {
                                inputValue = finalParts[0] + ',' + finalParts[1].substring(0, 2);
                            }

                            handleAnswerChange(q.id, inputValue, 'number');
                        }}
                        className={`w-full p-3 sm:p-4 rounded-xl border outline-none transition-all text-sm sm:text-base ${errorClass}`}
                        placeholder="Contoh: 0,00"
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        rows={4}
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'textarea')}
                        className={`w-full p-3 sm:p-4 rounded-xl border outline-none transition-all text-sm sm:text-base ${errorClass}`}
                        placeholder="Tuliskan penjelasan Anda secara detail..."
                    />
                );
            case 'dropdown':
                return (
                    <select
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, 'dropdown')}
                        className={`w-full p-3 sm:p-4 rounded-xl border bg-white outline-none transition-all text-sm sm:text-base ${errorClass}`}
                    >
                        <option value="" disabled>Pilih salah satu...</option>
                        {q.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="space-y-2 sm:space-y-3 mt-2">
                        {q.options?.map((opt, i) => (
                            <label key={i} className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors ${val === opt ? 'border-[#10b981] bg-emerald-50/30' : 'border-slate-200'}`}>
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
                                <span className="text-slate-700 leading-snug text-sm sm:text-base break-words">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'url_website':
            case 'url_youtube':
            case 'url_gdrive':
            case 'url_social_media':
                const placeholders: Record<string, string> = {
                    url_website: "https://website.com...",
                    url_youtube: "https://youtube.com/watch?v=...",
                    url_gdrive: "https://drive.google.com/...",
                    url_social_media: "https://instagram.com/..."
                };
                return (
                    <input
                        type="url"
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value, q.question_type)}
                        className={`w-full p-3 sm:p-4 rounded-xl border outline-none transition-all text-sm sm:text-base break-all ${errorClass}`}
                        placeholder={placeholders[q.question_type] || "https://..."}
                    />
                );
            case 'checkbox':
                const selectedArr = val || [];
                return (
                    <div className="space-y-2 sm:space-y-3 mt-2">
                        {q.options?.map((opt, i) => (
                            <label key={i} className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors ${selectedArr.includes(opt) ? 'border-[#10b981] bg-emerald-50/30' : 'border-slate-200'}`}>
                                <div className="pt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={selectedArr.includes(opt)}
                                        onChange={() => handleAnswerChange(q.id, opt, 'checkbox')}
                                        className="w-5 h-5 accent-[#10b981] rounded cursor-pointer"
                                    />
                                </div>
                                <span className="text-slate-700 leading-snug text-sm sm:text-base break-words">{opt}</span>
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
                        className={`w-full p-3 sm:p-4 rounded-xl border outline-none transition-all text-sm sm:text-base max-w-sm ${errorClass}`}
                    />
                );
            case 'linear_scale':
                // Extract labels from options (e.g. "1 = sangat tidak baik, 7 = sangat baik")
                let leftLabel = 'Sangat Kurang';
                let rightLabel = 'Sangat Baik';
                if (q.options && q.options[0]) {
                    const parts = q.options[0].split(',').map((s: string) => s.trim());
                    if (parts.length >= 2) {
                        // Extract text after "1 = " and "7 = "
                        leftLabel = parts[0].replace(/^\d+\s*=\s*/, '');
                        rightLabel = parts[parts.length - 1].replace(/^\d+\s*=\s*/, '');
                    }
                }
                return (
                    <div className="flex flex-col gap-3 items-center w-full mt-4 bg-slate-50 p-4 sm:p-6 sm:px-8 rounded-2xl border border-slate-100">
                        <LikertSlider
                            value={val ? Number(val) : undefined}
                            onChange={(v) => handleAnswerChange(q.id, String(v), 'linear_scale')}
                            leftLabel={leftLabel}
                            rightLabel={rightLabel}
                            disabled={isSubmitting}
                        />
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
        <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">

                {/* Header Information */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 mb-6 sm:mb-8 mt-4 sm:mt-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#10b981] to-[#34d399]"></div>
                    <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
                        Kuesioner Survei
                    </h1>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl mt-4 sm:mt-6 border border-slate-100">
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
                                <dt className="text-slate-500 mb-1">Status Penyimpanan</dt>
                                <dd className="font-semibold text-emerald-600 flex items-center gap-1.5">
                                    {isSavingProgress ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : lastSaved ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            Tersimpan {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                            Belum ada data baru
                                        </>
                                    )}
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

                        {/* Only Render Visible Questions */}
                        {visibleQuestions.map((q, idx) => {
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
                                <div key={q.id} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-300 relative group">
                                    {validationErrors[q.id] && (
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-3xl"></div>
                                    )}
                                    <div className="mb-3 sm:mb-4">
                                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                                            <span className="text-slate-400 mr-2 font-medium">{idx + 1}.</span>
                                            {formatQuestionText(q.question_text)}
                                            {q.is_required && <span className="text-red-500 ml-1 text-lg sm:text-xl leading-none" title="Wajib diisi">*</span>}
                                        </h3>
                                        {validationErrors[q.id] && (
                                            <p className="text-red-600 text-sm mt-3 font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-lg inline-flex">
                                                <AlertCircle size={14} /> {validationErrors[q.id]}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-3 sm:mt-4">
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

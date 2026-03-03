'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, AlertCircle, Save, CheckCircle2, Upload, FileCheck, X } from 'lucide-react';
import LikertSlider from '@/components/LikertSlider';

// Allowed file types and max size
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.jpeg', '.jpg', '.png'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface SurveyQuestion {
    id: string;
    role_id: string;
    institution_name: string | null;
    question_text: string;
    question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'number' | 'date' | 'linear_scale' | 'file_upload' | 'section_break' | 'url_website' | 'url_youtube' | 'url_gdrive' | 'url_social_media' | 'multiple_input';
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
    const [multipleAnswers, setMultipleAnswers] = useState<Record<string, any[]>>({}); // for complex multiple inputs
    const [fileObjects, setFileObjects] = useState<Record<string, File>>({}); // Store actual File objects keyed by question_id or composite id
    const [uploadProgress, setUploadProgress] = useState<Record<string, 'idle' | 'uploading' | 'done' | 'error'>>({}); // Track upload status per file

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
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
                // Use robust searching to bypass parentheses inconsistencies like DPMPTSP vs (DPMPTSP)
                // We strip special chars for a clean ilike pattern. 
                const safeInst = institutionName.replace(/[()]/g, '').trim().split(' ').join('%');
                query = query.or(`institution_name.is.null,institution_name.ilike.%${safeInst}%`);
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
                if (progressData.success && progressData.multiple_data) {

                    // Group the multiple answers by question_id
                    const grouped = progressData.multiple_data.reduce((acc: any, row: any) => {
                        if (!acc[row.question_id]) acc[row.question_id] = [];
                        acc[row.question_id].push(row);
                        return acc;
                    }, {});
                    setMultipleAnswers(grouped);
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
                    .filter(q => q.question_type !== 'section_break' && q.question_type !== 'file_upload') // Never save section breaks or file uploads (handled separately)
                    .map(q => {
                        const ans = answers[q.id];
                        const isJson = q.question_type === 'checkbox';
                        let stringAns = String(ans || '');

                        return {
                            question_id: q.id,
                            answer_text: isJson ? null : (ans ? stringAns : null),
                            answer_json: isJson ? (ans || []) : null
                        };
                    })
                    // Only save those that actually have answers
                    .filter(ans => ans.answer_text !== null || (ans.answer_json && ans.answer_json.length > 0));

                // Determine multiple payloads
                const multiplePayload = Object.keys(multipleAnswers).flatMap(qId => {
                    const ansArray = multipleAnswers[qId];
                    if (!ansArray) return [];
                    return ansArray.filter(a => a.answer_value || fileObjects[`${qId}_${a.group_label}_${a.field_label}`]); // save if there is an answer or a file attached
                });

                if (payload.length > 0 || multiplePayload.length > 0) {
                    await fetch("/api/survey/save-progress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            respondent_id: identity.id,
                            role_id: roleId,
                            answers: payload,
                            multiple_answers: multiplePayload
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

    const handleMultipleAnswerChange = (questionId: string, groupLabel: string, fieldLabel: string, fieldType: string, value: any) => {
        setValidationErrors(prev => ({ ...prev, [questionId]: '' }));

        setMultipleAnswers(prev => {
            const currentAnswers = prev[questionId] || [];

            // Check if this exact field in this group already exists
            const existingIndex = currentAnswers.findIndex(a => a.group_label === groupLabel && a.field_label === fieldLabel);

            const newAnswerObj = {
                question_id: questionId,
                group_label: groupLabel,
                field_label: fieldLabel,
                field_type: fieldType,
                answer_value: value
            };

            const newAnswers = [...currentAnswers];
            if (existingIndex >= 0) {
                newAnswers[existingIndex] = newAnswerObj;
            } else {
                newAnswers.push(newAnswerObj);
            }

            return {
                ...prev,
                [questionId]: newAnswers
            };
        });
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

            if (q.question_type === 'multiple_input') {
                if (q.is_required) {
                    const ansArray = multipleAnswers[q.id];
                    if (!ansArray || ansArray.length === 0) {
                        errors[q.id] = "Pertanyaan ini wajib diisi dengan lengkap.";
                        isValid = false;
                    }
                }
                return; // complex validation can be added inside the component if needed
            }

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
            // Step 1: Upload all file_upload files to Google Drive first
            const standardFileUploadQuestions = visibleQuestions.filter(
                q => q.question_type === 'file_upload' && fileObjects[q.id]
            );

            // Also find all multiple input files
            const multipleFileUploadKeys = Object.keys(fileObjects).filter(k => k.includes('_'));

            if (standardFileUploadQuestions.length > 0 || multipleFileUploadKeys.length > 0) {
                setIsUploadingFiles(true);

                // Handle standard uploads
                for (const q of standardFileUploadQuestions) {
                    const file = fileObjects[q.id];
                    if (!file) continue;

                    setUploadProgress(prev => ({ ...prev, [q.id]: 'uploading' }));

                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('respondent_id', identity.id);
                        formData.append('question_id', q.id);
                        formData.append('role_id', roleId!);
                        formData.append('institution_name', identity.institution || '');

                        const uploadRes = await fetch('/api/survey/upload-file', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!uploadRes.ok) {
                            const errData = await uploadRes.json();
                            throw new Error(errData.error || 'Upload gagal');
                        }

                        const uploadData = await uploadRes.json();

                        // Update the answer with the Google Drive URL
                        setAnswers(prev => ({ ...prev, [q.id]: uploadData.fileUrl }));
                        setUploadProgress(prev => ({ ...prev, [q.id]: 'done' }));
                    } catch (uploadErr: any) {
                        console.error(`Upload failed for question ${q.id}:`, uploadErr);
                        setUploadProgress(prev => ({ ...prev, [q.id]: 'error' }));
                        throw new Error(`Gagal upload file "${file.name}": ${uploadErr.message}`);
                    }
                }

                // Handle multiple input uploads
                for (const fileKey of multipleFileUploadKeys) {
                    const file = fileObjects[fileKey];
                    if (!file) continue;

                    // Extract question_id, group_label, field_label from the composite key
                    const firstUnderscore = fileKey.indexOf('_');
                    const question_id = fileKey.substring(0, firstUnderscore);

                    setUploadProgress(prev => ({ ...prev, [fileKey]: 'uploading' }));

                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('respondent_id', identity.id);
                        formData.append('question_id', question_id);
                        formData.append('role_id', roleId!);
                        formData.append('institution_name', identity.institution || '');
                        formData.append('is_multiple', 'true');

                        const uploadRes = await fetch('/api/survey/upload-file', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!uploadRes.ok) throw new Error('Upload gagal');
                        const uploadData = await uploadRes.json();

                        // We need to update multipleAnswers array for this question
                        setMultipleAnswers(prev => {
                            const currentArr = prev[question_id] || [];
                            return {
                                ...prev,
                                [question_id]: currentArr.map(ans => {
                                    // if this answer matches the fileKey logic, update its answer_value
                                    if (`${question_id}_${ans.group_label}_${ans.field_label}` === fileKey) {
                                        return { ...ans, answer_value: uploadData.fileUrl };
                                    }
                                    return ans;
                                })
                            };
                        });
                        setUploadProgress(prev => ({ ...prev, [fileKey]: 'done' }));

                    } catch (uploadErr: any) {
                        setUploadProgress(prev => ({ ...prev, [fileKey]: 'error' }));
                        throw new Error(`Gagal upload file "${file.name}"`);
                    }
                }

                setIsUploadingFiles(false);
            }

            // Step 2: Format and save all non-file answers
            const payload = visibleQuestions
                .filter(q => q.question_type !== 'section_break' && q.question_type !== 'file_upload')
                .map(q => {
                    const ans = answers[q.id];
                    const isJson = q.question_type === 'checkbox';
                    let stringAns = String(ans || '');

                    return {
                        question_id: q.id,
                        answer_text: isJson ? null : stringAns,
                        answer_json: isJson ? (ans || []) : null
                    };
                });

            const multiplePayload = Object.keys(multipleAnswers).flatMap(qId => {
                const ansArray = multipleAnswers[qId];
                if (!ansArray) return [];
                // if it's a file, we should now have the google drive link inside multipleAnswers (or pending if not yet state-updated, but we'll manually attach in the next tick if needed. For now, since state updates are async, we actually construct it from the latest data)
                return ansArray;
            });

            console.log('Survey payload:', JSON.stringify(payload, null, 2));

            const response = await fetch("/api/survey/save-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    respondent_id: identity.id,
                    role_id: roleId,
                    answers: payload,
                    multiple_answers: multiplePayload
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Submit Error:', errorData);
                throw new Error(errorData?.error || 'Submit Error');
            }

            // Mark completion
            setSuccess("Terima kasih! Survei Anda berhasil disimpan.");
            localStorage.removeItem('surveyIdentity');

            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (err: any) {
            console.error("Submit Error:", err);
            setIsUploadingFiles(false);
            setError(err.message || "Terjadi kesalahan sistem saat menyimpan jawaban Anda. Silakan coba lagi.");
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
            case 'file_upload': {
                const currentFile = fileObjects[q.id];
                const progress = uploadProgress[q.id];
                return (
                    <div className="space-y-3">
                        <input
                            type="file"
                            accept=".pdf,.docx,.xlsx,.pptx,.jpeg,.jpg,.png"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Validate file size
                                if (file.size > MAX_FILE_SIZE_BYTES) {
                                    setValidationErrors(prev => ({
                                        ...prev,
                                        [q.id]: `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)}MB melebihi batas maksimal ${MAX_FILE_SIZE_MB}MB.`
                                    }));
                                    e.target.value = ''; // Reset input
                                    return;
                                }

                                // Validate file extension
                                const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                                    setValidationErrors(prev => ({
                                        ...prev,
                                        [q.id]: `Tipe file "${ext}" tidak diizinkan. Gunakan: ${ALLOWED_EXTENSIONS.join(', ')}`
                                    }));
                                    e.target.value = '';
                                    return;
                                }

                                // Store the File object and update answer display
                                setFileObjects(prev => ({ ...prev, [q.id]: file }));
                                handleAnswerChange(q.id, file.name, 'file_upload');
                                setUploadProgress(prev => ({ ...prev, [q.id]: 'idle' }));
                            }}
                            className={`w-full p-3 rounded-xl border bg-white outline-none transition-all cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 ${errorClass}`}
                        />
                        {/* File info badge */}
                        {currentFile && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${progress === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                progress === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                                    progress === 'uploading' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                        'bg-slate-50 border-slate-200 text-slate-600'
                                }`}>
                                {progress === 'uploading' ? (
                                    <Loader2 size={16} className="animate-spin shrink-0" />
                                ) : progress === 'done' ? (
                                    <FileCheck size={16} className="shrink-0" />
                                ) : progress === 'error' ? (
                                    <AlertCircle size={16} className="shrink-0" />
                                ) : (
                                    <Upload size={16} className="shrink-0" />
                                )}
                                <span className="truncate font-medium">{currentFile.name}</span>
                                <span className="text-xs opacity-70 shrink-0">({(currentFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                                {progress === 'uploading' && <span className="text-xs">Mengupload...</span>}
                                {progress === 'done' && <span className="text-xs">✓ Terupload</span>}
                                {progress === 'error' && <span className="text-xs">Gagal</span>}
                                {progress !== 'uploading' && progress !== 'done' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFileObjects(prev => { const copy = { ...prev }; delete copy[q.id]; return copy; });
                                            setAnswers(prev => { const copy = { ...prev }; delete copy[q.id]; return copy; });
                                            setUploadProgress(prev => { const copy = { ...prev }; delete copy[q.id]; return copy; });
                                        }}
                                        className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                                        title="Hapus file"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-slate-400 font-medium">
                            Format: PDF, DOCX, XLSX, PPTX, JPEG, PNG. Maks {MAX_FILE_SIZE_MB}MB per file. File akan diupload saat Submit.
                        </p>
                    </div>
                );
            }
            case 'multiple_input': {
                if (!q.options || q.options.length === 0) return null;

                let schemaObj: any;
                try {
                    // Because options in DB is a jsonb, but Supabase SDK returns it as an array if it was inserted as such,
                    // we need to safely parse the schema out of it.
                    if (Array.isArray(q.options) && typeof q.options[0] === 'string') {
                        schemaObj = JSON.parse(q.options[0]);
                    } else if (typeof q.options === 'object') {
                        schemaObj = q.options as any;
                    }
                } catch (e) {
                    console.error("Failed to parse multiple_input schema:", e);
                    return null;
                }

                if (!schemaObj || !schemaObj.schema || !Array.isArray(schemaObj.schema)) return null;

                return (
                    <div className="space-y-6 sm:space-y-8 mt-4">
                        {schemaObj.schema.map((group: any, gIdx: number) => {
                            if (group.type === 'group') {
                                return (
                                    <div key={gIdx} className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
                                        <h4 className="font-semibold text-slate-800 mb-4">{group.label}</h4>
                                        <div className="space-y-4">
                                            {group.fields?.map((field: any, fIdx: number) => {
                                                const currentAnswersGroup = multipleAnswers[q.id] || [];
                                                const ansObj = currentAnswersGroup.find(a => a.group_label === group.label && a.field_label === field.label);
                                                const fieldVal = ansObj ? ansObj.answer_value : '';

                                                const compId = `${q.id}_${group.label}_${field.label}`;
                                                let innerInput = null;

                                                if (field.type === 'file_upload') {
                                                    const currentFile = fileObjects[compId];
                                                    const progress = uploadProgress[compId];
                                                    innerInput = (
                                                        <div className="space-y-3">
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.docx,.xlsx,.pptx,.jpeg,.jpg,.png"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    if (file.size > MAX_FILE_SIZE_BYTES) {
                                                                        alert(`Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB}MB.`);
                                                                        e.target.value = ''; return;
                                                                    }
                                                                    setFileObjects(prev => ({ ...prev, [compId]: file }));
                                                                    handleMultipleAnswerChange(q.id, group.label, field.label, field.type, file.name);
                                                                    setUploadProgress(prev => ({ ...prev, [compId]: 'idle' }));
                                                                }}
                                                                className="w-full p-2.5 rounded-xl border bg-white outline-none transition-all cursor-pointer file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 text-sm border-slate-200"
                                                            />
                                                            {fieldVal && !currentFile && typeof fieldVal === 'string' && fieldVal.startsWith('http') && (
                                                                <a href={fieldVal} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
                                                                    <FileCheck size={14} /> Lihat File Tersimpan
                                                                </a>
                                                            )}
                                                            {currentFile && (
                                                                <div className="flex items-center gap-2 p-2.5 rounded-lg border text-sm bg-slate-50 border-slate-200 text-slate-600">
                                                                    <Upload size={14} className="shrink-0" />
                                                                    <span className="truncate font-medium flex-1">{currentFile.name} ({progress === 'uploading' ? '...' : (currentFile.size / 1024 / 1024).toFixed(1) + 'MB'})</span>
                                                                    <button type="button" onClick={() => {
                                                                        setFileObjects(prev => { const copy = { ...prev }; delete copy[compId]; return copy; });
                                                                        handleMultipleAnswerChange(q.id, group.label, field.label, field.type, '');
                                                                        setUploadProgress(prev => { const copy = { ...prev }; delete copy[compId]; return copy; });
                                                                    }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                } else if (field.type === 'textarea') {
                                                    innerInput = (
                                                        <textarea rows={3} value={fieldVal || ''} onChange={(e) => handleMultipleAnswerChange(q.id, group.label, field.label, field.type, e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#10b981] outline-none transition-all text-sm" placeholder="Mulai mengetik..." />
                                                    );
                                                }

                                                return (
                                                    <div key={fIdx}>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                                                        {field.description && <p className="text-xs text-slate-400 mb-2">{field.description}</p>}
                                                        {innerInput}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            } else if (group.type === 'dynamic_list') {
                                // Determine how many dynamic items exist currently by finding the max index used in group_label
                                const currentAnswersGroup = multipleAnswers[q.id] || [];
                                const dynamicAnswers = currentAnswersGroup.filter(a => a.group_label && a.group_label.startsWith(group.item_label));

                                // Parse out the highest number, e.g., "Jawaban Bukti Konten [1]" -> 1
                                let maxCount = 1; // Default min is 1
                                dynamicAnswers.forEach(a => {
                                    const match = a.group_label.match(/\[(\d+)\]/);
                                    if (match && match[1]) {
                                        const num = parseInt(match[1], 10);
                                        if (num > maxCount) maxCount = num;
                                    }
                                });

                                // We want to render maxCount number of forms
                                const itemForms = Array.from({ length: maxCount }, (_, i) => i + 1);

                                return (
                                    <div key={gIdx} className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100">
                                        <h4 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-200">{group.label}</h4>

                                        <div className="space-y-6">
                                            {itemForms.map((itemNum) => {
                                                const activeGroupLabel = `${group.item_label} [${itemNum}]`;

                                                return (
                                                    <div key={itemNum} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                                        <h5 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">{activeGroupLabel}</h5>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {group.fields?.map((field: any, fIdx: number) => {
                                                                const ansObj = currentAnswersGroup.find(a => a.group_label === activeGroupLabel && a.field_label === field.label);
                                                                const fieldVal = ansObj ? ansObj.answer_value : '';
                                                                const compId = `${q.id}_${activeGroupLabel}_${field.label}`;

                                                                let innerInput = null;
                                                                if (field.type === 'text') {
                                                                    innerInput = <input type="text" value={fieldVal || ''} onChange={(e) => handleMultipleAnswerChange(q.id, activeGroupLabel, field.label, field.type, e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none text-sm focus:border-[#10b981]" placeholder="Judul..." />;
                                                                } else if (field.type === 'url_website') {
                                                                    innerInput = <input type="url" value={fieldVal || ''} onChange={(e) => handleMultipleAnswerChange(q.id, activeGroupLabel, field.label, field.type, e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 outline-none text-sm focus:border-[#10b981]" placeholder="https://..." />;
                                                                } else if (field.type === 'textarea') {
                                                                    innerInput = <textarea rows={3} value={fieldVal || ''} onChange={(e) => handleMultipleAnswerChange(q.id, activeGroupLabel, field.label, field.type, e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#10b981] outline-none transition-all text-sm" placeholder="Mulai mengetik..." />;
                                                                } else if (field.type === 'file_upload') {
                                                                    const currentFile = fileObjects[compId];
                                                                    const progress = uploadProgress[compId];
                                                                    innerInput = (
                                                                        <div className="space-y-3">
                                                                            <input
                                                                                type="file"
                                                                                accept=".pdf,.docx,.xlsx,.pptx,.jpeg,.jpg,.png"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (!file) return;
                                                                                    if (file.size > MAX_FILE_SIZE_BYTES) {
                                                                                        alert(`Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB}MB.`);
                                                                                        e.target.value = ''; return;
                                                                                    }
                                                                                    setFileObjects(prev => ({ ...prev, [compId]: file }));
                                                                                    handleMultipleAnswerChange(q.id, activeGroupLabel, field.label, field.type, file.name);
                                                                                    setUploadProgress(prev => ({ ...prev, [compId]: 'idle' }));
                                                                                }}
                                                                                className="w-full p-2.5 rounded-xl border bg-white outline-none transition-all cursor-pointer file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 text-sm border-slate-200"
                                                                            />
                                                                            {fieldVal && !currentFile && typeof fieldVal === 'string' && fieldVal.startsWith('http') && (
                                                                                <a href={fieldVal} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
                                                                                    <FileCheck size={14} /> Lihat File Tersimpan
                                                                                </a>
                                                                            )}
                                                                            {currentFile && (
                                                                                <div className="flex items-center gap-2 p-2.5 rounded-lg border text-sm bg-slate-50 border-slate-200 text-slate-600">
                                                                                    <Upload size={14} className="shrink-0" />
                                                                                    <span className="truncate font-medium flex-1">{currentFile.name} ({progress === 'uploading' ? '...' : (currentFile.size / 1024 / 1024).toFixed(1) + 'MB'})</span>
                                                                                    <button type="button" onClick={() => {
                                                                                        setFileObjects(prev => { const copy = { ...prev }; delete copy[compId]; return copy; });
                                                                                        handleMultipleAnswerChange(q.id, activeGroupLabel, field.label, field.type, '');
                                                                                        setUploadProgress(prev => { const copy = { ...prev }; delete copy[compId]; return copy; });
                                                                                    }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div key={fIdx}>
                                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
                                                                        {innerInput}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Trigger a state update by just adding an empty answer for the newly grouped number
                                                const nextNum = maxCount + 1;
                                                const firstField = group.fields[0];
                                                if (firstField) {
                                                    handleMultipleAnswerChange(q.id, `${group.item_label} [${nextNum}]`, firstField.label, firstField.type, '');
                                                }
                                            }}
                                            className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-sm hover:bg-emerald-100 transition-colors border border-emerald-200"
                                        >
                                            + Tambah {group.item_label}
                                        </button>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                );
            }
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
                                        <span>{isUploadingFiles ? 'Mengupload file...' : 'Menyimpan...'}</span>
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

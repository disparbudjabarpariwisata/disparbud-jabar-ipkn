'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Loader2,
    HelpCircle,
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    AlertCircle,
    CheckCircle2,
    Search,
    GripVertical,
    Building2,
} from 'lucide-react';

interface RoleType {
    id: string;
    role_name: string;
}

interface SurveyQuestion {
    id: string;
    role_id: string;
    institution_name: string | null;
    question_text: string;
    question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'number' | 'date' | 'linear_scale' | 'file_upload' | 'section_break' | 'url_website' | 'url_youtube' | 'url_gdrive' | 'url_social_media';
    options: string[] | null;
    is_required: boolean;
    sort_order: number;
    active: boolean;
    depends_on_question_id: string | null;
    depends_on_answer: string | null;
    created_at: string;
}

interface FormData {
    role_id: string;
    institution_name: string;
    question_text: string;
    question_type: SurveyQuestion['question_type'];
    options: string; // We'll manage options as a comma-separated string in the form
    is_required: boolean;
    sort_order: number;
    active: boolean;
    depends_on_question_id: string;
    depends_on_answer: string;
}

const defaultForm: FormData = {
    role_id: '',
    institution_name: '',
    question_text: '',
    question_type: 'text',
    options: '',
    is_required: true,
    sort_order: 0,
    active: true,
    depends_on_question_id: '',
    depends_on_answer: '',
};

export default function AdminQuestionsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRoleId, setFilterRoleId] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(defaultForm);

    // Feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
        };
        checkAuth();
    }, [router]);

    // Fetch roles ONCE on mount
    useEffect(() => {
        if (!isAuthorized) return;
        const fetchRoles = async () => {
            const { data: roleData, error: roleError } = await supabase
                .from('role_types')
                .select('id, name')
                .eq('active', true);

            if (roleData) {
                const mappedRoles = roleData.map(r => ({ ...r, role_name: r.name }));
                setRoles(mappedRoles);
            }
            if (roleError) console.error(roleError);
        };
        fetchRoles();
    }, [isAuthorized]);

    // Fetch institutions dynamically when role_id changes
    const [roleInstitutions, setRoleInstitutions] = useState<string[]>([]);

    useEffect(() => {
        const fetchInstitutionsForRole = async () => {
            if (!form.role_id) {
                setRoleInstitutions([]);
                return;
            }

            const selectedRole = roles.find(r => r.id === form.role_id);
            if (!selectedRole) {
                setRoleInstitutions([]);
                return;
            }

            const roleName = selectedRole.role_name.toLowerCase();
            let tableName = '';
            let columnName = '';

            if (roleName.includes('perangkat daerah')) {
                tableName = 'institution_names';
                columnName = 'name';
            } else if (roleName.includes('instansi pemerintah terkait') || roleName.includes('pemerintah terkait')) {
                tableName = 'institution_names2';
                columnName = 'name';
            } else if (roleName.includes('kota') || roleName.includes('kabupaten')) {
                tableName = 'cities_jabar';
                columnName = 'name';
            } else {
                setRoleInstitutions([]);
                return;
            }

            if (tableName) {
                const { data, error } = await supabase
                    .from(tableName)
                    .select(columnName)
                    .order(columnName, { ascending: true });

                if (data && !error) {
                    setRoleInstitutions(data.map((item: any) => item[columnName]));
                } else {
                    setRoleInstitutions([]);
                }
            } else {
                setRoleInstitutions([]);
            }
        };

        fetchInstitutionsForRole();
    }, [form.role_id, roles]);

    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        const { data: qData, error: qError } = await supabase
            .from('survey_questions')
            .select('*')
            .order('sort_order', { ascending: true });

        if (qError) {
            setError('Failed to load questions: ' + qError.message);
        } else {
            setQuestions(qData || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthorized) fetchQuestions();
    }, [isAuthorized, fetchQuestions]);

    // Filtering
    const displayQuestions = questions.filter(q => {
        const matchesRole = filterRoleId ? q.role_id === filterRoleId : true;
        const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ ...defaultForm, role_id: filterRoleId || (roles[0]?.id || ''), sort_order: displayQuestions.length });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (q: SurveyQuestion) => {
        setEditingId(q.id);
        setForm({
            role_id: q.role_id,
            institution_name: q.institution_name || '',
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options ? q.options.join(', ') : '',
            is_required: q.is_required,
            sort_order: q.sort_order,
            active: q.active,
            depends_on_question_id: q.depends_on_question_id || '',
            depends_on_answer: q.depends_on_answer || ''
        });
        setIsModalOpen(true);
        setError(null);
    };

    const handleSave = async () => {
        if (!form.role_id) { setError('Role Kategori Instansi wajib dipilih.'); return; }
        if (!form.question_text.trim()) { setError('Pertanyaan tidak boleh kosong.'); return; }

        const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(form.question_type);
        if (requiresOptions && !form.options.trim()) {
            setError(`Tipe input ${form.question_type} membutuhkan Opsi Jawaban (pisahkan dengan koma).`);
            return;
        }

        setIsSaving(true);
        setError(null);

        // Process options from comma separated string to JSON array
        const processedOptions = requiresOptions
            ? form.options.split(',').map(o => o.trim()).filter(Boolean)
            : null;

        const payload = {
            role_id: form.role_id,
            institution_name: form.institution_name.trim() || null,
            question_text: form.question_text.trim(),
            question_type: form.question_type,
            options: processedOptions,
            is_required: form.is_required,
            sort_order: form.sort_order,
            active: form.active,
            depends_on_question_id: form.depends_on_question_id || null,
            depends_on_answer: form.depends_on_question_id && form.depends_on_answer ? form.depends_on_answer.trim() : null
        };

        const { error: dbError } = editingId
            ? await supabase.from('survey_questions').update(payload).eq('id', editingId)
            : await supabase.from('survey_questions').insert(payload);

        if (dbError) {
            setError('Gagal menyimpan: ' + dbError.message);
        } else {
            setSuccess(editingId ? 'Pertanyaan diperbarui!' : 'Pertanyaan ditambahkan!');
            setIsModalOpen(false);
            fetchQuestions();
        }
        setIsSaving(false);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('survey_questions').delete().eq('id', id);
        if (error) {
            setError('Gagal menghapus: ' + error.message);
        } else {
            setSuccess('Pertanyaan dihapus!');
            setDeletingId(null);
            fetchQuestions();
        }
        setTimeout(() => setSuccess(null), 3000);
    };

    const toggleActive = async (q: SurveyQuestion) => {
        await supabase.from('survey_questions').update({ active: !q.active }).eq('id', q.id);
        fetchQuestions();
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#10b981]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Pertanyaan Survei</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola pertanyaan dinamis untuk masing-masing Kategori Instansi.</p>
                    </div>
                    <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] transition-all shadow-md">
                        <Plus size={18} /> Tambah Pertanyaan
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Filter Kategori Instansi (Role)</label>
                        <select
                            value={filterRoleId}
                            onChange={(e) => setFilterRoleId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:border-[#10b981] outline-none"
                        >
                            <option value="">Semua Kategori (Tampilkan Semua)</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.role_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Cari Teks Pertanyaan</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pertanyaan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#10b981] outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Feedback Messages */}
                {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 text-sm border border-emerald-200">
                        <CheckCircle2 size={18} /><span>{success}</span>
                    </div>
                )}
                {error && !isModalOpen && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-200">
                        <AlertCircle size={18} /><span>{error}</span>
                    </div>
                )}

                {/* Question List */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#10b981]" size={32} /></div>
                ) : displayQuestions.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-gray-900 font-semibold mb-1">Belum ada pertanyaan</h3>
                        <p className="text-gray-500 text-sm">Pilih Kategori Instansi dan buat pertanyaan baru.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-100">
                            {displayQuestions.map((q) => (
                                <div key={q.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center">
                                    <div className="text-gray-400 cursor-move hidden sm:block">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${q.is_required ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {q.is_required ? 'Wajib Isi' : 'Opsional'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                                {q.question_type}
                                            </span>
                                            {q.institution_name && (
                                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider border border-amber-200 flex items-center gap-1">
                                                    <Building2 size={10} /> {q.institution_name}
                                                </span>
                                            )}
                                            {q.sort_order > 0 && <span className="text-xs text-gray-400">#Urutan {q.sort_order}</span>}
                                            {q.depends_on_question_id && (
                                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider border border-purple-200">
                                                    Logic Cabang
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-gray-900 font-medium text-base">{q.question_text}</h4>
                                        {q.options && q.options.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {q.options.map((opt, idx) => (
                                                    <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                                                        {opt}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 sm:shrink-0 justify-end mt-4 sm:mt-0">
                                        <button
                                            onClick={() => toggleActive(q)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${q.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {q.active ? 'Aktif' : 'Draft'}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(q)}
                                            className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                            title="Edit Setup"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(q.id)}
                                            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Delete Confrim Modal */}
                                    {deletingId === q.id && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pertanyaan?</h3>
                                                <p className="text-gray-500 text-sm mb-6">Pertanyaan dan semua riwayat jawaban untuk pertanyaan ini akan terhapus secara permanen. Lanjutkan?</p>
                                                <div className="flex gap-3 justify-end">
                                                    <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Batal</button>
                                                    <button onClick={() => handleDelete(q.id)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700">Ya, Hapus</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />{error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Instansi (Role Target)</label>
                                <select
                                    value={form.role_id}
                                    onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#10b981] outline-none text-sm"
                                >
                                    <option value="" disabled>Pilih Role...</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Instansi (Opsional)</label>
                                {roleInstitutions.length > 0 ? (
                                    <select
                                        value={form.institution_name}
                                        onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#10b981] outline-none text-sm bg-white"
                                    >
                                        <option value="">Semua Instansi (Berlaku Spesifik Kategori Ini)</option>
                                        {roleInstitutions.map((inst, i) => (
                                            <option key={i} value={inst}>{inst}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Contoh: Dinas Pariwisata dan Kebudayaan (Kosongkan jika berlaku untuk semua instansi di kategori ini)"
                                        value={form.institution_name}
                                        onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#10b981] outline-none text-sm"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pertanyaan</label>
                                <textarea
                                    autoFocus
                                    rows={2}
                                    placeholder="Contoh: Berapa banyak wisatawan asing di tahun 2024?"
                                    value={form.question_text}
                                    onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10b981] outline-none text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Input Jawaban</label>
                                    <select
                                        value={form.question_type}
                                        onChange={(e) => setForm({ ...form, question_type: e.target.value as any })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#10b981] outline-none text-sm"
                                    >
                                        <option value="text">Teks Pendek (Text)</option>
                                        <option value="textarea">Teks Panjang (Textarea)</option>
                                        <option value="number">Angka (Number)</option>
                                        <option value="radio">Pilihan Ganda - 1 Jawaban (Radio)</option>
                                        <option value="checkbox">Pilihan Ganda - Banyak Jawaban (Checkbox)</option>
                                        <option value="dropdown">Dropdown Select</option>
                                        <option value="date">Tanggal (Date)</option>
                                        <option value="linear_scale">Skala Linear 1-7 (Linear Scale)</option>
                                        <option value="file_upload">Upload File</option>
                                        <option value="section_break">--- Pemisah Halaman (Section Break) ---</option>
                                        <option value="url_website">Link Website Umum</option>
                                        <option value="url_youtube">Link YouTube Video</option>
                                        <option value="url_gdrive">Link Google Drive</option>
                                        <option value="url_social_media">Link Akun Social Media</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Urut Tampil (Sort Order)</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#10b981] outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {['radio', 'checkbox', 'dropdown'].includes(form.question_type) && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <label className="block text-sm font-bold text-amber-900 mb-1.5">Opsi Pilihan (Pisahkan dengan koma)</label>
                                    <p className="text-xs text-amber-700 mb-2">Contoh: 1-10 Orang, 11-50 Orang, Lebih dari 50 Orang</p>
                                    <textarea
                                        rows={2}
                                        value={form.options}
                                        onChange={(e) => setForm({ ...form, options: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:border-amber-500 outline-none text-sm"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_required}
                                        onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                                        className="w-5 h-5 accent-[#10b981] cursor-pointer rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Jawaban Wajib Diisi (Required)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                        className="w-5 h-5 accent-[#10b981] cursor-pointer rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Pertanyaan Aktif / Ditampilkan</span>
                                </label>
                            </div>

                            {/* Conditional Logic Section */}
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-purple-500" /> Pengaturan Logika (Skip Logic)
                                </h4>
                                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tampilkan pertanyaan INI hanya jika pertanyaan SEBELUMNYA disi dengan...</label>
                                        <select
                                            value={form.depends_on_question_id}
                                            onChange={(e) => setForm({ ...form, depends_on_question_id: e.target.value, depends_on_answer: '' })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm bg-white"
                                        >
                                            <option value="">-- Selalu Tampilkan (Tanpa Syarat) --</option>
                                            {questions
                                                .filter(q => q.role_id === form.role_id && q.id !== editingId && ['radio', 'dropdown', 'checkbox'].includes(q.question_type))
                                                .map(q => (
                                                    <option key={q.id} value={q.id}>Jika: "{q.question_text.length > 50 ? q.question_text.substring(0, 50) + '...' : q.question_text}"</option>
                                                ))
                                            }
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1">Hanya pertanyaan bertipe Pilihan Ganda / Dropdown yang dapat dijadikan syarat panduan trigger.</p>
                                    </div>

                                    {form.depends_on_question_id && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Menjawab dengan opsi yang mengandung teks persis berikut:</label>
                                            <select
                                                value={form.depends_on_answer}
                                                onChange={(e) => setForm({ ...form, depends_on_answer: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 outline-none text-sm bg-white"
                                            >
                                                <option value="" disabled>Pilih Opsi Syarat Jawaban...</option>
                                                {questions.find(q => q.id === form.depends_on_question_id)?.options?.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#10b981] rounded-xl hover:bg-[#059669] transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Simpan Pertanyaan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

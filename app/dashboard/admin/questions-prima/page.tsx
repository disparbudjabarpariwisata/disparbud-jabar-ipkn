'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import MultipleInputBuilder from '@/components/admin/MultipleInputBuilder';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Copy,
    Save,
    ClipboardList,
    Building2,
    Search
} from 'lucide-react';

interface RoleType {
    id: string;
    role_name: string;
}

interface Institution {
    role_id: string;
    role_name: string;
    institution_name: string;
}

interface FormData {
    question_text: string;
    question_type: string;
    options: string;
    is_required: boolean;
    sort_order: number;
    active: boolean;
    depends_on_question_id: string;
    depends_on_answer: string;
}

const defaultForm: FormData = {
    question_text: '',
    question_type: 'text',
    options: '',
    is_required: true,
    sort_order: 0,
    active: true,
    depends_on_question_id: '',
    depends_on_answer: '',
};

export default function AdminQuestionsPrimaPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Data
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [questions, setQuestions] = useState<any[]>([]); // Used for skip logic

    // Form & Selections
    const [form, setForm] = useState<FormData>(defaultForm);
    const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]); // Array of "{role_id}|{institution_name}"
    
    // Filters for Institutions
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

    // Feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    // Data Fetching
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Roles
                const { data: roleData, error: roleError } = await supabase
                    .from('role_types')
                    .select('id, name')
                    .eq('active', true);
                
                if (roleError) throw roleError;

                const mappedRoles = roleData.map(r => ({ id: r.id, role_name: r.name }));
                setRoles(mappedRoles);

                // 2. Fetch Institutions for each role
                let fetchedInstitutions: Institution[] = [];
                for (const role of mappedRoles) {
                    const roleName = role.role_name.toLowerCase();
                    let tableName = '';
                    let columnName = 'name';

                    if (roleName.includes('perangkat daerah')) {
                        tableName = 'institution_names';
                    } else if (roleName.includes('instansi pemerintah terkait') || roleName.includes('pemerintah terkait') || roleName.includes('swasta terkait')) {
                        tableName = 'institution_names2';
                    } else if (roleName.includes('kota') || roleName.includes('kabupaten')) {
                        tableName = 'cities_jabar';
                    }
                    // If there are other roles, you can map them here or just provide general access

                    if (tableName) {
                        const { data: instData, error: instError } = await supabase
                            .from(tableName)
                            .select(columnName)
                            .order(columnName, { ascending: true });
                        
                        if (instData && !instError) {
                            fetchedInstitutions = fetchedInstitutions.concat(
                                instData.map((item: any) => ({
                                    role_id: role.id,
                                    role_name: role.role_name,
                                    institution_name: item[columnName]
                                }))
                            );
                        }
                    } else {
                        // Some roles might not have tables (e.g., Pelaku Usaha Pariwisata), 
                        // we can optionally add a "General" institution for them or skip
                    }
                }
                setAllInstitutions(fetchedInstitutions);

                // 3. Fetch Questions for Skip Logic Dependencies
                const { data: qData } = await supabase
                    .from('survey_questions')
                    .select('id, role_id, question_text, question_type, options');
                if (qData) setQuestions(qData);

            } catch (err: any) {
                console.error("Initialization Error", err);
                setError("Failed to load initial data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthorized]);

    const handleSelectInstitution = (role_id: string, institution_name: string) => {
        const key = `${role_id}|${institution_name}`;
        setSelectedInstitutions(prev => 
            prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
        );
    };

    const handleSelectRoleGroup = (role_id: string, institutions: Institution[]) => {
        const roleKeys = institutions.filter(i => i.role_id === role_id).map(i => `${i.role_id}|${i.institution_name}`);
        const allSelected = roleKeys.every(k => selectedInstitutions.includes(k));

        if (allSelected) {
            // Deselect all
            setSelectedInstitutions(prev => prev.filter(k => !roleKeys.includes(k)));
        } else {
            // Select all
            setSelectedInstitutions(prev => Array.from(new Set([...prev, ...roleKeys])));
        }
    };

    const getGroupedInstitutions = () => {
        const grouped: Record<string, Institution[]> = {};
        allInstitutions.forEach(inst => {
            if (!grouped[inst.role_id]) grouped[inst.role_id] = [];
            
            // Apply search filter locally to each group
            const term = (searchTerms[inst.role_id] || '').toLowerCase();
            if (inst.institution_name.toLowerCase().includes(term)) {
                grouped[inst.role_id].push(inst);
            }
        });
        return grouped;
    };

    const handleSearchChange = (role_id: string, value: string) => {
        setSearchTerms(prev => ({ ...prev, [role_id]: value }));
    };

    const handleGenerate = async () => {
        if (selectedInstitutions.length === 0) { 
            setError('Pilih minimal 1 instansi untuk di-assign pertanyaan.'); window.scrollTo(0,0); return; 
        }
        if (!form.question_text.trim()) { 
            setError('Pertanyaan tidak boleh kosong.'); window.scrollTo(0,0); return; 
        }

        const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(form.question_type);
        if (requiresOptions && !form.options.trim()) {
            setError(`Tipe input ${form.question_type} membutuhkan Opsi Jawaban (pisahkan dengan koma).`);
            window.scrollTo(0,0); return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        let processedOptions: any = null;
        if (requiresOptions) {
            processedOptions = form.options.split(',').map(o => o.trim()).filter(Boolean);
        } else if (form.question_type === 'multiple_input') {
            try {
                processedOptions = form.options ? JSON.parse(form.options) : null;
            } catch (e) {
                setError('Format Opsi untuk tipe Multiple Input harus berupa JSON yang valid.');
                setIsSaving(false); window.scrollTo(0,0); return;
            }
        }

        // Parse selected assignments
        const assigned_institutions = selectedInstitutions.map(key => {
            const [r_id, i_name] = key.split('|');
            return { role_id: r_id, institution_name: i_name };
        });

        const payload = {
            assigned_institutions,
            question_text: form.question_text.trim(),
            question_type: form.question_type,
            options: processedOptions,
            is_required: form.is_required,
            sort_order: form.sort_order,
            active: form.active,
            depends_on_question_id: form.depends_on_question_id || null,
            depends_on_answer: form.depends_on_question_id && form.depends_on_answer ? form.depends_on_answer.trim() : null
        };

        try {
            const res = await fetch('/api/admin/questions-prima/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Server error.');

            setSuccess(`Berhasil membuat ${data.count} pertanyaan.`);
            setForm(defaultForm);
            window.scrollTo(0,0);
        } catch (err: any) {
            setError(err.message);
            window.scrollTo(0,0);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthorized || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const groupedInst = getGroupedInstitutions();

    // Determine viable parent questions for skip logic
    // Usually skip logic is tricky across multiple roles because parent question IDs differ.
    // For Prima, we'll allow cross-role dependency IF the admin knows what they are doing, 
    // but in practice, they shouldn't use it unless cloning exactly. We'll show all.
    const eligibleParentQuestions = questions.filter(q => ['radio', 'dropdown', 'checkbox'].includes(q.question_type));

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg">
                    <div className="flex items-center gap-3 text-blue-200 mb-2">
                        <ClipboardList size={28} />
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Survey Questions Prima</h1>
                    </div>
                    <p className="text-blue-100/80 max-w-2xl text-sm md:text-base leading-relaxed">
                        Fitur Generator Massal: Buat format pertanyaan satu kali, dan aplikasikan (Assign) serentak ke banyak instansi dari berbagai kategori tanpa mencampur data responden.
                    </p>
                </div>

                {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 text-sm border border-emerald-200 shadow-sm transition-all">
                        <CheckCircle2 size={20} className="shrink-0" /><span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-200 shadow-sm transition-all">
                        <AlertCircle size={20} className="shrink-0" /><span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Panel: Builder */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <Copy size={20} className="text-blue-600" /> Tahap 1: Setup Konten Pertanyaan
                            </h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teks Pertanyaan</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tuliskan pertanyaan Anda..."
                                        value={form.question_text}
                                        onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y text-base"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Input Jawaban</label>
                                        <select
                                            value={form.question_type}
                                            onChange={(e) => setForm({ ...form, question_type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-gray-50 hover:bg-white transition-colors cursor-pointer"
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
                                            <option value="section_break">--- Pemisah Halaman (Section) ---</option>
                                            <option value="multiple_input">Multiple Input (Complex Matrix)</option>
                                            <option value="url_website">Link Website Umum</option>
                                            <option value="url_youtube">Link YouTube Video</option>
                                            <option value="url_gdrive">Link Google Drive</option>
                                            <option value="url_social_media">Link Akun Social Media</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Urut Tampil (Sort Order)</label>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-gray-50 hover:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {['radio', 'checkbox', 'dropdown'].includes(form.question_type) && (
                                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200 rounded-xl">
                                        <label className="block text-sm font-bold text-amber-900 mb-1">Opsi Pilihan (Pisahkan dengan koma)</label>
                                        <p className="text-xs text-amber-700 mb-3">Contoh: Opsi 1, Opsi 2, Opsi 3</p>
                                        <textarea
                                            rows={2}
                                            value={form.options}
                                            onChange={(e) => setForm({ ...form, options: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:border-amber-500 outline-none text-sm bg-white"
                                        />
                                    </div>
                                )}

                                {form.question_type === 'multiple_input' && (
                                    <MultipleInputBuilder
                                        value={form.options}
                                        onChange={(val) => setForm({ ...form, options: val })}
                                    />
                                )}

                                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={form.is_required}
                                            onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                                            className="w-5 h-5 accent-blue-600 rounded bg-gray-100 border-gray-300 transition-all cursor-pointer group-hover:scale-105"
                                        />
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">Wajib Diisi (Required)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={form.active}
                                            onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                            className="w-5 h-5 accent-emerald-500 rounded bg-gray-100 border-gray-300 transition-all cursor-pointer group-hover:scale-105"
                                        />
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">Aktif & Ditampilkan</span>
                                    </label>
                                </div>

                                {/* Skip Logic (Optional edge case for bulk, shown as advanced) */}
                                <div className="pt-6">
                                    <details className="group">
                                        <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-800 outline-none list-none marker:hidden">
                                            <span className="w-5 h-5 rounded flex items-center justify-center bg-purple-100 text-purple-700 transition-transform group-open:rotate-90">
                                                ▶
                                            </span>
                                            Opsi Lanjutan: Logika Cabang (Skip Logic)
                                            <span className="text-xs font-normal text-gray-400 ml-2">(Gunakan dengan hati-hati pada assign massal)</span>
                                        </summary>
                                        <div className="mt-4 p-5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2">Tampilkan pertanyaan INI hanya jika ID pertanyaan SEBELUMNYA adalah:</label>
                                                <input 
                                                    type="text"
                                                    placeholder="Input ID Pertanyaan Parent"
                                                    value={form.depends_on_question_id}
                                                    onChange={(e) => setForm({ ...form, depends_on_question_id: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-400 outline-none text-sm bg-white"
                                                />
                                            </div>
                                            {form.depends_on_question_id && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-2">Dan jawabannya adalah (teks persis):</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="Contoh: Ya, Ada"
                                                        value={form.depends_on_answer}
                                                        onChange={(e) => setForm({ ...form, depends_on_answer: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-lg border border-purple-200 focus:border-purple-400 outline-none text-sm bg-white"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isSaving || selectedInstitutions.length === 0}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-[15px] hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                                    >
                                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                        Generate {selectedInstitutions.length > 0 ? `untuk ${selectedInstitutions.length} Instansi` : 'Questions'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Assign Institutions Checklist */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-6 h-[calc(100vh-2rem)] flex flex-col">
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2 px-1">
                                    <Building2 size={20} className="text-emerald-500" /> Tahap 2: Assign Instansi 
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-xs py-1 px-2 rounded-lg ml-2">
                                    {selectedInstitutions.length} Terpilih
                                </span>
                            </h2>
                            <p className="text-xs text-gray-500 mb-4 px-1 pb-4 border-b border-gray-100 border-dashed">
                                Centang instansi mana saja yang akan menerima pertanyaan ini. Anda bisa mencari dan memilih per-Kategori.
                            </p>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                                {roles.map(role => {
                                    const insts = groupedInst[role.id] || [];
                                    const rawCount = allInstitutions.filter(i => i.role_id === role.id).length;
                                    
                                    if (rawCount === 0) return null; // Hide roles with no institutions mapped natively

                                    const roleKeys = insts.map(i => `${i.role_id}|${i.institution_name}`);
                                    const isAllSelected = roleKeys.length > 0 && roleKeys.every(k => selectedInstitutions.includes(k));
                                    const isSomeSelected = roleKeys.some(k => selectedInstitutions.includes(k)) && !isAllSelected;

                                    return (
                                        <div key={role.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-[0_2px_4px_rgba(0,0,0,0.01)] transition-all">
                                            <div className="bg-gray-50/80 p-3 border-b border-gray-100 flex items-center justify-between gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-gray-700 text-sm flex-1">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        ref={(el) => { if (el) el.indeterminate = isSomeSelected; }}
                                                        onChange={() => handleSelectRoleGroup(role.id, insts)}
                                                        className="w-4 h-4 accent-blue-600 rounded bg-white border-gray-300 cursor-pointer"
                                                    />
                                                    <span className="truncate" title={role.role_name}>{role.role_name}</span>
                                                </label>
                                            </div>
                                            
                                            <div className="p-2 border-b border-gray-100 bg-white">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input 
                                                        type="text"
                                                        placeholder="Cari instansi..."
                                                        value={searchTerms[role.id] || ''}
                                                        onChange={(e) => handleSearchChange(role.id, e.target.value)}
                                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-48 overflow-y-auto bg-white p-2 flex flex-col gap-0.5 scrollbar-thin">
                                                {insts.length === 0 ? (
                                                    <div className="text-xs text-gray-400 py-3 text-center italic">Tidak ada instansi yang cocok.</div>
                                                ) : (
                                                    insts.map((inst, idx) => {
                                                        const key = `${inst.role_id}|${inst.institution_name}`;
                                                        const isChecked = selectedInstitutions.includes(key);
                                                        return (
                                                            <label 
                                                                key={idx} 
                                                                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                                            >
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleSelectInstitution(inst.role_id, inst.institution_name)}
                                                                    className="w-4 h-4 mt-0.5 accent-blue-600 rounded bg-white border-gray-300 cursor-pointer shrink-0"
                                                                />
                                                                <span className={`text-xs leading-relaxed ${isChecked ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>
                                                                    {inst.institution_name}
                                                                </span>
                                                            </label>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ADMIN_EMAIL, adminMenuItems } from '@/lib/adminConfig';
import { Loader2, Download, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

type RoleType = {
    id: string;
    role_name: string;
};

type ResultRow = {
    respondent_id: string;
    respondent_name: string;
    role_name: string;
    institution: string;
    position: string;
    email: string;
    question_text: string;
    answer: string;
};

export default function AdminResultsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data filtering
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [selectedRole, setSelectedRole] = useState('');

    const [institutions, setInstitutions] = useState<string[]>([]);
    const [selectedInstitution, setSelectedInstitution] = useState('');

    const [results, setResults] = useState<ResultRow[]>([]);
    const [isExporting, setIsExporting] = useState(false);

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

    // 1. Fetch Roles on mount
    useEffect(() => {
        if (!isAuthorized) return;
        const fetchRoles = async () => {
            const { data } = await supabase.from('role_types').select('id, name').eq('active', true);
            if (data) {
                setRoles(data.map(r => ({ id: r.id, role_name: r.name })));
            }
        };
        fetchRoles();
    }, [isAuthorized]);

    // 2. Fetch Institutions dynamically based on Selected Role
    useEffect(() => {
        const fetchInstitutionsForRole = async () => {
            if (!selectedRole) {
                setInstitutions([]);
                setSelectedInstitution('');
                return;
            }

            const roleObj = roles.find(r => r.id === selectedRole);
            if (!roleObj) return;

            const rName = roleObj.role_name.toLowerCase();
            let tableName = '';
            let columnName = '';

            if (rName.includes('perangkat daerah')) {
                tableName = 'institution_names';
                columnName = 'name';
            } else if (rName.includes('instansi pemerintah terkait') || rName.includes('pemerintah terkait')) {
                tableName = 'institution_names2';
                columnName = 'name';
            } else if (rName.includes('kota') || rName.includes('kabupaten')) {
                tableName = 'cities_jabar';
                columnName = 'city_name';
            }

            if (tableName) {
                const { data } = await supabase.from(tableName).select(columnName).order(columnName, { ascending: true });
                if (data) {
                    setInstitutions(data.map((item: any) => item[columnName]));
                }
            } else {
                setInstitutions([]);
            }
        };
        fetchInstitutionsForRole();
    }, [selectedRole, roles]);

    // 3. Fetch Data based on Filters
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchData = async () => {
            setIsLoading(true);

            // Step A: Determine table name based on active role
            const getTableNameFromRoleName = (roleStr: string) => {
                const lower = roleStr.toLowerCase();
                const mapping = [
                    { keywords: ['perangkat daerah'], table: 'survey_perangkat_daerah' },
                    { keywords: ['instansi pemerintah', 'pemerintah terkait'], table: 'survey_pemerintah_terkait' },
                    { keywords: ['swasta'], table: 'survey_swasta_terkait' },
                    { keywords: ['komunitas', 'asosiasi'], table: 'survey_komunitas' },
                    { keywords: ['pelaku usaha', 'ekraf'], table: 'survey_pelaku_usaha' },
                    { keywords: ['kota/kabupaten', 'kabupaten', 'pemda'], table: 'survey_pemda_kabkota' },
                    { keywords: ['pemerintah pusat'], table: 'survey_pemerintah_pusat' },
                    { keywords: ['internasional', 'international', 'tourism institution'], table: 'survey_international_tourism' },
                ];
                for (const entry of mapping) {
                    if (entry.keywords.some(kw => lower.includes(kw))) return entry.table;
                }
                return null;
            };

            let targetRolesToFetch = roles;
            if (selectedRole) {
                const r = roles.find(r => r.id === selectedRole);
                targetRolesToFetch = r ? [r] : [];
            }

            let allRespondents: any[] = [];

            // Fetch from each relevant table
            for (const role of targetRolesToFetch) {
                const tableName = getTableNameFromRoleName(role.role_name);
                if (!tableName) continue;

                let q = supabase.from(tableName).select('*').order('created_at', { ascending: false });
                if (selectedInstitution && selectedRole === role.id) {
                    q = q.eq('institution', selectedInstitution);
                }

                const { data, error } = await q;
                if (!error && data) {
                    allRespondents = [...allRespondents, ...data.map(d => ({ ...d, role_name_injected: role.role_name }))];
                }
            }

            if (allRespondents.length === 0) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            // Step B: Fetch survey answers for these respondents
            const respondentIds = allRespondents.map(r => r.id);
            const { data: answers, error: aError } = await supabase
                .from('survey_answers')
                .select(`
                    respondent_id,
                    answer_text,
                    answer_json,
                    survey_questions (
                        question_text
                    )
                `)
                .in('respondent_id', respondentIds);

            if (aError || !answers) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            // Map and flatten data
            const formattedResults: ResultRow[] = [];

            answers.forEach((ans: any) => {
                const respondent = allRespondents.find(r => r.id === ans.respondent_id);
                if (!respondent) return;

                let actualAnswer = ans.answer_text || '';
                if (ans.answer_json) {
                    actualAnswer = Array.isArray(ans.answer_json) ? ans.answer_json.join(', ') : JSON.stringify(ans.answer_json);
                }

                formattedResults.push({
                    respondent_id: respondent.id,
                    respondent_name: respondent.pic_name || 'NN',
                    role_name: respondent.role_name_injected,
                    institution: respondent.institution || '-',
                    position: respondent.position || '-',
                    email: respondent.email,
                    question_text: ans.survey_questions?.question_text || 'Unknown Question',
                    answer: actualAnswer,
                });
            });

            setResults(formattedResults);
            setIsLoading(false);
        };

        if (roles.length > 0) {
            fetchData();
        }
    }, [isAuthorized, selectedRole, selectedInstitution, roles]);

    // Export to Excel handler
    const handleExport = () => {
        if (results.length === 0) return;
        setIsExporting(true);

        // Prep data for excel
        const excelData = results.map(row => ({
            "Role (Kategori)": row.role_name,
            "Nama Instansi": row.institution,
            "Nama Responden": row.respondent_name,
            "Jabatan": row.position,
            "Email": row.email,
            "Pertanyaan": row.question_text,
            "Jawaban": row.answer
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns roughly
        const colWidths = [
            { wch: 30 }, // Role
            { wch: 35 }, // Instansi
            { wch: 25 }, // Nama
            { wch: 25 }, // Jabatan
            { wch: 30 }, // Email
            { wch: 60 }, // Pertanyaan
            { wch: 40 }, // Jawaban
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hasil Survei");
        XLSX.writeFile(wb, `Hasil_Survei_IPKN_${new Date().toISOString().split('T')[0]}.xlsx`);

        setIsExporting(false);
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
                        <h1 className="text-2xl font-bold text-gray-900">Hasil Survei (Results)</h1>
                        <p className="text-gray-500 text-sm mt-1">Lihat dan unduh tabulasi jawaban dari responden.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={results.length === 0 || isExporting}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Unduh Excel
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Filter Kategori Instansi (Role)</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                setSelectedInstitution(''); // Reset institution when role changes
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none"
                        >
                            <option value="">Semua Role (Tampilkan Semua)</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Filter Nama Instansi</label>
                        <select
                            value={selectedInstitution}
                            onChange={(e) => setSelectedInstitution(e.target.value)}
                            disabled={institutions.length === 0}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none disabled:opacity-50"
                        >
                            <option value="">Semua Instansi (Berdasarkan Role)</option>
                            {institutions.map((inst, idx) => (
                                <option key={idx} value={inst}>{inst}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-4 whitespace-nowrap">Role Instansi</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Nama Instansi</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Nama Responden</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Jabatan</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Pertanyaan</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Jawaban</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                                            <div className="flex justify-center mb-2"><Loader2 className="animate-spin text-[#10b981]" size={24} /></div>
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                                            Tidak ada data kuesioner ditemukan untuk filter tersebut.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 whitespace-nowrap text-xs font-medium bg-gray-50/50">{row.role_name}</td>
                                            <td className="px-5 py-3 min-w-[200px]"><span className="font-semibold text-gray-900 block">{row.institution}</span></td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{row.respondent_name}</div>
                                                <div className="text-xs text-gray-400">{row.email}</div>
                                            </td>
                                            <td className="px-5 py-3 min-w-[150px]">{row.position}</td>
                                            <td className="px-5 py-3 min-w-[300px] text-xs leading-relaxed text-gray-800 bg-amber-50/30">{row.question_text}</td>
                                            <td className="px-5 py-3 min-w-[200px] font-medium text-emerald-700">{row.answer}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination info or row count */}
                    {!isLoading && results.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                            <span>Menampilkan total <b>{results.length}</b> baris jawaban.</span>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

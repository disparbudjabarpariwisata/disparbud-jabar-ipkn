'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Loader2,
    Users,
    Search,
    MapPin,
    Smartphone,
    Mail,
    Globe,
    CalendarClock,
    UserCheck
} from 'lucide-react';

interface RoleType {
    id: string;
    role_name: string;
}

interface Respondent {
    id: string;
    table_source: string;
    role_name: string;
    institution: string;
    pic_name: string;
    position?: string;
    email: string;
    whatsapp: string;
    ip_address?: string;
    location?: string;
    created_at: string;
    progress_percentage: number;
}

export default function AdminRespondentsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const [roles, setRoles] = useState<RoleType[]>([]);
    const [activeTab, setActiveTab] = useState<string>('');
    const [respondents, setRespondents] = useState<Respondent[]>([]);

    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Authentication Check
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

    // Role Fetching
    useEffect(() => {
        const fetchRoles = async () => {
            if (!isAuthorized) return;
            const { data, error } = await supabase
                .from('role_types')
                .select('id, name')
                .eq('active', true)
                .order('sort_order', { ascending: true });

            if (data && data.length > 0) {
                const mappedRoles = data.map(r => ({ ...r, role_name: r.name }));
                setRoles(mappedRoles);
                setActiveTab(mappedRoles[0].role_name); // SET DEFAULT TAB
            }
            if (error) setError(error.message);
            setIsLoadingRoles(false);
        };
        fetchRoles();
    }, [isAuthorized]);

    const getTableNameFromRoleName = (role: string) => {
        switch (role) {
            case 'Perangkat Daerah Provinsi Jawa Barat': return 'survey_perangkat_daerah';
            case 'Instansi Pemerintah Terkait': return 'survey_pemerintah_terkait';
            case 'Instansi / Lembaga Swasta Terkait': return 'survey_swasta_terkait';
            case 'Komunitas / Asosiasi': return 'survey_komunitas';
            case 'Pelaku Usaha Pariwisata / Ekraf': return 'survey_pelaku_usaha';
            case 'Pemerintah Daerah Kota/Kabupaten Jawa Barat': return 'survey_pemda_kabkota';
            case 'Pemerintah Pusat': return 'survey_pemerintah_pusat';
            case 'Internasional Tourism Institution': return 'survey_international_tourism';
            default: return null;
        }
    };

    // Fetch Target Data when activeTab changes
    useEffect(() => {
        if (!activeTab || !isAuthorized) return;

        const loadRespondents = async () => {
            setIsLoadingData(true);
            setError(null);

            try {
                const tableName = getTableNameFromRoleName(activeTab);
                if (!tableName) throw new Error("Tabel untuk role ini tidak ditemukan di sistem.");

                // 1. Ambil data Identitas Responden dari tabel Role
                const { data: identities, error: idError } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (idError) throw idError;

                // 2. Jika Kosong langsung keluar
                if (!identities || identities.length === 0) {
                    setRespondents([]);
                    setIsLoadingData(false);
                    return;
                }

                // 3. Cari Total Pertanyaan "Required" untuk Role Ini (denominator)
                const targetRoleObj = roles.find(r => r.role_name === activeTab);
                let requiredCount = 0;

                if (targetRoleObj) {
                    const { count: reqCount, error: qError } = await supabase
                        .from('survey_questions')
                        .select('id', { count: 'exact', head: true })
                        .eq('role_id', targetRoleObj.id)
                        .eq('is_required', true)
                        .eq('active', true);

                    if (!qError && reqCount !== null) {
                        requiredCount = reqCount;
                    }
                }

                // 4. Hitung persentase progres masing-masing responden (Numerator)
                // Kita akan melakukan map Promise.all untuk mengambil jumlah jawaban tiap orang
                const enrichedData = await Promise.all(identities.map(async (user: any) => {
                    let progress = 0;

                    if (requiredCount > 0) {
                        // Get all answers from this SPECIFIC respondent
                        const { data: answers, error: aError } = await supabase
                            .from('survey_answers')
                            .select('question_id')
                            .eq('respondent_id', user.id);

                        if (!aError && answers) {
                            // Find unique questions answered
                            const uniqueQuestionIds = new Set(answers.map(a => a.question_id));
                            progress = Math.round((uniqueQuestionIds.size / requiredCount) * 100);

                            // Cap at 100% just in case they answered optional questions too
                            progress = progress > 100 ? 100 : progress;
                        }
                    } else {
                        // If no required questions set up by admin yet, we just assume 0% or N/A
                        progress = 0;
                    }

                    return {
                        id: user.id,
                        table_source: tableName,
                        role_name: user.role_name,
                        institution: user.institution,
                        pic_name: user.pic_name,
                        position: user.position || '-',
                        email: user.email,
                        whatsapp: user.whatsapp,
                        ip_address: user.ip_address || 'Tidak terlacak',
                        location: user.location || 'Tidak terlacak',
                        created_at: user.created_at,
                        progress_percentage: progress
                    } as Respondent;
                }));

                setRespondents(enrichedData);

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Gagal memuat data responden.');
                setRespondents([]);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadRespondents();
    }, [activeTab, isAuthorized, roles]);

    // Filtering Logic
    const filteredRespondents = respondents.filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.institution?.toLowerCase().includes(q) ||
            r.pic_name?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q)
        );
    });

    const formatDate = (isoString: string) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    if (!isAuthorized || isLoadingRoles) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#f97316]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">

                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserCheck className="text-orange-500" /> Pengawasan Responden
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Pantau identitas pendaftar, data geolokasi, dan persentase pengisian survei mereka.</p>
                </div>

                {/* Role Tabs Nav */}
                <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto flex gap-2 hide-scrollbar">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveTab(role.role_name)}
                            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === role.role_name
                                ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                }`}
                        >
                            {role.role_name}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tools */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="relative w-full sm:w-96">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Instansi, Nama PIC, atau Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-orange-500 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-200">
                        <span className="font-semibold">Error:</span> {error}
                    </div>
                )}

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                            <p>Mengkalkulasi progress dan menarik data...</p>
                        </div>
                    ) : filteredRespondents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                            <Users size={48} className="mb-4 text-gray-200" />
                            <p className="text-gray-600 font-medium">Belum ada pendaftar di kategori ini.</p>
                            <p className="text-sm">Bagikan link pendaftaran agar data masuk.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap">Instansi & PIC</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Kontak</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Geolokasi & Waktu</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Progress Survei</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRespondents.map((user) => (
                                        <tr key={user.id} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-900">{user.institution}</div>
                                                <div className="text-gray-500 flex items-center gap-1.5 mt-1">
                                                    <span className="font-medium text-gray-700">{user.pic_name}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-md">{user.position}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
                                                        <Mail size={14} /> <span>{user.email}</span>
                                                    </a>
                                                    <a href={`https://wa.me/${user.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
                                                        <Smartphone size={14} /> <span>{user.whatsapp}</span>
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5" title="IP Address">
                                                        <Globe size={13} className="text-gray-400" /> {user.ip_address}
                                                    </div>
                                                    <div className="flex items-center gap-1.5" title="City Location">
                                                        <MapPin size={13} className="text-red-400" /> {user.location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-400 mt-1" title="Join Date">
                                                        <CalendarClock size={13} /> {formatDate(user.created_at)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-full sm:w-48">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="font-semibold text-gray-700">{user.progress_percentage}%</span>
                                                        <span className="text-xs text-gray-400 font-medium">{
                                                            user.progress_percentage === 100 ? 'Selesai' :
                                                                user.progress_percentage === 0 ? 'Mendaftar' : 'Dalam Proses'
                                                        }</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${user.progress_percentage === 100 ? 'bg-emerald-500' :
                                                                user.progress_percentage > 0 ? 'bg-orange-500' : 'bg-transparent'
                                                                }`}
                                                            style={{ width: `${user.progress_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </DashboardLayout>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Users,
    Shield,
    Building2,
    Image,
    Search,
    Settings,
    Loader2,
    HelpCircle,
    UserCheck,
    Database,
    BarChart,
    Link as LinkIcon,
    ExternalLink,
    Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [statsData, setStatsData] = useState<{ progress: any[], publications: any[], filterRoles: string[], filterInstitutions: string[] } | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [filterRole, setFilterRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);

            // Fetch Dashboard Stats after auth
            try {
                const res = await fetch('/api/admin/dashboard-stats');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setStatsData({ 
                            progress: data.progress || [], 
                            publications: data.publications || [],
                            filterRoles: data.filterRoles || [],
                            filterInstitutions: data.filterInstitutions || []
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setIsLoadingStats(false);
            }
        };
        check();
    }, [router]);

    // Filtered progress list
    const filteredProgress = (statsData?.progress || []).filter((row: any) => {
        if (filterRole && row.roleName !== filterRole) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchInst = (row.institution || '').toLowerCase().includes(q);
            const matchEmail = (row.email || '').toLowerCase().includes(q);
            if (!matchInst && !matchEmail) return false;
        }
        return true;
    });

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 text-white">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
                    <p className="text-white/70">Smiling West Java — Management Panel</p>
                </div>



                {/* --- Section: Progress Pengisian Survey --- */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                            <BarChart size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Progress Pengisian Survey</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Total: {statsData?.progress?.length || 0} instansi
                                {filteredProgress.length !== (statsData?.progress?.length || 0) && ` · Ditampilkan: ${filteredProgress.length}`}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter Kategori Instansi (Role)</label>
                            <select 
                                value={filterRole} 
                                onChange={e => setFilterRole(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                            >
                                <option value="">Semua Role</option>
                                {(statsData?.filterRoles || []).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[250px]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Cari Nama Instansi / Email</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Ketik nama instansi atau email..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {isLoadingStats ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 text-gray-600 text-sm border-b border-gray-200">
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Nama Instansi</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Kategori Role</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">PIC Email</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Progress</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Last Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProgress.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                {searchQuery || filterRole ? 'Tidak ada data yang cocok dengan filter.' : 'Belum ada data responden atau pertanyaan.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProgress.map((row: any) => (
                                            <tr key={row.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${row.isUnregistered ? 'bg-red-50/30' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-800">{row.institution}</span>
                                                    {row.isUnregistered && (
                                                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">No Response</span>
                                                    )}
                                                    {row.totalQuestions && (
                                                        <span className="ml-1.5 text-[10px] text-gray-400 font-medium">({row.totalQuestions} Pertanyaan)</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-xs">
                                                    <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">{row.roleName || '-'}</span>
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {row.isUnregistered ? (
                                                        <span className="text-orange-500 font-medium italic">Not Assign Responden</span>
                                                    ) : (
                                                        <span className="text-gray-600">{row.email}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3 w-48">
                                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-1000 ${row.progress === 100 ? 'bg-emerald-500' : row.progress > 0 ? 'bg-orange-500' : 'bg-red-300'}`}
                                                                style={{ width: `${Math.max(row.progress, row.isUnregistered ? 3 : 0)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-sm font-semibold min-w-[40px] ${row.isUnregistered ? 'text-red-500' : 'text-gray-700'}`}>{row.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500">
                                                    {row.isUnregistered ? (
                                                        <span className="text-orange-400 italic text-xs">Menunggu Respon</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} />
                                                            {new Date(row.lastUpdate).toLocaleString('id-ID', {
                                                                day: 'numeric', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- Section: Link Publikasi --- */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <LinkIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Link Publikasi & Dokumentasi</h2>
                            <p className="text-sm text-gray-500 mt-1">Daftar tautan website, youtube, atau drive yang disubmit responden.</p>
                        </div>
                    </div>
                    
                    {isLoadingStats ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 text-gray-600 text-sm border-b border-gray-200">
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Instansi</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Pertanyaan Terkait</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Link Tersimpan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(statsData?.publications?.length || 0) === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-gray-500">Belum ada tautan publikasi tersimpan.</td>
                                        </tr>
                                    ) : (
                                        statsData!.publications.slice(0, 15).map((row: any) => (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 text-gray-800 font-medium">{row.institution}</td>
                                                <td className="py-4 px-6 text-gray-600 text-sm max-w-[300px] truncate" title={row.question}>{row.question}</td>
                                                <td className="py-4 px-6">
                                                    <a 
                                                        href={row.url.startsWith('http') ? row.url : `https://${row.url}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline bg-blue-50 px-3 py-1.5 rounded-full"
                                                    >
                                                        Buka Tautan
                                                        <ExternalLink size={14} />
                                                    </a>
                                                    <div className="text-xs text-gray-400 mt-1.5 ml-1 truncate max-w-[200px]" title={row.url}>{row.url}</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

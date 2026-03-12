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
    const [statsData, setStatsData] = useState<{ progress: any[], publications: any[] } | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

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
                        setStatsData({ progress: data.progress || [], publications: data.publications || [] });
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
                        <h2 className="text-xl font-bold text-gray-800">Progress Pengisian Survey</h2>
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
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">PIC Email</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Progress</th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">Last Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(statsData?.progress?.length || 0) === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">Belum ada data responden.</td>
                                        </tr>
                                    ) : (
                                        statsData!.progress.slice(0, 10).map((row: any) => (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-800">{row.institution}</span>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 text-sm">{row.email}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3 w-48">
                                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-1000 ${row.progress === 100 ? 'bg-emerald-500' : row.progress > 0 ? 'bg-orange-500' : 'bg-transparent'}`}
                                                                style={{ width: `${row.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700 min-w-[40px]">{row.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        {new Date(row.lastUpdate).toLocaleString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {(statsData?.progress?.length || 0) > 10 && (
                                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                                    <Link href="/dashboard/admin/respondents" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                        Lihat Semua Responden →
                                    </Link>
                                </div>
                            )}
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

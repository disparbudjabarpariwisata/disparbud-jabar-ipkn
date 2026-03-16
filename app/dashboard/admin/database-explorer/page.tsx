'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ADMIN_EMAIL, adminMenuItems } from '@/lib/adminConfig';
import { Loader2, Database, Table as TableIcon, Search, Eye, ChevronRight, Hash, Info } from 'lucide-react';
import { getAllTablesDataAction, getSingleTableDataAction } from './actions';

export default function DatabaseExplorerPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allData, setAllData] = useState<Record<string, any[]>>({});
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
            loadAllPreviews();
        };
        checkAuth();
    }, [router]);

    const loadAllPreviews = async () => {
        setIsLoading(true);
        const res = await getAllTablesDataAction();
        if (res.success) {
            setAllData(res.allData || {});
        }
        setIsLoading(false);
    };

    const handleSelectTable = async (tableName: string) => {
        setSelectedTable(tableName);
        setIsLoading(true);
        const res = await getSingleTableDataAction(tableName);
        if (res.success) {
            setTableData(res.data || []);
        }
        setIsLoading(false);
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#10b981]" size={40} />
            </div>
        );
    }

    const filteredTableNames = Object.keys(allData).filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Database Explorer" roleLabel="Administrator">
            <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Database Explorer</h1>
                        <p className="text-gray-500 text-sm mt-1">Inspeksi seluruh tabel dan data di Supabase.</p>
                    </div>
                    {selectedTable && (
                        <button 
                            onClick={() => setSelectedTable(null)}
                            className="text-sm font-medium text-[#10b981] hover:underline flex items-center gap-1"
                        >
                            <ChevronRight className="rotate-180" size={16} />
                            Kembali ke Daftar Tabel
                        </button>
                    )}
                </div>

                {!selectedTable ? (
                    <div className="space-y-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Cari nama tabel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {isLoading && Object.keys(allData).length === 0 ? (
                                <div className="col-span-full py-12 flex justify-center">
                                    <Loader2 className="animate-spin text-gray-300" size={40} />
                                </div>
                            ) : filteredTableNames.map((tableName) => {
                                const count = allData[tableName]?.length || 0;
                                const displayName = tableName
                                    .replace('survey_perangkat_daerah', 'Responden: Perangkat Daerah')
                                    .replace('survey_pemerintah_terkait', 'Responden: Instansi Terkait')
                                    .replace('survey_pemda_kabkota', 'Responden: Kab/Kota')
                                    .replace('survey_questions', 'Daftar Pertanyaan')
                                    .replace('survey_answers', 'Jawaban (Text/File)')
                                    .replace('survey_multiple_answers', 'Jawaban (Checkbox/Multiple)')
                                    .replace('institution_names2', 'Institusi Terkait (Master)')
                                    .replace('institution_names', 'Institusi PD (Master)')
                                    .replace('cities_jabar', 'Kota/Kab (Master)')
                                    .replace('seo_settings', 'SEO Config')
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase());

                                return (
                                    <div 
                                        key={tableName}
                                        onClick={() => handleSelectTable(tableName)}
                                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#10b981]/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] transition-colors">
                                                <TableIcon size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full group-hover:bg-[#10b981]/10 group-hover:text-[#10b981]">
                                                {count}{count >= 100 ? '+' : ''} records
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-[#10b981] transition-colors">{displayName}</h3>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{tableName}</p>
                                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye size={12} /> Klik untuk detail isi
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <TableIcon size={18} className="text-[#10b981]" />
                                Data Tabel: <span className="text-[#10b981]">{selectedTable}</span>
                            </h2>
                            <div className="text-xs text-gray-400 font-mono">
                                Showing {tableData.length} records
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center p-12">
                                <Loader2 className="animate-spin text-[#10b981]" size={32} />
                            </div>
                        ) : tableData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50/20">
                                <Search size={48} className="mb-4 opacity-20" />
                                <p className="font-medium">Tabel ini kosong atau tidak memiliki data.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/80 sticky top-0">
                                        <tr>
                                            {Object.keys(tableData[0]).map((key) => (
                                                <th key={key} className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[120px]">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {tableData.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="px-4 py-3 text-xs text-gray-600 border-b border-gray-50">
                                                        {typeof val === 'object' ? (
                                                            <div className="max-h-20 overflow-y-auto max-w-[200px] scrollbar-hide">
                                                                <pre className="text-[10px] text-gray-400 leading-tight">
                                                                    {JSON.stringify(val, null, 2)}
                                                                </pre>
                                                            </div>
                                                        ) : (
                                                            <span className="truncate block max-w-[200px]" title={String(val)}>
                                                                {String(val)}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 flex gap-3 text-amber-800">
                    <Info size={20} className="shrink-0" />
                    <div className="text-xs">
                        <p className="font-bold mb-1">Catatan Penting:</p>
                        <p className="leading-relaxed opacity-80">
                            Halaman ini menampilkan data mentah dari database untuk mempermudah identifikasi anomali data (seperti data dummy atau orphan records). Gunakan fitur ini dengan bijak karena data yang tampil adalah data sensitif.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

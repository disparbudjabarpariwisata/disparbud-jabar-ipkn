'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import { Database, Loader2, Download, FileSpreadsheet, FileCode2 } from 'lucide-react';

export default function AdminBackupPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingSQL, setIsExportingSQL] = useState(false);

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
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

    const handleExport = async (type: 'excel' | 'sql') => {
        try {
            if (type === 'excel') setIsExportingExcel(true);
            else setIsExportingSQL(true);

            const { data: { session } } = await supabase.auth.getSession();

            const urlEndpoint = type === 'excel' ? '/api/admin/export-database' : '/api/admin/export-database-sql';
            const fileExtension = type === 'excel' ? 'xlsx' : 'sql';

            const response = await fetch(urlEndpoint, {
                method: 'GET',
                headers: {
                    ...(session && { 'Authorization': `Bearer ${session.access_token}` })
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to export database as ${type}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `IPKN_Database_Backup_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(`Error exporting database (${type}):`, error);
            alert(`Gagal mengunduh database (${type.toUpperCase()}). Silakan coba lagi.`);
        } finally {
            if (type === 'excel') setIsExportingExcel(false);
            else setIsExportingSQL(false);
        }
    };

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-8 max-w-4xl">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Database size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Database Backup</h2>
                            <p className="text-gray-500">Download a complete snapshot of all survey data and configurations.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {/* Option 1: Excel */}
                        <div className="border border-gray-200 rounded-xl p-6 flex flex-col hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <h3 className="font-semibold text-lg">Excel Format (.xlsx)</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-6 flex-grow">
                                Download all tables as individual sheets in an Excel workbook.
                                Best for reporting, viewing data directly, and sharing with non-technical team members.
                            </p>
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={isExportingExcel || isExportingSQL}
                                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExportingExcel ? (
                                    <><Loader2 size={18} className="animate-spin" /> Preparing Excel...</>
                                ) : (
                                    <><Download size={18} /> Download Excel Backup</>
                                )}
                            </button>
                        </div>

                        {/* Option 2: SQL */}
                        <div className="border border-gray-200 rounded-xl p-6 flex flex-col hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileCode2 size={24} />
                                </div>
                                <h3 className="font-semibold text-lg">SQL Format (.sql)</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-6 flex-grow">
                                Download a complete SQL dump with raw <code>INSERT</code> statements.
                                Best for migrating data to another database or making a full system restore.
                            </p>
                            <button
                                onClick={() => handleExport('sql')}
                                disabled={isExportingExcel || isExportingSQL}
                                className="w-full py-3 px-4 bg-[#F8BC16] hover:bg-[#e5aa0f] text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExportingSQL ? (
                                    <><Loader2 size={18} className="animate-spin" /> Generating SQL...</>
                                ) : (
                                    <><Download size={18} /> Download SQL Dump</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

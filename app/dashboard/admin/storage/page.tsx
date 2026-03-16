'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ADMIN_EMAIL, adminMenuItems } from '@/lib/adminConfig';
import { Loader2, HardDrive, RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { getStorageStatsAction, syncToGDriveAction } from '@/app/survey/start/actions/storage-mgmt';

export default function StorageManagementPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState<{ usageBytes: number; limitBytes: number } | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
            loadStats();
        };
        checkAuth();
    }, [router]);

    const loadStats = async () => {
        setIsLoading(true);
        const res = await getStorageStatsAction();
        if (res.success) {
            setStats({ usageBytes: res.usageBytes!, limitBytes: res.limitBytes! });
        }
        setIsLoading(false);
    };

    const handleSync = async () => {
        if (!confirm('Apakah Anda yakin ingin memindahkan semua file dari Supabase ke Google Drive? Link di database akan otomatis diperbarui.')) return;
        
        setIsSyncing(true);
        setMessage(null);
        
        try {
            const res = await syncToGDriveAction();
            if (res.success) {
                setMessage({ type: 'success', text: res.message! });
                await loadStats();
            } else {
                setMessage({ type: 'error', text: res.error || 'Gagal sinkronisasi.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat sinkronisasi.' });
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#10b981]" size={40} />
            </div>
        );
    }

    const usageMB = stats ? (stats.usageBytes / (1024 * 1024)).toFixed(2) : '0';
    const limitMB = stats ? (stats.limitBytes / (1024 * 1024)).toFixed(0) : '1024';
    const usagePercent = stats ? (stats.usageBytes / stats.limitBytes) * 100 : 0;
    const isCritical = usagePercent > 80;

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Penyimpanan" roleLabel="Administrator">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Penyimpanan</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Pantau penggunaan Supabase Storage (Limit 1GB) dan pindahkan file ke Google Drive secara berkala.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Usage Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${isCritical ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                <HardDrive size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Kapasitas</p>
                                <p className="text-lg font-bold text-gray-900">{usageMB} MB / {limitMB} MB</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-[#10b981]'}`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className={isCritical ? 'text-red-500' : 'text-gray-500'}>{usagePercent.toFixed(1)}% Terpakai</span>
                                <span className="text-gray-400">Sisa {(Number(limitMB) - Number(usageMB)).toFixed(2)} MB</span>
                            </div>
                        </div>

                        {isCritical && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                                <AlertTriangle size={16} className="shrink-0" />
                                <p>Penyimpanan sudah di atas 80%. Segera pindahkan file ke Google Drive untuk menghindari kegagalan upload dari responden baru.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                                Sinkronisasi ke Google Drive
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Memindahkan semua file dari Supabase Storage ke Google Drive (15GB). 
                                Link di tabel jawaban kuesioner akan otomatis diperbarui ke link Google Drive yang baru.
                            </p>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="mt-4 w-full py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            {usagePercent === 0 ? 'Bersihkan Data Dummy / Cek File Baru' : 'Mulai Pindahkan File Sekarang'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                        message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
                        <div className="text-sm">
                            <p className="font-bold">{message.type === 'success' ? 'Berhasil' : 'Gagal'}</p>
                            <p>{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Important Notes */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-3">
                    <h4 className="text-sm font-bold text-blue-900">Informasi Penting:</h4>
                    <ul className="text-xs text-blue-800 space-y-2 list-disc list-inside opacity-80">
                        <li>Gunakan fitur ini hanya saat trafik survei sedang rendah untuk menghindari konflik data.</li>
                        <li>Proses pemindahan mungkin memakan waktu beberapa menit tergantung jumlah dan besar file.</li>
                        <li>Pastikan Google Drive Anda masih memiliki ruang penyimpanan yang cukup (Limit 15GB).</li>
                        <li>Setelah dipindahkan, file di Supabase akan dihapus otomatis untuk mengosongkan ruang.</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}

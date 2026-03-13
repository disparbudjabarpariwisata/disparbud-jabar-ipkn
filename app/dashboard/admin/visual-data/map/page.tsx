'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ADMIN_EMAIL, adminMenuItems } from '@/lib/adminConfig';
import { westJavaLocations } from '@/lib/westJavaLocations';
import { Loader2, Plus, Pencil, Trash2, Save, X, MapPinned } from 'lucide-react';

type DataMapRow = {
    id: string;
    city_name: string;
    city_type: string;
    description: string;
    tourism_highlights: string;
    tourist_attractions: string;
    culinary: string;
    accommodation: string;
    transportation: string;
    image_url: string;
    website_url: string;
    active: boolean;
    medical_data?: Record<string, any>;
    desa_wisata_data?: any[];
    content?: any;
};

const emptyForm: Omit<DataMapRow, 'id'> & { id?: string } = {
    city_name: '',
    city_type: 'Kabupaten',
    description: '',
    tourism_highlights: '',
    tourist_attractions: '',
    culinary: '',
    accommodation: '',
    transportation: '',
    image_url: '',
    website_url: '',
    active: true,
};

export default function AdminDataMapPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [rows, setRows] = useState<DataMapRow[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'Kesehatan' | 'Pariwisata' | 'Desa Wisata'>('Kesehatan');

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) { router.replace('/login'); return; }
            setIsAuthorized(true);
        };
        checkAuth();
    }, [router]);

    const fetchData = useCallback(async () => {
        if (!isAuthorized) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/data-map');
            const json = await res.json();
            if (json.success) setRows(json.data || []);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, [isAuthorized]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleEdit = (row: DataMapRow) => {
        setForm({ ...row });
        setShowForm(true);
        setMessage('');
    };

    const handleAdd = () => {
        setForm({ ...emptyForm });
        setShowForm(true);
        setMessage('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        try {
            const res = await fetch(`/api/admin/data-map?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) { setMessage('Data berhasil dihapus.'); fetchData(); }
            else setMessage(json.error || 'Gagal menghapus.');
        } catch (err) { setMessage('Terjadi kesalahan.'); }
    };

    const handleSave = async () => {
        if (!form.city_name.trim()) { setMessage('Nama kota wajib diisi.'); return; }
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/data-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (json.success) {
                setMessage(json.message);
                setShowForm(false);
                fetchData();
            } else { setMessage(json.error || 'Gagal menyimpan.'); }
        } catch (err) { setMessage('Terjadi kesalahan.'); }
        finally { setIsSaving(false); }
    };

    // Get city names from westJavaLocations that don't have data yet
    const existingCities = new Set(rows.map(r => r.city_name));
    const availableCities = westJavaLocations.filter(loc => !existingCities.has(loc.name) || form.city_name === loc.name);

    if (!isAuthorized) {
        return (<div className="flex min-h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-[#10b981]" size={40} /></div>);
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MapPinned size={24} className="text-emerald-600" />
                            Data Map Jawa Barat
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola data kepariwisataan untuk peta interaktif di halaman utama.</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] transition-all shadow-md"
                    >
                        <Plus size={18} /> Tambah Data
                    </button>
                </div>

                {message && (
                    <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium border border-blue-200">
                        {message}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">{form.id ? 'Edit Data' : 'Tambah Data Baru'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Kota/Kabupaten *</label>
                                <select
                                    value={form.city_name}
                                    onChange={(e) => {
                                        const loc = westJavaLocations.find(l => l.name === e.target.value);
                                        setForm(prev => ({
                                            ...prev,
                                            city_name: e.target.value,
                                            city_type: loc?.type || prev.city_type,
                                        }));
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none"
                                >
                                    <option value="">Pilih Kota/Kabupaten</option>
                                    {availableCities.map(loc => (
                                        <option key={loc.id} value={loc.name}>{loc.name} ({loc.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe</label>
                                <input value={form.city_type} readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Deskripsi Umum</label>
                            <textarea rows={2} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="Deskripsi umum kota/kabupaten..." />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Highlight Pariwisata</label>
                            <textarea rows={2} value={form.tourism_highlights} onChange={e => setForm(prev => ({ ...prev, tourism_highlights: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="Potensi wisata utama..." />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Destinasi Wisata</label>
                            <textarea rows={2} value={form.tourist_attractions} onChange={e => setForm(prev => ({ ...prev, tourist_attractions: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="Daftar destinasi wisata terkenal..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Kuliner</label>
                                <textarea rows={2} value={form.culinary} onChange={e => setForm(prev => ({ ...prev, culinary: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="Kuliner khas daerah..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Akomodasi</label>
                                <textarea rows={2} value={form.accommodation} onChange={e => setForm(prev => ({ ...prev, accommodation: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="Informasi akomodasi..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Transportasi</label>
                                <textarea rows={2} value={form.transportation} onChange={e => setForm(prev => ({ ...prev, transportation: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="Akses transportasi..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">URL Gambar</label>
                                <input type="url" value={form.image_url} onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Website Resmi</label>
                                <input type="url" value={form.website_url} onChange={e => setForm(prev => ({ ...prev, website_url: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none" placeholder="https://..." />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.active} onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700">Aktif (tampil di peta)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] transition-all disabled:opacity-50">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {form.id ? 'Simpan Perubahan' : 'Tambah Data'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-700 text-sm">Data Wilayah</h3>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as 'Kesehatan' | 'Pariwisata' | 'Desa Wisata')}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-700 font-medium focus:outline-none focus:border-[#10b981] cursor-pointer"
                    >
                        <option value="Kesehatan">Kategori: Kesehatan</option>
                        <option value="Pariwisata">Kategori: Pariwisata Umum</option>
                        <option value="Desa Wisata">Kategori: Desa Wisata</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 w-12">No.</th>
                                    <th className="px-4 py-4">Nama Kota/Kab</th>
                                    <th className="px-4 py-4">Tipe</th>
                                    {selectedCategory === 'Pariwisata' ? (
                                        <th className="px-4 py-4">Deskripsi</th>
                                    ) : selectedCategory === 'Desa Wisata' ? (
                                        <>
                                            <th className="px-4 py-4">Total Desa</th>
                                            <th className="px-4 py-4">Status & Potensi</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-4">Cakupan JKN</th>
                                            <th className="px-4 py-4">Penyakit Menular (DBD)</th>
                                            <th className="px-4 py-4">Rasio Tempat Tidur RS</th>
                                            <th className="px-4 py-4">Rasio Dokter Umum</th>
                                        </>
                                    )}
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                                        <Loader2 className="animate-spin text-[#10b981] mx-auto mb-2" size={24} /> Memuat data...
                                    </td></tr>
                                ) : rows.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Belum ada data. Klik &quot;Tambah Data&quot; untuk memulai.</td></tr>
                                ) : rows.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{row.city_name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${row.city_type === 'Kota' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {row.city_type}
                                            </span>
                                        </td>
                                        {selectedCategory === 'Pariwisata' ? (
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{row.description || '-'}</td>
                                        ) : selectedCategory === 'Desa Wisata' ? (
                                            <>
                                                <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                                    {(row.desa_wisata_data?.length || row.content?.desa_wisata?.length || 0)} Desa
                                                </td>
                                                <td className="px-4 py-3 text-[10px] text-gray-500">
                                                    {(() => {
                                                        const villages = row.desa_wisata_data || row.content?.desa_wisata;
                                                        if (!villages || villages.length === 0) return '-';
                                                        const statusCounts = villages.reduce((acc: any, d: any) => {
                                                            acc[d.status] = (acc[d.status] || 0) + 1;
                                                            return acc;
                                                        }, {});
                                                        return Object.entries(statusCounts).map(([s, c]) => `${s}: ${c}`).join(', ');
                                                    })()}
                                                </td>
                                            </>
                                        ) : (
                                            (() => {
                                                let md = null;
                                                if (row.medical_data) {
                                                    const years = Object.keys(row.medical_data).sort((a, b) => Number(b) - Number(a));
                                                    if (years.length > 0) md = row.medical_data[years[0]]?.datasets;
                                                }
                                                return (
                                                    <>
                                                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                                            {md?.['JKN'] ? `${(md['JKN'].jkn_coverage_ratio * 100).toFixed(1)}%` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                                            {md?.['Penyakit Menular'] ? `${md['Penyakit Menular'].dengue_cases?.toLocaleString('id-ID')} Kasus` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                                            {md?.['Rasio Tempat Tidur'] ? `${md['Rasio Tempat Tidur'].hospital_bed_ratio_per_1000_population.toFixed(2)} / 1000 Penduduk` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                                            {md?.['Rasio Dokter'] ? `${md['Rasio Dokter'].doctor_ratio_per_1000_population.toFixed(2)} / 1000 Penduduk` : '-'}
                                                        </td>
                                                    </>
                                                );
                                            })()
                                        )}
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-semibold ${row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                                {row.active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(row.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Hapus">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!isLoading && rows.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                            Total: <b>{rows.length}</b> / 27 kota dan kabupaten.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

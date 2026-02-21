'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Loader2,
    Building2,
    Plus,
    Pencil,
    Trash2,
    X,
    Eye,
    EyeOff,
    Save,
    AlertCircle,
    CheckCircle2,
    Search,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
    'Unsur Pengawasan & Kesekretariatan',
    'Badan Daerah',
    'Dinas Daerah',
    'Biro Sekretariat Daerah',
    'Satuan Polisi Pamong Praja',
];

interface Institution {
    id: string;
    category: string;
    name: string;
    sort_order: number;
    active: boolean;
    created_at: string;
}

interface FormData {
    category: string;
    name: string;
    sort_order: number;
    active: boolean;
}

const defaultForm: FormData = {
    category: 'Dinas Daerah',
    name: '',
    sort_order: 0,
    active: true,
};

export default function InstitutionsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(defaultForm);

    // Feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const fetchInstitutions = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('institution_names')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            setError('Failed to load: ' + error.message);
        } else {
            setInstitutions(data || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthorized) fetchInstitutions();
    }, [isAuthorized, fetchInstitutions]);

    const filtered = institutions.filter((i) => {
        const matchSearch = !searchQuery ||
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = !filterCategory || i.category === filterCategory;
        return matchSearch && matchCategory;
    });

    // Group by category
    const grouped = filtered.reduce<Record<string, Institution[]>>((acc, inst) => {
        if (!acc[inst.category]) acc[inst.category] = [];
        acc[inst.category].push(inst);
        return acc;
    }, {});

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ ...defaultForm, sort_order: institutions.length });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (inst: Institution) => {
        setEditingId(inst.id);
        setForm({ category: inst.category, name: inst.name, sort_order: inst.sort_order, active: inst.active });
        setIsModalOpen(true);
        setError(null);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Name is required.'); return; }
        setIsSaving(true);
        setError(null);

        const payload = {
            category: form.category,
            name: form.name.trim(),
            sort_order: form.sort_order,
            active: form.active,
        };

        const { error } = editingId
            ? await supabase.from('institution_names').update(payload).eq('id', editingId)
            : await supabase.from('institution_names').insert(payload);

        if (error) {
            setError('Failed: ' + error.message);
        } else {
            setSuccess(editingId ? 'Updated!' : 'Created!');
            setIsModalOpen(false);
            fetchInstitutions();
        }
        setIsSaving(false);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('institution_names').delete().eq('id', id);
        if (error) {
            setError('Failed: ' + error.message);
        } else {
            setSuccess('Deleted!');
            setDeletingId(null);
            fetchInstitutions();
        }
        setTimeout(() => setSuccess(null), 3000);
    };

    const toggleActive = async (inst: Institution) => {
        await supabase.from('institution_names').update({ active: !inst.active }).eq('id', inst.id);
        fetchInstitutions();
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage institution names for Perangkat Daerah role</p>
                    </div>
                    <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold text-sm hover:bg-[#F2B10C] transition-all shadow-md">
                        <Plus size={18} /> Add Institution
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all text-sm"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:border-[#F8BC16] outline-none"
                    >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Feedback */}
                {success && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm border border-green-200">
                        <CheckCircle2 size={18} /><span>{success}</span>
                    </div>
                )}
                {error && !isModalOpen && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-200">
                        <AlertCircle size={18} /><span>{error}</span>
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#F8BC16]" size={32} /></div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No institutions found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{category}</h3>
                                    <p className="text-xs text-gray-400">{items.length} institution{items.length > 1 ? 's' : ''}</p>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {items.map((inst) => (
                                        <div key={inst.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{inst.name}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleActive(inst)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${inst.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                {inst.active ? <Eye size={12} /> : <EyeOff size={12} />}
                                                {inst.active ? 'Active' : 'Hidden'}
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEditModal(inst)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => setDeletingId(inst.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Institution?</h3>
                        <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(deletingId)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit' : 'Add'} Institution</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {error && isModalOpen && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} /><span>{error}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category *</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                                >
                                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Institution Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Dinas Pariwisata dan Kebudayaan"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Sort Order</label>
                                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} min={0}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-700 text-sm">Active</p>
                                    <p className="text-xs text-gray-400">Show in institution selection</p>
                                </div>
                                <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex-1 py-3 rounded-xl bg-[#F8BC16] text-white font-semibold text-sm hover:bg-[#F2B10C] flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

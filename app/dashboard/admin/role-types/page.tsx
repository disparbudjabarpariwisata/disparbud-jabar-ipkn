'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    Image,
    Search,
    Settings,
    Loader2,
    BarChart3,
    Shield,
    Plus,
    Pencil,
    Trash2,
    X,
    GripVertical,
    Eye,
    EyeOff,
    Save,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

const ADMIN_EMAIL = 'disparbudjabarpariwisata2026@gmail.com';

const adminMenuItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Role Types', href: '/dashboard/admin/role-types', icon: <Shield size={18} /> },
    { label: 'Hero Slider', href: '/dashboard/admin/hero-slider', icon: <Image size={18} /> },
    { label: 'SEO General', href: '/dashboard/admin/seo', icon: <Search size={18} /> },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={18} /> },
];

const ICON_OPTIONS = [
    'Building2', 'Landmark', 'Briefcase', 'Users', 'Store',
    'MapPin', 'Crown', 'Globe', 'Shield', 'GraduationCap',
    'Heart', 'Star', 'Zap', 'Award', 'Target',
    'BookOpen', 'Camera', 'Coffee', 'Compass', 'Flag',
];

const COLOR_OPTIONS = [
    'blue', 'purple', 'emerald', 'amber', 'rose',
    'teal', 'indigo', 'cyan', 'red', 'orange',
    'green', 'pink', 'violet', 'sky', 'lime',
];

interface RoleType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    sort_order: number;
    active: boolean;
    created_at: string;
}

interface FormData {
    name: string;
    description: string;
    icon: string;
    color: string;
    sort_order: number;
    active: boolean;
}

const defaultForm: FormData = {
    name: '',
    description: '',
    icon: 'Users',
    color: 'blue',
    sort_order: 0,
    active: true,
};

export default function RoleTypesPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(defaultForm);

    // Feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Delete confirmation
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

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('role_types')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            setError('Failed to load roles: ' + error.message);
        } else {
            setRoles(data || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthorized) fetchRoles();
    }, [isAuthorized, fetchRoles]);

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ ...defaultForm, sort_order: roles.length });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (role: RoleType) => {
        setEditingId(role.id);
        setForm({
            name: role.name,
            description: role.description,
            icon: role.icon,
            color: role.color,
            sort_order: role.sort_order,
            active: role.active,
        });
        setIsModalOpen(true);
        setError(null);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            setError('Role name is required.');
            return;
        }

        setIsSaving(true);
        setError(null);

        if (editingId) {
            // Update
            const { error } = await supabase
                .from('role_types')
                .update({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    icon: form.icon,
                    color: form.color,
                    sort_order: form.sort_order,
                    active: form.active,
                })
                .eq('id', editingId);

            if (error) {
                setError('Failed to update: ' + error.message);
            } else {
                setSuccess('Role updated successfully!');
                setIsModalOpen(false);
                fetchRoles();
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('role_types')
                .insert({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    icon: form.icon,
                    color: form.color,
                    sort_order: form.sort_order,
                    active: form.active,
                });

            if (error) {
                setError('Failed to create: ' + error.message);
            } else {
                setSuccess('Role created successfully!');
                setIsModalOpen(false);
                fetchRoles();
            }
        }

        setIsSaving(false);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('role_types')
            .delete()
            .eq('id', id);

        if (error) {
            setError('Failed to delete: ' + error.message);
        } else {
            setSuccess('Role deleted successfully!');
            setDeletingId(null);
            fetchRoles();
        }
        setTimeout(() => setSuccess(null), 3000);
    };

    const toggleActive = async (role: RoleType) => {
        const { error } = await supabase
            .from('role_types')
            .update({ active: !role.active })
            .eq('id', role.id);

        if (error) {
            setError('Failed to update status: ' + error.message);
        } else {
            fetchRoles();
        }
    };

    const getColorClasses = (color: string) => {
        const map: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            amber: 'bg-amber-50 text-amber-600 border-amber-200',
            rose: 'bg-rose-50 text-rose-600 border-rose-200',
            teal: 'bg-teal-50 text-teal-600 border-teal-200',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
            red: 'bg-red-50 text-red-600 border-red-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            pink: 'bg-pink-50 text-pink-600 border-pink-200',
            violet: 'bg-violet-50 text-violet-600 border-violet-200',
            sky: 'bg-sky-50 text-sky-600 border-sky-200',
            lime: 'bg-lime-50 text-lime-600 border-lime-200',
        };
        return map[color] || map.blue;
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
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Role Types</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage user role types for registration</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold text-sm hover:bg-[#F2B10C] transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} />
                        Add New Role
                    </button>
                </div>

                {/* Feedback */}
                {success && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm border border-green-200">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}
                {error && !isModalOpen && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-200">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Table */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#F8BC16]" size={32} />
                    </div>
                ) : roles.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Shield size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No roles found. Add your first role.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-500 w-12">#</th>
                                        <th className="text-left p-4 font-semibold text-gray-500">Role</th>
                                        <th className="text-left p-4 font-semibold text-gray-500 hidden md:table-cell">Description</th>
                                        <th className="text-center p-4 font-semibold text-gray-500 w-24">Status</th>
                                        <th className="text-center p-4 font-semibold text-gray-500 w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {roles.map((role, idx) => (
                                        <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <GripVertical size={14} className="text-gray-300" />
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border ${getColorClasses(role.color)}`}>
                                                        {role.icon.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{role.name}</p>
                                                        <p className="text-xs text-gray-400 md:hidden">{role.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 hidden md:table-cell max-w-xs truncate">
                                                {role.description}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => toggleActive(role)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${role.active
                                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {role.active ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    {role.active ? 'Active' : 'Hidden'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(role)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(role.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Role?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            This action cannot be undone. Users who already have this role will not be affected.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? 'Edit Role' : 'Add New Role'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {error && isModalOpen && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Role Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Pelaku Usaha Pariwisata"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description of this role..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all placeholder:text-gray-400 resize-none"
                                />
                            </div>

                            {/* Icon Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {ICON_OPTIONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setForm({ ...form, icon })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.icon === icon
                                                ? 'bg-[#F8BC16] text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setForm({ ...form, color })}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === color
                                                ? 'border-[#F8BC16] ring-2 ring-[#F8BC16]/30 scale-110'
                                                : 'border-transparent hover:scale-105'
                                                } ${getColorClasses(color)}`}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Sort Order</label>
                                <input
                                    type="number"
                                    value={form.sort_order}
                                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                    min={0}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-700 text-sm">Active</p>
                                    <p className="text-xs text-gray-400">Show on registration page</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, active: !form.active })}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl bg-[#F8BC16] text-white font-semibold text-sm hover:bg-[#F2B10C] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

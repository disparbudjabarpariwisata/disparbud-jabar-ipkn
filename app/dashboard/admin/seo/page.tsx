'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import { adminMenuItems, ADMIN_EMAIL } from '@/lib/adminConfig';
import {
    Image as ImageIcon,
    Loader2,
    Save,
    AlertCircle,
    CheckCircle2,
    Globe,
    FileText,
    Tag,
} from 'lucide-react';

interface SeoSettings {
    id: string;
    app_name: string;
    meta_description: string;
    keywords: string;
    og_name: string;
    og_image: string;
    logo_url: string;
}

export default function AdminSeoPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [seo, setSeo] = useState<SeoSettings>({
        id: '',
        app_name: '',
        meta_description: '',
        keywords: '',
        og_name: '',
        og_image: '',
        logo_url: '',
    });

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
            fetchSeo();
        };
        check();
    }, [router]);

    const fetchSeo = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('seo_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else if (data) {
            setSeo(data);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMsg(null);

        const { error } = await supabase
            .from('seo_settings')
            .update({
                app_name: seo.app_name,
                meta_description: seo.meta_description,
                keywords: seo.keywords,
                og_name: seo.og_name,
                og_image: seo.og_image,
                logo_url: seo.logo_url,
                updated_at: new Date().toISOString(),
            })
            .eq('id', seo.id);

        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: 'SEO settings saved successfully.' });
        }
        setIsSaving(false);
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
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">SEO General Settings</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-6 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold text-sm hover:bg-[#F2B10C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                {msg && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                        {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{msg.text}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-[#F8BC16]" size={32} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* App Name */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-[#F8BC16]" />
                                Application Name
                            </h3>
                            <input
                                type="text"
                                value={seo.app_name}
                                onChange={(e) => setSeo({ ...seo, app_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                            />
                        </div>

                        {/* Logo URL */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ImageIcon size={18} className="text-[#F8BC16]" />
                                Logo URL
                            </h3>
                            <input
                                type="url"
                                value={seo.logo_url}
                                onChange={(e) => setSeo({ ...seo, logo_url: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                            />
                            {seo.logo_url && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl inline-block">
                                    <img src={seo.logo_url} alt="Logo preview" className="h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>

                        {/* Meta Description */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-[#F8BC16]" />
                                Meta Description
                            </h3>
                            <textarea
                                value={seo.meta_description}
                                onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                                rows={3}
                                placeholder="Brief description of your website..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{seo.meta_description.length}/160 characters</p>
                        </div>

                        {/* Keywords */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Tag size={18} className="text-[#F8BC16]" />
                                Keywords
                            </h3>
                            <input
                                type="text"
                                value={seo.keywords}
                                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                                placeholder="keyword1, keyword2, keyword3"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-1">Separate keywords with commas</p>
                        </div>

                        {/* OG Settings */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-[#F8BC16]" />
                                Open Graph (OG) Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-1 block">OG Name</label>
                                    <input
                                        type="text"
                                        value={seo.og_name}
                                        onChange={(e) => setSeo({ ...seo, og_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 mb-1 block">OG Image URL</label>
                                    <input
                                        type="url"
                                        value={seo.og_image}
                                        onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                                        placeholder="https://example.com/og-image.jpg"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all"
                                    />
                                    {seo.og_image && (
                                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 max-w-md">
                                            <img src={seo.og_image} alt="OG preview" className="w-full h-40 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

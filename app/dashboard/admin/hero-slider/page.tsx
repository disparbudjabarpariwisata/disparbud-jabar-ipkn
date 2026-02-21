'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    Image as ImageIcon,
    Search,
    Settings,
    Loader2,
    BarChart3,
    Plus,
    Trash2,
    GripVertical,
    Film,
    AlertCircle,
    CheckCircle2,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

const ADMIN_EMAIL = 'disparbudjabarpariwisata2026@gmail.com';

const adminMenuItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Hero Slider', href: '/dashboard/admin/hero-slider', icon: <ImageIcon size={18} /> },
    { label: 'SEO General', href: '/dashboard/admin/seo', icon: <Search size={18} /> },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={18} /> },
];

interface HeroSlide {
    id: string;
    type: 'image' | 'video';
    url: string;
    title: string;
    sort_order: number;
    active: boolean;
}

export default function AdminHeroSliderPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Hero mode toggle
    const [heroMode, setHeroMode] = useState<'slider' | 'video'>('slider');
    const [heroVideoUrl, setHeroVideoUrl] = useState('');
    const [isSavingMode, setIsSavingMode] = useState(false);

    // New slide form
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
            fetchSlides();
            fetchHeroMode();
        };
        check();
    }, [router]);

    const fetchHeroMode = async () => {
        const { data } = await supabase
            .from('seo_settings')
            .select('hero_mode, hero_video_url')
            .limit(1)
            .single();
        if (data) {
            setHeroMode((data.hero_mode as 'slider' | 'video') || 'slider');
            setHeroVideoUrl(data.hero_video_url || '');
        }
    };

    const fetchSlides = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setSlides(data || []);
        }
        setIsLoading(false);
    };

    const handleToggleMode = async (mode: 'slider' | 'video') => {
        setIsSavingMode(true);
        setMsg(null);
        const { error } = await supabase
            .from('seo_settings')
            .update({ hero_mode: mode, updated_at: new Date().toISOString() })
            .not('id', 'is', null); // update all rows (single row table)
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setHeroMode(mode);
            setMsg({ type: 'success', text: `Hero mode switched to ${mode === 'slider' ? 'Photo Slider' : 'Video'}.` });
        }
        setIsSavingMode(false);
    };

    const handleSaveVideoUrl = async () => {
        setIsSavingMode(true);
        setMsg(null);
        const { error } = await supabase
            .from('seo_settings')
            .update({ hero_video_url: heroVideoUrl, updated_at: new Date().toISOString() })
            .not('id', 'is', null);
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: 'Video URL saved.' });
        }
        setIsSavingMode(false);
    };

    const handleAddSlide = async () => {
        if (!newUrl) return;
        setIsAdding(true);
        setMsg(null);

        const { error } = await supabase.from('hero_slides').insert({
            type: 'image',
            url: newUrl,
            title: newTitle,
            sort_order: slides.length,
            active: true,
        });

        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: 'Slide added successfully.' });
            setNewUrl('');
            setNewTitle('');
            fetchSlides();
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this slide?')) return;
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setSlides(slides.filter((s) => s.id !== id));
            setMsg({ type: 'success', text: 'Slide deleted.' });
        }
    };

    const toggleActive = async (id: string, active: boolean) => {
        const { error } = await supabase.from('hero_slides').update({ active: !active }).eq('id', id);
        if (!error) fetchSlides();
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
                <h1 className="text-2xl font-bold text-gray-900">Hero Slider Management</h1>

                {msg && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                        {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{msg.text}</span>
                    </div>
                )}

                {/* Hero Mode Toggle */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Active Hero Mode</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleToggleMode('slider')}
                            disabled={isSavingMode}
                            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-semibold transition-all ${heroMode === 'slider'
                                    ? 'border-[#F8BC16] bg-[#F8BC16]/10 text-[#F8BC16]'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {heroMode === 'slider' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            <ImageIcon size={20} />
                            Photo Slider
                            {heroMode === 'slider' && (
                                <span className="ml-auto text-xs bg-[#F8BC16] text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                            )}
                        </button>
                        <button
                            onClick={() => handleToggleMode('video')}
                            disabled={isSavingMode}
                            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-semibold transition-all ${heroMode === 'video'
                                    ? 'border-purple-500 bg-purple-50 text-purple-600'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {heroMode === 'video' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            <Film size={20} />
                            Hero Video
                            {heroMode === 'video' && (
                                <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                            )}
                        </button>
                    </div>

                    {/* Video URL Input (shown when video mode) */}
                    {heroMode === 'video' && (
                        <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Hero Video URL</label>
                            <div className="flex gap-3">
                                <input
                                    type="url"
                                    value={heroVideoUrl}
                                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                                />
                                <button
                                    onClick={handleSaveVideoUrl}
                                    disabled={isSavingMode}
                                    className="px-5 py-2.5 bg-purple-500 text-white rounded-xl font-semibold text-sm hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSavingMode ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add New Image Slide */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-[#F8BC16]" />
                        Add New Image Slide
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Image URL</label>
                            <input
                                type="url"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Title (optional)</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Slide title"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#F8BC16] focus:ring-4 focus:ring-[#F8BC16]/10 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddSlide}
                        disabled={isAdding || !newUrl}
                        className="px-6 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold text-sm hover:bg-[#F2B10C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Add Slide
                    </button>

                    {newUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 max-w-md">
                            <img src={newUrl} alt="Preview" className="w-full h-40 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                    )}
                </div>

                {/* Current Slides */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Current Slides ({slides.length})</h3>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#F8BC16]" size={32} />
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No slides yet. Add your first slide above.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {slides.map((slide, idx) => (
                                <div key={slide.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                                    <GripVertical size={18} className="text-gray-300 flex-shrink-0 hidden md:block" />
                                    <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}</span>

                                    <div className="w-20 h-12 md:w-24 md:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={slide.url} alt={slide.title || ''} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate text-sm">{slide.title || 'Untitled'}</p>
                                        <p className="text-xs text-gray-400 truncate hidden md:block">{slide.url}</p>
                                    </div>

                                    <button
                                        onClick={() => toggleActive(slide.id, slide.active)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${slide.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {slide.active ? 'Active' : 'Inactive'}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

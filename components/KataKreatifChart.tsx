'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { Loader2, Sparkles, Star, TrendingUp, TrendingDown } from 'lucide-react';

type KataKreatifRow = {
    id: number;
    kota_kabupaten: string;
    skor_2022: number;
    skor_2023: number;
    orde: string;
    kategori: string;
};

// Urutan orde resmi
const ORDE_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const ORDE_CONFIG: Record<string, {
    label: string;
    kategori: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
}> = {
    'I': {
        label: 'Orde I',
        kategori: 'Exceptional Creative',
        color: '#10b981',
        gradientFrom: '#10b981',
        gradientTo: '#059669',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
    },
    'II': {
        label: 'Orde II',
        kategori: 'Predominantly Creative',
        color: '#3b82f6',
        gradientFrom: '#3b82f6',
        gradientTo: '#2563eb',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    'III': {
        label: 'Orde III',
        kategori: 'Progressively Creative',
        color: '#f59e0b',
        gradientFrom: '#f59e0b',
        gradientTo: '#d97706',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
    },
    'IV': {
        label: 'Orde IV',
        kategori: 'Constantly Creative',
        color: '#8b5cf6',
        gradientFrom: '#8b5cf6',
        gradientTo: '#7c3aed',
        textColor: 'text-violet-700',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
    },
    'V': {
        label: 'Orde V',
        kategori: 'Potentially Creative',
        color: '#ec4899',
        gradientFrom: '#ec4899',
        gradientTo: '#db2777',
        textColor: 'text-pink-700',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
    },
    'VI': {
        label: 'Orde VI',
        kategori: 'Initially Creative',
        color: '#6b7280',
        gradientFrom: '#9ca3af',
        gradientTo: '#6b7280',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
    },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0]?.payload as KataKreatifRow;
    const cfg = ORDE_CONFIG[row.orde] || ORDE_CONFIG['VI'];
    const delta = (row.skor_2023 - row.skor_2022).toFixed(2);
    const naik = row.skor_2023 >= row.skor_2022;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[220px] z-50"
        >
            <p className="font-bold text-gray-900 text-sm mb-1 leading-tight">{row.kota_kabupaten}</p>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${cfg.bgColor} ${cfg.textColor} border ${cfg.borderColor}`}>
                {cfg.label} — {cfg.kategori}
            </span>
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Skor 2023</span>
                    <span className="font-black text-gray-900">{row.skor_2023.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Skor 2022</span>
                    <span className="font-semibold text-gray-600">{row.skor_2022.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between items-center text-xs font-bold pt-1 border-t border-gray-100 ${naik ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span>Perubahan</span>
                    <span className="flex items-center gap-1">
                        {naik ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {naik ? '+' : ''}{delta}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const CustomBar = (props: any) => {
    const { x, y, width, height, orde } = props;
    const cfg = ORDE_CONFIG[orde] || ORDE_CONFIG['VI'];
    const gradId = `grad-${orde}`;
    if (!height || height < 0) return null;
    return (
        <g>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.gradientFrom} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={cfg.gradientTo} stopOpacity={0.7} />
                </linearGradient>
            </defs>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={`url(#${gradId})`}
                rx={4}
                ry={4}
            />
        </g>
    );
};

export default function KataKreatifChart() {
    const [data, setData] = useState<KataKreatifRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeOrde, setActiveOrde] = useState<string>('semua');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/kata-kreatif');
                const json = await res.json();
                if (json.success) setData(json.data || []);
            } catch (err) {
                console.error('Gagal mengambil data Kata Kreatif:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Daftar orde yang tersedia
    const availableOrdes = useMemo(() =>
        ORDE_ORDER.filter(o => data.some(d => d.orde === o)),
        [data]
    );

    // Data yang difilter & diurutkan
    const chartData = useMemo(() => {
        const filtered = activeOrde === 'semua'
            ? [...data]
            : data.filter(d => d.orde === activeOrde);
        return filtered.sort((a, b) => {
            const ordeDiff = ORDE_ORDER.indexOf(a.orde) - ORDE_ORDER.indexOf(b.orde);
            if (ordeDiff !== 0) return ordeDiff;
            return b.skor_2023 - a.skor_2023;
        });
    }, [data, activeOrde]);

    // Stats per orde yang aktif
    const stats = useMemo(() => {
        const src = activeOrde === 'semua' ? data : data.filter(d => d.orde === activeOrde);
        if (!src.length) return null;
        const avg2023 = src.reduce((s, d) => s + d.skor_2023, 0) / src.length;
        const max2023 = src.reduce((best, d) => d.skor_2023 > best.skor_2023 ? d : best, src[0]);
        const min2023 = src.reduce((worst, d) => d.skor_2023 < worst.skor_2023 ? d : worst, src[0]);
        return { avg2023, max2023, min2023, total: src.length };
    }, [data, activeOrde]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-500 mb-3" size={36} />
                <p className="text-gray-400 text-sm animate-pulse">Memuat data Kata Kreatif Jabar…</p>
            </div>
        );
    }

    const activeOrdeConfig = activeOrde !== 'semua' ? ORDE_CONFIG[activeOrde] : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                        Pemeringkatan <span className="text-emerald-600">Kata Kreatif</span> Jawa Barat
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-xl">
                        Indeks kinerja ekonomi kreatif 27 Kota/Kabupaten se-Jawa Barat berdasarkan skor 2022–2023, diklasifikasikan dalam 6 tingkatan orde kreativitas.
                    </p>
                </div>
                {stats && (
                    <div className="flex gap-3 flex-wrap">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center min-w-[90px]">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Rata-rata</p>
                            <p className="text-lg font-black text-emerald-700">{stats.avg2023.toFixed(1)}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center min-w-[90px]">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Tertinggi</p>
                            <p className="text-xs font-black text-blue-700 leading-tight">{stats.max2023.kota_kabupaten.replace(/(Kab\.|Kota )/g, '')}</p>
                            <p className="text-sm font-black text-blue-800">{stats.max2023.skor_2023.toFixed(1)}</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center min-w-[90px]">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Terendah</p>
                            <p className="text-xs font-black text-red-600 leading-tight">{stats.min2023.kota_kabupaten.replace(/(Kab\.|Kota )/g, '')}</p>
                            <p className="text-sm font-black text-red-700">{stats.min2023.skor_2023.toFixed(1)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Tabs per Orde */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveOrde('semua')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${activeOrde === 'semua'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <Sparkles size={12} />
                    Semua ({data.length})
                </button>
                {availableOrdes.map(orde => {
                    const cfg = ORDE_CONFIG[orde];
                    const count = data.filter(d => d.orde === orde).length;
                    const isActive = activeOrde === orde;
                    return (
                        <button
                            key={orde}
                            onClick={() => setActiveOrde(orde)}
                            style={isActive ? { backgroundColor: cfg.color, borderColor: cfg.color } : undefined}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${isActive
                                ? 'text-white shadow-md scale-105'
                                : `bg-white text-gray-600 border-gray-200 hover:${cfg.bgColor}`
                                }`}
                        >
                            <Star size={11} />
                            {cfg.label} <span className="opacity-70">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* Badge kategori aktif */}
            <AnimatePresence mode="wait">
                {activeOrdeConfig && (
                    <motion.div
                        key={activeOrde}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${activeOrdeConfig.bgColor} ${activeOrdeConfig.textColor} border ${activeOrdeConfig.borderColor}`}
                    >
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: activeOrdeConfig.color }}
                        />
                        {activeOrdeConfig.label} — {activeOrdeConfig.kategori}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bar Chart */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeOrde}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                    style={{ height: chartData.length <= 6 ? 320 : Math.max(380, chartData.length * 40) }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
                            barCategoryGap="22%"
                        >
                            <defs>
                                {ORDE_ORDER.map(o => {
                                    const cfg = ORDE_CONFIG[o];
                                    return (
                                        <linearGradient key={o} id={`grad-${o}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={cfg.gradientFrom} stopOpacity={0.9} />
                                            <stop offset="100%" stopColor={cfg.gradientTo} stopOpacity={0.95} />
                                        </linearGradient>
                                    );
                                })}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                tickFormatter={(v) => `${v}`}
                            />
                            <YAxis
                                type="category"
                                dataKey="kota_kabupaten"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10.5, fill: '#374151', fontWeight: 500 }}
                                width={130}
                                tickFormatter={(v: string) => v.replace(/^(Kab\.\s|Kota\s)/, '')}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                            />
                            <Bar
                                dataKey="skor_2023"
                                name="Skor 2023"
                                radius={[0, 4, 4, 0]}
                                isAnimationActive={true}
                                animationBegin={0}
                                animationDuration={900}
                                animationEasing="ease-out"
                            >
                                <LabelList
                                    dataKey="skor_2023"
                                    position="right"
                                    formatter={(v: any) => (typeof v === 'number' ? v.toFixed(1) : v)}
                                    style={{ fontSize: 10, fontWeight: 700, fill: '#374151' }}
                                />
                                {chartData.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.id}`}
                                        fill={`url(#grad-${entry.orde})`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>

            {/* Legend Orde */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {availableOrdes.map(orde => {
                    const cfg = ORDE_CONFIG[orde];
                    const count = data.filter(d => d.orde === orde).length;
                    return (
                        <button
                            key={orde}
                            onClick={() => setActiveOrde(orde === activeOrde ? 'semua' : orde)}
                            className={`text-left p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${activeOrde === orde
                                ? `${cfg.bgColor} ${cfg.borderColor} shadow-sm`
                                : 'bg-gray-50 border-gray-100 hover:bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: cfg.color }}
                                />
                                <span className={`text-xs font-bold ${activeOrde === orde ? cfg.textColor : 'text-gray-700'}`}>
                                    {cfg.label}
                                </span>
                            </div>
                            <p className={`text-[10px] leading-tight ${activeOrde === orde ? cfg.textColor : 'text-gray-500'}`}>
                                {cfg.kategori}
                            </p>
                            <p className={`text-lg font-black mt-1 ${activeOrde === orde ? cfg.textColor : 'text-gray-700'}`}>
                                {count} <span className="text-[10px] font-normal">daerah</span>
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* SEO: Tabel semantik tersembunyi untuk crawler */}
            <div className="sr-only" aria-label="Data Kata Kreatif Jawa Barat — Indeks Ekonomi Kreatif">
                <h4>Pemeringkatan Kata Kreatif Jawa Barat 2023</h4>
                <p>
                    Indeks Kreativitas Ekonomi (Kata Kreatif) menilai kinerja ekosistem ekonomi kreatif
                    27 Kota dan Kabupaten di Provinsi Jawa Barat berdasarkan skor penilaian tahun 2022 dan 2023.
                </p>
                <table>
                    <caption>Skor Kata Kreatif Jabar per Kota/Kabupaten (2022–2023)</caption>
                    <thead>
                        <tr>
                            <th>Kota/Kabupaten</th>
                            <th>Orde</th>
                            <th>Kategori</th>
                            <th>Skor 2022</th>
                            <th>Skor 2023</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.id}>
                                <td>{row.kota_kabupaten}</td>
                                <td>Orde {row.orde}</td>
                                <td>{row.kategori}</td>
                                <td>{row.skor_2022}</td>
                                <td>{row.skor_2023}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

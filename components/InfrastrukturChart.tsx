'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Legend, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { Loader2, Navigation, Layers, ShieldCheck, MapPin } from 'lucide-react';
import CountUp from 'react-countup';

type KemantapanRow = {
    id: number;
    uptd: string;
    panjang_jalan_km: number;
    mantap_km: number;
    mantap_persen: number;
    tidak_mantap_km: number;
    tidak_mantap_persen: number;
};

type PermukaanRow = {
    id: number;
    kabupaten_kota: string;
    aspal_2025: number;
    beton_2025: number;
    kerikil_2025: number;
    tanah_2025: number;
    jumlah_2025: number;
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function InfrastrukturChart() {
    const [dataKemantapan, setDataKemantapan] = useState<KemantapanRow[]>([]);
    const [dataPermukaan, setDataPermukaan] = useState<PermukaanRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/infrastruktur');
                const json = await res.json();
                if (json.success) {
                    setDataKemantapan(json.data.kemantapan || []);
                    setDataPermukaan(json.data.permukaan || []);
                }
            } catch (err) {
                console.error('Gagal mengambil data Infrastruktur:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // 1. Data Kemantapan Overview
    const kemantapanDinas = useMemo(() => {
        return dataKemantapan.find(d => d.uptd.toLowerCase() === 'dinas') || null;
    }, [dataKemantapan]);

    const kemantapanList = useMemo(() => {
        return dataKemantapan.filter(d => d.uptd.toLowerCase() !== 'dinas')
            .sort((a, b) => b.mantap_persen - a.mantap_persen)
            .map(d => ({
                ...d,
                mantap_pct: parseFloat((d.mantap_persen * 100).toFixed(1)),
                tidak_mantap_pct: parseFloat((d.tidak_mantap_persen * 100).toFixed(1)),
            }));
    }, [dataKemantapan]);

    const pieKemantapan = useMemo(() => {
        if (!kemantapanDinas) return [];
        return [
            { name: 'Mantap', value: kemantapanDinas.mantap_km, color: '#10b981' },
            { name: 'Tidak Mantap', value: kemantapanDinas.tidak_mantap_km, color: '#ef4444' }
        ];
    }, [kemantapanDinas]);

    // 2. Data Permukaan Jalan (Sort by total length)
    const permukaanList = useMemo(() => {
        return [...dataPermukaan]
            .sort((a, b) => b.jumlah_2025 - a.jumlah_2025)
            .map(d => ({
                name: d.kabupaten_kota.replace(/^(Kab\.\s|Kota\s)/, ''), // Simplify name
                aspal: d.aspal_2025,
                beton: d.beton_2025,
                kerikil: d.kerikil_2025,
                tanah: d.tanah_2025,
                total: d.jumlah_2025
            }));
    }, [dataPermukaan]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-purple-500 mb-3" size={36} />
                <p className="text-gray-400 text-sm animate-pulse">Memuat infrastruktur data…</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-sm z-50 min-w-[150px]">
                    <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex justify-between items-center gap-4 text-xs mb-1">
                            <span style={{ color: entry.color || entry.fill }} className="font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.fill }} />
                                {entry.name}
                            </span>
                            <span className="font-bold text-gray-700">
                                {entry.value?.toLocaleString('id-ID')}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Kualitas Aksesibilitas <span className="text-purple-600">Pariwisata</span> 
                    </h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
                        Konektivitas dan infrastruktur jalan provinsi yang direpresentasikan lewat indeks kemantapan serta material permukaan jalan sebagai tulang punggung mobilitas wisatawan menuju berbagai daya tarik wisata di Jawa Barat.
                    </p>
                </div>
                
                {kemantapanDinas && (
                    <div className="flex gap-4">
                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-purple-100/50 rounded-xl text-purple-600">
                                <Navigation size={24} />
                            </div>
                            <div>
                                <p className="text-purple-800 text-[10px] font-bold uppercase tracking-wide">Total Panjang Jalan Prov.</p>
                                <div className="text-xl font-black text-purple-700">
                                    <CountUp end={kemantapanDinas.panjang_jalan_km} decimals={1} duration={2} separator="." />
                                    <span className="text-xs font-semibold text-purple-600/70 ml-1">Km</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-600">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-emerald-800 text-[10px] font-bold uppercase tracking-wide">Jalan Kondisi Mantap</p>
                                <div className="text-xl font-black text-emerald-700">
                                    <CountUp end={kemantapanDinas.mantap_persen * 100} decimals={1} duration={2} />
                                    <span className="text-xs font-semibold text-emerald-600/70 ml-1">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kemantapan UPTD Chart */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                    <h4 className="text-base font-bold text-gray-800 mb-1">Kemantapan Jalan per UPTD</h4>
                    <p className="text-xs text-gray-500 mb-6">Persentase jalan dengan kondisi mantap (baik & sedang) di setiap lingkup Unit Pelaksana Teknis Daerah.</p>
                    
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={kemantapanList} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="uptd" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} width={80} tickFormatter={(val) => `UPTD ${val}`} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
                                <Bar dataKey="mantap_pct" name="Mantap (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                                    {kemantapanList.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.mantap_pct > 90 ? '#10b981' : entry.mantap_pct > 80 ? '#f59e0b' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Permukaan Jalan Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                    <h4 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <Layers size={16} className="text-indigo-500" />
                        Jenis Permukaan Infrastruktur Jalan (2025)
                    </h4>
                    <p className="text-xs text-gray-500 mb-6">Distribusi panjang jalan raya provinsi berdasarkan material permukaan (Aspal, Beton, Kerikil, Tanah) di masing-masing kota dan kabupaten wilayah Jawa Barat.</p>
                    
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={permukaanList} margin={{ top: 10, right: 0, left: -20, bottom: 40 }} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fill: '#6b7280' }} 
                                    angle={-45} 
                                    textAnchor="end" 
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                                <Bar dataKey="aspal" name="Aspal (Km)" stackId="a" fill="#1e293b" animationDuration={1000} />
                                <Bar dataKey="beton" name="Beton (Km)" stackId="a" fill="#8b5cf6" animationDuration={1000} />
                                <Bar dataKey="kerikil" name="Kerikil (Km)" stackId="a" fill="#f59e0b" animationDuration={1000} />
                                <Bar dataKey="tanah" name="Tanah (Km)" stackId="a" fill="#84cc16" radius={[4, 4, 0, 0]} animationDuration={1000} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

             {/* SEO tables */}
             <div className="sr-only">
                <table>
                    <caption>Data Kemantapan Jalan Provinsi Jawa Barat</caption>
                    <thead>
                        <tr><th>UPTD</th><th>Panjang (Km)</th><th>Mantap (%)</th></tr>
                    </thead>
                    <tbody>
                        {dataKemantapan.map((d) => (
                            <tr key={d.id}><td>{d.uptd}</td><td>{d.panjang_jalan_km}</td><td>{d.mantap_persen * 100}%</td></tr>
                        ))}
                    </tbody>
                </table>
                <table>
                    <caption>Data Permukaan Jalan Provinsi Jawa Barat 2025</caption>
                    <thead>
                        <tr><th>Wilayah</th><th>Aspal</th><th>Beton</th><th>Kerikil</th><th>Tanah</th></tr>
                    </thead>
                    <tbody>
                        {dataPermukaan.map((d) => (
                            <tr key={d.id}><td>{d.kabupaten_kota}</td><td>{d.aspal_2025}</td><td>{d.beton_2025}</td><td>{d.kerikil_2025}</td><td>{d.tanah_2025}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

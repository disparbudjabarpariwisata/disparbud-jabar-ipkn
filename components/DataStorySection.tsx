'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line
} from 'recharts';
import { Activity, Map, Trophy, ShieldAlert, TrendingUp, Loader2 } from 'lucide-react';
import KataKreatifChart from '@/components/KataKreatifChart';

type DataMapRow = {
    city_name: string;
    city_type: string;
    medical_data?: Record<string, any>;
    content?: any;
    [key: string]: any;
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function DataStorySection() {
    const [activeTab, setActiveTab] = useState<'kesehatan' | 'desa' | 'olahraga' | 'keamanan' | 'ekonomi'>('kesehatan');
    const [data, setData] = useState<DataMapRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/map-data');
                const json = await res.json();
                if (json.success) {
                    setData(json.data || []);
                }
            } catch (err) {
                console.error("Gagal mengambil data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- AGGREGATIONS ---

    // 1. Kesehatan
    const healthData = useMemo(() => {
        let totalDengue = 0;
        let avgJkn = 0;
        let validJknCount = 0;
        const cityHealth: any[] = []; // for bar chart

        data.forEach(row => {
            if (row.medical_data) {
                // Get most recent year usually
                const years = Object.keys(row.medical_data).sort((a, b) => Number(b) - Number(a));
                if (years.length > 0) {
                    const md = row.medical_data[years[0]]?.datasets;
                    
                    const dengue = md?.['Penyakit Menular']?.dengue_cases || 0;
                    const jkn = md?.['JKN']?.jkn_coverage_ratio || 0;
                    
                    totalDengue += dengue;
                    if (jkn > 0) {
                        avgJkn += jkn;
                        validJknCount++;
                    }

                    cityHealth.push({
                        name: row.city_name.replace(/(Kabupaten |Kota )/g, ''),
                        type: row.city_type,
                        dengue,
                        jkn: parseFloat((jkn * 100).toFixed(1))
                    });
                }
            }
        });

        const jknFinal = validJknCount > 0 ? (avgJkn / validJknCount) * 100 : 0;
        
        // Sort for Bar chart (Top 10 highest dengue)
        const topDengue = [...cityHealth].sort((a, b) => b.dengue - a.dengue).slice(0, 10);

        return { totalDengue, jknFinal, topDengue };
    }, [data]);


    // 2. Desa Wisata
    const desaData = useMemo(() => {
        let totalDesa = 0;
        const statusCount: Record<string, number> = {
            'Rintisan': 0, 'Berkembang': 0, 'Maju': 0, 'Mandiri': 0
        };
        const cityDesa: any[] = [];

        data.forEach(row => {
            const villages = row.content?.desa_wisata || [];
            if (villages.length > 0) {
                totalDesa += villages.length;
                villages.forEach((v: any) => {
                    const s = v.status || 'Rintisan';
                    if (statusCount[s] !== undefined) statusCount[s]++;
                    else statusCount[s] = 1;
                });
                cityDesa.push({
                    name: row.city_name.replace(/(Kabupaten |Kota )/g, ''),
                    total: villages.length
                });
            }
        });

        const pieData = Object.entries(statusCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
        const topCities = [...cityDesa].sort((a, b) => b.total - a.total).slice(0, 7);

        return { totalDesa, pieData, topCities };
    }, [data]);


    // 3. Sarana Olahraga
    const sportData = useMemo(() => {
        let totalStadion = 0;
        let totalSarpras = 0;
        const cityStadiums: any[] = [];

        data.forEach(row => {
            const profile = row.content?.sarana_olahraga?.profile;
            const facilities = row.content?.sarana_olahraga?.facilities || [];
            
            if (profile) {
                totalStadion += (profile.stadion_total || 0);
                totalSarpras += ((profile.total_availability_units || 0) - (profile.stadion_total || 0));
                
                if (profile.stadion_total > 0) {
                     cityStadiums.push({
                         name: row.city_name.replace(/(Kabupaten |Kota )/g, ''),
                         stadion: profile.stadion_total
                     });
                }
            }
        });

        const pieData = [
            { name: 'Stadion Utama', value: totalStadion },
            { name: 'Sarpras Olahraga Lainnya', value: Math.max(0, totalSarpras) }
        ];

        const topStadiumCities = [...cityStadiums].sort((a, b) => b.stadion - a.stadion).slice(0, 8);

        return { totalStadion, totalSarpras: totalStadion + totalSarpras, pieData, topStadiumCities };
    }, [data]);


    // --- RENDERING ---

    const tabs = [
        { id: 'kesehatan', label: 'Kesehatan Wisatawan', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50', activeBg: 'bg-emerald-500', border: 'border-emerald-200' },
        { id: 'desa', label: 'Desa Wisata', icon: Map, color: 'text-amber-500', bg: 'bg-amber-50', activeBg: 'bg-amber-500', border: 'border-amber-200' },
        { id: 'olahraga', label: 'Sarana Olahraga', icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50', activeBg: 'bg-blue-500', border: 'border-blue-200' },
        { id: 'keamanan', label: 'Keamanan (Soon)', icon: ShieldAlert, color: 'text-gray-400', bg: 'bg-gray-50', activeBg: 'bg-gray-800', border: 'border-gray-200' },
        { id: 'ekonomi', label: 'Ekonomi Kreatif', icon: TrendingUp, color: 'text-teal-500', bg: 'bg-teal-50', activeBg: 'bg-teal-600', border: 'border-teal-200' },
    ] as const;

    const renderCustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-100 text-sm">
                    <p className="font-bold text-gray-800 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="font-medium text-xs">
                            {entry.name}: {entry.value?.toLocaleString('id-ID')} {entry.unit}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <section className="py-20 px-4 md:px-8 bg-white border-t border-gray-100 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-50/50 blur-3xl pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold tracking-wider uppercase mb-3 border border-emerald-100">
                        Visualisasi Data Agregat
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Cerita Data Pariwisata Jawa Barat
                    </h2>
                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                        Jelajahi wawasan mendalam dari integrasi lintas sektor pendukung kepariwisataan di 27 Kota dan Kabupaten se-Jawa Barat.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 border
                                    ${isActive 
                                        ? `${tab.activeBg} text-white shadow-md border-transparent scale-105` 
                                        : `bg-white text-gray-600 ${tab.border} hover:${tab.bg} hover:shadow-sm`
                                    }
                                `}
                            >
                                <Icon size={16} className={isActive ? 'text-white' : tab.color} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 min-h-[500px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                            <p className="text-gray-500 font-medium animate-pulse">Memuat kepingan data...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {/* --- KESEHATAN TAB --- */}
                                {activeTab === 'kesehatan' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
                                        <div className="lg:col-span-1 space-y-8 flex flex-col justify-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Faktor <span className="text-emerald-500">Kesehatan</span> Destinasi</h3>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Keamanan kesehatan merupakan pendorong utama mobilitas wisatawan. Data menunjukkan komitmen Jawa Barat dalam pemerataan Jaminan Kesehatan Nasional (JKN) untuk perlindungan warga dan kenyamanan pelancong.
                                                </p>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                                    <p className="text-emerald-800 text-xs font-bold uppercase tracking-wide mb-1">Rata-rata JKN</p>
                                                    <div className="text-3xl font-black text-emerald-600">
                                                        <CountUp end={healthData.jknFinal} decimals={1} duration={2.5} />%
                                                    </div>
                                                </div>
                                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                                    <p className="text-orange-800 text-xs font-bold uppercase tracking-wide mb-1">Kasus DBD Terdata</p>
                                                    <div className="text-3xl font-black text-orange-600">
                                                        <CountUp end={healthData.totalDengue} duration={2} separator="." />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
                                                <p className="text-sm font-bold text-gray-700 mb-4 text-center">10 Daerah dengan Kasus Demam Berdarah Tertinggi (Potensi Perhatian Khusus)</p>
                                                <ResponsiveContainer width="100%" height="85%">
                                                    <BarChart data={healthData.topDengue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                                        <Tooltip content={renderCustomTooltip} />
                                                        <Bar dataKey="dengue" name="Kasus DBD" fill="#f97316" radius={[4, 4, 0, 0]} unit=" Jiwa">
                                                            {healthData.topDengue.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- DESA WISATA TAB --- */}
                                {activeTab === 'desa' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
                                        <div className="lg:col-span-1 space-y-8 flex flex-col justify-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pesona <span className="text-amber-500">Desa Wisata</span></h3>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Jawa Barat terus mendorong kemandirian ekonomi desa melalui sektor pariwisata. Perkembangan status desa wisata menunjukkan tren positif dari tahun ke tahun.
                                                </p>
                                            </div>
                                            
                                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-amber-800 text-xs font-bold uppercase tracking-wide mb-1">Total Entitas</p>
                                                    <div className="text-4xl font-black text-amber-600">
                                                        <CountUp end={desaData.totalDesa} duration={2} /> <span className="text-xl">Desa</span>
                                                    </div>
                                                </div>
                                                <Map size={40} className="text-amber-200" />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-[300px] flex flex-col">
                                                <p className="text-sm font-bold text-gray-700 mb-2 text-center">Sebaran Status Kemandirian</p>
                                                <div className="flex-1">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={desaData.pieData}
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                {desaData.pieData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip content={renderCustomTooltip} />
                                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-[300px]">
                                                <p className="text-sm font-bold text-gray-700 mb-4 text-center">Top 7 Daerah Pendorong Desa Wisata</p>
                                                <ResponsiveContainer width="100%" height="80%">
                                                    <AreaChart data={desaData.topCities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                                        <Tooltip content={renderCustomTooltip} />
                                                        <Area type="monotone" dataKey="total" name="Jumlah Desa" stroke="#d97706" fillOpacity={1} fill="url(#colorTotal)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- SARANA OLAHRAGA TAB --- */}
                                {activeTab === 'olahraga' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
                                        <div className="lg:col-span-1 space-y-8 flex flex-col justify-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Optimalisasi <span className="text-blue-500">Sport Tourism</span></h3>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    Penyediaan infrastruktur olahraga bertaraf nasional/internasional memperkuat daya saing wilayah dalam menjadi tuan rumah penyelenggaraan _event sport tourism_.
                                                </p>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                    <p className="text-blue-800 text-[10px] font-bold uppercase tracking-wide mb-1">Total Unit Tercatat</p>
                                                    <div className="text-2xl font-black text-blue-600">
                                                        <CountUp end={sportData.totalSarpras} duration={2} separator="." />
                                                    </div>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                                    <p className="text-indigo-800 text-[10px] font-bold uppercase tracking-wide mb-1">Stadion Skala Besar</p>
                                                    <div className="text-2xl font-black text-indigo-600">
                                                        <CountUp end={sportData.totalStadion} duration={2} delay={0.5} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
                                                <p className="text-sm font-bold text-gray-700 mb-4 text-center">Konsentrasi Kepemilikan Stadion di Jawa Barat (Top 8)</p>
                                                <ResponsiveContainer width="100%" height="85%">
                                                    <LineChart data={sportData.topStadiumCities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                                        <Tooltip content={renderCustomTooltip} />
                                                        <Line type="monotone" dataKey="stadion" name="Jumlah Stadion" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- KEAMANAN SOON TAB --- */}
                                {activeTab === 'keamanan' && (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                                            <ShieldAlert size={32} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Basis Data Sedang Dipersiapkan</h3>
                                        <p className="text-gray-500 max-w-md">
                                            Integrasi agregasi intelijen data untuk sektor Keamanan dan Kriminalitas sedang dalam tahap sinkronisasi dengan pemangku kepentingan terkait.
                                        </p>
                                    </div>
                                )}

                                {/* --- EKONOMI KREATIF TAB (LIVE) --- */}
                                {activeTab === 'ekonomi' && (
                                    <KataKreatifChart />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </section>
    );
}

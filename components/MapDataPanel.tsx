'use client';

import { X, MapPin, Utensils, Hotel, Bus, Globe, Landmark, Sparkles, ExternalLink, Activity, Shield, Bed, Stethoscope, ChevronDown, Info } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';
type MapDataItem = {
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
    medical_data?: Record<string, any>;
    desa_wisata_data?: any[];
    content?: any;
};

interface MapDataPanelProps {
    data: MapDataItem | null;
    cityName: string;
    onClose: () => void;
    allMapData?: MapDataItem[]; // Needed to calculate provincial averages
}

export default function MapDataPanel({ data, cityName, onClose, allMapData = [] }: MapDataPanelProps) {
    const availableYears = useMemo(() => {
        if (!data?.medical_data) return [];
        return Object.keys(data.medical_data).sort((a, b) => Number(b) - Number(a));
    }, [data?.medical_data]);

    const latestYearOptional = availableYears.length > 0 ? availableYears[0] : null;

    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    // Reset or set initial year when data changes
    useEffect(() => {
        if (availableYears.length > 0) {
            setSelectedYear(availableYears[0]);
        } else {
            setSelectedYear(null);
        }
    }, [availableYears]);

    const latestHealthData = useMemo(() => {
        if (!data?.medical_data || !selectedYear) return null;
        return {
            year: selectedYear,
            datasets: data.medical_data[selectedYear].datasets || {}
        };
    }, [data?.medical_data, selectedYear]);

    // Calculate provincial averages for the selected year
    const provincialAverages = useMemo(() => {
        if (!selectedYear || allMapData.length === 0) return null;
        
        let totalJkn = 0, countJkn = 0;
        let totalBed = 0, countBed = 0;
        let totalDoc = 0, countDoc = 0;
        let totalDbg = 0, countDbg = 0;

        allMapData.forEach(city => {
            const cityDataYear = city.medical_data?.[selectedYear]?.datasets;
            if (!cityDataYear) return;

            if (cityDataYear['JKN']?.jkn_coverage_ratio !== undefined) {
                totalJkn += cityDataYear['JKN'].jkn_coverage_ratio;
                countJkn++;
            }
            if (cityDataYear['Rasio Tempat Tidur']?.hospital_bed_ratio_per_1000_population !== undefined) {
                totalBed += cityDataYear['Rasio Tempat Tidur'].hospital_bed_ratio_per_1000_population;
                countBed++;
            }
            if (cityDataYear['Rasio Dokter']?.doctor_ratio_per_1000_population !== undefined) {
                totalDoc += cityDataYear['Rasio Dokter'].doctor_ratio_per_1000_population;
                countDoc++;
            }
            if (cityDataYear['Penyakit Menular']?.dengue_cases !== undefined) {
                totalDbg += cityDataYear['Penyakit Menular'].dengue_cases;
                countDbg++;
            }
        });

        return {
            jkn: countJkn > 0 ? totalJkn / countJkn : 0,
            bed: countBed > 0 ? totalBed / countBed : 0,
            doc: countDoc > 0 ? totalDoc / countDoc : 0,
            dbg: countDbg > 0 ? totalDbg / countDbg : 0,
        };
    }, [selectedYear, allMapData]);

    const chartData = useMemo(() => {
        if (!latestHealthData || !provincialAverages) return null;
        const ds = latestHealthData.datasets;
        
        return {
            jkn: [
                { name: cityName, value: ds['JKN'] ? Number((ds['JKN'].jkn_coverage_ratio * 100).toFixed(1)) : 0, fill: '#10b981' },
                { name: 'Rata-rata Jabar', value: Number((provincialAverages.jkn * 100).toFixed(1)), fill: '#94a3b8' }
            ],
            bed: [
                { name: cityName, value: ds['Rasio Tempat Tidur'] ? Number(ds['Rasio Tempat Tidur'].hospital_bed_ratio_per_1000_population.toFixed(2)) : 0, fill: '#3b82f6' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.bed.toFixed(2)), fill: '#94a3b8' }
            ],
            doc: [
                { name: cityName, value: ds['Rasio Dokter'] ? Number(ds['Rasio Dokter'].doctor_ratio_per_1000_population.toFixed(2)) : 0, fill: '#6366f1' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.doc.toFixed(2)), fill: '#94a3b8' }
            ],
            dbg: [
                { name: cityName, value: ds['Penyakit Menular'] ? ds['Penyakit Menular'].dengue_cases : 0, fill: '#f43f5e' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.dbg.toFixed(0)), fill: '#94a3b8' }
            ]
        };
    }, [latestHealthData, provincialAverages, cityName]);

    if (!cityName) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-white relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{cityName}</h3>
                        {data && (
                            <span className="text-emerald-100 text-sm">{data.city_type}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {!data ? (
                <div className="px-6 py-10 text-center text-gray-400">
                    <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-gray-500">Data kepariwisataan belum tersedia</p>
                    <p className="text-sm mt-1">Admin belum menginput data untuk {cityName}.</p>
                </div>
            ) : (
                <div className="p-6 space-y-5">
                    {/* Description */}
                    {data.description && (
                        <div>
                            <p className="text-gray-700 text-sm leading-relaxed">{data.description}</p>
                        </div>
                    )}

                    {/* Image */}
                    {data.image_url && (
                        <div className="rounded-xl overflow-hidden border border-gray-100">
                            <img src={data.image_url} alt={cityName} className="w-full h-48 object-cover" />
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.tourism_highlights && (
                            <InfoCard icon={<Sparkles size={18} className="text-amber-500" />} title="Highlight Pariwisata" content={data.tourism_highlights} />
                        )}
                        {data.tourist_attractions && (
                            <InfoCard icon={<Landmark size={18} className="text-blue-500" />} title="Destinasi Wisata" content={data.tourist_attractions} />
                        )}
                        {data.culinary && (
                            <InfoCard icon={<Utensils size={18} className="text-orange-500" />} title="Kuliner Khas" content={data.culinary} />
                        )}
                        {data.accommodation && (
                            <InfoCard icon={<Hotel size={18} className="text-purple-500" />} title="Akomodasi" content={data.accommodation} />
                        )}
                        {data.transportation && (
                            <InfoCard icon={<Bus size={18} className="text-teal-500" />} title="Transportasi" content={data.transportation} />
                        )}
                        {data.website_url && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                <Globe size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Website Resmi</h4>
                                    <a href={data.website_url} target="_blank" rel="noreferrer"
                                        className="text-blue-600 text-xs hover:underline inline-flex items-center gap-1">
                                        <ExternalLink size={12} /> Kunjungi Website
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Medical Tourism Data Section */}
                    {latestHealthData && Object.keys(latestHealthData.datasets).length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-rose-500" />
                                    <h4 className="text-sm font-bold text-gray-800">Informasi Kesehatan</h4>
                                </div>
                                {availableYears.length > 1 && (
                                    <div className="relative">
                                        <select
                                            value={selectedYear || ''}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="appearance-none bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent cursor-pointer"
                                        >
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-rose-600 pointer-events-none" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {chartData?.jkn && chartData.jkn[0].value > 0 && (
                                    <ChartCard 
                                        title="Cakupan JKN (%)" 
                                        icon={<Shield size={16} className="text-emerald-500" />}
                                        data={chartData.jkn} 
                                        color="#10b981"
                                        formatter={(val) => `${val}%`}
                                        delay={0.1}
                                    />
                                )}
                                {chartData?.bed && chartData.bed[0].value > 0 && (
                                    <ChartCard 
                                        title="Ketersediaan RST (per 1.000 pddk)" 
                                        icon={<Bed size={16} className="text-blue-500" />}
                                        data={chartData.bed} 
                                        color="#3b82f6"
                                        delay={0.2}
                                    />
                                )}
                                {chartData?.doc && chartData.doc[0].value > 0 && (
                                    <ChartCard 
                                        title="Ketersediaan Dokter (per 1.000 pddk)" 
                                        icon={<Stethoscope size={16} className="text-indigo-500" />}
                                        data={chartData.doc} 
                                        color="#6366f1"
                                        delay={0.3}
                                    />
                                )}
                                {chartData?.dbg && chartData.dbg[0].value > 0 && (
                                    <ChartCard 
                                        title="Kasus Dengue (DBD)" 
                                        icon={<Activity size={16} className="text-rose-500" />}
                                        data={chartData.dbg} 
                                        color="#f43f5e"
                                        formatter={(val) => val.toLocaleString('id-ID')}
                                        delay={0.4}
                                    />
                                )}
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Grafik di atas membandingkan metrik kesehatan <strong>{cityName}</strong> dengan nilai rata-rata dari seluruh kota dan kabupaten di wilayah provinsi Jawa Barat pada tahun <strong>{selectedYear}</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Desa Wisata Section */}
                    {(() => {
                        const villages = data.desa_wisata_data || data.content?.desa_wisata;
                        
                        return (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Landmark size={18} className="text-emerald-600" />
                                    <h4 className="text-sm font-bold text-gray-800">Daftar Desa Wisata {villages?.length ? `(${villages.length})` : ''}</h4>
                                </div>
                                
                                {!villages || villages.length === 0 ? (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                                        <p className="text-xs text-gray-500 italic">Tidak ada informasi desa wisata untuk wilayah ini.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {villages.map((desa: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h5 className="text-sm font-bold text-gray-900">{desa.nama}</h5>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        desa.status === 'Mandiri' ? 'bg-emerald-100 text-emerald-700' :
                                                        desa.status === 'Maju' ? 'bg-blue-100 text-blue-700' :
                                                        desa.status === 'Berkembang' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {desa.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <MapPin size={10} /> {desa.desa_kelurahan}, {desa.kecamatan}
                                                </p>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {desa.potensi?.alam_list?.length > 0 && (
                                                        <div className="text-[10px] text-gray-600">
                                                            <span className="font-semibold text-emerald-600">Alam:</span> {desa.potensi.alam_list.join(', ')}
                                                        </div>
                                                    )}
                                                    {desa.potensi?.budaya_list?.length > 0 && (
                                                        <div className="text-[10px] text-gray-600">
                                                            <span className="font-semibold text-blue-600">Budaya:</span> {desa.potensi.budaya_list.join(', ')}
                                                        </div>
                                                    )}
                                                    {desa.potensi?.buatan_list?.length > 0 && (
                                                        <div className="text-[10px] text-gray-600">
                                                            <span className="font-semibold text-amber-600">Buatan:</span> {desa.potensi.buatan_list.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

function InfoCard({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1">{title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, icon, data, color, formatter, delay }: { title: string, icon: React.ReactNode, data: any[], color: string, formatter?: (val: number) => string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col h-56"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gray-50 rounded-md">{icon}</div>
                <h4 className="text-xs font-bold text-gray-700">{title}</h4>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                        <RechartsTooltip 
                            cursor={{ fill: '#f8fafc' }} 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [formatter ? formatter(Number(value)) : value, 'Nilai']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

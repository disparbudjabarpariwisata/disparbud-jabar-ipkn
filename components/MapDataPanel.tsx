'use client';

import { X, MapPin, Utensils, Hotel, Bus, Globe, Landmark, Sparkles, ExternalLink, Activity, Shield, Bed, Stethoscope, ChevronDown, Info, Trophy, Filter } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell, ReferenceLine, LabelList } from 'recharts';
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
    regional_health?: Record<string, {
        jkn_percent: number;
        bed_ratio: number;
        doctor_ratio: number;
        spesialis_ratio: number;
    }>;
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
        if (!data?.regional_health) return [];
        return Object.keys(data.regional_health).sort((a, b) => Number(b) - Number(a));
    }, [data?.regional_health]);

    const latestYearOptional = availableYears.length > 0 ? availableYears[0] : null;

    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string>('Semua');
    const [selectedQuality, setSelectedQuality] = useState<string>('Semua');

    // Reset or set initial year when data changes
    useEffect(() => {
        if (availableYears.length > 0) {
            setSelectedYear(availableYears[0]);
        } else {
            setSelectedYear(null);
        }
        setSelectedSport('Semua');
        setSelectedQuality('Semua');
    }, [availableYears, data?.city_name]);

    const latestHealthData = useMemo(() => {
        if (!data?.regional_health || !selectedYear) return null;
        return data.regional_health[selectedYear];
    }, [data?.regional_health, selectedYear]);

    // Calculate provincial averages for the selected year
    const provincialAverages = useMemo(() => {
        if (!selectedYear || allMapData.length === 0) return null;
        
        let totalJkn = 0, countJkn = 0;
        let totalBed = 0, countBed = 0;
        let totalDoc = 0, countDoc = 0;
        let totalSpesialis = 0, countSpesialis = 0;

        allMapData.forEach(city => {
            const healthYear = city.regional_health?.[selectedYear];
            if (!healthYear) return;

            if (healthYear.jkn_percent !== undefined) {
                totalJkn += healthYear.jkn_percent;
                countJkn++;
            }
            if (healthYear.bed_ratio !== undefined) {
                totalBed += healthYear.bed_ratio;
                countBed++;
            }
            if (healthYear.doctor_ratio !== undefined) {
                totalDoc += healthYear.doctor_ratio;
                countDoc++;
            }
            if (healthYear.spesialis_ratio !== undefined) {
                totalSpesialis += healthYear.spesialis_ratio;
                countSpesialis++;
            }
        });

        return {
            jkn: countJkn > 0 ? totalJkn / countJkn : 0,
            bed: countBed > 0 ? totalBed / countBed : 0,
            doc: countDoc > 0 ? totalDoc / countDoc : 0,
            spesialis: countSpesialis > 0 ? totalSpesialis / countSpesialis : 0,
        };
    }, [selectedYear, allMapData]);

    const chartData = useMemo(() => {
        if (!latestHealthData || !provincialAverages) return null;
        
        return {
            jkn: [
                { name: cityName, value: Number(latestHealthData.jkn_percent.toFixed(1)), fill: '#10b981' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.jkn.toFixed(1)), fill: '#94a3b8' }
            ],
            bed: [
                { name: cityName, value: Number(latestHealthData.bed_ratio.toFixed(2)), fill: '#3b82f6' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.bed.toFixed(2)), fill: '#94a3b8' }
            ],
            doc: [
                { name: cityName, value: Number(latestHealthData.doctor_ratio.toFixed(2)), fill: '#6366f1' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.doc.toFixed(2)), fill: '#94a3b8' }
            ],
            spesialis: [
                { name: cityName, value: Number(latestHealthData.spesialis_ratio.toFixed(2)), fill: '#8b5cf6' },
                { name: 'Rata-rata Jabar', value: Number(provincialAverages.spesialis.toFixed(2)), fill: '#94a3b8' }
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
                    {latestHealthData && (
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
                                        description="Persentase penduduk wilayah ini yang terlindungi oleh asuransi JKN (Jaminan Kesehatan Nasional). Angka ini mencerminkan tingkatan akses masyarakat dan wisatawan lokal terhadap fasilitas medis pertama."
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
                                        description="Rasio jumlah RST (Rumah Sakit Tempat Tidur) yang dihitung per 1.000 Penduduk (pddk). Indikator vital ini mengukur kesigapan fasilitas rawat inap medis apabila terjadi gawat darurat kepariwisataan."
                                        icon={<Bed size={16} className="text-blue-500" />}
                                        data={chartData.bed} 
                                        color="#3b82f6"
                                        delay={0.2}
                                    />
                                )}
                                {chartData?.doc && chartData.doc[0].value > 0 && (
                                    <ChartCard 
                                        title="Ketersediaan Dokter Umum (per 1.000 pddk)" 
                                        description="Rasio jumlah ketersediaan Dokter Umum per 1.000 Penduduk (pddk) di wilayah ini. Sangat penting peranannya dalam pertolongan gawat darurat medis tahap pertama di area sekitar lokasi rekreasi."
                                        icon={<Stethoscope size={16} className="text-indigo-500" />}
                                        data={chartData.doc} 
                                        color="#6366f1"
                                        delay={0.3}
                                    />
                                )}
                                {chartData?.spesialis && chartData.spesialis[0].value > 0 && (
                                    <ChartCard 
                                        title="Ketersediaan Dr Spesialis (per 1.000 pddk)" 
                                        description="Rasio ketersediaan Dr (Dokter) Spesialis per 1.000 Penduduk (pddk). Menunjukkan kesigapan instansi rumah sakit sekitar area untuk menangani kasus penyakit klinis tahap lanjut."
                                        icon={<Activity size={16} className="text-purple-500" />}
                                        data={chartData.spesialis} 
                                        color="#8b5cf6"
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

                    {/* Sarana Olahraga Section */}
                    {(() => {
                        const olahragaData = data.content?.sarana_olahraga;
                        if (!olahragaData) return null;

                        const profile = olahragaData.profile || {};
                        const facilities = (olahragaData.facilities || []) as any[];

                        // Extract unique sports and qualities for filters
                        const availableSports = ['Semua', ...Array.from(new Set(facilities.map(f => f.sport_branch_name).filter(Boolean)))].sort();
                        const availableQualities = ['Semua', ...Array.from(new Set(facilities.map(f => f.quality_class).filter(Boolean)))].sort();

                        // Apply filters
                        const filteredFacilities = facilities.filter(f => {
                            const matchSport = selectedSport === 'Semua' || f.sport_branch_name === selectedSport;
                            const matchQuality = selectedQuality === 'Semua' || f.quality_class === selectedQuality;
                            return matchSport && matchQuality;
                        });

                        return (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Trophy size={18} className="text-blue-600" />
                                    <h4 className="text-sm font-bold text-gray-800">Sarana & Prasarana Olahraga</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Total Unit</div>
                                        <div className="text-xl font-black text-blue-700">{profile.total_availability_units || facilities.length}</div>
                                    </div>
                                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Total Stadion</div>
                                        <div className="text-xl font-black text-indigo-700">{profile.stadion_total || facilities.filter(f => f.facility_category === 'stadion').length}</div>
                                    </div>
                                </div>

                                {facilities.length > 0 && (
                                    <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700">
                                            <Filter size={14} className="text-gray-400" /> Filter Data
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 mb-1">Cabang Olahraga</label>
                                                <select 
                                                    value={selectedSport} 
                                                    onChange={e => setSelectedSport(e.target.value)}
                                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none"
                                                >
                                                    {availableSports.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 mb-1">Kelas/Kualitas</label>
                                                <select 
                                                    value={selectedQuality} 
                                                    onChange={e => setSelectedQuality(e.target.value)}
                                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white focus:border-blue-500 outline-none"
                                                >
                                                    {availableQualities.map(q => <option key={q} value={q}>{q}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!filteredFacilities.length ? (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                                        <p className="text-xs text-gray-500 italic">Tidak ada fasilitas rekam jejak untuk filter tersebut.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredFacilities.flatMap((f: any, rowIdx: number) => {
                                            // Handle named_facilities (usually stadiums or specific places)
                                            if (f.named_facilities && f.named_facilities.length > 0) {
                                                return f.named_facilities.map((nf: any, nfIdx: number) => (
                                                    <div key={`nf-${rowIdx}-${nfIdx}`} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h5 className="text-sm font-bold text-gray-900 leading-tight">{nf.facility_name || 'Sarana Olahraga'}</h5>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                                                f.facility_category === 'stadion' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {f.facility_category}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 text-[10px]">
                                                            {f.sport_branch_name && (
                                                                <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                    <Activity size={10} /> {f.sport_branch_name}
                                                                </span>
                                                            )}
                                                            {nf.quality_class && (
                                                                <span className={`px-2 py-0.5 rounded-md ${
                                                                    nf.quality_class === 'Internasional' ? 'bg-purple-100 text-purple-700 font-medium' :
                                                                    nf.quality_class === 'Nasional' ? 'bg-indigo-100 text-indigo-700' :
                                                                    'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                    {nf.quality_class}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {nf.category_name && (
                                                            <p className="text-[10px] text-gray-500 pt-1 border-t border-gray-50 mt-2">
                                                                <span className="font-semibold text-gray-600">Keterangan:</span> {nf.category_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                ));
                                            }

                                            // Fallback for general sarpras facilities (aggregated)
                                            return (
                                                <div key={`f-${rowIdx}`} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h5 className="text-sm font-bold text-gray-900 leading-tight">
                                                            Sarana {f.sport_branch_name || 'Olahraga'}
                                                        </h5>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 bg-blue-100 text-blue-700">
                                                            {f.facility_category}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-[10px]">
                                                        {f.sport_branch_name && (
                                                            <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                <Activity size={10} /> {f.sport_branch_name}
                                                            </span>
                                                        )}
                                                        {(f.availability_count > 0 || f.facility_count > 0) && (
                                                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
                                                                {f.availability_count || f.facility_count} Unit
                                                            </span>
                                                        )}
                                                    </div>
                                                    {f.notes && f.notes.length > 0 && (
                                                        <p className="text-[10px] text-gray-500 pt-1 border-t border-gray-50 mt-2">
                                                            <span className="font-semibold text-gray-600">Catatan:</span> {f.notes.join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
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

function ChartCard({ title, icon, data, color, formatter, delay, description }: { title: string, icon: React.ReactNode, data: any[], color: string, formatter?: (val: number) => string, delay: number, description?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col h-[280px]"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gray-50 rounded-md">{icon}</div>
                <h4 className="text-xs font-bold text-gray-700">{title}</h4>
            </div>
            {description && (
                <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
                    {description}
                </p>
            )}
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
                            <LabelList 
                                dataKey="value" 
                                position="right" 
                                content={(props: any) => {
                                    const { x, y, width, value } = props;
                                    return (
                                        <text 
                                            x={Number(x) + Number(width) + 8} 
                                            y={Number(y) + 16} 
                                            fill="#475569" 
                                            fontSize={10} 
                                            fontWeight={700}
                                            textAnchor="start"
                                        >
                                            {formatter ? formatter(Number(value)) : value}
                                        </text>
                                    );
                                }} 
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

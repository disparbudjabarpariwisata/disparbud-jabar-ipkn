'use client';

import { X, MapPin, Utensils, Hotel, Bus, Globe, Landmark, Sparkles, ExternalLink } from 'lucide-react';

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
};

interface MapDataPanelProps {
    data: MapDataItem | null;
    cityName: string;
    onClose: () => void;
}

export default function MapDataPanel({ data, cityName, onClose }: MapDataPanelProps) {
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

'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { WestJavaLocation } from '@/lib/westJavaLocations';
import MapDataPanel from '@/components/MapDataPanel';
import { MapPin, Loader2 } from 'lucide-react';

// Dynamic import for Leaflet (SSR-incompatible)
const WestJavaMapInner = dynamic(() => import('@/components/WestJavaMapInner'), {
    ssr: false,
    loading: () => (
        <div className="w-full rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center" style={{ height: '500px' }}>
            <div className="text-center">
                <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={32} />
                <p className="text-gray-500 text-sm">Memuat peta...</p>
            </div>
        </div>
    ),
});

export type MapDataItem = {
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

interface WestJavaMapSectionProps {
    initialData?: MapDataItem[];
}

export default function WestJavaMapSection({ initialData = [] }: WestJavaMapSectionProps) {
    const [selectedLocation, setSelectedLocation] = useState<WestJavaLocation | null>(null);
    const [mapData] = useState<MapDataItem[]>(initialData);
    const [selectedData, setSelectedData] = useState<MapDataItem | null>(null);

    // Set of city names that have data
    const dataAvailable = useMemo(() => new Set(mapData.map(d => d.city_name)), [mapData]);

    const handleLocationClick = useCallback((location: WestJavaLocation) => {
        setSelectedLocation(location);
        const data = mapData.find(d => d.city_name === location.name);
        setSelectedData(data || null);
    }, [mapData]);

    const handleClose = useCallback(() => {
        setSelectedLocation(null);
        setSelectedData(null);
    }, []);

    return (
        <section className="px-6 md:px-16 py-16 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                        <MapPin size={16} />
                        Peta Interaktif
                    </div>
                    <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-3xl md:text-4xl text-black mb-3">
                        Peta Kepariwisataan Jawa Barat
                    </h2>
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-base md:text-lg text-[rgba(0,0,0,0.55)] max-w-2xl mx-auto">
                        Jelajahi 27 kota dan kabupaten di Jawa Barat. Klik pin untuk melihat informasi kepariwisataan.
                    </p>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                        Kota (9)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        Kabupaten (18)
                    </div>
                </div>

                {/* Map */}
                <WestJavaMapInner
                    selectedLocation={selectedLocation}
                    onLocationClick={handleLocationClick}
                    dataAvailable={dataAvailable}
                />

                {/* Data Panel */}
                {selectedLocation && (
                    <div className="mt-6">
                        <MapDataPanel
                            data={selectedData}
                            cityName={selectedLocation.name}
                            onClose={handleClose}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

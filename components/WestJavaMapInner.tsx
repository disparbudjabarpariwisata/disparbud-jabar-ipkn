'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { westJavaLocations, westJavaCenter, WestJavaLocation } from '@/lib/westJavaLocations';

// Custom pin icon using inline SVG for Kota (blue) and Kabupaten (emerald)
function createPinIcon(type: 'Kota' | 'Kabupaten', isActive: boolean) {
    const color = type === 'Kota' ? '#2563eb' : '#10b981';
    const glow = isActive ? `filter: drop-shadow(0 0 6px ${color});` : '';

    return L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="position:relative;width:28px;height:36px;${glow}">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3" fill="white" stroke="${color}" stroke-width="2"/>
            </svg>
        </div>`,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
    });
}

interface WestJavaMapProps {
    selectedLocation: WestJavaLocation | null;
    onLocationClick: (location: WestJavaLocation) => void;
    dataAvailable: Set<string>; // city_names that have data_map entries
}

export default function WestJavaMapInner({ selectedLocation, onLocationClick, dataAvailable }: WestJavaMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    const handleClick = useCallback((location: WestJavaLocation) => {
        onLocationClick(location);
    }, [onLocationClick]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: westJavaCenter,
            zoom: 9,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomControl: false,
        });

        mapRef.current = map;

        // Use a cleaner tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 19,
        }).addTo(map);

        // Add markers
        const markers: L.Marker[] = [];
        westJavaLocations.forEach((location) => {
            const isSelected = selectedLocation?.id === location.id;
            const icon = createPinIcon(location.type, isSelected);
            const marker = L.marker(location.coordinates, { icon }).addTo(map);

            const hasData = dataAvailable.has(location.name);
            const popupContent = `
                <div style="min-width:160px;font-family:system-ui,sans-serif;">
                    <h3 style="font-weight:700;font-size:14px;margin:0 0 4px 0;">${location.name}</h3>
                    <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:${location.type === 'Kota' ? '#dbeafe' : '#d1fae5'};color:${location.type === 'Kota' ? '#1d4ed8' : '#047857'};">
                        ${location.type}
                    </span>
                    ${location.description ? `<p style="font-size:12px;color:#6b7280;margin:6px 0 0 0;">${location.description}</p>` : ''}
                    ${hasData ? '<p style="font-size:11px;color:#10b981;margin:6px 0 0 0;font-weight:600;">📍 Klik untuk lihat info pariwisata</p>' : '<p style="font-size:11px;color:#9ca3af;margin:6px 0 0 0;">Data belum tersedia</p>'}
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => handleClick(location));
            markers.push(marker);
        });

        markersRef.current = markers;

        // Fit bounds
        const bounds = westJavaLocations.map(loc => loc.coordinates);
        if (bounds.length > 0) {
            map.fitBounds(bounds as L.LatLngBoundsLiteral, { padding: [30, 30] });
        }

        return () => { map.remove(); };
    }, [handleClick, dataAvailable, selectedLocation]);

    // Pan to selected location
    useEffect(() => {
        if (!mapRef.current || !selectedLocation) return;
        mapRef.current.setView(selectedLocation.coordinates, 11, { animate: true });

        const markerIdx = westJavaLocations.findIndex(l => l.id === selectedLocation.id);
        if (markerIdx >= 0 && markersRef.current[markerIdx]) {
            markersRef.current[markerIdx].openPopup();
        }
    }, [selectedLocation]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            style={{ height: '500px' }}
        />
    );
}

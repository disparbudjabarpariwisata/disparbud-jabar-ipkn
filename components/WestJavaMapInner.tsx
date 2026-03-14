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
    onDetailClick: (location: WestJavaLocation) => void;
    dataAvailable: Set<string>; // city_names that have data_map entries
}

export default function WestJavaMapInner({ selectedLocation, onLocationClick, onDetailClick, dataAvailable }: WestJavaMapProps) {
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
                <div class="map-popup-content" style="min-width:200px; padding: 4px; font-family: 'Inter', sans-serif;">
                    <h3 style="font-weight:800; font-size:16px; margin:0 0 4px 0; color: #1e293b;">${location.name}</h3>
                    <div style="margin-bottom: 8px;">
                        <span style="display:inline-block; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:700; text-transform: uppercase; background:${location.type === 'Kota' ? '#dbeafe' : '#d1fae5'}; color:${location.type === 'Kota' ? '#1d4ed8' : '#047857'};">
                            ${location.type}
                        </span>
                    </div>
                    <p style="font-size:13px; color:#64748b; line-height: 1.5; margin: 0 0 12px 0;">
                        ${location.description || 'Informasi pariwisata wilayah Jawa Barat.'}
                    </p>
                    <button 
                        id="popup-detail-btn-${location.id}"
                        style="width: 100%; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; items-center; justify-center; transition: background 0.2s;"
                        onmouseover="this.style.background='#059669'"
                        onmouseout="this.style.background='#10b981'"
                    >
                        Lihat Detail
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent, {
                autoPanPadding: [50, 50],
                keepInView: true,
                className: 'custom-leaflet-popup'
            });

            marker.on('click', () => handleClick(location));
            markers.push(marker);
        });

        // Handle button clicks in popups
        map.on('popupopen', (e) => {
            const popup = e.popup;
            const container = popup.getElement();
            if (container) {
                const btn = container.querySelector('button[id^="popup-detail-btn-"]') as HTMLElement;
                if (btn) {
                    const locationId = btn.id.replace('popup-detail-btn-', '');
                    const location = westJavaLocations.find(l => String(l.id) === locationId);
                    if (location) {
                        btn.onclick = () => onDetailClick(location);
                    }
                }
            }
        });

        markersRef.current = markers;

        // Fit bounds
        const bounds = westJavaLocations.map(loc => loc.coordinates);
        if (bounds.length > 0) {
            map.fitBounds(bounds as L.LatLngBoundsLiteral, { padding: [30, 30] });
        }

        return () => { map.remove(); };
    }, [handleClick, onDetailClick, dataAvailable, selectedLocation]);

    // Pan to selected location
    useEffect(() => {
        if (!mapRef.current || !selectedLocation) return;

        const markerIdx = westJavaLocations.findIndex(l => l.id === selectedLocation.id);
        if (markerIdx >= 0 && markersRef.current[markerIdx]) {
            markersRef.current[markerIdx].openPopup();
        }
    }, [selectedLocation]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative z-0"
            style={{ height: '500px' }}
        />
    );
}

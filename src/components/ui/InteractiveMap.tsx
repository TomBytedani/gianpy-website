'use client';

import { useEffect, useRef, useState } from 'react';

interface InteractiveMapProps {
    address?: string;
    city?: string;
    country?: string;
    /** Latitude coordinate */
    lat?: number;
    /** Longitude coordinate */
    lng?: number;
    /** Map zoom level (1-18, default 15) */
    zoom?: number;
    /** Map height class */
    className?: string;
    /** Label to show on the marker popup */
    markerLabel?: string;
}

export default function InteractiveMap({
    address = 'Via Roma 123',
    city = 'Milano',
    country = 'Italia',
    // Default coordinates for Milano city center
    lat = 45.4642,
    lng = 9.1900,
    zoom = 15,
    className = 'aspect-[21/9]',
    markerLabel = 'Antichità Barbaglia',
}: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        // Dynamically import Leaflet to avoid SSR issues
        const initializeMap = async () => {
            if (!mapRef.current) return;

            try {
                // Add Leaflet CSS via link tag (avoiding dynamic CSS import issues)
                const leafletCssId = 'leaflet-css';
                if (!document.getElementById(leafletCssId)) {
                    const link = document.createElement('link');
                    link.id = leafletCssId;
                    link.rel = 'stylesheet';
                    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
                    link.integrity = 'sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw==';
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                }

                // Import Leaflet dynamically
                const L = (await import('leaflet')).default;

                // Check if component was unmounted during async import
                if (!mounted || !mapRef.current) return;

                // Check if container already has a map and clean it up
                // This handles React Strict Mode double-invocation
                const container = mapRef.current as HTMLElement & { _leaflet_id?: number };
                if (container._leaflet_id) {
                    // Container already has a map, need to clean up first
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                    }
                    // Clear the leaflet ID from the container
                    delete container._leaflet_id;
                }

                // Fix default marker icon issue with Leaflet in Next.js
                delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                // Create the map
                const map = L.map(mapRef.current, {
                    center: [lat, lng],
                    zoom: zoom,
                    scrollWheelZoom: false, // Disable scroll zoom for better UX
                    zoomControl: true,
                });

                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                // Create a custom icon with primary color styling
                const customIcon = L.divIcon({
                    className: 'custom-map-marker',
                    html: `
                        <div style="
                            width: 32px;
                            height: 32px;
                            background: var(--primary, #a89670);
                            border: 3px solid white;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <div style="
                                transform: rotate(45deg);
                                width: 8px;
                                height: 8px;
                                background: white;
                                border-radius: 50%;
                            "></div>
                        </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                // Add marker with popup
                const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                marker.bindPopup(`
                    <div style="text-align: center; padding: 4px;">
                        <strong style="font-size: 14px; color: #1a1a1a;">${markerLabel}</strong>
                        <br/>
                        <span style="font-size: 12px; color: #666;">${address}</span>
                        <br/>
                        <span style="font-size: 12px; color: #666;">${city}, ${country}</span>
                        <br/>
                        <a 
                            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${country}`)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                display: inline-block;
                                margin-top: 8px;
                                padding: 4px 12px;
                                background: var(--primary, #a89670);
                                color: white;
                                text-decoration: none;
                                border-radius: 4px;
                                font-size: 11px;
                            "
                        >
                            Apri in Google Maps
                        </a>
                    </div>
                `);

                mapInstanceRef.current = map;

                if (mounted) {
                    setIsLoaded(true);
                }

                // Invalidate size after a short delay to ensure proper rendering
                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                    }
                }, 100);

            } catch (err) {
                console.error('Error initializing map:', err);
                if (mounted) {
                    setError('Unable to load map');
                }
            }
        };

        initializeMap();

        // Cleanup
        return () => {
            mounted = false;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [lat, lng, zoom, address, city, country, markerLabel]);

    // Show loading state or fallback
    if (error) {
        return (
            <div className={`${className} bg-gradient-to-br from-[#d4c5a9] to-[#a89670] rounded-lg flex items-center justify-center`}>
                <div className="text-center text-[var(--background)]/70">
                    <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <p className="text-sm">{address}</p>
                    <p className="text-xs mt-1">{city}, {country}</p>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${country}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                    >
                        View on Google Maps
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className} rounded-lg overflow-hidden relative`}>
            {/* Loading skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4c5a9] to-[#a89670] flex items-center justify-center z-10">
                    <div className="animate-pulse flex flex-col items-center text-[var(--background)]/50">
                        <svg
                            className="w-12 h-12 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                        <span className="text-sm">Loading map...</span>
                    </div>
                </div>
            )}

            {/* Map container */}
            <div
                ref={mapRef}
                className="w-full h-full min-h-[200px]"
                style={{ zIndex: 1 }}
            />
        </div>
    );
}

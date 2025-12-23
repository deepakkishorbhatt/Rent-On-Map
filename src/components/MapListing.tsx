'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapControls } from '@/components/MapControls';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Fix for default marker icons in Next.js
const fixLeafletIcons = () => {
    // Only run on client
    if (typeof window === 'undefined') return;
    if (typeof L === 'undefined') return;

    try {
        // Check if icons are already fixed to avoid overwriting or errors
        // @ts-ignore - _getIconUrl is an internal Leaflet method
        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    } catch (error) {
        console.warn('Failed to fix Leaflet icons:', error);
    }
};

interface Property {
    _id: string;
    title: string;
    price: number;
    type: string;
    images: string[];
    isFeatured?: boolean;
    location: {
        coordinates: [number, number]; // [lng, lat]
    };
}

interface MapListingProps {
    properties: Property[];
    onBoundsChange: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
    highlightedId?: string | null;
    onMarkerClick?: (id: string) => void;
    flyToLocation?: [number, number] | null;
    onPromote?: (property: Property) => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

const getPropertyIcon = (type: string) => {
    const icons: { [key: string]: string } = {
        'Flat': '🏢',
        'House': '🏠',
        'PG': '🛏️',
        'Shop': '🏪',
        'Land': '🟩',
    };
    return icons[type] || '📍';
};

const createCustomIcon = (price: number, type: string, isHighlighted: boolean, isFeatured: boolean = false) => {
    const icon = getPropertyIcon(type);

    const baseClasses = isHighlighted
        ? 'bg-blue-600 text-white transform scale-125 z-50 border-blue-700'
        : isFeatured
            ? 'bg-yellow-100 text-yellow-800 border-yellow-500 z-40 scale-110' // Featured Style
            : 'bg-white text-gray-800 border-gray-300';

    const hoverClasses = isFeatured
        ? 'hover:bg-yellow-500 hover:text-white hover:border-yellow-600'
        : 'hover:bg-blue-600 hover:text-white hover:border-blue-700';

    const glowEffect = isFeatured ? 'shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'shadow-lg';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="${baseClasses} ${glowEffect} w-10 h-10 rounded-full border-2 font-bold transition-all duration-200 flex items-center justify-center relative group hover:scale-125 hover:z-50 ${hoverClasses}">
                <span class="text-xl leading-none">${icon}</span>
                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-inherit rotate-45 border-r-2 border-b-2 border-inherit"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 45],
    });
};

const createClusterCustomIcon = function (cluster: any) {
    const childCount = cluster.getChildCount();

    // Simple, clean marker structure
    return L.divIcon({
        html: `
            <div class="cluster-marker">
                <span>${childCount}</span>
            </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: L.point(40, 40, true),
    });
};

const MapController = ({
    onBoundsChange,
    flyToLocation
}: {
    onBoundsChange: (bounds: any) => void,
    flyToLocation?: [number, number] | null
}) => {
    const map = useMap();
    const isFlying = useRef(false);
    const lastFlownTo = useRef<string | null>(null);
    const onBoundsChangeRef = useRef(onBoundsChange);

    // Keep ref updated
    useEffect(() => {
        onBoundsChangeRef.current = onBoundsChange;
    }, [onBoundsChange]);

    useMapEvents({
        moveend: () => {
            if (isFlying.current) return;

            const bounds = map.getBounds();
            onBoundsChangeRef.current({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            });
        },
    });

    useEffect(() => {
        if (flyToLocation) {
            const lat = flyToLocation[0];
            const lng = flyToLocation[1];
            const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

            // If we already flew to this exact location, don't force it again
            if (lastFlownTo.current === key) return;

            lastFlownTo.current = key;
            isFlying.current = true;

            // Respect current zoom if it's detailed enough, otherwise zoom to 14
            const targetZoom = Math.max(map.getZoom(), 14);

            map.flyTo(flyToLocation, targetZoom, {
                duration: 1.5
            });

            // Reset flying flag after animation
            setTimeout(() => {
                isFlying.current = false;
                // Trigger update to sync bounds after move
                const bounds = map.getBounds();
                onBoundsChangeRef.current({
                    minLat: bounds.getSouth(),
                    maxLat: bounds.getNorth(),
                    minLng: bounds.getWest(),
                    maxLng: bounds.getEast(),
                });
            }, 1600);
        }
    }, [flyToLocation, map]);

    return null;
};

const PopupImageSlider = ({ images, title }: { images: string[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="mb-2 w-full h-32 relative overflow-hidden rounded-md bg-gray-100">
                <img
                    src={images[0]}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev: number) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="mb-2 w-full h-32 relative overflow-hidden rounded-md bg-gray-100 group">
            <img
                src={images[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Navigation Overlay */}
            <div className="absolute inset-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={prevImage}
                    className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all transform hover:scale-110"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={nextImage}
                    className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all transform hover:scale-110"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

// Marker Component
const PropertyMarker = ({ prop, isHighlighted, onMarkerClick }: { prop: Property, isHighlighted: boolean, onMarkerClick?: (id: string) => void }) => {
    const icon = createCustomIcon(prop.price, prop.type, isHighlighted, prop.isFeatured);

    return (
        <Marker
            position={[prop.location.coordinates[1], prop.location.coordinates[0]]}
            icon={icon}
        >
            <Popup className="custom-popup">
                <div
                    className="p-1 min-w-[220px] cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Decouple state update from Leaflet event to prevent React internal error
                        setTimeout(() => {
                            onMarkerClick && onMarkerClick(prop._id);
                        }, 0);
                    }}
                >
                    <PopupImageSlider images={prop.images} title={prop.title} />
                    <h3 className="font-bold text-sm mb-1">{prop.title}</h3>
                    <p className="text-blue-600 font-bold mb-2">{formatPrice(prop.price)}</p>
                    <button
                        className="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 font-medium"
                    >
                        View Details
                    </button>
                </div>
            </Popup>
        </Marker>
    );
};

export default function MapListing({
    properties,
    onBoundsChange,
    highlightedId,
    onMarkerClick,
    flyToLocation
}: MapListingProps) {

    return (
        <MapContainer
            center={[28.6139, 77.2090]}
            zoom={11}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <MapController onBoundsChange={onBoundsChange} flyToLocation={flyToLocation} />
            <MapControls />

            <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={40}
                iconCreateFunction={createClusterCustomIcon}
                polygonOptions={{
                    fillColor: '#2563eb',
                    color: '#2563eb',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.2
                }}
            >
                {properties.map((prop) => (
                    <PropertyMarker
                        key={prop._id}
                        prop={prop}
                        isHighlighted={prop._id === highlightedId}
                        onMarkerClick={onMarkerClick}
                    />
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}

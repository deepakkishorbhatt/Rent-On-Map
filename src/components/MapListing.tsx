'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapControls } from '@/components/MapControls';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
    _id: string;
    title: string;
    price: number;
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
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

const createCustomIcon = (price: number, isHighlighted: boolean) => {
    // Using Tailwind classes inside the HTML string
    return L.divIcon({
        className: 'custom-div-icon', // Use this class if you want specific CSS, but we rely on tailwind inside html
        html: `
            <div class="${isHighlighted ? 'bg-black text-white transform scale-110 z-50' : 'bg-white text-black'} 
                        px-3 py-1 rounded-full shadow-lg border border-gray-200 font-bold text-xs whitespace-nowrap transition-all duration-200 flex items-center justify-center relative group hover:scale-105 hover:bg-black hover:text-white hover:border-black hover:z-50">
                ${formatPrice(price)}
                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-inherit rotate-45 border-r border-b border-gray-200 group-hover:border-black"></div>
            </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 35],
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

    useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onBoundsChange({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            });
        },
    });

    useEffect(() => {
        if (flyToLocation) {
            map.flyTo(flyToLocation, 14, {
                duration: 1.5
            });
        }
    }, [flyToLocation, map]);

    return null;
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
                polygonOptions={{
                    fillColor: '#2563eb',
                    color: '#2563eb',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.2
                }}
            >
                {properties.map((prop) => (
                    <Marker
                        key={prop._id}
                        position={[prop.location.coordinates[1], prop.location.coordinates[0]]} // GeoJSON is [lng, lat], Leaflet is [lat, lng]
                        icon={createCustomIcon(prop.price, prop._id === highlightedId)}
                        eventHandlers={{
                            click: (e) => {
                                L.DomEvent.stopPropagation(e.originalEvent); // Prevent map click
                                onMarkerClick && onMarkerClick(prop._id);
                            },
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{prop.title}</h3>
                                <p className="text-blue-600 font-bold mb-2">{formatPrice(prop.price)}</p>
                                <button
                                    className="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 font-medium"
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('marker-contact', { detail: prop._id }));
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}

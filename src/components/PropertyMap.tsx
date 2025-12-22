'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
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

interface PropertyMapProps {
    lat: number;
    lng: number;
    viewTrigger: { lat: number; lng: number } | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationPicker({ position, onLocationSelect }: { position: { lat: number, lng: number }, onLocationSelect: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const latlng = marker.getLatLng();
                    onLocationSelect(latlng.lat, latlng.lng);
                }
            },
        }),
        [onLocationSelect],
    );

    // Using explicit ref type any because react-leaflet types vs leaflet types can be tricky
    const markerRef = useMemo<any>(() => ({ current: null }), []);

    // If position is valid (non-zero), show marker
    if (position.lat === 0 && position.lng === 0) return null;

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

function MapController({ viewTrigger }: { viewTrigger: { lat: number; lng: number } | null }) {
    const map = useMap();

    useEffect(() => {
        if (viewTrigger && viewTrigger.lat !== 0 && viewTrigger.lng !== 0) {
            map.flyTo([viewTrigger.lat, viewTrigger.lng], 16, {
                duration: 1.5
            });
        }
    }, [viewTrigger, map]);

    return null;
}

export default function PropertyMap({ lat, lng, viewTrigger, onLocationSelect }: PropertyMapProps) {
    return (
        <div style={{ height: '100%', width: '100%' }} className="rounded-lg overflow-hidden z-0">
            <MapContainer
                center={[20.5937, 78.9629]} // India center
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapController viewTrigger={viewTrigger} />
                <LocationPicker
                    position={{ lat: lat || 0, lng: lng || 0 }}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>
        </div>
    );
}

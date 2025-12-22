'use client';

import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Locate, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';

export function MapControls() {
    const map = useMap();
    const [locating, setLocating] = useState(false);

    const userMarkerRef = useRef<L.Marker | null>(null);

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    const handleLocate = () => {
        setLocating(true);
        map.locate({
            setView: true,
            maxZoom: 16,
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    };

    useEffect(() => {
        const onLocationFound = (e: L.LocationEvent) => {
            setLocating(false);

            // Remove existing marker if present
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
            }

            // Add new marker without accuracy circle
            const newMarker = L.marker(e.latlng)
                .addTo(map)
                .bindPopup("You are here")
                .openPopup();

            userMarkerRef.current = newMarker;
        };

        const onLocationError = (e: L.ErrorEvent) => {
            setLocating(false);
            alert(e.message);
        };

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        return () => {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
        };
    }, [map]);

    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <Button
                variant="outline"
                size="icon"
                className="bg-white hover:bg-gray-50 shadow-lg w-10 h-10"
                onClick={handleZoomIn}
                title="Zoom in"
            >
                <Plus size={20} />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="bg-white hover:bg-gray-50 shadow-lg w-10 h-10"
                onClick={handleZoomOut}
                title="Zoom out"
            >
                <Minus size={20} />
            </Button>

            <Button
                variant="outline"
                size="icon"
                className={`bg-white hover:bg-gray-50 shadow-lg w-10 h-10 ${locating ? 'bg-blue-50' : ''}`}
                onClick={handleLocate}
                disabled={locating}
                title="Show my location"
            >
                {locating ? (
                    <Loader2 size={20} className="text-blue-600 animate-spin" />
                ) : (
                    <Locate size={20} className="text-gray-700" />
                )}
            </Button>
        </div>
    );
}

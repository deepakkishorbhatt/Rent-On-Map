'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { PropertyDetails } from '@/components/PropertyDetails';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { LocationSearch } from '@/components/LocationSearch';
import { LoginModal } from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Move } from 'lucide-react';

// Dynamic import for Map
const MapListing = dynamic(() => import('@/components/MapListing'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-50">Loading Map...</div>,
});

interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    images: string[];
    features?: string[];
    ownerId: string;
    location: {
        coordinates: [number, number];
    };
}

export default function PropertySearch() {
    const { data: session } = useSession();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        type: '',
        minPrice: 5000,
        maxPrice: 100000,
        furnishing: '',
        tenantPreference: '',
    });
    const [currentBounds, setCurrentBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);

    // Saved Properties State
    const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Search as I Move State
    const [searchAsIMove, setSearchAsIMove] = useState(true);
    const [showSearchButton, setShowSearchButton] = useState(false);

    // Fetch saved properties on session change
    useEffect(() => {
        if (session?.user) {
            fetch('/api/user/saved')
                .then(res => res.json())
                .then(data => {
                    if (data.savedProperties) {
                        // Assuming API returns populated properties or objects with _id
                        // If it returns IDs directly check API response structure. 
                        // My API response: { savedProperties: [PropertyObject, ...] }
                        setSavedPropertyIds(new Set(data.savedProperties.map((p: any) => typeof p === 'string' ? p : p._id)));
                    }
                })
                .catch(err => console.error('Error fetching saved:', err));
        } else {
            setSavedPropertyIds(new Set());
        }
    }, [session]);

    const toggleSave = useCallback(async (propertyId: string) => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }

        const newSaved = new Set(savedPropertyIds);
        const isCurrentlySaved = newSaved.has(propertyId);

        if (isCurrentlySaved) {
            newSaved.delete(propertyId);
        } else {
            newSaved.add(propertyId);
        }
        setSavedPropertyIds(newSaved);

        try {
            await fetch('/api/user/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId }),
            });
        } catch (err) {
            console.error('Save failed', err);
            // Revert state if needed
            if (isCurrentlySaved) newSaved.add(propertyId);
            else newSaved.delete(propertyId);
            setSavedPropertyIds(new Set(newSaved));
        }
    }, [session, savedPropertyIds]);


    const fetchProperties = useCallback(async (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, currentFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                minLat: bounds.minLat.toString(),
                maxLat: bounds.maxLat.toString(),
                minLng: bounds.minLng.toString(),
                maxLng: bounds.maxLng.toString(),
                ...(currentFilters.type && { type: currentFilters.type }),
                minPrice: currentFilters.minPrice.toString(),
                maxPrice: currentFilters.maxPrice.toString(),
                ...(currentFilters.furnishing && { furnishing: currentFilters.furnishing }),
                ...(currentFilters.tenantPreference && { tenantPreference: currentFilters.tenantPreference }),
            });
            const res = await fetch(`/api/properties?${params}`);
            const data = await res.json();

            if (!res.ok) {
                console.error('API Error:', data.error);
                if (data.error && data.error.includes('IP that isn\'t whitelisted')) {
                    // Only alert once to avoid spamming
                    if (!window.sessionStorage.getItem('db_error_shown')) {
                        alert('Database Connection Error: Your IP is not whitelisted in MongoDB Atlas. Please check your Atlas security settings.');
                        window.sessionStorage.setItem('db_error_shown', 'true');
                    }
                }
                return;
            }

            if (data.properties) {
                setProperties(data.properties);
            }
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const onBoundsChange = useCallback((bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
        setCurrentBounds(bounds);
        if (searchAsIMove) {
            fetchProperties(bounds);
            setShowSearchButton(false);
        } else {
            setShowSearchButton(true);
        }
    }, [fetchProperties, searchAsIMove]);

    const handleSearchAreaClick = useCallback(() => {
        if (currentBounds) {
            fetchProperties(currentBounds);
            setShowSearchButton(false);
        }
    }, [currentBounds, fetchProperties]);

    const handleFilterChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);
        if (currentBounds) {
            fetchProperties(currentBounds, newFilters);
        }
    }, [currentBounds, fetchProperties]);

    const handleMarkerClick = useCallback((id: string) => {
        const prop = properties.find(p => p._id === id);
        if (prop) {
            setSelectedProperty(prop);
            setHighlightedId(id);
        }
    }, [properties]);

    const handleLocationSelect = useCallback((lat: number, lng: number, displayName: string) => {
        setMapCenter([lat, lng]);
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50">
            <Navbar
                centerContent={
                    <div className="flex items-center gap-3 w-full max-w-4xl">
                        <div className="flex-1 max-w-md">
                            <LocationSearch onLocationSelect={handleLocationSelect} />
                        </div>
                        <div className="hidden lg:flex items-center gap-2">
                            <FilterBar onFilterChange={handleFilterChange} />
                        </div>
                    </div>
                }
            />

            <div className="flex-1 relative overflow-hidden">
                {/* Fullscreen Map */}
                <div className="absolute inset-0">
                    <MapListing
                        properties={properties}
                        onBoundsChange={onBoundsChange}
                        highlightedId={highlightedId || undefined}
                        onMarkerClick={handleMarkerClick}
                        flyToLocation={mapCenter}
                    />
                </div>

                {/* Search Area Controls - Top Center */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
                    {showSearchButton && (
                        <Button
                            className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg gap-2 rounded-full px-6 transition-all animate-in fade-in slide-in-from-top-4"
                            onClick={handleSearchAreaClick}
                        >
                            <Search size={16} />
                            Search this area
                        </Button>
                    )}

                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border flex items-center gap-2">
                        <Checkbox
                            id="search-move"
                            checked={searchAsIMove}
                            onCheckedChange={(checked) => setSearchAsIMove(checked as boolean)}
                            className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor="search-move" className="text-xs font-medium cursor-pointer text-gray-700">
                            Search as I move
                        </Label>
                    </div>
                </div>

                {/* Mobile Filters - Floating */}
                <div className="lg:hidden absolute top-4 left-4 right-4 z-[1000]">
                    <div className="bg-white rounded-xl shadow-lg p-3">
                        <FilterBar onFilterChange={handleFilterChange} />
                    </div>
                </div>

                {/* Results Counter - Bottom Left */}
                {currentBounds && (
                    <div className="absolute bottom-6 left-6 z-[1000]">
                        <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
                            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                        </div>
                    </div>
                )}

                {/* Property Details Sheet */}
                <PropertyDetails
                    property={selectedProperty}
                    isOpen={!!selectedProperty}
                    onClose={() => {
                        setSelectedProperty(null);
                        setHighlightedId(null);
                    }}
                    isSaved={selectedProperty ? savedPropertyIds.has(selectedProperty._id) : false}
                    onToggleSave={() => selectedProperty && toggleSave(selectedProperty._id)}
                />
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
}

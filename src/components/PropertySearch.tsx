'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { PropertyDetails } from '@/components/PropertyDetails';
import { IconFilterBar, FilterState } from '@/components/IconFilterBar';
import { LocationSearch } from '@/components/LocationSearch';
import { LoginModal } from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Move } from 'lucide-react';
import { ActionSidebar } from '@/components/ActionSidebar';
import { PostPropertyModal } from '@/components/PostPropertyModal';
import { PromoteModal } from '@/components/PromoteModal';
import { useRouter, useSearchParams } from 'next/navigation';

// Dynamic import for Map
const MapListing = dynamic(() => import('@/components/MapListing'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-50">Loading Map...</div>,
}) as any;

interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    images: string[];
    features?: string[];
    ownerId: string;
    isFeatured?: boolean;
    location: {
        coordinates: [number, number];
    };
}

export default function PropertySearch() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const abortControllerRef = useRef<AbortController | null>(null);

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

    // Promote Modal State
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [propertyToPromote, setPropertyToPromote] = useState<Property | null>(null);

    // Initialize filters from URL params
    const [filters, setFilters] = useState<FilterState>({
        type: searchParams?.get('type') || '',
        minPrice: Number(searchParams?.get('minPrice')) || 5000,
        maxPrice: Number(searchParams?.get('maxPrice')) || 100000,
        furnishing: searchParams?.get('furnishing') || '',
        tenantPreference: searchParams?.get('tenantPreference') || '',
    });
    const [currentBounds, setCurrentBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);

    // Saved Properties State
    const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Search as I Move State
    const [searchAsIMove, setSearchAsIMove] = useState(true);
    const [showSearchButton, setShowSearchButton] = useState(false);

    // Post Property Modal State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

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
        // Cancel previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

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
            const res = await fetch(`/api/properties?${params}`, { signal: controller.signal });
            const data = await res.json();

            if (!res.ok) {
                console.error('API Error:', data.error);
                return;
            }

            if (data.properties) {
                // Sort properties: Featured first
                const sorted = data.properties.sort((a: any, b: any) => {
                    if (a.isFeatured === b.isFeatured) return 0;
                    return a.isFeatured ? -1 : 1;
                });
                setProperties(sorted);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);


    // Auto-Location on Mount
    useEffect(() => {
        // We always check on mount/refresh
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter([latitude, longitude]);
                    // Save as last known
                    localStorage.setItem('user_last_location', JSON.stringify({ lat: latitude, lng: longitude }));
                },
                (error) => {
                    console.log("Location access denied or error:", error);
                    // Fallback to saved location
                    const saved = localStorage.getItem('user_last_location');
                    if (saved) {
                        try {
                            const { lat, lng } = JSON.parse(saved);
                            if (lat && lng) setMapCenter([lat, lng]);
                        } catch (e) {
                            console.error("Error parsing saved location", e);
                        }
                    }
                }
            );
        } else {
            // Fallback if no geo API
            const saved = localStorage.getItem('user_last_location');
            if (saved) {
                try {
                    const { lat, lng } = JSON.parse(saved);
                    if (lat && lng) setMapCenter([lat, lng]);
                } catch (e) { console.error(e); }
            }
        }
    }, []);

    const onBoundsChange = useCallback((bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
        setCurrentBounds(bounds);

        // Save center as last known location
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const centerLng = (bounds.minLng + bounds.maxLng) / 2;
        localStorage.setItem('user_last_location', JSON.stringify({ lat: centerLat, lng: centerLng }));

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

        // Update URL
        const params = new URLSearchParams(window.location.search);
        if (newFilters.type) params.set('type', newFilters.type); else params.delete('type');
        if (newFilters.furnishing) params.set('furnishing', newFilters.furnishing); else params.delete('furnishing');
        if (newFilters.tenantPreference) params.set('tenantPreference', newFilters.tenantPreference); else params.delete('tenantPreference');

        // Only add price params if they differ from defaults
        if (newFilters.minPrice !== 5000) {
            params.set('minPrice', newFilters.minPrice.toString());
        } else {
            params.delete('minPrice');
        }
        if (newFilters.maxPrice !== 100000) {
            params.set('maxPrice', newFilters.maxPrice.toString());
        } else {
            params.delete('maxPrice');
        }

        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);

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

    const handlePromote = useCallback((property: Property) => {
        setPropertyToPromote(property);
        setIsPromoteModalOpen(true);
    }, []);

    const handleLocationSelect = useCallback((lat: number, lng: number, displayName: string) => {
        setMapCenter([lat, lng]);
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50">
            <Navbar
                centerContent={
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 min-w-0">
                            <LocationSearch onLocationSelect={handleLocationSelect} />
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
                        onPromote={handlePromote}
                    />
                </div>

                {/* Action Sidebar - Left Side */}
                <ActionSidebar onPostProperty={() => setIsPostModalOpen(true)} />

                {/* Search Area Controls - Top Center */}
                {session && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
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
                )}

                {/* Icon Filters - Floating Bottom Center */}
                {session && (
                    <div className="absolute bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-xl p-2">
                            <IconFilterBar onFilterChange={handleFilterChange} />
                        </div>
                    </div>
                )}

                {/* Results Counter - Bottom Left */}
                {session && currentBounds && (
                    <div className="absolute bottom-40 left-1/2 -translate-x-1/2 md:bottom-6 md:left-6 md:translate-x-0 z-[1000]">
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
                    onPromote={() => selectedProperty && handlePromote(selectedProperty)}
                />

                <PromoteModal
                    isOpen={isPromoteModalOpen}
                    onClose={() => setIsPromoteModalOpen(false)}
                    propertyId={propertyToPromote?._id || ''}
                    onSuccess={() => {
                        // Refresh properties to show updated status
                        if (currentBounds) fetchProperties(currentBounds);
                    }}
                />
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            <PostPropertyModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
            />
        </div>
    );
}

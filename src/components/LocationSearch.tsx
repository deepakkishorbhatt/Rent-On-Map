'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    importance: number;
    full_address?: string;
}

interface LocationSearchProps {
    onLocationSelect: (lat: number, lng: number, displayName: string) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | undefined>();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchLocation = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}&countrycodes=in&addressdetails=1&limit=10`,
                {
                    headers: {
                        'User-Agent': 'RentOnMap/1.0',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                }
            );

            if (response.ok) {
                const data: any[] = await response.json();

                // Map and filter results
                const formattedResults: NominatimResult[] = data.map((item: any) => {
                    return {
                        place_id: item.place_id,
                        display_name: item.display_name,
                        lat: item.lat,
                        lon: item.lon,
                        type: item.type,
                        importance: item.importance,
                        full_address: item.display_name
                    };
                });
                setResults(formattedResults);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Location search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce the search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchLocation(value);
        }, 500);
    };

    const handleSelectLocation = (result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setQuery(result.display_name);
        setShowResults(false);
        setResults([]);

        onLocationSelect(lat, lng, result.display_name);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    type="text"
                    placeholder="Search locations"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    className="pl-10 pr-10 h-11 bg-white shadow-md border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" size={18} />
                )}
                {!loading && query && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={handleClear}
                    >
                        <X size={16} />
                    </Button>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[2000]">
                    {results.map((result) => (
                        <button
                            key={result.place_id}
                            onClick={() => handleSelectLocation(result)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                        >
                            <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {result.display_name.split(',')[0]}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-2">
                                    {result.display_name.split(',').slice(1).join(',').trim().replace(/^,/, '')}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showResults && !loading && query.length >= 3 && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[2000]">
                    <p className="text-sm text-gray-500 text-center">No locations found</p>
                </div>
            )}
        </div>
    );
}

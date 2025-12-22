'use client';

import { memo } from 'react';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { PropertyCard } from '@/components/PropertyCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';

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

interface PropertyListProps {
    properties: Property[];
    loading: boolean;
    highlightedId: string | null;
    onCardHover: (id: string | null) => void;
    onCardClick: (property: Property) => void;
    onFilterChange: (filters: FilterState) => void;
    currentBounds: boolean;
    className?: string;
}

const PropertyList = memo(function PropertyList({
    properties,
    loading,
    highlightedId,
    onCardHover,
    onCardClick,
    onFilterChange,
    currentBounds,
    className
}: PropertyListProps) {
    return (
        <div className={`flex flex-col h-full bg-white border-r z-10 ${className}`}>
            {/* Fixed Header Section */}
            <div className="flex-none">
                <FilterBar onFilterChange={onFilterChange} />
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <h1 className="text-xl font-bold">Stays in New Delhi</h1>
                    <span className="text-sm text-muted-foreground">{properties.length} results</span>
                </div>
            </div>

            {/* Scrollable Content Section - hide scrollbar to prevent layout shift */}
            <div className="flex-1 overflow-y-scroll p-4 pt-0 space-y-6 hide-scrollbar">
                <div className="grid grid-cols-1 gap-6 pb-20 md:pb-0">
                    {loading && properties.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        <>
                            {properties.length === 0 && !loading && (
                                <div className="text-center py-10 text-gray-500">
                                    {currentBounds ? "No properties match your filters." : "Move the map to find properties."}
                                </div>
                            )}
                            {properties.map((prop) => (
                                <div
                                    key={prop._id}
                                    id={`card-${prop._id}`}
                                    onMouseEnter={() => onCardHover(prop._id)}
                                    onMouseLeave={() => onCardHover(null)}
                                    // Removed scale transform to reduce paint thrashing potential
                                    className={`transition-all duration-300 ${highlightedId === prop._id ? 'ring-2 ring-black ring-offset-2 rounded-lg bg-gray-50' : ''}`}
                                >
                                    <PropertyCard
                                        property={prop}
                                        onClick={() => onCardClick(prop)}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default PropertyList;

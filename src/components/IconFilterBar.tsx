'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Building, DollarSign, Sofa, Users, X } from 'lucide-react';

export interface FilterState {
    type: string;
    minPrice: number;
    maxPrice: number;
    furnishing: string;
    tenantPreference: string;
}

interface IconFilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

export function IconFilterBar({ onFilterChange, initialFilters }: IconFilterBarProps) {
    const [type, setType] = useState<string>(initialFilters?.type || 'all');
    const [priceRange, setPriceRange] = useState([
        initialFilters?.minPrice || 5000,
        initialFilters?.maxPrice || 100000
    ]);
    const [furnishing, setFurnishing] = useState<string>(initialFilters?.furnishing || 'all');
    const [tenantPreference, setTenantPreference] = useState<string>(initialFilters?.tenantPreference || 'all');

    // Helper to get current state for callbacks
    const getCurrentFilters = (overrides: Partial<FilterState> = {}) => ({
        type: type === 'all' ? '' : type,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        furnishing: furnishing === 'all' ? '' : furnishing,
        tenantPreference: tenantPreference === 'all' ? '' : tenantPreference,
        ...overrides
    });

    const handleTypeChange = (val: string) => {
        setType(val);
        onFilterChange(getCurrentFilters({ type: val === 'all' ? '' : val }));
    };

    const handleFurnishingChange = (val: string) => {
        setFurnishing(val);
        onFilterChange(getCurrentFilters({ furnishing: val === 'all' ? '' : val }));
    };

    const handleTenantChange = (val: string) => {
        setTenantPreference(val);
        onFilterChange(getCurrentFilters({ tenantPreference: val === 'all' ? '' : val }));
    };

    // Debounce PRICE changes only
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only fire if price actually changed from initial or previous commit
            // For now just fire it. The parent can dedup if needed.
            onFilterChange(getCurrentFilters());
        }, 500);
        return () => clearTimeout(timer);
    }, [priceRange]);

    // Clear filters
    const clearFilters = () => {
        setType('all');
        setPriceRange([5000, 100000]);
        setFurnishing('all');
        setTenantPreference('all');
        onFilterChange({
            type: '',
            minPrice: 5000,
            maxPrice: 100000,
            furnishing: '',
            tenantPreference: ''
        });
    };

    const hasActiveFilters = type !== 'all' || priceRange[0] > 5000 || priceRange[1] < 100000 || furnishing !== 'all' || tenantPreference !== 'all';

    return (
        <div className="flex items-center justify-center gap-3">
            {/* Type Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all ${type !== 'all' ? 'bg-blue-50 border-blue-400 text-blue-700' : ''}`}
                        title="Property Type"
                    >
                        <Building size={20} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 z-[2000]" side="top" align="center" sideOffset={12}>
                    <Select value={type} onValueChange={handleTypeChange}>
                        <SelectTrigger className="w-full [&_svg]:rotate-180">
                            <SelectValue placeholder="Property Type" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="top" className="z-[2100]" collisionPadding={10} sideOffset={-40}>
                            <SelectItem value="all">
                                <span className="flex items-center gap-2">
                                    <span>📋</span>
                                    <span>Any Type</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="Flat">
                                <span className="flex items-center gap-2">
                                    <span>🏢</span>
                                    <span>Flat</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="House">
                                <span className="flex items-center gap-2">
                                    <span>🏠</span>
                                    <span>House</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="PG">
                                <span className="flex items-center gap-2">
                                    <span>🛏️</span>
                                    <span>PG</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="Shop">
                                <span className="flex items-center gap-2">
                                    <span>🏪</span>
                                    <span>Shop</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="Land">
                                <span className="flex items-center gap-2">
                                    <span>🟩</span>
                                    <span>Land</span>
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </PopoverContent>
            </Popover>

            {/* Price Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all ${priceRange[0] > 5000 || priceRange[1] < 100000 ? 'bg-blue-50 border-blue-400 text-blue-700' : ''}`}
                        title="Price Range"
                    >
                        <DollarSign size={20} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 z-[2000]" side="top" align="center" sideOffset={12}>
                    <div className="space-y-4">
                        <h4 className="font-semibold leading-none">Price Range</h4>
                        <div className="pt-4">
                            <Slider
                                defaultValue={[5000, 100000]}
                                value={priceRange}
                                min={5000}
                                max={100000}
                                step={1000}
                                onValueChange={setPriceRange} // Keep setting state directly, effect handles debounce
                                className="my-4"
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Furnishing Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all ${furnishing !== 'all' ? 'bg-blue-50 border-blue-400 text-blue-700' : ''}`}
                        title="Furnishing"
                    >
                        <Sofa size={20} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 z-[2000]" side="top" align="center" sideOffset={12}>
                    <Select value={furnishing} onValueChange={handleFurnishingChange}>
                        <SelectTrigger className="w-full [&_svg]:rotate-180">
                            <SelectValue placeholder="Furnishing" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="top" className="z-[2100]" collisionPadding={10} sideOffset={-40}>
                            <SelectItem value="all">Any Furnishing</SelectItem>
                            <SelectItem value="Full">Fully Furnished</SelectItem>
                            <SelectItem value="Semi">Semi Furnished</SelectItem>
                            <SelectItem value="None">Unfurnished</SelectItem>
                        </SelectContent>
                    </Select>
                </PopoverContent>
            </Popover>

            {/* Tenant Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-12 w-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all ${tenantPreference !== 'all' ? 'bg-blue-50 border-blue-400 text-blue-700' : ''}`}
                        title="Tenant Preference"
                    >
                        <Users size={20} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 z-[2000]" side="top" align="center" sideOffset={12}>
                    <Select value={tenantPreference} onValueChange={handleTenantChange}>
                        <SelectTrigger className="w-full [&_svg]:rotate-180">
                            <SelectValue placeholder="Tenant Type" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="top" className="z-[2100]" collisionPadding={10} sideOffset={-40}>
                            <SelectItem value="all">Any Tenant</SelectItem>
                            <SelectItem value="Family">Family</SelectItem>
                            <SelectItem value="Bachelors">Bachelors</SelectItem>
                            <SelectItem value="Any">Any</SelectItem>
                        </SelectContent>
                    </Select>
                </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    className="h-12 w-12 rounded-full hover:bg-red-50 text-red-600"
                    title="Clear Filters"
                >
                    <X size={20} />
                </Button>
            )}
        </div>
    );
}

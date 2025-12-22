'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export interface FilterState {
    type: string;
    minPrice: number;
    maxPrice: number;
    furnishing: string;
    tenantPreference: string;
}

interface FilterBarProps {
    onFilterChange: (filters: FilterState) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
    const [type, setType] = useState<string>('all');
    const [priceRange, setPriceRange] = useState([5000, 100000]);
    const [furnishing, setFurnishing] = useState<string>('all');
    const [tenantPreference, setTenantPreference] = useState<string>('all');

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({
                type: type === 'all' ? '' : type,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                furnishing: furnishing === 'all' ? '' : furnishing,
                tenantPreference: tenantPreference === 'all' ? '' : tenantPreference,
            });
        }, 500); // 500ms delay to avoid excessive API calls while sliding

        return () => clearTimeout(timer);
    }, [type, priceRange, furnishing, tenantPreference, onFilterChange]);

    const clearFilters = () => {
        setType('all');
        setPriceRange([5000, 100000]);
        setFurnishing('all');
        setTenantPreference('all');
    };

    const hasActiveFilters = type !== 'all' || priceRange[0] > 5000 || priceRange[1] < 100000 || furnishing !== 'all' || tenantPreference !== 'all';

    return (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {/* Type Filter */}
            <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[130px] rounded-full h-9 text-xs font-medium border-gray-300">
                    <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    <SelectItem value="Flat">Flat</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="Shop">Shop</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
            </Select>

            {/* Price Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={`rounded-full h-9 text-xs font-medium border-gray-300 ${priceRange[0] > 5000 || priceRange[1] < 100000 ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}>
                        {priceRange[0] > 5000 || priceRange[1] < 100000
                            ? `₹${priceRange[0] / 1000}k - ₹${priceRange[1] / 1000}k`
                            : 'Price Range'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold leading-none">Price Range</h4>
                        <div className="pt-4">
                            <Slider
                                defaultValue={[5000, 100000]}
                                value={priceRange}
                                min={5000}
                                max={100000}
                                step={1000}
                                onValueChange={setPriceRange}
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
            <Select value={furnishing} onValueChange={setFurnishing}>
                <SelectTrigger className="w-[140px] rounded-full h-9 text-xs font-medium border-gray-300">
                    <SelectValue placeholder="Furnishing" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Any Furnishing</SelectItem>
                    <SelectItem value="Full">Fully Furnished</SelectItem>
                    <SelectItem value="Semi">Semi Furnished</SelectItem>
                    <SelectItem value="None">Unfurnished</SelectItem>
                </SelectContent>
            </Select>

            {/* Tenant Filter */}
            <Select value={tenantPreference} onValueChange={setTenantPreference}>
                <SelectTrigger className="w-[140px] rounded-full h-9 text-xs font-medium border-gray-300">
                    <SelectValue placeholder="Tenant Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Any Tenant</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Bachelors">Bachelors</SelectItem>
                    <SelectItem value="Any">Any</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    className="h-9 w-9 rounded-full ml-auto hover:bg-gray-100"
                >
                    <X size={16} />
                </Button>
            )}
        </div>
    );
}

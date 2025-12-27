'use client';

import { useState } from 'react';
import { Bed, Bath, UtensilsCrossed, Sofa, Users, Trees, Car, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoomSelection {
    bedrooms: number;
    bathrooms: number;
    kitchen: boolean;
    livingRoom: boolean;
    diningRoom: boolean;
    balconies: number;
    parking: boolean;
    garden: boolean;
}

interface FloorPlanSelectorProps {
    selectedRooms: RoomSelection;
    onRoomSelect: (roomType: keyof RoomSelection, action: 'add' | 'remove' | 'toggle') => void;
    readOnly?: boolean;
}

export function FloorPlanSelector({ selectedRooms, onRoomSelect, readOnly = false }: FloorPlanSelectorProps) {
    const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
    const [clickCount, setClickCount] = useState(0);

    const rooms = [
        { id: 'bedrooms', label: 'Bedrooms', icon: Bed, color: 'bg-blue-100 hover:bg-blue-200', borderColor: 'border-blue-400', countable: true, max: 10 },
        { id: 'bathrooms', label: 'Bathrooms', icon: Bath, color: 'bg-purple-100 hover:bg-purple-200', borderColor: 'border-purple-400', countable: true, max: 5 },
        { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed, color: 'bg-orange-100 hover:bg-orange-200', borderColor: 'border-orange-400', countable: false },
        { id: 'livingRoom', label: 'Living Room', icon: Sofa, color: 'bg-green-100 hover:bg-green-200', borderColor: 'border-green-400', countable: false },
        { id: 'diningRoom', label: 'Dining Room', icon: Users, color: 'bg-yellow-100 hover:bg-yellow-200', borderColor: 'border-yellow-400', countable: false },
        { id: 'balconies', label: 'Balconies', icon: Home, color: 'bg-teal-100 hover:bg-teal-200', borderColor: 'border-teal-400', countable: true, max: 4 },
        { id: 'parking', label: 'Parking', icon: Car, color: 'bg-gray-100 hover:bg-gray-200', borderColor: 'border-gray-400', countable: false },
        { id: 'garden', label: 'Garden', icon: Trees, color: 'bg-emerald-100 hover:bg-emerald-200', borderColor: 'border-emerald-400', countable: false },
    ];

    const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>, roomId: string, countable: boolean, max?: number) => {
        if (readOnly) return;
        const key = roomId as keyof RoomSelection;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Define click zones: Left 50% = Remove (Red), Right 50% = Add (Green)
        const isRemoveAction = x < width / 2;

        if (countable) {
            const currentValue = selectedRooms[key] as number;

            if (isRemoveAction) {
                // Red Zone (Left) - Subtract/Remove
                if (currentValue > 0) {
                    onRoomSelect(key, 'remove');
                }
            } else {
                // Green Zone (Right) - Add
                if (currentValue < (max || 10)) {
                    onRoomSelect(key, 'add');
                }
            }
        } else {
            // For non-countable (toggle) rooms, both sides just toggle, 
            // BUT let's stick to the gradient logic: Red = Off, Green = On
            // Or simple toggle since "Subtracting" from boolean doesn't make sense other than "Off"
            if (isRemoveAction) {
                if (selectedRooms[key]) onRoomSelect(key, 'toggle'); // Turn off if on
            } else {
                if (!selectedRooms[key]) onRoomSelect(key, 'toggle'); // Turn on if off
            }
        }
    };

    const getRoomValue = (roomId: string) => {
        const key = roomId as keyof RoomSelection;
        return selectedRooms[key];
    };

    const visibleRooms = readOnly
        ? rooms.filter(room => {
            const value = getRoomValue(room.id);
            return room.countable ? (value as number) > 0 : value === true;
        })
        : rooms;

    if (readOnly && visibleRooms.length === 0) return null;

    return (
        <div className="space-y-4">
            {!readOnly && (
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Select Rooms</h3>
                    <p className="text-sm text-muted-foreground">
                        Tap Left (Red) to Remove • Tap Right (Green) to Add
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleRooms.map((room) => {
                    const Icon = room.icon;
                    const value = getRoomValue(room.id);
                    const count = room.countable ? (value as number) : (value ? 1 : 0);
                    const isSelected = count > 0;

                    return (
                        <div
                            key={room.id}
                            className={`
                                relative h-24 rounded-xl border-2 transition-all duration-200 overflow-hidden select-none
                                ${!readOnly ? 'cursor-pointer active:scale-95' : ''}
                                ${isSelected ? 'border-gray-300 shadow-md transform scale-105' : 'border-gray-200 hover:border-gray-300'}
                            `}
                            onClick={(e) => handleGradientClick(e, room.id, room.countable, room.max)}
                            style={{
                                background: isSelected
                                    ? (readOnly ? '#f0f9ff' : 'linear-gradient(90deg, #fee2e2 0%, #dcfce7 100%)')
                                    : 'linear-gradient(90deg, #fff1f2 0%, #f0fdf4 100%)',
                                borderColor: isSelected ? (readOnly ? '#bae6fd' : '') : '' // Let CSS handle border for interactive
                            }}
                        >
                            {/* Content Centered */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                                <Icon className={`w-8 h-8 mb-1 ${isSelected ? 'text-gray-700' : 'text-gray-400'}`} />
                                <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {room.label}
                                </span>
                            </div>

                            {/* Count Badge (always shown if > 0) */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 z-20">
                                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 h-6 min-w-[1.5rem] flex items-center justify-center">
                                        {room.countable ? count : '✓'}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!readOnly && (
                <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 text-center">
                    <span className="font-semibold text-red-500">← Red (Remove)</span>
                    <span className="mx-2">|</span>
                    <span className="font-semibold text-green-600">Green (Add) →</span>
                </div>
            )}
        </div>
    );
}

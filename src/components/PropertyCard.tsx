'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin, Home, IndianRupee, Heart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface PropertyCardProps {
    property: {
        _id: string;
        title: string;
        description: string;
        price: number;
        type: string;
        images: string[];
        features?: string[]; // e.g., ["Family Only", "Fully Furnished"]
        location: {
            coordinates: [number, number];
        };
        isFeatured?: boolean;
    };
    onClick?: () => void;
    isSaved?: boolean;
    onToggleSave?: (id: string) => void;
    isOwner?: boolean;
    onEdit?: (property: any) => void;
    onDelete?: (id: string) => void;
    onPromote?: (property: any) => void;

    // Selection support
    selected?: boolean;
    onSelect?: () => void;
}

export function PropertyCard({ property, onClick, isSaved, onToggleSave, isOwner, onEdit, onDelete, onPromote, selected, onSelect }: PropertyCardProps) {
    // Format price to Indian formatting (e.g., 25,000)
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(property.price);

    // Default features if none provided (for MVP display)
    const features = property.features || ['Family Only', 'Fully Furnished'];

    return (
        <Card
            className={`overflow-hidden group hover:shadow-lg transition-all duration-300 w-full cursor-pointer
                ${selected ? 'ring-2 ring-blue-600' : ''}
                ${property.isFeatured ? 'border-2 border-yellow-400 shadow-md ring-1 ring-yellow-400/50' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="p-0 relative">
                <Carousel className="w-full">
                    <CarouselContent>
                        {property.images.length > 0 ? (
                            property.images.map((img, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`${property.title} - Image ${index + 1}`}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem>
                                <div className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-gray-400">
                                    No Image Available
                                </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    {property.images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
                            <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
                        </>
                    )}
                </Carousel>

                {/* Badges Container - Top Left */}
                <div className="absolute top-2 left-2 flex flex-col gap-2 z-10 items-start">
                    {!isOwner && onSelect && (
                        <div onClick={(e) => e.stopPropagation()} className="mb-1">
                            <Checkbox
                                checked={selected}
                                onCheckedChange={(c) => onSelect()}
                                className="h-5 w-5 bg-white/90 border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm"
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {property.isFeatured && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-sm flex items-center gap-1">
                                <span className="text-xs">✨ Featured</span>
                            </Badge>
                        )}

                        {!isOwner ? (
                            <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm hover:bg-white">
                                {property.type}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-blue-600 text-white backdrop-blur-sm shadow-sm">
                                Your Listing
                            </Badge>
                        )}
                    </div>
                </div>

                {!isOwner && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-white/50 hover:bg-white/80 backdrop-blur-sm rounded-full h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave?.(property._id);
                        }}
                    >
                        <Heart className={isSaved ? "fill-red-500 text-red-500" : "text-gray-700"} size={18} />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1 mr-2" title={property.title}>
                        {property.title}
                    </h3>
                    <div className="text-blue-600 font-bold whitespace-nowrap">
                        {formattedPrice}
                    </div>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">
                        {/* We don't have exact address, so showing placeholder or lat/lng name */}
                        Near Coordinate {property.location.coordinates[1].toFixed(2)}, {property.location.coordinates[0].toFixed(2)}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {features.slice(0, 3).map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                            {feature}
                        </Badge>
                    ))}
                    {features.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-gray-50">
                            +{features.length - 3} more
                        </Badge>
                    )}
                </div>
            </CardContent>
            {isOwner && (
                <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                    {!property.isFeatured && (
                        <Button
                            className="col-span-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 border-0"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPromote?.(property);
                            }}
                        >
                            Promote Property
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className={property.isFeatured ? "col-span-1" : "col-span-1"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(property);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className={property.isFeatured ? "col-span-1" : "col-span-1"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(property._id);
                        }}
                    >
                        Delete
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

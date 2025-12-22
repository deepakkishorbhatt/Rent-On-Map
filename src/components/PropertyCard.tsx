'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin, Home, IndianRupee, Heart } from 'lucide-react';

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
    };
    onClick?: () => void;
    isSaved?: boolean;
    onToggleSave?: (id: string) => void;
}

export function PropertyCard({ property, onClick, isSaved, onToggleSave }: PropertyCardProps) {
    // Format price to Indian formatting (e.g., 25,000)
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(property.price);

    // Default features if none provided (for MVP display)
    const features = property.features || ['Family Only', 'Fully Furnished'];

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 w-full cursor-pointer" onClick={onClick}>
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

                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                    <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm hover:bg-white">
                        {property.type}
                    </Badge>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/50 hover:bg-white/80 backdrop-blur-sm rounded-full h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave?.(property._id);
                    }}
                >
                    <Heart
                        size={18}
                        className={isSaved ? "fill-red-500 text-red-500" : "text-gray-700"}
                    />
                </Button>
            </CardHeader>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{property.title}</h3>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">Near City Center, Dehradun</span> {/* Placeholder for Geocoded address */}
                </div>

                <div className="flex gap-2 mb-3 overflow-hidden">
                    {features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-gray-600 font-normal shrink-0">
                            {feature}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex items-center text-primary font-bold text-xl">
                        {formattedPrice}
                        <span className="text-gray-500 text-sm font-normal ml-1">/mo</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">View Details</Button>
            </CardFooter>
        </Card>
    );
}

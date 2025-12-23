'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: any[]; // Using any to avoid strict type issues with mix of old/new fields
}

const CompareImageSlider = ({ images, title }: { images: string[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const validImages = images && images.length > 0 ? images : ['/placeholder.png'];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    if (validImages.length <= 1) {
        return (
            <div className="h-32 w-full relative rounded-md overflow-hidden bg-gray-100">
                <img
                    src={validImages[0]}
                    alt={title}
                    className="object-cover w-full h-full"
                />
            </div>
        );
    }

    return (
        <div className="h-32 w-full relative rounded-md overflow-hidden bg-gray-100 group">
            <img
                src={validImages[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className="object-cover w-full h-full transition-transform duration-300"
            />

            {/* Controls */}
            <div className="absolute inset-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={prevImage}
                    className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={nextImage}
                    className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-[2px]">
                {validImages.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export function CompareModal({ isOpen, onClose, properties }: CompareModalProps) {
    if (!properties || properties.length === 0) return null;

    // Helper to format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Helper to render boolean/check values
    const renderBoolean = (val: boolean) => {
        return val ? <Check className="text-green-500 mx-auto" size={20} /> : <Minus className="text-gray-300 mx-auto" size={20} />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Compare Properties</DialogTitle>
                </DialogHeader>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 text-left bg-gray-50 min-w-[150px]">Feature</th>
                                {properties.map(p => (
                                    <th key={p._id} className="p-2 min-w-[200px] border-l">
                                        <div className="flex flex-col items-center gap-2">
                                            <CompareImageSlider images={p.images} title={p.title} />
                                            <span className="text-sm font-bold text-center line-clamp-2">{p.title}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {/* Price */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50">Price</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center font-bold text-blue-600 border-l">
                                        {formatPrice(p.price)}
                                    </td>
                                ))}
                            </tr>

                            {/* Type */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50">Type</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center border-l">
                                        {p.type}
                                    </td>
                                ))}
                            </tr>

                            {/* Configuration */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50">Configuration</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center border-l">
                                        {p.bedrooms ? `${p.bedrooms} BHK` : '-'}
                                        {p.bathrooms ? ` • ${p.bathrooms} Bath` : ''}
                                    </td>
                                ))}
                            </tr>

                            {/* Area */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50">Area</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center border-l">
                                        {p.area ? `${p.area} sq ft` : '-'}
                                    </td>
                                ))}
                            </tr>

                            {/* Contact */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50">Contact</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center border-l">
                                        {p.contactNumber ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-400">Hidden</Badge>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Verification */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50">Verified Owner</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center border-l">
                                        {(p.ownerId?.isVerified || p.isVerified) ? renderBoolean(true) : renderBoolean(false)}
                                    </td>
                                ))}
                            </tr>

                            {/* Features / Amenities */}
                            <tr>
                                <td className="p-3 font-semibold text-gray-700 bg-gray-50 align-top">Features</td>
                                {properties.map(p => (
                                    <td key={p._id} className="p-3 text-center border-l align-top">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {p.features?.map((f: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {f}
                                                </Badge>
                                            )) || '-'}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
}

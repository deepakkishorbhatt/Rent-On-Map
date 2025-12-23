'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator"; // You might need to install this or use <hr />
import { MessageCircle, Share2, MapPin, Navigation, Heart, Phone, BedDouble, Bath, Ruler, CheckCircle2, Sparkles } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChatDrawer } from "@/components/ChatDrawer";
import { LoginModal } from "@/components/LoginModal";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    images: string[];
    features?: string[];
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    contactNumber?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    ownerId: {
        _id: string;
        name: string;
        email: string;
        image?: string;
        isVerified?: boolean;
    } | string; // Handle both populated and unpopulated cases
    location: {
        coordinates: [number, number];
    };
}

interface PropertyDetailsProps {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
    isSaved?: boolean;
    onToggleSave?: () => void;
    onPromote?: () => void;
}

export function PropertyDetails({ property, isOpen, onClose, isSaved, onToggleSave, onPromote }: PropertyDetailsProps) {
    if (!property) return null;

    const { data: session } = useSession();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [chatLoading, setChatLoading] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(property.price);

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: property.title,
                    text: `Check out this ${property.type} for rent: ${property.title} at ${formattedPrice}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            alert("Share not supported on this browser");
        }
    };

    const openGoogleMaps = () => {
        const [lng, lat] = property.location.coordinates;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const handleChat = async () => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }

        setChatLoading(true);
        try {
            // Ensure ownerId is an object (populated)
            const ownerId = typeof property.ownerId === 'string' ? property.ownerId : property.ownerId._id;

            const res = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property._id,
                    ownerId: ownerId
                })
            });
            const data = await res.json();
            if (data.conversationId) {
                setConversationId(data.conversationId);
                setIsChatOpen(true);
            } else {
                alert("Failed to start chat");
            }
        } catch (error) {
            console.error(error);
            alert("Error starting chat");
        } finally {
            setChatLoading(false);
        }
    };

    const ownerName = typeof property.ownerId === 'object' && property.ownerId !== null && 'name' in property.ownerId ? property.ownerId.name : 'Owner';

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto p-0 sm:p-0">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Property Details: {property.title}</SheetTitle>
                        <SheetDescription>Details about the property {property.title}</SheetDescription>
                    </SheetHeader>
                    {/* Gallery */}
                    <div className="relative h-64 sm:h-80 w-full bg-gray-100 group">
                        <Carousel className="w-full h-full">
                            <CarouselContent>
                                {property.images.length > 0 ? (
                                    property.images.map((img, index) => (
                                        <CarouselItem key={index} className="h-64 sm:h-80 cursor-pointer" onClick={() => setLightboxIndex(index)}>
                                            <img
                                                src={img}
                                                alt={`Image ${index + 1}`}
                                                className="w-full h-full object-cover transition-opacity hover:opacity-90"
                                            />
                                        </CarouselItem>
                                    ))
                                ) : (
                                    <CarouselItem className="h-64 sm:h-80 flex items-center justify-center">
                                        <span className="text-gray-400">No Images</span>
                                    </CarouselItem>
                                )}
                            </CarouselContent>
                            {property.images.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                                        {property.images.length} Photos
                                    </div>
                                </>
                            )}
                        </Carousel>
                    </div>

                    {/* Lightbox Overlay */}
                    {lightboxIndex !== null && (
                        <div
                            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
                            onClick={() => setLightboxIndex(null)}
                        >
                            <Button
                                variant="ghost"
                                className="absolute top-4 right-4 text-white hover:bg-white/10 z-[101]"
                                onClick={() => setLightboxIndex(null)}
                            >
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </Button>

                            <div
                                className="relative max-h-screen max-w-7xl w-full h-full flex items-center justify-center p-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {property.images.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-12 w-12 p-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxIndex((prev) => (prev !== null ? (prev - 1 + property.images.length) % property.images.length : 0));
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    </Button>
                                )}

                                <img
                                    src={property.images[lightboxIndex]}
                                    alt={`Full screen ${lightboxIndex + 1}`}
                                    className="max-h-[85vh] max-w-[90vw] object-contain rounded-md shadow-2xl"
                                />

                                {property.images.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full h-12 w-12 p-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxIndex((prev) => (prev !== null ? (prev + 1) % property.images.length : 0));
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                    </Button>
                                )}

                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                                    {lightboxIndex + 1} / {property.images.length}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 space-y-6">
                        {/* Header Info */}
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <Badge variant="secondary" className="mb-2">{property.type}</Badge>
                                    <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
                                    <div className="flex items-center text-gray-500 mt-1">
                                        <MapPin size={16} className="mr-1" />
                                        <span>Near {property.location.coordinates[1].toFixed(4)}, {property.location.coordinates[0].toFixed(4)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-2xl font-bold text-blue-600">{formattedPrice}</span>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline" className="rounded-full" onClick={handleShare}>
                                            <Share2 size={18} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className={`rounded-full ${isSaved ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                                            onClick={onToggleSave}
                                        >
                                            <Heart size={18} className={isSaved ? "fill-current" : ""} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 my-4">
                                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                                    <BedDouble className="text-blue-500 mb-1" size={24} />
                                    <span className="font-semibold text-gray-900">{property.bedrooms || '-'}</span>
                                    <span className="text-xs text-gray-500">Bedrooms</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                                    <Bath className="text-blue-500 mb-1" size={24} />
                                    <span className="font-semibold text-gray-900">{property.bathrooms || '-'}</span>
                                    <span className="text-xs text-gray-500">Bathrooms</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                                    <Ruler className="text-blue-500 mb-1" size={24} />
                                    <span className="font-semibold text-gray-900">{property.area || '-'}</span>
                                    <span className="text-xs text-gray-500">Sq Ft</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {property.description}
                            </p>
                        </div>

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Features</h3>
                                <div className="flex flex-wrap gap-2">
                                    {property.features.map((feature, index) => (
                                        <Badge key={index} variant="outline" className="px-3 py-1">
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Owner Info & Contact Actions */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Posted By</h3>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={typeof property.ownerId === 'object' && property.ownerId !== null && 'image' in property.ownerId ? property.ownerId.image : undefined} />
                                    <AvatarFallback>{ownerName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-gray-900 flex items-center gap-1">
                                        {ownerName}
                                        {(typeof property.ownerId === 'object' && property.ownerId !== null && 'isVerified' in property.ownerId && property.ownerId.isVerified) && (
                                            <CheckCircle2 size={16} className="text-blue-500" fill="currentColor" color="white" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">Property Owner</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {/* Chat Button */}
                                <Button
                                    onClick={handleChat}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11"
                                    disabled={chatLoading}
                                >
                                    {chatLoading ? <Loader2 className="animate-spin" size={18} /> : <MessageCircle size={18} />}
                                    Chat
                                </Button>

                                {/* WhatsApp Button */}
                                {property.contactNumber ? (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11"
                                        onClick={() => window.open(`https://wa.me/${property.contactNumber?.replace(/\D/g, '')}`, '_blank')}
                                    >
                                        <MessageCircle size={18} />
                                        WhatsApp
                                    </Button>
                                ) : (
                                    <Button disabled variant="outline" className="w-full h-11 text-gray-400">
                                        No Contact
                                    </Button>
                                )}
                            </div>

                            {/* Call Button */}
                            {property.contactNumber && (
                                <Button
                                    variant="outline"
                                    className="w-full mt-3 h-11 gap-2 border-gray-300"
                                    onClick={() => window.open(`tel:${property.contactNumber}`, '_self')}
                                >
                                    <Phone size={18} className="text-gray-600" />
                                    Call {property.contactNumber}
                                </Button>
                            )}

                            {/* Promote Button (Owner Only) */}
                            {session?.user?.email &&
                                (typeof property.ownerId === 'object' ? property.ownerId.email === session.user.email : false) &&
                                !property.isFeatured && (
                                    <Button
                                        className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white gap-2 h-11 border-0"
                                        onClick={onPromote}
                                    >
                                        <Sparkles size={18} />
                                        Promote Property
                                    </Button>
                                )}
                        </div>

                        {/* Location */}
                        <div className="pb-6">
                            <Button className="w-full" variant="secondary" onClick={openGoogleMaps}>
                                <Navigation className="mr-2 h-4 w-4" />
                                Get Directions
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <ChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                conversationId={conversationId}
                recipientName={ownerName}
            />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
}

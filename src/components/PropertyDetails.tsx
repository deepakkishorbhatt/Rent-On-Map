'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator"; // You might need to install this or use <hr />
import { MessageCircle, Share2, MapPin, Navigation, Heart } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    images: string[];
    features?: string[];
    ownerId: string; // Ideally we fetch owner details
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
}

export function PropertyDetails({ property, isOpen, onClose, isSaved, onToggleSave }: PropertyDetailsProps) {
    if (!property) return null;

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(property.price);

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

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto p-0 sm:p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Property Details: {property.title}</SheetTitle>
                    <SheetDescription>Details about the property {property.title}</SheetDescription>
                </SheetHeader>
                {/* Gallery */}
                <div className="relative h-64 sm:h-80 w-full bg-gray-100">
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {property.images.length > 0 ? (
                                property.images.map((img, index) => (
                                    <CarouselItem key={index} className="h-64 sm:h-80">
                                        <img
                                            src={img}
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-full object-cover"
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
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </>
                        )}
                    </Carousel>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{property.title}</h2>
                                <div className="flex items-center text-gray-500 mt-1">
                                    <MapPin size={16} className="mr-1" />
                                    <span>Near City Center</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-primary">{formattedPrice}</div>
                                <div className="text-sm text-gray-500">/mo</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Badge variant="secondary">{property.type}</Badge>
                            {property.features?.map(f => (
                                <Badge key={f} variant="outline">{f}</Badge>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-gray-200 h-[1px]" />

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {property.description}
                        </p>
                    </div>

                    <Separator className="bg-gray-200 h-[1px]" />

                    {/* Owner & Actions */}
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback>OW</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">Owner Name</div>
                                <div className="text-xs text-gray-500">Property Owner</div>
                            </div>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" size="sm">
                            <MessageCircle size={16} /> WhatsApp
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={onToggleSave}
                        >
                            <Heart size={16} className={isSaved ? "fill-red-500 text-red-500" : ""} />
                            {isSaved ? "Saved" : "Save Property"}
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleShare}>
                            <Share2 size={16} /> Share
                        </Button>
                        <Button className="col-span-2 gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={openGoogleMaps}>
                            <Navigation size={16} /> Navigate Here
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

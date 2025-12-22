'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';
import { Loader2, Upload, MapPin, Search, Crosshair } from 'lucide-react';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    ),
});

interface PostPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PostPropertyModal({ isOpen, onClose }: PostPropertyModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Explicit trigger for map updates
    const [mapViewTrigger, setMapViewTrigger] = useState<{ lat: number; lng: number } | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        type: 'Home',
        furnishing: 'Unfurnished',
        tenantPreference: 'Family',
        lat: 0,
        lng: 0,
        images: [] as string[] // Base64 strings
    });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
                setMapViewTrigger({ lat: newLat, lng: newLng }); // Trigger Map Move
            } else {
                alert("Location not found");
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                setFormData(prev => ({
                    ...prev,
                    lat: newLat,
                    lng: newLng
                }));
                setMapViewTrigger({ lat: newLat, lng: newLng }); // Trigger Map Move
            }, (error) => {
                console.error("Geolocation error:", error);
                if (error.code === error.TIMEOUT) {
                    // Retry with lower accuracy
                    navigator.geolocation.getCurrentPosition((position) => {
                        const newLat = position.coords.latitude;
                        const newLng = position.coords.longitude;
                        setFormData(prev => ({
                            ...prev,
                            lat: newLat,
                            lng: newLng
                        }));
                        setMapViewTrigger({ lat: newLat, lng: newLng });
                    }, (retryError) => {
                        alert("Could not get your location. Please try searching for your area instead.");
                    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
                } else {
                    alert("Could not get your location. Please enable permissions or search manually.");
                }
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, reader.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Construct features array
            const features = [
                formData.furnishing === 'Full' ? 'Fully Furnished' : formData.furnishing === 'Semi' ? 'Semi Furnished' : 'Unfurnished',
                formData.tenantPreference
            ];

            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    features
                }),
            });

            if (response.ok) {
                onClose();
                // Optionally refresh properties or show success
                window.location.reload(); // Simple reload to see new property
            } else {
                console.error("Failed to post property");
                alert("Failed to post property");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error posting property");
        } finally {
            setLoading(false);
        }
    };

    const isValidStep1 = formData.title && formData.description && formData.price;
    const isValidStep2 = formData.type; // Simple validation
    const isValidStep3 = formData.lat !== 0 && formData.lng !== 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Post a Property</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Progress Steps (simplified) */}
                    <div className="flex justify-between mb-6 text-sm text-gray-500">
                        <span className={step >= 1 ? "text-blue-600 font-bold" : ""}>1. Details</span>
                        <span className={step >= 2 ? "text-blue-600 font-bold" : ""}>2. Location</span>
                        <span className={step >= 3 ? "text-blue-600 font-bold" : ""}>3. Images & Review</span>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Property Title</Label>
                                <Input
                                    placeholder="e.g. Spacious 2BHK in Indiranagar"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (₹ / Month)</Label>
                                    <Input
                                        type="number"
                                        placeholder="25000"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Property Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Home">Home</SelectItem>
                                            <SelectItem value="Shop">Shop</SelectItem>
                                            <SelectItem value="Land">Land</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Furnishing</Label>
                                    <Select
                                        value={formData.furnishing}
                                        onValueChange={(val) => setFormData({ ...formData, furnishing: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                                            <SelectItem value="Semi">Semi Furnished</SelectItem>
                                            <SelectItem value="Full">Fully Furnished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tenant Preference</Label>
                                    <Select
                                        value={formData.tenantPreference}
                                        onValueChange={(val) => setFormData({ ...formData, tenantPreference: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Family">Family</SelectItem>
                                            <SelectItem value="Bachelors">Bachelors</SelectItem>
                                            <SelectItem value="Any">Any</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    className="h-32"
                                    placeholder="Describe the property..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 h-full flex flex-col">
                            <Label>Pin Location on Map</Label>

                            {/* Search and Current Location Controls */}
                            <div className="flex gap-2">
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        placeholder="Search area (e.g. Whitefield, Bangalore)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="outline" onClick={handleSearch} disabled={isSearching}>
                                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <Button variant="secondary" onClick={handleCurrentLocation} title="Use My Location">
                                    <Crosshair className="w-4 h-4 mr-2" />
                                    Locate Me
                                </Button>
                            </div>

                            <div className="border rounded-md overflow-hidden flex-1 min-h-[400px] relative">
                                <PropertyMap
                                    lat={formData.lat}
                                    lng={formData.lng}
                                    viewTrigger={mapViewTrigger}
                                    onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                                />

                                {formData.lat === 0 && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-[1000] pointer-events-none">
                                        Tap map or use search to pin location
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Coordinates: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Upload Images</Label>
                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                    />
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium">Click to upload images</p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="aspect-video relative rounded-md overflow-hidden border">
                                            <img src={img} alt={`Preview ${i}`} className="object-cover w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                                <p className="font-bold mb-1">Summary</p>
                                <p>{formData.title} - ₹{formData.price}/mo</p>
                                <p>{formData.type} • {formData.furnishing} • {formData.tenantPreference}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        disabled={loading}
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && !isValidStep1) || (step === 2 && !isValidStep3)}
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Property
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

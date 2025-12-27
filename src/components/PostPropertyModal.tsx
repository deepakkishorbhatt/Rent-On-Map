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
import { FloorPlanSelector } from '@/components/FloorPlanSelector';

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
    initialData?: any; // For editing
    propertyId?: string; // For editing
}

export function PostPropertyModal({ isOpen, onClose, initialData, propertyId }: PostPropertyModalProps) {
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
        type: 'Flat', // Changed default to Flat as it's more common for renters
        furnishing: 'Unfurnished',
        tenantPreference: 'Family',

        // Structured Details
        bedrooms: '', // string for input, converted to number on submit
        bathrooms: '',
        area: '',
        contactNumber: '',

        address: '',
        pincode: '',
        city: '',
        lat: 0,
        lng: 0,
        images: [] as string[] // Base64 strings or URLs
    });

    // Room selection state (for House/Flat types)
    const [selectedRooms, setSelectedRooms] = useState({
        bedrooms: 0,
        bathrooms: 0,
        kitchen: false,
        livingRoom: false,
        diningRoom: false,
        balconies: 0,
        parking: false,
        garden: false,
    });

    // ... (existing code)

    // Reverse Geocoding Function
    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
            const data = await response.json();
            if (data) {
                const addr = data.address || {};
                const pincode = addr.postcode || '';
                const city = addr.city || addr.town || addr.village || addr.hamlet || '';

                // Construct address line without pincode if possible
                const parts = [];
                if (addr.road) parts.push(addr.road);
                if (addr.suburb) parts.push(addr.suburb);
                if (addr.neighbourhood) parts.push(addr.neighbourhood);
                if (city) parts.push(city);
                if (addr.state) parts.push(addr.state);

                const addressLine = parts.length > 0 ? parts.join(', ') : data.display_name;

                setFormData(prev => ({
                    ...prev,
                    address: addressLine,
                    pincode: pincode,
                    city: city
                }));
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
        }
    };

    const handleRoomSelect = (roomType: keyof typeof selectedRooms, action: 'add' | 'remove' | 'toggle') => {
        setSelectedRooms(prev => {
            const current = prev[roomType];
            if (typeof current === 'number') {
                if (action === 'add') return { ...prev, [roomType]: current + 1 };
                if (action === 'remove') return { ...prev, [roomType]: Math.max(0, current - 1) };
            } else {
                return { ...prev, [roomType]: !current };
            }
            return prev;
        });
    };

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
                fetchAddress(newLat, newLng); // Fetch address
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
                fetchAddress(newLat, newLng); // Fetch address
            }, (error) => {
                console.error("Geolocation error:", error);
                if (error.code === error.TIMEOUT) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const newLat = position.coords.latitude;
                        const newLng = position.coords.longitude;
                        setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
                        setMapViewTrigger({ lat: newLat, lng: newLng });
                        fetchAddress(newLat, newLng);
                    }, () => {
                        alert("Could not get your location.");
                    }, { enableHighAccuracy: false, timeout: 10000 });
                } else {
                    alert("Could not get your location.");
                }
            }, { enableHighAccuracy: true, timeout: 5000 });
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

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== indexToRemove)
        }));
    };

    // Load initial data if editing
    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                price: initialData.price?.toString() || '',
                type: initialData.type || 'Flat',
                furnishing: initialData.features?.includes('Fully Furnished') ? 'Full' : initialData.features?.includes('Semi Furnished') ? 'Semi' : 'Unfurnished',
                tenantPreference: initialData.features?.find((f: string) => f === 'Family' || f === 'Bachelors' || f === 'Any') || 'Family',

                bedrooms: initialData.bedrooms?.toString() || '',
                bathrooms: initialData.bathrooms?.toString() || '',
                area: initialData.area?.toString() || '',
                contactNumber: initialData.contactNumber || '',
                address: initialData.address || '',
                pincode: initialData.pincode || '',
                city: initialData.city || '',

                lat: initialData.location?.coordinates[1] || 0,
                lng: initialData.location?.coordinates[0] || 0,
                images: initialData.images || []
            });

            // Populate selected rooms if available
            if (initialData.rooms) {
                setSelectedRooms(initialData.rooms);
            }

            if (initialData.location) {
                setMapViewTrigger({
                    lat: initialData.location.coordinates[1],
                    lng: initialData.location.coordinates[0]
                });
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const features = [
                formData.furnishing === 'Full' ? 'Fully Furnished' : formData.furnishing === 'Semi' ? 'Semi Furnished' : 'Unfurnished',
                formData.tenantPreference
            ];

            const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
            const method = propertyId ? 'PUT' : 'POST';

            // Prepare payload based on property type
            const payload: any = {
                ...formData,
                price: parseFloat(formData.price),
                area: formData.area ? parseInt(formData.area) : undefined,
                features
            };

            // For House/Flat types, use rooms data from FloorPlanSelector
            if (formData.type === 'House' || formData.type === 'Flat') {
                payload.rooms = selectedRooms;
                payload.bedrooms = selectedRooms.bedrooms;
                payload.bathrooms = selectedRooms.bathrooms;
            } else {
                // For other types, use traditional input values
                payload.bedrooms = formData.bedrooms ? parseInt(formData.bedrooms) : undefined;
                payload.bathrooms = formData.bathrooms ? parseInt(formData.bathrooms) : undefined;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onClose();
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Failed to post property: ${errorData.error}`);
            }
        } catch (error: any) {
            console.error("Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const isValidStep1 = formData.title && formData.description && formData.price;
    const isValidStep2 = formData.type; // Simple validation
    const isValidStep3 = formData.lat !== 0 && formData.lng !== 0 && formData.address; // Require address

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden sm:rounded-2xl">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{propertyId ? 'Edit Property' : 'Post a Property'}</DialogTitle>
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

                            <div className="space-y-2">
                                <Label>Price (₹ / Month)</Label>
                                <Input
                                    type="number"
                                    placeholder="25000"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>


                            {/* Conditional Room Selection */}
                            {(formData.type === 'House' || formData.type === 'Flat') ? (
                                <div className="space-y-4">
                                    <FloorPlanSelector
                                        selectedRooms={selectedRooms}
                                        onRoomSelect={handleRoomSelect}
                                    />
                                    <div className="space-y-2">
                                        <Label>Area (sq ft)</Label>
                                        <Input
                                            type="number"
                                            placeholder="1200"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bedrooms (BHK)</Label>
                                        <Input
                                            type="number"
                                            placeholder="2"
                                            value={formData.bedrooms}
                                            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bathrooms</Label>
                                        <Input
                                            type="number"
                                            placeholder="2"
                                            value={formData.bathrooms}
                                            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Area (sq ft)</Label>
                                        <Input
                                            type="number"
                                            placeholder="1200"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* New Fields Row 2 */}
                            <div className="space-y-2">
                                <Label>Contact Number (User/Agent)</Label>
                                <Input
                                    type="tel"
                                    placeholder="+91 99999 88888"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Property Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-none" position="popper">
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
                                    onLocationSelect={(lat, lng) => {
                                        setFormData(prev => ({ ...prev, lat, lng }));
                                        fetchAddress(lat, lng);
                                    }}
                                />

                                {formData.lat === 0 && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-[1000] pointer-events-none">
                                        Tap map or use search to pin location
                                    </div>
                                )}
                            </div>

                            {/* Address Display & Edit */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <Label>Address (Auto-filled)</Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Pin location on map to fetch address..."
                                        className="h-20"
                                    />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label>Pincode</Label>
                                    <Input
                                        value={formData.pincode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                                        placeholder="ZIP Code"
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-muted-foreground text-right">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Upload Images</Label>
                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-50"
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
                                        <div key={i} className="aspect-video relative rounded-md overflow-hidden border group">
                                            <img src={img} alt={`Preview ${i}`} className="object-cover w-full h-full" />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                                            </button>
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
                            {propertyId ? 'Update Property' : 'Post Property'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
}

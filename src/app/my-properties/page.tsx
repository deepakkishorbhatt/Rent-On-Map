'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { PostPropertyModal } from '@/components/PostPropertyModal';
import { PromoteModal } from '@/components/PromoteModal';
import { Loader2, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { EmptyState } from '@/components/EmptyState';
import { PropertyCardSkeleton } from '@/components/PropertyCardSkeleton';

import { PropertyDetails } from '@/components/PropertyDetails';

export default function MyPropertiesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

    // Details Modal State
    const [detailProperty, setDetailProperty] = useState<any | null>(null);

    // Promote Modal State
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [selectedPromotePropertyId, setSelectedPromotePropertyId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const fetchProperties = async () => {
        try {
            const response = await fetch('/api/user/properties');
            if (response.ok) {
                const data = await response.json();
                setProperties(data.properties);
            }
        } catch (error) {
            console.error("Failed to fetch user properties", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProperties();
        } else if (status === 'unauthenticated') {
            setLoading(false); // Stop loading if not auth (will redirect)
        }
    }, [status]);

    const handleEdit = (property: any) => {
        setSelectedProperty(property);
        setIsEditModalOpen(true);
    };

    const handlePromote = (property: any) => {
        setSelectedPromotePropertyId(property._id);
        setIsPromoteModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

        try {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProperties(prev => prev.filter(p => p._id !== id));
            } else {
                alert("Failed to delete property");
            }
        } catch (error) {
            console.error("Error deleting property", error);
            alert("Error deleting property");
        }
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedProperty(null);
        fetchProperties(); // Refresh list after edit
    };

    const handleClosePromoteModal = () => {
        setIsPromoteModalOpen(false);
        setSelectedPromotePropertyId(null);
        fetchProperties(); // Refresh to show featured status
    };

    if (status === 'loading' || loading) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <PropertyCardSkeleton key={i} />)}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Properties</h1>
                    <Button onClick={() => { setSelectedProperty(null); setIsEditModalOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Property
                    </Button>
                </div>

                {properties.length === 0 ? (
                    <div className="py-20 flex justify-center">
                        <EmptyState
                            icon={Home}
                            title="No properties listed yet"
                            description="Start earning by listing your property on Rent On Map."
                            actionLabel="Post Your First Property"
                            onAction={() => setIsEditModalOpen(true)}
                            className="bg-white border-dashed max-w-md w-full"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                isOwner={true}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onPromote={() => handlePromote(property)}
                                onClick={() => setDetailProperty(property)}
                            />
                        ))}
                    </div>
                )}

                <PostPropertyModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModal}
                    initialData={selectedProperty}
                    propertyId={selectedProperty?._id}
                />

                <PromoteModal
                    isOpen={isPromoteModalOpen}
                    onClose={handleClosePromoteModal}
                    propertyId={selectedPromotePropertyId || ''}
                />

                <PropertyDetails
                    property={detailProperty}
                    isOpen={!!detailProperty}
                    onClose={() => setDetailProperty(null)}
                />
            </div>
        </>
    );
}

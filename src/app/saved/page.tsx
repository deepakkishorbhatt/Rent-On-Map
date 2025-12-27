'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PropertyCard } from '@/components/PropertyCard';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompareModal } from '@/components/CompareModal';
import { EmptyState } from '@/components/EmptyState';
import { Heart } from 'lucide-react';
import { PropertyCardSkeleton } from '@/components/PropertyCardSkeleton';

import { PropertyDetails } from '@/components/PropertyDetails';

export default function SavedPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedProperties, setSavedProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Detail Modal State
    const [detailProperty, setDetailProperty] = useState<any | null>(null);

    // Comparison State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (!session?.user) return;

        const fetchSaved = () => {
            fetch('/api/user/saved')
                .then(res => res.json())
                .then(data => {
                    if (data.savedProperties) {
                        setSavedProperties(data.savedProperties);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        };

        // Initial fetch
        fetchSaved();

        // Poll every 1 second for "instant" updates
        const intervalId = setInterval(fetchSaved, 1000);

        return () => clearInterval(intervalId);
    }, [session, status]);

    const handleToggleSave = async (id: string) => {
        // Optimistic remove
        const previous = [...savedProperties];
        setSavedProperties(prev => prev.filter(p => p._id !== id));

        // Also remove from selection if selected
        if (selectedIds.has(id)) {
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
        }

        try {
            await fetch('/api/user/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId: id }),
            });
        } catch (err) {
            console.error(err);
            setSavedProperties(previous);
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (newSet.size >= 3) {
                alert("You can compare up to 3 properties at a time.");
                return;
            }
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    if (status === 'loading' || (loading && session)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="container mx-auto px-4 py-8 flex-1 pb-24">
                    <div className="mb-6 space-y-2">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <PropertyCardSkeleton key={i} />)}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="container mx-auto px-4 py-8 flex-1 pb-24">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Saved Properties</h1>
                        <p className="text-gray-500 mt-1">Select up to 3 properties to compare.</p>
                    </div>

                    {selectedIds.size > 0 && (
                        <Button variant="ghost" onClick={() => setSelectedIds(new Set())} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                            Clear Selection
                        </Button>
                    )}
                </div>

                {savedProperties.length === 0 ? (
                    <div className="py-20 flex justify-center">
                        <EmptyState
                            icon={Heart}
                            title="No saved properties"
                            description="Save properties you like to view them later or compare them."
                            actionLabel="Browse Map"
                            onAction={() => router.push('/')}
                            className="bg-white border-dashed max-w-md w-full"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedProperties.map((property) => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                isSaved={true}
                                onToggleSave={() => handleToggleSave(property._id)}
                                selected={selectedIds.has(property._id)}
                                onSelect={() => toggleSelection(property._id)}
                                onClick={() => setDetailProperty(property)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Comparison Floating Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-4">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">{selectedIds.size} selected</span>
                            <span className="text-sm text-gray-500 hidden sm:inline">Compare up to 3 properties</span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setSelectedIds(new Set())}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => setIsCompareOpen(true)}
                                disabled={selectedIds.size < 2}
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            >
                                Compare Properties <ArrowRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <CompareModal
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
                properties={savedProperties.filter(p => selectedIds.has(p._id))}
            />

            <PropertyDetails
                property={detailProperty}
                isOpen={!!detailProperty}
                onClose={() => setDetailProperty(null)}
                isSaved={detailProperty ? true : false} // Already in saved page, so isSaved is explicitly true unless we want to allow unsaving from details?
                onToggleSave={() => detailProperty && handleToggleSave(detailProperty._id)}
            />
        </div>
    );
}

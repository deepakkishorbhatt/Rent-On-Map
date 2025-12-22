'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PropertyCard } from '@/components/PropertyCard';
import { Loader2 } from 'lucide-react';

export default function SavedPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedProperties, setSavedProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/user/saved')
                .then(res => res.json())
                .then(data => {
                    if (data.savedProperties) {
                        setSavedProperties(data.savedProperties);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else if (status === 'authenticated') {
            // Should not happen really if status check handles it, 
            // but if session is there but fetch pending...
        }
    }, [session, status]);

    const handleToggleSave = async (id: string) => {
        // Optimistic remove
        const previous = [...savedProperties];
        setSavedProperties(prev => prev.filter(p => p._id !== id));

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

    if (status === 'loading' || (loading && session)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="container mx-auto px-4 py-8 flex-1">
                <h1 className="text-3xl font-bold mb-6">Saved Properties</h1>

                {savedProperties.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-4">You haven't saved any properties yet.</p>
                        <a href="/" className="text-blue-600 hover:underline">Browse properties on map</a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedProperties.map(property => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                isSaved={true}
                                onToggleSave={() => handleToggleSave(property._id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

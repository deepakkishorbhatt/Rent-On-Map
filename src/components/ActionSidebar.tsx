'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Map, Heart } from 'lucide-react';

interface ActionSidebarProps {
    onPostProperty: () => void;
}

export function ActionSidebar({ onPostProperty }: ActionSidebarProps) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="absolute top-4 left-4 z-[1000] hidden md:flex flex-col gap-2">
            <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-12 h-12 p-0"
                onClick={onPostProperty}
                title="Post Property"
            >
                <PlusCircle size={20} />
            </Button>

            <Link href="/my-properties">
                <Button
                    variant="outline"
                    className="bg-white hover:bg-gray-50 shadow-lg w-12 h-12 p-0"
                    title="My Properties"
                >
                    <Map size={20} className="text-gray-700" />
                </Button>
            </Link>

            <Link href="/saved">
                <Button
                    variant="outline"
                    className="bg-white hover:bg-gray-50 shadow-lg w-12 h-12 p-0"
                    title="Saved Properties"
                >
                    <Heart size={20} className="text-gray-700" />
                </Button>
            </Link>
        </div>
    );
}

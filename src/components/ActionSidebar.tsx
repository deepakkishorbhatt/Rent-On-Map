'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Building2, Heart } from 'lucide-react';

// ...
// ...
interface ActionSidebarProps {
    // onPostProperty prop removed as it's no longer used
}

export function ActionSidebar({ }: ActionSidebarProps) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Link href="/messages">
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-12 h-12 p-0"
                    title="Check Messages"
                >
                    <MessageSquare size={20} />
                </Button>
            </Link>

            <Link href="/my-properties">
                <Button
                    variant="outline"
                    className="bg-white hover:bg-gray-50 shadow-lg w-12 h-12 p-0"
                    title="My Properties"
                >
                    <Building2 size={20} className="text-gray-700" />
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

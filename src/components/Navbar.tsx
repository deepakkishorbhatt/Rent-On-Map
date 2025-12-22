import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Map, PlusCircle, Heart, LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import { LoginModal } from '@/components/LoginModal';

import { PostPropertyModal } from '@/components/PostPropertyModal';

interface NavbarProps {
    centerContent?: ReactNode;
}

export function Navbar({ centerContent }: NavbarProps) {
    const { data: session } = useSession();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const handlePostProperty = () => {
        if (!session) {
            setIsLoginOpen(true);
        } else {
            setIsPostModalOpen(true);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4 gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <Map size={20} />
                        </div>
                        <span className="hidden sm:inline">Rent On Map</span>
                    </Link>
                </div>

                {/* Center Content - Filters */}
                <div className="flex-1 flex justify-center max-w-3xl mx-4">
                    {centerContent}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <Button
                        className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        onClick={handlePostProperty}
                    >
                        <PlusCircle size={16} />
                        Post Property
                    </Button>

                    {session ? (
                        <>
                            <Link href="/saved">
                                <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                                    <Heart size={18} className="text-gray-600" />
                                    Saved
                                </Button>
                            </Link>

                            <Avatar className="h-8 w-8 cursor-pointer border ring-offset-2 hover:ring-2 transition-all">
                                <AvatarImage src={session.user?.image || "https://github.com/shadcn.png"} alt="@user" />
                                <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => signOut()}
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            <PostPropertyModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
        </nav>
    );
}

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Map, PlusCircle, Heart, LogOut, Menu, User, MessageSquare } from 'lucide-react';
import { ReactNode } from 'react';
import { LoginModal } from '@/components/LoginModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { PostPropertyModal } from '@/components/PostPropertyModal';

interface NavbarProps {
    centerContent?: ReactNode;
}

export function Navbar({ centerContent }: NavbarProps) {
    const { data: session } = useSession();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handlePostProperty = () => {
        if (!session) {
            setIsLoginOpen(true);
        } else {
            setIsPostModalOpen(true);
        }
        setIsMobileMenuOpen(false); // Close mobile menu if open
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4 gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                                src="/rent_on_map_assets/real_rent-on-map-logo.png"
                                alt="Rent On Map"
                                fill
                                className="object-contain select-none pointer-events-none"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                priority
                            />
                        </div>
                        <span className="hidden md:inline select-none">Rent On Map</span>
                    </Link>
                </div>

                {/* Center Content - Search (Visible on all sizes, but adapted by parent) */}
                <div className="flex-1 flex justify-center min-w-0 max-w-2xl mx-2">
                    {centerContent}
                </div>

                {/* Desktop Actions - Only show avatar dropdown */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    {session ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="h-8 w-8 cursor-pointer border ring-offset-2 hover:ring-2 transition-all">
                                    <AvatarImage src={session.user?.image || "https://github.com/shadcn.png"} alt="@user" />
                                    <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="end">
                                <div className="flex flex-col">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 p-4">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={session.user?.image || ""} />
                                            <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-medium text-sm truncate">{session.user?.name}</span>
                                            <span className="text-xs text-muted-foreground truncate">{session.user?.email}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 rounded-none h-12"
                                        asChild
                                    >
                                        <Link href="/messages">
                                            <MessageSquare size={16} /> Messages
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 rounded-none h-12"
                                        asChild
                                    >
                                        <Link href="/profile">
                                            <User size={16} /> My Profile
                                        </Link>
                                    </Button>

                                    <div className="my-1">
                                        <Separator />
                                    </div>

                                    {/* Logout Button */}
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => signOut()}
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                            Sign In
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Trigger */}
                <div className="md:hidden flex items-center">
                    <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8 border border-gray-200">
                                    <AvatarImage
                                        src={session?.user?.image || ""}
                                        alt={session?.user?.name || "User"}
                                        referrerPolicy="no-referrer"
                                    />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                        {session?.user?.name ? (
                                            session.user.name.charAt(0).toUpperCase()
                                        ) : (
                                            <User size={18} className="text-gray-600" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90%] rounded-xl sm:max-w-[400px]">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="flex flex-col items-center justify-center gap-3 py-2">
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <Image
                                            src="/rent_on_map_assets/real_rent-on-map-logo.png"
                                            alt="Rent On Map"
                                            fill
                                            className="object-contain select-none pointer-events-none"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">Rent On Map</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-4">
                                {session ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={session.user?.image || ""} />
                                                <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{session.user?.name}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[180px]">{session.user?.email}</span>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Button
                                                className="w-full justify-start gap-2"
                                                onClick={handlePostProperty}
                                            >
                                                <PlusCircle size={18} /> Post Property
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2"
                                                asChild
                                            >
                                                <Link href="/profile">
                                                    <User size={18} /> My Profile
                                                </Link>
                                            </Button>


                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2"
                                                asChild
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Link href="/my-properties">
                                                    <Map size={18} /> My Properties
                                                </Link>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2"
                                                asChild
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Link href="/saved">
                                                    <Heart size={18} /> Saved Properties
                                                </Link>
                                            </Button>
                                        </div>

                                        <div className="h-px bg-gray-100 my-2" />

                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                signOut();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <Button
                                            className="w-full"
                                            onClick={() => {
                                                setIsLoginOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            Log In / Sign Up
                                        </Button>
                                        <p className="text-center text-sm text-muted-foreground">
                                            Log in to post properties and save your favorites.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            <PostPropertyModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
        </nav >
    );
}

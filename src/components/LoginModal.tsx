'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn('google', { callbackUrl: window.location.href });
            // onOpenChange will handle close, but we can call onClose too?
            // Usually signIn redirects, so loading state is enough till redirect starts.
        } catch (error) {
            console.error("Login failed", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">Welcome to Rent On Map</DialogTitle>
                    <DialogDescription className="text-center">
                        Sign in to save properties and create alerts.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col gap-4">
                    <Button
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="w-full h-12 flex items-center justify-center gap-3 text-base font-medium border-gray-300 hover:bg-gray-50"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                className="w-5 h-5"
                            />
                        )}
                        Continue with Google
                    </Button>
                </div>

                <p className="text-xs text-center text-gray-500 px-6 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-gray-900" onClick={onClose}>
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="underline hover:text-gray-900" onClick={onClose}>
                        Privacy Policy
                    </Link>
                    .
                </p>
            </DialogContent>
        </Dialog>
    );
}

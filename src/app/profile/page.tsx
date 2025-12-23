'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestVerification = async () => {
        setRequesting(true);
        try {
            const res = await fetch('/api/user/profile', { method: 'PATCH' });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
            }
        } catch (error) {
            alert("Failed to request verification");
        } finally {
            setRequesting(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p>Please sign in to view your profile.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8">
                    <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user?.image || session.user?.image || ''} />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>

                        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            {user?.name}
                            {user?.verificationStatus === 'verified' && (
                                <CheckCircle2 className="text-blue-500 fill-blue-50" size={24} />
                            )}
                        </h1>
                        <p className="text-gray-500 mb-6">{user?.email}</p>

                        <div className="w-full border-t pt-6">
                            <h2 className="text-lg font-semibold mb-4">Verification Status</h2>

                            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {user?.verificationStatus === 'verified' ? (
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <CheckCircle2 className="text-blue-600" size={24} />
                                        </div>
                                    ) : user?.verificationStatus === 'pending' ? (
                                        <div className="bg-yellow-100 p-2 rounded-full">
                                            <Clock className="text-yellow-600" size={24} />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-200 p-2 rounded-full">
                                            <AlertCircle className="text-gray-500" size={24} />
                                        </div>
                                    )}

                                    <div>
                                        <div className="font-medium capitalize">
                                            {user?.verificationStatus === 'verified' ? 'Verified Account' :
                                                user?.verificationStatus === 'pending' ? 'Verification Pending' :
                                                    'Unverified Account'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user?.verificationStatus === 'verified' ? 'Your identity has been confirmed.' :
                                                user?.verificationStatus === 'pending' ? 'We are reviewing your request.' :
                                                    'Verify your identity to build trust.'}
                                        </div>
                                    </div>
                                </div>

                                {(!user?.verificationStatus || user?.verificationStatus === 'unverified') && (
                                    <Button
                                        onClick={handleRequestVerification}
                                        disabled={requesting}
                                    >
                                        {requesting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                        Request Verification
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js'; // Placeholder import if we had keys, can remove for simulated

interface PromoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    onSuccess?: () => void;
}

export function PromoteModal({ isOpen, onClose, propertyId, onSuccess }: PromoteModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'1_week' | '1_month'>('1_week');
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Simulated Payment Call
            const res = await fetch('/api/properties/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: propertyId,
                    plan: selectedPlan
                })
            });
            const data = await res.json();

            if (data.success) {
                // Success animation/delay could be added here
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert(data.error || 'Payment failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!propertyId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <Sparkles className="text-yellow-600 h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl">Promote Your Property</DialogTitle>
                    </div>
                    <DialogDescription>
                        Get up to 3x more leads by featuring your property at the top of search results.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedPlan === '1_week' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setSelectedPlan('1_week')}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg">Weekly Boost</h3>
                            <Badge variant={selectedPlan === '1_week' ? 'default' : 'outline'}>₹99</Badge>
                        </div>
                        <ul className="space-y-1">
                            <li className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-600" /> Top placement for 7 days</li>
                            <li className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-600" /> Gold border & Badge</li>
                        </ul>
                    </div>

                    <div
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedPlan === '1_month' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setSelectedPlan('1_month')}
                    >
                        <Badge className="absolute -top-3 right-4 bg-green-600">Best Value</Badge>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg">Monthly Pro</h3>
                            <Badge variant={selectedPlan === '1_month' ? 'default' : 'outline'}>₹299</Badge>
                        </div>
                        <ul className="space-y-1">
                            <li className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-600" /> Top placement for 30 days</li>
                            <li className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-600" /> Gold border & Badge</li>
                            <li className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-600" /> Priority Support</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        onClick={handlePayment}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold h-12 text-lg"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 fill-current" />}
                        Pay ₹{selectedPlan === '1_week' ? '99' : '299'} & Promote
                    </Button>
                    <p className="text-xs text-center text-gray-400">
                        Secure payment simulation. No actual charge will be made.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

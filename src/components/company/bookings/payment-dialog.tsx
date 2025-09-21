
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (paymentMode: 'Cash' | 'Online') => void;
  amount: number;
}

export function PaymentDialog({ isOpen, onOpenChange, onConfirm, amount }: PaymentDialogProps) {
    const [view, setView] = useState<'selection' | 'qr'>('selection');
    const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');

    const handleCashPayment = () => {
        onConfirm('Cash');
    };

    const handleOnlinePayment = () => {
        setView('qr');
    };
    
    const handleQrConfirm = () => {
        onConfirm('Online');
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset view to selection when dialog is closed
            setTimeout(() => setView('selection'), 300);
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Payment</DialogTitle>
                     <DialogDescription>
                        Total amount to be paid: <span className="font-bold text-foreground">₹{amount.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>

                {view === 'selection' && (
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20" onClick={handleCashPayment}>
                            <Wallet className="mr-2 h-6 w-6" />
                            Paid by Cash
                        </Button>
                        <Button variant="outline" className="h-20" onClick={handleOnlinePayment}>
                            <CreditCard className="mr-2 h-6 w-6" />
                            Paid by Online (UPI)
                        </Button>
                    </div>
                )}
                
                {view === 'qr' && (
                    <div className="py-4 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Scan the QR code to complete the payment.</p>
                        <div className="relative w-48 h-48 mx-auto border-4 border-primary p-1 rounded-lg">
                           {qrCodeImage && <Image
                                src={qrCodeImage.imageUrl}
                                alt="Sample QR Code"
                                layout="fill"
                                objectFit="contain"
                                data-ai-hint={qrCodeImage.imageHint}
                            />}
                        </div>
                        <Button onClick={handleQrConfirm} className="w-full">
                            Confirm Payment & Save Booking
                        </Button>
                         <Button variant="link" size="sm" onClick={() => setView('selection')}>
                            Back to payment options
                        </Button>
                    </div>
                )}
                
            </DialogContent>
        </Dialog>
    );
}

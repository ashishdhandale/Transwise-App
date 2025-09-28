
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings } from '@/lib/bookings-dashboard-data';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PreviousBookingHeader } from './previous-booking-header';
import { ItemDetailsTable } from './item-details-table';

interface PreviousBookingDialogProps {
    children: React.ReactNode;
}

const DetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
    </div>
);


export function PreviousBookingDialog({ children }: PreviousBookingDialogProps) {
    const [previousBooking, setPreviousBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const bookings = getBookings();
        if (bookings.length > 0) {
            // Sort by date to get the most recent one
            const sorted = [...bookings].sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
            setPreviousBooking(sorted[0]);
        }
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Previous Booking Details</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                <div className="p-4 space-y-4">
                    {previousBooking ? (
                        <>
                           <PreviousBookingHeader 
                                lrNo={previousBooking.lrNo}
                                type={previousBooking.lrType}
                                sender={previousBooking.sender}
                                receiver={previousBooking.receiver}
                                qty={previousBooking.qty}
                                toCity={previousBooking.toCity}
                           />
                            <Separator />
                            <ItemDetailsTable 
                                rows={previousBooking.itemRows}
                                onRowsChange={() => {}} // Read-only
                                isViewOnly={true}
                                sender={null}
                                receiver={null}
                                fromStation={null}
                                toStation={null}
                                onQuotationApply={() => {}}
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48">
                            <p className="text-muted-foreground">No previous bookings found.</p>
                        </div>
                    )}
                </div>
                </ScrollArea>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                        Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}



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
import { useEffect, useState, useMemo } from 'react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings } from '@/lib/bookings-dashboard-data';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ItemDetailsTable } from './item-details-table';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface PreviousBookingDialogProps {
    children: React.ReactNode;
}

const DetailItem = ({ label, value, className }: { label: string; value: string | number | undefined, className?: string }) => (
    <div className="text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className={cn("font-semibold", className)}>{value}</p>
    </div>
);


export function PreviousBookingDialog({ children }: PreviousBookingDialogProps) {
    const [previousBooking, setPreviousBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const bookings = getBookings();
        if (bookings.length > 0) {
            const sorted = [...bookings].sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
            setPreviousBooking(sorted[0]);
        }
    }, []);
    
    const basicFreight = useMemo(() => {
        if (!previousBooking) return 0;
        return previousBooking.itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [previousBooking]);


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
                           <div className="p-4 border rounded-lg bg-muted/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailItem label="LR No" value={previousBooking.lrNo} />
                                <DetailItem label="Booking Date" value={format(parseISO(previousBooking.bookingDate), 'dd-MMM-yyyy')} />
                                <DetailItem label="From Station" value={previousBooking.fromCity} />
                                <DetailItem label="To Station" value={previousBooking.toCity} />
                                <DetailItem label="Sender" value={previousBooking.sender} />
                                <DetailItem label="Receiver" value={previousBooking.receiver} />
                                <DetailItem label="Booking Type" value={previousBooking.lrType} className="font-extrabold text-blue-600 text-base" />
                                <DetailItem label="Load Type" value={previousBooking.loadType} />
                                <DetailItem label="Basic Freight" value={basicFreight.toFixed(2)} />
                                <DetailItem label="Grand Total" value={previousBooking.totalAmount.toFixed(2)} className="font-extrabold text-red-600 text-base" />
                           </div>
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

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { FileX } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const thClass = "bg-destructive/10 text-destructive font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

export function ReturnBookingReport() {
    const [returnBookings, setReturnBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const allBookings = getBookings();
        // A simple way to identify returns is by a convention in the LR number.
        // A more robust system might use a dedicated 'return' status or link.
        const returns = allBookings.filter(b => b.lrNo.includes('-R'));
        setReturnBookings(returns);
    }, []);

    return (
        <main className="flex-1 p-4 md:p-6">
             <header className="mb-4">
                <h1 className="text-3xl font-bold text-destructive flex items-center gap-2">
                    <FileX className="h-8 w-8" />
                    Return Booking Report
                </h1>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Returned Consignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClass}>#</TableHead>
                                    <TableHead className={thClass}>Return LR No.</TableHead>
                                    <TableHead className={thClass}>Return Date</TableHead>
                                    <TableHead className={thClass}>Original LR No.</TableHead>
                                    <TableHead className={thClass}>From</TableHead>
                                    <TableHead className={thClass}>To</TableHead>
                                    <TableHead className={thClass}>Sender</TableHead>
                                    <TableHead className={thClass}>Receiver</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returnBookings.length > 0 ? (
                                    returnBookings.map((booking, index) => (
                                        <TableRow key={booking.trackingId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>{booking.lrNo}</TableCell>
                                            <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                            <TableCell className={tdClass}>{booking.lrNo.replace('-R', '')}</TableCell>
                                            <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.sender}</TableCell>
                                            <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{booking.qty}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                            No returned bookings found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
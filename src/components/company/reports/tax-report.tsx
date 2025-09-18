
'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { format, parseISO } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import type { Customer } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const thClass = "bg-primary/10 text-primary font-semibold";
const tdClass = "whitespace-nowrap";
const CUSTOMERS_KEY = 'transwise_customers';


const calculateGstAmount = (booking: Booking): number => {
    // This logic assumes GST is the difference between total amount and the sum of freight + charges.
    // A more robust implementation might store the GST rate/amount directly.
    const basicFreight = booking.itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    const additionalChargesTotal = Object.values(booking.additionalCharges || {}).reduce((sum, charge) => sum + charge, 0);
    const subTotal = basicFreight + additionalChargesTotal;
    const gstAmount = booking.totalAmount - subTotal;
    return gstAmount > 0 ? gstAmount : 0;
};

export function TaxReport() {
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

    useEffect(() => {
        setAllBookings(getBookings());
        try {
            const savedCustomers = localStorage.getItem(CUSTOMERS_KEY);
            if (savedCustomers) {
                setAllCustomers(JSON.parse(savedCustomers));
            }
        } catch (error) {
            console.error("Failed to load customers", error);
        }
    }, []);

    const taxBookings = useMemo(() => {
        return allBookings
            .filter(b => {
                const isPayableByTransporter = b.taxPaidBy === 'Transporter';
                if (!selectedCustomer) {
                    return isPayableByTransporter;
                }
                return isPayableByTransporter && (b.sender === selectedCustomer || b.receiver === selectedCustomer);
            })
            .map(b => ({
                ...b,
                gstAmount: calculateGstAmount(b)
            }))
            .filter(b => b.gstAmount > 0);
    }, [allBookings, selectedCustomer]);
    
    const totalGst = useMemo(() => {
        return taxBookings.reduce((sum, b) => sum + b.gstAmount, 0);
    }, [taxBookings]);

    const totalFreight = useMemo(() => {
        return taxBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    }, [taxBookings]);
    
    const customerOptions = useMemo(() => {
        return allCustomers.map(c => ({ label: c.name, value: c.name }));
    }, [allCustomers]);


    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    Tax Report (Payable by Transporter)
                </h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">GST Payable Summary</CardTitle>
                    <div className="pt-4">
                        <Label htmlFor="customer-filter">Load Customer-wise Tax Report</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-full max-w-sm">
                                <Combobox
                                    options={customerOptions}
                                    value={selectedCustomer || ''}
                                    onChange={(value) => setSelectedCustomer(value || null)}
                                    placeholder="Select a customer..."
                                    searchPlaceholder="Search customers..."
                                    notFoundMessage="No customer found."
                                />
                            </div>
                            <Button variant="outline" onClick={() => setSelectedCustomer(null)} disabled={!selectedCustomer}>
                                Show All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClass}>#</TableHead>
                                    <TableHead className={thClass}>LR No.</TableHead>
                                    <TableHead className={thClass}>Booking Date</TableHead>
                                    <TableHead className={thClass}>From</TableHead>
                                    <TableHead className={thClass}>To</TableHead>
                                    <TableHead className={thClass}>Sender</TableHead>
                                    <TableHead className={thClass}>Receiver</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Total Freight (₹)</TableHead>
                                    <TableHead className={`${thClass} text-right`}>GST Amount (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxBookings.length > 0 ? (
                                    taxBookings.map((booking, index) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>{booking.lrNo}</TableCell>
                                            <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                            <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.sender}</TableCell>
                                            <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{booking.totalAmount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className={`${tdClass} text-right font-semibold text-red-600`}>{booking.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                            No bookings found where tax is paid by the transporter for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {taxBookings.length > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-right font-bold text-lg">Total</TableCell>
                                        <TableCell className="text-right font-bold text-lg">{totalFreight.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="text-right font-bold text-lg text-red-700">{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { Notebook } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap";

const OPENING_BALANCE = 5000; // Example opening balance

export function Cashbook() {
    const [transactions, setTransactions] = useState<Booking[]>([]);
    const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);

    useEffect(() => {
        async function loadData() {
            const profile = await loadCompanySettingsFromStorage();
            setCompanyProfile(profile);
            const allBookings = getBookings();
            const paidBookings = allBookings
                .filter(b => b.lrType === 'PAID')
                .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
            setTransactions(paidBookings);
        }
        loadData();
    }, []);

    const totals = useMemo(() => {
        const totalCash = transactions.filter(t => t.paymentMode === 'Cash').reduce((sum, t) => sum + t.totalAmount, 0);
        const totalOnline = transactions.filter(t => t.paymentMode === 'Online').reduce((sum, t) => sum + t.totalAmount, 0);
        const totalReceipts = totalCash + totalOnline;
        const closingBalance = OPENING_BALANCE + totalReceipts;
        return { totalCash, totalOnline, totalReceipts, closingBalance };
    }, [transactions]);
    
    const formatValue = (amount: number) => {
        if (!companyProfile) return amount.toFixed(2);
        return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Notebook className="h-8 w-8" />
                    Cashbook
                </h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Cash & Bank Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClass}>#</TableHead>
                                    <TableHead className={thClass}>Date</TableHead>
                                    <TableHead className={thClass}>Particulars</TableHead>
                                    <TableHead className={thClass}>Payment Mode</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold"></TableCell>
                                    <TableCell className="font-semibold"></TableCell>
                                    <TableCell className="font-semibold">Opening Balance</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-semibold">{formatValue(OPENING_BALANCE)}</TableCell>
                                </TableRow>
                                {transactions.length > 0 ? (
                                    transactions.map((booking, index) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>
                                                To {booking.sender} (GR #{booking.lrNo})
                                            </TableCell>
                                            <TableCell className={tdClass}>{booking.paymentMode}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{formatValue(booking.totalAmount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No PAID transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                             <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-right font-bold text-lg">Total Receipts</TableCell>
                                    <TableCell className="text-right font-bold text-lg">{formatValue(totals.totalReceipts)}</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-right font-bold text-lg text-primary">Closing Balance</TableCell>
                                    <TableCell className="text-right font-bold text-lg text-primary">{formatValue(totals.closingBalance)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-6 text-sm font-semibold">
                    <div>Total Cash: <span className="text-green-600">{formatValue(totals.totalCash)}</span></div>
                    <div>Total Online: <span className="text-blue-600">{formatValue(totals.totalOnline)}</span></div>
                </CardFooter>
            </Card>
        </div>
    );
}

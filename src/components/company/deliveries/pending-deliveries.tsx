
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { Clock, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { getBranches, type Branch } from '@/lib/branch-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

export function PendingDeliveries() {
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState('ALL');

    useEffect(() => {
        const allBookings = getBookings();
        // Pending deliveries are those that are "In Transit"
        const pending = allBookings.filter(b => b.status === 'In Transit');
        setPendingBookings(pending);
        setBranches(getBranches());
    }, []);

    const filteredBookings = useMemo(() => {
        let bookings = pendingBookings;

        if (selectedBranch !== 'ALL') {
            bookings = bookings.filter(b => b.branchName === selectedBranch);
        }

        if (!searchTerm) return bookings;
        
        const lowerQuery = searchTerm.toLowerCase();
        return bookings.filter(b => 
            b.lrNo.toLowerCase().includes(lowerQuery) ||
            b.toCity.toLowerCase().includes(lowerQuery) ||
            b.receiver.toLowerCase().includes(lowerQuery)
        );
    }, [pendingBookings, searchTerm, selectedBranch]);

    const totalQty = useMemo(() => filteredBookings.reduce((sum, b) => sum + b.qty, 0), [filteredBookings]);

    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Clock className="h-8 w-8" />
                    Pending For Delivery
                </h1>
            </header>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-headline">Consignments Ready for Delivery</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="w-full max-w-xs">
                                <Label htmlFor="branch-filter">Filter by Branch</Label>
                                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                    <SelectTrigger id="branch-filter">
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">ALL (Default)</SelectItem>
                                        {branches.map(branch => (
                                            <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative w-full max-w-sm">
                                <Label>Search</Label>
                                <Search className="absolute left-2.5 top-8 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="by LR, City, or Receiver..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
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
                                    <TableHead className={thClass}>Receiver</TableHead>
                                    <TableHead className={thClass}>Item</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => (
                                        <TableRow key={booking.trackingId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>{booking.lrNo}</TableCell>
                                            <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                            <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                            <TableCell className={`${tdClass} max-w-xs truncate`}>{booking.itemDescription}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{booking.qty}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                            No pending deliveries found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="justify-end font-semibold">
                    Total Pending Consignments: {filteredBookings.length} | Total Packages: {totalQty}
                </CardFooter>
            </Card>
        </div>
    );
}

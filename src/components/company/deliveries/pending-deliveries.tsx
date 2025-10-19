
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { getChallanData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { Clock, Search, ChevronDown } from 'lucide-react';
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
import { ClientOnly } from '@/components/ui/client-only';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const thClass = "bg-primary/10 text-primary font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

interface ChallanWithBookings extends Challan {
    bookings: Booking[];
}

export function PendingDeliveries() {
    const [allChallans, setAllChallans] = useState<Challan[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [allLrDetails, setAllLrDetails] = useState<LrDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState('ALL');
    const [openChallanIds, setOpenChallanIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const allBookingsData = getBookings();
        setAllBookings(allBookingsData);
        setAllChallans(getChallanData());
        setAllLrDetails(getLrDetailsData());
        setBranches(getBranches());
    }, []);

    const challansWithPendingDeliveries = useMemo(() => {
        // Find bookings that are 'In Transit'
        const pendingBookings = allBookings.filter(b => b.status === 'In Transit');
        const pendingBookingMap = new Map(pendingBookings.map(b => [b.lrNo, b]));

        // Find which challans these bookings belong to
        const challanToLrMap = new Map<string, string[]>();
        allLrDetails.forEach(lr => {
            if (pendingBookingMap.has(lr.lrNo)) {
                if (!challanToLrMap.has(lr.challanId)) {
                    challanToLrMap.set(lr.challanId, []);
                }
                challanToLrMap.get(lr.challanId)!.push(lr.lrNo);
            }
        });
        
        // Construct the final data structure
        const result: ChallanWithBookings[] = [];
        challanToLrMap.forEach((lrNos, challanId) => {
            const challan = allChallans.find(c => c.challanId === challanId);
            if (challan) {
                const bookingsForChallan = lrNos.map(lrNo => pendingBookingMap.get(lrNo)).filter((b): b is Booking => !!b);
                result.push({ ...challan, bookings: bookingsForChallan });
            }
        });

        return result;

    }, [allBookings, allChallans, allLrDetails]);
    
    const filteredData = useMemo(() => {
        let data = challansWithPendingDeliveries;

        if (selectedBranch !== 'ALL') {
            data = data.filter(c => c.bookings.some(b => b.branchName === selectedBranch));
        }

        if (!searchTerm) return data;
        
        const lowerQuery = searchTerm.toLowerCase();
        return data.filter(c => 
            c.challanId.toLowerCase().includes(lowerQuery) ||
            c.vehicleNo.toLowerCase().includes(lowerQuery) ||
            c.toStation.toLowerCase().includes(lowerQuery) ||
            c.bookings.some(b => b.lrNo.toLowerCase().includes(lowerQuery) || b.receiver.toLowerCase().includes(lowerQuery))
        );
    }, [challansWithPendingDeliveries, searchTerm, selectedBranch]);


    const totalQty = useMemo(() => filteredData.flatMap(c => c.bookings).reduce((sum, b) => sum + b.qty, 0), [filteredData]);
    const totalConsignments = useMemo(() => filteredData.reduce((sum, c) => sum + c.bookings.length, 0), [filteredData]);

    const toggleChallan = (challanId: string) => {
        setOpenChallanIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(challanId)) {
                newSet.delete(challanId);
            } else {
                newSet.add(challanId);
            }
            return newSet;
        })
    }


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
                    <ClientOnly>
                        <div className="flex justify-between items-center">
                            <CardTitle className="font-headline">Consignments In Transit</CardTitle>
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
                                        placeholder="Challan, Vehicle, LR, City..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </ClientOnly>
                </CardHeader>
                <CardContent>
                    <ClientOnly>
                        <div className="space-y-2">
                            {filteredData.length > 0 ? (
                                filteredData.map((challan) => (
                                    <Collapsible key={challan.challanId} open={openChallanIds.has(challan.challanId)} onOpenChange={() => toggleChallan(challan.challanId)} className="border rounded-md">
                                        <CollapsibleTrigger asChild>
                                            <div className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted">
                                                <div className="flex items-center gap-4">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <ChevronDown className={cn("h-5 w-5 transition-transform", openChallanIds.has(challan.challanId) && 'rotate-180')}/>
                                                    </Button>
                                                    <span className="font-bold text-primary">{challan.challanId}</span>
                                                    <span>({challan.bookings.length} LRs)</span>
                                                    <span className="text-sm text-muted-foreground">To: <span className="font-semibold text-foreground">{challan.toStation}</span></span>
                                                    <span className="text-sm text-muted-foreground">Vehicle: <span className="font-semibold text-foreground">{challan.vehicleNo}</span></span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">Date: {format(parseISO(challan.dispatchDate), 'dd-MMM-yyyy')}</span>
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="overflow-x-auto p-2">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>#</TableHead>
                                                            <TableHead>LR No.</TableHead>
                                                            <TableHead>Booking Date</TableHead>
                                                            <TableHead>From</TableHead>
                                                            <TableHead>Receiver</TableHead>
                                                            <TableHead>Item</TableHead>
                                                            <TableHead className="text-right">Qty</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {challan.bookings.map((booking, index) => (
                                                            <TableRow key={booking.trackingId}>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell className="font-medium">{booking.lrNo}</TableCell>
                                                                <TableCell>{format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                                                <TableCell>{booking.fromCity}</TableCell>
                                                                <TableCell>{booking.receiver}</TableCell>
                                                                <TableCell className="max-w-xs truncate">{booking.itemDescription}</TableCell>
                                                                <TableCell className="text-right">{booking.qty}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))
                            ) : (
                                <div className="text-center p-8 h-24 text-muted-foreground">
                                    No pending deliveries found.
                                </div>
                            )}
                        </div>
                    </ClientOnly>
                </CardContent>
                <CardFooter className="justify-end font-semibold">
                    Total Pending Consignments: {totalConsignments} | Total Packages: {totalQty}
                </CardFooter>
            </Card>
        </div>
    );
}


'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Archive, Download, PlusCircle } from 'lucide-react';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getChallanData, saveChallanData, type Challan, getLrDetailsData, saveLrDetailsData, type LrDetail } from '@/lib/challan-data';
import { addHistoryLog } from '@/lib/history-data';
import { useRouter } from 'next/navigation';

const thClass = "text-primary font-bold";
const tdClass = "whitespace-nowrap";

const statusColors: { [key: string]: string } = {
  'In Stock': 'text-green-600 border-green-600/40',
  'In Loading': 'text-orange-600 border-orange-600/40',
  'In Transit': 'text-blue-600 border-blue-600/40',
  'Delivered': 'text-gray-500 border-gray-500/40',
  'Cancelled': 'text-red-600 border-red-600/40',
  'In HOLD': 'text-yellow-600 border-yellow-600/40',
};

const dispatchStatusColors: { [key: string]: string } = {
  'Short Dispatched': 'bg-yellow-200/50 hover:bg-yellow-200/80',
  'Extra Dispatched': 'bg-green-200/50 hover:bg-green-200/80',
};


export function StockDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stock, setStock] = useState<Booking[]>([]);
  const [selectedLrs, setSelectedLrs] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const router = useRouter();

  const loadStock = () => {
     try {
        const allBookings = getBookings();
        const inwardChallans = getChallanData().filter(c => c.challanType === 'Inward');
        const inwardLrDetails = getLrDetailsData().filter(lr => inwardChallans.some(c => c.challanId === lr.challanId));
        
        const inwardBookings: Booking[] = inwardLrDetails.map(lr => ({
            trackingId: `inward-${lr.lrNo}`, // Ensure a unique key
            lrNo: lr.lrNo,
            bookingDate: lr.bookingDate,
            fromCity: lr.from,
            toCity: lr.to,
            lrType: lr.lrType as any,
            sender: lr.sender,
            receiver: lr.receiver,
            itemDescription: lr.itemDescription,
            qty: lr.quantity,
            chgWt: lr.chargeWeight,
            totalAmount: lr.grandTotal,
            status: 'In Stock', // Inwarded items are always in stock initially
            itemRows: [], // Simplified for stock view
            source: 'Inward',
        }));

        // Combine system bookings that are in stock with all inward bookings
        const currentStockBookings = allBookings
            .filter(booking => ['In Stock', 'In Loading', 'In HOLD'].includes(booking.status))
            .concat(inwardBookings);
            
        // Deduplicate in case an inward booking was manually added to main bookings previously
        const uniqueStock = Array.from(new Map(currentStockBookings.map(item => [item.lrNo, item])).values());

        setStock(uniqueStock);
    } catch (error) {
        console.error("Failed to load stock from localStorage", error);
    }
  }

  useEffect(() => {
    loadStock();
  }, []);
  
  const filteredStock = useMemo(() => {
      if (!searchTerm) {
          return stock;
      }
      const lowercasedQuery = searchTerm.toLowerCase();
      return stock.filter(item => 
          item.lrNo.toLowerCase().includes(lowercasedQuery) ||
          item.fromCity.toLowerCase().includes(lowercasedQuery) ||
          item.toCity.toLowerCase().includes(lowercasedQuery) ||
          item.sender.toLowerCase().includes(lowercasedQuery) ||
          item.receiver.toLowerCase().includes(lowercasedQuery)
      );
  }, [stock, searchTerm]);

  const totalQty = useMemo(() => filteredStock.reduce((acc, item) => acc + item.qty, 0), [filteredStock]);
  const totalWeight = useMemo(() => filteredStock.reduce((acc, item) => acc + item.chgWt, 0), [filteredStock]);

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
        const stockToSelect = filteredStock.filter(item => item.status === 'In Stock');
        setSelectedLrs(new Set(stockToSelect.map(item => item.trackingId)));
    } else {
        setSelectedLrs(new Set());
    }
  }

  const handleSelectRow = (trackingId: string, checked: boolean | string) => {
      const newSelection = new Set(selectedLrs);
      if (checked) {
          newSelection.add(trackingId);
      } else {
          newSelection.delete(trackingId);
      }
      setSelectedLrs(newSelection);
  }

  const handleGenerateLoadingChallan = () => {
    if (selectedLrs.size === 0) {
      toast({ title: "No LRs Selected", description: "Please select at least one LR to generate a challan.", variant: "destructive" });
      return;
    }

    const selectedBookings = stock.filter(item => selectedLrs.has(item.trackingId));
    
    // Ensure all selected items are 'In Stock'
    const notInStock = selectedBookings.filter(item => item.status !== 'In Stock');
    if (notInStock.length > 0) {
      toast({ title: "Invalid Selection", description: `Cannot add items with status other than 'In Stock' to a challan.`, variant: "destructive" });
      return;
    }

    const allChallans = getChallanData();
    const newChallanId = `TEMP-CHLN-${Date.now()}`;

    const newChallan: Challan = {
      challanId: newChallanId,
      dispatchDate: format(new Date(), 'yyyy-MM-dd'),
      challanType: 'Dispatch',
      status: 'Pending',
      totalLr: selectedBookings.length,
      totalPackages: selectedBookings.reduce((sum, b) => sum + b.qty, 0),
      totalItems: selectedBookings.reduce((sum, b) => sum + (b.itemRows?.length || 0), 0),
      totalActualWeight: selectedBookings.reduce((sum, b) => sum + b.itemRows.reduce((s, i) => s + Number(i.actWt), 0), 0),
      totalChargeWeight: selectedBookings.reduce((sum, b) => sum + b.chgWt, 0),
      dispatchToParty: selectedBookings[0]?.toCity || '',
      vehicleNo: '',
      driverName: '',
      fromStation: selectedBookings[0]?.fromCity || '',
      toStation: selectedBookings[0]?.toCity || '',
      senderId: '',
      inwardId: '',
      inwardDate: '',
      receivedFromParty: '',
      vehicleHireFreight: 0,
      advance: 0,
      balance: 0,
      summary: {
        grandTotal: selectedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        totalTopayAmount: selectedBookings.filter(b => b.lrType === 'TOPAY').reduce((sum, b) => sum + b.totalAmount, 0),
        commission: 0, labour: 0, crossing: 0, carting: 0, balanceTruckHire: 0, debitCreditAmount: 0,
      }
    };

    saveChallanData([...allChallans, newChallan]);
    
    const newLrDetails: LrDetail[] = selectedBookings.map(b => ({
      challanId: newChallanId,
      lrNo: b.lrNo,
      lrType: b.lrType,
      sender: b.sender,
      receiver: b.receiver,
      from: b.fromCity,
      to: b.toCity,
      bookingDate: format(new Date(b.bookingDate), 'yyyy-MM-dd'),
      itemDescription: b.itemDescription,
      quantity: b.qty,
      actualWeight: b.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
      chargeWeight: b.chgWt,
      grandTotal: b.totalAmount
    }));

    const allLrDetails = getLrDetailsData();
    saveLrDetailsData([...allLrDetails, ...newLrDetails]);


    const allBookings = getBookings();
    const updatedBookings = allBookings.map(b => {
        if (selectedLrs.has(b.trackingId)) {
            addHistoryLog(b.lrNo, 'In Loading', 'System', `Added to loading challan ${newChallanId}`);
            return { ...b, status: 'In Loading' as const };
        }
        return b;
    });
    saveBookings(updatedBookings);

    toast({ 
      title: "Loading Challan Generated", 
      description: `Temporary challan ${newChallanId} created. You will be redirected to finalize it.`,
    });
    
    router.push(`/company/challan/new?challanId=${newChallanId}`);
  };

  return (
    <main className="flex-1 p-4 md:p-6 bg-secondary/30">
       <header className="mb-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Archive className="h-8 w-8" />
                Stock Management
            </h1>
        </header>
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                     <CardTitle className="font-headline">Current Stock</CardTitle>
                     <div className="flex items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search stock..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by station" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stations</SelectItem>
                                <SelectItem value="Nagpur">Nagpur</SelectItem>
                                <SelectItem value="Pune">Pune</SelectItem>
                                <SelectItem value="Mumbai">Mumbai</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                         <Button onClick={handleGenerateLoadingChallan} disabled={selectedLrs.size === 0}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Generate Loading Challan
                        </Button>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-y-auto border rounded-md max-h-[70vh]">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                        <TableHead className="w-12">
                             <Checkbox 
                                onCheckedChange={handleSelectAll}
                                checked={filteredStock.length > 0 && selectedLrs.size === filteredStock.filter(s => s.status === 'In Stock').length && selectedLrs.size > 0}
                                aria-label="Select all rows"
                            />
                        </TableHead>
                        <TableHead className={cn(thClass)}>LR No.</TableHead>
                        <TableHead className={cn(thClass)}>Booking Type</TableHead>
                        <TableHead className={cn(thClass)}>Booking Date</TableHead>
                        <TableHead className={cn(thClass)}>From</TableHead>
                        <TableHead className={cn(thClass)}>To</TableHead>
                        <TableHead className={cn(thClass)}>Sender</TableHead>
                        <TableHead className={cn(thClass)}>Receiver</TableHead>
                        <TableHead className={cn(thClass)}>Item</TableHead>
                        <TableHead className={cn(thClass, 'text-right')}>Qty</TableHead>
                        <TableHead className={cn(thClass, 'text-right')}>Chg. Wt.</TableHead>
                        <TableHead className={cn(thClass)}>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredStock.length > 0 ? (
                      filteredStock.map((item) => (
                        <TableRow 
                          key={item.trackingId} 
                          data-state={selectedLrs.has(item.trackingId) && "selected"}
                          className={cn(item.dispatchStatus && dispatchStatusColors[item.dispatchStatus])}
                        >
                            <TableCell>
                                <Checkbox
                                    checked={selectedLrs.has(item.trackingId)}
                                    onCheckedChange={(checked) => handleSelectRow(item.trackingId, checked)}
                                    aria-label={`Select row ${item.lrNo}`}
                                    disabled={item.status !== 'In Stock'}
                                />
                            </TableCell>
                            <TableCell className={cn(tdClass, "font-medium")}>{item.lrNo}</TableCell>
                            <TableCell className={cn(tdClass)}>{item.lrType}</TableCell>
                            <TableCell className={cn(tdClass)}>{format(parseISO(item.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                            <TableCell className={cn(tdClass)}>{item.fromCity}</TableCell>
                            <TableCell className={cn(tdClass)}>{item.toCity}</TableCell>
                            <TableCell className={cn(tdClass)}>{item.sender}</TableCell>
                            <TableCell className={cn(tdClass)}>{item.receiver}</TableCell>
                            <TableCell className={cn(tdClass)}>{item.itemDescription}</TableCell>
                            <TableCell className={cn(tdClass, "text-right")}>{item.qty}</TableCell>
                            <TableCell className={cn(tdClass, "text-right")}>{item.chgWt} kg</TableCell>
                            <TableCell className={cn(tdClass)}>
                                 <Badge variant="outline" className={cn('font-semibold', statusColors[item.status])}>
                                    {item.dispatchStatus || item.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center h-24">No stock items found.</TableCell>
                      </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
                {filteredStock.length > 0 && (
                 <div className="flex justify-between items-center font-bold text-sm mt-4 pr-4">
                     {selectedLrs.size > 0 && (
                        <div className="text-primary">
                            {selectedLrs.size} GR(s) Selected
                        </div>
                    )}
                    <div className="flex justify-end gap-6 ml-auto">
                        <span>Total GR: <span className="text-primary">{filteredStock.length}</span></span>
                        <span>Total Quantity: <span className="text-primary">{totalQty}</span></span>
                        <span>Total Weight: <span className="text-primary">{totalWeight.toLocaleString()} kg</span></span>
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
    </main>
  );
}

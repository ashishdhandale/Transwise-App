
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
import { getChallanData, saveChallanData, type Challan } from '@/lib/challan-data';
import { addHistoryLog } from '@/lib/history-data';

const thClass = "bg-primary/10 text-primary font-bold";
const tdClass = "whitespace-nowrap";

const statusColors: { [key: string]: string } = {
  'In Stock': 'text-green-600 border-green-600/40',
  'In Transit': 'text-blue-600 border-blue-600/40',
  'Delivered': 'text-gray-500 border-gray-500/40',
  'Cancelled': 'text-red-600 border-red-600/40',
  'In HOLD': 'text-yellow-600 border-yellow-600/40',
};

export function StockDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stock, setStock] = useState<Booking[]>([]);
  const [selectedLrs, setSelectedLrs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadStock = () => {
     try {
        const allBookings = getBookings();
        const inStockBookings = allBookings.filter(
            (booking) => booking.status === 'In Stock'
        );
        setStock(inStockBookings);
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
        setSelectedLrs(new Set(filteredStock.map(item => item.id)));
    } else {
        setSelectedLrs(new Set());
    }
  }

  const handleSelectRow = (id: string, checked: boolean | string) => {
      const newSelection = new Set(selectedLrs);
      if (checked) {
          newSelection.add(id);
      } else {
          newSelection.delete(id);
      }
      setSelectedLrs(newSelection);
  }

  const handleGenerateLoadingChallan = () => {
    if (selectedLrs.size === 0) {
      toast({ title: "No LRs Selected", description: "Please select at least one LR to generate a challan.", variant: "destructive" });
      return;
    }

    const selectedBookings = stock.filter(item => selectedLrs.has(item.id));
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
      // Set defaults for fields that will be finalized later
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

    const allBookings = getBookings();
    const updatedBookings = allBookings.map(b => {
        if (selectedLrs.has(b.id)) {
            addHistoryLog(b.lrNo, 'In Transit', 'System', `Added to loading challan ${newChallanId}`);
            return { ...b, status: 'In Transit' as const };
        }
        return b;
    });
    saveBookings(updatedBookings);

    toast({ title: "Loading Challan Generated", description: `Temporary challan ${newChallanId} has been created.` });
    setSelectedLrs(new Set());
    loadStock(); // Refresh the stock list
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
                <div className="overflow-x-auto border rounded-md max-h-[70vh]">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className={thClass}>
                             <Checkbox 
                                onCheckedChange={handleSelectAll}
                                checked={filteredStock.length > 0 && selectedLrs.size === filteredStock.length}
                                aria-label="Select all rows"
                            />
                        </TableHead>
                        <TableHead className={thClass}>LR No.</TableHead>
                        <TableHead className={thClass}>Booking Date</TableHead>
                        <TableHead className={thClass}>From</TableHead>
                        <TableHead className={thClass}>To</TableHead>
                        <TableHead className={thClass}>Sender</TableHead>
                        <TableHead className={thClass}>Receiver</TableHead>
                        <TableHead className={thClass}>Item</TableHead>
                        <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                        <TableHead className={`${thClass} text-right`}>Chg. Wt.</TableHead>
                        <TableHead className={thClass}>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredStock.length > 0 ? (
                      filteredStock.map((item) => (
                        <TableRow key={item.id} data-state={selectedLrs.has(item.id) && "selected"}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedLrs.has(item.id)}
                                    onCheckedChange={(checked) => handleSelectRow(item.id, checked)}
                                    aria-label={`Select row ${item.lrNo}`}
                                />
                            </TableCell>
                            <TableCell className={cn(tdClass, "font-medium")}>{item.lrNo}</TableCell>
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
                                    {item.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center h-24">No stock items found.</TableCell>
                      </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
                {filteredStock.length > 0 && (
                 <div className="flex justify-end gap-6 font-bold text-sm mt-4 pr-4">
                    <span>Total Quantity: <span className="text-primary">{totalQty}</span></span>
                    <span>Total Weight: <span className="text-primary">{totalWeight.toLocaleString()} kg</span></span>
                </div>
                )}
            </CardContent>
        </Card>
    </main>
  );
}

    
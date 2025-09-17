
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
import { Search, Archive, Download } from 'lucide-react';
import type { Booking } from '@/lib/bookings-dashboard-data';
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

const thClass = "bg-primary/10 text-primary font-bold";
const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';

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

  useEffect(() => {
    try {
        const savedBookings = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
        if (savedBookings) {
            const allBookings: Booking[] = JSON.parse(savedBookings);
            const inStockBookings = allBookings.filter(
                (booking) => booking.status === 'In Stock'
            );
            setStock(inStockBookings);
        }
    } catch (error) {
        console.error("Failed to load stock from localStorage", error);
    }
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
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-md max-h-[70vh]">
                <Table>
                    <TableHeader>
                    <TableRow>
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
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.lrNo}</TableCell>
                        <TableCell>{format(parseISO(item.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                        <TableCell>{item.fromCity}</TableCell>
                        <TableCell>{item.toCity}</TableCell>
                        <TableCell>{item.sender}</TableCell>
                        <TableCell>{item.receiver}</TableCell>
                        <TableCell>{item.itemDescription}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">{item.chgWt} kg</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn('font-semibold', statusColors[item.status])}>
                                {item.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center h-24">No stock items found.</TableCell>
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

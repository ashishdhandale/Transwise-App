

'use client';

import { useState, useEffect, useMemo } from 'react';
import { FilePlus, Layers, CreditCard, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveriesList } from './deliveries-list';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { ClientOnly } from '@/components/ui/client-only';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';

export function DeliveriesDashboard() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, you might filter for deliveries here.
    // For now, we'll use all bookings that are not cancelled.
    setAllBookings(getBookings().filter(b => b.status !== 'Cancelled'));
  }, []);

  const filteredBookings = useMemo(() => {
    let bookings = allBookings;

    if (fromDate && toDate) {
        const start = startOfDay(fromDate);
        const end = endOfDay(toDate);
        bookings = bookings.filter(b => {
            try {
                const bookingDate = parseISO(b.bookingDate);
                return isWithinInterval(bookingDate, { start, end });
            } catch {
                return false;
            }
        });
    }

    if (searchTerm) {
        const lowerQuery = searchTerm.toLowerCase();
        bookings = bookings.filter(b =>
            b.lrNo.toLowerCase().includes(lowerQuery) ||
            b.sender.toLowerCase().includes(lowerQuery) ||
            b.receiver.toLowerCase().includes(lowerQuery)
        );
    }

    return bookings;
}, [allBookings, searchTerm, fromDate, toDate]);

  return (
    <main className="flex-1 p-4 md:p-6 bg-white">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Delivery</h1>
      </header>
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline"><FilePlus className="mr-2 h-4 w-4" />Create New Delivery</Button>
          <Button asChild variant="outline">
            <Link href="/company/deliveries/bulk">
              <Layers className="mr-2 h-4 w-4" />Bulk Delivery
            </Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="/company/deliveries/pending">
              <Clock className="mr-2 h-4 w-4" />Pending Deliveries
            </Link>
          </Button>
          <Button variant="outline"><CreditCard className="mr-2 h-4 w-4" />Update Payment</Button>
        </div>

        {/* Filters and Search */}
        <Card className="border-gray-300">
            <CardContent className="p-4">
              <ClientOnly>
                <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex items-end gap-2 p-2 border rounded-md">
                            <span className="text-sm font-semibold text-gray-600">Delivery Information</span>
                            <div className="flex items-end gap-2">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <label className="text-xs">From Date</label>
                                    <DatePicker date={fromDate} setDate={setFromDate} />
                                </div>
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <label className="text-xs">To Date</label>
                                    <DatePicker date={toDate} setDate={setToDate} />
                                </div>
                            </div>
                        </div>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search Within list"
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
              </ClientOnly>
            </CardContent>
        </Card>

        {/* Deliveries List */}
        <DeliveriesList deliveries={filteredBookings} />
      </div>
    </main>
  );
}

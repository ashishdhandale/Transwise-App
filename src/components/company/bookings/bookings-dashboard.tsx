
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarIcon, MoreHorizontal, Pencil, Printer, Search, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { sampleBookings } from '@/lib/bookings-dashboard-data';
import { Badge } from '@/components/ui/badge';

const statusColors: { [key: string]: string } = {
  'In Stock': 'text-green-600',
  'In Transit': 'text-blue-600',
  Cancelled: 'text-red-600',
  'In HOLD': 'text-yellow-600',
};

const thClass = 'bg-cyan-600 text-white h-10';

export function BookingsDashboard() {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isClient, setIsClient] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);

  useEffect(() => {
    setIsClient(true);
    const initialDate = new Date('2014-10-03');
    setFromDate(initialDate);
    setToDate(initialDate);
  }, []);

  return (
    <main className="flex-1 p-4 md:p-6 bg-white">
      <Card className="border-2 border-cyan-200">
        <div className="p-4 space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="bg-cyan-500 hover:bg-cyan-600">
                <Link href="/company/bookings/new">New Booking (Alt+N)</Link>
            </Button>
            <Button className="bg-cyan-500 hover:bg-cyan-600">Add Offline Booking (Alt+O)</Button>
            <Button variant="outline" className="border-gray-400">Hold LR</Button>
          </div>

          {/* Booking Information and Search */}
          <div className="p-2 border rounded-md border-cyan-400">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-blue-800">Daily Booking Information</h3>
                {isClient && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn('w-[140px] justify-between text-left font-normal', !fromDate && 'text-muted-foreground')}
                        >
                          {fromDate ? format(fromDate, 'dd / MM / yyyy') : <span>Pick a date</span>}
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus /></PopoverContent>
                    </Popover>
                    <label className="text-sm">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn('w-[140px] justify-between text-left font-normal', !toDate && 'text-muted-foreground')}
                        >
                          {toDate ? format(toDate, 'dd / MM / yyyy') : <span>Pick a date</span>}
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus /></PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search Within list" className="pl-8 w-full sm:w-[250px]" />
              </div>
            </div>

            {/* Bookings Table */}
            <div className="mt-4 overflow-x-auto border-2 border-cyan-500 rounded-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={`${thClass} w-[80px]`}>ACTION</TableHead>
                    <TableHead className={`${thClass} w-[50px]`}>#</TableHead>
                    <TableHead className={thClass}>LR No</TableHead>
                    <TableHead className={thClass}>From CITY</TableHead>
                    <TableHead className={thClass}>To City</TableHead>
                    <TableHead className={thClass}>LR type</TableHead>
                    <TableHead className={thClass}>Sender</TableHead>
                    <TableHead className={thClass}>Receiver</TableHead>
                    <TableHead className={thClass}>Item & Description</TableHead>
                    <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                    <TableHead className={`${thClass} text-right`}>Chg Wt</TableHead>
                    <TableHead className={`${thClass} text-right`}>Total Amount</TableHead>
                    <TableHead className={thClass}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking, index) => (
                    <TableRow key={booking.id} className={booking.status === 'Cancelled' ? 'bg-red-200' : ''}>
                      <TableCell className="p-1 text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                                {booking.status !== 'Cancelled' && (
                                    <DropdownMenuItem className="text-red-500"><XCircle className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>
                                )}
                                {booking.status === 'Cancelled' && (
                                    <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="p-1 text-center">{index + 1}</TableCell>
                      <TableCell className="p-1">{booking.lrNo}</TableCell>
                      <TableCell className="p-1">{booking.fromCity}</TableCell>
                      <TableCell className="p-1">{booking.toCity}</TableCell>
                      <TableCell className="p-1">{booking.lrType}</TableCell>
                      <TableCell className="p-1">{booking.sender}</TableCell>
                      <TableCell className="p-1">{booking.receiver}</TableCell>
                      <TableCell className="p-1">{booking.itemDescription}</TableCell>
                      <TableCell className="p-1 text-right">{booking.qty}</TableCell>
                      <TableCell className="p-1 text-right">{booking.chgWt}</TableCell>
                      <TableCell className="p-1 text-right">{booking.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="p-1">
                         <Badge variant="outline" className={cn('font-bold', statusColors[booking.status])}>
                             {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

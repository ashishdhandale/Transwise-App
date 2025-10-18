

'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileX, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { format, parseISO, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';

const thClass = "bg-destructive/10 text-destructive font-semibold whitespace-nowrap";
const tdClass = "whitespace-nowrap uppercase";

export function CancellationReport() {
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function loadData() {
            setAllBookings(getBookings());
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
        }
        loadData();
    }, []);

    const cancelledBookings = useMemo(() => {
        let bookings = allBookings.filter(b => b.status === 'Cancelled');

        if (dateRange?.from && dateRange?.to) {
            bookings = bookings.filter(b => {
                try {
                    const bookingDate = parseISO(b.bookingDate);
                    return isWithinInterval(bookingDate, { start: dateRange.from!, end: dateRange.to! });
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
    }, [allBookings, dateRange, searchTerm]);

    const formatValue = (amount: number) => {
        if (!companyProfile) return amount.toFixed(2);
        return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-destructive flex items-center gap-2">
                    <FileX className="h-8 w-8" />
                    Cancellation Report
                </h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Cancelled Bookings</CardTitle>
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-[260px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Pick a date range</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                             <Button variant="outline" onClick={() => setDateRange(undefined)} disabled={!dateRange}>
                                Reset Dates
                            </Button>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by LR, Sender, Receiver..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                                    <TableHead className={`${thClass} text-right`}>Total Freight</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cancelledBookings.length > 0 ? (
                                    cancelledBookings.map((booking, index) => (
                                        <TableRow key={booking.trackingId}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>{booking.lrNo}</TableCell>
                                            <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yyyy')}</TableCell>
                                            <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.sender}</TableCell>
                                            <TableCell className={tdClass}>{booking.receiver}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{formatValue(booking.totalAmount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                            No cancelled bookings found for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as ShadcnTableFooter
} from '@/components/ui/table';
import { getBookings, type Booking } from '@/lib/bookings-dashboard-data';
import { getCustomers, type Customer } from '@/lib/customer-data';
import { getCities, type City } from '@/lib/city-data';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { List, Search, Printer, Download, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import type { DateRange } from 'react-day-picker';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/app/company/settings/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


const thClass = "text-left text-xs font-bold text-black border border-black p-1";
const tdClass = "text-xs border border-black p-1";

const bookingTypes = ['ALL', 'TOPAY', 'PAID', 'TBB', 'FOC'];
const sourceTypes = ['ALL', 'Regular', 'Inward'];

export function BookingTypeReport() {
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [allCities, setAllCities] = useState<City[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    const [bookingTypeFilter, setBookingTypeFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [customerFilter, setCustomerFilter] = useState<string | null>(null);
    const [destinationFilter, setDestinationFilter] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isDownloading, setIsDownloading] = useState(false);
    
    const reportRef = useRef<HTMLDivElement>(null);
    const [generationDate, setGenerationDate] = useState<Date | null>(null);

    useEffect(() => {
        setGenerationDate(new Date());
    }, []);


    useEffect(() => {
        async function loadData() {
            setAllBookings(getBookings());
            setAllCustomers(getCustomers());
            setAllCities(getCities());
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
        }
        loadData();
    }, []);

    const filteredBookings = useMemo(() => {
        return allBookings.filter(booking => {
            if (bookingTypeFilter !== 'ALL' && booking.lrType !== bookingTypeFilter) return false;
            
            const bookingSource = booking.source === 'Inward' ? 'Inward' : 'Regular';
            if (sourceFilter !== 'ALL' && bookingSource !== sourceFilter) return false;

            if (customerFilter && booking.sender !== customerFilter && booking.receiver !== customerFilter) return false;
            if (destinationFilter && booking.toCity !== destinationFilter) return false;
            if (dateRange?.from && dateRange?.to) {
                try {
                    const bookingDate = parseISO(booking.bookingDate);
                    return isWithinInterval(bookingDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
                } catch { return false; }
            }
            return true;
        });
    }, [allBookings, bookingTypeFilter, sourceFilter, customerFilter, destinationFilter, dateRange]);

    const totals = useMemo(() => {
        return {
            count: filteredBookings.length,
            qty: filteredBookings.reduce((sum, b) => sum + b.qty, 0),
            chgWt: filteredBookings.reduce((sum, b) => sum + b.chgWt, 0),
            totalAmount: filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        };
    }, [filteredBookings]);

    const customerOptions = useMemo(() => {
        const customerNames = new Set<string>();
        allCustomers.forEach(c => customerNames.add(c.name));
        allBookings.forEach(b => {
            if(b.sender) customerNames.add(b.sender);
            if(b.receiver) customerNames.add(b.receiver);
        });
        return Array.from(customerNames).sort().map(name => ({ label: name, value: name }));
    }, [allCustomers, allBookings]);

    const cityOptions = useMemo(() => allCities.map(c => ({ label: c.name.toUpperCase(), value: c.name })), [allCities]);
    const formatValue = (amount: number) => companyProfile ? amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount.toFixed(2);
    
    const resetFilters = () => {
        setBookingTypeFilter('ALL');
        setSourceFilter('ALL');
        setCustomerFilter(null);
        setDestinationFilter(null);
        setDateRange(undefined);
    }
    
    const handleDownloadPdf = async () => {
        const input = reportRef.current;
        if (!input) return;

        setIsDownloading(true);

        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps= pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        const ratio = imgWidth / imgHeight;
        let finalImgHeight = pdfHeight - 20; // 10mm margin top and bottom
        let finalImgWidth = finalImgHeight * ratio;

        if (finalImgWidth > pdfWidth - 20) {
            finalImgWidth = pdfWidth - 20;
            finalImgHeight = finalImgWidth / ratio;
        }

        const x = (pdfWidth - finalImgWidth) / 2;
        const y = 10;
        
        pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
        pdf.save(`booking-report-${new Date().toISOString().split('T')[0]}.pdf`);
        setIsDownloading(false);
    };

    return (
        <div className="space-y-4">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <List className="h-8 w-8" />
                    Booking Report
                </h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Filter Report</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium">Booking Type</label>
                        <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {bookingTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Booking Source</label>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {sourceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Customer</label>
                        <Combobox options={customerOptions} value={customerFilter || ''} onChange={(val) => setCustomerFilter(val || null)} placeholder="All Customers" />
                    </div>
                     <div>
                        <label className="text-sm font-medium">Destination</label>
                        <Combobox options={cityOptions} value={destinationFilter || ''} onChange={(val) => setDestinationFilter(val || null)} placeholder="All Destinations" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Date Range</label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
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
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={resetFilters}>Reset</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Filtered Bookings ({totals.count})</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            PDF
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="bg-gray-100 p-4">
                     <div ref={reportRef} className="p-8 bg-white shadow-lg font-sans">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{companyProfile?.companyName || 'Your Company'}</h2>
                            <h3 className="text-xl font-semibold text-gray-600">Booking Report</h3>
                            {generationDate && <p className="text-xs text-gray-500">Generated on: {format(generationDate, "dd-MMM-yyyy hh:mm a")}</p>}
                            <div className="text-xs text-gray-500 mt-1">
                                {bookingTypeFilter !== 'ALL' && <p>Booking Type: {bookingTypeFilter}</p>}
                                {customerFilter && <p>Customer: {customerFilter}</p>}
                                {dateRange?.from && <p>Date Range: {format(dateRange.from, "dd-MMM-yy")} to {dateRange.to ? format(dateRange.to, "dd-MMM-yy") : ''}</p>}
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={thClass}>#</TableHead>
                                    <TableHead className={thClass}>LR No.</TableHead>
                                    <TableHead className={thClass}>Date</TableHead>
                                    <TableHead className={thClass}>Type</TableHead>
                                    <TableHead className={thClass}>From</TableHead>
                                    <TableHead className={thClass}>To</TableHead>
                                    <TableHead className={thClass}>Sender</TableHead>
                                    <TableHead className={thClass}>Receiver</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Chg. Wt.</TableHead>
                                    <TableHead className={`${thClass} text-right`}>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => (
                                        <TableRow key={booking.trackingId}>
                                            <TableCell className={tdClass}>{index + 1}</TableCell>
                                            <TableCell className={`${tdClass} font-medium`}>{booking.lrNo}</TableCell>
                                            <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yy')}</TableCell>
                                            <TableCell className={tdClass}>{booking.lrType}</TableCell>
                                            <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                                            <TableCell className={tdClass}>{booking.toCity}</TableCell>
                                            <TableCell className={`${tdClass} max-w-[150px] truncate`}>{booking.sender}</TableCell>
                                            <TableCell className={`${tdClass} max-w-[150px] truncate`}>{booking.receiver}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{booking.qty}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{booking.chgWt.toFixed(2)}</TableCell>
                                            <TableCell className={`${tdClass} text-right`}>{formatValue(booking.totalAmount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center h-24 text-muted-foreground">
                                            No bookings found for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {filteredBookings.length > 0 && (
                                <ShadcnTableFooter>
                                    <TableRow className="bg-gray-200">
                                        <TableCell colSpan={8} className="text-right font-bold text-base">Total</TableCell>
                                        <TableCell className="text-right font-bold text-base">{totals.qty}</TableCell>
                                        <TableCell className="text-right font-bold text-base">{totals.chgWt.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold text-base">{formatValue(totals.totalAmount)}</TableCell>
                                    </TableRow>
                                </ShadcnTableFooter>
                            )}
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}



'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MoreHorizontal, Pencil, Printer, Search, Trash2, XCircle, Download, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { EditBookingDialog } from './edit-booking-dialog';
import type { CompanyProfileFormValues } from '../settings/company-profile-settings';
import { getCompanyProfile } from '@/app/company/settings/actions';
import { BookingReceipt } from './booking-receipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';

const statusColors: { [key: string]: string } = {
  'In Stock': 'text-green-600',
  'In Transit': 'text-blue-600',
  Cancelled: 'text-red-600',
  'In HOLD': 'text-yellow-600',
  'Delivered': 'text-gray-500'
};

const thClass = 'bg-cyan-600 text-white h-10';

export function BookingsDashboard() {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isClient, setIsClient] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
  
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [bookingToPrint, setBookingToPrint] = useState<Booking | null>(null);
  const [copyTypeToPrint, setCopyTypeToPrint] = useState<'Sender' | 'Receiver' | 'Driver' | 'Office' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const loadBookings = async () => {
    try {
        const profile = await getCompanyProfile();
        setCompanyProfile(profile);
        const savedBookings = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
        if (savedBookings) {
            setBookings(JSON.parse(savedBookings));
        }
    } catch (error) {
        console.error("Failed to load bookings from localStorage", error);
    }
  }

  useEffect(() => {
    setIsClient(true);
    loadBookings();
  }, []);

  const handleEditOpen = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsEditDialogOpen(true);
  };
  
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedBookingId(null);
    loadBookings(); // Refresh data after closing dialog
  };

  const handlePrintOpen = (booking: Booking, copyType: 'Sender' | 'Receiver' | 'Driver' | 'Office') => {
      setBookingToPrint(booking);
      setCopyTypeToPrint(copyType);
      setIsPrintDialogOpen(true);
  }

  const handleDownloadPdf = async () => {
    const input = printRef.current;
    if (!input || !bookingToPrint || !copyTypeToPrint) return;

    setIsDownloading(true);

    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.height / imgProps.width;
    const imgWidth = pdfWidth - 20;
    const imgHeight = imgWidth * ratio;

    let height = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    height -= pdfHeight;

    while (height > 0) {
      position = height - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      height -= pdfHeight;
    }
    pdf.save(`receipt-${bookingToPrint.lrNo}-${copyTypeToPrint}.pdf`);
    setIsDownloading(false);
    setIsPrintDialogOpen(false);
  };

  const filteredBookings = useMemo(() => {
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    if (!searchQuery) {
      return sortedBookings;
    }
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedBookings.filter((booking) => 
        booking.lrNo.toLowerCase().includes(lowercasedQuery) ||
        booking.sender.toLowerCase().includes(lowercasedQuery) ||
        booking.receiver.toLowerCase().includes(lowercasedQuery) ||
        booking.fromCity.toLowerCase().includes(lowercasedQuery) ||
        booking.toCity.toLowerCase().includes(lowercasedQuery)
    );
  }, [bookings, searchQuery]);

  const formatValue = (amount: number) => {
    if (!companyProfile) return amount.toLocaleString();
    return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  const tdClass = "p-1 whitespace-nowrap";

  return (
    <>
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
                  <Input 
                    type="search" 
                    placeholder="Search Within list" 
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                      <TableHead className={thClass}>DATE</TableHead>
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
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking, index) => (
                      <TableRow key={booking.id} className={booking.status === 'Cancelled' ? 'bg-red-200' : ''}>
                        <TableCell className="p-1 text-center whitespace-nowrap">
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
                                  <DropdownMenuItem onClick={() => handleEditOpen(booking.id)}>
                                      <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                   <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <Printer className="mr-2 h-4 w-4" />
                                      Print
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handlePrintOpen(booking, 'Sender')}>Sender Copy</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrintOpen(booking, 'Receiver')}>Receiver Copy</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrintOpen(booking, 'Driver')}>Driver Copy</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrintOpen(booking, 'Office')}>Office Copy</DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                  {booking.status !== 'Cancelled' && (
                                      <DropdownMenuItem className="text-red-500"><XCircle className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>
                                  )}
                                  {booking.status === 'Cancelled' && (
                                      <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className={`${tdClass} text-center`}>{index + 1}</TableCell>
                        <TableCell className={tdClass}>{booking.lrNo}</TableCell>
                        <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yy')}</TableCell>
                        <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                        <TableCell className={tdClass}>{booking.toCity}</TableCell>
                        <TableCell className={tdClass}>{booking.lrType}</TableCell>
                        <TableCell className={tdClass}>{booking.sender}</TableCell>
                        <TableCell className={tdClass}>{booking.receiver}</TableCell>
                        <TableCell className={tdClass}>{booking.itemDescription}</TableCell>
                        <TableCell className={`${tdClass} text-right`}>{booking.qty}</TableCell>
                        <TableCell className={`${tdClass} text-right`}>{booking.chgWt}</TableCell>
                        <TableCell className={`${tdClass} text-right`}>{formatValue(booking.totalAmount)}</TableCell>
                        <TableCell className={tdClass}>
                           <Badge variant="outline" className={cn('font-bold', statusColors[booking.status])}>
                               {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center h-24">No bookings found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Card>
      </main>
      {selectedBookingId && (
        <EditBookingDialog
          isOpen={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
          bookingId={selectedBookingId}
        />
      )}
       {bookingToPrint && copyTypeToPrint && companyProfile && (
        <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Print Receipt: {bookingToPrint.lrNo} - {copyTypeToPrint} Copy</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-2 bg-gray-200 rounded-md">
                    <div ref={printRef}>
                       <BookingReceipt booking={bookingToPrint} companyProfile={companyProfile} copyType={copyTypeToPrint} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>Close</Button>
                    <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}

    

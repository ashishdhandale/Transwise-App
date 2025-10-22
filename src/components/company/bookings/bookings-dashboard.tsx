

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarIcon, MoreHorizontal, Pencil, Printer, Search, Trash2, XCircle, Download, Loader2, Eye, FileWarning } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/bookings-dashboard-data';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { addHistoryLog } from '@/lib/history-data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { EditBookingDialog } from './edit-booking-dialog';
import { ViewBookingDialog } from './view-booking-dialog';
import { loadCompanySettingsFromStorage, type AllCompanySettings } from '@/app/company/settings/actions';
import { BookingReceipt } from './booking-receipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PartialCancellationDialog } from './partial-cancellation-dialog';
import { Label } from '@/components/ui/label';
import { ClientOnly } from '@/components/ui/client-only';

const LOCAL_STORAGE_KEY_BOOKINGS = 'transwise_bookings';

const statusColors: { [key: string]: string } = {
  'In Stock': 'text-green-600',
  'In Loading': 'text-orange-600',
  'In Transit': 'text-blue-600',
  Cancelled: 'text-red-600',
  'In HOLD': 'text-yellow-600',
  'Delivered': 'text-gray-500'
};

const thClass = 'bg-cyan-600 text-white h-10 whitespace-nowrap';

// Temporary function to calculate the next LR number
const getNextLrNumber = (): string => {
  try {
    const allBookings = getBookings();
    const companyProfile = loadCompanySettingsFromStorage();

    const systemBookings = allBookings.filter(b => !b.source || b.source === 'System');

    if (systemBookings.length === 0) {
      const prefix = companyProfile?.grnFormat === 'with_char' ? (companyProfile.lrPrefix?.trim() || '') : '';
      return `${prefix}1`.padStart(2, '0');
    }

    // Sort by creation date to find the most recent booking
    systemBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    
    const lastBooking = systemBookings[0];
    const match = lastBooking.lrNo.match(/\d+$/);
    
    let lastSequence = 0;
    if (match) {
        lastSequence = parseInt(match[0], 10);
    }

    const newSequence = lastSequence + 1;
    const prefix = companyProfile?.grnFormat === 'with_char' ? (companyProfile.lrPrefix?.trim() || '') : '';
    
    return `${prefix}${String(newSequence).padStart(2, '0')}`;
  } catch (e) {
    console.error(e);
    return "Could not calculate";
  }
};


export function BookingsDashboard() {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isClient, setIsClient] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPartialCancelDialogOpen, setIsPartialCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);
  const [nextLr, setNextLr] = useState('');
  
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [bookingToPrint, setBookingToPrint] = useState<Booking | null>(null);
  const [copyTypeToPrint, setCopyTypeToPrint] = useState<'Sender' | 'Receiver' | 'Driver' | 'Office' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const [isCancelOptionsOpen, setIsCancelOptionsOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelConfirmationInput, setCancelConfirmationInput] = useState('');

  const router = useRouter();
  const { toast } = useToast();

  const loadBookings = () => {
    try {
        const profile = loadCompanySettingsFromStorage();
        setCompanyProfile(profile);
        setBookings(getBookings());
    } catch (error) {
        console.error("Failed to load bookings from localStorage", error);
    }
  }

  useEffect(() => {
    setIsClient(true);
    loadBookings();
    setNextLr(getNextLrNumber());
  }, []);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);


  const handleEditOpen = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsEditDialogOpen(true);
  };
  
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedBookingId(null);
    loadBookings(); // Refresh data after closing dialog
  };

  const handleViewOpen = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsViewDialogOpen(true);
  };
  
  const handleViewDialogClose = () => {
    setIsViewDialogOpen(false);
    setSelectedBookingId(null);
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
  
  const handleCancelClick = (booking: Booking) => {
    if (booking.status !== 'In Stock') {
      toast({
        title: 'Cancellation Failed',
        description: 'Only bookings with "In Stock" status can be cancelled.',
        variant: 'destructive',
      });
      return;
    }
    setBookingToCancel(booking);
    setIsCancelOptionsOpen(true);
  };
  
  const handleCompleteCancel = () => {
      setIsCancelOptionsOpen(false);
      setIsCancelConfirmationOpen(true);
  };

  const handlePartialCancel = () => {
      if (!bookingToCancel) return;
      setIsCancelOptionsOpen(false);
      setSelectedBookingId(bookingToCancel.trackingId);
      setIsPartialCancelDialogOpen(true);
  };

  const handlePartialCancelDialogClose = () => {
    setIsPartialCancelDialogOpen(false);
    setSelectedBookingId(null);
    loadBookings();
  }

  const confirmCompleteCancellation = () => {
    if (!bookingToCancel) return;

    const updatedBookings = bookings.map(b => 
      b.trackingId === bookingToCancel.trackingId ? { ...b, status: 'Cancelled' as const } : b
    );
    saveBookings(updatedBookings);
    setBookings(updatedBookings);
    addHistoryLog(bookingToCancel.lrNo, 'Booking Cancelled', 'Admin', 'Booking status set to Cancelled.');
    toast({
      title: 'Booking Cancelled',
      description: `LR No: ${bookingToCancel.lrNo} has been successfully cancelled.`,
    });
    setIsCancelConfirmationOpen(false);
    setCancelConfirmationInput('');
    setBookingToCancel(null);
  };


  const filteredBookings = useMemo(() => {
    const sortedBookings = [...bookings]
        .filter(b => b.source !== 'Inward' && !b.lrNo.includes('-R')) // Exclude inward and return bookings
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    if (!debouncedSearchQuery) {
      return sortedBookings;
    }
    
    const lowercasedQuery = debouncedSearchQuery.toLowerCase();
    return sortedBookings.filter((booking) => 
        booking.lrNo.toLowerCase().includes(lowercasedQuery) ||
        booking.sender.toLowerCase().includes(lowercasedQuery) ||
        booking.receiver.toLowerCase().includes(lowercasedQuery) ||
        booking.fromCity.toLowerCase().includes(lowercasedQuery) ||
        booking.toCity.toLowerCase().includes(lowercasedQuery)
    );
  }, [bookings, debouncedSearchQuery]);

  const formatCurrency = (amount: number) => {
    if (!companyProfile) return amount.toLocaleString();
    return amount.toLocaleString(companyProfile.countryCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  const tdClass = "p-1 whitespace-nowrap";

  return (
    <ClientOnly>
      <main className="flex-1 p-4 md:p-6 bg-white">
        {nextLr && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Next LR Number Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">If you create a new booking now, the next automatically generated LR number will be: <strong className="text-2xl text-blue-600">{nextLr}</strong></p>
            </CardContent>
          </Card>
        )}
        <Card className="border-2 border-cyan-200">
          <div className="p-4 space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild className="bg-cyan-500 hover:bg-cyan-600">
                  <Link href="/company/bookings/new">New Booking (Alt+N)</Link>
              </Button>
              <Button asChild className="bg-cyan-500 hover:bg-cyan-600">
                  <Link href="/company/bookings/new?mode=offline">Add Offline Booking (Alt+O)</Link>
              </Button>
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
              <div className="mt-4 overflow-x-auto border-2 border-cyan-500 rounded-sm uppercase">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={`${thClass} w-[80px]`}>Action</TableHead>
                      <TableHead className={`${thClass} w-[50px]`}>#</TableHead>
                      <TableHead className={thClass}>LR No</TableHead>
                      <TableHead className={thClass}>Date</TableHead>
                      <TableHead className={thClass}>From City</TableHead>
                      <TableHead className={thClass}>To City</TableHead>
                      <TableHead className={thClass}>LR Type</TableHead>
                      <TableHead className={thClass}>Sender</TableHead>
                      <TableHead className={thClass}>Receiver</TableHead>
                      <TableHead className={thClass}>Contents</TableHead>
                      <TableHead className={`${thClass} text-right`}>Qty</TableHead>
                      <TableHead className={`${thClass} text-right`}>Chg Wt</TableHead>
                      <TableHead className={`${thClass} text-right`}>Total Amount</TableHead>
                      <TableHead className={thClass}>Status</TableHead>
                      <TableHead className={thClass}>Load Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TooltipProvider>
                    <TableBody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                        <TableRow key={booking.trackingId} className={cn(booking.status === 'Cancelled' && 'bg-destructive/20 hover:bg-destructive/30')}>
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
                                    <DropdownMenuItem onClick={() => handleViewOpen(booking.trackingId)}>
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => handleEditOpen(booking.trackingId)}
                                        disabled={booking.status === 'Cancelled'}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger disabled={booking.status === 'Cancelled'}>
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
                                        <DropdownMenuItem className="text-red-500" onClick={() => handleCancelClick(booking)}>
                                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                                        </DropdownMenuItem>
                                    )}
                                    {booking.status === 'Cancelled' && (
                                        <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className={`${tdClass} text-center`}>{index + 1}</TableCell>
                          <TableCell className={tdClass}>
                            <Tooltip>
                              <TooltipTrigger asChild><p className="cursor-help">{booking.lrNo}</p></TooltipTrigger>
                              <TooltipContent><p>Tracking ID: {booking.trackingId}</p></TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className={tdClass}>{format(parseISO(booking.bookingDate), 'dd-MMM-yy')}</TableCell>
                          <TableCell className={tdClass}>{booking.fromCity}</TableCell>
                          <TableCell className={tdClass}>{booking.toCity}</TableCell>
                          <TableCell className={tdClass}>{booking.lrType}</TableCell>
                          <TableCell className={tdClass}>{booking.sender}</TableCell>
                          <TableCell className={tdClass}>{booking.receiver}</TableCell>
                          <TableCell className={tdClass}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="truncate max-w-[200px]">{booking.itemDescription}</p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{booking.itemDescription}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className={`${tdClass} text-right`}>{booking.qty}</TableCell>
                          <TableCell className={`${tdClass} text-right`}>{booking.chgWt}</TableCell>
                          <TableCell className={`${tdClass} text-right`}>{formatCurrency(booking.totalAmount)}</TableCell>
                          <TableCell className={tdClass}>
                            <Badge variant="outline" className={cn('font-bold', statusColors[booking.status])}>
                                {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className={tdClass}>{booking.loadType}</TableCell>
                        </TableRow>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={15} className="text-center h-24">No bookings found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </TooltipProvider>
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
       {selectedBookingId && (
        <ViewBookingDialog
          isOpen={isViewDialogOpen}
          onOpenChange={handleViewDialogClose}
          bookingId={selectedBookingId}
        />
      )}
      {selectedBookingId && (
          <PartialCancellationDialog
            isOpen={isPartialCancelDialogOpen}
            onOpenChange={handlePartialCancelDialogClose}
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

      {/* Cancellation Options Dialog */}
      <Dialog open={isCancelOptionsOpen} onOpenChange={setIsCancelOptionsOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cancel Booking: {bookingToCancel?.lrNo}</DialogTitle>
                <DialogDescription>
                    How would you like to cancel this booking? You can cancel the entire booking or make a partial cancellation by editing quantities.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="destructive" onClick={handleCompleteCancel}>
                    <XCircle className="mr-2 h-4 w-4"/>
                    Complete Cancellation
                </Button>
                <Button variant="outline" onClick={handlePartialCancel}>
                    <Pencil className="mr-2 h-4 w-4"/>
                    Partial Cancellation (Edit)
                </Button>
            </div>
        </DialogContent>
      </Dialog>
      
      {/* Final Confirmation for Complete Cancellation */}
      <AlertDialog open={isCancelConfirmationOpen} onOpenChange={setIsCancelConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will completely cancel the booking for LR No: <span className="font-bold">{bookingToCancel?.lrNo}</span>. This cannot be undone.
              <div className="mt-4">
                <Label htmlFor="cancel-confirm-input" className="text-foreground">Please type <span className="font-bold text-destructive">CANCEL</span> to confirm.</Label>
                <Input 
                  id="cancel-confirm-input" 
                  value={cancelConfirmationInput}
                  onChange={(e) => setCancelConfirmationInput(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelConfirmationInput('')}>Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCompleteCancellation} 
              disabled={cancelConfirmationInput !== 'CANCEL'}
              className="bg-destructive hover:bg-destructive/90">
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientOnly>
  );
}


'use client';

import { BookingDetailsSection } from '@/components/company/bookings/booking-details-section';
import { PartyDetailsSection } from '@/components/company/bookings/party-details-section';
import { ItemDetailsTable, type ItemRow } from '@/components/company/bookings/item-details-table';
import { ChargesSection } from '@/components/company/bookings/charges-section';
import { DeliveryInstructionsSection } from '@/components/company/bookings/delivery-instructions-section';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { MainActionsSection } from '@/components/company/bookings/main-actions-section';
import type { Booking } from '@/lib/bookings-dashboard-data';
import type { City, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addHistoryLog } from '@/lib/history-data';
import { getBookings, saveBookings } from '@/lib/bookings-dashboard-data';
import { format } from 'date-fns';
import { BookingReceipt } from './booking-receipt';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';


const CUSTOMERS_KEY = 'transwise_customers';


const createEmptyRow = (id: number): ItemRow => ({
  id,
  ewbNo: '',
  itemName: 'Frm MAS',
  description: '',
  qty: '',
  actWt: '',
  chgWt: '',
  rate: '',
  freightOn: 'Act.wt',
  lumpsum: '',
  pvtMark: '',
  invoiceNo: '',
  dValue: '',
});

interface BookingFormProps {
    bookingId?: string;
    onSaveSuccess?: () => void;
    onClose?: () => void;
}

const generateChangeDetails = (oldBooking: Booking, newBooking: Booking): string => {
    const changes: string[] = [];

    if (oldBooking.bookingDate && newBooking.bookingDate && format(new Date(oldBooking.bookingDate), 'yyyy-MM-dd') !== format(new Date(newBooking.bookingDate), 'yyyy-MM-dd')) {
        changes.push(`- Booking Date changed from '${format(new Date(oldBooking.bookingDate), 'dd-MMM-yyyy')}' to '${format(new Date(newBooking.bookingDate), 'dd-MMM-yyyy')}'`);
    }

    if (oldBooking.lrType !== newBooking.lrType) {
        changes.push(`- Booking Type changed from '${oldBooking.lrType}' to '${newBooking.lrType}'`);
    }
    if (oldBooking.fromCity !== newBooking.fromCity) {
        changes.push(`- From Station changed from '${oldBooking.fromCity}' to '${newBooking.fromCity}'`);
    }
    if (oldBooking.toCity !== newBooking.toCity) {
        changes.push(`- To Station changed from '${oldBooking.toCity}' to '${newBooking.toCity}'`);
    }
    if (oldBooking.sender !== newBooking.sender) {
        changes.push(`- Sender changed from '${oldBooking.sender}' to '${newBooking.sender}'`);
    }
    if (oldBooking.receiver !== newBooking.receiver) {
        changes.push(`- Receiver changed from '${oldBooking.receiver}' to '${newBooking.receiver}'`);
    }
     if (oldBooking.totalAmount !== newBooking.totalAmount) {
        changes.push(`- Grand Total changed from '${oldBooking.totalAmount.toFixed(2)}' to '${newBooking.totalAmount.toFixed(2)}'`);
    }
    
    // Deep compare item rows
    const oldItems = oldBooking.itemRows || [];
    const newItems = newBooking.itemRows || [];
    const maxItems = Math.max(oldItems.length, newItems.length);

    for (let i = 0; i < maxItems; i++) {
        const oldItem = oldItems[i];
        const newItem = newItems[i];
        const itemChanges: string[] = [];

        if (!oldItem && newItem) {
            itemChanges.push(`Added new item: ${newItem.itemName || 'N/A'}`);
        } else if (oldItem && !newItem) {
            itemChanges.push(`Removed item: ${oldItem.itemName || 'N/A'}`);
        } else if (oldItem && newItem) {
            const itemFields: (keyof ItemRow)[] = ['ewbNo', 'itemName', 'description', 'qty', 'actWt', 'chgWt', 'rate', 'lumpsum', 'pvtMark', 'invoiceNo', 'dValue'];
            itemFields.forEach(field => {
                if (String(oldItem[field] || '') !== String(newItem[field] || '')) {
                    itemChanges.push(`'${String(field)}' from '${oldItem[field] || ""}' to '${newItem[field] || ""}'`);
                }
            });
        }

        if (itemChanges.length > 0) {
            changes.push(`- Item #${i + 1} updated: ${itemChanges.join(', ')}`);
        }
    }


    return changes.length > 0 ? changes.join('\n') : 'No changes detected.';
}


export function BookingForm({ bookingId, onSaveSuccess, onClose }: BookingFormProps) {
    const isEditMode = !!bookingId;
    
    const [itemRows, setItemRows] = useState<ItemRow[]>([]);
    const [bookingType, setBookingType] = useState('TOPAY');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [currentGrNumber, setCurrentGrNumber] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);

    const [taxPaidBy, setTaxPaidBy] = useState('Not Applicable');
    const [isGstApplicable, setIsGstApplicable] = useState(false);
    const [additionalCharges, setAdditionalCharges] = useState<{ [key: string]: number; }>({});
    const [initialChargesFromBooking, setInitialChargesFromBooking] = useState<{ [key: string]: number; } | undefined>(undefined);

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<Booking | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const generateGrNumber = (bookings: Booking[], prefix: string) => {
        const relevantGrNumbers = bookings
            .map(b => b.lrNo)
            .filter(lrNo => lrNo.startsWith(prefix));

        if (relevantGrNumbers.length === 0) {
            return `${prefix}01`;
        }

        const lastSequence = relevantGrNumbers
            .map(lrNo => parseInt(lrNo.substring(prefix.length), 10))
            .filter(num => !isNaN(num))
            .reduce((max, current) => Math.max(max, current), 0);
            
        const newSequence = lastSequence + 1;
        
        return `${prefix}${String(newSequence).padStart(2, '0')}`;
    };

    useEffect(() => {
        async function loadInitialData() {
            try {
                const profile = await getCompanyProfile();
                setCompanyProfile(profile);

                const parsedBookings = getBookings();
                setAllBookings(parsedBookings);

                if (isEditMode) {
                    const bookingToEdit = parsedBookings.find(b => b.id === bookingId);
                    if (bookingToEdit) {
                        const savedCustomers: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
                        const senderProfile = savedCustomers.find(c => c.name === bookingToEdit.sender) || { id: 0, name: bookingToEdit.sender, gstin: '', address: '', mobile: '', email: '', type: 'Company' };
                        const receiverProfile = savedCustomers.find(c => c.name === bookingToEdit.receiver) || { id: 0, name: bookingToEdit.receiver, gstin: '', address: '', mobile: '', email: '', type: 'Company' };

                        setCurrentGrNumber(bookingToEdit.lrNo);
                        setBookingDate(new Date(bookingToEdit.bookingDate));
                        setBookingType(bookingToEdit.lrType);
                        setFromStation({ id: 0, name: bookingToEdit.fromCity, aliasCode: '', pinCode: '' });
                        setToStation({ id: 0, name: bookingToEdit.toCity, aliasCode: '', pinCode: '' });
                        setSender(senderProfile);
                        setReceiver(receiverProfile);
                        setItemRows(bookingToEdit.itemRows || Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)));
                        setGrandTotal(bookingToEdit.totalAmount);
                        setAdditionalCharges(bookingToEdit.additionalCharges || {});
                        setInitialChargesFromBooking(bookingToEdit.additionalCharges || {});
                        setTaxPaidBy(bookingToEdit.taxPaidBy || 'Not Applicable');

                    } else {
                         toast({ title: 'Error', description: 'Booking not found.', variant: 'destructive'});
                    }

                } else {
                    let grnPrefix = (profile?.grnPrefix?.trim()) ? profile.grnPrefix.trim() : 'CONAG';
                    setCurrentGrNumber(generateGrNumber(parsedBookings, grnPrefix));
                    setItemRows(Array.from({ length: 2 }, (_, i) => createEmptyRow(Date.now() + i)));
                }

            } catch (error) {
                console.error("Failed to process bookings from localStorage or fetch profile", error);
                toast({ title: 'Error', description: 'Could not load necessary data.', variant: 'destructive'});
            }
        }
        
        loadInitialData();
    // We only want this to run once on mount, so we pass an empty dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId, isEditMode, toast]);

    useEffect(() => {
        setIsGstApplicable(taxPaidBy !== 'Not Applicable');
    }, [taxPaidBy]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);


    const handleSaveOrUpdate = async () => {
        if (!fromStation || !toStation || !sender || !receiver || !bookingDate) {
            toast({ title: 'Missing Information', description: 'Please fill all required fields.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 100)); // allow UI to update

        const newBookingData: Omit<Booking, 'id'> = {
            lrNo: currentGrNumber,
            bookingDate: bookingDate.toISOString(),
            fromCity: fromStation.name,
            toCity: toStation.name,
            lrType: bookingType as Booking['lrType'],
            sender: sender.name,
            receiver: receiver.name,
            itemDescription: itemRows.map(r => `${r.itemName} - ${r.description}`).join(', '),
            qty: itemRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
            chgWt: itemRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
            totalAmount: grandTotal,
            status: 'In Stock',
            itemRows: itemRows,
            additionalCharges: additionalCharges,
            taxPaidBy: taxPaidBy,
        };

        try {
            if (isEditMode) {
                const oldBooking = allBookings.find(b => b.id === bookingId);
                if (!oldBooking) {
                    toast({ title: 'Error', description: 'Original booking not found for update.', variant: 'destructive' });
                    setIsSubmitting(false);
                    return;
                }

                const updatedBooking = { ...oldBooking, ...newBookingData };
                const changeDetails = generateChangeDetails(oldBooking, updatedBooking);
                
                const updatedBookings = allBookings.map(b => b.id === bookingId ? updatedBooking : b);
                saveBookings(updatedBookings);
                
                if (changeDetails !== 'No changes detected.') {
                    addHistoryLog(currentGrNumber, 'Booking Updated', 'Admin', changeDetails);
                }

                toast({ title: 'Booking Updated', description: `Successfully updated GR Number: ${currentGrNumber}` });
                if (onSaveSuccess) onSaveSuccess();
            } else {
                const newBooking: Booking = { id: `booking_${Date.now()}`, ...newBookingData };
                const updatedBookings = [...allBookings, newBooking];
                saveBookings(updatedBookings);
                addHistoryLog(currentGrNumber, 'Booking Created', 'Admin');
                toast({ title: 'Booking Saved', description: `Successfully saved GR Number: ${currentGrNumber}` });
                
                setReceiptData(newBooking);
                setShowReceipt(true);
            }
        } catch (error) {
             toast({ title: 'Error Saving Data', description: `Could not save to local storage.`, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDownloadPdf = async () => {
        const input = receiptRef.current;
        if (!input) return;

        setIsDownloading(true);
        
        await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: true,
            scrollY: -window.scrollY
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            // A4 size in mm: 210 x 297. We use this ratio for Legal size (216 x 356 mm)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'legal',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / ratio;
             if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * ratio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = 0;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`receipt-${receiptData?.lrNo || 'download'}.pdf`);
        });

        setIsDownloading(false);
    };

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold text-primary">{isEditMode ? `Edit Booking: ${currentGrNumber}` : 'Create New Booking'}</h1>
        <Card className="border-2 border-green-200">
            <CardContent className="p-4 space-y-4">
                <BookingDetailsSection 
                    bookingType={bookingType} 
                    onBookingTypeChange={setBookingType}
                    onFromStationChange={setFromStation}
                    onToStationChange={setToStation}
                    fromStation={fromStation}
                    toStation={toStation}
                    grNumber={currentGrNumber}
                    bookingDate={bookingDate}
                    onBookingDateChange={setBookingDate}
                    isEditMode={isEditMode}
                    companyProfile={companyProfile}
                />
                <PartyDetailsSection 
                    onSenderChange={setSender}
                    onReceiverChange={setReceiver}
                    sender={sender}
                    receiver={receiver}
                    onTaxPaidByChange={setTaxPaidBy}
                    taxPaidBy={taxPaidBy}
                />
                <ItemDetailsTable rows={itemRows} onRowsChange={setItemRows} />
                
                 <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
                    <DeliveryInstructionsSection />
                    <ChargesSection 
                        basicFreight={basicFreight} 
                        onGrandTotalChange={setGrandTotal} 
                        initialGrandTotal={isEditMode ? grandTotal : undefined}
                        isGstApplicable={isGstApplicable}
                        onChargesChange={setAdditionalCharges}
                        initialCharges={initialChargesFromBooking}
                        profile={companyProfile}
                    />
                </div>
                
                <div className="space-y-4">
                    <div className="text-center py-4">
                        <p className="text-xl font-bold text-green-600">
                            Booking Type: {bookingType}
                        </p>
                    </div>
                    <Separator />
                    <MainActionsSection onSave={handleSaveOrUpdate} isEditMode={isEditMode} onClose={onClose} />
                </div>
            </CardContent>
        </Card>
        
        {receiptData && companyProfile && (
            <Dialog open={showReceipt} onOpenChange={(isOpen) => {
                 if (!isOpen) {
                    window.location.reload(); // Reset form when closing dialog
                 }
                 setShowReceipt(isOpen);
            }}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Receipt Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-auto p-4 bg-gray-200">
                       <div ref={receiptRef} className="bg-white shadow-lg mx-auto" style={{width: '216mm', minHeight: '356mm', padding: '10mm'}}>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Receiver" />
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Sender" />
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Driver" />
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Office" />
                       </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => window.location.reload()}>Close & New Booking</Button>
                        <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
}

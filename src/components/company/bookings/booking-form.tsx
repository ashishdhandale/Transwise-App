

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
import type { Booking, FtlDetails } from '@/lib/bookings-dashboard-data';
import type { City, Customer, Driver, VehicleMaster, Vendor } from '@/lib/types';
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
import { VehicleDetailsSection } from './vehicle-details-section';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { FtlChallan } from '../challan-tracking/ftl-challan';


const CUSTOMERS_KEY = 'transwise_customers';
const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';


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

const isRowEmpty = (row: ItemRow) => {
    return !row.description && !row.qty && !row.actWt && !row.chgWt && row.itemName === 'Frm MAS';
};

const isRowPartiallyFilled = (row: ItemRow) => {
    const filledFields = [row.description, row.qty, row.actWt, row.chgWt].filter(Boolean);
    return filledFields.length > 0 && filledFields.length < 4;
};

export function BookingForm({ bookingId, onSaveSuccess, onClose }: BookingFormProps) {
    const isEditMode = !!bookingId;
    
    const [itemRows, setItemRows] = useState<ItemRow[]>([]);
    const [bookingType, setBookingType] = useState('TOPAY');
    const [loadType, setLoadType] = useState('PTL');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [currentGrNumber, setCurrentGrNumber] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);

    const [taxPaidBy, setTaxPaidBy] = useState('Not Applicable');
    const [isGstApplicable, setIsGstApplicable] = useState(false);
    const [additionalCharges, setAdditionalCharges] = useState<{ [key: string]: number; }>({});
    const [initialChargesFromBooking, setInitialChargesFromBooking] = useState<{ [key: string]: number; } | undefined>(undefined);
    const [deliveryAt, setDeliveryAt] = useState('Godown Deliv');
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [ftlDetails, setFtlDetails] = useState<FtlDetails>({
        vehicleNo: '',
        driverName: '',
        lorrySupplier: '',
        truckFreight: 0,
        advance: 0,
        commission: 0,
        otherDeductions: 0,
    });


    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<Booking | null>(null);
    const [generatedChallan, setGeneratedChallan] = useState<Challan | null>(null);
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

    const loadMasterData = useCallback(() => {
        try {
            const savedDrivers = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
            if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
            
            const savedVehicles = localStorage.getItem(LOCAL_STORAGE_KEY_VEHICLES);
            if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

            const savedVendors = localStorage.getItem(LOCAL_STORAGE_KEY_VENDORS);
            if (savedVendors) setVendors(JSON.parse(savedVendors));
        } catch (error) {
            console.error("Failed to load master data", error);
        }
    }, []);

    const loadInitialData = useCallback(async () => {
        try {
            const profile = await getCompanyProfile();
            setCompanyProfile(profile);
            loadMasterData();

            const parsedBookings = getBookings();
            setAllBookings(parsedBookings);
            
            let keyCounter = 1;

            if (isEditMode && bookingId) {
                const bookingToEdit = parsedBookings.find(b => b.id === bookingId);
                if (bookingToEdit) {
                    const savedCustomers: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
                    
                    const senderProfile = savedCustomers.find(c => c.name.toLowerCase() === bookingToEdit.sender.toLowerCase()) || { id: 0, name: bookingToEdit.sender, gstin: '', address: '', mobile: '', email: '', type: 'Company' };
                    const receiverProfile = savedCustomers.find(c => c.name.toLowerCase() === bookingToEdit.receiver.toLowerCase()) || { id: 0, name: bookingToEdit.receiver, gstin: '', address: '', mobile: '', email: '', type: 'Company' };

                    setCurrentGrNumber(bookingToEdit.lrNo);
                    setBookingDate(new Date(bookingToEdit.bookingDate));
                    setBookingType(bookingToEdit.lrType);
                    setLoadType(bookingToEdit.loadType || 'PTL');
                    setFromStation({ id: 0, name: bookingToEdit.fromCity, aliasCode: '', pinCode: '' });
                    setToStation({ id: 0, name: bookingToEdit.toCity, aliasCode: '', pinCode: '' });
                    setSender(senderProfile);
                    setReceiver(receiverProfile);
                    const itemRowsWithIds = bookingToEdit.itemRows?.map(row => ({ ...row, id: row.id || keyCounter++ })) || Array.from({ length: 2 }, () => createEmptyRow(keyCounter++));
                    setItemRows(itemRowsWithIds);
                    
                    setGrandTotal(bookingToEdit.totalAmount);
                    setAdditionalCharges(bookingToEdit.additionalCharges || {});
                    setInitialChargesFromBooking(bookingToEdit.additionalCharges || {});
                    setTaxPaidBy(bookingToEdit.taxPaidBy || 'Not Applicable');
                    if (bookingToEdit.ftlDetails) {
                        setFtlDetails(bookingToEdit.ftlDetails);
                    }

                } else {
                     toast({ title: 'Error', description: 'Booking not found.', variant: 'destructive'});
                }

            } else {
                let grnPrefix = (profile?.grnPrefix?.trim()) ? profile.grnPrefix.trim() : 'CONAG';
                setCurrentGrNumber(generateGrNumber(parsedBookings, grnPrefix));
                setItemRows(Array.from({ length: 2 }, () => createEmptyRow(keyCounter++)));
                setBookingDate(new Date());
            }

        } catch (error) {
            console.error("Failed to process bookings from localStorage or fetch profile", error);
            toast({ title: 'Error', description: 'Could not load necessary data.', variant: 'destructive'});
        }
    }, [isEditMode, bookingId, toast, loadMasterData]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleReset = () => {
        const profile = companyProfile;
        const parsedBookings = getBookings();
        let grnPrefix = (profile?.grnPrefix?.trim()) ? profile.grnPrefix.trim() : 'CONAG';
        setCurrentGrNumber(generateGrNumber(parsedBookings, grnPrefix));
        
        let keyCounter = 1;
        setItemRows(Array.from({ length: 2 }, () => createEmptyRow(keyCounter++)));
        setBookingType('TOPAY');
        setLoadType('PTL');
        setFromStation(null);
        setToStation(null);
        setSender(null);
        setReceiver(null);
        setBookingDate(new Date());
        setGrandTotal(0);
        setTaxPaidBy('Not Applicable');
        setAdditionalCharges({});
        setInitialChargesFromBooking(undefined);
        setDeliveryAt('Godown Deliv');
        setErrors({});
        setFtlDetails({
            vehicleNo: '',
            driverName: '',
            lorrySupplier: '',
            truckFreight: 0,
            advance: 0,
            commission: 0,
            otherDeductions: 0,
        });

        toast({
            title: "Form Reset",
            description: "All fields have been cleared.",
        });
    };


    useEffect(() => {
        setIsGstApplicable(taxPaidBy !== 'Not Applicable');
    }, [taxPaidBy]);

    useEffect(() => {
        if (additionalCharges.doorDelivery && additionalCharges.doorDelivery > 0) {
            setDeliveryAt('Door Deliv');
        } else {
            setDeliveryAt('Godown Deliv');
        }
    }, [additionalCharges, setDeliveryAt]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);


    const handleSaveOrUpdate = async () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!fromStation) newErrors.fromStation = true;
        if (!toStation) newErrors.toStation = true;
        if (!sender?.name) newErrors.sender = true;
        if (!receiver?.name) newErrors.receiver = true;
        if (!bookingDate) newErrors.bookingDate = true;
        
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast({ title: 'Missing Information', description: 'Please fill all required fields.', variant: 'destructive' });
            return;
        }
        
        const validRows = itemRows.filter(row => !isRowEmpty(row));
        if (validRows.some(isRowPartiallyFilled)) {
             toast({ title: 'Incomplete Item Details', description: 'Please fill all required fields (*) for each item row, or clear the row.', variant: 'destructive' });
             return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 100)); // allow UI to update

        const isFtlBooking = loadType === 'FTL';
        const currentStatus = isFtlBooking ? 'In Transit' : 'In Stock';

        const newBookingData: Omit<Booking, 'id'> = {
            lrNo: currentGrNumber,
            bookingDate: bookingDate!.toISOString(),
            fromCity: fromStation!.name,
            toCity: toStation!.name,
            lrType: bookingType as Booking['lrType'],
            loadType,
            sender: sender!.name,
            receiver: receiver!.name,
            itemDescription: validRows.map(r => `${r.itemName} - ${r.description}`).join(', '),
            qty: validRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
            chgWt: validRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
            totalAmount: grandTotal,
            status: isEditMode ? allBookings.find(b => b.id === bookingId)?.status || currentStatus : currentStatus,
            itemRows: validRows,
            additionalCharges: additionalCharges,
            taxPaidBy: taxPaidBy,
            ...(loadType === 'FTL' && { ftlDetails }),
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
                if (isFtlBooking) {
                    addHistoryLog(currentGrNumber, 'Dispatched from Warehouse', 'Admin', `Dispatched via vehicle ${ftlDetails.vehicleNo}`);
                }
                toast({ title: 'Booking Saved', description: `Successfully saved GR Number: ${currentGrNumber}` });

                // If FTL, generate and save challan
                if (newBooking.loadType === 'FTL' && newBooking.ftlDetails) {
                    const allChallans = getChallanData();
                    const newChallanId = `CHLN${String(allChallans.length + 1).padStart(3, '0')}`;
                    const challan: Challan = {
                        challanId: newChallanId,
                        dispatchDate: format(new Date(newBooking.bookingDate), 'yyyy-MM-dd'),
                        dispatchToParty: newBooking.toCity,
                        vehicleNo: newBooking.ftlDetails.vehicleNo,
                        driverName: newBooking.ftlDetails.driverName,
                        fromStation: newBooking.fromCity,
                        toStation: newBooking.toCity,
                        senderId: newBooking.sender,
                        inwardId: '',
                        inwardDate: '',
                        receivedFromParty: '',
                        challanType: 'Dispatch',
                        vehicleHireFreight: newBooking.ftlDetails.truckFreight,
                        advance: newBooking.ftlDetails.advance,
                        balance: newBooking.ftlDetails.truckFreight - newBooking.ftlDetails.advance,
                        totalLr: 1,
                        totalPackages: newBooking.qty,
                        totalItems: newBooking.itemRows.length,
                        totalActualWeight: newBooking.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                        totalChargeWeight: newBooking.chgWt,
                        summary: { // Simplified summary, adjust as needed
                            grandTotal: newBooking.totalAmount,
                            totalTopayAmount: newBooking.lrType === 'TOPAY' ? newBooking.totalAmount : 0,
                            commission: newBooking.ftlDetails.commission,
                            labour: 0,
                            crossing: 0,
                            carting: 0,
                            balanceTruckHire: newBooking.ftlDetails.truckFreight - newBooking.ftlDetails.advance,
                            debitCreditAmount: 0
                        }
                    };
                    saveChallanData([...allChallans, challan]);

                    const lrDetail: LrDetail = {
                        lrNo: newBooking.lrNo,
                        lrType: newBooking.lrType,
                        sender: newBooking.sender,
                        receiver: newBooking.receiver,
                        from: newBooking.fromCity,
                        to: newBooking.toCity,
                        bookingDate: format(new Date(newBooking.bookingDate), 'yyyy-MM-dd'),
                        itemDescription: newBooking.itemDescription,
                        quantity: newBooking.qty,
                        actualWeight: newBooking.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                        chargeWeight: newBooking.chgWt,
                        grandTotal: newBooking.totalAmount
                    };
                    const allLrDetails = getLrDetailsData();
                    saveLrDetailsData([...allLrDetails, lrDetail]);
                    
                    setGeneratedChallan(challan);
                }
                
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
            scrollY: -window.scrollY,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'legal',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;

            const ratio = imgWidth / imgHeight;
            let finalImgWidth = pdfWidth;
            let finalImgHeight = pdfWidth / ratio;
            
            if (finalImgHeight > pdfHeight) {
                finalImgHeight = pdfHeight;
                finalImgWidth = finalImgHeight * ratio;
            }
            
            const x = (pdfWidth - finalImgWidth) / 2;
            let y = 0;

            pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
            pdf.save(`docs-${receiptData?.lrNo || 'download'}.pdf`);
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
                    errors={errors}
                    loadType={loadType}
                    onLoadTypeChange={setLoadType}
                />
                <PartyDetailsSection 
                    onSenderChange={setSender}
                    onReceiverChange={setReceiver}
                    sender={sender}
                    receiver={receiver}
                    onTaxPaidByChange={setTaxPaidBy}
                    taxPaidBy={taxPaidBy}
                    errors={errors}
                />
                <VehicleDetailsSection 
                    details={ftlDetails} 
                    onDetailsChange={setFtlDetails} 
                    drivers={drivers}
                    vehicles={vehicles}
                    vendors={vendors}
                    onMasterDataChange={loadMasterData}
                    loadType={loadType}
                />

                <ItemDetailsTable rows={itemRows} onRowsChange={setItemRows} />
                
                 <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
                    <DeliveryInstructionsSection 
                        deliveryAt={deliveryAt}
                        onDeliveryAtChange={setDeliveryAt}
                    />
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
                    <MainActionsSection 
                        onSave={handleSaveOrUpdate} 
                        isEditMode={isEditMode} 
                        onClose={onClose} 
                        onReset={handleReset}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </CardContent>
        </Card>
        
        {receiptData && companyProfile && (
            <Dialog open={showReceipt} onOpenChange={(isOpen) => {
                 if (!isOpen) {
                    window.location.reload(); 
                 }
                 setShowReceipt(isOpen);
            }}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Documents Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-auto p-4 bg-gray-200">
                       <div ref={receiptRef} className="bg-white shadow-lg mx-auto" style={{width: '216mm'}}>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Receiver" />
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Sender" />
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Driver" />
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                            <BookingReceipt booking={receiptData} companyProfile={companyProfile} copyType="Office" />
                            {generatedChallan && (
                                <>
                                    <div className="border-t-2 border-dashed border-gray-400 my-4" style={{pageBreakBefore: 'always'}}></div>
                                    <FtlChallan challan={generatedChallan} booking={receiptData} profile={companyProfile} />
                                </>
                            )}
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

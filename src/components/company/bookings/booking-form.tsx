

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
import type { Booking, FtlDetails, CustomerData } from '@/lib/bookings-dashboard-data';
import type { City, Customer, Driver, VehicleMaster, Vendor, RateList, StationRate, ChargeDetail, Branch } from '@/lib/types';
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
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer, X, Plus, RefreshCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { loadCompanySettingsFromStorage } from '@/app/company/settings/actions';
import type { AllCompanySettings } from '@/app/company/settings/actions';
import { VehicleDetailsSection } from './vehicle-details-section';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { FtlChallan } from '../challan-tracking/ftl-challan';
import { PaymentDialog } from './payment-dialog';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClientOnly } from '@/components/ui/client-only';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import type { ChargeSetting } from '../settings/additional-charges-settings';
import { getBranches } from '@/lib/branch-data';
import { getCities, saveCities } from '@/lib/city-data';
import { getCustomers, saveCustomers } from '@/lib/customer-data';
import { getDrivers } from '@/lib/driver-data';
import { getVendors } from '@/lib/vendor-data';
import { getVehicles } from '@/lib/vehicle-data';
import { getCurrentFinancialYear } from '@/lib/utils';


const createEmptyRow = (id: number): ItemRow => ({
  id,
  ewbNo: '',
  itemName: '',
  description: '',
  wtPerUnit: '',
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
    bookingId?: string; // This is now trackingId
    bookingData?: Booking | null; // Pass full booking object for editing transient data
    onSaveSuccess?: (booking: Booking) => void;
    onSaveAndNew?: (booking: Booking, callback: () => void) => void; // New prop for save and new
    onClose?: () => void;
    isViewOnly?: boolean;
    isPartialCancel?: boolean;
}

const generateChangeDetails = (oldBooking: Booking, newBooking: Booking, isPartialCancel = false): string => {
    const changes: string[] = [];

    if (isPartialCancel) {
        // For partial cancel, only check item and financial changes
        if (oldBooking.totalAmount !== newBooking.totalAmount) {
            changes.push(`- Grand Total changed from '${oldBooking.totalAmount.toFixed(2)}' to '${newBooking.totalAmount.toFixed(2)}'`);
        }
    } else {
        // Full edit mode checks
        if (oldBooking.bookingDate && newBooking.bookingDate && format(new Date(oldBooking.bookingDate), 'yyyy-MM-dd') !== format(new Date(newBooking.bookingDate), 'yyyy-MM-dd')) {
            changes.push(`- Booking Date changed from '${format(new Date(oldBooking.bookingDate), 'dd-MMM-yyyy')}' to '${format(new Date(newBooking.bookingDate), 'dd-MMM-yyyy')}'`);
        }
        if (oldBooking.lrNo !== newBooking.lrNo) {
            changes.push(`- LR Number changed from '${oldBooking.lrNo}' to '${newBooking.lrNo}'`);
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
        if (oldBooking.sender.name !== newBooking.sender.name) {
            changes.push(`- Sender changed from '${oldBooking.sender.name}' to '${newBooking.sender.name}'`);
        }
        if (oldBooking.receiver.name !== newBooking.receiver.name) {
            changes.push(`- Receiver changed from '${oldBooking.receiver.name}' to '${newBooking.receiver.name}'`);
        }
         if (oldBooking.totalAmount !== newBooking.totalAmount) {
            changes.push(`- Grand Total changed from '${oldBooking.totalAmount.toFixed(2)}' to '${newBooking.totalAmount.toFixed(2)}'`);
        }
    }
    
    // Deep compare item rows (always checked)
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
    return !row.itemName && !row.description && !row.qty && !row.actWt && !row.chgWt;
};

const isRowPartiallyFilled = (row: ItemRow) => {
    const requiredFields = [row.itemName, row.description, row.qty, row.actWt, row.chgWt];
    const filledCount = requiredFields.filter(Boolean).length;
    // It's partially filled if it's not empty (filledCount > 0) and not fully filled (filledCount < 5)
    return filledCount > 0 && filledCount < requiredFields.length;
};


// --- Auto-Learn Standard Rate Logic ---
const updateStandardRateList = (booking: Booking, sender: Customer, receiver: Customer) => {
    const allRateLists = getRateLists();
    const chargeSettingsJSON = localStorage.getItem('transwise_company_settings');
    const companySettings: AllCompanySettings | null = chargeSettingsJSON ? JSON.parse(chargeSettingsJSON) : null;
    
    const standardRateList = allRateLists.find(rl => rl.isStandard);
    
    if (!standardRateList || !companySettings) {
        console.error("Standard Rate List or Company Settings not found.");
        return;
    }
    
    let wasUpdated = false;

    booking.itemRows.forEach(item => {
        if (!item.rate || Number(item.rate) <= 0) return;

        const getChargeDetail = (chargeId: string): ChargeDetail | undefined => {
            const chargeValue = booking.additionalCharges?.[chargeId];
            const setting = companySettings.additionalCharges.find(c => c.id === chargeId);
            if (chargeValue && setting) {
                return { value: chargeValue, per: setting.calculationType === 'fixed' ? 'Fixed' : 'Chg.wt' }; // Simplified for now
            }
            return undefined;
        }

        const newRate: StationRate = {
            fromStation: booking.fromCity,
            toStation: booking.toCity,
            rate: Number(item.rate),
            rateOn: item.freightOn as StationRate['rateOn'],
            itemName: item.itemName || 'Any',
            wtPerUnit: Number(item.wtPerUnit) || undefined,
            senderName: sender.name,
            receiverName: receiver.name,
            lrType: booking.lrType,
            doorDelivery: getChargeDetail('doorDelivery'),
            collectionCharge: getChargeDetail('collectionCharge'),
            loadingLabourCharge: getChargeDetail('loadingLabourCharge'),
        };

        const exists = standardRateList.stationRates.some(existing => 
            existing.fromStation.toLowerCase() === newRate.fromStation.toLowerCase() &&
            existing.toStation.toLowerCase() === newRate.toStation.toLowerCase() &&
            (existing.itemName || 'Any').toLowerCase() === newRate.itemName.toLowerCase() &&
            (existing.wtPerUnit || 0) === (newRate.wtPerUnit || 0) &&
            existing.senderName?.toLowerCase() === newRate.senderName?.toLowerCase() &&
            existing.receiverName?.toLowerCase() === newRate.receiverName?.toLowerCase()
        );

        if (!exists) {
            standardRateList.stationRates.push(newRate);
            wasUpdated = true;
        }
    });

    if (wasUpdated) {
        const updatedRateLists = allRateLists.map(rl => rl.id === standardRateList.id ? standardRateList : rl);
        saveRateLists(updatedRateLists);
    }
};

const generateLrNumber = (
    allBookings: Booking[],
    companyCode: string,
    lrFormat: 'compact' | 'padded' | 'serial_only',
    isBranch: boolean,
    branchCode?: string
): { nextLrNumber: string, nextSerialNumber: number } => {
    const financialYear = getCurrentFinancialYear();
    const startYear = financialYear.substring(2, 4);

    const relevantBookings = allBookings.filter(b =>
        b.financialYear === financialYear &&
        (isBranch ? b.branchCode === branchCode : !b.branchCode || b.branchCode === companyCode)
    );

    const lastSerial = relevantBookings.reduce((max, b) => Math.max(max, b.serialNumber || 0), 0);
    const newSerial = lastSerial + 1;
    
    let formattedLr: string;
    if (lrFormat === 'serial_only') {
        formattedLr = String(newSerial);
    } else if (lrFormat === 'padded') {
        formattedLr = `${companyCode}${startYear}${String(newSerial).padStart(6, '0')}`;
    } else {
        formattedLr = `${companyCode}${startYear}${newSerial}`;
    }

    return { nextLrNumber: formattedLr, nextSerialNumber: newSerial };
};



export function BookingForm({ bookingId: trackingId, bookingData, onSaveSuccess, onSaveAndNew, onClose, isViewOnly = false, isPartialCancel = false }: BookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userRole = searchParams.get('role') === 'Branch' ? 'Branch' : 'Company';
    const userBranchName = userRole === 'Branch' ? 'Pune Hub' : undefined; // Hardcoded branch for prototype
    const isEditMode = (!!trackingId || !!bookingData) && !isViewOnly && !isPartialCancel;
    const isBranch = userRole === 'Branch';
    
    const [isOfflineMode, setIsOfflineMode] = useState(searchParams.get('mode') === 'offline');
    const [itemRows, setItemRows] = useState<ItemRow[]>([]);
    const [bookingType, setBookingType] = useState('TOPAY');
    const [loadType, setLoadType] = useState<'PTL' | 'FTL' | 'LTL'>('LTL');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
    const [currentLrNumber, setCurrentLrNumber] = useState('');
    const [currentSerialNumber, setCurrentSerialNumber] = useState(0);
    const [referenceLrNumber, setReferenceLrNumber] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [taxPaidBy, setTaxPaidBy] = useState('Not Applicable');
    const [isGstApplicable, setIsGstApplicable] = useState(false);
    const [additionalCharges, setAdditionalCharges] = useState<{ [key: string]: number; }>({});
    const [initialChargesFromBooking, setInitialChargesFromBooking] = useState<{ [key: string]: number; } | undefined>(undefined);
    const [attachCc, setAttachCc] = useState('No');
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
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isStationAlertOpen, setIsStationAlertOpen] = useState(false);
    const [generatedChallan, setGeneratedChallan] = useState<Challan | null>(null);
    
    // -- Data Loading State --
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [rateLists, setRateLists] = useState<RateList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toStationInputRef = useRef<HTMLButtonElement>(null);

    const loadInitialData = useCallback(() => {
        try {
            setIsLoading(true);
            const bookings = getBookings();
            const allCities = getCities();

            setAllBookings(bookings);
            setCities(allCities);
            setCustomers(getCustomers());
            setDrivers(getDrivers());
            setVehicles(getVehicles());
            setVendors(getVendors());
            setRateLists(getRateLists());
            setBranches(getBranches());
        } catch (error) {
            console.error("Failed to load master data", error);
            toast({ title: 'Error', description: 'Failed to load essential application data.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    // This effect loads all necessary data once on mount.
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);
    
    const handleReset = useCallback((bookingsToUse?: Booking[]) => {
        const currentBookings = bookingsToUse || allBookings;
        const companyProfile = loadCompanySettingsFromStorage();

        setIsOfflineMode(searchParams.get('mode') === 'offline');
        
        const companyCode = companyProfile.lrPrefix || 'COMP';
        const currentBranch = isBranch ? branches.find(b => b.name === userBranchName) : undefined;
        const { nextLrNumber, nextSerialNumber } = generateLrNumber(currentBookings, companyCode, companyProfile.lrFormat, isBranch, currentBranch?.lrPrefix);
        
        setCurrentLrNumber(nextLrNumber);
        setCurrentSerialNumber(nextSerialNumber);
        
        const defaultRows = companyProfile.defaultItemRows || 1;
        setItemRows(Array.from({ length: defaultRows }, (_, i) => createEmptyRow(i + 1)));
        
        setBookingType('TOPAY');
        setLoadType('LTL');
        
        const defaultStationName = companyProfile.defaultFromStation;
        const defaultStation = defaultStationName ? cities.find(c => c.name.toLowerCase() === defaultStationName.toLowerCase()) || null : null;
        setFromStation(defaultStation);

        setToStation(null);
        setSender(null);
        setReceiver(null);
        setBookingDate(new Date());
        setReferenceLrNumber('');
        setGrandTotal(0);
        setTaxPaidBy('Not Applicable');
        setAdditionalCharges({});
        setInitialChargesFromBooking(undefined);
        setAttachCc('No');
        setErrors({});
        setFtlDetails({
            vehicleNo: '', driverName: '', lorrySupplier: '', truckFreight: 0, advance: 0, commission: 0, otherDeductions: 0,
        });

        if(!isEditMode) toast({ title: "Form Reset", description: "All fields have been cleared." });
    }, [searchParams, cities, isEditMode, toast, allBookings, isBranch, branches, userBranchName]);

    // This effect runs ONLY after the data is loaded and sets up the form state.
    useEffect(() => {
        if (isLoading) return; // Don't run if data isn't ready

        const bookingToLoad = bookingData || allBookings.find(b => b.trackingId === trackingId);
        
        if (bookingToLoad) {
            // -- Edit Mode --
            setIsOfflineMode(bookingToLoad.source === 'Offline');
            const senderProfile = customers.find(c => c.name.toLowerCase() === bookingToLoad.sender.name.toLowerCase()) || { id: 0, ...bookingToLoad.sender, type: 'Company', openingBalance: 0 };
            const receiverProfile = customers.find(c => c.name.toLowerCase() === bookingToLoad.receiver.name.toLowerCase()) || { id: 0, ...bookingToLoad.receiver, type: 'Company', openingBalance: 0 };
            
            setCurrentLrNumber(bookingToLoad.lrNo);
            setReferenceLrNumber(bookingToLoad.referenceLrNumber || '');
            setCurrentSerialNumber(bookingToLoad.serialNumber || 0);
            setBookingDate(new Date(bookingToLoad.bookingDate));
            setBookingType(bookingToLoad.lrType);
            setLoadType(bookingToLoad.loadType || 'LTL');
            setFromStation(cities.find(c => c.name === bookingToLoad.fromCity) || null);
            setToStation(cities.find(c => c.name === bookingToLoad.toCity) || null);
            setSender(senderProfile);
            setReceiver(receiverProfile);
            setAttachCc(bookingToLoad.attachCc || 'No');
            
            const itemRowsWithIds = (bookingToLoad.itemRows || []).map((row, index) => ({ ...row, id: row.id || index + 1 }));
            setItemRows(itemRowsWithIds);
            
            setGrandTotal(bookingToLoad.totalAmount);
            setAdditionalCharges(bookingToLoad.additionalCharges || {});
            setInitialChargesFromBooking(bookingToLoad.additionalCharges || {});
            setTaxPaidBy(bookingToLoad.taxPaidBy || 'Not Applicable');
            if (bookingToLoad.ftlDetails) {
                setFtlDetails(bookingToLoad.ftlDetails);
            }
        } else {
            // -- New Booking Mode --
             handleReset(allBookings);
        }

    }, [isLoading, trackingId, bookingData, allBookings, customers, cities, handleReset]);
    

    useEffect(() => {
        setIsGstApplicable(taxPaidBy !== 'Not Applicable');
    }, [taxPaidBy]);
    
    const [deliveryAt, setDeliveryAt] = useState('Godown Deliv');
    useEffect(() => {
        if (additionalCharges.doorDelivery && additionalCharges.doorDelivery > 0) {
            setDeliveryAt('Door Deliv');
        } else {
            setDeliveryAt('Godown Deliv');
        }
    }, [additionalCharges.doorDelivery]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);
    
    const maybeSaveNewParty = useCallback((party: Customer | null): CustomerData => {
        if (!party) return { name: '', gstin: '', address: '', mobile: '' };

        if (party && party.id === 0 && party.name.trim()) { // 0 is the indicator for a new party
            const currentCustomers: Customer[] = getCustomers();
            const newId = currentCustomers.length > 0 ? Math.max(...currentCustomers.map(c => c.id)) + 1 : 1;
            const newCustomer: Customer = { ...party, id: newId };
            const updatedCustomers = [newCustomer, ...currentCustomers];
            saveCustomers(updatedCustomers);
            // After saving, reload the customer list in the form
            setCustomers(updatedCustomers);
            return { name: newCustomer.name, gstin: newCustomer.gstin, address: newCustomer.address, mobile: newCustomer.mobile };
        }
        return { name: party.name, gstin: party.gstin, address: party.address, mobile: party.mobile };
    }, []);

    const handleSaveOrUpdate = useCallback(async (paymentMode?: 'Cash' | 'Online', forceSave: boolean = false) => {
        const newErrors: { [key: string]: boolean } = {};
        if (!fromStation) newErrors.fromStation = true;
        if (!toStation) newErrors.toStation = true;
        if (!sender?.name) newErrors.sender = true;
        if (!receiver?.name) newErrors.receiver = true;
        if (!bookingDate) newErrors.bookingDate = true;
        
        if (isOfflineMode && !referenceLrNumber) newErrors.lrNumber = true;

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

        if (fromStation?.name === toStation?.name && !forceSave) {
            setIsStationAlertOpen(true);
            return;
        }
        
        if (bookingType === 'PAID' && !isEditMode && !isPartialCancel && !paymentMode) {
            setIsPaymentDialogOpen(true);
            return;
        }

        setIsSubmitting(true);
        if (isPaymentDialogOpen) setIsPaymentDialogOpen(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // This is now an async function
        const proceedWithSave = async (paymentMode?: 'Cash' | 'Online') => {
            const companyProfile = loadCompanySettingsFromStorage();
            
            const finalSender = maybeSaveNewParty(sender);
            const finalReceiver = maybeSaveNewParty(receiver);

            const currentStatus: Booking['status'] = 'In Stock';
            const currentBooking = (isEditMode || isPartialCancel) ? (allBookings.find(b => b.trackingId === trackingId) || bookingData) : undefined;
            const validRows = itemRows.filter(row => !isRowEmpty(row));
            const finalBranchName = userBranchName || companyProfile.companyName;

            const newBookingData: Omit<Booking, 'trackingId'> = {
                lrNo: currentLrNumber, 
                referenceLrNumber: isOfflineMode ? referenceLrNumber : undefined,
                bookingDate: bookingDate!.toISOString(),
                fromCity: fromStation!.name,
                toCity: toStation!.name,
                lrType: bookingType as Booking['lrType'],
                paymentMode: bookingType === 'PAID' ? paymentMode : undefined,
                loadType,
                sender: finalSender,
                receiver: finalReceiver,
                itemDescription: validRows.map(r => `${r.itemName} - ${r.description}`).join(', '),
                qty: validRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
                chgWt: validRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
                totalAmount: grandTotal,
                status: currentBooking?.status || currentStatus,
                itemRows: validRows,
                additionalCharges: additionalCharges,
                taxPaidBy: taxPaidBy,
                branchName: currentBooking?.branchName || finalBranchName,
                source: isOfflineMode ? 'Offline' : 'System',
                companyCode: companyProfile.lrPrefix,
                branchCode: isBranch ? (branches.find(b => b.name === userBranchName)?.lrPrefix) : (companyProfile.lrPrefix),
                financialYear: getCurrentFinancialYear(),
                serialNumber: currentSerialNumber,
                lrOrigin: isOfflineMode ? 'MANUAL' : 'SYSTEM_GENERATED',
                attachCc,
                ...(loadType === 'FTL' && { ftlDetails }),
            };

            try {
                let savedBooking: Booking;
                const currentAllBookings = getBookings(); // Get the very latest bookings

                if ((isEditMode || isPartialCancel) && currentBooking) {
                    savedBooking = { ...currentBooking, ...newBookingData };
                    const changeDetails = generateChangeDetails(currentBooking, savedBooking, isPartialCancel);
                    
                    const updatedBookings = currentAllBookings.map(b => b.trackingId === (trackingId || bookingData?.trackingId) ? savedBooking : b);
                    saveBookings(updatedBookings);
                    setAllBookings(updatedBookings); 
                    
                    if (changeDetails !== 'No changes detected.') {
                        addHistoryLog(currentLrNumber, isPartialCancel ? 'Booking Partially Cancelled' : 'Booking Updated', 'Admin', changeDetails);
                    }

                    toast({ title: isPartialCancel ? 'Partial Cancellation Confirmed' : 'Booking Updated', description: `Successfully updated LR Number: ${currentLrNumber}` });
                    if (onSaveSuccess) onSaveSuccess(savedBooking);
                } else {
                    savedBooking = { trackingId: (bookingData?.trackingId) || `TRK-${Date.now()}`, ...newBookingData };
                    
                    const updatedBookings = [...currentAllBookings, savedBooking];
                    saveBookings(updatedBookings);
                    setAllBookings(updatedBookings); 
                    
                    addHistoryLog(currentLrNumber, 'Booking Created', 'Admin');
                    
                    if (sender && receiver) {
                        updateStandardRateList(savedBooking, sender, receiver);
                    }
                    
                    if (savedBooking.loadType === 'FTL') {
                        // For FTL, we create a pending challan immediately.
                        const allChallans = getChallanData();
                        const challan: Challan = {
                            challanId: `TEMP-CHLN-${Date.now()}`,
                            dispatchDate: format(new Date(savedBooking.bookingDate), 'yyyy-MM-dd'),
                            challanType: 'Dispatch',
                            status: 'Pending',
                            vehicleNo: savedBooking.ftlDetails!.vehicleNo,
                            driverName: savedBooking.ftlDetails!.driverName,
                            fromStation: savedBooking.fromCity,
                            toStation: savedBooking.toCity,
                            dispatchToParty: savedBooking.receiver.name,
                            totalLr: 1,
                            totalPackages: savedBooking.qty,
                            totalItems: savedBooking.itemRows.length,
                            totalActualWeight: savedBooking.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                            totalChargeWeight: savedBooking.chgWt,
                            vehicleHireFreight: savedBooking.ftlDetails!.truckFreight,
                            advance: savedBooking.ftlDetails!.advance,
                            balance: savedBooking.ftlDetails!.truckFreight - savedBooking.ftlDetails!.advance,
                            senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '',
                            summary: {
                                grandTotal: savedBooking.totalAmount,
                                totalTopayAmount: savedBooking.lrType === 'TOPAY' ? savedBooking.totalAmount : 0,
                                commission: savedBooking.ftlDetails!.commission,
                                labour: 0, crossing: 0, carting: 0, 
                                balanceTruckHire: savedBooking.ftlDetails!.truckFreight - savedBooking.ftlDetails!.advance,
                                debitCreditAmount: 0
                            }
                        };
                        saveChallanData([...allChallans, challan]);

                        const lrDetail: LrDetail = {
                            challanId: challan.challanId,
                            lrNo: savedBooking.lrNo,
                            lrType: savedBooking.lrType,
                            sender: savedBooking.sender,
                            receiver: savedBooking.receiver,
                            from: savedBooking.fromCity,
                            to: savedBooking.toCity,
                            bookingDate: format(new Date(savedBooking.bookingDate), 'yyyy-MM-dd'),
                            itemDescription: savedBooking.itemDescription,
                            quantity: savedBooking.qty,
                            actualWeight: savedBooking.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                            chargeWeight: savedBooking.chgWt,
                            grandTotal: savedBooking.totalAmount
                        };
                        const allLrDetails = getLrDetailsData();
                        saveLrDetailsData([...allLrDetails, lrDetail]);
                        
                        setGeneratedChallan(challan);
                    }
                    
                    setReceiptData(savedBooking);
                    
                    if (onSaveAndNew) {
                        onSaveAndNew(savedBooking, () => {
                             handleReset(updatedBookings);
                        });
                    } else if (onSaveSuccess) {
                        // This case is for the edit dialog
                        onSaveSuccess(savedBooking);
                    } else {
                        // This case is for the main new booking page
                        setShowReceipt(true);
                    }
                }
            } catch (error) {
                 toast({ title: 'Error Saving Data', description: `Could not save to local storage.`, variant: 'destructive' });
            } finally {
                setIsSubmitting(false);
            }
        };

        await proceedWithSave(paymentMode);
    }, [fromStation, toStation, sender, receiver, bookingDate, isOfflineMode, referenceLrNumber, itemRows, bookingType, isEditMode, isPartialCancel, loadType, grandTotal, additionalCharges, taxPaidBy, ftlDetails, onSaveSuccess, onSaveAndNew, toast, userBranchName, isBranch, attachCc, handleReset, currentSerialNumber, allBookings, trackingId, bookingData, branches, isPaymentDialogOpen, maybeSaveNewParty, currentLrNumber]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey) {
                switch (event.key) {
                    case 's':
                        event.preventDefault();
                        if(!isSubmitting) handleSaveOrUpdate();
                        break;
                    case 'e':
                        event.preventDefault();
                        router.push('/company/bookings');
                        break;
                    case 'r':
                        event.preventDefault();
                        if(!isEditMode) handleReset(allBookings);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSaveOrUpdate, router, handleReset, isEditMode, allBookings, isSubmitting]);

    
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
    
    const readOnly = isViewOnly || isPartialCancel;

    const handleNewBooking = useCallback(() => {
        setShowReceipt(false);
        const latestBookings = getBookings(); 
        handleReset(latestBookings);
    }, [handleReset]);

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            if (onClose) {
                onClose();
            } else {
                router.push('/company/bookings');
            }
        }
        setShowReceipt(open);
    };

    const formTitle = isEditMode ? `Edit Booking: ${currentLrNumber}` : 
                      isViewOnly ? `View Booking: ${currentLrNumber}` :
                      isPartialCancel ? `Partial Cancellation: ${currentLrNumber}` :
                      'Create New Booking';

  const formContent = (
     <div className="space-y-4">
        <BookingDetailsSection
            toStationInputRef={toStationInputRef}
            bookingType={bookingType}
            onBookingTypeChange={setBookingType}
            fromStation={fromStation}
            onFromStationChange={setFromStation}
            toStation={toStation}
            onToStationChange={setToStation}
            lrNumber={currentLrNumber}
            onLrNumberChange={setCurrentLrNumber}
            referenceLrNumber={referenceLrNumber}
            onReferenceLrNumberChange={setReferenceLrNumber}
            bookingDate={bookingDate}
            onBookingDateChange={setBookingDate}
            isEditMode={isEditMode}
            isOfflineMode={isOfflineMode}
            onOfflineModeChange={setIsOfflineMode}
            companyProfile={loadCompanySettingsFromStorage()}
            errors={errors}
            loadType={loadType}
            onLoadTypeChange={setLoadType}
            isViewOnly={readOnly}
        />
        <PartyDetailsSection 
            customers={customers}
            onSenderChange={setSender}
            onReceiverChange={setReceiver}
            sender={sender}
            receiver={receiver}
            onTaxPaidByChange={setTaxPaidBy}
            taxPaidBy={taxPaidBy}
            errors={errors}
            isViewOnly={readOnly}
            onPartyAdded={loadInitialData}
        />
        {loadType === 'FTL' && (
            <VehicleDetailsSection 
                details={ftlDetails} 
                onDetailsChange={setFtlDetails} 
                drivers={drivers}
                vehicles={vehicles}
                vendors={vendors}
                onMasterDataChange={loadInitialData}
                loadType={loadType}
                isViewOnly={readOnly}
            />
        )}
        <ItemDetailsTable 
            rows={itemRows} 
            onRowsChange={setItemRows} 
            isViewOnly={isViewOnly}
            sender={sender}
            receiver={receiver}
            fromStation={fromStation}
            toStation={toStation}
            onQuotationApply={(newLrType) => {
                setBookingType(newLrType);
            }}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <ChargesSection 
                basicFreight={basicFreight} 
                onGrandTotalChange={setGrandTotal} 
                initialGrandTotal={isEditMode || isPartialCancel ? grandTotal : undefined}
                isGstApplicable={isGstApplicable}
                onChargesChange={setAdditionalCharges}
                initialCharges={initialChargesFromBooking}
                profile={loadCompanySettingsFromStorage()}
                isViewOnly={isViewOnly}
                itemRows={itemRows}
            />
            <div className="flex flex-col gap-2">
                <DeliveryInstructionsSection 
                    deliveryAt={deliveryAt}
                    onDeliveryAtChange={setDeliveryAt}
                    isViewOnly={readOnly}
                    attachCc={attachCc}
                    onAttachCcChange={setAttachCc}
                />
                 <MainActionsSection 
                    onSave={() => handleSaveOrUpdate()} 
                    onSaveAndNew={onSaveAndNew ? () => handleSaveOrUpdate() : undefined}
                    isEditMode={isEditMode || !!bookingData}
                    isPartialCancel={isPartialCancel} 
                    onClose={onClose} 
                    onReset={() => handleReset(allBookings)}
                    isSubmitting={isSubmitting}
                    isViewOnly={isViewOnly}
                />
            </div>
        </div>
    </div>
  );

  return (
    <ClientOnly>
        <div className="space-y-4">
            {!onSaveAndNew && (
                 <h1 className="text-2xl font-bold text-primary">{formTitle}</h1>
            )}
           
            {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : onSaveAndNew ? (
                formContent
            ) : (
                <div className="p-4 border-2 border-green-200 rounded-md bg-card">
                   {formContent}
                </div>
            )}


            <AlertDialog open={isStationAlertOpen} onOpenChange={setIsStationAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Station Warning</AlertDialogTitle>
                        <AlertDialogDescription>
                            The 'From' and 'To' stations are the same. Are you sure you want to continue with this booking?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setIsStationAlertOpen(false);
                            handleSaveOrUpdate(undefined, true);
                        }}>
                            Continue Anyway
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <PaymentDialog
                isOpen={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                onConfirm={(paymentMode) => handleSaveOrUpdate(paymentMode)}
                amount={grandTotal}
            />

            {receiptData && (
                <Dialog open={showReceipt} onOpenChange={handleDialogClose}>
                    <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Documents Preview</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-auto p-4 bg-gray-200">
                        <div ref={receiptRef} className="bg-white shadow-lg mx-auto" style={{width: '210mm'}}>
                                <BookingReceipt booking={receiptData} companyProfile={loadCompanySettingsFromStorage()} copyType="Receiver" />
                                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                <BookingReceipt booking={receiptData} companyProfile={loadCompanySettingsFromStorage()} copyType="Sender" />
                                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                <BookingReceipt booking={receiptData} companyProfile={loadCompanySettingsFromStorage()} copyType="Driver" />
                                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>
                                <BookingReceipt booking={receiptData} companyProfile={loadCompanySettingsFromStorage()} copyType="Office" />
                                {generatedChallan && (
                                    <>
                                        <div className="border-t-2 border-dashed border-gray-400 my-4" style={{pageBreakBefore: 'always'}}></div>
                                        <FtlChallan challan={generatedChallan} booking={receiptData} profile={loadCompanySettingsFromStorage()} />
                                    </>
                                )}
                        </div>
                        </div>
                        <DialogFooter>
                             <Button type="button" variant="secondary" onClick={handleNewBooking}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Booking
                            </Button>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
                            </Button>
                             <Button onClick={() => {
                                 onClose ? onClose() : router.push('/company/bookings');
                             }}>
                                <X className="mr-2 h-4 w-4" /> Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    </ClientOnly>
  );
}

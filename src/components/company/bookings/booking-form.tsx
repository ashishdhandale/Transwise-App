

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
    isOfflineMode?: boolean; // New prop for special offline/inward mode
    lrNumberInputRef?: React.Ref<HTMLInputElement>;
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
        if (oldBooking.sender !== newBooking.sender) {
            changes.push(`- Sender changed from '${oldBooking.sender}' to '${newBooking.sender}'`);
        }
        if (oldBooking.receiver !== newBooking.receiver) {
            changes.push(`- Receiver changed from '${oldBooking.receiver}' to '${newBooking.receiver}'`);
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
    return !row.description && !row.qty && !row.actWt && !row.chgWt && row.itemName === '';
};

const isRowPartiallyFilled = (row: ItemRow) => {
    const filledFields = [row.description, row.qty, row.actWt, row.chgWt].filter(Boolean);
    return filledFields.length > 0 && filledFields.length < 4;
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

const generateLrNumber = (allBookings: Booking[], profile: AllCompanySettings): string => {
    // 1. Get ONLY system bookings
    const systemBookings = allBookings.filter(b => b.source === 'System');

    if (profile.grnFormat === 'plain') {
        const systemNumericLrs = [];
        for (const booking of systemBookings) {
            // Check if lrNo contains only digits
            if (/^\d+$/.test(booking.lrNo)) {
                systemNumericLrs.push(parseInt(booking.lrNo, 10));
            }
        }
        
        const lastSequence = systemNumericLrs.length > 0 ? Math.max(0, ...systemNumericLrs) : 0;
        return String(lastSequence + 1);

    } else { // 'with_char' format
        const prefix = profile.lrPrefix?.trim().toUpperCase() || '';
        if (!prefix) return '1'; // Fallback if prefix is somehow empty

        const relevantLrs = systemBookings
            .filter(b => b.lrNo.toUpperCase().startsWith(prefix))
            .map(b => parseInt(b.lrNo.substring(prefix.length), 10))
            .filter(num => !isNaN(num));
            
        const lastSequence = relevantLrs.length > 0 ? Math.max(0, ...relevantLrs) : 0;
        return `${prefix}${lastSequence + 1}`;
    }
};


export function BookingForm({ bookingId: trackingId, bookingData, onSaveSuccess, onSaveAndNew, onClose, isViewOnly = false, isPartialCancel = false, isOfflineMode: isOfflineModeProp = false, lrNumberInputRef }: BookingFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const userRole = searchParams.get('role') === 'Branch' ? 'Branch' : 'Company';
    const userBranchName = userRole === 'Branch' ? 'Pune Hub' : undefined; // Hardcoded branch for prototype
    const isEditMode = (!!trackingId || !!bookingData) && !isViewOnly && !isPartialCancel;
    const isOfflineMode = isOfflineModeProp || mode === 'offline';
    
    const [itemRows, setItemRows] = useState<ItemRow[]>([]);
    const [bookingType, setBookingType] = useState('TOPAY');
    const [loadType, setLoadType] = useState<'PTL' | 'FTL' | 'LTL'>('LTL');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
    const [currentLrNumber, setCurrentLrNumber] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isStationAlertOpen, setIsStationAlertOpen] = useState(false);
    
    // -- Data Loading State --
    const [companyProfile, setCompanyProfile] = useState<AllCompanySettings | null>(null);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<VehicleMaster[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [rateLists, setRateLists] = useState<RateList[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadInitialData = useCallback(() => {
        try {
            setIsLoading(true);
            const profile = loadCompanySettingsFromStorage();
            const bookings = getBookings();
            const allCities = getCities();

            setCompanyProfile(profile);
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
    
    // This effect runs ONLY after the data is loaded and sets up the form state.
    useEffect(() => {
        if (isLoading) return; // Don't run if data isn't ready

        const bookingToLoad = bookingData || allBookings.find(b => b.trackingId === trackingId);
        
        if (bookingToLoad) {
            // -- Edit Mode --
            const senderProfile = customers.find(c => c.name.toLowerCase() === bookingToLoad.sender.toLowerCase()) || { id: 0, name: bookingToLoad.sender, gstin: '', address: '', mobile: '', email: '', type: 'Company', openingBalance: 0 };
            const receiverProfile = customers.find(c => c.name.toLowerCase() === bookingToLoad.receiver.toLowerCase()) || { id: 0, name: bookingToLoad.receiver, gstin: '', address: '', mobile: '', email: '', type: 'Company', openingBalance: 0 };

            setCurrentLrNumber(bookingToLoad.lrNo);
            setBookingDate(new Date(bookingToLoad.bookingDate));
            setBookingType(bookingToLoad.lrType);
            setLoadType(bookingToLoad.loadType || 'LTL');
            setFromStation(cities.find(c => c.name === bookingToLoad.fromCity) || null);
            setToStation(cities.find(c => c.name === bookingToLoad.toCity) || null);
            setSender(senderProfile);
            setReceiver(receiverProfile);
            
            const itemRowsWithIds = (bookingToLoad.itemRows || []).map((row, index) => ({ ...row, id: row.id || index + 1 }));
            setItemRows(itemRowsWithIds);
            
            setGrandTotal(bookingToLoad.totalAmount);
            setAdditionalCharges(bookingToLoad.additionalCharges || {});
            setInitialChargesFromBooking(bookingToLoad.additionalCharges || {});
            setTaxPaidBy(bookingToLoad.taxPaidBy || 'Not Applicable');
            if (bookingToLoad.ftlDetails) {
                setFtlDetails(bookingToLoad.ftlDetails);
            }
        } else if (companyProfile) {
            // -- New Booking Mode --
            if (!isOfflineMode) {
                 const newLrNumber = generateLrNumber(allBookings, companyProfile);
                 setCurrentLrNumber(newLrNumber);
            } else {
                 setCurrentLrNumber('');
            }
            
            const defaultStationName = companyProfile.defaultFromStation;
            const defaultStation = defaultStationName ? cities.find(c => c.name.toLowerCase() === defaultStationName.toLowerCase()) || null : null;
            setFromStation(defaultStation);

            const defaultRows = companyProfile.defaultItemRows || 1;
            setItemRows(Array.from({ length: defaultRows }, (_, i) => createEmptyRow(i + 1)));
            
            // Reset other fields for a fresh form
            setBookingType('TOPAY');
            setLoadType('LTL');
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
            setFtlDetails({ vehicleNo: '', driverName: '', lorrySupplier: '', truckFreight: 0, advance: 0, commission: 0, otherDeductions: 0 });
        }

    }, [isLoading, companyProfile, trackingId, bookingData, allBookings, customers, cities, isOfflineMode]);

    const handleReset = useCallback(() => {
        if (!companyProfile) return;
        
        if (isOfflineMode) {
            setCurrentLrNumber('');
        } else {
            setCurrentLrNumber(generateLrNumber(allBookings, companyProfile));
        }
        
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
        setGrandTotal(0);
        setTaxPaidBy('Not Applicable');
        setAdditionalCharges({});
        setInitialChargesFromBooking(undefined);
        setDeliveryAt('Godown Deliv');
        setErrors({});
        setFtlDetails({
            vehicleNo: '', driverName: '', lorrySupplier: '', truckFreight: 0, advance: 0, commission: 0, otherDeductions: 0,
        });
        
        setTimeout(() => {
            if (lrNumberInputRef && 'current' in lrNumberInputRef && lrNumberInputRef.current) {
                lrNumberInputRef.current.focus();
            }
        }, 0);

        toast({ title: "Form Reset", description: "All fields have been cleared." });
    }, [companyProfile, isOfflineMode, allBookings, cities, lrNumberInputRef, toast]);
    
    useEffect(() => {
        setIsGstApplicable(taxPaidBy !== 'Not Applicable');
    }, [taxPaidBy]);

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
    
    const maybeSaveNewParty = useCallback((party: Customer | null) => {
        if (party && party.id === 0 && party.name.trim()) { // 0 is the indicator for a new party
            const currentCustomers: Customer[] = getCustomers();
            const newId = currentCustomers.length > 0 ? Math.max(...currentCustomers.map(c => c.id)) + 1 : 1;
            const newCustomer: Customer = { ...party, id: newId };
            const updatedCustomers = [newCustomer, ...currentCustomers];
            saveCustomers(updatedCustomers);
            return newCustomer;
        }
        return party;
    }, []);

    const proceedWithSave = useCallback(async (paymentMode?: 'Cash' | 'Online', postSaveCallback?: () => void) => {
        const finalSender = maybeSaveNewParty(sender);
        const finalReceiver = maybeSaveNewParty(receiver);

        const currentStatus: Booking['status'] = isOfflineModeProp ? 'In Stock' : 'In Stock';
        const currentBooking = (isEditMode || isPartialCancel) ? (allBookings.find(b => b.trackingId === trackingId) || bookingData) : undefined;
        const validRows = itemRows.filter(row => !isRowEmpty(row));
        const finalBranchName = userBranchName || companyProfile?.companyName;

        const newBookingData: Omit<Booking, 'trackingId'> = {
            lrNo: currentLrNumber,
            bookingDate: bookingDate!.toISOString(),
            fromCity: fromStation!.name,
            toCity: toStation!.name,
            lrType: bookingType as Booking['lrType'],
            paymentMode: bookingType === 'PAID' ? paymentMode : undefined,
            loadType,
            sender: finalSender!.name,
            receiver: finalReceiver!.name,
            itemDescription: validRows.map(r => `${r.itemName} - ${r.description}`).join(', '),
            qty: validRows.reduce((sum, r) => sum + (parseInt(r.qty, 10) || 0), 0),
            chgWt: validRows.reduce((sum, r) => sum + (parseFloat(r.chgWt) || 0), 0),
            totalAmount: grandTotal,
            status: isOfflineModeProp ? 'In Stock' : (currentBooking?.status || currentStatus),
            itemRows: validRows,
            additionalCharges: additionalCharges,
            taxPaidBy: taxPaidBy,
            branchName: currentBooking?.branchName || finalBranchName,
            source: isOfflineModeProp ? 'Inward' : 'System',
            ...(loadType === 'FTL' && { ftlDetails }),
        };

        try {
            if ((isEditMode || isPartialCancel) && currentBooking) {
                const updatedBooking = { ...currentBooking, ...newBookingData };
                const changeDetails = generateChangeDetails(currentBooking, updatedBooking, isPartialCancel);
                
                const updatedBookings = allBookings.map(b => b.trackingId === (trackingId || bookingData?.trackingId) ? updatedBooking : b);
                saveBookings(updatedBookings);
                
                if (changeDetails !== 'No changes detected.') {
                    addHistoryLog(currentLrNumber, isPartialCancel ? 'Booking Partially Cancelled' : 'Booking Updated', 'Admin', changeDetails);
                }

                toast({ title: isPartialCancel ? 'Partial Cancellation Confirmed' : 'Booking Updated', description: `Successfully updated LR Number: ${currentLrNumber}` });
                if (onSaveSuccess) onSaveSuccess(updatedBooking);
                 if (postSaveCallback) postSaveCallback();
            } else {
                const newBooking: Booking = { trackingId: (bookingData?.trackingId) || `TRK-${Date.now()}`, ...newBookingData };
                
                if (onSaveAndNew) {
                    onSaveAndNew(newBooking, () => handleReset());
                    return; // The parent component handles toast and state
                }

                // If this form is used for manual inward challans, don't save to the main bookings list.
                if (isOfflineModeProp && newBooking.source !== 'Inward') {
                     if (onSaveSuccess) onSaveSuccess(newBooking);
                     return;
                }

                const updatedBookings = [...allBookings, newBooking];
                saveBookings(updatedBookings);
                addHistoryLog(currentLrNumber, 'Booking Created', 'Admin');
                
                if (finalSender && finalReceiver) {
                    updateStandardRateList(newBooking, finalSender, finalReceiver);
                }
                
                if (newBooking.loadType === 'FTL') {
                    // For FTL, we create a pending challan immediately.
                    const allChallans = getChallanData();
                    const challan: Challan = {
                        challanId: `TEMP-CHLN-${Date.now()}`,
                        dispatchDate: format(new Date(newBooking.bookingDate), 'yyyy-MM-dd'),
                        challanType: 'Dispatch',
                        status: 'Pending',
                        vehicleNo: newBooking.ftlDetails!.vehicleNo,
                        driverName: newBooking.ftlDetails!.driverName,
                        fromStation: newBooking.fromCity,
                        toStation: newBooking.toCity,
                        dispatchToParty: newBooking.receiver,
                        totalLr: 1,
                        totalPackages: newBooking.qty,
                        totalItems: newBooking.itemRows.length,
                        totalActualWeight: newBooking.itemRows.reduce((s, i) => s + Number(i.actWt), 0),
                        totalChargeWeight: newBooking.chgWt,
                        vehicleHireFreight: newBooking.ftlDetails!.truckFreight,
                        advance: newBooking.ftlDetails!.advance,
                        balance: newBooking.ftlDetails!.truckFreight - newBooking.ftlDetails!.advance,
                        senderId: '', inwardId: '', inwardDate: '', receivedFromParty: '',
                        summary: {
                            grandTotal: newBooking.totalAmount,
                            totalTopayAmount: newBooking.lrType === 'TOPAY' ? newBooking.totalAmount : 0,
                            commission: newBooking.ftlDetails!.commission,
                            labour: 0, crossing: 0, carting: 0, 
                            balanceTruckHire: newBooking.ftlDetails!.truckFreight - newBooking.ftlDetails!.advance,
                            debitCreditAmount: 0
                        }
                    };
                    saveChallanData([...allChallans, challan]);

                    const lrDetail: LrDetail = {
                        challanId: challan.challanId,
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
    }, [loadType, isEditMode, isPartialCancel, trackingId, itemRows, currentLrNumber, bookingDate, fromStation, toStation, bookingType, sender, receiver, grandTotal, additionalCharges, taxPaidBy, ftlDetails, onSaveSuccess, onSaveAndNew, toast, userBranchName, companyProfile?.companyName, isOfflineModeProp, maybeSaveNewParty, bookingData, handleReset, userRole, allBookings]);


    const handleSaveOrUpdate = async (paymentMode?: 'Cash' | 'Online', forceSave: boolean = false) => {
        const newErrors: { [key: string]: boolean } = {};
        if (!fromStation) newErrors.fromStation = true;
        if (!toStation) newErrors.toStation = true;
        if (!sender?.name) newErrors.sender = true;
        if (!receiver?.name) newErrors.receiver = true;
        if (!bookingDate) newErrors.bookingDate = true;
        if ((isOfflineMode || isEditMode || isPartialCancel) && !currentLrNumber) newErrors.lrNumber = true;

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
        
        if (bookingType === 'PAID' && !isEditMode && !isPartialCancel && !paymentMode && !isOfflineModeProp && !onSaveAndNew) {
            setIsPaymentDialogOpen(true);
            return;
        }

        setIsSubmitting(true);
        if (isPaymentDialogOpen) setIsPaymentDialogOpen(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const callback = onSaveAndNew ? () => handleReset() : undefined;
        await proceedWithSave(paymentMode, callback);
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
    
    const readOnly = isViewOnly || isPartialCancel;

    const handleNewBooking = useCallback(() => {
        setShowReceipt(false);
        handleReset();
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
                      (isOfflineMode ? 'Add Offline/Manual Booking' : 'Create New Booking');

  const formContent = (
     <div className="space-y-4">
        <BookingDetailsSection 
            lrNumberInputRef={lrNumberInputRef}
            bookingType={bookingType} 
            onBookingTypeChange={setBookingType}
            fromStation={fromStation}
            onFromStationChange={setFromStation}
            toStation={toStation}
            onToStationChange={setToStation}
            lrNumber={currentLrNumber}
            onLrNumberChange={setCurrentLrNumber}
            bookingDate={bookingDate}
            onBookingDateChange={setBookingDate}
            isEditMode={isEditMode}
            isOfflineMode={isOfflineMode}
            companyProfile={companyProfile}
            errors={errors}
            loadType={loadType}
            onLoadTypeChange={setLoadType}
            isViewOnly={readOnly}
        />
        <PartyDetailsSection 
            onSenderChange={setSender}
            onReceiverChange={setReceiver}
            sender={sender}
            receiver={receiver}
            onTaxPaidByChange={setTaxPaidBy}
            taxPaidBy={taxPaidBy}
            errors={errors}
            isViewOnly={readOnly}
            isOfflineMode={isOfflineMode}
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
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-start">
            <ChargesSection 
                basicFreight={basicFreight} 
                onGrandTotalChange={setGrandTotal} 
                initialGrandTotal={isEditMode || isPartialCancel ? grandTotal : undefined}
                isGstApplicable={isGstApplicable}
                onChargesChange={setAdditionalCharges}
                initialCharges={initialChargesFromBooking}
                profile={companyProfile}
                isViewOnly={isViewOnly}
                itemRows={itemRows}
            />
            <div className="w-[300px]">
                <DeliveryInstructionsSection 
                    deliveryAt={deliveryAt}
                    onDeliveryAtChange={setDeliveryAt}
                    isViewOnly={readOnly}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Card className="flex-1 flex flex-col items-center justify-center p-2 text-center border-green-300">
                    <p className="text-sm text-muted-foreground">Booking Type</p>
                    <p className="text-xl font-bold text-green-600">
                        {bookingType}
                    </p>
                </Card>
                 <MainActionsSection 
                    onSave={() => handleSaveOrUpdate()} 
                    onSaveAndNew={onSaveAndNew ? () => handleSaveOrUpdate() : undefined}
                    isEditMode={isEditMode || !!bookingData}
                    isPartialCancel={isPartialCancel} 
                    onClose={onClose} 
                    onReset={() => handleReset()}
                    isSubmitting={isSubmitting}
                    isViewOnly={isViewOnly}
                    isOfflineMode={isOfflineModeProp}
                />
            </div>
        </div>
    </div>
  );

  return (
    <ClientOnly>
        <div className="space-y-4">
            {!isOfflineModeProp && (
                 <h1 className="text-2xl font-bold text-primary">{formTitle}</h1>
            )}
           
            {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : isOfflineModeProp ? (
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

            {receiptData && companyProfile && (
                <Dialog open={showReceipt} onOpenChange={handleDialogClose}>
                    <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Documents Preview</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-auto p-4 bg-gray-200">
                        <div ref={receiptRef} className="bg-white shadow-lg mx-auto" style={{width: '210mm'}}>
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

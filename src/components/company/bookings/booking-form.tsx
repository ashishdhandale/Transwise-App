

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
import { Download, Loader2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getCompanyProfile } from '@/app/company/settings/actions';
import type { CompanyProfileFormValues } from '@/components/company/settings/company-profile-settings';
import { VehicleDetailsSection } from './vehicle-details-section';
import { saveChallanData, getChallanData, saveLrDetailsData, getLrDetailsData, type Challan, type LrDetail } from '@/lib/challan-data';
import { FtlChallan } from '../challan-tracking/ftl-challan';
import { PaymentDialog } from './payment-dialog';
import { useSearchParams } from 'next/navigation';
import { ClientOnly } from '@/components/ui/client-only';
import { getRateLists, saveRateLists } from '@/lib/rate-list-data';
import type { ChargeSetting } from '../settings/additional-charges-settings';
import { getBranches } from '@/lib/branch-data';


const CUSTOMERS_KEY = 'transwise_customers';
const LOCAL_STORAGE_KEY_DRIVERS = 'transwise_drivers';
const LOCAL_STORAGE_KEY_VEHICLES = 'transwise_vehicles_master';
const LOCAL_STORAGE_KEY_VENDORS = 'transwise_vendors';
const LOCAL_STORAGE_KEY_ADDITIONAL_CHARGES = 'transwise_additional_charges_settings';


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
  invoiceDate: '',
  dValue: '',
});

interface BookingFormProps {
    bookingId?: string; // This is now trackingId
    bookingData?: Booking | null; // Pass full booking object for editing transient data
    onSaveSuccess?: (booking: Booking) => void;
    onClose?: () => void;
    isViewOnly?: boolean;
    isPartialCancel?: boolean;
    isOfflineMode?: boolean; // New prop for special offline/inward mode
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
    const chargeSettingsJSON = localStorage.getItem(LOCAL_STORAGE_KEY_ADDITIONAL_CHARGES);
    const chargeSettings: { charges: ChargeSetting[] } = chargeSettingsJSON ? JSON.parse(chargeSettingsJSON) : { charges: [] };
    
    const standardRateList = allRateLists.find(rl => rl.isStandard);
    
    if (!standardRateList) {
        console.error("Standard Rate List not found.");
        return;
    }
    
    let wasUpdated = false;

    booking.itemRows.forEach(item => {
        if (!item.rate || Number(item.rate) <= 0) return;

        const getChargeDetail = (chargeId: string): ChargeDetail | undefined => {
            const chargeValue = booking.additionalCharges?.[chargeId];
            const setting = chargeSettings.charges.find(c => c.id === chargeId);
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


export function BookingForm({ bookingId: trackingId, bookingData, onSaveSuccess, onClose, isViewOnly = false, isPartialCancel = false, isOfflineMode: isOfflineModeProp = false }: BookingFormProps) {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const userRole = searchParams.get('role') === 'Branch' ? 'Branch' : 'Company';
    const isEditMode = (!!trackingId || !!bookingData) && !isViewOnly && !isPartialCancel;
    const isOfflineMode = isOfflineModeProp || mode === 'offline';
    
    const [itemRows, setItemRows] = useState<ItemRow[]>([]);
    const [bookingType, setBookingType] = useState('TOPAY');
    const [loadType, setLoadType] = useState<'PTL' | 'FTL' | 'LTL'>('LTL');
    const [fromStation, setFromStation] = useState<City | null>(null);
    const [toStation, setToStation] = useState<City | null>(null);
    const [sender, setSender] = useState<Customer | null>(null);
    const [receiver, setReceiver] = useState<Customer | null>(null);
    const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
    const [currentLrNumber, setCurrentLrNumber] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileFormValues | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
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
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isStationAlertOpen, setIsStationAlertOpen] = useState(false);
    const [rateLists, setRateLists] = useState<RateList[]>([]);
    
    const onFromStationChange = useCallback((station: City | null) => {
        setFromStation(station);
    }, []);


    const generateLrNumber = (bookings: Booking[], prefix: string) => {
        const relevantLrNumbers = bookings
            .map(b => b.lrNo)
            .filter(lrNo => lrNo.startsWith(prefix));

        if (relevantLrNumbers.length === 0) {
            return `${prefix}01`;
        }

        const lastSequence = relevantLrNumbers
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

            setRateLists(getRateLists());
            setBranches(getBranches());
        } catch (error) {
            console.error("Failed to load master data", error);
        }
    }, []);

    const loadBookingData = useCallback((bookingToLoad: Booking) => {
        const savedCustomers: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
        const senderProfile = savedCustomers.find(c => c.name.toLowerCase() === bookingToLoad.sender.toLowerCase()) || { id: 0, name: bookingToLoad.sender, gstin: '', address: '', mobile: '', email: '', type: 'Company', openingBalance: 0 };
        const receiverProfile = savedCustomers.find(c => c.name.toLowerCase() === bookingToLoad.receiver.toLowerCase()) || { id: 0, name: bookingToLoad.receiver, gstin: '', address: '', mobile: '', email: '', type: 'Company', openingBalance: 0 };

        let keyCounter = 1;
        setCurrentLrNumber(bookingToLoad.lrNo);
        setBookingDate(new Date(bookingToLoad.bookingDate));
        setBookingType(bookingToLoad.lrType);
        setLoadType(bookingToLoad.loadType || 'LTL');
        setFromStation({ id: 0, name: bookingToLoad.fromCity, aliasCode: '', pinCode: '' });
        setToStation({ id: 0, name: bookingToLoad.toCity, aliasCode: '', pinCode: '' });
        setSender(senderProfile);
        setReceiver(receiverProfile);
        const itemRowsWithIds = bookingToLoad.itemRows?.map(row => ({ ...row, id: row.id || keyCounter++ })) || Array.from({ length: 2 }, () => createEmptyRow(keyCounter++));
        setItemRows(itemRowsWithIds);
        
        setGrandTotal(bookingToLoad.totalAmount);
        setAdditionalCharges(bookingToLoad.additionalCharges || {});
        setInitialChargesFromBooking(bookingToLoad.additionalCharges || {});
        setTaxPaidBy(bookingToLoad.taxPaidBy || 'Not Applicable');
        if (bookingToLoad.ftlDetails) {
            setFtlDetails(bookingToLoad.ftlDetails);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                loadMasterData();
                const profile = await getCompanyProfile();
                setCompanyProfile(profile);
                
                let bookingToLoad = bookingData;

                if (trackingId && !bookingData) {
                    const parsedBookings = getBookings();
                    bookingToLoad = parsedBookings.find(b => b.trackingId === trackingId) || null;
                }

                if (bookingToLoad) {
                    loadBookingData(bookingToLoad);
                } else {
                    let keyCounter = 1;
                    setItemRows(Array.from({ length: 2 }, () => createEmptyRow(keyCounter++)));
                    if (isOfflineMode) {
                        setCurrentLrNumber('');
                    } else if (profile && !currentLrNumber) {
                        const parsedBookings = getBookings();
                        const localBranches = getBranches();
                        let lrPrefix = profile.lrPrefix?.trim() || 'CONAG';
                        if (userRole === 'Branch') {
                            const userBranch = localBranches.find(b => b.name === 'Pune Hub');
                            if(userBranch?.lrPrefix) {
                                lrPrefix = userBranch.lrPrefix;
                            }
                        }
                        setCurrentLrNumber(generateLrNumber(parsedBookings, lrPrefix));
                    }
                }
            } catch (error) {
                console.error("Failed to process bookings or fetch profile", error);
                toast({ title: 'Error', description: 'Could not load necessary data.', variant: 'destructive'});
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackingId, bookingData, isOfflineMode, userRole, toast, loadMasterData, loadBookingData]);
    
    // Set date on client mount to avoid hydration error
    useEffect(() => {
        if (!bookingDate) {
            setBookingDate(new Date());
        }
    }, [bookingDate]);


    const handleReset = () => {
        const profile = companyProfile;
        const parsedBookings = getBookings();
        let lrPrefix = (profile?.lrPrefix?.trim()) ? profile.lrPrefix.trim() : 'CONAG';
         if (userRole === 'Branch') {
            const userBranch = branches.find(b => b.name === 'Pune Hub'); // Hardcoded
            if(userBranch?.lrPrefix) {
                lrPrefix = userBranch.lrPrefix;
            }
        }
        setCurrentLrNumber(isOfflineMode ? '' : generateLrNumber(parsedBookings, lrPrefix));
        
        let keyCounter = 1;
        setItemRows(Array.from({ length: 2 }, () => createEmptyRow(keyCounter++)));
        setBookingType('TOPAY');
        setLoadType('LTL');
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
    }, [additionalCharges.doorDelivery]);


    const basicFreight = useMemo(() => {
        return itemRows.reduce((sum, row) => sum + (parseFloat(row.lumpsum) || 0), 0);
    }, [itemRows]);
    
    const maybeSaveNewParty = useCallback((party: Customer | null) => {
        if (party && party.id === 0 && party.name.trim()) { // 0 is the indicator for a new party
            const currentCustomers: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
            const newId = currentCustomers.length > 0 ? Math.max(...currentCustomers.map(c => c.id)) + 1 : 1;
            const newCustomer: Customer = { ...party, id: newId };
            const updatedCustomers = [newCustomer, ...currentCustomers];
            localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updatedCustomers));
            return newCustomer;
        }
        return party;
    }, []);

    const proceedWithSave = useCallback(async (paymentMode?: 'Cash' | 'Online') => {
        const finalSender = maybeSaveNewParty(sender);
        const finalReceiver = maybeSaveNewParty(receiver);

        const currentStatus: Booking['status'] = isOfflineModeProp ? 'In Stock' : 'In Stock';
        const allBookings = getBookings();
        const currentBooking = (isEditMode || isPartialCancel) ? allBookings.find(b => b.trackingId === trackingId) : undefined;
        const validRows = itemRows.filter(row => !isRowEmpty(row));
        const userBranchName = userRole === 'Branch' ? 'Pune Hub' : companyProfile?.companyName; // Hardcoded branch for prototype

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
            branchName: currentBooking?.branchName || userBranchName,
            source: isOfflineModeProp ? 'Inward' : 'System',
            ...(loadType === 'FTL' && { ftlDetails }),
        };

        try {
            if ((isEditMode || isPartialCancel) && (currentBooking || bookingData)) {
                const bookingToUpdate = currentBooking || bookingData!;
                const updatedBooking = { ...bookingToUpdate, ...newBookingData };
                const changeDetails = generateChangeDetails(bookingToUpdate, updatedBooking, isPartialCancel);
                
                const updatedBookings = allBookings.map(b => b.trackingId === (trackingId || bookingData?.trackingId) ? updatedBooking : b);
                saveBookings(updatedBookings);
                
                if (changeDetails !== 'No changes detected.') {
                    addHistoryLog(currentLrNumber, isPartialCancel ? 'Booking Partially Cancelled' : 'Booking Updated', 'Admin', changeDetails);
                }

                toast({ title: isPartialCancel ? 'Partial Cancellation Confirmed' : 'Booking Updated', description: `Successfully updated LR Number: ${currentLrNumber}` });
                if (onSaveSuccess) onSaveSuccess(updatedBooking);
            } else {
                const newBooking: Booking = { trackingId: `TRK-${Date.now()}`, ...newBookingData };
                // If this form is used for manual inward challans, don't save to the main bookings list.
                // Just pass the data back to the parent component.
                if (isOfflineModeProp) {
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
    }, [loadType, isEditMode, isPartialCancel, trackingId, itemRows, currentLrNumber, bookingDate, fromStation, toStation, bookingType, sender, receiver, grandTotal, additionalCharges, taxPaidBy, ftlDetails, onSaveSuccess, toast, userRole, companyProfile?.companyName, isOfflineModeProp, maybeSaveNewParty, bookingData]);


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
        
        if (bookingType === 'PAID' && !isEditMode && !isPartialCancel && !paymentMode && !isOfflineModeProp) {
            setIsPaymentDialogOpen(true);
            return;
        }

        setIsSubmitting(true);
        if (isPaymentDialogOpen) setIsPaymentDialogOpen(false);
        await new Promise(resolve => setTimeout(resolve, 100));

        await proceedWithSave(paymentMode);
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
    }, []);

    const formTitle = isEditMode ? `Edit Booking: ${currentLrNumber}` : 
                      isViewOnly ? `View Booking: ${currentLrNumber}` :
                      isPartialCancel ? `Partial Cancellation: ${currentLrNumber}` :
                      (isOfflineMode ? 'Add Offline/Manual Booking' : 'Create New Booking');

  return (
    <ClientOnly>
        <div className="space-y-4">
            {!isOfflineModeProp && (
                 <h1 className="text-2xl font-bold text-primary">{formTitle}</h1>
            )}
           
            <Card className={isOfflineModeProp ? 'border-none shadow-none' : 'border-2 border-green-200'}>
                <CardContent className={isOfflineModeProp ? 'p-0' : 'p-4 space-y-4'}>
                    <BookingDetailsSection 
                        bookingType={bookingType} 
                        onBookingTypeChange={setBookingType}
                        onFromStationChange={onFromStationChange}
                        onToStationChange={setToStation}
                        fromStation={fromStation}
                        toStation={toStation}
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
                        onPartyAdded={loadMasterData}
                    />
                    {loadType === 'FTL' && (
                        <VehicleDetailsSection 
                            details={ftlDetails} 
                            onDetailsChange={setFtlDetails} 
                            drivers={drivers}
                            vehicles={vehicles}
                            vendors={vendors}
                            onMasterDataChange={loadMasterData}
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
                                isEditMode={isEditMode}
                                isPartialCancel={isPartialCancel} 
                                onClose={onClose} 
                                onReset={handleReset}
                                isSubmitting={isSubmitting}
                                isViewOnly={isViewOnly}
                                isOfflineMode={isOfflineModeProp}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
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
                            <Button type="button" variant="secondary" onClick={handleNewBooking}>Close & New Booking</Button>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
                            </Button>
                             <Button onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    </ClientOnly>
  );
}
